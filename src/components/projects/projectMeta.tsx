import type { ComponentType, SVGProps } from "react";
import {
  PortfolioIcon,
  BotIcon,
  ShieldIcon,
  CubeIcon,
  TerminalIcon,
  DocIcon,
  ChartIcon,
  SparkIcon,
  GridIcon,
} from "@/components/ui/icons";
import type { FeaturedIcon, FeaturedStatus } from "@/data/projects";

// Shared icon lookup used by cards and project pages (single source).
export const iconMap: Record<FeaturedIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  portfolio: PortfolioIcon,
  bot: BotIcon,
  shield: ShieldIcon,
  cube: CubeIcon,
  terminal: TerminalIcon,
  doc: DocIcon,
  chart: ChartIcon,
  spark: SparkIcon,
  grid: GridIcon,
};

// Status → colour treatment for the little pill/dot.
export const statusStyle: Record<
  FeaturedStatus,
  { dot: string; text: string; border: string; bg: string; ping: boolean }
> = {
  LIVE: {
    dot: "bg-emerald",
    text: "text-emerald-soft",
    border: "border-emerald/25",
    bg: "bg-emerald/[0.08]",
    ping: true,
  },
  "INTERACTIVE DEMO": {
    dot: "bg-accent",
    text: "text-accent-soft",
    border: "border-accent/25",
    bg: "bg-accent/[0.08]",
    ping: false,
  },
  "IN DEVELOPMENT": {
    dot: "bg-[#4f8bff]",
    text: "text-[#9dc0ff]",
    border: "border-[#4f8bff]/25",
    bg: "bg-[#4f8bff]/[0.08]",
    ping: false,
  },
  ARCHIVED: {
    dot: "bg-bone-faint",
    text: "text-bone-faint",
    border: "border-bone/[0.15]",
    bg: "bg-white/[0.03]",
    ping: false,
  },
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: FeaturedStatus;
  className?: string;
}) {
  const s = statusStyle[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border ${s.border} ${s.bg} px-3 py-1 ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {s.ping && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-60`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
      </span>
      <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${s.text}`}>
        {status}
      </span>
    </span>
  );
}
