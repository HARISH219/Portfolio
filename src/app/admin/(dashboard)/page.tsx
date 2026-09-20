"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, StatCard, StatusPill, SkeletonCards, ErrorBlock } from "@/components/admin/ui";
import { BarChart, DonutChart } from "@/components/admin/charts";

interface DashboardData {
  dbConfigured: boolean;
  stats: {
    projects: number;
    publishedProjects: number;
    messages: number;
    unreadMessages: number;
    blogPosts: number;
    certificates: number;
    analyticsEvents: number;
    systemEvents: number;
    eventsToday: number;
  } | null;
  audit: { total: number; today: number; byCategory: { label: string; value: number }[]; last7Days: { date: string; total: number }[] };
}

interface HealthData {
  overall: string;
  checkedAt: string;
  checks: { name: string; status: string; detail: string; latencyMs?: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d);
        else setError(d.error || "Failed to load dashboard.");
      })
      .catch(() => setError("Network error while loading dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const runHealth = useCallback(() => {
    setHealthLoading(true);
    fetch("/api/admin/health")
      .then((r) => r.json())
      .then((d) => { if (d.success) setHealth(d); })
      .catch(() => {})
      .finally(() => setHealthLoading(false));
  }, []);

  useEffect(() => {
    load();
    runHealth();
  }, [load, runHealth]);

  if (loading) {
    return (
      <div className="space-y-5">
        <SkeletonCards count={6} />
        <div className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      </div>
    );
  }

  if (error) return <ErrorBlock message={error} onRetry={load} />;

  const s = data?.stats;
  const spark = data?.audit.last7Days.map((d) => d.total) ?? [];

  return (
    <div className="space-y-6">
      {/* Page intro */}
      <div>
        <h2 className="text-lg font-semibold text-white">System Overview</h2>
        <p className="mt-0.5 text-xs text-[#8b8797]">Live snapshot of your portfolio backend and content.</p>
      </div>

      {!data?.dbConfigured && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">
          Database not configured. Set <code className="font-mono text-amber-200">TURSO_DATABASE_URL</code> and{" "}
          <code className="font-mono text-amber-200">TURSO_AUTH_TOKEN</code> to enable persistence. The panel is running in read-only/degraded mode.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="System Events" value={s?.systemEvents ?? 0} spark={spark} sub="all-time" accent="#ec4899" />
        <StatCard label="Events Today" value={s?.eventsToday ?? 0} spark={spark} sub="last 24h" accent="#d946ef" />
        <StatCard label="Projects" value={s?.projects ?? 0} sub={`${s?.publishedProjects ?? 0} published`} accent="#a855f7" />
        <StatCard label="Messages" value={s?.messages ?? 0} sub={`${s?.unreadMessages ?? 0} unread`} accent="#f472b6" />
        <StatCard label="Blog Posts" value={s?.blogPosts ?? 0} sub="articles" accent="#fb7185" />
        <StatCard label="Analytics Events" value={s?.analyticsEvents ?? 0} sub="tracked" accent="#22d3ee" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Activity Overview</h3>
              <p className="text-[11px] text-[#8b8797]">Events recorded over the last 7 days.</p>
            </div>
            <span className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] text-[#8b8797]">Last 7 Days</span>
          </div>
          <BarChart data={(data?.audit.last7Days ?? []).map((d) => ({ label: new Date(d.date + "T00:00:00").toLocaleDateString([], { day: "numeric", month: "short" }), value: d.total }))} />
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold text-white">Event Distribution</h3>
          <p className="mb-3 text-[11px] text-[#8b8797]">Breakdown by category.</p>
          <DonutChart data={data?.audit.byCategory ?? []} total={data?.audit.total ?? 0} />
        </Card>
      </div>

      {/* Website Health */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Website Health</h3>
            <p className="text-[11px] text-[#8b8797]">
              {health ? <>Last checked {new Date(health.checkedAt).toLocaleTimeString()}</> : "Run a full system health check."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {health && <StatusPill status={health.overall} />}
            <button
              onClick={runHealth}
              disabled={healthLoading}
              className="rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {healthLoading ? "Checking..." : "Run Full Health Check"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(health?.checks ?? []).map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium text-white">{c.name}</div>
                <div className="truncate text-[10px] text-[#8b8797]">
                  {c.detail}{typeof c.latencyMs === "number" ? ` · ${c.latencyMs}ms` : ""}
                </div>
              </div>
              <StatusPill status={c.status} />
            </div>
          ))}
          {!health && !healthLoading && (
            <p className="text-xs text-[#6f6c7d]">Click &ldquo;Run Full Health Check&rdquo; to test each subsystem.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
