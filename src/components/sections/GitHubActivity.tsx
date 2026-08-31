"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/data/site";
import { projects } from "@/data/projects";

// Placeholder contribution grid. This is intentionally illustrative — no real
// repository data is fabricated. Wire a GitHub API/GraphQL fetch here later to
// replace `cells` with actual contribution counts.
const WEEKS = 26;
const DAYS = 7;

const level = (n: number) => {
  const map = [
    "bg-bone/[0.04]",
    "bg-accent/20",
    "bg-accent/40",
    "bg-accent/65",
    "bg-accent",
  ];
  return map[n];
};

// Deterministic illustrative pattern (not real data).
const cells = Array.from({ length: WEEKS * DAYS }, (_, i) => {
  const v = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * 1.4 + 1.6;
  return Math.max(0, Math.min(4, Math.round(v)));
});

export function GitHubActivity() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="05 — Activity"
          title="On GitHub"
          subtitle="Where most of the building actually happens."
        />

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-3xl border border-bone/[0.1] bg-ink-900/40 p-6 sm:p-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-xl font-semibold text-bone">
                  @{site.githubUsername}
                </p>
                <p className="mt-1 text-sm text-bone-muted">
                  Projects, experiments, and works in progress.
                </p>
              </div>
              <ButtonLink href={site.githubUrl} variant="ghost" arrow external>
                GitHub profile
              </ButtonLink>
            </div>

            {/* illustrative contribution grid */}
            <div className="mt-9 overflow-x-auto">
              <div
                className="grid w-max gap-1"
                style={{ gridTemplateRows: `repeat(${DAYS}, 1fr)`, gridAutoFlow: "column" }}
                aria-hidden
              >
                {cells.map((c, i) => (
                  <span key={i} className={`h-3 w-3 rounded-[3px] ${level(c)}`} />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((n) => (
                  <span key={n} className={`h-3 w-3 rounded-[3px] ${level(n)}`} />
                ))}
                <span>More</span>
                <span className="ml-3 normal-case tracking-normal opacity-70">
                  (illustrative — connect GitHub to show real activity)
                </span>
              </div>
            </div>

            {/* recent projects */}
            <div className="mt-9 border-t border-bone/[0.08] pt-7">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-faint">
                Recent projects
              </span>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {projects.map((p) => (
                  <a
                    key={p.slug}
                    href="#work"
                    className="group rounded-xl border border-bone/[0.08] bg-ink-950/40 p-4 transition-colors hover:border-accent/30"
                  >
                    <span className="font-mono text-[10px] text-accent">{p.number}</span>
                    <p className="mt-1 font-display text-sm font-semibold text-bone">
                      {p.name}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
                      {p.tags[0]} · {p.tags[1]}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
