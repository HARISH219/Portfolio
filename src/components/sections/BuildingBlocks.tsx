"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProjects, type FeaturedProject } from "@/data/projects";
import { iconMap, statusStyle } from "@/components/projects/projectMeta";
import { ArrowRightIcon, ExternalIcon } from "@/components/ui/icons";

// Distribute the projects across N columns (round-robin) so every column has a
// balanced mix, then give each column its own direction + speed.
const COLUMN_COUNT = 3;
const columnConfig = [
  { down: false, duration: 34 },
  { down: true, duration: 44 },
  { down: false, duration: 38 },
];

function buildColumns(items: FeaturedProject[], count: number) {
  const cols: FeaturedProject[][] = Array.from({ length: count }, () => []);
  items.forEach((item, i) => cols[i % count].push(item));
  return cols;
}

function Card({ project }: { project: FeaturedProject }) {
  const Icon = iconMap[project.icon];
  const s = statusStyle[project.status];

  const cardClass =
    "group/card block cursor-pointer rounded-2xl border border-bone/[0.08] bg-white/[0.02] p-4 transition-all duration-500 ease-premium hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/[0.04] hover:shadow-[0_18px_50px_-24px_rgba(214,169,78,0.5)] focus:outline-none focus-visible:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent/40";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-bone/[0.1] bg-accent/[0.05] text-accent-soft transition-colors duration-500 group-hover/card:border-accent/40">
          <Icon width={20} height={20} />
        </span>
        {!project.external && (
          <span className={`inline-flex items-center gap-1.5 rounded-full border ${s.border} ${s.bg} px-2 py-0.5`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            <span className={`font-mono text-[9px] uppercase tracking-[0.16em] ${s.text}`}>
              {project.status === "INTERACTIVE DEMO" ? "Demo" : project.status}
            </span>
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-[15px] font-semibold text-bone">
        {project.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-bone-muted">
        {project.description}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-md border border-accent/20 bg-accent/[0.06] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-accent-soft">
          {project.category}
        </span>
        <span className="text-bone-faint transition-all duration-500 ease-premium group-hover/card:translate-x-1 group-hover/card:text-accent-soft">
          {project.external ? <ExternalIcon width={16} height={16} /> : <ArrowRightIcon width={16} height={16} />}
        </span>
      </div>
    </>
  );

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

function MarqueeColumn({
  items,
  down,
  duration,
}: {
  items: FeaturedProject[];
  down: boolean;
  duration: number;
}) {
  // Two copies of the list make the -50% translate loop seamless. On hover we
  // pause the whole column so cards are comfortable to read/click.
  return (
    <div className="group/col marquee-mask relative h-full overflow-hidden">
      <div
        className={`marquee-track flex flex-col ${down ? "marquee-track-down" : ""}`}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {/* Two identical copies + uniform per-item bottom margin means the total
            track height is an exact multiple of (card + gap), so translating by
            -50% lands on a clean boundary => no visible reset. */}
        {[...items, ...items].map((project, i) => (
          <div key={`${project.name}-${i}`} className="mb-4">
            <Card project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BuildingBlocks() {
  const reduced = useReducedMotion();
  const columns = buildColumns(featuredProjects, COLUMN_COUNT);

  return (
    <section id="projects" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="In motion"
          title="Things I'm building"
          subtitle="A living wall of projects and experiments. Every card opens its own interactive project page."
        />
      </div>

      {reduced ? (
        // Reduced motion: a plain responsive grid, no movement.
        <div className="container-editorial mt-14">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <Card key={project.name} project={project} />
            ))}
          </div>
        </div>
      ) : (
        <div className="container-editorial mt-14">
          {/* Mobile: single scrolling column. Larger screens: 2–3 columns. */}
          <div className="grid h-[480px] grid-cols-1 gap-4 sm:h-[560px] sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((col, i) => (
              <div
                key={i}
                className={i === 2 ? "hidden lg:block" : i === 1 ? "hidden sm:block" : ""}
              >
                <MarqueeColumn
                  items={col}
                  down={columnConfig[i].down}
                  duration={columnConfig[i].duration}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
