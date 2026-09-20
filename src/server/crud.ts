import { NextResponse } from "next/server";
import { query, execute, newId, isConfigured } from "./db";
import { getSessionUser, clientIp } from "./session";
import { logAudit, type AuditCategory } from "./audit";
import { ensureSeeded } from "./seed";

/**
 * Generic, safe CRUD for CMS resources. Each resource declares its table,
 * allowed columns, and audit metadata. Column names are validated against an
 * allow-list, so no arbitrary column injection is possible.
 */

export interface ResourceConfig {
  table: string;
  idPrefix: string;
  // Columns the client may write. Values are coerced to string/number.
  columns: { name: string; type: "text" | "int" | "json"; required?: boolean }[];
  orderBy?: string;
  category: AuditCategory;
  label: string; // e.g. "Project"
}

function coerce(type: "text" | "int" | "json", v: unknown): string | number {
  if (type === "int") return Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
  if (type === "json") return JSON.stringify(v ?? []);
  return v == null ? "" : String(v);
}

export function makeResourceHandlers(cfg: ResourceConfig) {
  const allowed = new Set(cfg.columns.map((c) => c.name));

  async function requireAuth() {
    const user = getSessionUser();
    if (!user) return null;
    return user;
  }

  async function list() {
    await ensureSeeded();
    const order = cfg.orderBy ?? "created_at DESC";
    const rows = await query(`SELECT * FROM ${cfg.table} ORDER BY ${order}`);
    return rows;
  }

  return {
    async GET() {
      if (!(await requireAuth())) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
      if (!isConfigured()) return NextResponse.json({ success: true, dbConfigured: false, items: [] });
      try {
        return NextResponse.json({ success: true, dbConfigured: true, items: await list() });
      } catch (err) {
        console.error(`[${cfg.table}] list failed:`, err);
        return NextResponse.json({ success: false, error: `Unable to load ${cfg.label.toLowerCase()}s.` }, { status: 500 });
      }
    },

    async POST(req: Request) {
      const user = await requireAuth();
      if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
      if (!isConfigured()) return NextResponse.json({ success: false, error: "Database not configured." }, { status: 503 });

      let body: Record<string, unknown>;
      try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

      const action = body._action ?? "create";

      try {
        if (action === "delete") {
          const id = String(body.id ?? "");
          if (!id) return NextResponse.json({ success: false, error: "Missing id." }, { status: 400 });
          await execute(`DELETE FROM ${cfg.table} WHERE id = ?`, [id]);
          await logAudit({ actor: user, event: `${cfg.label} deleted`, target: id, category: cfg.category, status: "Success", ip: clientIp(req) });
          return NextResponse.json({ success: true });
        }

        // create / update share column building.
        const cols: string[] = [];
        const vals: (string | number)[] = [];
        for (const c of cfg.columns) {
          if (!(c.name in body)) continue;
          if (!allowed.has(c.name)) continue;
          cols.push(c.name);
          vals.push(coerce(c.type, body[c.name]));
        }

        if (action === "update") {
          const id = String(body.id ?? "");
          if (!id) return NextResponse.json({ success: false, error: "Missing id." }, { status: 400 });
          if (cols.length === 0) return NextResponse.json({ success: false, error: "No fields to update." }, { status: 400 });
          const setSql = cols.map((c) => `${c} = ?`).join(", ");
          const bumpUpdated = tableHasUpdatedAt(cfg.table) ? ", updated_at = datetime('now')" : "";
          await execute(
            `UPDATE ${cfg.table} SET ${setSql}${bumpUpdated} WHERE id = ?`,
            [...vals, id],
          );
          await logAudit({ actor: user, event: `${cfg.label} updated`, target: id, category: cfg.category, status: "Success", ip: clientIp(req) });
          return NextResponse.json({ success: true, id });
        }

        // create
        const required = cfg.columns.filter((c) => c.required).map((c) => c.name);
        for (const r of required) {
          if (!body[r]) return NextResponse.json({ success: false, error: `${r} is required.` }, { status: 400 });
        }
        const id = newId(cfg.idPrefix);
        const insertCols = ["id", ...cols];
        const placeholders = insertCols.map(() => "?").join(", ");
        await execute(
          `INSERT INTO ${cfg.table} (${insertCols.join(", ")}) VALUES (${placeholders})`,
          [id, ...vals],
        );
        await logAudit({ actor: user, event: `${cfg.label} created`, target: id, category: cfg.category, status: "Success", ip: clientIp(req) });
        return NextResponse.json({ success: true, id });
      } catch (err) {
        console.error(`[${cfg.table}] mutation failed:`, err);
        return NextResponse.json({ success: false, error: "Operation failed." }, { status: 500 });
      }
    },
  };
}

// Tables that have an updated_at column (so UPDATE can bump it).
function tableHasUpdatedAt(table: string): boolean {
  return ["projects", "blog_posts"].includes(table);
}
