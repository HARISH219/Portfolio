"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// -----------------------------------------------------------------------------
// CodeAtmosphere
// A minimal, premium background for the portfolio: an almost-black canvas with
// tiny "floating code" particles, subtle gold ambient glows, faint orbital
// curves, an edge micro-grid, and a soft cursor light.
//
// Behaviour:
//  - 3 depth layers with different sizes/opacities/parallax speeds.
//  - Continuous slow drift + tiny rotation (like dust in a dark room).
//  - Scroll parallax (rAF-throttled) — layers move at different speeds.
//  - Soft mouse repulsion within a radius (desktop only), eased return.
//  - A radial cursor glow driven by CSS vars.
//  - Respects prefers-reduced-motion (renders static particles, no motion).
//
// Performance: particles are created once (deterministic seed so SSR matches);
// a single rAF loop writes `transform` directly to each particle ref — no React
// re-renders per frame, no layout thrash (transform/opacity only).
// -----------------------------------------------------------------------------

export type CodeAtmosphereConfig = {
  /** Particle counts per viewport size. */
  desktopCount?: number;
  tabletCount?: number;
  mobileCount?: number;
  /** How strongly particles react to scroll (px per px scrolled, layer 3). */
  parallaxStrength?: number;
  /** Mouse repulsion radius in px (desktop only). */
  mouseRadius?: number;
  /** Gold accent (matches the site's identity). */
  gold?: string;
  /** Cursor-glow intensity (0..1 alpha at center). */
  glowIntensity?: number;
};

const DEFAULTS: Required<CodeAtmosphereConfig> = {
  desktopCount: 48,
  tabletCount: 30,
  mobileCount: 18,
  parallaxStrength: 0.14,
  mouseRadius: 120,
  gold: "212,166,77",
  glowIntensity: 0.045,
};

// Tiny programming-related tokens — atmospheric, never readable blocks.
const TOKENS = [
  "<>", "</>", "{}", "[]", "()", "=>", "&&", "||", "//", "/*", "*/", ";", ":",
  "_", "#", "$", "0x", "01", "const", "let", "var", "async", "await", "import",
  "export", "return", "null", "true", "false", "npm", "API", "git", "function",
  "class", "Node", "JS", "CSS", "HTML", ".map", "()=>{}", "===", "??",
];

// Deterministic PRNG (mulberry32) so server + client render identically and the
// layout is stable across renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Layer = 0 | 1 | 2;

type Particle = {
  token: string;
  xPct: number; // base position (% of viewport)
  yPct: number;
  size: number; // px
  opacity: number;
  color: "white" | "gold";
  layer: Layer;
  rot: number; // base rotation deg
  // motion params
  driftX: number; // px amplitude
  driftY: number;
  driftSpeed: number; // rad/ms
  driftPhase: number;
  rotSpeed: number; // deg/ms
};

// Layer tuning: [sizeMin, sizeMax, parallaxFactor, baseOpacityScale].
const LAYER_CFG: Record<Layer, { sizeMin: number; sizeMax: number; parallax: number }> = {
  0: { sizeMin: 8, sizeMax: 10, parallax: 0.35 }, // far: small, slow
  1: { sizeMin: 9, sizeMax: 12, parallax: 0.7 }, // mid
  2: { sizeMin: 12, sizeMax: 14, parallax: 1 }, // near: bigger, faster
};

