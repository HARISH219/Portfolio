"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FeaturedProject } from "@/data/projects";
import { ExternalIcon } from "@/components/ui/icons";

// The interactive chat is code-split — only loads on this page.
const WhatsAppChat = dynamic(
  () => import("./previews/WhatsAppChat").then((m) => m.WhatsAppChat),
  { ssr: false },
);

const ease = [0.16, 1, 0.3, 1] as const;

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

const BADGES = ["AI", "WhatsApp", "Node.js", "API", "Automation"];

const USAGE = [
  { title: "24/7 Customer Support", body: "Answer common questions automatically, any time of day." },
  { title: "Lead Generation", body: "Respond to potential customers and collect useful information." },
  { title: "Product & Service Questions", body: "Give instant info on products, pricing, availability and services." },
  { title: "Appointment & Booking", body: "Help customers with basic booking-related conversations." },
  { title: "FAQ Automation", body: "Handle repetitive questions without a human replying every time." },
  { title: "Multilingual Support", body: "Respond in the customer's language for a natural experience." },
  { title: "Human Handoff", body: "Escalate to a real person whenever a conversation needs it." },
];

const ARCHITECTURE = [
  "Business WhatsApp",
  "WhatsApp Business Platform",
  "Webhook",
  "Node.js Backend",
  "AI Processing",
  "Response",
  "Customer WhatsApp",
];

const STEPS = [
  { n: "01", t: "Customer sends a message", d: "A customer messages the business WhatsApp number." },
  { n: "02", t: "WhatsApp forwards the message", d: "The message is delivered to the backend via a webhook." },
  { n: "03", t: "The backend processes it with AI", d: "The conversation is run through an AI model with context." },
  { n: "04", t: "The response is returned", d: "The generated reply is sent back to the customer on WhatsApp." },
];

const TECH = [
  "Node.js",
  "JavaScript",
  "WhatsApp Business Platform",
  "AI / LLM API",
  "REST APIs",
  "Webhooks",
  "Database",
];

const HIGHLIGHTS = [
  "AI-powered conversations",
  "Real-time message processing",
  "Webhook architecture",
  "Conversation context",
  "Business automation",
  "Responsive interface",
  "Error handling",
  "API integration",
];

const STATS = [
  { k: "Architecture", v: "AI + API" },
  { k: "Interface", v: "Responsive" },
  { k: "Integration", v: "WhatsApp" },
  { k: "Purpose", v: "Business automation" },
];

