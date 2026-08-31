"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { journey } from "@/data/tech";

const builds = [
  "Web applications",
  "Automation systems",
  "Discord bots",
  "AI experiments",
  "Tools that solve practical problems",
];

export function About() {
  const reduced = useReducedMotion();

  return (
    <section id="about" className="scroll-mt-24 py-28 sm:py-36">
      <div className="container-editorial">
        <SectionHeading eyebrow="02 — About" title="A little about me." />

        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-xl leading-relaxed text-bone sm:text-2xl">
                I&apos;m a developer who enjoys taking an idea from{" "}
                <span className="text-accent">&ldquo;what if…&rdquo;</span> to{" "}
                <span className="text-accent">&ldquo;it actually works.&rdquo;</span>
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 text-[15px] leading-relaxed text-bone-muted">
                Most of what I make starts as a small question and turns into
                something real. I like the messy middle — the part where an idea
                fights back and you have to actually build your way through it.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <ul className="mt-8 space-y-3">
                {builds.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-bone-muted">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    <span className="text-[15px]">{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* journey timeline */}
          <div>
            <Reveal>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-faint">
                The loop I keep running
              </span>
            </Reveal>

            <ol className="relative mt-8 space-y-8 border-l border-bone/[0.1] pl-8">
              {journey.map((step, i) => (
                <motion.li
                  key={step.stage}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <span className="absolute -left-[41px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-accent/40 bg-ink-950">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  <h4 className="font-display text-xl font-semibold text-bone">
                    {step.stage}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-bone-muted">
                    {step.note}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
