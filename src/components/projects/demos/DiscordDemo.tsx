"use client";

import { useState } from "react";
import { DemoShell, Toggle } from "./DemoShell";

type Tab = "overview" | "moderation" | "leaderboard" | "automod" | "logs" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "moderation", label: "Moderation" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "automod", label: "Automod" },
  { id: "logs", label: "Logs" },
  { id: "settings", label: "Settings" },
];

const STATS = [
  { label: "Members", value: "4,812" },
  { label: "Online", value: "731" },
  { label: "Messages / day", value: "18.4k" },
  { label: "Warnings", value: "27" },
];

const LEADERBOARD = [
  { name: "nova", xp: 48210, level: 42 },
  { name: "kai", xp: 39980, level: 38 },
  { name: "mira", xp: 31245, level: 33 },
  { name: "hex", xp: 28870, level: 31 },
  { name: "juno", xp: 21100, level: 26 },
  { name: "wren", xp: 17640, level: 23 },
];

const MEMBERS = [
  { name: "nova", role: "Admin", status: "online" },
  { name: "kai", role: "Mod", status: "online" },
  { name: "mira", role: "Member", status: "idle" },
  { name: "hex", role: "Member", status: "dnd" },
  { name: "juno", role: "Member", status: "offline" },
];

const statusDot: Record<string, string> = {
  online: "bg-emerald",
  idle: "bg-accent",
  dnd: "bg-[#ff5f56]",
  offline: "bg-bone-faint",
};

export function DiscordDemo() {
  const [tab, setTab] = useState<Tab>("overview");
  const [logs, setLogs] = useState<string[]>([
    "[12:04] nova banned spammer_01 — reason: raid",
    "[12:01] automod deleted message from guest_88 (invite link)",
    "[11:58] kai muted troll_x for 10m",
  ]);
  const [automod, setAutomod] = useState({ spam: true, links: true, words: false, caps: false });
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const addLog = (line: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((l) => [`[${time}] ${line}`, ...l].slice(0, 12));
  };

  const filteredMembers = MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <DemoShell>
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Sidebar / scrollable tabs on mobile */}
        <nav
          aria-label="Dashboard sections"
          className="flex shrink-0 gap-1.5 overflow-x-auto rounded-xl border border-bone/[0.08] bg-white/[0.02] p-1.5 sm:w-40 sm:flex-col sm:overflow-visible"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id}
              className={`shrink-0 rounded-lg px-3 py-2 text-left text-[13px] transition-colors sm:w-full ${
                tab === t.id
                  ? "bg-accent/[0.12] text-accent-soft"
                  : "text-bone-muted hover:bg-white/[0.03] hover:text-bone"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="min-h-[280px] flex-1 rounded-xl border border-bone/[0.08] bg-ink-950/40 p-4">
          {tab === "overview" && (
            <div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-bone/[0.08] bg-white/[0.02] p-3"
                  >
                    <p className="font-display text-xl font-semibold text-bone">{s.value}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
                  Members
                </p>
                <div className="space-y-1.5">
                  {MEMBERS.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-2.5 rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2"
                    >
                      <span className={`h-2 w-2 rounded-full ${statusDot[m.status]}`} />
                      <span className="text-[13px] text-bone">{m.name}</span>
                      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-bone-faint">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "moderation" && (
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {["Warn", "Mute", "Kick", "Ban"].map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      addLog(`${action.toLowerCase()} action issued on selected user`);
                      notify(`${action} applied (demo)`);
                    }}
                    className="rounded-lg border border-bone/[0.12] bg-white/[0.03] px-3 py-1.5 text-[13px] text-bone transition-colors hover:border-accent/40 hover:text-accent-soft"
                  >
                    {action}
                  </button>
                ))}
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users…"
                className="mb-3 w-full rounded-lg border border-bone/[0.1] bg-ink-950/60 px-3 py-2 text-[13px] text-bone placeholder:text-bone-faint focus:border-accent/40 focus:outline-none"
              />
              <div className="space-y-1.5">
                {filteredMembers.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center gap-2.5 rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2"
                  >
                    <span className={`h-2 w-2 rounded-full ${statusDot[m.status]}`} />
                    <span className="text-[13px] text-bone">{m.name}</span>
                    <button
                      onClick={() => {
                        addLog(`warned ${m.name}`);
                        notify(`Warned ${m.name} (demo)`);
                      }}
                      className="ml-auto rounded-md border border-bone/[0.12] px-2 py-0.5 text-[11px] text-bone-muted transition-colors hover:border-accent/40 hover:text-accent-soft"
                    >
                      Warn
                    </button>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <p className="text-[13px] text-bone-faint">No users match “{query}”.</p>
                )}
              </div>
            </div>
          )}

          {tab === "leaderboard" && (
            <div className="space-y-1.5">
              {LEADERBOARD.map((u, i) => (
                <div
                  key={u.name}
                  className="flex items-center gap-3 rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2"
                >
                  <span className="w-5 font-mono text-[12px] text-accent-soft">#{i + 1}</span>
                  <span className="text-[13px] text-bone">{u.name}</span>
                  <span className="ml-auto font-mono text-[11px] text-bone-muted">
                    Lv {u.level}
                  </span>
                  <div className="hidden w-28 sm:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent"
                        style={{ width: `${(u.xp / LEADERBOARD[0].xp) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right font-mono text-[11px] text-bone-faint">
                    {(u.xp / 1000).toFixed(1)}k
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "automod" && (
            <div className="space-y-2">
              {(
                [
                  ["spam", "Spam filter"],
                  ["links", "Block invite links"],
                  ["words", "Banned words"],
                  ["caps", "Excessive caps"],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="text-[13px] text-bone">{label}</span>
                  <Toggle
                    on={automod[key]}
                    label={label}
                    onChange={(v) => {
                      setAutomod((a) => ({ ...a, [key]: v }));
                      addLog(`automod: ${label} ${v ? "enabled" : "disabled"}`);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {tab === "logs" && (
            <div className="space-y-1 font-mono text-[11.5px] leading-relaxed">
              {logs.map((line, i) => (
                <p key={i} className="text-bone-muted">
                  {line}
                </p>
              ))}
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-2">
              {["Welcome messages", "Level-up announcements", "Auto-role on join"].map((s, i) => (
                <div
                  key={s}
                  className="flex items-center justify-between rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="text-[13px] text-bone">{s}</span>
                  <Toggle
                    on={i !== 2}
                    label={s}
                    onChange={() => notify(`${s} updated (demo)`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="pointer-events-none mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/[0.1] px-3 py-1.5 text-[12px] text-accent-soft">
          {toast}
        </div>
      )}
    </DemoShell>
  );
}
