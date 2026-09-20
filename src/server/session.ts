import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/**
 * Server-side session helpers for App Router route handlers and server
 * components. `requireAdmin` returns the username or null; route handlers
 * should return 401 when it's null.
 */

export function getSessionUser(): string | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const payload = verifySessionToken(token);
  return payload?.u ?? null;
}

export function requireAdmin(): string | null {
  return getSessionUser();
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
