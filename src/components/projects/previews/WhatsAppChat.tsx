"use client";

import { useEffect, useRef, useState } from "react";

// A LIVE, interactive WhatsApp-style chat. Posts the conversation to
// /api/whatsapp-ai/chat which proxies Google Gemini server-side. Falls back to
// a labeled demo reply if no API key is configured.

type Msg = { from: "user" | "ai"; text: string };

const GREETING: Msg = {
  from: "ai",
  text: "Hey! 👋 I'm WhatsApp AI, built by Harish. Ask me anything — English, हिंदी, ya Hinglish, sab chalega!",
};

const SUGGESTIONS = [
  "Who built this?",
  "Show me Harish's work",
  "How do I contact Harish?",
];

export function WhatsAppChat({ className = "" }: { className?: string }) {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: Msg[] = [...messages, { from: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/whatsapp-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send recent history so replies stay contextual.
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await res.json();
      if (data?.fallback) setDemoMode(true);
      const reply: string =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply
          : "Sorry, I couldn't reply just now — try again?";
      setMessages((m) => [...m, { from: "ai", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "ai", text: "Network hiccup — please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative flex h-[440px] flex-col overflow-hidden rounded-2xl border border-bone/[0.1] bg-[#0b141a] ${className}`}
    >
      {/* header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#111b21] px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/20 text-sm text-[#25D366]">
          AI
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-bone">WhatsApp AI</p>
          <p className="text-[10px] text-emerald-soft">{loading ? "typing…" : "online"}</p>
        </div>
        <span className="ml-auto rounded-full border border-[#25D366]/25 bg-[#25D366]/[0.08] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-[#5fe08a]">
          {demoMode ? "Demo mode" : "Live"}
        </span>
      </div>

      {/* chat body */}
      <div
        ref={bodyRef}
        className="scroll-subtle flex-1 space-y-2 overflow-y-auto p-4"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[12.5px] leading-snug ${
                m.from === "user"
                  ? "rounded-br-sm bg-[#005c4b] text-bone"
                  : "rounded-bl-sm bg-[#202c33] text-bone"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#202c33] px-3 py-2.5">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-bone-faint" />
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-bone-faint [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-bone-faint [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {/* quick suggestions (only before the first user message) */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 text-[11px] text-bone-muted transition-colors hover:border-[#25D366]/40 hover:text-bone"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-white/[0.06] bg-[#111b21] px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Type a message…"
          aria-label="Message"
          className="flex-1 rounded-full bg-[#202c33] px-3.5 py-2 text-[12.5px] text-bone placeholder:text-bone-faint focus:outline-none focus:ring-1 focus:ring-[#25D366]/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send message"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-[#0b141a] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          →
        </button>
      </form>

      {/* interactive label */}
      <span className="pointer-events-none absolute right-2 top-2 rounded-full border border-white/[0.12] bg-black/40 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-bone-faint backdrop-blur">
        Interactive
      </span>
    </div>
  );
}
