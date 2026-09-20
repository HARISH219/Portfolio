import { NextResponse } from "next/server";
import { getSessionUser, clientIp } from "@/server/session";
import { isConfigured } from "@/server/db";
import { getAllSettings, setSetting } from "@/server/settings";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  const settings = await getAllSettings();
  return NextResponse.json({ success: true, dbConfigured: isConfigured(), settings });
}

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  if (!isConfigured()) return NextResponse.json({ success: false, error: "Database not configured." }, { status: 503 });

  let body: { settings?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }
  const entries = Object.entries(body.settings ?? {});
  if (entries.length === 0) return NextResponse.json({ success: false, error: "No settings provided." }, { status: 400 });

  try {
    for (const [k, v] of entries) {
      // Only allow known key prefixes to be written.
      if (!/^(general|portfolio|appearance|notifications|logs|security|api)\./.test(k)) continue;
      await setSetting(k, String(v));
    }
    await logAudit({ actor: user, event: "Settings updated", category: "Admin Actions", status: "Success", details: entries.map(([k]) => k).join(", "), ip: clientIp(req) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[settings] save failed:", err);
    return NextResponse.json({ success: false, error: "Unable to save settings." }, { status: 500 });
  }
}
