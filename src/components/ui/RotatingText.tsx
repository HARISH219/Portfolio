"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// -----------------------------------------------------------------------------
// RotatingText
// Cycles through `words`, fading + sliding each in/out. All candidate words are
// stacked in the same grid cell so the container always sizes to the widest
// word — the surrounding layout never shifts when the word changes.
//
// Respects prefers-reduced-motion: renders the first word statically, no loop.
// -----------------------------------------------------------------------------

const ease = [0.16, 1, 0.3, 1] as const;

export function RotatingText({
  words,
  interval = 2200,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || words.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [reduced, words.length, interval]);

  // Reduced motion: show a single static word, no animation.
  if (reduced) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span className="relative inline-grid align-bottom">
      {/* Invisible stack of every word reserves the widest footprint so the
          animated word never causes layout shift. */}
      {words.map((word) => (
        <span
          key={word}
          aria-hidden
          className={`invisible col-start-1 row-start-1 ${className}`}
        >
          {word}
        </span>
      ))}

      <span className="col-start-1 row-start-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={words[index]}
            initial={{ opacity: 0, y: "0.5em" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-0.5em" }}
            transition={{ duration: 0.5, ease }}
            className={`inline-block ${className}`}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Announce changes politely for screen readers. */}
      <span className="sr-only" aria-live="polite">
        {words[index]}
      </span>
    </span>
  );
}
