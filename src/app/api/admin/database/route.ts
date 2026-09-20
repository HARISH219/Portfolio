import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/session";
import { isConfigured, query } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only database overview: connection status, latency, table list + row
 * counts. Never exposes credentials and never runs arbitrary/destructive SQL.
 */
export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const type = process.env.TURSO_DATABASE_URL ? "Turso (libSQL)" : "Local SQLite (file)";

  if (!isConfigured()) {
    return NextResponse.json({ success: true, dbConfigured: false, type, connected: false, tables: [] });
  }

  const t0 = Date.now();
  try {
    // Discover user tables from sqlite_master (safe, read-only).
    const tablesRes = await query<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' ORDER BY name`,
    );
    const latencyMs = Date.now() - t0;

    const tables: { name: string; rows: number }[] = [];
    for (const t of tablesRes) {
      try {
        const c = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM ${t.name}`);
        tables.push({ name: t.name, rows: Number(c[0]?.n ?? 0) });
      } catch {
        tables.push({ name: t.name, rows: -1 });
      }
    }

    return NextResponse.json({
      success: true,
      dbConfigured: true,
      type,
      connected: true,
      latencyMs,
      tables,
    });
  } catch (err) {
    console.error("[database] failed:", err);
    return NextResponse.json({ success: false, error: "Database query failed.", type, connected: false }, { status: 500 });
  }
}
