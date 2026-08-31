import type { Project } from "@/data/projects";

// An abstract, generated preview instead of a stock photo.
// Uses the project's accent gradient plus a light "interface" motif.
export function ProjectPreview({
  project,
  className = "",
}: {
  project: Project;
  className?: string;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-ink-850 ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${project.accent}`} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(242,240,234,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,240,234,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* faux interface motif */}
      <div className="absolute inset-6 rounded-xl border border-bone/[0.08] bg-ink-950/30 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 border-b border-bone/[0.06] px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-bone/20" />
          <span className="h-2 w-2 rounded-full bg-bone/20" />
          <span className="h-2 w-2 rounded-full bg-bone/20" />
        </div>
        <div className="space-y-2.5 p-4">
          <div className="h-2 w-3/5 rounded-full bg-bone/[0.12]" />
          <div className="h-2 w-4/5 rounded-full bg-bone/[0.07]" />
          <div className="h-2 w-2/5 rounded-full bg-bone/[0.07]" />
          <div className="mt-4 flex gap-2">
            <span className="h-6 w-16 rounded-md bg-accent/20" />
            <span className="h-6 w-12 rounded-md bg-bone/[0.06]" />
          </div>
        </div>
      </div>

      <span className="absolute right-5 top-5 font-mono text-[64px] font-bold leading-none text-bone/[0.06]">
        {project.number}
      </span>
    </div>
  );
}
