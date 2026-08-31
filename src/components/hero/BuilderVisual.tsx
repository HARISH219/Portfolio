"use client";

import { motion, useReducedMotion } from "framer-motion";

// A subtle floating collection of small UI panels representing things I build:
// a terminal, a code snippet, a bot interface, and a project card.
// Panels drift gently and react to hover. Kept understated, not flashy.

function Dot({ color }: { color: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

const panelBase =
  "absolute rounded-2xl border border-bone/[0.1] bg-ink-850/80 backdrop-blur-md shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]";

export function BuilderVisual() {
  const reduced = useReducedMotion();

  const drift = (dur: number, y: number) =>
    reduced
      ? {}
      : {
          animate: { y: [0, y, 0] },
          transition: { duration: dur, repeat: Infinity, ease: "easeInOut" as const },
        };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px] select-none">
      {/* soft ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-accent/[0.06] blur-3xl" />

      {/* Terminal window */}
      <motion.div
        {...drift(7, -12)}
        whileHover={reduced ? undefined : { scale: 1.03, rotate: -1 }}
        className={`${panelBase} left-0 top-6 w-[62%] p-3.5`}
      >
        <div className="mb-3 flex items-center gap-1.5">
          <Dot color="bg-[#ff5f56]/70" />
          <Dot color="bg-[#ffbd2e]/70" />
          <Dot color="bg-[#27c93f]/70" />
          <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-bone-faint">
            zsh
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-[10px] leading-relaxed">
          <p className="text-bone-muted">
            <span className="text-accent">$</span> node deploy.js
          </p>
          <p className="text-bone-faint">→ building experiment…</p>
          <p className="text-[#7bd8a4]/80">✓ shipped</p>
        </div>
      </motion.div>

      {/* Code snippet card */}
      <motion.div
        {...drift(9, 14)}
        whileHover={reduced ? undefined : { scale: 1.03, rotate: 1 }}
        className={`${panelBase} right-0 top-0 w-[46%] p-3.5`}
      >
        <span className="font-mono text-[9px] uppercase tracking-widest text-bone-faint">
          idea.ts
        </span>
        <pre className="mt-2 font-mono text-[10px] leading-relaxed text-bone-muted">
{`const build = (
  idea
) => ship(idea)`}
        </pre>
      </motion.div>

      {/* Bot interface */}
      <motion.div
        {...drift(8, -10)}
        whileHover={reduced ? undefined : { scale: 1.03 }}
        className={`${panelBase} bottom-6 left-2 w-[50%] p-3.5`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 font-mono text-[9px] text-accent-soft">
            B
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-bone-faint">
            bot
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="rounded-lg rounded-tl-sm bg-bone/[0.05] px-2.5 py-1.5 text-[10px] text-bone-muted">
            /register
          </div>
          <div className="ml-4 rounded-lg rounded-tr-sm bg-accent/[0.12] px-2.5 py-1.5 text-[10px] text-bone">
            welcome aboard ✓
          </div>
        </div>
      </motion.div>

      {/* Project card */}
      <motion.div
        {...drift(10, 12)}
        whileHover={reduced ? undefined : { scale: 1.03, rotate: -1 }}
        className={`${panelBase} bottom-0 right-2 w-[44%] p-3.5`}
      >
        <div className="mb-2 aspect-video rounded-lg bg-gradient-to-br from-accent/25 to-transparent" />
        <p className="font-display text-[11px] font-semibold text-bone">Project</p>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-bone-faint">
          live
        </p>
      </motion.div>
    </div>
  );
}
