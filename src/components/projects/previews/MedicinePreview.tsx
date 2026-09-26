// A static, mockup mobile dashboard for the Medicine App. This is a UI PREVIEW
// only — the values are illustrative, not live data.
const today = [
  { name: "Metformin", time: "08:00", dose: "500 mg", taken: true },
  { name: "Vitamin D", time: "09:00", dose: "1 tablet", taken: true },
  { name: "Amoxicillin", time: "14:00", dose: "250 mg", taken: false, next: true },
  { name: "Atorvastatin", time: "21:00", dose: "10 mg", taken: false },
];

export function MedicinePreview({ className = "" }: { className?: string }) {
  const takenCount = today.filter((m) => m.taken).length;
  const pct = Math.round((takenCount / today.length) * 100);

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-bone/[0.1] bg-[#0c1418] ${className}`}
      role="img"
      aria-label="UI preview of the Medicine App dashboard"
    >
      {/* status bar */}
      <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-bone-faint">
        <span>9:41</span>
        <span className="h-1 w-16 rounded-full bg-white/[0.15]" />
      </div>

      <div className="p-5">
        {/* greeting + progress ring */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-bone-faint">Today</p>
            <p className="font-display text-lg font-semibold text-bone">Your medicines</p>
          </div>
          <div className="relative h-14 w-14">
            <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#22b8cf"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-bone">
              {pct}%
            </span>
          </div>
        </div>

        {/* upcoming reminder */}
        <div className="mt-4 rounded-2xl border border-[#22b8cf]/25 bg-[#22b8cf]/[0.08] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7fe0ec]">
            Next reminder
          </p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-bone">Amoxicillin · 250 mg</p>
              <p className="text-[11px] text-bone-muted">Today at 14:00</p>
            </div>
            <span className="rounded-lg bg-[#22b8cf] px-2.5 py-1 text-[11px] font-medium text-[#0c1418]">
              Take
            </span>
          </div>
        </div>

        {/* schedule list */}
        <p className="mt-4 mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-bone-faint">
          Schedule
        </p>
        <div className="space-y-1.5">
          {today.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                  m.taken
                    ? "bg-emerald/20 text-emerald-soft"
                    : m.next
                      ? "bg-[#22b8cf]/20 text-[#7fe0ec]"
                      : "bg-white/[0.05] text-bone-faint"
                }`}
              >
                {m.taken ? "✓" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] text-bone">{m.name}</p>
                <p className="text-[10px] text-bone-faint">{m.dose}</p>
              </div>
              <span className="font-mono text-[11px] text-bone-muted">{m.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* preview label */}
      <span className="absolute right-3 top-8 rounded-full border border-white/[0.12] bg-black/40 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-bone-faint backdrop-blur">
        UI preview
      </span>
    </div>
  );
}
