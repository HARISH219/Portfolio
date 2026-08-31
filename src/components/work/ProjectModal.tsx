"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProjectPreview } from "./ProjectPreview";
import { ButtonLink } from "@/components/ui/Button";

const ease = [0.16, 1, 0.3, 1] as const;

function DetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft">
        {title}
      </h4>
      <p className="mt-2 text-[15px] leading-relaxed text-bone-muted">{body}</p>
    </div>
  );
}

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="fixed inset-0 bg-ink-950/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} details`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.5, ease }}
            className="relative my-4 w-full max-w-3xl overflow-hidden rounded-3xl border border-bone/[0.1] bg-ink-900"
          >
            {/* header preview */}
            <div className="relative aspect-[16/9] w-full">
              <ProjectPreview project={project} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-bone/[0.14] bg-ink-950/60 text-bone backdrop-blur-md transition-colors hover:border-accent/50 hover:text-accent-soft"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-9">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-bone-faint">
                  {project.number}
                </span>
                <StatusBadge status={project.status} />
              </div>

              <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
                {project.name}
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2">
                <DetailBlock title="Overview" body={project.detail.overview} />
                <DetailBlock title="The Problem" body={project.detail.problem} />
                <DetailBlock title="What I Built" body={project.detail.built} />
                <DetailBlock title="How It Works" body={project.detail.howItWorks} />
                <DetailBlock title="Technology" body={project.detail.technology} />
                <DetailBlock title="Challenges" body={project.detail.challenges} />
              </div>

              <div className="mt-7 border-t border-bone/[0.08] pt-7">
                <DetailBlock title="Result" body={project.detail.result} />
              </div>

              {(project.liveUrl || project.githubUrl) && (
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-faint self-center">
                    Links
                  </span>
                  {project.liveUrl && (
                    <ButtonLink href={project.liveUrl} variant="primary" arrow external>
                      View project
                    </ButtonLink>
                  )}
                  {project.githubUrl && (
                    <ButtonLink href={project.githubUrl} variant="ghost" external>
                      GitHub
                    </ButtonLink>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
