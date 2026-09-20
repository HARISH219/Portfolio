import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/session";
import { isConfigured, query } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Health = { name: string; status: "operational" | "warning" | "error" | "unknown"; detail: string; latencyMs?: number };

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const checks: Health[] = [];

  // Frontend/app — if this handler runs, the app server is up.
  checks.push({ name: "Frontend", status: "operational", detail: "App server responding" });
  checks.push({ name: "Backend / API", status: "operational", detail: "API routes responding" });

  // Database — real round-trip.
  if (!isConfigured()) {
    checks.push({ name: "Database", status: "warning", detail: "Not configured (set TURSO_DATABASE_URL)" });
  } else {
    const t0 = Date.now();
    try {
      await query("SELECT 1 AS ok");
      checks.push({ name: "Database", status: "operational", detail: "Connection healthy", latencyMs: Date.now() - t0 });
    } catch (err) {
      checks.push({ name: "Database", status: "error", detail: err instanceof Error ? err.message : "Query failed", latencyMs: Date.now() - t0 });
    }
  }

  // Authentication — configured if a password is set.
  checks.push({
    name: "Authentication",
    status: process.env.ADMIN_PASSWORD ? "operational" : "warning",
    detail: process.env.ADMIN_PASSWORD ? "Credentials configured" : "ADMIN_PASSWORD not set",
  });

  // Storage / Email / External — not wired yet; report unknown honestly.
  checks.push({ name: "Storage", status: "unknown", detail: "Not configured" });
  checks.push({ name: "Email", status: "unknown", detail: "Not configured" });
  checks.push({ name: "External Services", status: "unknown", detail: "None registered" });

  const worst = checks.some((c) => c.status === "error")
    ? "error"
    : checks.some((c) => c.status === "warning")
      ? "warning"
      : "operational";

  return NextResponse.json({ success: true, overall: worst, checks, checkedAt: new Date().toISOString() });
}
