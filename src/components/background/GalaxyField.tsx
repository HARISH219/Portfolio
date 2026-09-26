"use client";

import { useEffect, useRef } from "react";

// -----------------------------------------------------------------------------
// GalaxyField
// A cinematic, canvas-based galaxy background: a dark "black hole" core with a
// soft golden accretion disk, golden particles orbiting along elliptical paths
// in depth layers, stylized dark asteroids, thin orbital lines, and a few tiny
// floating code fragments. Reacts to scroll (subtle zoom + parallax) and mouse
// (very light parallax on asteroids). Sits fixed behind all content.
//
// Everything is drawn on ONE canvas via a single requestAnimationFrame loop —
// no per-element DOM. DPR is capped, counts scale by breakpoint, the loop
// pauses when the tab is hidden, and prefers-reduced-motion renders a single
// static frame with no animation/interaction.
// -----------------------------------------------------------------------------

// palette
const GOLD = "#B98232";
const WARM = "#D4A64D";
const BRIGHT = "#F3C969";
const WHITE_GOLD = "#FFF1C7";

const CODE_TOKENS = [
  "<>", "</>", "{}", "[]", "()", "=>", "&&", "//", ";", ":", "0x", "01",
  "const", "async", "await", "API", "git", "npm", "return", "null", "function",
  "class", "import", "export",
];

type Tier = "far" | "mid" | "near";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number };
type Orbit = {
  // elliptical orbit params in "disk space" (relative to hole center)
  rx: number; // radius x
  ry: number; // radius y
  angle: number; // current angle
  speed: number; // rad/ms
  size: number;
  color: string;
  alpha: number;
  tier: Tier;
  twk: number; // twinkle
  ph: number;
};
type Asteroid = {
  x: number; // % of width
  y: number; // % of height
  size: number;
  tier: Tier;
  rot: number;
  verts: number[]; // radius multipliers for an irregular blob
  parX: number; // mouse parallax factor
  parY: number;
  scrollPar: number; // scroll parallax factor
};
type CodeBit = { x: number; y: number; size: number; alpha: number; token: string; par: number };

