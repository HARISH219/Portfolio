"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// -----------------------------------------------------------------------------
// AnimatedHeadline — 3-line structure, driven by ONE state machine.
//
//   Line 1: "I build"  -> STATIC white anchor. Never animates.
//   Line 2: middle     -> GOLD, vertical (Quark-style) rotation.
//   Line 3: bottom     -> WHITE, typewriter (backspace old, type new).
//
// A single scheduler owns the whole cycle so nothing external can restart the
// typewriter mid-flight (the root cause of the "stuck at one char" bug):
//
//   HOLD (1.5s) -> MIDDLE_TRANSITION (~0.5s) -> BACKSPACE -> TYPE -> HOLD ...
//
// Phases are chained via one timeout ref + a generation token. Only the loop
// matching the latest generation may schedule work, so React StrictMode double
// invokes, re-renders, or unmounts can never leave two chains running.
// -----------------------------------------------------------------------------

export type Headline = { middle: string; bottom: string };

export const HEADLINES: Headline[] = [
  { middle: "Websites", bottom: "That Perform" },
  { middle: "Products", bottom: "That Matter" },
  { middle: "Tools", bottom: "That Help" },
  { middle: "Software", bottom: "That Works" },
  { middle: "Apps", bottom: "People Love" },
  { middle: "Platforms", bottom: "People Use" },
  { middle: "Experiences", bottom: "People Remember" },
  { middle: "Interfaces", bottom: "People Enjoy" },
];

// Timing
const HOLD_MS = 1500;
const MIDDLE_MOVE_S = 0.5; // gold vertical rotation
const MIDDLE_SETTLE_MS = 560; // wait for the gold motion to fully finish
const BACKSPACE_MS = 32;
const TYPE_MS = 42;
const middleEase = [0.22, 1, 0.36, 1] as const;

const LONGEST_BOTTOM = HEADLINES.reduce(
  (a, h) => (h.bottom.length > a.length ? h.bottom : a),
  "",
);

export function AnimatedHeadline({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();

  // `index` selects the middle (gold) word and is the source of the current
  // headline object. `typed` is only the visible third-line text.
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(HEADLINES[0].bottom);
  const [caret, setCaret] = useState(false);

  // One timeout handle + one generation token drive the entire sequence.
  const timer = useRef<number | null>(null);
  const gen = useRef(0);

  useEffect(() => {
    // Reduced motion: show the first state statically, no cycle.
    if (reduced || HEADLINES.length <= 1) {
      setTyped(HEADLINES[0].bottom);
      setCaret(false);
      return;
    }

    // Capture the ref objects locally so the cleanup closes over stable
    // references (not `gen.current` read at render time) — satisfies the
    // exhaustive-deps ref-in-cleanup lint while preserving behavior.
    const genRef = gen;
    const timerRef = timer;

    const myGen = ++genRef.current;
    const alive = () => myGen === genRef.current;
    const wait = (ms: number, fn: () => void) => {
      timerRef.current = window.setTimeout(() => {
        if (alive()) fn();
      }, ms);
    };

    // The sequence works entirely with local variables for the current index
    // and the visible text, so no stale React state can desync the loop.
    const runCycle = (curIdx: number) => {
      const nextIdx = (curIdx + 1) % HEADLINES.length;
      const oldBottom = HEADLINES[curIdx].bottom;
      const newBottom = HEADLINES[nextIdx].bottom;

      // PHASE: HOLD the fully-typed current state.
      wait(HOLD_MS, () => {
        // PHASE: MIDDLE_TRANSITION — change only the gold word.
        setIndex(nextIdx);

        // PHASE: wait for the middle motion to finish before touching line 3.
        wait(MIDDLE_SETTLE_MS, () => {
          setCaret(true);

          // PHASE: BACKSPACE the old third line, char by char.
          const backspace = (len: number) => {
            if (len <= 0) {
              type(0);
              return;
            }
            const n = len - 1;
            setTyped(oldBottom.slice(0, n));
            wait(BACKSPACE_MS, () => backspace(n));
          };

          // PHASE: TYPE the new third line, char by char.
          const type = (len: number) => {
            if (len >= newBottom.length) {
              setTyped(newBottom);
              setCaret(false);
              // PHASE: loop into the next cycle from the new index.
              runCycle(nextIdx);
              return;
            }
            const n = len + 1;
            setTyped(newBottom.slice(0, n));
            wait(TYPE_MS, () => type(n));
          };

          backspace(oldBottom.length);
        });
      });
    };

    runCycle(0);

    return () => {
      // Invalidate this generation and clear the pending timeout so no callback
      // from this run survives into the next mount / re-render.
      genRef.current++;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [reduced]);

  const middle = HEADLINES[index].middle;

  return (
    <h1
      className={`relative mt-6 font-display text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[1.02] tracking-tightest text-bone ${className}`}
    >
      {/* LINE 1 — static white anchor. Never animates. */}
      <span className="block break-words text-bone">I build</span>

      {/* LINE 2 — gold middle word, vertical rotation. Fixed-height + clipped;
          a width sizer (widest word) keeps the line from reshuffling. */}
      <span className="relative block overflow-hidden">
        <span aria-hidden className="invisible grid">
          {HEADLINES.map((h, i) => (
            <span key={i} className="col-start-1 row-start-1 block text-gold-gradient">
              {h.middle}
            </span>
          ))}
        </span>
        <span className="absolute inset-0 block">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={middle}
              className="block text-gold-gradient"
              initial={reduced ? false : { y: "100%" }}
              animate={reduced ? {} : { y: "0%" }}
              exit={reduced ? {} : { y: "-100%" }}
              transition={{ duration: MIDDLE_MOVE_S, ease: middleEase }}
            >
              {middle}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>

      {/* LINE 3 — white typewriter. A width sizer (longest phrase) reserves the
          space so the caret and text never shift the layout. */}
      <span className="relative block text-bone">
        <span aria-hidden className="invisible block break-words">
          {LONGEST_BOTTOM}
        </span>
        <span className="absolute inset-0 block break-words" aria-hidden>
          {typed}
          <span
            className={`ml-1 inline-block w-[0.05em] translate-y-[0.08em] bg-bone transition-opacity duration-150 ${
              caret ? "animate-pulse opacity-80" : "opacity-0"
            }`}
            style={{ height: "0.82em" }}
          />
        </span>
      </span>

      {/* Announce the complete current headline to screen readers. */}
      <span className="sr-only" aria-live="polite">
        I build {middle} {HEADLINES[index].bottom}
      </span>
    </h1>
  );
}
