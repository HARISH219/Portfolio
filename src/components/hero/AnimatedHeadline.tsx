"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// -----------------------------------------------------------------------------
// AnimatedHeadline — 3-line structure
//
//   Line 1: "I build"        -> STATIC white anchor. Never animates.
//   Line 2: middle word      -> GOLD, vertical rotation (slides up out / in up).
//   Line 3: bottom phrase    -> WHITE, typewriter/backspace on change.
//
// Casing is stored exactly as displayed (Title Case). Single source of truth:
// HEADLINES ({ middle, bottom }); middle + bottom always come from the SAME
// state (one `index`), rotating sequentially. The typewriter runs as a single
// self-contained loop guarded by a generation id so a re-run (or React
// StrictMode double-invoke) can never spawn two competing chains.
// -----------------------------------------------------------------------------

export type Headline = {
  /** Line 2 — the gold, vertically-rotating word. */
  middle: string;
  /** Line 3 — the white phrase revealed with a typewriter effect. */
  bottom: string;
};

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
const HOLD_MS = 2800; // time a full phrase stays before the next cycle
const BOTTOM_START_DELAY_MS = 130; // bottom reacts shortly AFTER the middle word
const BACKSPACE_MS = 30; // per char while deleting
const TYPE_MS = 42; // per char while typing
const MIDDLE_MOVE_S = 0.5; // vertical rotation duration
const middleEase = [0.22, 1, 0.36, 1] as const;

// Longest bottom phrase — used only to reserve line-3 width so nothing shifts.
const LONGEST_BOTTOM = HEADLINES.reduce(
  (a, h) => (h.bottom.length > a.length ? h.bottom : a),
  "",
);

export function AnimatedHeadline({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  const [typed, setTyped] = useState(HEADLINES[0].bottom);
  const [caret, setCaret] = useState(false);
  // Mirrors `typed` so timer callbacks can read the on-screen text without
  // depending on stale closures or extra effect deps.
  const typedRef = useRef(HEADLINES[0].bottom);
  const setTypedBoth = (v: string) => {
    typedRef.current = v;
    setTyped(v);
  };

  const holdTimer = useRef<number | null>(null);
  const typeTimer = useRef<number | null>(null);
  const startTimer = useRef<number | null>(null);
  // Generation token: every effect run bumps this; only the loop whose id
  // matches the latest generation is allowed to keep scheduling. This makes the
  // typewriter immune to StrictMode double-invokes and rapid re-renders.
  const genRef = useRef(0);

  // Advance to the next state after the hold.
  useEffect(() => {
    if (reduced || HEADLINES.length <= 1) return;
    holdTimer.current = window.setTimeout(() => {
      setIndex((i) => (i + 1) % HEADLINES.length);
    }, HOLD_MS);
    return () => {
      if (holdTimer.current !== null) {
        window.clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
    };
  }, [index, reduced]);

  // Drive the bottom typewriter when the target phrase (index) changes.
  useEffect(() => {
    const target = HEADLINES[index].bottom;
    const gen = ++genRef.current;

    const clearTimers = () => {
      if (typeTimer.current !== null) {
        window.clearTimeout(typeTimer.current);
        typeTimer.current = null;
      }
      if (startTimer.current !== null) {
        window.clearTimeout(startTimer.current);
        startTimer.current = null;
      }
    };

    // Reduced motion: snap to the final phrase, no caret, no timers.
    if (reduced) {
      clearTimers();
      setTypedBoth(target);
      setCaret(false);
      return clearTimers;
    }

    clearTimers();

    // Start from whatever is currently on screen (previous phrase).
    let current = typedRef.current;

    const run = () => {
      // Bail out if a newer generation has taken over.
      if (gen !== genRef.current) return;

      if (current.length > 0) {
        // Phase 1: backspace.
        current = current.slice(0, -1);
        setTypedBoth(current);
        typeTimer.current = window.setTimeout(run, BACKSPACE_MS);
        return;
      }
      if (current.length < target.length) {
        // Phase 2: type forward.
        current = target.slice(0, current.length + 1);
        setTypedBoth(current);
        typeTimer.current = window.setTimeout(run, TYPE_MS);
        return;
      }
      // Done.
      setCaret(false);
    };

    startTimer.current = window.setTimeout(() => {
      if (gen !== genRef.current) return;
      setCaret(true);
      run();
    }, BOTTOM_START_DELAY_MS);

    return clearTimers;
    // `typed` intentionally excluded: the loop owns `current` locally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduced]);

  // Final unmount safety.
  useEffect(() => {
    return () => {
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
      if (typeTimer.current !== null) window.clearTimeout(typeTimer.current);
      if (startTimer.current !== null) window.clearTimeout(startTimer.current);
    };
  }, []);

  const middle = HEADLINES[index].middle;

  return (
    <h1
      className={`relative mt-6 font-display text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[1.02] tracking-tightest text-bone ${className}`}
    >
      {/* LINE 1 — static white anchor. Never animates. */}
      <span className="block break-words text-bone">I build</span>

      {/* LINE 2 — gold middle word, vertical rotation. Fixed-height, clipped
          so the outgoing word slides up and the incoming enters from below.
          A width sizer (widest word) keeps the line from reshuffling. */}
      <span className="relative block overflow-hidden">
        {/* invisible width/height reservation for the widest middle word */}
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
