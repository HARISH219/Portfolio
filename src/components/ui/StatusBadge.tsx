import type { ProjectStatus } from "@/data/projects";

const config: Record<
  ProjectStatus,
  { dot: string; text: string }
> = {
  Active: { dot: "bg-[#27c93f]", text: "text-[#8fe6a6]" },
  Live: { dot: "bg-[#27c93f]", text: "text-[#8fe6a6]" },
  "In Development": { dot: "bg-accent", text: "text-accent-soft" },
  Archived: { dot: "bg-bone-faint", text: "text-bone-faint" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-bone/[0.1] bg-ink-950/40 px-3 py-1">
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${c.text}`}>
        {status}
      </span>
    </span>
  );
}
