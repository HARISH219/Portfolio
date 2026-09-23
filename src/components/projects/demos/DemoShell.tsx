"use client";

import type { ReactNode } from "react";

// A consistent frame around every interactive demo. Shows the "DEMO MODE"
// label so we never imply a live backend connection.
export function DemoShell({
  label = "Demo Mode — data shown here is simulated.",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-bone/[0.08] bg-white/[0.02] px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/[0.08] px-2.5 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent-soft">
            Interactive Demo
          </span>
        </span>
        <span className="truncate text-[11px] text-bone-faint">{label}</span>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

// Small controlled toggle used across demos.
export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
        on ? "border-accent/50 bg-accent/30" : "border-bone/[0.15] bg-white/[0.04]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-bone transition-transform duration-300 ${
          on ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
