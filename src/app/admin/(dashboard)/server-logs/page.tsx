"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, StatCard, LoadingBlock, ErrorBlock, EmptyBlock, StatusPill } from "@/components/admin/ui";

interface Log { id: string; timestamp: string; actor: string; event: string; category: string; status: string; details: string }
interface Health { overall: string; checks: { name: string; status: string; detail: string; latencyMs?: number }[] }

export default function ServerLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [sys, h] = await Promise.all([
        fetch("/api/admin/audit-logs?category=System&limit=50").then((r) => r.json()),
        fetch("/api/admin/health").then((r) => r.json()),
      ]);
      if (sys.success) setLogs(sys.logs ?? []);
      else setError(sys.error || "Failed to load system logs.");
      if (h.success) setHealth(h);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Server Logs</h2>
          <p className="mt-0.5 text-xs text-[#8b8797]">Runtime subsystem status and recent system events.</p>
        </div>
        <div className="flex items-center gap-2">
          {health && <StatusPill status={health.overall} />}
          <button onClick={load} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-[#c9c5d6] hover:bg-white/5">Refresh</button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading server logs..." />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : (
        <>
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Subsystem Status</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(health?.checks ?? []).map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-medium text-white">{c.name}</div>
                    <div className="truncate text-[10px] text-[#8b8797]">{c.detail}{typeof c.latencyMs === "number" ? ` · ${c.latencyMs}ms` : ""}</div>
                  </div>
                  <StatusPill status={c.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="border-b border-white/[0.06] px-4 py-3 text-sm font-semibold text-white">Recent System Events</div>
            {logs.length === 0 ? (
              <EmptyBlock title="No system events recorded yet." />
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {logs.map((l) => (
                  <div key={l.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-white">{l.event}</div>
                      {l.details && <div className="line-clamp-1 text-[10px] text-[#6f6c7d]">{l.details}</div>}
                      <div className="text-[10px] text-[#8b8797]">{new Date(l.timestamp + "Z").toLocaleString()}</div>
                    </div>
                    <StatusPill status={l.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
