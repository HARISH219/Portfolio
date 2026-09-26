import type { PreviewKind } from "@/data/projects";
import { WhatsAppPreview } from "./WhatsAppPreview";
import { MedicinePreview } from "./MedicinePreview";

// Renders the right mockup UI preview for a project, or nothing if none.
export function ProjectPreview({
  kind,
  className = "",
}: {
  kind: PreviewKind | undefined;
  className?: string;
}) {
  if (kind === "whatsapp") return <WhatsAppPreview className={className} />;
  if (kind === "medicine") return <MedicinePreview className={className} />;
  return null;
}

// Small animated "✦ NEW" badge. Subtle pulse; grows a touch on hover via the
// group class from its parent card.
export function NewBadge({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22b8cf]/40 bg-[#22b8cf]/[0.1] px-2.5 py-1 transition-transform duration-500 ease-premium group-hover:scale-105">
      <span className="text-[#7fe0ec] animate-pulseDot">✦</span>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7fe0ec]">
        {label ?? "New"}
      </span>
    </span>
  );
}
