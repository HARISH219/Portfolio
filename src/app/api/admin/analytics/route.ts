import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/session";
import { isConfigured, query } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Analytics overview. Uses real data from the analytics_events table when
 * present. If no events have been tracked yet, returns demoMode=true and the
 * UI clearly labels the sample figures as demo data (never faked as real).
 */
export async function GET(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const days = Math.min(Math.max(1, Number(new URL(req.url).searchParams.get("days") ?? 7)), 90);

  if (!isConfigured()) {
    return NextResponse.json({ success: true, dbConfigured: false, demoMode: true, ...demo(days) });
  }

  try {
    const total = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM analytics_events`);
    const count = Number(total[0]?.n ?? 0);
    if (count === 0) {
      return NextResponse.json({ success: true, dbConfigured: true, demoMode: true, ...demo(days) });
    }

    const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
    const [visitors, unique, pageViews, topPages, referrers, devices, browsers, daily] = await Promise.all([
      query<{ n: number }>(`SELECT COUNT(*) AS n FROM analytics_events WHERE type='pageview' AND substr(created_at,1,10) >= ?`, [since]),
      query<{ n: number }>(`SELECT COUNT(DISTINCT visitor_id) AS n FROM analytics_events WHERE substr(created_at,1,10) >= ?`, [since]),
      query<{ n: number }>(`SELECT COUNT(*) AS n FROM analytics_events WHERE type='pageview'`),
      query<{ path: string; n: number }>(`SELECT path, COUNT(*) AS n FROM analytics_events WHERE type='pageview' GROUP BY path ORDER BY n DESC LIMIT 8`),
      query<{ referrer: string; n: number }>(`SELECT referrer, COUNT(*) AS n FROM analytics_events WHERE referrer != '' GROUP BY referrer ORDER BY n DESC LIMIT 8`),
      query<{ device: string; n: number }>(`SELECT device, COUNT(*) AS n FROM analytics_events WHERE device != '' GROUP BY device ORDER BY n DESC`),
      query<{ browser: string; n: number }>(`SELECT browser, COUNT(*) AS n FROM analytics_events WHERE browser != '' GROUP BY browser ORDER BY n DESC LIMIT 6`),
      query<{ d: string; n: number }>(`SELECT substr(created_at,1,10) AS d, COUNT(*) AS n FROM analytics_events WHERE substr(created_at,1,10) >= ? GROUP BY d`, [since]),
    ]);

    const dayMap = new Map(daily.map((r) => [r.d, Number(r.n)]));
    const series: { date: string; value: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      series.push({ date: d, value: dayMap.get(d) ?? 0 });
    }

    return NextResponse.json({
      success: true,
      dbConfigured: true,
      demoMode: false,
      visitors: Number(visitors[0]?.n ?? 0),
      unique: Number(unique[0]?.n ?? 0),
      pageViews: Number(pageViews[0]?.n ?? 0),
      topPages: topPages.map((r) => ({ label: r.path || "/", value: Number(r.n) })),
      referrers: referrers.map((r) => ({ label: r.referrer, value: Number(r.n) })),
      devices: devices.map((r) => ({ label: r.device, value: Number(r.n) })),
      browsers: browsers.map((r) => ({ label: r.browser, value: Number(r.n) })),
      series,
    });
  } catch (err) {
    console.error("[analytics] failed:", err);
    return NextResponse.json({ success: false, error: "Unable to load analytics." }, { status: 500 });
  }
}

function demo(days: number) {
  const series: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    series.push({ date: new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), value: 0 });
  }
  return {
    visitors: 0,
    unique: 0,
    pageViews: 0,
    topPages: [],
    referrers: [],
    devices: [],
    browsers: [],
    series,
  };
}
