"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/data/site";

const links = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Experiments", href: "#experiments" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll while mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`transition-all duration-500 ease-premium ${
          scrolled
            ? "border-b border-bone/[0.08] bg-ink-950/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="container-editorial flex h-16 items-center justify-between">
          <Link
            href="#top"
            className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-bone transition-colors hover:text-accent-soft"
          >
            {site.name}
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-sm text-bone-muted transition-colors duration-300 hover:text-bone"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 ease-premium group-hover:w-full" />
              </a>
            ))}
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/[0.12] text-bone transition-colors hover:border-accent/50 md:hidden"
          >
            <div className="relative h-3 w-4">
              <span
                className={`absolute left-0 h-px w-4 bg-bone transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-px w-4 bg-bone transition-all duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-bone transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </div>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-16 z-40 bg-ink-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-editorial flex flex-col gap-2 py-10">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.05 }}
                  className="border-b border-bone/[0.06] py-5 font-display text-3xl font-medium tracking-tight text-bone"
                >
                  {l.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
