import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/session";
import { isConfigured } from "@/server/db";
import { getAuditPage, getAuditStats } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  if (!isConfigured()) {
    return NextResponse.json({ success: true, dbConfigured: false, logs: [], total: 0, stats: { total: 0, today: 0, byCategory: [], last7Days: [] } });
  }

  const url = new URL(req.url);
  const q = url.searchParams;
  const limit = Number(q.get("limit") ?? 50);
  const page = Math.max(1, Number(q.get("page") ?? 1));
  const includeStats = q.get("stats") === "1";

  try {
    const [{ logs, total }, stats] = await Promise.all([
      getAuditPage({
        limit,
        offset: (page - 1) * limit,
        category: q.get("category") ?? undefined,
        status: q.get("status") ?? undefined,
        actor: q.get("actor") ?? undefined,
        search: q.get("search") ?? undefined,
        from: q.get("from") ?? undefined,
        to: q.get("to") ?? undefined,
      }),
      includeStats ? getAuditStats() : Promise.resolve(undefined),
    ]);
    return NextResponse.json({ success: true, dbConfigured: true, logs, total, page, limit, stats });
  } catch (err) {
    console.error("[audit-logs] failed:", err);
    return NextResponse.json({ success: false, error: "Unable to load audit logs." }, { status: 500 });
  }
}
