"use client";

import { useState } from "react";
import { Card, StatusPill, LoadingBlock } from "@/components/admin/ui";

interface TestResult { name: string; status: "pass" | "fail" | "skip"; httpStatus?: number; responseTimeMs: number; error?: string }
interface TestRun { ranAt: string; summary: { total: number; passed: number; failed: number; skipped: number }; results: TestResult[] }

export default function TestingPage() {
  const [run, setRun] = useState<TestRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runTests() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/testing");
      const d = await res.json();
      if (d.success) setRun(d);
      else setError(d.error || "Test run failed.");
    } catch {
      setError("Network error running tests.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Website Testing</h2>
          <p className="mt-0.5 text-xs text-[#8b8797]">Run real checks against your backend, APIs, database, and public site.</p>
        </div>
        <button onClick={runTests} disabled={loading} className="rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] px-3.5 py-2 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {loading ? "Running..." : "Run All Tests"}
        </button>
      </div>

      {run && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Total" value={run.summary.total} color="#a855f7" />
          <SummaryCard label="Passed" value={run.summary.passed} color="#34d399" />
          <SummaryCard label="Failed" value={run.summary.failed} color="#fb7185" />
          <SummaryCard label="Skipped" value={run.summary.skipped} color="#8b8797" />
        </div>
      )}

      {error && <div className="rounded-xl border border-[#fb7185]/25 bg-[#fb7185]/[0.06] px-4 py-3 text-sm text-[#fb7185]">{error}</div>}

      {loading && !run ? (
        <LoadingBlock label="Running test suite..." />
      ) : !run ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[#c9c5d6]">Click &ldquo;Run All Tests&rdquo; to execute the suite.</p>
          <p className="mt-1 text-xs text-[#6f6c7d]">Tests hit real endpoints — database, APIs, contact form, and the public homepage.</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-white/[0.05]">
            {run.results.map((r) => (
              <div key={r.name} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-white">{r.name}</div>
                  <div className="text-[10px] text-[#8b8797]">
                    {r.httpStatus ? `HTTP ${r.httpStatus} · ` : ""}{r.responseTimeMs}ms{r.error ? ` · ${r.error}` : ""}
                  </div>
                </div>
                <StatusPill status={r.status === "pass" ? "Pass" : r.status === "fail" ? "Failed" : "Unknown"} />
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] px-4 py-2.5 text-[10px] text-[#6f6c7d]">Last run {new Date(run.ranAt).toLocaleString()}</div>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-[#8b8797]">{label}</div>
    </div>
  );
}
