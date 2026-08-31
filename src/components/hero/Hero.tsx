"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { BuilderVisual } from "./BuilderVisual";
import { site } from "@/data/site";
import {
  CodeIcon,
  BotIcon,
  SparkIcon,
  BulbIcon,
  ChatIcon,
} from "@/components/ui/icons";

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

const highlights = [
  {
    icon: CodeIcon,
    title: "Web Applications",
    body: "Scalable, responsive, and performant web apps.",
  },
  {
    icon: BotIcon,
    title: "Automation & Bots",
    body: "Smart automation, chatbots, and workflow tools.",
  },
  {
    icon: SparkIcon,
    title: "AI Experiments",
    body: "Exploring AI tools and building practical use-cases.",
  },
  {
    icon: BulbIcon,
    title: "Product Thinking",
    body: "Turning ideas into real products that solve problems.",
  },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-center pt-28"
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
            <span className="eyebrow flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
              {site.role}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-[clamp(2.8rem,7.5vw,5.4rem)] font-bold leading-[0.98] tracking-tightest text-bone"
          >
            I build
            <br />
            products,
            <br />
            tools &amp;
            <br />
            <span className="text-accent">experiments.</span>
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
            <ButtonLink href="#contact" variant="ghost" icon={<ChatIcon />}>
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

      {/* Feature highlights row */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
        className="container-editorial mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-bone/[0.08] bg-bone/[0.02] sm:grid-cols-2 lg:mt-24 lg:grid-cols-4"
      >
        {highlights.map(({ icon: Icon, title, body }) => (
          <motion.div
            key={title}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
            }}
            className="group bg-ink-950/60 p-6 transition-colors duration-500 hover:bg-ink-900/70"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-bone/[0.1] bg-bone/[0.03] text-accent-soft transition-colors duration-500 group-hover:border-accent/40">
              <Icon />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-bone">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-bone-muted">{body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
