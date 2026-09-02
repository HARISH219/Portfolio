"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectsPanel } from "./ProjectsPanel";
import { site } from "@/data/site";
import { ChatIcon } from "@/components/ui/icons";
import { AnimatedHeadline } from "./AnimatedHeadline";

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
      className="relative flex min-h-screen flex-col justify-center pt-28 pb-16 lg:pt-24"
    >
      <div className="container-editorial grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* LEFT — hero text */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.05] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-accent-soft">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald" />
              {site.role}
            </span>
          </motion.div>

          <motion.div variants={item}>
            <AnimatedHeadline />
          </motion.div>

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
            <ButtonLink href="#contact" variant="ghost" icon={<ChatIcon />}>
              Let&apos;s talk
            </ButtonLink>
          </motion.div>

          {site.availability.active && (
            <motion.div
              variants={item}
              className="mt-9 inline-flex items-center gap-2.5 rounded-full border border-emerald/20 bg-emerald/[0.05] px-4 py-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-emerald-soft">
                {site.availability.label}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT — glass projects panel */}
        <div className="w-full">
          <ProjectsPanel />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#work"
        aria-label="Scroll to explore"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mx-auto mt-14 hidden flex-col items-center gap-3 lg:flex"
      >
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-bone/[0.18] p-1">
          <span className="h-2 w-0.5 rounded-full bg-accent animate-scrollLine" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-faint">
          Scroll to explore
        </span>
      </motion.a>
    </section>
  );
}
