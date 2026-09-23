"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { DemoShell, Toggle } from "./DemoShell";

type Tab = "console" | "players" | "plugins";

const PLAYERS_POOL = ["Steve", "Alex", "Notch", "Enderman", "Creeper", "Zombie", "Herobrine"];

export function MinecraftDemo() {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("console");
  const [tps, setTps] = useState(19.8);
  const [ram, setRam] = useState(58);
  const [cpu, setCpu] = useState(34);
  const [players, setPlayers] = useState(
    PLAYERS_POOL.slice(0, 4).map((n) => ({ name: n, ping: 20 + Math.floor(Math.random() * 40) })),
  );
  const [plugins, setPlugins] = useState([
    { name: "EssentialsX", on: true },
    { name: "LuckPerms", on: true },
    { name: "WorldEdit", on: false },
    { name: "Vault", on: true },
  ]);
  const [console, setConsole] = useState<string[]>([
    "[INFO] Server started on port 25565",
    "[INFO] Loaded 4 plugins",
    "[INFO] World 'world' loaded (seed: -428…)",
  ]);
  const [cmd, setCmd] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  // Live-updating stats (paused for reduced motion).
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setTps((v) => clamp(v + rand(-0.3, 0.3), 17.5, 20));
      setRam((v) => Math.round(clamp(v + rand(-3, 3), 40, 82)));
      setCpu((v) => Math.round(clamp(v + rand(-6, 6), 12, 78)));
      setPlayers((ps) => ps.map((p) => ({ ...p, ping: clamp(p.ping + rand(-6, 6), 8, 120) | 0 })));
    }, 1600);
    return () => window.clearInterval(id);
  }, [reduced]);

  const runCmd = (raw: string) => {
    const c = raw.trim();
    if (!c) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let out = `[${time}] > ${c}`;
    let extra: string | null = null;
    if (c === "list") extra = `[INFO] ${players.length} players online: ${players.map((p) => p.name).join(", ")}`;
    else if (c.startsWith("say ")) extra = `[Server] ${c.slice(4)}`;
    else if (c === "tps") extra = `[INFO] TPS: ${tps.toFixed(1)}`;
    else if (c === "stop") extra = "[INFO] Stopping the server… (demo — no real server)";
    else extra = `[INFO] Unknown command. Try: list, say <msg>, tps`;
    setConsole((l) => [...l, out, extra as string].slice(-40));
    setCmd("");
    // keep the log scrolled to bottom
    requestAnimationFrame(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    });
  };

  const stats = [
    { label: "TPS", value: tps.toFixed(1), max: 20, num: tps, good: tps >= 19 },
    { label: "RAM %", value: `${ram}`, max: 100, num: ram, good: ram < 75 },
    { label: "CPU %", value: `${cpu}`, max: 100, num: cpu, good: cpu < 70 },
  ];

  return (
    <DemoShell>
      {/* status row */}
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-emerald/25 bg-emerald/[0.08] p-3">
          <p className="flex items-center gap-1.5 font-display text-sm font-semibold text-emerald-soft">
            <span className="h-2 w-2 rounded-full bg-emerald" /> Online
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
            {players.length} / 20 players
          </p>
        </div>
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-bone/[0.08] bg-white/[0.02] p-3">
            <p className={`font-display text-lg font-semibold ${s.good ? "text-bone" : "text-accent-soft"}`}>
              {s.value}
            </p>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${s.good ? "bg-emerald/70" : "bg-accent"}`}
                style={{ width: `${(s.num / s.max) * 100}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-bone-faint">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto rounded-xl border border-bone/[0.08] bg-white/[0.02] p-1.5">
        {(["console", "players", "plugins"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-current={tab === t}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] capitalize transition-colors ${
              tab === t ? "bg-accent/[0.12] text-accent-soft" : "text-bone-muted hover:text-bone"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "console" && (
        <div>
          <div
            ref={logRef}
            className="scroll-subtle h-40 overflow-y-auto rounded-xl border border-bone/[0.08] bg-ink-950/60 p-3 font-mono text-[11.5px] leading-relaxed text-bone-muted"
          >
            {console.map((line, i) => (
              <p key={i} className={line.includes("> ") ? "text-accent-soft" : ""}>
                {line}
              </p>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runCmd(cmd);
            }}
            className="mt-2 flex gap-2"
          >
            <input
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              placeholder="Type a command (try: list, tps, say hi)"
              className="flex-1 rounded-lg border border-bone/[0.1] bg-ink-950/60 px-3 py-2 font-mono text-[12px] text-bone placeholder:text-bone-faint focus:border-accent/40 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg border border-bone/[0.12] bg-white/[0.03] px-3 py-2 text-[13px] text-bone transition-colors hover:border-accent/40 hover:text-accent-soft"
            >
              Run
            </button>
          </form>
        </div>
      )}

      {tab === "players" && (
        <div className="space-y-1.5">
          {players.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-emerald" />
              <span className="text-[13px] text-bone">{p.name}</span>
              <span className="ml-auto font-mono text-[11px] text-bone-faint">{p.ping}ms</span>
              <button
                onClick={() => setPlayers((ps) => ps.filter((x) => x.name !== p.name))}
                className="rounded-md border border-bone/[0.12] px-2 py-0.5 text-[11px] text-bone-muted transition-colors hover:border-[#ff5f56]/50 hover:text-[#ff8f86]"
              >
                Kick
              </button>
            </div>
          ))}
          {players.length < PLAYERS_POOL.length && (
            <button
              onClick={() =>
                setPlayers((ps) => {
                  const avail = PLAYERS_POOL.find((n) => !ps.some((p) => p.name === n));
                  return avail ? [...ps, { name: avail, ping: 20 + Math.floor(Math.random() * 40) }] : ps;
                })
              }
              className="mt-1 w-full rounded-lg border border-dashed border-bone/[0.15] px-3 py-2 text-[12px] text-bone-faint transition-colors hover:border-accent/40 hover:text-accent-soft"
            >
              + Simulate a player joining
            </button>
          )}
        </div>
      )}

      {tab === "plugins" && (
        <div className="space-y-2">
          {plugins.map((pl, i) => (
            <div
              key={pl.name}
              className="flex items-center justify-between rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2.5"
            >
              <span className="text-[13px] text-bone">{pl.name}</span>
              <Toggle
                on={pl.on}
                label={pl.name}
                onChange={(v) =>
                  setPlugins((list) => list.map((x, j) => (j === i ? { ...x, on: v } : x)))
                }
              />
            </div>
          ))}
        </div>
      )}
    </DemoShell>
  );
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
