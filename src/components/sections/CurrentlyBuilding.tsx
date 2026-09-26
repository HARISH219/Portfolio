"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { newestProjects } from "@/data/projects";
import { iconMap } from "@/components/projects/projectMeta";

const ease = [0.16, 1, 0.3, 1] as const;

// Short building-line per project (kept in sync with the newest builds).
const lines: Record<string, string> = {
  "whatsapp-ai": "AI-powered WhatsApp automation",
  "medicine-app": "Medication scheduling and monitoring",
};

export function CurrentlyBuilding() {
  const reduced = useReducedMotion();
  const building = newestProjects.filter((p) => p.status === "IN DEVELOPMENT");
  if (building.length === 0) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="container-editorial">
        <SectionHeading eyebrow="Right now" title="Currently Building" />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {building.map((project, i) => {
            const Icon = iconMap[project.icon];
            return (
              <motion.div
                key={project.slug}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease }}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex h-full items-center gap-4 rounded-2xl border border-bone/[0.1] bg-white/[0.02] p-5 transition-all duration-500 ease-premium hover:-translate-y-0.5 hover:border-[#22b8cf]/40 hover:shadow-[0_20px_60px_-30px_rgba(34,184,207,0.5)]"
                >
                  <span className="font-mono text-lg text-[#7fe0ec]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-bone/[0.1] bg-[#22b8cf]/[0.08] text-[#7fe0ec]">
                    <Icon width={20} height={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-lg font-semibold text-bone">
                        {project.name}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22b8cf]/25 bg-[#22b8cf]/[0.08] px-2 py-0.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22b8cf] opacity-60" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22b8cf]" />
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7fe0ec]">
                          Building
                        </span>
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-bone-muted">
                      {lines[project.slug] ?? project.tagline ?? project.description}
                    </p>
                  </div>
                  <span className="text-bone-faint transition-transform duration-500 ease-premium group-hover:translate-x-1 group-hover:text-[#7fe0ec]">
                    →
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
