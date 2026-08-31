"use client";

import { Reveal } from "./Reveal";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  id,
}: Props) {
  return (
    <div
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}
    >
      {eyebrow && (
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          id={id}
          className="mt-4 font-display text-4xl font-semibold tracking-tightest text-bone sm:text-5xl md:text-6xl"
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p
            className={`mt-5 text-base text-bone-muted sm:text-lg ${
              align === "center" ? "mx-auto" : ""
            } max-w-xl`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
