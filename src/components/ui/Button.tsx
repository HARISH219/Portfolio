"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost";

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-all duration-500 ease-premium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950";

const variants: Record<Variant, string> = {
  primary:
    "bg-bone text-ink-950 hover:bg-accent-soft hover:shadow-[0_10px_40px_-12px_rgba(200,162,106,0.5)]",
  ghost:
    "border border-bone/[0.14] bg-transparent text-bone hover:border-accent/50 hover:bg-bone/[0.03]",
};

function Arrow() {
  return (
    <span
      aria-hidden
      className="inline-block translate-x-0 transition-transform duration-500 ease-premium group-hover:translate-x-1"
    >
      →
    </span>
  );
}

type ButtonLinkProps = CommonProps & {
  href: string;
  external?: boolean;
};

export function ButtonLink({
  children,
  href,
  variant = "primary",
  arrow,
  external,
  className = "",
}: ButtonLinkProps) {
  const classes = `${base} ${variants[variant]} ${className}`;
  const content = (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  );

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noreferrer noopener"
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

type ButtonActionProps = CommonProps & {
  onClick?: () => void;
  type?: "button" | "submit";
};

export function ButtonAction({
  children,
  onClick,
  variant = "primary",
  arrow,
  type = "button",
  className = "",
}: ButtonActionProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
