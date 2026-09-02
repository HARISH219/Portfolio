"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// -----------------------------------------------------------------------------
// AnimatedHeadline
//
// A phrase-based hero headline. The ENTIRE two-line headline is one unit: both
// lines animate together, and only ever ONE state is on screen at a time.
//
// Single source of truth: HEADLINES. Each entry is a complete, pre-written
// state — a white first line and a gold second line. Nothing is randomized or
// concatenated, so text can never combine/duplicate across states.
//
// Rotation is strictly sequential (index + 1, wrapping to 0), so the same
// phrase can never appear twice in a row and the loop is deterministic.
// -----------------------------------------------------------------------------

export type Headline = {
  /** First line — rendered in white (bone). */
  lineOne: string;
  /** Second line — rendered in the gold gradient. */
  lineTwo: string;
};

export const HEADLINES: Headline[] = [
  { lineOne: "I build", lineTwo: "digital products, tools & experiences." },
  { lineOne: "I design", lineTwo: "beautiful digital products for the web." },
  { lineOne: "I create", lineTwo: "modern web experiences people remember." },
  { lineOne: "I turn ideas", lineTwo: "into digital products people love." },
  { lineOne: "I build", lineTwo: "powerful tools for modern creators." },
  { lineOne: "I design & build", lineTwo: "meaningful digital experiences from scratch." },
  { lineOne: "I create digital", lineTwo: "products that solve real problems." },
  { lineOne: "I bring ideas", lineTwo: "to life through design & technology." },
];

const ease = [0.16, 1, 0.3, 1] as const;

// Timing (ms): hold each phrase, then the out/in transition handles the swap.
const HOLD_MS = 3500;
const TRANSITION_S = 0.55; // seconds for fade/blur/movement

export function AnimatedHeadline({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced || HEADLINES.length <= 1) return;

    // Schedule the next phrase after a hold. Using setTimeout (not setInterval)
    // and re-scheduling on each index change keeps the hold duration exact and
    // avoids drift or overlapping ticks during rapid re-renders.
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
      {/* Invisible sizer: stacks every headline so the box reserves the tallest
          + widest footprint. This keeps the hero height stable and prevents any
          layout jump when phrases change. Not read by AT (aria-hidden). */}
      <span aria-hidden className="invisible block">
        {HEADLINES.map((h, i) => (
          <span key={i} className="block">
            <span className="block break-words">{h.lineOne}</span>
            <span className="block break-words">{h.lineTwo}</span>
          </span>
        ))}
      </span>

      {/* Live layer: absolutely positioned over the sizer. mode="wait" ensures
          the outgoing phrase is fully removed before the next mounts — the old
          and new headline are never on screen at the same time. */}
      <span className="absolute inset-0 block">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            className="block"
            initial={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: 14, filter: "blur(6px)" }
            }
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: -14, filter: "blur(6px)" }
            }
            transition={{ duration: reduced ? 0.3 : TRANSITION_S, ease }}
          >
            <span className="block break-words text-bone">{current.lineOne}</span>
            <span className="block break-words text-gold-gradient">
              {current.lineTwo}
            </span>
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Politely announce the current headline to screen readers. */}
      <span className="sr-only" aria-live="polite">
        {current.lineOne} {current.lineTwo}
      </span>
    </h1>
  );
}
