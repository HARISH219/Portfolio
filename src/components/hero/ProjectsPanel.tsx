"use client";

import { motion, useReducedMotion } from "framer-motion";
import { featuredProjects, type FeaturedProject } from "@/data/projects";
import {
  DiamondIcon,
  ArrowRightIcon,
  ExternalIcon,
  PortfolioIcon,
  BotIcon,
  ShieldIcon,
  CubeIcon,
  TerminalIcon,
  DocIcon,
  ChartIcon,
  SparkIcon,
  GridIcon,
} from "@/components/ui/icons";
import type { ComponentType, SVGProps } from "react";

const iconMap: Record<FeaturedProject["icon"], ComponentType<SVGProps<SVGSVGElement>>> = {
  portfolio: PortfolioIcon,
  bot: BotIcon,
  shield: ShieldIcon,
  cube: CubeIcon,
  terminal: TerminalIcon,
  doc: DocIcon,
  chart: ChartIcon,
  spark: SparkIcon,
  grid: GridIcon,
};

function ProjectCard({ project }: { project: FeaturedProject }) {
  const Icon = iconMap[project.icon];

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${project.name} — opens in a new tab`}
      className="group relative block overflow-hidden rounded-2xl border border-bone/[0.08] bg-white/[0.02] p-3 transition-all duration-500 ease-premium hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/[0.04] hover:shadow-[0_18px_50px_-24px_rgba(214,169,78,0.5)] focus:outline-none focus-visible:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent/40"
    >
      {/* gold highlight sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 0%, rgba(214,169,78,0.08), transparent 60%)",
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* thumbnail */}
        <div className="relative h-[68px] w-[92px] shrink-0 overflow-hidden rounded-xl border border-bone/[0.08]">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${project.thumb} transition-transform duration-700 ease-premium group-hover:scale-110`}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(242,240,234,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,240,234,0.05) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-accent-soft">
            <Icon width={26} height={26} />
          </span>
        </div>

        {/* content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-[15px] font-semibold text-bone">
              {project.name}
            </h3>
            <span className="text-bone-faint transition-colors duration-300 group-hover:text-accent-soft">
              <ExternalIcon />
            </span>
            {project.live && (
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald/[0.08] px-2 py-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-soft">
                  Live
                </span>
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-bone-muted">
            {project.description}
          </p>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-md border border-accent/20 bg-accent/[0.06] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-accent-soft">
              {project.category}
            </span>
            <span className="text-bone-faint transition-all duration-500 ease-premium group-hover:translate-x-1 group-hover:text-accent-soft">
              <ArrowRightIcon />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

export function ProjectsPanel() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
      className="glass relative w-full overflow-hidden rounded-3xl p-4 sm:p-5"
    >
      {/* header */}
      <div className="flex items-center gap-2 px-1 pb-3">
        <span className="text-accent">
          <DiamondIcon width={14} height={14} />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone-muted">
          Featured Projects
        </span>
      </div>

      {/* independently scrolling list */}
      <div className="scroll-subtle max-h-[62vh] space-y-2.5 overflow-y-auto pr-1 lg:max-h-[560px]">
        {featuredProjects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>

      {/* soft fade at the bottom edge to hint more content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 bottom-4 h-8 rounded-b-3xl bg-gradient-to-t from-ink-950/80 to-transparent"
      />
    </motion.div>
  );
}
