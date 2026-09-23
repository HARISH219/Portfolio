"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { FeaturedProject } from "@/data/projects";
import { iconMap, StatusBadge } from "./projectMeta";
import { ProjectDemo } from "./ProjectDemo";
import { ArrowRightIcon, ExternalIcon } from "@/components/ui/icons";

const ease = [0.16, 1, 0.3, 1] as const;

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function ProjectDetail({ project }: { project: FeaturedProject }) {
  const reduced = useReducedMotion();
  const Icon = iconMap[project.icon];
  const demoRef = useRef<HTMLDivElement>(null);

  const scrollToDemo = () =>
    demoRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });

  const hasDemo = project.demoEnabled && project.demoType !== "none";

  return (
    <main className="relative min-h-screen pt-28 pb-24">
      <div className="container-editorial">
        {/* back link */}
        <Reveal>
          <Link
            href="/#work"
            className="group inline-flex items-center gap-2 text-sm text-bone-muted transition-colors hover:text-accent-soft"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            Back to Projects
          </Link>
        </Reveal>

        {/* hero */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <Reveal delay={0.05}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-bone/[0.1] bg-accent/[0.05] text-accent-soft">
                  <Icon width={22} height={22} />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent-soft">
                  {project.category}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="mt-5 font-display text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.02] tracking-tightest text-bone">
                {project.name}
              </h1>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone-muted sm:text-lg">
                {project.longDescription ?? project.description}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} />
                {project.technologies.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {hasDemo && (
                  <button
                    onClick={scrollToDemo}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink-950 transition-all duration-500 ease-premium hover:bg-accent-soft hover:shadow-[0_10px_40px_-12px_rgba(214,169,78,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  >
                    Launch Demo
                    <span className="transition-transform duration-500 ease-premium group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-bone/[0.14] px-6 py-3 text-sm font-medium text-bone transition-colors hover:border-accent/50 hover:bg-bone/[0.03]"
                  >
                    Live Project <ExternalIcon />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-bone/[0.12] px-5 py-3 text-sm text-bone-muted transition-colors hover:border-accent/40 hover:text-bone"
                  >
                    View source <ExternalIcon />
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>

        {/* interactive demo */}
        {hasDemo && (
          <div ref={demoRef} className="mt-16 scroll-mt-24">
            <Reveal>
              <h2 className="mb-5 flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-bone">
                <span className="font-mono text-sm text-accent">▹</span>
                Interactive demo
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <ProjectDemo demoType={project.demoType} />
            </Reveal>
          </div>
        )}

        {/* features */}
        {project.features.length > 0 && (
          <div className="mt-16">
            <Reveal>
              <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-bone">
                Features
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.05}>
                  <div className="glass h-full rounded-2xl p-5">
                    <h3 className="font-display text-base font-semibold text-bone">{f.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-bone-muted">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* architecture / workflow */}
        {project.architecture.length > 0 && (
          <div className="mt-16">
            <Reveal>
              <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-bone">
                How it works
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {project.architecture.map((a, i) => (
                <Reveal key={a.step} delay={i * 0.06}>
                  <div className="relative h-full rounded-2xl border border-bone/[0.08] bg-white/[0.02] p-5">
                    <span className="font-mono text-xs text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-base font-semibold text-bone">
                      {a.step}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-bone-muted">
                      {a.detail}
                    </p>
                    {i < project.architecture.length - 1 && (
                      <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-bone-faint lg:block">
                        <ArrowRightIcon width={16} height={16} />
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* footer CTA */}
        <Reveal>
          <div className="mt-20 flex flex-col items-start gap-4 border-t border-bone/[0.08] pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-bone-muted">
              Want to see more? Head back to the full project list.
            </p>
            <Link
              href="/#work"
              className="group inline-flex items-center gap-2 text-sm font-medium text-bone transition-colors hover:text-accent-soft"
            >
              ← Back to Projects
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
