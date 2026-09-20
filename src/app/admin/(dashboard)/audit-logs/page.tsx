"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, StatCard, LoadingBlock, ErrorBlock, EmptyBlock, StatusPill } from "@/components/admin/ui";
import { BarChart, DonutChart } from "@/components/admin/charts";

interface Log {
  id: string; timestamp: string; actor: string; event: string; target: string | null; category: string; status: string; details: string;
}
interface Stats { total: number; today: number; byCategory: { label: string; value: number }[]; last7Days: { date: string; total: number }[] }

const CATEGORIES = ["all", "Authentication", "Admin Actions", "Portfolio", "Messages", "API", "Database", "Security", "System", "Testing"];
const STATUSES = ["all", "Success", "Failed", "Warning"];
const PER_PAGE = 50;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);

  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const p = new URLSearchParams({ page: String(page), limit: String(PER_PAGE), stats: "1", category, status });
    if (search.trim()) p.set("search", search.trim());
    fetch(`/api/admin/audit-logs?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLogs(d.logs ?? []);
          setTotal(d.total ?? 0);
          if (d.stats) setStats(d.stats);
          setDbConfigured(d.dbConfigured !== false);
        } else setError(d.error || "Failed to load audit logs.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [page, category, status, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const spark = stats?.last7Days.map((d) => d.total) ?? [];

  function exportCsv() {
    const rows = [["Event", "Actor", "Target", "Category", "Status", "Timestamp", "Details"]];
    logs.forEach((l) => rows.push([l.event, l.actor, l.target ?? "", l.category, l.status, l.timestamp, (l.details ?? "").replace(/\n/g, " ")]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Audit Logs</h2>
          <p className="mt-0.5 text-xs text-[#8b8797]">Every tracked action across the control center.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-[#c9c5d6] hover:bg-white/5">Refresh</button>
          <button onClick={exportCsv} className="rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] px-3 py-2 text-[11px] font-semibold text-white hover:opacity-90">Export Logs</button>
        </div>
      </div>

      {!dbConfigured && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">Database not configured — no audit history available.</div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Events" value={stats?.total ?? 0} spark={spark} sub="all-time" accent="#ec4899" />
        <StatCard label="Today" value={stats?.today ?? 0} spark={spark} sub="last 24h" accent="#d946ef" />
        <StatCard label="Categories" value={stats?.byCategory.length ?? 0} sub="active" accent="#a855f7" />
        <StatCard label="On This Page" value={logs.length} sub={`of ${total}`} accent="#f472b6" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-white">Activity — last 7 days</h3>
          <BarChart data={(stats?.last7Days ?? []).map((d) => ({ label: new Date(d.date + "T00:00:00").toLocaleDateString([], { day: "numeric", month: "short" }), value: d.total }))} />
        </Card>
        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-white">Event Distribution</h3>
          <DonutChart data={stats?.byCategory ?? []} total={stats?.total ?? 0} />
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search event, actor, target..."
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white outline-none placeholder:text-[#5a5766] focus:border-[#ec4899]/50"
        />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-[#c9c5d6] outline-none focus:border-[#ec4899]/50">
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d0b12]">{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-[#c9c5d6] outline-none focus:border-[#ec4899]/50">
          {STATUSES.map((s) => <option key={s} value={s} className="bg-[#0d0b12]">{s === "all" ? "All Status" : s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingBlock label="Loading audit logs..." />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : logs.length === 0 ? (
        <EmptyBlock title="No audit events match." hint="Try clearing filters." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-[#8b8797]">
                  <th className="px-4 py-3 text-left font-medium">Event</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Target</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{l.event}</div>
                      {l.details && <div className="line-clamp-1 max-w-[260px] text-[10px] text-[#6f6c7d]">{l.details}</div>}
                    </td>
                    <td className="px-4 py-3 text-[#a5a1b3]">{l.actor}</td>
                    <td className="px-4 py-3"><span className="line-clamp-1 max-w-[140px] text-[#a5a1b3]">{l.target || "—"}</span></td>
                    <td className="px-4 py-3"><span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-[#c9c5d6]">{l.category}</span></td>
                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-[#8b8797]">{new Date(l.timestamp + "Z").toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
            <span className="text-[11px] text-[#8b8797]">Showing {total === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-[#c9c5d6] disabled:opacity-40 hover:bg-white/5">Prev</button>
              <span className="text-[11px] text-[#a5a1b3]">Page {page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-[#c9c5d6] disabled:opacity-40 hover:bg-white/5">Next</button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
