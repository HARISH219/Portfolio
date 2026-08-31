import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-bone/[0.08]">
      <div className="container-editorial flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-bone">
          {site.name}
        </span>
        <span className="text-sm text-bone-muted">Built with curiosity.</span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
          © 2026 {site.name}
        </span>
      </div>
    </footer>
  );
}
