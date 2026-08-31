"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { BuilderVisual } from "./BuilderVisual";
import { site } from "@/data/site";

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center pt-24"
    >
      {/* very subtle radial background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 20%, rgba(200,162,106,0.06), transparent 70%)",
        }}
      />

      <div className="container-editorial grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="flex items-center gap-3">
            <span className="eyebrow">{site.role}</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-[clamp(2.6rem,7vw,5.2rem)] font-bold leading-[1.02] tracking-tightest text-bone"
          >
            I build products,
            <br />
            tools &amp; <span className="text-accent">experiments.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-xl text-lg leading-relaxed text-bone-muted"
          >
            Developer focused on web applications, automation, AI, bots, and
            turning ideas into working products.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonLink href="#work" variant="primary" arrow>
              Explore my work
            </ButtonLink>
            <ButtonLink href="#contact" variant="ghost">
              Let&apos;s talk
            </ButtonLink>
          </motion.div>

          {site.availability.active && (
            <motion.div
              variants={item}
              className="mt-9 inline-flex items-center gap-2.5 rounded-full border border-bone/[0.1] bg-bone/[0.02] px-4 py-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#27c93f] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#27c93f]" />
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-bone-muted">
                {site.availability.label}
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.4 }}
          className="order-first lg:order-last"
        >
          <BuilderVisual />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#work"
        aria-label="Scroll to work"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-faint">
          Scroll
        </span>
        <span className="relative h-10 w-px overflow-hidden bg-bone/[0.12]">
          <span className="absolute inset-0 animate-scrollLine bg-accent" />
        </span>
      </motion.a>
    </section>
  );
}