function buildParticles(count: number, gold: string): Particle[] {
  const rand = mulberry32(0x9e3779b9 ^ count);
  const list: Particle[] = [];

  for (let i = 0; i < count; i++) {
    // Layer distribution: mostly far, few near.
    const r = rand();
    const layer: Layer = r < 0.55 ? 0 : r < 0.85 ? 1 : 2;
    const cfg = LAYER_CFG[layer];

    // Position — bias away from the central hero reading area. We pick a point
    // and, if it lands in the central column/upper band, nudge it outward.
    let xPct = rand() * 100;
    let yPct = rand() * 100;
    const centralX = xPct > 28 && xPct < 72;
    const heroBand = yPct > 12 && yPct < 52;
    if (centralX && heroBand) {
      // push toward an edge
      xPct = xPct < 50 ? xPct * 0.5 : 100 - (100 - xPct) * 0.5;
    }

    const size = cfg.sizeMin + rand() * (cfg.sizeMax - cfg.sizeMin);

    // Opacity + colour: mostly faint white, some gold, a few brighter gold.
    const isGold = rand() < 0.32;
    let opacity: number;
    if (isGold) {
      const strong = rand() < 0.12;
      opacity = strong ? 0.16 + rand() * 0.04 : 0.08 + rand() * 0.08; // .08-.20
    } else {
      opacity = 0.04 + rand() * 0.04; // .04-.08
    }
    // Near layer slightly brighter.
    if (layer === 2) opacity = Math.min(0.2, opacity * 1.15);

    list.push({
      token: TOKENS[Math.floor(rand() * TOKENS.length)],
      xPct,
      yPct,
      size,
      opacity,
      color: isGold ? "gold" : "white",
      layer,
      rot: (rand() - 0.5) * 24,
      driftX: 6 + rand() * 14,
      driftY: 8 + rand() * 18,
      driftSpeed: 0.00006 + rand() * 0.00010,
      driftPhase: rand() * Math.PI * 2,
      rotSpeed: (rand() - 0.5) * 0.0015,
    });
  }
  return list;
}

