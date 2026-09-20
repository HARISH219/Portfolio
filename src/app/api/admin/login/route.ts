import { NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  cookieOptions,
  sessionMaxAgeSeconds,
  rateLimit,
  SESSION_COOKIE,
} from "@/server/auth";
import { clientIp } from "@/server/session";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, 8, 60_000);
  if (!rl.ok) {
    await logAudit({
      actor: "anonymous",
      event: "Login rate-limited",
      category: "Security",
      status: "Warning",
      details: `Too many attempts from ${ip}`,
      ip,
    });
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const username = (body.username ?? "").toString();
  const password = (body.password ?? "").toString();

  if (!username || !password) {
    return NextResponse.json({ success: false, error: "Username and password required." }, { status: 400 });
  }

  if (!verifyCredentials(username, password)) {
    await logAudit({
      actor: username || "anonymous",
      event: "Failed login attempt",
      category: "Security",
      status: "Failed",
      details: `Invalid credentials from ${ip}`,
      ip,
    });
    return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
  }

  const token = createSessionToken(username.trim());
  const res = NextResponse.json({ success: true, username: username.trim() });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions(sessionMaxAgeSeconds()));

  await logAudit({
    actor: username.trim(),
    event: "Admin login",
    category: "Authentication",
    status: "Success",
    details: `Signed in from ${ip}`,
    ip,
  });

  return res;
}
