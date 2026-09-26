"use client";

import { useEffect, useRef, useState } from "react";

// A LIVE, interactive WhatsApp-style chat. Every message is sent to
// /api/whatsapp-ai/chat, which calls Google Gemini server-side. There are NO
// static per-message replies: on failure we show an error bubble + Retry.

type Msg = { from: "user" | "ai"; text: string };

const GREETING: Msg = {
  from: "ai",
  text: "Hey! 👋 I'm the AI assistant for this WhatsApp AI project. Ask me anything about it — or just chat.",
};

// These are PROMPTS only — clicking one sends that text to Gemini. There is no
// hardcoded answer associated with any of them.
const SUGGESTIONS = [
  "How does it work?",
  "Why is it useful for businesses?",
  "Can businesses use their own number?",
  "What technologies did you use?",
];

const ERROR_TEXT = "I'm having trouble connecting to the AI right now. Please try again.";

export function WhatsAppChat({
  className = "",
  heightClass = "h-[440px]",
}: {
  className?: string;
  heightClass?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  // The last user message, kept so Retry can resend it.
  const lastSentRef = useRef<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the newest message / typing indicator.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, errored]);

  // Core send. `history` is the message list to base context on; `userText`
  // (when provided) is appended as a new user turn. For Retry we reuse the
  // existing history (the failed user turn is already in it).
  const requestReply = async (history: Msg[]) => {
    setLoading(true);
    setErrored(false);
    try {
      const res = await fetch("/api/whatsapp-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
      if (!reply) throw new Error("empty reply");
      setMessages((m) => [...m, { from: "ai", text: reply }]);
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return; // prevent duplicate/concurrent requests
    lastSentRef.current = trimmed;
    const next: Msg[] = [...messages, { from: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    void requestReply(next);
  };

  const retry = () => {
    if (loading) return;
    // Resend based on the current history (the last user message is still there).
    void requestReply(messages);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = send, Shift+Enter = newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div
      className={`relative flex ${heightClass} flex-col overflow-hidden rounded-2xl border border-bone/[0.1] bg-[#0b141a] ${className}`}
    >
      {/* header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#111b21] px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/20 text-sm text-[#25D366]">
          AI
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-bone">WhatsApp AI</p>
          <p className="flex items-center gap-1 text-[10px] text-emerald-soft">
            {loading ? (
              "typing…"
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Online
              </>
            )}
          </p>
        </div>
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
              className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed ${
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

        {errored && !loading && (
          <div className="flex justify-start">
            <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-[#ff5f56]/30 bg-[#ff5f56]/[0.08] px-3 py-2.5">
              <p className="text-[12.5px] leading-relaxed text-[#ff9f99]">{ERROR_TEXT}</p>
              <button
                onClick={retry}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#ff5f56]/40 px-3 py-1 text-[11px] font-medium text-[#ff9f99] transition-colors hover:bg-[#ff5f56]/[0.14]"
              >
                ↻ Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* quick prompts — horizontally scrollable, always available */}
      <div className="scroll-subtle flex gap-1.5 overflow-x-auto border-t border-white/[0.06] bg-[#0b141a] px-3 py-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={loading}
            className="shrink-0 whitespace-nowrap rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 text-[11px] text-bone-muted transition-colors hover:border-[#25D366]/40 hover:text-bone disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t border-white/[0.06] bg-[#111b21] px-3 py-2.5"
      >
        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={2000}
          placeholder="Type a message…  (Enter to send, Shift+Enter for a new line)"
          aria-label="Message"
          className="scroll-subtle max-h-24 flex-1 resize-none rounded-2xl bg-[#202c33] px-3.5 py-2 text-[12.5px] leading-relaxed text-bone placeholder:text-bone-faint focus:outline-none focus:ring-1 focus:ring-[#25D366]/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-[#0b141a] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          →
        </button>
      </form>

      {/* label */}
      <span className="pointer-events-none absolute right-2 top-2 rounded-full border border-white/[0.12] bg-black/40 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-bone-faint backdrop-blur">
        Interactive
      </span>
    </div>
  );
}
