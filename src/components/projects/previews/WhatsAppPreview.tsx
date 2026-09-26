// A static, mockup WhatsApp-style conversation. This is a UI PREVIEW only — it
// illustrates the interface concept and is not a live/connected chat.
const messages: { from: "user" | "ai"; text: string }[] = [
  { from: "user", text: "Hey, what time does the pharmacy close today?" },
  { from: "ai", text: "It closes at 9 PM today. Want me to set a reminder to pick up your order before then?" },
  { from: "user", text: "Yes please, remind me at 7." },
  { from: "ai", text: "Done ✓ I'll ping you at 7 PM. Anything else?" },
];

export function WhatsAppPreview({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-bone/[0.1] bg-[#0b141a] ${className}`}
      role="img"
      aria-label="UI preview of the WhatsApp AI conversation interface"
    >
      {/* header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#111b21] px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/20 text-sm text-[#25D366]">
          AI
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-bone">WhatsApp AI</p>
          <p className="text-[10px] text-emerald-soft">online</p>
        </div>
      </div>

      {/* chat body */}
      <div
        className="space-y-2 p-4"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug ${
                m.from === "user"
                  ? "rounded-br-sm bg-[#005c4b] text-bone"
                  : "rounded-bl-sm bg-[#202c33] text-bone"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {/* typing indicator */}
        <div className="flex justify-start">
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#202c33] px-3 py-2.5">
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-bone-faint" />
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-bone-faint [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-bone-faint [animation-delay:0.4s]" />
          </div>
        </div>
      </div>

      {/* input bar */}
      <div className="flex items-center gap-2 border-t border-white/[0.06] bg-[#111b21] px-3 py-2.5">
        <div className="flex-1 rounded-full bg-[#202c33] px-3 py-1.5 text-[11px] text-bone-faint">
          Type a message…
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-[#0b141a]">
          →
        </span>
      </div>

      {/* preview label */}
      <span className="absolute right-2 top-2 rounded-full border border-white/[0.12] bg-black/40 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-bone-faint backdrop-blur">
        UI preview
      </span>
    </div>
  );
}
