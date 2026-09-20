"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, StatCard, LoadingBlock, ErrorBlock, EmptyBlock, StatusPill } from "@/components/admin/ui";

interface Log { id: string; timestamp: string; actor: string; event: string; category: string; status: string; details: string; ip: string }

export default function SecurityPage() {
  const [securityLogs, setSecurityLogs] = useState<Log[]>([]);
  const [authLogs, setAuthLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [sec, auth] = await Promise.all([
        fetch("/api/admin/audit-logs?category=Security&limit=50").then((r) => r.json()),
        fetch("/api/admin/audit-logs?category=Authentication&limit=50").then((r) => r.json()),
      ]);
      if (sec.success) setSecurityLogs(sec.logs ?? []);
      if (auth.success) setAuthLogs(auth.logs ?? []);
      if (!sec.success && !auth.success) setError("Failed to load security events.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const failedLogins = authLogs.filter((l) => l.status === "Failed").length + securityLogs.filter((l) => l.event.toLowerCase().includes("failed login")).length;
  const rateLimited = securityLogs.filter((l) => l.event.toLowerCase().includes("rate")).length;
  const successfulLogins = authLogs.filter((l) => l.event === "Admin login").length;

  const overall = failedLogins > 5 ? "Warning" : "Operational";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Security</h2>
          <p className="mt-0.5 text-xs text-[#8b8797]">Authentication activity, failed attempts, and security events.</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={overall} />
          <button onClick={load} className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-[#c9c5d6] hover:bg-white/5">Refresh</button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading security events..." />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Failed Logins" value={failedLogins} sub="recent" accent={failedLogins > 0 ? "#fb7185" : "#34d399"} />
            <StatCard label="Rate-Limit Events" value={rateLimited} sub="recent" accent={rateLimited > 0 ? "#fbbf24" : "#34d399"} />
            <StatCard label="Successful Logins" value={successfulLogins} sub="recent" accent="#34d399" />
            <StatCard label="Security Events" value={securityLogs.length} sub="logged" accent="#a855f7" />
          </div>

          <Card>
            <div className="border-b border-white/[0.06] px-4 py-3 text-sm font-semibold text-white">Security Events</div>
            {securityLogs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#6f6c7d]">No security events recorded. That&apos;s a good thing.</div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {securityLogs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-white">{l.event}</div>
                      <div className="truncate text-[10px] text-[#8b8797]">{l.actor} · {l.ip || "unknown IP"} · {new Date(l.timestamp + "Z").toLocaleString()}</div>
                    </div>
                    <StatusPill status={l.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="border-b border-white/[0.06] px-4 py-3 text-sm font-semibold text-white">Authentication Activity</div>
            {authLogs.length === 0 ? (
              <EmptyBlock title="No authentication events yet." />
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {authLogs.slice(0, 20).map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-white">{l.event}</div>
                      <div className="truncate text-[10px] text-[#8b8797]">{l.actor} · {l.ip || "unknown IP"} · {new Date(l.timestamp + "Z").toLocaleString()}</div>
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
