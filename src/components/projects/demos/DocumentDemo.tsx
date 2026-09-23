"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DemoShell } from "./DemoShell";

type Doc = {
  id: number;
  name: string;
  type: "PDF" | "DOCX" | "XLSX" | "IMG" | "TXT";
  category: string;
  size: string;
  modified: string;
};

const DOCS: Doc[] = [
  { id: 1, name: "Invoice-2026-014.pdf", type: "PDF", category: "Finance", size: "182 KB", modified: "2d ago" },
  { id: 2, name: "Design-system.docx", type: "DOCX", category: "Design", size: "1.2 MB", modified: "5d ago" },
  { id: 3, name: "Q3-report.xlsx", type: "XLSX", category: "Finance", size: "640 KB", modified: "1w ago" },
  { id: 4, name: "hero-mock.png", type: "IMG", category: "Design", size: "3.1 MB", modified: "1w ago" },
  { id: 5, name: "meeting-notes.txt", type: "TXT", category: "Notes", size: "12 KB", modified: "3w ago" },
  { id: 6, name: "contract-final.pdf", type: "PDF", category: "Legal", size: "410 KB", modified: "1mo ago" },
  { id: 7, name: "roadmap.docx", type: "DOCX", category: "Notes", size: "88 KB", modified: "1mo ago" },
  { id: 8, name: "budget-2026.xlsx", type: "XLSX", category: "Finance", size: "520 KB", modified: "2mo ago" },
];

const CATEGORIES = ["All", "Finance", "Design", "Legal", "Notes"];

const typeColor: Record<Doc["type"], string> = {
  PDF: "text-[#ff8f86] border-[#ff5f56]/30 bg-[#ff5f56]/[0.08]",
  DOCX: "text-[#9dc0ff] border-[#4f8bff]/30 bg-[#4f8bff]/[0.08]",
  XLSX: "text-emerald-soft border-emerald/30 bg-emerald/[0.08]",
  IMG: "text-[#d0a8f5] border-[#b06ff0]/30 bg-[#b06ff0]/[0.08]",
  TXT: "text-bone-muted border-bone/[0.2] bg-white/[0.04]",
};

export function DocumentDemo() {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<Doc | null>(null);

  const filtered = DOCS.filter(
    (d) =>
      (cat === "All" || d.category === cat) &&
      d.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <DemoShell>
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* categories */}
        <nav
          aria-label="Categories"
          className="flex shrink-0 gap-1.5 overflow-x-auto rounded-xl border border-bone/[0.08] bg-white/[0.02] p-1.5 sm:w-36 sm:flex-col"
        >
          {CATEGORIES.map((c) => {
            const count = c === "All" ? DOCS.length : DOCS.filter((d) => d.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                aria-current={cat === c}
                className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors sm:w-full ${
                  cat === c
                    ? "bg-accent/[0.12] text-accent-soft"
                    : "text-bone-muted hover:bg-white/[0.03] hover:text-bone"
                }`}
              >
                {c}
                <span className="font-mono text-[10px] text-bone-faint">{count}</span>
              </button>
            );
          })}
        </nav>

        {/* file list */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents…"
              className="flex-1 rounded-lg border border-bone/[0.1] bg-ink-950/60 px-3 py-2 text-[13px] text-bone placeholder:text-bone-faint focus:border-accent/40 focus:outline-none"
            />
            <button
              onClick={() => alert("Upload is simulated in this demo.")}
              className="shrink-0 rounded-lg border border-bone/[0.12] bg-white/[0.03] px-3 py-2 text-[13px] text-bone transition-colors hover:border-accent/40 hover:text-accent-soft"
            >
              Upload
            </button>
          </div>

          <div className="scroll-subtle max-h-64 space-y-1.5 overflow-y-auto">
            {filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => setOpen(d)}
                className="flex w-full items-center gap-3 rounded-lg border border-bone/[0.06] bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-accent/30 hover:bg-white/[0.04]"
              >
                <span
                  className={`shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[9px] ${typeColor[d.type]}`}
                >
                  {d.type}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-bone">{d.name}</span>
                <span className="hidden font-mono text-[10px] text-bone-faint sm:block">{d.size}</span>
                <span className="font-mono text-[10px] text-bone-faint">{d.modified}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-1 py-4 text-[13px] text-bone-faint">
                No documents match your search.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* details modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
              onClick={() => setOpen(null)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${open.name} details`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass relative w-full max-w-md rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${typeColor[open.type]}`}
                >
                  {open.type}
                </span>
                <button
                  onClick={() => setOpen(null)}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-bone/[0.14] text-bone transition-colors hover:border-accent/50 hover:text-accent-soft"
                >
                  ✕
                </button>
              </div>
              <h4 className="mt-3 break-words font-display text-lg font-semibold text-bone">
                {open.name}
              </h4>
              {/* faux preview */}
              <div className="mt-3 aspect-video rounded-lg border border-bone/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-3">
                <div className="space-y-2">
                  <div className="h-2 w-3/4 rounded-full bg-white/[0.1]" />
                  <div className="h-2 w-full rounded-full bg-white/[0.06]" />
                  <div className="h-2 w-5/6 rounded-full bg-white/[0.06]" />
                  <div className="h-2 w-2/3 rounded-full bg-white/[0.06]" />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">Category</dt>
                  <dd className="text-bone">{open.category}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">Size</dt>
                  <dd className="text-bone">{open.size}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">Modified</dt>
                  <dd className="text-bone">{open.modified}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">Type</dt>
                  <dd className="text-bone">{open.type}</dd>
                </div>
              </dl>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoShell>
  );
}
