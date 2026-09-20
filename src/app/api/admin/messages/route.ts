import { NextResponse } from "next/server";
import { getSessionUser, clientIp } from "@/server/session";
import { isConfigured, query, execute } from "@/server/db";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUS = new Set(["unread", "read", "replied", "archived"]);

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ success: true, dbConfigured: false, items: [] });
  try {
    const items = await query(`SELECT * FROM messages ORDER BY created_at DESC`);
    return NextResponse.json({ success: true, dbConfigured: true, items });
  } catch (err) {
    console.error("[messages] list failed:", err);
    return NextResponse.json({ success: false, error: "Unable to load messages." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ success: false, error: "Database not configured." }, { status: 503 });

  let body: { _action?: string; id?: string; status?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ success: false, error: "Missing id." }, { status: 400 });

  try {
    if (body._action === "delete") {
      await execute(`DELETE FROM messages WHERE id = ?`, [id]);
      await logAudit({ actor: user, event: "Message deleted", target: id, category: "Messages", status: "Success", ip: clientIp(req) });
      return NextResponse.json({ success: true });
    }

    if (body._action === "status") {
      const status = String(body.status ?? "");
      if (!VALID_STATUS.has(status)) return NextResponse.json({ success: false, error: "Invalid status." }, { status: 400 });
      await execute(`UPDATE messages SET status = ? WHERE id = ?`, [status, id]);
      await logAudit({ actor: user, event: `Message marked ${status}`, target: id, category: "Messages", status: "Success", ip: clientIp(req) });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("[messages] mutation failed:", err);
    return NextResponse.json({ success: false, error: "Operation failed." }, { status: 500 });
  }
}
