import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent-soft">
        404
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-bone sm:text-4xl">
        Project not found
      </h1>
      <p className="mt-3 max-w-md text-bone-muted">
        That project doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/#work"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-accent-soft"
      >
        ← Back to Projects
      </Link>
    </main>
  );
}
