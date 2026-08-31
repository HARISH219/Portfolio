"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProjectPreview } from "./ProjectPreview";

export function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, on: false });

  // Alternate layout direction for an asymmetric editorial feel.
  const flip = index % 2 === 1;

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      on: true,
    });
  };

  return (
    <motion.article
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, on: false }))}
      onClick={() => onOpen(project)}
      className="group relative grid cursor-pointer grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-bone/[0.08] bg-ink-900/40 p-4 transition-all duration-500 ease-premium hover:-translate-y-1 hover:border-accent/25 sm:p-6 lg:grid-cols-2 lg:gap-12"
    >
      {/* cursor-following highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: glow.on
            ? `radial-gradient(360px circle at ${glow.x}% ${glow.y}%, rgba(200,162,106,0.09), transparent 60%)`
            : "transparent",
        }}
      />

      {/* preview */}
      <div
        className={`relative aspect-[16/10] overflow-hidden rounded-2xl ${
          flip ? "lg:order-last" : ""
        }`}
      >
        <div className="h-full w-full transition-transform duration-700 ease-premium group-hover:scale-[1.04]">
          <ProjectPreview project={project} />
        </div>
      </div>

      {/* content */}
      <div className="relative px-2 pb-4 lg:px-0 lg:pb-0">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-accent">{project.number}</span>
          <span className="h-px flex-1 bg-bone/[0.1]" />
          <StatusBadge status={project.status} />
        </div>

        <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
          {project.name}
        </h3>

        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-bone-muted">
          {project.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="pill">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-5">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-bone transition-colors group-hover:text-accent-soft">
            View project
            <span className="transition-transform duration-500 ease-premium group-hover:translate-x-1.5">
              →
            </span>
          </span>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-bone-faint underline-offset-4 transition-colors hover:text-bone hover:underline"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