export function WhatsAppShowcase({ project }: { project: FeaturedProject }) {
  const reduced = useReducedMotion();
  const previewRef = useRef<HTMLDivElement>(null);
  const [usageOpen, setUsageOpen] = useState(false);

  // Lock body scroll while the usage sheet is open.
  useEffect(() => {
    document.body.style.overflow = usageOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [usageOpen]);

  const scrollToPreview = () =>
    previewRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });

  return (
    <main className="relative min-h-screen overflow-x-hidden pt-28 pb-24">
      {/* soft cyan glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 15% 8%, rgba(34,184,207,0.10), transparent 60%), radial-gradient(50% 40% at 95% 30%, rgba(88,101,242,0.08), transparent 60%)",
        }}
      />

      <div className="container-editorial">
        {/* back link */}
        <Reveal>
          <Link
            href="/#featured"
            className="group inline-flex items-center gap-2 text-sm text-bone-muted transition-colors hover:text-[#7fe0ec]"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            Back to Projects
          </Link>
        </Reveal>

        {/* ============================ HERO ============================ */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Reveal delay={0.05}>
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#7fe0ec]">
                AI / Automation / WhatsApp · Built by Harish
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-4 font-display text-[clamp(2.4rem,7vw,4.4rem)] font-bold leading-[1.0] tracking-tightest text-bone">
                WhatsApp AI
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-4 text-lg font-medium text-bone sm:text-xl">
                An AI-powered WhatsApp assistant for automated conversations.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-bone-muted">
                I built a WhatsApp AI system that lets businesses connect their own
                WhatsApp number and automatically respond to customers using AI.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-5 flex flex-wrap gap-2">
                {BADGES.map((b) => (
                  <span key={b} className="pill">
                    {b}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={scrollToPreview}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#22b8cf] px-6 py-3 text-sm font-medium text-[#04181c] transition-all duration-500 ease-premium hover:bg-[#4fd0e0] hover:shadow-[0_10px_40px_-12px_rgba(34,184,207,0.6)]"
                >
                  Live Demo
                  <span className="transition-transform duration-500 ease-premium group-hover:translate-x-1">
                    →
                  </span>
                </button>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-bone/[0.14] px-5 py-3 text-sm font-medium text-bone transition-colors hover:border-[#22b8cf]/50 hover:bg-bone/[0.03]"
                  >
                    View on GitHub <ExternalIcon />
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          {/* interactive chat — centerpiece */}
          <Reveal delay={0.2}>
            <div ref={previewRef} className="scroll-mt-24">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22b8cf]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-faint">
                  Interactive Project Preview
                </span>
              </div>
              <div className="rounded-[1.4rem] border border-[#22b8cf]/20 bg-[#22b8cf]/[0.03] p-2 shadow-[0_30px_90px_-50px_rgba(34,184,207,0.6)]">
                <WhatsAppChat heightClass="h-[460px]" />
              </div>
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setUsageOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#22b8cf]/30 bg-[#22b8cf]/[0.08] px-5 py-2.5 text-sm font-medium text-[#7fe0ec] transition-colors hover:border-[#22b8cf]/60 hover:bg-[#22b8cf]/[0.14]"
                >
                  What&apos;s the usage? ✨
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ==================== USE YOUR OWN NUMBER ==================== */}
        <Section title="Use your own business WhatsApp number" delay={0}>
          <p className="max-w-2xl text-[15px] leading-relaxed text-bone-muted">
            Businesses don&apos;t need a separate AI identity for their customers.
            The system is designed around connecting a business WhatsApp setup to an
            AI backend — so customers keep using the company&apos;s existing WhatsApp
            contact.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-2 lg:mx-auto lg:max-w-md">
            {ARCHITECTURE.map((node, i) => (
              <Reveal key={node} delay={i * 0.04}>
                <div className="flex flex-col items-center">
                  <div className="w-full rounded-xl border border-[#22b8cf]/25 bg-[#22b8cf]/[0.06] px-4 py-3 text-center text-[14px] font-medium text-bone">
                    {node}
                  </div>
                  {i < ARCHITECTURE.length - 1 && (
                    <span className="my-1 text-[#7fe0ec]" aria-hidden>
                      ↓
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ======================= WHY I BUILT IT ===================== */}
        <Section title="Why I built this" delay={0}>
          <div className="glass max-w-3xl rounded-2xl p-6">
            <p className="text-[15px] leading-relaxed text-bone-muted">
              Many businesses receive the same questions repeatedly through WhatsApp.
              I wanted to explore how AI could handle these conversations automatically
              while keeping the experience simple and familiar for customers — no new
              app to learn, just the WhatsApp they already use.
            </p>
          </div>
        </Section>

        {/* ======================== HOW IT WORKS ====================== */}
        <Section title="How it works" delay={0}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.06}>
                <div className="relative h-full rounded-2xl border border-bone/[0.08] bg-white/[0.02] p-5">
                  <span className="font-mono text-xs text-[#7fe0ec]">{s.n}</span>
                  <h3 className="mt-2 font-display text-[15px] font-semibold text-bone">
                    {s.t}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-bone-muted">
                    {s.d}
                  </p>
                  {i < STEPS.length - 1 && (
                    <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-[#7fe0ec] lg:block">
                      →
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ========================= TECH STACK ======================= */}
        <Section title="Tech stack" delay={0}>
          <div className="flex flex-wrap gap-2.5">
            {TECH.map((t, i) => (
              <Reveal key={t} delay={i * 0.03}>
                <span className="inline-flex items-center rounded-xl border border-bone/[0.1] bg-white/[0.02] px-4 py-2 text-[14px] text-bone transition-colors hover:border-[#22b8cf]/40 hover:text-[#7fe0ec]">
                  {t}
                </span>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ====================== PROJECT HIGHLIGHTS ================== */}
        <Section title="Project highlights" delay={0}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h} delay={i * 0.04}>
                <div className="flex h-full items-center gap-2 rounded-xl border border-bone/[0.08] bg-white/[0.02] p-3.5">
                  <span className="text-[#7fe0ec]">▹</span>
                  <span className="text-[13px] leading-snug text-bone">{h}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ========================= PROJECT STATS ==================== */}
        <Section title="Project at a glance" delay={0}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.k} delay={i * 0.05}>
                <div className="rounded-2xl border border-bone/[0.08] bg-white/[0.02] p-5 text-center">
                  <p className="font-display text-lg font-semibold text-bone">{s.v}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
                    {s.k}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ========================= SOURCE CODE ====================== */}
        <Reveal>
          <div className="mt-20 rounded-3xl border border-[#22b8cf]/20 bg-[#22b8cf]/[0.04] p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
              Explore the project
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-bone-muted">
              Interested in how it works? Explore the source code and implementation.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-[#7fe0ec]"
                >
                  GitHub <ExternalIcon />
                </a>
              )}
              <button
                onClick={scrollToPreview}
                className="inline-flex items-center gap-2 rounded-full border border-bone/[0.14] px-6 py-3 text-sm font-medium text-bone transition-colors hover:border-[#22b8cf]/50"
              >
                Live Demo →
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ===================== USAGE MODAL / SHEET ==================== */}
      <UsageSheet open={usageOpen} onClose={() => setUsageOpen(false)} />
    </main>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className="mt-16 sm:mt-20">
      <Reveal delay={delay}>
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
          {title}
        </h2>
      </Reveal>
      {children}
    </div>
  );
}

function UsageSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="How businesses can use WhatsApp AI"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease }}
            className="glass relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-bone/[0.08] bg-ink-900/80 px-6 py-5 backdrop-blur">
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-bone">
                  How businesses can use WhatsApp AI
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-bone-muted">
                  Automate repetitive conversations while keeping customers on the
                  platform they already use.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bone/[0.14] text-bone transition-colors hover:border-[#22b8cf]/50 hover:text-[#7fe0ec]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
              {USAGE.map((u) => (
                <div
                  key={u.title}
                  className="rounded-2xl border border-bone/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-[#22b8cf]/30"
                >
                  <h4 className="font-display text-[15px] font-semibold text-bone">
                    {u.title}
                  </h4>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-bone-muted">
                    {u.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
