import { NextResponse } from "next/server";
import { isConfigured, execute, newId } from "@/server/db";

export const runtime = "nodejs";

/**
 * Public, fire-and-forget analytics beacon. Records a pageview with coarse
 * device/browser info parsed from the UA. No PII, no cookies required.
 * Silently no-ops if the DB isn't configured.
 */
export async function POST(req: Request) {
  if (!isConfigured()) return NextResponse.json({ ok: true, persisted: false });

  let body: { path?: string; referrer?: string; visitorId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const ua = req.headers.get("user-agent") ?? "";
  const device = /mobile/i.test(ua) ? "Mobile" : /tablet|ipad/i.test(ua) ? "Tablet" : "Desktop";
  const browser = /edg/i.test(ua) ? "Edge" : /chrome/i.test(ua) ? "Chrome" : /firefox/i.test(ua) ? "Firefox" : /safari/i.test(ua) ? "Safari" : "Other";
  const os = /windows/i.test(ua) ? "Windows" : /mac os/i.test(ua) ? "macOS" : /android/i.test(ua) ? "Android" : /iphone|ipad|ios/i.test(ua) ? "iOS" : /linux/i.test(ua) ? "Linux" : "Other";

  try {
    await execute(
      `INSERT INTO analytics_events (id, type, path, referrer, device, browser, os, visitor_id)
       VALUES (?, 'pageview', ?, ?, ?, ?, ?, ?)`,
      [
        newId("ana"),
        (body.path ?? "/").slice(0, 200),
        (body.referrer ?? "").slice(0, 200),
        device,
        browser,
        os,
        (body.visitorId ?? "").slice(0, 64),
      ],
    );
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ ok: true, persisted: false });
  }
}
