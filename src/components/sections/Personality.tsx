"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { thingsIEnjoyBuilding } from "@/data/tech";

export function Personality() {
  const reduced = useReducedMotion();

  return (
    <section className="border-y border-bone/[0.08] bg-ink-900/30 py-24 sm:py-32">
      <div className="container-editorial">
        <Reveal>
          <span className="eyebrow">Things I enjoy building</span>
        </Reveal>

        <div className="mt-10 flex flex-col gap-1 sm:gap-2">
          {thingsIEnjoyBuilding.map((thing, i) => (
            <motion.p
              key={thing}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group font-display text-[clamp(2rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tightest text-bone-faint transition-colors duration-500 hover:text-bone"
            >
              <span className="mr-4 align-middle font-mono text-sm text-accent/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              {thing}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
