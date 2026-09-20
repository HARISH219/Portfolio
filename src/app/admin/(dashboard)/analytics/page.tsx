"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, StatCard, LoadingBlock, ErrorBlock, EmptyBlock } from "@/components/admin/ui";
import { BarChart } from "@/components/admin/charts";

interface Analytics {
  demoMode: boolean; visitors: number; unique: number; pageViews: number;
  topPages: { label: string; value: number }[]; referrers: { label: string; value: number }[];
  devices: { label: string; value: number }[]; browsers: { label: string; value: number }[];
  series: { date: string; value: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Analytics</h2>
          <p className="mt-0.5 text-xs text-[#8b8797]">Visitor and page view data from your portfolio.{data?.demoMode ? " (no data tracked yet)" : ""}</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-[#c9c5d6] outline-none focus:border-[#ec4899]/50">
          <option value={7} className="bg-[#0d0b12]">Last 7 days</option>
          <option value={30} className="bg-[#0d0b12]">Last 30 days</option>
          <option value={90} className="bg-[#0d0b12]">Last 90 days</option>
        </select>
      </div>

      {data?.demoMode && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">
          No analytics data tracked yet. Add <code className="font-mono text-amber-200">&lt;TrackingBeacon /&gt;</code> to your public layout or hit <code className="font-mono text-amber-200">POST /api/track</code> to start recording.
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading analytics..." />
      ) : !data ? (
        <ErrorBlock message="Unable to load analytics." onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Visitors" value={data.visitors} sub={`last ${days}d`} accent="#ec4899" />
            <StatCard label="Unique Visitors" value={data.unique} sub={`last ${days}d`} accent="#a855f7" />
            <StatCard label="Total Page Views" value={data.pageViews} sub="all-time" accent="#f472b6" />
          </div>

          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Visitors — last {days} days</h3>
            {data.series.some((s) => s.value > 0) ? (
              <BarChart data={data.series.map((s) => ({ label: new Date(s.date + "T00:00:00").toLocaleDateString([], { day: "numeric", month: "short" }), value: s.value }))} />
            ) : (
              <EmptyBlock title="No visits recorded yet." />
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ListCard title="Top Pages" items={data.topPages} />
            <ListCard title="Referrers" items={data.referrers} />
            <ListCard title="Devices" items={data.devices} />
            <ListCard title="Browsers" items={data.browsers} />
          </div>
        </>
      )}
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  return (
    <Card className="p-4">
      <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-[#6f6c7d]">No data yet.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((i) => (
            <div key={i.label} className="flex items-center justify-between text-[12px]">
              <span className="truncate text-[#a5a1b3]">{i.label}</span>
              <span className="shrink-0 font-semibold text-white">{i.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
