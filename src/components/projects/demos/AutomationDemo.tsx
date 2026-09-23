"use client";

import { useState } from "react";
import { DemoShell, Toggle } from "./DemoShell";

type Run = { id: number; name: string; status: "completed" | "failed" | "running"; time: string };
type Automation = { id: number; name: string; trigger: string; on: boolean };

let runId = 100;

const INITIAL: Automation[] = [
  { id: 1, name: "Daily backup", trigger: "Every day 02:00", on: true },
  { id: 2, name: "Sync spreadsheet", trigger: "On webhook", on: true },
  { id: 3, name: "Cleanup temp files", trigger: "Every 6h", on: false },
];

const INITIAL_RUNS: Run[] = [
  { id: 91, name: "Daily backup", status: "completed", time: "02:00" },
  { id: 92, name: "Sync spreadsheet", status: "completed", time: "09:14" },
  { id: 93, name: "Cleanup temp files", status: "failed", time: "12:00" },
];

type Filter = "all" | "completed" | "failed" | "running";

export function AutomationDemo() {
  const [autos, setAutos] = useState<Automation[]>(INITIAL);
  const [runs, setRuns] = useState<Run[]>(INITIAL_RUNS);
  const [filter, setFilter] = useState<Filter>("all");
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("Manual");
  const [logs, setLogs] = useState<string[]>([]);

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const run = (a: Automation) => {
    const id = ++runId;
    const newRun: Run = { id, name: a.name, status: "running", time: now() };
    setRuns((r) => [newRun, ...r].slice(0, 20));
    setLogs((l) => [`[${now()}] ▶ ${a.name} started`, ...l].slice(0, 12));
    // Resolve to completed/failed after a short delay (simulated).
    window.setTimeout(() => {
      const ok = Math.random() > 0.2;
      setRuns((r) =>
        r.map((x) => (x.id === id ? { ...x, status: ok ? "completed" : "failed" } : x)),
      );
      setLogs((l) =>
        [`[${now()}] ${ok ? "✓" : "✗"} ${a.name} ${ok ? "completed" : "failed"}`, ...l].slice(0, 12),
      );
    }, 1200);
  };

  const create = () => {
    if (!name.trim()) return;
    setAutos((a) => [...a, { id: Date.now(), name: name.trim(), trigger, on: true }]);
    setLogs((l) => [`[${now()}] + created "${name.trim()}"`, ...l].slice(0, 12));
    setName("");
  };

  const counts = {
    running: runs.filter((r) => r.status === "running").length,
    completed: runs.filter((r) => r.status === "completed").length,
    failed: runs.filter((r) => r.status === "failed").length,
  };
  const filtered = filter === "all" ? runs : runs.filter((r) => r.status === filter);

  const statusColor: Record<Run["status"], string> = {
    completed: "text-emerald-soft",
    failed: "text-[#ff8f86]",
    running: "text-accent-soft",
  };

  return (
    <DemoShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* left: automations + create */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
            Automations
          </p>
          <div className="space-y-1.5">
            {autos.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-bone">{a.name}</p>
                  <p className="font-mono text-[10px] text-bone-faint">{a.trigger}</p>
                </div>
                <button
                  onClick={() => run(a)}
                  disabled={!a.on}
                  className="rounded-md border border-bone/[0.12] px-2 py-1 text-[11px] text-bone-muted transition-colors hover:border-accent/40 hover:text-accent-soft disabled:opacity-40"
                >
                  Run
                </button>
                <Toggle
                  on={a.on}
                  label={`Enable ${a.name}`}
                  onChange={(v) =>
                    setAutos((list) => list.map((x, j) => (j === i ? { ...x, on: v } : x)))
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-bone/[0.08] bg-white/[0.02] p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
              New automation
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name…"
                className="flex-1 rounded-lg border border-bone/[0.1] bg-ink-950/60 px-3 py-2 text-[13px] text-bone placeholder:text-bone-faint focus:border-accent/40 focus:outline-none"
              />
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="rounded-lg border border-bone/[0.1] bg-ink-950/60 px-3 py-2 text-[13px] text-bone focus:border-accent/40 focus:outline-none"
              >
                <option>Manual</option>
                <option>Every 6h</option>
                <option>Daily 02:00</option>
                <option>On webhook</option>
              </select>
              <button
                onClick={create}
                disabled={!name.trim()}
                className="rounded-lg bg-bone px-4 py-2 text-[13px] font-medium text-ink-950 transition-colors hover:bg-accent-soft disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* right: runs + history */}
        <div>
          <div className="mb-2 grid grid-cols-3 gap-2">
            {(
              [
                ["running", counts.running, "text-accent-soft"],
                ["completed", counts.completed, "text-emerald-soft"],
                ["failed", counts.failed, "text-[#ff8f86]"],
              ] as const
            ).map(([label, val, color]) => (
              <div key={label} className="rounded-lg border border-bone/[0.08] bg-white/[0.02] p-2.5 text-center">
                <p className={`font-display text-lg font-semibold ${color}`}>{val}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-bone-faint">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-2 flex gap-1.5">
            {(["all", "completed", "failed", "running"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-[11px] capitalize transition-colors ${
                  filter === f
                    ? "bg-accent/[0.12] text-accent-soft"
                    : "text-bone-faint hover:text-bone"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="scroll-subtle max-h-32 space-y-1 overflow-y-auto">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-1.5"
              >
                <span className="text-[12.5px] text-bone">{r.name}</span>
                <span className={`ml-auto font-mono text-[10px] uppercase tracking-[0.12em] ${statusColor[r.status]}`}>
                  {r.status}
                </span>
                <span className="font-mono text-[10px] text-bone-faint">{r.time}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="px-1 text-[12px] text-bone-faint">No {filter} runs.</p>
            )}
          </div>

          {logs.length > 0 && (
            <div className="mt-3 rounded-xl border border-bone/[0.08] bg-ink-950/60 p-3 font-mono text-[11px] leading-relaxed text-bone-muted">
              {logs.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
