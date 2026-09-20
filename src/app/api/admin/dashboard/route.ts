import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/session";
import { isConfigured, query } from "@/server/db";
import { getAuditStats } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function count(table: string, where = ""): Promise<number> {
  try {
    const rows = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}${where ? " WHERE " + where : ""}`);
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const dbReady = isConfigured();
  if (!dbReady) {
    return NextResponse.json({
      success: true,
      dbConfigured: false,
      stats: null,
      audit: { total: 0, today: 0, byCategory: [], last7Days: [] },
    });
  }

  try {
    const [
      projects,
      publishedProjects,
      messages,
      unreadMessages,
      blogPosts,
      certificates,
      analyticsEvents,
      audit,
    ] = await Promise.all([
      count("projects"),
      count("projects", "published = 1"),
      count("messages"),
      count("messages", "status = 'unread'"),
      count("blog_posts"),
      count("certificates"),
      count("analytics_events"),
      getAuditStats(),
    ]);

    return NextResponse.json({
      success: true,
      dbConfigured: true,
      stats: {
        projects,
        publishedProjects,
        messages,
        unreadMessages,
        blogPosts,
        certificates,
        analyticsEvents,
        systemEvents: audit.total,
        eventsToday: audit.today,
      },
      audit,
    });
  } catch (err) {
    console.error("[dashboard] failed:", err);
    return NextResponse.json({ success: false, error: "Unable to load dashboard data." }, { status: 500 });
  }
}
