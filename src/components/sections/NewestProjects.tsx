"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { newestProjects, type FeaturedProject } from "@/data/projects";
import { iconMap, StatusBadge } from "@/components/projects/projectMeta";
import { ProjectPreview, NewBadge } from "@/components/projects/previews/ProjectPreview";
import { ExternalIcon } from "@/components/ui/icons";

const ease = [0.16, 1, 0.3, 1] as const;

function GithubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function FeaturedCard({ project, index }: { project: FeaturedProject; index: number }) {
  const reduced = useReducedMotion();
  const Icon = iconMap[project.icon];
  // Alternate the preview side on desktop for an editorial rhythm.
  const flip = index % 2 === 1;

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      className="group relative overflow-hidden rounded-3xl border border-bone/[0.1] bg-white/[0.02] p-6 transition-all duration-500 ease-premium hover:-translate-y-1 hover:border-[#22b8cf]/40 hover:shadow-[0_30px_80px_-40px_rgba(34,184,207,0.55)] sm:p-8"
    >
      {/* soft cyan glow wash on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, rgba(34,184,207,0.10), transparent 70%)",
        }}
      />

      <div
        className={`relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${
          flip ? "lg:[&>*:first-child]:order-last" : ""
        }`}
      >
        {/* text side */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm text-[#7fe0ec]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-bone/[0.1] bg-[#22b8cf]/[0.08] text-[#7fe0ec]">
              <Icon width={18} height={18} />
            </span>
            {project.isNew && <NewBadge label={project.newLabel} />}
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-bone-faint">
            {project.category}
          </p>
          <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-bone sm:text-4xl">
            {project.name}
          </h3>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-bone-muted">
            {project.tagline ?? project.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {project.technologies.slice(0, 4).map((t) => (
              <span key={t} className="pill">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/projects/${project.slug}`}
              className="group/btn inline-flex items-center gap-2 rounded-full bg-[#22b8cf] px-5 py-2.5 text-sm font-medium text-[#04181c] transition-all duration-500 ease-premium hover:bg-[#4fd0e0] hover:shadow-[0_10px_40px_-12px_rgba(34,184,207,0.6)]"
            >
              View Case Study
              <span className="transition-transform duration-500 ease-premium group-hover/btn:translate-x-1">
                →
              </span>
            </Link>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-bone/[0.14] px-4 py-2.5 text-sm text-bone-muted transition-colors hover:border-[#22b8cf]/40 hover:text-bone"
              >
                <GithubMark /> GitHub
              </a>
            )}
          </div>
        </div>

        {/* preview side */}
        <div className="relative">
          <div className="transition-transform duration-700 ease-premium group-hover:scale-[1.02]">
            <ProjectPreview kind={project.preview} className="mx-auto max-w-[320px] lg:max-w-none" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function NewestProjects() {
  if (newestProjects.length === 0) return null;

  return (
    <section id="featured" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="Newest builds"
          title="Featured Projects"
          subtitle="My latest and most ambitious builds — shipped, not just imagined."
        />

        <div className="mt-12 flex flex-col gap-6 sm:gap-8">
          {newestProjects.map((project, i) => (
            <FeaturedCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
