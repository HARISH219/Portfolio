import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "crypto";

/**
 * Auth for the Portfolio Control Center.
 *
 * - Credentials come from env (ADMIN_USERNAME / ADMIN_PASSWORD). The password is
 *   never persisted; login compares against the env value in constant time.
 * - A session is a signed token: base64url(payload).hmacSHA256(payload, secret).
 *   Stored in an HTTP-only, SameSite=Lax cookie. No DB round-trip to validate.
 * - This module is server-only.
 */

export const SESSION_COOKIE = "pcc_session";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || "dev-only-insecure-secret-change-me";
}

function sessionHours(): number {
  const n = Number(process.env.ADMIN_SESSION_HOURS);
  return Number.isFinite(n) && n > 0 ? n : 12;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

interface SessionPayload {
  u: string; // username
  iat: number; // issued at (ms)
  exp: number; // expiry (ms)
}

function sign(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

export function createSessionToken(username: string): string {
  const now = Date.now();
  const payload: SessionPayload = {
    u: username,
    iat: now,
    exp: now + sessionHours() * 3600_000,
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;

  const expected = sign(payloadB64);
  // Constant-time signature comparison.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as SessionPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Constant-time credential check against env-configured admin. */
export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME?.trim() || "harish";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedPass) {
    console.warn("[auth] ADMIN_PASSWORD is not set — login is disabled.");
    return false;
  }
  const userOk = safeEqualStr(username.trim(), expectedUser);
  const passOk = safeEqualStr(password, expectedPass);
  return userOk && passOk;
}

function safeEqualStr(a: string, b: string): boolean {
  // Hash both to fixed length so timingSafeEqual doesn't leak length and never throws.
  const salt = "pcc-cmp";
  const ha = scryptSync(a, salt, 32);
  const hb = scryptSync(b, salt, 32);
  return timingSafeEqual(ha, hb);
}

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function sessionMaxAgeSeconds(): number {
  return sessionHours() * 3600;
}

// ─── Lightweight in-memory rate limiter (per-process) ────────────────────────
// Good enough for a single-instance admin login. Not distributed.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max = 8, windowMs = 60_000): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now > rec.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  rec.count += 1;
  if (rec.count > max) {
    return { ok: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}
