"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { featuredProjects, type FeaturedProject } from "@/data/projects";
import { iconMap, statusStyle } from "@/components/projects/projectMeta";
import { DiamondIcon, ArrowRightIcon, ExternalIcon } from "@/components/ui/icons";

// A tiny GitHub mark (kept local since it isn't in the shared icon set).
function GithubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function ProjectCard({ project }: { project: FeaturedProject }) {
  const Icon = iconMap[project.icon];
  const s = statusStyle[project.status];

  const cardClass =
    "group relative block overflow-hidden rounded-2xl border border-bone/[0.08] bg-white/[0.02] p-3 transition-all duration-500 ease-premium hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/[0.04] hover:shadow-[0_18px_50px_-24px_rgba(214,169,78,0.5)] focus:outline-none focus-visible:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent/40";

  const inner = (
    <>
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
        {/* mini preview thumbnail */}
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
            {!project.external && project.status !== "IN DEVELOPMENT" && (
              <span
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full border ${s.border} ${s.bg} px-2 py-0.5`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  {s.ping && (
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-60`} />
                  )}
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
                </span>
                <span className={`font-mono text-[9px] uppercase tracking-[0.16em] ${s.text}`}>
                  {project.status === "INTERACTIVE DEMO" ? "Demo" : project.status}
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
            <span className="flex items-center gap-2">
              {/* secondary GitHub button (does not trigger the card navigation) */}
              {project.githubUrl && !project.external && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${project.name} source on GitHub`}
                  className="text-bone-faint transition-colors hover:text-accent-soft"
                >
                  <GithubMark />
                </a>
              )}
              <span className="text-bone-faint transition-all duration-500 ease-premium group-hover:translate-x-1 group-hover:text-accent-soft">
                {project.external ? <ExternalIcon /> : <ArrowRightIcon />}
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );

  // External tile (e.g. "More projects") links straight out; everything else
  // opens its dedicated project page.
  if (project.external && project.href) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${project.name} — opens in a new tab`}
        className={cardClass}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={`/projects/${project.slug}`} aria-label={`Open ${project.name}`} className={cardClass}>
      {inner}
    </Link>
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
          <ProjectCard key={project.slug} project={project} />
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
