"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experiments, type ExperimentStatus } from "@/data/experiments";

const statusColor: Record<ExperimentStatus, string> = {
  LIVE: "text-[#8fe6a6] border-[#27c93f]/30",
  BUILDING: "text-accent-soft border-accent/30",
  EXPERIMENT: "text-[#9fb3e6] border-[#6f8bd8]/30",
  ARCHIVED: "text-bone-faint border-bone/[0.15]",
};

const spanClass = (span?: string) => {
  if (span === "wide") return "sm:col-span-2";
  if (span === "tall") return "sm:row-span-2";
  return "";
};

export function Experiments() {
  const reduced = useReducedMotion();

  return (
    <section id="experiments" className="scroll-mt-24 border-t border-bone/[0.08] py-28 sm:py-36">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="04 — Lab"
          title="Experiments"
          subtitle="Smaller projects, prototypes, and ideas that may or may not become something."
        />

        <div className="mt-14 grid auto-rows-[minmax(160px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((exp, i) => (
            <motion.div
              key={exp.name}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-bone/[0.08] bg-ink-900/40 p-6 transition-all duration-500 ease-premium hover:-translate-y-1 hover:border-accent/25 hover:bg-ink-850 ${spanClass(
                exp.span,
              )}`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(80% 80% at 50% 0%, rgba(200,162,106,0.07), transparent 70%)",
                }}
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold text-bone">
                    {exp.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${statusColor[exp.status]}`}
                  >
                    {exp.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-bone-muted">
                  {exp.description}
                </p>
              </div>

              <div className="relative mt-6 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {exp.tech.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone-faint"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
                  {exp.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
