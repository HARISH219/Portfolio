import { NextResponse } from "next/server";
import { getSessionUser, clientIp } from "@/server/session";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-side request proxy for the API testing panel (lightweight Postman).
 * Runs the request server-side to avoid CORS. Auth-gated. Blocks obvious SSRF
 * against internal/metadata addresses.
 */
const BLOCKED_HOSTS = [/^localhost$/i, /^127\./, /^0\.0\.0\.0$/, /^10\./, /^192\.168\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /metadata/i];

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  let body: { method?: string; url?: string; headers?: Record<string, string>; body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const method = (body.method ?? "GET").toUpperCase();
  const rawUrl = (body.url ?? "").trim();
  if (!rawUrl) return NextResponse.json({ success: false, error: "URL is required." }, { status: 400 });

  let target: URL;
  try { target = new URL(rawUrl); } catch { return NextResponse.json({ success: false, error: "Invalid URL." }, { status: 400 }); }
  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ success: false, error: "Only http/https allowed." }, { status: 400 });
  }
  if (BLOCKED_HOSTS.some((re) => re.test(target.hostname))) {
    return NextResponse.json({ success: false, error: "Requests to internal/private addresses are blocked." }, { status: 400 });
  }

  const t0 = Date.now();
  try {
    const res = await fetch(target.toString(), {
      method,
      headers: body.headers ?? {},
      body: ["GET", "HEAD"].includes(method) ? undefined : (body.body || undefined),
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
    const responseTimeMs = Date.now() - t0;

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => (headers[k] = v));

    // Cap body at ~200KB to avoid huge payloads in the panel.
    const text = await res.text();
    const truncated = text.length > 200_000;
    const bodyText = truncated ? text.slice(0, 200_000) : text;

    await logAudit({
      actor: user,
      event: "API test request",
      target: `${method} ${target.origin}${target.pathname}`,
      category: "Testing",
      status: res.ok ? "Success" : "Warning",
      details: `HTTP ${res.status} in ${responseTimeMs}ms`,
      ip: clientIp(req),
    });

    return NextResponse.json({
      success: true,
      status: res.status,
      statusText: res.statusText,
      responseTimeMs,
      headers,
      body: bodyText,
      truncated,
    });
  } catch (err) {
    const responseTimeMs = Date.now() - t0;
    const msg = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ success: true, status: 0, statusText: "Network Error", responseTimeMs, headers: {}, body: msg, error: msg });
  }
}
