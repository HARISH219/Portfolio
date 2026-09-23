"use client";

import { useState } from "react";
import { DemoShell } from "./DemoShell";

// Deterministic, on-device heuristic — no network, no real model. It scans for
// well-known scam/phishing signals and produces a transparent, explainable score.
type Signal = { id: string; label: string; weight: number; test: RegExp };

const SIGNALS: Signal[] = [
  { id: "urgency", label: "Urgency / pressure language", weight: 22, test: /\b(urgent|immediately|act now|within \d+ ?(min|hour|hrs)|expire|suspend|final notice)\b/i },
  { id: "payment", label: "Suspicious payment request", weight: 26, test: /\b(gift ?card|bitcoin|btc|wire transfer|western union|crypto|pay(pal)? me|send \$?\d+)\b/i },
  { id: "credentials", label: "Credential harvesting", weight: 26, test: /\b(verify your (account|identity)|login|password|otp|one[- ]time code|ssn|bank details|confirm your details)\b/i },
  { id: "link", label: "Suspicious / shortened link", weight: 16, test: /(bit\.ly|tinyurl|t\.co|https?:\/\/[^\s]*(login|verify|secure|account)[^\s]*)/i },
  { id: "prize", label: "Prize / lottery bait", weight: 18, test: /\b(you(?:'ve| have) won|congratulations|claim your (prize|reward)|lucky winner|free (gift|money))\b/i },
  { id: "impersonation", label: "Authority impersonation", weight: 14, test: /\b(irs|hmrc|bank|paypal|amazon|microsoft|apple support|government|customs)\b/i },
];

const SAMPLES = [
  "URGENT: Your account will be suspended. Verify your identity now at http://secure-login-verify.bit.ly/xy to avoid closure.",
  "Congratulations! You've won a $1000 Amazon gift card. Claim your prize by sending a $20 processing fee via Bitcoin.",
  "Hey, are we still on for lunch tomorrow at 1pm? Let me know which place works for you.",
];

type Result = {
  score: number;
  level: "Safe" | "Suspicious" | "High Risk";
  matched: Signal[];
};

function analyze(text: string): Result {
  const matched = SIGNALS.filter((s) => s.test.test(text));
  const raw = matched.reduce((sum, s) => sum + s.weight, 0);
  const score = Math.min(100, raw);
  const level = score >= 60 ? "High Risk" : score >= 25 ? "Suspicious" : "Safe";
  return { score, level, matched };
}

const levelStyle: Record<Result["level"], string> = {
  Safe: "text-emerald-soft border-emerald/30 bg-emerald/[0.08]",
  Suspicious: "text-accent-soft border-accent/30 bg-accent/[0.08]",
  "High Risk": "text-[#ff8f86] border-[#ff5f56]/30 bg-[#ff5f56]/[0.08]",
};

export function ScamDemo() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    // Small delay to show the loading state (still fully local/deterministic).
    window.setTimeout(() => {
      setResult(analyze(text));
      setLoading(false);
    }, 550);
  };

  return (
    <DemoShell label="Demo Mode — analysis runs locally on a deterministic heuristic, not a live model.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input */}
        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
            Paste a message
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Paste an email or message to analyze…"
            className="w-full resize-none rounded-xl border border-bone/[0.1] bg-ink-950/60 p-3 text-[13px] leading-relaxed text-bone placeholder:text-bone-faint focus:border-accent/40 focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={run}
              disabled={!text.trim() || loading}
              className="rounded-lg bg-bone px-4 py-2 text-[13px] font-medium text-ink-950 transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Analyzing…" : "Analyze message"}
            </button>
            <span className="text-[11px] text-bone-faint">or try:</span>
            {SAMPLES.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setText(s);
                  setResult(null);
                }}
                className="rounded-md border border-bone/[0.12] px-2 py-1 text-[11px] text-bone-muted transition-colors hover:border-accent/40 hover:text-accent-soft"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="rounded-xl border border-bone/[0.08] bg-ink-950/40 p-4">
          {!result && !loading && (
            <p className="text-[13px] text-bone-faint">
              Results appear here. Paste a message and run the analysis.
            </p>
          )}

          {loading && (
            <div className="space-y-3">
              <div className="h-6 w-32 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-2 w-full animate-pulse rounded bg-white/[0.06]" />
              <div className="h-2 w-4/5 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-2 w-3/5 animate-pulse rounded bg-white/[0.06]" />
            </div>
          )}

          {result && !loading && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${levelStyle[result.level]}`}
                >
                  {result.level}
                </span>
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold text-bone">{result.score}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-bone-faint">
                    Risk score
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald via-accent to-[#ff5f56] transition-[width] duration-700"
                  style={{ width: `${result.score}%` }}
                />
              </div>

              <p className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
                Indicators {result.matched.length > 0 ? `(${result.matched.length})` : ""}
              </p>
              {result.matched.length === 0 ? (
                <p className="text-[13px] text-emerald-soft">
                  No known scam patterns detected.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {result.matched.map((s) => (
                    <li key={s.id} className="flex items-center gap-2 text-[13px] text-bone-muted">
                      <span className="h-1 w-1 rounded-full bg-accent" />
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 text-[12px] leading-relaxed text-bone-faint">
                {result.level === "High Risk"
                  ? "Multiple strong scam signals were found. Treat this message as dangerous — do not click links or share details."
                  : result.level === "Suspicious"
                    ? "Some risky patterns were found. Verify the sender through an independent channel before acting."
                    : "No significant risk signals were found, but always stay cautious with unexpected messages."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
