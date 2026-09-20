import { NextResponse } from "next/server";
import { SESSION_COOKIE, cookieOptions } from "@/server/auth";
import { getSessionUser, clientIp } from "@/server/session";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = getSessionUser();
  const res = NextResponse.json({ success: true });
  // Expire the cookie immediately.
  res.cookies.set(SESSION_COOKIE, "", cookieOptions(0));

  if (user) {
    await logAudit({
      actor: user,
      event: "Admin logout",
      category: "Authentication",
      status: "Success",
      details: "Signed out",
      ip: clientIp(req),
    });
  }
  return res;
}
