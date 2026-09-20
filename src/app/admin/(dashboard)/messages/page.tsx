"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, LoadingBlock, EmptyBlock, ErrorBlock } from "@/components/admin/ui";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
}

const FILTERS = ["all", "unread", "read", "replied", "archived"] as const;

export default function MessagesPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<Message | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setItems(d.items ?? []); setDbConfigured(d.dbConfigured !== false); }
        else setError(d.error || "Failed to load messages.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, action: "status" | "delete", status?: string) {
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: action, id, status }),
    });
    const d = await res.json();
    if (d.success) { load(); if (open?.id === id && action === "delete") setOpen(null); }
    else alert(d.error || "Action failed.");
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((m) => (c[m.status] = (c[m.status] ?? 0) + 1));
    return c;
  }, [items]);

  const filtered = filter === "all" ? items : items.filter((m) => m.status === filter);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Messages</h2>
        <p className="mt-0.5 text-xs text-[#8b8797]">Contact form submissions from your portfolio.</p>
      </div>

      {!dbConfigured && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">
          Database not configured — messages are not being stored.
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium capitalize transition-colors ${
              filter === f ? "bg-[#ec4899]/15 text-[#f472b6] ring-1 ring-[#ec4899]/25" : "bg-white/[0.03] text-[#a5a1b3] hover:text-white"
            }`}
          >
            {f} <span className="opacity-60">({counts[f] ?? 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock label="Loading messages..." />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyBlock title="No messages here." hint={filter === "all" ? "Submissions from your contact form will appear here." : `No ${filter} messages.`} />
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <Card key={m.id} className={`p-4 ${m.status === "unread" ? "ring-1 ring-[#ec4899]/20" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <button className="min-w-0 flex-1 text-left" onClick={() => { setOpen(m); if (m.status === "unread") act(m.id, "status", "read"); }}>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white">{m.name}</span>
                    {m.status === "unread" && <span className="h-1.5 w-1.5 rounded-full bg-[#ec4899]" />}
                    <span className="truncate text-[11px] text-[#8b8797]">{m.email}</span>
                  </div>
                  {m.subject && <div className="mt-0.5 truncate text-[12px] text-[#c9c5d6]">{m.subject}</div>}
                  <div className="mt-1 line-clamp-1 text-[11px] text-[#6f6c7d]">{m.body}</div>
                </button>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[10px] text-[#6f6c7d]">{new Date(m.created_at + "Z").toLocaleDateString()}</span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] capitalize text-[#a5a1b3]">{m.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(null)} />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0d0b12] p-5 scroll-subtle">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{open.subject || "(no subject)"}</h3>
                <p className="text-[12px] text-[#a5a1b3]">{open.name} · {open.email}</p>
                <p className="text-[10px] text-[#6f6c7d]">{new Date(open.created_at + "Z").toLocaleString()}</p>
              </div>
              <button onClick={() => setOpen(null)} className="text-[#8b8797] hover:text-white">✕</button>
            </div>
            <div className="whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-black/20 p-3 text-sm text-[#e6e3ee]">{open.body}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject || "Your message")}`} onClick={() => act(open.id, "status", "replied")} className="rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90">Reply</a>
              <button onClick={() => act(open.id, "status", open.status === "read" ? "unread" : "read")} className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-[#c9c5d6] hover:bg-white/5">Mark {open.status === "read" ? "unread" : "read"}</button>
              <button onClick={() => act(open.id, "status", "archived")} className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-[#c9c5d6] hover:bg-white/5">Archive</button>
              <button onClick={() => act(open.id, "delete")} className="rounded-lg border border-[#fb7185]/20 px-3 py-1.5 text-[11px] text-[#fb7185] hover:bg-[#fb7185]/10">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
