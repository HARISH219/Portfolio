"use client";

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