export function CodeAtmosphere(props: CodeAtmosphereConfig = {}) {
  const cfg = { ...DEFAULTS, ...props };
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyReduced = () => setReduced(mq.matches);
    applyReduced();
    mq.addEventListener("change", applyReduced);

    const compute = () => {
      const w = window.innerWidth;
      setSize(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    compute();
    window.addEventListener("resize", compute);
    setMounted(true);
    return () => {
      mq.removeEventListener("change", applyReduced);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const count =
    size === "mobile" ? cfg.mobileCount : size === "tablet" ? cfg.tabletCount : cfg.desktopCount;

  const particles = useMemo(() => buildParticles(count, cfg.gold), [count, cfg.gold]);

  // Animation loop: continuous drift + scroll parallax + mouse repulsion.
  useEffect(() => {
    if (!mounted || reduced) return;

    let raf = 0;
    let running = true;
    const start = performance.now();

    // Target + current scroll (eased) so motion smooths when scrolling stops.
    let targetScroll = window.scrollY;
    let curScroll = targetScroll;

    // Mouse (in px). Off-screen until first move; disabled on touch sizes.
    const useMouse = size === "desktop";
    let mx = -9999;
    let my = -9999;

    const onScroll = () => {
      targetScroll = window.scrollY;
    };
    const onMouse = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (glowRef.current) {
        glowRef.current.style.setProperty("--mx", `${e.clientX}px`);
        glowRef.current.style.setProperty("--my", `${e.clientY}px`);
      }
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    if (useMouse) {
      window.addEventListener("mousemove", onMouse, { passive: true });
      window.addEventListener("mouseleave", onLeave);
    }

    const vw = () => window.innerWidth;
    const vh = () => window.innerHeight;

    const frame = (now: number) => {
      if (!running) return;
      const t = now - start;
      // Ease scroll toward target for smooth start/stop.
      curScroll += (targetScroll - curScroll) * 0.08;

      const w = vw();
      const h = vh();

      for (let i = 0; i < particles.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const p = particles[i];
        const layerParallax = LAYER_CFG[p.layer].parallax;

        // Continuous drift (sinusoidal, unique per particle).
        const dx = Math.sin(t * p.driftSpeed + p.driftPhase) * p.driftX;
        const dy = Math.cos(t * p.driftSpeed * 0.9 + p.driftPhase) * p.driftY;

        // Scroll parallax: layers move at different speeds; slight X drift too.
        const py = -curScroll * cfg.parallaxStrength * layerParallax;
        const px = curScroll * cfg.parallaxStrength * layerParallax * 0.12;

        // Rotation drifts slowly.
        const rot = p.rot + t * p.rotSpeed;

        // Mouse repulsion (soft, eased) — compute particle's live screen pos.
        let repX = 0;
        let repY = 0;
        if (useMouse && mx > -9998) {
          const baseX = (p.xPct / 100) * w + dx + px;
          const baseY = (p.yPct / 100) * h + dy + py;
          const ddx = baseX - mx;
          const ddy = baseY - my;
          const dist = Math.hypot(ddx, ddy);
          if (dist < cfg.mouseRadius && dist > 0.001) {
            const force = (1 - dist / cfg.mouseRadius) ** 2; // soft falloff
            const push = force * 26; // max px pushed
            repX = (ddx / dist) * push;
            repY = (ddy / dist) * push;
          }
        }

        el.style.transform = `translate3d(${(dx + px + repX).toFixed(2)}px, ${(
          dy + py + repY
        ).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      if (useMouse) {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [mounted, reduced, particles, size, cfg.parallaxStrength, cfg.mouseRadius]);

  const g = cfg.gold;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#080808]"
    >
      {/* ambient gold glows — heavily blurred, drift almost imperceptibly */}
      <div
        className="absolute inset-0 motion-safe:animate-[ambientDrift_36s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(38rem 30rem at 12% 8%, rgba(${g},0.045), transparent 60%), radial-gradient(34rem 30rem at 92% 42%, rgba(${g},0.035), transparent 62%), radial-gradient(40rem 34rem at 78% 100%, rgba(${g},0.04), transparent 60%)`,
        }}
      />

      {/* faint orbital curves — huge, mostly off-screen */}
      <svg
        className="absolute inset-0 h-full w-full motion-safe:animate-[ambientDrift_48s_ease-in-out_infinite]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
        fill="none"
      >
        <ellipse cx="180" cy="120" rx="900" ry="620" stroke={`rgba(${g},0.08)`} strokeWidth="1" />
        <ellipse cx="1320" cy="760" rx="820" ry="560" stroke={`rgba(${g},0.06)`} strokeWidth="1" />
        <ellipse cx="760" cy="1050" rx="1100" ry="380" stroke={`rgba(${g},0.05)`} strokeWidth="1" />
      </svg>

      {/* edge micro-grid — only faintly visible near the borders */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          // fade the grid out toward the center so it only reads at the edges
          WebkitMaskImage:
            "radial-gradient(120% 120% at 50% 50%, transparent 45%, #000 100%)",
          maskImage:
            "radial-gradient(120% 120% at 50% 50%, transparent 45%, #000 100%)",
          opacity: 0.6,
        }}
      />

      {/* floating code particles */}
      <div className="absolute inset-0 font-mono">
        {particles.map((p, i) => (
          <span
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="absolute will-change-transform select-none"
            style={{
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              fontSize: `${p.size}px`,
              color:
                p.color === "gold"
                  ? `rgba(${g},${p.opacity})`
                  : `rgba(255,255,255,${p.opacity})`,
              transform: `rotate(${p.rot}deg)`,
            }}
          >
            {p.token}
          </span>
        ))}
      </div>

      {/* soft cursor light (desktop) */}
      {size === "desktop" && !reduced && (
        <div
          ref={glowRef}
          className="absolute inset-0"
          style={{
            // defaults keep it off-screen until the first mouse move
            ["--mx" as string]: "-100px",
            ["--my" as string]: "-100px",
            background: `radial-gradient(450px circle at var(--mx) var(--my), rgba(${g},${cfg.glowIntensity}), transparent 70%)`,
          }}
        />
      )}

      {/* gentle vignette to keep edges calm */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 45%, transparent 60%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
