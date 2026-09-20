import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/session";
import { isConfigured, query } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "skip";
  httpStatus?: number;
  responseTimeMs: number;
  error?: string;
}

async function timed(name: string, fn: () => Promise<Partial<TestResult>>): Promise<TestResult> {
  const t0 = Date.now();
  try {
    const r = await fn();
    return { name, status: r.status ?? "pass", httpStatus: r.httpStatus, responseTimeMs: Date.now() - t0, error: r.error };
  } catch (err) {
    return { name, status: "fail", responseTimeMs: Date.now() - t0, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function GET(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const origin = new URL(req.url).origin;
  const cookie = req.headers.get("cookie") ?? "";
  const results: TestResult[] = [];

  // Database connection
  results.push(await timed("Database Connection", async () => {
    if (!isConfigured()) return { status: "skip", error: "DB not configured" };
    await query("SELECT 1");
    return { status: "pass" };
  }));

  // Schema integrity — verify core tables exist
  results.push(await timed("Schema Integrity", async () => {
    if (!isConfigured()) return { status: "skip", error: "DB not configured" };
    const rows = await query<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table'`);
    const names = new Set(rows.map((r) => r.name));
    const required = ["projects", "messages", "audit_log", "settings"];
    const missing = required.filter((t) => !names.has(t));
    if (missing.length) return { status: "fail", error: `Missing tables: ${missing.join(", ")}` };
    return { status: "pass" };
  }));

  // Internal API endpoints (self-fetch with the caller's session cookie)
  const endpoints = [
    { name: "Dashboard API", path: "/api/admin/dashboard" },
    { name: "Health API", path: "/api/admin/health" },
    { name: "Projects API", path: "/api/admin/projects" },
    { name: "Messages API", path: "/api/admin/messages" },
    { name: "Audit Logs API", path: "/api/admin/audit-logs" },
  ];
  for (const ep of endpoints) {
    results.push(await timed(ep.name, async () => {
      const res = await fetch(`${origin}${ep.path}`, { headers: { cookie }, signal: AbortSignal.timeout(8000) });
      const ok = res.ok;
      return { status: ok ? "pass" : "fail", httpStatus: res.status, error: ok ? undefined : `HTTP ${res.status}` };
    }));
  }

  // Public contact endpoint reachability (validation error is expected/OK — proves it's alive)
  results.push(await timed("Contact API", async () => {
    const res = await fetch(`${origin}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(8000),
    });
    // 400 (validation) or 200 both mean the route is functioning.
    const alive = res.status === 400 || res.status === 200 || res.status === 429;
    return { status: alive ? "pass" : "fail", httpStatus: res.status, error: alive ? undefined : `Unexpected HTTP ${res.status}` };
  }));

  // Public homepage renders
  results.push(await timed("Public Homepage", async () => {
    const res = await fetch(`${origin}/`, { signal: AbortSignal.timeout(8000) });
    return { status: res.ok ? "pass" : "fail", httpStatus: res.status, error: res.ok ? undefined : `HTTP ${res.status}` };
  }));

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const skipped = results.filter((r) => r.status === "skip").length;

  return NextResponse.json({
    success: true,
    ranAt: new Date().toISOString(),
    summary: { total: results.length, passed, failed, skipped },
    results,
  });
}
