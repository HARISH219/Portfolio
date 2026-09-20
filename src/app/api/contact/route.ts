import { NextResponse } from "next/server";
import { isConfigured, execute, newId } from "@/server/db";
import { logAudit } from "@/server/audit";
import { rateLimit } from "@/server/auth";
import { clientIp } from "@/server/session";

export const runtime = "nodejs";

/**
 * Public contact form submission endpoint. Stores the message so the admin
 * Messages panel has real data. Rate-limited per IP. Never requires auth.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const name = (body.name ?? "").toString().trim().slice(0, 120);
  const email = (body.email ?? "").toString().trim().slice(0, 200);
  const subject = (body.subject ?? "").toString().trim().slice(0, 200);
  const message = (body.message ?? "").toString().trim().slice(0, 5000);

  if (!name || !email || !message) {
    return NextResponse.json({ success: false, error: "Name, email and message are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: "Please enter a valid email." }, { status: 400 });
  }

  if (!isConfigured()) {
    // Accept gracefully so the public form still "works" even without a DB.
    console.warn("[contact] DB not configured — message not persisted.");
    return NextResponse.json({ success: true, persisted: false });
  }

  try {
    await execute(
      `INSERT INTO messages (id, name, email, subject, body, status, ip) VALUES (?, ?, ?, ?, ?, 'unread', ?)`,
      [newId("msg"), name, email, subject, message, ip],
    );
    await logAudit({ actor: name, event: "Contact message received", target: email, category: "Messages", status: "Success", details: subject, ip });
    return NextResponse.json({ success: true, persisted: true });
  } catch (err) {
    console.error("[contact] insert failed:", err);
    return NextResponse.json({ success: false, error: "Unable to send message right now." }, { status: 500 });
  }
}
