"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { techStack } from "@/data/tech";

export function TechStack() {
  return (
    <section className="py-28 sm:py-36">
      <div className="container-editorial">
        <SectionHeading eyebrow="03 — Stack" title="Tools I work with" />

        <div className="mt-14 grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2">
          {techStack.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.05}>
              <div className="border-t border-bone/[0.1] pt-6">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft">
                  {cat.label}
                </h3>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {cat.items.map((item) => (
                    <span key={item} className="pill pill-interactive cursor-default">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
