import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/session";
import { isConfigured } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ success: true, username: user, dbConfigured: isConfigured() });
}
