"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// -----------------------------------------------------------------------------
// AnimatedHeadline
//
// A phrase-based hero headline. The whole two-line headline belongs to ONE
// state at a time (white + gold always come from the same HEADLINES entry).
//
// - White line rotates vertically: current slides up and out, next slides in
//   from below. It physically moves rather than fading.
// - Gold line uses a short, subtle fade.
// - Only ever one state is on screen (AnimatePresence mode="wait").
// - Height is reserved for the TALLEST SINGLE state (all sizers overlap, not
//   stacked) so the hero never grows or jumps as phrases change.
// -----------------------------------------------------------------------------

export type Headline = {
  /** First line — rendered in white (bone). */
  white: string;
  /** Second line — rendered in the gold gradient. */
  gold: string;
};

export const HEADLINES: Headline[] = [
  { white: "I build", gold: "digital products, tools & experiences." },
  { white: "I design", gold: "beautiful digital products for the web." },
  { white: "I create", gold: "modern web experiences people remember." },
  { white: "I turn ideas", gold: "into digital products people love." },
  { white: "I build", gold: "powerful tools for modern creators." },
  { white: "I design & build", gold: "meaningful digital experiences from scratch." },
  { white: "I create digital", gold: "products that solve real problems." },
  { white: "I bring ideas", gold: "to life through design & technology." },
];

const ease = [0.16, 1, 0.3, 1] as const;

// Timing.
const HOLD_MS = 2700;
const MOVE_S = 0.42; // white vertical movement + gold fade

export function AnimatedHeadline({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced || HEADLINES.length <= 1) return;

    timerRef.current = window.setTimeout(() => {
      setIndex((i) => (i + 1) % HEADLINES.length);
    }, HOLD_MS);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [index, reduced]);

  const current = HEADLINES[index];

  return (
    <h1
      className={`relative mt-6 font-display text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[1.02] tracking-tightest text-bone ${className}`}
    >
      {/* Height reservation: every state occupies the SAME grid cell, so they
          overlap instead of stacking and the grid grows to the tallest single
          state. This keeps the hero height stable (no jump, no 8x reservation).
          The live layer sits in the same cell. */}
      <span aria-hidden className="invisible grid">
        {HEADLINES.map((h, i) => (
          <span key={i} className="col-start-1 row-start-1 block">
            <span className="block break-words">{h.white}</span>
            <span className="block break-words">{h.gold}</span>
          </span>
        ))}
      </span>

      {/* Live layer overlays the sizer. */}
      <span className="absolute inset-0 block">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={index} className="block">
            {/* WHITE line — vertical rotation, clipped so it slides in/out. */}
            <span className="block overflow-hidden">
              <motion.span
                className="block break-words text-bone"
                initial={reduced ? { opacity: 0 } : { y: "100%" }}
                animate={reduced ? { opacity: 1 } : { y: "0%" }}
                exit={reduced ? { opacity: 0 } : { y: "-100%" }}
                transition={{ duration: reduced ? 0.3 : MOVE_S, ease }}
              >
                {current.white}
              </motion.span>
            </span>

            {/* GOLD line — short, subtle fade (kept as before). */}
            <motion.span
              className="block break-words text-gold-gradient"
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={{ duration: reduced ? 0.3 : MOVE_S, ease }}
            >
              {current.gold}
            </motion.span>
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Politely announce the current headline to screen readers. */}
      <span className="sr-only" aria-live="polite">
        {current.white} {current.gold}
      </span>
    </h1>
  );
}
