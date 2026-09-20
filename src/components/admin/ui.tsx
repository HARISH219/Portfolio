"use client";

import type { ReactNode } from "react";

/** Reusable pink-themed admin UI primitives. */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  trend,
  sub,
  spark,
  accent = "#ec4899",
}: {
  label: string;
  value: string | number;
  trend?: string;
  sub?: string;
  spark?: number[];
  accent?: string;
}) {
  const trendUp = trend?.trim().startsWith("+");
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-[#ec4899]/25">
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-[0.08] blur-xl" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#8b8797]">{label}</span>
        {trend && (
          <span className={`text-[10px] font-semibold ${trendUp ? "text-emerald-400" : "text-[#fb7185]"}`}>{trend}</span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 flex items-end justify-between gap-2">
        {sub && <span className="text-[10px] text-[#6f6c7d]">{sub}</span>}
        {spark && spark.length > 1 && <Sparkline data={spark} color={accent} />}
      </div>
    </div>
  );
}

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 60, h = 20;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const id = `sp-${color.replace("#", "")}`;
  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    operational: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    pass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    online: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    degraded: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    error: "border-[#fb7185]/25 bg-[#fb7185]/10 text-[#fb7185]",
    failed: "border-[#fb7185]/25 bg-[#fb7185]/10 text-[#fb7185]",
    offline: "border-[#fb7185]/25 bg-[#fb7185]/10 text-[#fb7185]",
    unknown: "border-white/10 bg-white/5 text-[#8b8797]",
  };
  const cls = map[s] || map.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#ec4899]/30 border-t-[#ec4899]" />
      <p className="text-sm text-[#8b8797]">{label}</p>
    </div>
  );
}

export function EmptyBlock({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] py-14 text-center">
      <p className="text-sm text-[#c9c5d6]">{title}</p>
      {hint && <p className="mt-1 text-xs text-[#6f6c7d]">{hint}</p>}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-[#fb7185]/20 bg-[#fb7185]/[0.05] py-12 text-center">
      <p className="text-sm text-[#fb7185]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-lg bg-[#fb7185]/10 px-4 py-2 text-xs text-[#fb7185] ring-1 ring-[#fb7185]/20 hover:bg-[#fb7185]/15">
          Try again
        </button>
      )}
    </div>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-[104px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      ))}
    </div>
  );
}
