"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects, type Project } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

export function Work() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <section id="work" className="scroll-mt-24 py-28 sm:py-36">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="01 — Work"
          title="Selected Work"
          subtitle="A few things I've built, experimented with, and shipped."
        />

        <div className="mt-16 flex flex-col gap-8 sm:gap-12">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              onOpen={setActive}
            />
          ))}
        </div>
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
