"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// -----------------------------------------------------------------------------
// AnimatedHeadline — 3-line structure
//
//   Line 1: "I BUILD"        -> STATIC white anchor. Never animates.
//   Line 2: middle word      -> GOLD, vertical rotation (slides up out / in up).
//   Line 3: bottom phrase    -> WHITE, typewriter/backspace on change.
//
// Single source of truth: HEADLINES ({ middle, bottom }). Middle + bottom always
// come from the SAME state (one `index`), rotating sequentially. The middle word
// (Framer Motion, AnimatePresence mode="wait") and the bottom typewriter run on
// slightly offset timers so the transition feels organic, not synchronized.
// -----------------------------------------------------------------------------

export type Headline = {
  /** Line 2 — the gold, vertically-rotating word. */
  middle: string;
  /** Line 3 — the white phrase revealed with a typewriter effect. */
  bottom: string;
};

export const HEADLINES: Headline[] = [
  { middle: "WEBSITES", bottom: "THAT PERFORM" },
  { middle: "PRODUCTS", bottom: "THAT MATTER" },
  { middle: "TOOLS", bottom: "THAT HELP" },
  { middle: "SOFTWARE", bottom: "THAT WORKS" },
  { middle: "APPS", bottom: "PEOPLE LOVE" },
  { middle: "PLATFORMS", bottom: "PEOPLE USE" },
  { middle: "EXPERIENCES", bottom: "PEOPLE REMEMBER" },
  { middle: "INTERFACES", bottom: "PEOPLE ENJOY" },
];

// Timing
const HOLD_MS = 2800; // time a full phrase stays before the next cycle
const BOTTOM_START_DELAY_MS = 130; // bottom reacts shortly AFTER the middle word
const BACKSPACE_MS = 30; // per char while deleting
const TYPE_MS = 40; // per char while typing
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

  // Bottom-line typewriter state. `typedRef` mirrors `typed` for use inside
  // timer callbacks without adding it to effect deps (avoids re-triggering).
  const [typed, setTyped] = useState(HEADLINES[0].bottom);
  const [caret, setCaret] = useState(false);
  const typedRef = useRef(HEADLINES[0].bottom);

  const holdTimer = useRef<number | null>(null);
  const typeTimer = useRef<number | null>(null);
  const startTimer = useRef<number | null>(null);

  const clearTypeTimers = () => {
    if (typeTimer.current !== null) {
      window.clearTimeout(typeTimer.current);
      typeTimer.current = null;
    }
    if (startTimer.current !== null) {
      window.clearTimeout(startTimer.current);
      startTimer.current = null;
    }
  };

  // Advance to the next state after the hold. setTimeout re-scheduled per index
  // (not setInterval) avoids drift and overlapping ticks on re-renders.
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

  // Drive the bottom typewriter whenever the target phrase (index) changes.
  // A local `len` variable is the source of truth for the animation; we never
  // schedule the next step from inside a setState updater (StrictMode-safe) and
  // every timer is cleared on cleanup so old/new phrases can never overlap.
  useEffect(() => {
    const target = HEADLINES[index].bottom;
    // The phrase currently on screen (captured once; state is only for render).
    let len = typedRef.current.length;

    // Reduced motion: snap to the final phrase, no caret, no timers.
    if (reduced) {
      clearTypeTimers();
      typedRef.current = target;
      setTyped(target);
      setCaret(false);
      return;
    }

    clearTypeTimers();

    const step = () => {
      // Phase 1: backspace whatever is still on screen.
      if (len > 0) {
        len -= 1;
        const next = typedRef.current.slice(0, len);
        typedRef.current = next;
        setTyped(next);
        typeTimer.current = window.setTimeout(step, BACKSPACE_MS);
        return;
      }
      // Phase 2: type the new phrase forward.
      if (len < target.length) {
        len += 1;
        const next = target.slice(0, len);
        typedRef.current = next;
        setTyped(next);
        typeTimer.current = window.setTimeout(step, TYPE_MS);
        return;
      }
      // Done.
      setCaret(false);
    };

    // Offset the reaction slightly after the middle word begins moving.
    startTimer.current = window.setTimeout(() => {
      setCaret(true);
      step();
    }, BOTTOM_START_DELAY_MS);

    return clearTypeTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduced]);

  // Final unmount safety: clear every timer.
  useEffect(() => {
    return () => {
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
      clearTypeTimers();
    };
  }, []);

  const middle = HEADLINES[index].middle;

  return (
    <h1
      className={`relative mt-6 font-display text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[1.02] tracking-tightest text-bone ${className}`}
    >
      {/* LINE 1 — static white anchor. Never animates. */}
      <span className="block break-words text-bone">I BUILD</span>

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
