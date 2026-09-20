"use client";

import { useState } from "react";

/** Dependency-free SVG charts for the admin dashboard. */

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const h = 150;
  return (
    <div>
      <div className="flex items-end justify-between gap-2" style={{ height: h }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * (h - 8);
          return (
            <div
              key={i}
              className="group relative flex flex-1 cursor-pointer flex-col items-center justify-end"
              style={{ height: h }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((p) => (p === i ? null : i))}
            >
              {hover === i && (
                <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-[#ec4899]/25 bg-[#15101c] px-2.5 py-1.5 text-center shadow-xl">
                  <div className="text-[11px] font-bold text-white">{d.value} events</div>
                  <div className="text-[9px] text-[#8b8797]">{d.label}</div>
                </div>
              )}
              <div
                className="w-full max-w-[26px] rounded-md bg-gradient-to-t from-[#ec4899] to-[#f472b6] transition-opacity"
                style={{ height: Math.max(barH, 3), opacity: hover === null || hover === i ? 1 : 0.4 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[9px] text-[#8b8797]">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

const DONUT_PALETTE = ["#ec4899", "#a855f7", "#f472b6", "#d946ef", "#fb7185", "#22d3ee", "#34d399", "#fbbf24", "#8b8797"];

export function DonutChart({ data, total }: { data: { label: string; value: number }[]; total: number }) {
  const r = 52, sw = 16, c = 2 * Math.PI * r, size = 140;
  const safeTotal = total || 1;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1522" strokeWidth={sw} />
          {data.map((d, i) => {
            const frac = d.value / safeTotal;
            const dash = frac * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={DONUT_PALETTE[i % DONUT_PALETTE.length]}
                strokeWidth={sw}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{total}</span>
          <span className="text-[9px] uppercase tracking-wide text-[#8b8797]">Total Events</span>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {data.length === 0 && <p className="text-xs text-[#6f6c7d]">No events recorded yet.</p>}
        {data.slice(0, 8).map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-[11px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: DONUT_PALETTE[i % DONUT_PALETTE.length] }} />
            <span className="flex-1 truncate text-[#a5a1b3]">{d.label}</span>
            <span className="font-semibold text-white">{d.value}</span>
            <span className="w-9 text-right text-[#6f6c7d]">{Math.round((d.value / safeTotal) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
