"use client";

import { useEffect, useRef, useState } from "react";
import { Crystal } from "./Crystal";

// -----------------------------------------------------------------------------
// CrystalField
// A fixed, full-viewport space background: near-black depth gradients, tiny
// twinkling particles, and floating golden crystals that parallax at different
// speeds as the page scrolls (travelling-through-space feel).
//
// Performance: one rAF-throttled scroll listener writes transforms directly to
// each crystal's ref (no React re-renders per frame). Disabled entirely for
// prefers-reduced-motion; particle/crystal counts drop on small screens.
// -----------------------------------------------------------------------------

type CrystalSpec = {
  size: number;
  top: string;
  left: string;
  // parallax multiplier: how many px it moves per px scrolled (can be negative)
  speed: number;
  depth: number; // 0 (far) .. 1 (near) — drives blur/opacity/scale
  drift: "drift" | "driftAlt";
  duration: number;
  rotate: number;
};

// Desktop layout — spread around the edges so the center stays readable.
const DESKTOP: CrystalSpec[] = [
  { size: 120, top: "6%", left: "3%", speed: -0.18, depth: 0.9, drift: "drift", duration: 15, rotate: -18 },
  { size: 54, top: "16%", left: "44%", speed: 0.32, depth: 0.4, drift: "driftAlt", duration: 20, rotate: 12 },
  { size: 90, top: "60%", left: "6%", speed: 0.12, depth: 0.7, drift: "driftAlt", duration: 17, rotate: 24 },
  { size: 40, top: "82%", left: "22%", speed: 0.42, depth: 0.3, drift: "drift", duration: 22, rotate: -8 },
  { size: 150, top: "72%", left: "-4%", speed: -0.1, depth: 1, drift: "drift", duration: 19, rotate: 8 },
  { size: 64, top: "4%", left: "72%", speed: 0.26, depth: 0.5, drift: "driftAlt", duration: 21, rotate: -14 },
  { size: 110, top: "40%", left: "92%", speed: -0.22, depth: 0.85, drift: "drift", duration: 16, rotate: 20 },
  { size: 46, top: "88%", left: "84%", speed: 0.38, depth: 0.35, drift: "driftAlt", duration: 23, rotate: 10 },
  { size: 130, top: "14%", left: "88%", speed: 0.08, depth: 0.95, drift: "drift", duration: 18, rotate: -22 },
  { size: 36, top: "50%", left: "58%", speed: 0.48, depth: 0.25, drift: "driftAlt", duration: 24, rotate: 16 },
];

// Lightweight subset for small screens.
const MOBILE: CrystalSpec[] = [
  { size: 90, top: "8%", left: "-6%", speed: -0.14, depth: 0.9, drift: "drift", duration: 16, rotate: -14 },
  { size: 44, top: "34%", left: "82%", speed: 0.3, depth: 0.4, drift: "driftAlt", duration: 20, rotate: 12 },
  { size: 70, top: "70%", left: "-8%", speed: 0.12, depth: 0.7, drift: "driftAlt", duration: 18, rotate: 20 },
  { size: 40, top: "86%", left: "78%", speed: 0.36, depth: 0.3, drift: "drift", duration: 22, rotate: -8 },
];

function depthStyle(depth: number) {
  // Farther crystals: smaller, blurrier, dimmer.
  const blur = (1 - depth) * 5;
  const opacity = 0.22 + depth * 0.5;
  const scale = 0.7 + depth * 0.5;
  return {
    filter: `blur(${blur.toFixed(1)}px) drop-shadow(0 0 ${(depth * 22).toFixed(
      0,
    )}px rgba(214,169,78,${(depth * 0.25).toFixed(2)}))`,
    opacity,
    ["--xtl-scale" as string]: scale.toFixed(2),
  } as React.CSSProperties;
}

export function CrystalField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!reduce);
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    setReady(true);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const specs = isMobile ? MOBILE : DESKTOP;

  useEffect(() => {
    if (!enabled || !ready) return;

    let raf = 0;
    let lastY = -1;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (y === lastY) return;
      lastY = y;
      specs.forEach((spec, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        const translate = -(y * spec.speed);
        el.style.transform = `translate3d(0, ${translate.toFixed(1)}px, 0)`;
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // Re-bind when the spec set (mobile/desktop) or enabled state changes.
  }, [enabled, ready, specs]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950"
    >
      {/* deep space gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, rgba(214,169,78,0.08), transparent 55%), radial-gradient(90% 80% at 90% 20%, rgba(214,169,78,0.05), transparent 60%), radial-gradient(140% 120% at 50% 120%, rgba(120,90,40,0.06), transparent 60%)",
        }}
      />

      {/* tiny particles / stars */}
      <Particles count={isMobile ? 26 : 60} animate={enabled} />

      {/* floating crystals with per-layer parallax */}
      {specs.map((spec, i) => (
        <div
          key={i}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className="absolute will-change-transform"
          style={{ top: spec.top, left: spec.left }}
        >
          <div
            className={enabled ? `animate-${spec.drift}` : ""}
            style={{ animationDuration: `${spec.duration}s` }}
          >
            <Crystal
              size={spec.size}
              style={{
                ...depthStyle(spec.depth),
                transform: `rotate(${spec.rotate}deg) scale(var(--xtl-scale, 1))`,
              }}
            />
          </div>
        </div>
      ))}

      {/* subtle vignette to keep edges from feeling busy */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(5,5,5,0.6) 100%)",
        }}
      />
    </div>
  );
}

function Particles({ count, animate }: { count: number; animate: boolean }) {
  // Deterministic pseudo-random positions so SSR and client markup match.
  const dots = Array.from({ length: count }, (_, i) => {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 12543.987) % 1;
    const s = (Math.sin(i * 3.14) * 1000) % 1;
    return {
      left: `${(Math.abs(x) * 100).toFixed(2)}%`,
      top: `${(Math.abs(y) * 100).toFixed(2)}%`,
      size: Math.abs(s) > 0.85 ? 2 : 1,
      delay: (Math.abs(x) * 6).toFixed(2),
    };
  });

  return (
    <div className="absolute inset-0">
      {dots.map((d, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-accent-soft ${animate ? "animate-twinkle" : ""}`}
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            opacity: 0.35,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