export function GalaxyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReduced = mqReduce.matches;

    // Breakpoint → density.
    const w0 = window.innerWidth;
    const tierSize: "mobile" | "tablet" | "desktop" =
      w0 < 640 ? "mobile" : w0 < 1024 ? "tablet" : "desktop";

    const COUNTS = {
      desktop: { particles: 90, asteroids: 11, stars: 130, code: 26 },
      tablet: { particles: 60, asteroids: 8, stars: 90, code: 18 },
      mobile: { particles: 36, asteroids: 5, stars: 60, code: 12 },
    }[tierSize];

    const rand = mulberry32(0xa53f9c1b);

    // Canvas sizing (DPR-capped for perf).
    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Black-hole center — toward the right so hero text (left) stays clean.
    const hole = () => ({ x: W * 0.66, y: H * 0.42 });
    // Base disk radius scales with viewport.
    const baseR = () => Math.min(W, H) * 0.42;

    // --- build scene ---------------------------------------------------------
    const stars: Star[] = Array.from({ length: COUNTS.stars }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.2,
      a: 0.15 + rand() * 0.5,
      tw: 0.0006 + rand() * 0.0014,
      ph: rand() * Math.PI * 2,
    }));

    const orbits: Orbit[] = Array.from({ length: COUNTS.particles }, () => {
      const tr = rand();
      const tier: Tier = tr < 0.45 ? "far" : tr < 0.8 ? "mid" : "near";
      // radial band per tier (fraction of baseR)
      const band =
        tier === "near"
          ? 0.22 + rand() * 0.28
          : tier === "mid"
            ? 0.5 + rand() * 0.4
            : 0.9 + rand() * 0.7;
      const speed =
        (tier === "near" ? 0.00022 : tier === "mid" ? 0.00013 : 0.00007) *
        (0.7 + rand() * 0.6) *
        (rand() < 0.5 ? 1 : 1); // all same direction
      const cr = rand();
      const color = cr < 0.65 ? WARM : cr < 0.9 ? BRIGHT : WHITE_GOLD;
      const sizeR = rand();
      const size = sizeR < 0.85 ? 1 + rand() * 2 : 3 + rand() * 2;
      return {
        rx: band,
        ry: band * (0.34 + rand() * 0.12), // flattened disk
        angle: rand() * Math.PI * 2,
        speed,
        size,
        color,
        alpha: 0.25 + rand() * 0.5,
        tier,
        twk: 0.001 + rand() * 0.002,
        ph: rand() * Math.PI * 2,
      };
    });

    const asteroids: Asteroid[] = Array.from({ length: COUNTS.asteroids }, (_, i) => {
      // depth tiers: mostly far/mid, 1-2 foreground.
      const foreground = i < (tierSize === "mobile" ? 1 : 2);
      const tr = foreground ? "near" : rand() < 0.5 ? "far" : "mid";
      const size =
        tr === "near"
          ? 110 + rand() * 130
          : tr === "mid"
            ? 30 + rand() * 50
            : 10 + rand() * 20;
      const vcount = 9;
      const verts = Array.from({ length: vcount }, () => 0.78 + rand() * 0.34);
      return {
        x: rand(),
        y: rand(),
        size,
        tier: tr as Tier,
        rot: rand() * Math.PI * 2,
        verts,
        parX: tr === "near" ? 8 : tr === "mid" ? 4 : 1.5,
        parY: tr === "near" ? 6 : tr === "mid" ? 3 : 1,
        scrollPar: tr === "near" ? 0.5 : tr === "mid" ? 0.28 : 0.12,
      };
    });

    const codeBits: CodeBit[] = Array.from({ length: COUNTS.code }, () => {
      // bias away from hero text (left-center); keep them around edges/right.
      let x = rand();
      const y = rand();
      if (x > 0.12 && x < 0.5 && y > 0.15 && y < 0.6) x = x < 0.3 ? x * 0.4 : x + 0.3;
      const ar = rand();
      const alpha = ar < 0.8 ? 0.025 + rand() * 0.055 : 0.08 + rand() * 0.02;
      return {
        x,
        y,
        size: 9 + rand() * 4,
        alpha,
        token: CODE_TOKENS[Math.floor(rand() * CODE_TOKENS.length)],
        par: 0.05 + rand() * 0.12,
      };
    });

    // Irregular orbital lines (ellipses in disk space).
    const orbitLines = [
      { rf: 0.55, flat: 0.36, rot: -0.35, a: 0.14 },
      { rf: 0.85, flat: 0.34, rot: -0.3, a: 0.1 },
      { rf: 1.25, flat: 0.32, rot: -0.28, a: 0.07 },
      { rf: 0.34, flat: 0.4, rot: -0.4, a: 0.16 },
    ];

    // Disk tilt (whole galaxy rotated slightly for a dynamic composition).
    const TILT = -0.32; // radians

    // --- interaction state ---------------------------------------------------
    let scrollY = window.scrollY;
    let scrollEased = scrollY;
    let mx = 0; // -1..1 relative to center
    let my = 0;
    let mxEased = 0;
    let myEased = 0;

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / W - 0.5) * 2;
      my = (e.clientY / H - 0.5) * 2;
    };
    const onResize = () => resize();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (!isReduced && tierSize === "desktop") {
      window.addEventListener("mousemove", onMouse, { passive: true });
    }

    // Draw one asteroid as an irregular dark blob with a faint gold rim toward
    // the black hole.
    const drawAsteroid = (
      cx: number,
      cy: number,
      size: number,
      rot: number,
      verts: number[],
      hx: number,
      hy: number,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      const n = verts.length;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = (size / 2) * verts[i % n];
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = "#0a0908";
      ctx.fill();
      ctx.restore();

      // rim light: a soft gold arc on the side facing the hole
      const ang = Math.atan2(hy - cy, hx - cx);
      const grad = ctx.createRadialGradient(
        cx + Math.cos(ang) * size * 0.3,
        cy + Math.sin(ang) * size * 0.3,
        size * 0.1,
        cx,
        cy,
        size * 0.7,
      );
      grad.addColorStop(0, "rgba(212,166,77,0.16)");
      grad.addColorStop(1, "rgba(212,166,77,0)");
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = (size / 2) * verts[i % n];
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.restore();
      ctx.fillStyle = grad;
      ctx.fill();
    };

    // --- main draw -----------------------------------------------------------
    const draw = (t: number) => {
      const { x: hx, y: hy } = hole();
      const R = baseR();

      // eased scroll + mouse
      scrollEased += (scrollY - scrollEased) * 0.08;
      mxEased += (mx - mxEased) * 0.06;
      myEased += (my - myEased) * 0.06;

      // scroll zoom 1.0 -> ~1.15 across ~1.6 viewport heights
      const zoom = isReduced ? 1 : 1 + Math.min(scrollEased / (H * 1.6), 1) * 0.15;

      ctx.clearRect(0, 0, W, H);

      // deep space base
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      // far stars (very slow scroll parallax)
      const starShift = -scrollEased * 0.03;
      for (const s of stars) {
        const a = isReduced ? s.a : s.a * (0.6 + 0.4 * Math.sin(t * s.tw + s.ph));
        ctx.globalAlpha = a;
        ctx.fillStyle = WHITE_GOLD;
        ctx.beginPath();
        ctx.arc(s.x * W, (s.y * H + starShift + H) % H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- galaxy / accretion disk (drawn in tilted disk space) --------------
      ctx.save();
      ctx.translate(hx, hy - scrollEased * 0.06);
      ctx.scale(zoom, zoom);
      ctx.rotate(TILT);

      // soft amber halo behind the disk
      const halo = ctx.createRadialGradient(0, 0, R * 0.05, 0, 0, R * 1.5);
      halo.addColorStop(0, "rgba(185,130,50,0.16)");
      halo.addColorStop(0.4, "rgba(185,130,50,0.06)");
      halo.addColorStop(1, "rgba(185,130,50,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // accretion disk — bright flattened ring
      ctx.save();
      ctx.scale(1, 0.36);
      const disk = ctx.createRadialGradient(0, 0, R * 0.28, 0, 0, R * 1.05);
      disk.addColorStop(0, "rgba(0,0,0,0)");
      disk.addColorStop(0.5, "rgba(212,166,77,0.10)");
      disk.addColorStop(0.72, "rgba(243,201,105,0.22)");
      disk.addColorStop(0.85, "rgba(212,166,77,0.10)");
      disk.addColorStop(1, "rgba(185,130,50,0)");
      ctx.fillStyle = disk;
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // orbital lines (elliptical, irregular)
      for (const o of orbitLines) {
        ctx.save();
        ctx.rotate(o.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, R * o.rf, R * o.rf * o.flat, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212,166,77,${o.a})`;
        ctx.lineWidth = 1 / zoom;
        ctx.stroke();
        ctx.restore();
      }

      // dark core (black hole) — pure black center + subtle shadow ring
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.34);
      core.addColorStop(0, "#000000");
      core.addColorStop(0.7, "#010101");
      core.addColorStop(1, "rgba(2,2,2,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.34, 0, Math.PI * 2);
      ctx.fill();

      // thin bright inner ring hugging the core (the "photon ring" hint)
      ctx.save();
      ctx.scale(1, 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.32, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(243,201,105,0.28)";
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();
      ctx.restore();

      // orbiting golden particles
      for (const o of orbits) {
        if (!isReduced) o.angle += o.speed * 16; // ~per frame at 60fps
        const ex = Math.cos(o.angle) * R * o.rx;
        const ey = Math.sin(o.angle) * R * o.ry;
        const tw = isReduced ? 1 : 0.55 + 0.45 * Math.sin(t * o.twk + o.ph);
        ctx.globalAlpha = o.alpha * tw;
        ctx.fillStyle = o.color;
        ctx.beginPath();
        ctx.arc(ex, ey, o.size / zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore(); // end disk space

      // --- asteroids (screen space, with parallax) ---------------------------
      // draw far→near for correct layering
      const order = [...asteroids].sort((a, b) => {
        const rank = { far: 0, mid: 1, near: 2 } as const;
        return rank[a.tier] - rank[b.tier];
      });
      for (const a of order) {
        const scrollOff = scrollEased * a.scrollPar;
        const cx = a.x * W + mxEased * a.parX;
        const cy = a.y * H + myEased * a.parY - scrollOff * 0.4 + scrollOff;
        const size = a.size * (a.tier === "near" ? zoom : 1);
        if (!isReduced) a.rot += 0.00002 * (a.tier === "near" ? 1 : 0.5);
        drawAsteroid(cx, ((cy % (H + 400)) + H + 400) % (H + 400) - 200, size, a.rot, a.verts, hx, hy);
      }

      // --- floating code fragments ------------------------------------------
      ctx.font = "500 12px ui-monospace, monospace";
      for (const c of codeBits) {
        const cx = c.x * W + mxEased * c.par * 6;
        const cy = c.y * H - scrollEased * c.par;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(212,166,77,${c.alpha})`;
        ctx.font = `500 ${c.size}px ui-monospace, monospace`;
        ctx.fillText(c.token, cx, ((cy % (H + 100)) + H + 100) % (H + 100) - 50);
      }
      ctx.globalAlpha = 1;

      if (!isReduced && !document.hidden) {
        raf = requestAnimationFrame(draw);
      }
    };

    let raf = requestAnimationFrame(draw);

    // Pause when hidden; resume when visible (reduced-motion never loops).
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!isReduced) {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* readability layer: darken the left/content side, keep galaxy on the right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.72) 32%, rgba(5,5,5,0.35) 60%, rgba(5,5,5,0.15) 100%)",
        }}
      />
      {/* soft vignette around the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 130% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
