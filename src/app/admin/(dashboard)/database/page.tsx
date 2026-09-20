"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, StatCard, LoadingBlock, ErrorBlock, StatusPill } from "@/components/admin/ui";

interface DbInfo { dbConfigured: boolean; type: string; connected: boolean; latencyMs?: number; tables: { name: string; rows: number }[] }

export default function DatabasePage() {
  const [info, setInfo] = useState<DbInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    fetch("/api/admin/database")
      .then((r) => r.json())
      .then((d) => { if (d.success) setInfo(d); else setError(d.error || "Failed to load database info."); })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalRows = info?.tables.reduce((a, t) => a + Math.max(0, t.rows), 0) ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Database</h2>
          <p className="mt-0.5 text-xs text-[#8b8797]">Read-only overview. Credentials are never exposed.</p>
        </div>
        <button onClick={load} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-[#c9c5d6] hover:bg-white/5">Refresh</button>
      </div>

      {loading ? (
        <LoadingBlock label="Checking database..." />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-[#8b8797]">Connection</div>
              <StatusPill status={info?.connected ? "Operational" : "Offline"} />
            </div>
            <StatCard label="Type" value={info?.type?.split(" ")[0] ?? "—"} sub={info?.type ?? ""} accent="#a855f7" />
            <StatCard label="Latency" value={info?.latencyMs != null ? `${info.latencyMs}ms` : "—"} sub="round-trip" accent="#22d3ee" />
            <StatCard label="Total Rows" value={totalRows} sub={`${info?.tables.length ?? 0} tables`} accent="#ec4899" />
          </div>

          {!info?.dbConfigured && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">
              Database not configured. Set <code className="font-mono">TURSO_DATABASE_URL</code> and <code className="font-mono">TURSO_AUTH_TOKEN</code>.
            </div>
          )}

          <Card>
            <div className="border-b border-white/[0.06] px-4 py-3 text-sm font-semibold text-white">Tables</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-[#8b8797]">
                    <th className="px-4 py-3 text-left font-medium">Table</th>
                    <th className="px-4 py-3 text-right font-medium">Rows</th>
                  </tr>
                </thead>
                <tbody>
                  {(info?.tables ?? []).map((t) => (
                    <tr key={t.name} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-[13px] text-white">{t.name}</td>
                      <td className="px-4 py-3 text-right text-[#a5a1b3]">{t.rows < 0 ? "—" : t.rows.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!info?.tables || info.tables.length === 0) && (
                    <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-[#6f6c7d]">No tables found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
