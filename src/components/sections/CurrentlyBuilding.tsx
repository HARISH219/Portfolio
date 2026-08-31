"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getProject, currentlyBuildingSlug } from "@/data/projects";

export function CurrentlyBuilding() {
  const project = getProject(currentlyBuildingSlug);
  if (!project) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="container-editorial">
        <SectionHeading eyebrow="Right now" title="Currently Building" />

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-3xl border border-bone/[0.1] bg-gradient-to-br from-ink-800 to-ink-900">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_0.8fr]">
              <div className="p-8 sm:p-12">
                <span className="inline-flex items-center gap-2.5 rounded-full border border-[#27c93f]/25 bg-[#27c93f]/[0.06] px-3.5 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#27c93f] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#27c93f]" />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8fe6a6]">
                    Live project
                  </span>
                </span>

                <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
                  {project.name}
                </h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-bone-muted">
                  Exploring ways to detect synthetic and AI-generated voices from
                  call audio.
                </p>

                {/* progress indicator — phase, not a fake percentage */}
                <div className="mt-8">
                  <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-bone-faint">
                    <span>Status</span>
                    <span className="text-accent-soft">In Development</span>
                  </div>
                  <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-bone/[0.06]">
                    <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-accent-deep to-accent" />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
                    <span>Explore</span>
                    <span>Build</span>
                    <span>Ship</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-5 text-sm">
                  <a
                    href="#work"
                    className="group inline-flex items-center gap-2 font-medium text-bone transition-colors hover:text-accent-soft"
                  >
                    View project
                    <span className="transition-transform duration-500 ease-premium group-hover:translate-x-1.5">
                      →
                    </span>
                  </a>
                  {project.lastUpdated && (
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone-faint">
                      Last updated · {project.lastUpdated}
                    </span>
                  )}
                </div>
              </div>

              {/* subtle visual side */}
              <div className="relative hidden min-h-[280px] border-l border-bone/[0.06] lg:block">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(70% 60% at 70% 40%, rgba(200,162,106,0.1), transparent 70%)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-end gap-1.5">
                    {[16, 28, 20, 40, 24, 34, 18, 30, 22].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-full bg-accent/40 animate-pulseDot"
                        style={{ height: h, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
                <span className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-faint">
                  audio · analysis
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
