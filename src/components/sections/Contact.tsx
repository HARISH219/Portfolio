"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { site, visibleSocials } from "@/data/site";

export function Contact() {
  const socials = visibleSocials();

  return (
    <section id="contact" className="scroll-mt-24 py-32 sm:py-44">
      <div className="container-editorial">
        <div className="relative overflow-hidden rounded-[2rem] border border-bone/[0.1] bg-gradient-to-b from-ink-850 to-ink-950 px-6 py-20 sm:px-16 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(200,162,106,0.09), transparent 70%)",
            }}
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <Reveal>
              <span className="eyebrow">06 — Contact</span>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 className="mt-6 font-display text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[1.02] tracking-tightest text-bone">
                Have an idea?
                <br />
                Let&apos;s <span className="text-accent">build it.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-bone-muted sm:text-lg">
                Whether it&apos;s a project, collaboration, experiment, or just an
                interesting idea — I&apos;d love to hear about it.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <ButtonLink href={`mailto:${site.email}`} variant="primary" arrow>
                  Start a conversation
                </ButtonLink>
                <ButtonLink href={site.githubUrl} variant="ghost" external>
                  View GitHub
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <ContactForm />
            </Reveal>

            {socials.length > 0 && (
              <Reveal delay={0.2}>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-bone-muted transition-colors hover:text-bone"
                    >
                      {s.label}
                      <span className="text-bone-faint transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-accent">
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState("sent");
        setName(""); setEmail(""); setSubject(""); setMessage("");
      } else {
        setState("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-bone/[0.12] bg-ink-950/60 px-4 py-3 text-sm text-bone outline-none transition-colors placeholder:text-bone-faint focus:border-accent/50";

  if (state === "sent") {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-emerald/30 bg-emerald/[0.06] px-6 py-8 text-center">
        <p className="font-display text-lg font-semibold text-bone">Message sent — thank you.</p>
        <p className="mt-1 text-sm text-bone-muted">I&apos;ll get back to you soon.</p>
        <button onClick={() => setState("idle")} className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-accent hover:text-accent-soft">
          Send another ↗
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-12 max-w-xl text-left">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} aria-label="Your name" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={inputCls} aria-label="Your email" />
      </div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" className={`${inputCls} mt-3`} aria-label="Subject" />
      <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message" rows={5} className={`${inputCls} mt-3 resize-none`} aria-label="Your message" />

      {state === "error" && <p className="mt-3 text-sm text-[#e0736b]">{errorMsg}</p>}

      <div className="mt-4 flex justify-center">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-full border border-accent/40 bg-accent/[0.08] px-7 py-3 font-mono text-xs uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent/[0.14] disabled:opacity-60"
        >
          {state === "sending" ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}

