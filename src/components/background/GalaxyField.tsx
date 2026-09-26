"use client";

import { useEffect, useRef } from "react";

// -----------------------------------------------------------------------------
// GalaxyField — a scroll-driven cinematic journey through the universe.
// (SYSTEM C — one isolated canvas, never touches React state.)
//
// A single eased scroll progress (0..1) drives a virtual camera:
//
//   0.00 – 0.20  BIG BLACK HOLE   center-right, ~40vw, detailed golden disk
//   0.20 – 0.40  shrinks          scale 1→0.35, opacity 1→0.55
//   0.20 – 0.60  MILKY WAY enters FROM THE LEFT, grows
//   0.40 – 0.70  black hole slides to the far RIGHT and recedes
//   0.55 – 0.85  camera ZOOMS INTO the galaxy (spiral arms stream past)
//   0.75 – 0.92  SOLAR SYSTEM     Sun → orbital lines → planets in order
//   0.90 – 1.00  EARTH            final detailed close-up filling the frame
//
// PERFORMANCE CONTRACT — everything expensive is pre-rendered ONCE to offscreen
// canvases (black hole, sharp spiral galaxy, Sun, planets, Earth, glow dots,
// asteroids). The animation loop only calls drawImage() with translate / scale
// / rotate + cheap star points. No createRadialGradient inside the loop. DPR
// capped at 2, counts scale per breakpoint, loop pauses on hidden tabs,
// reduced-motion renders a single static frame, coarse pointers simplify.
// -----------------------------------------------------------------------------

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ramp = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t); // smoothstep
};
const band = (x: number, a: number, p0: number, p1: number, b: number) =>
  Math.min(ramp(x, a, p0), 1 - ramp(x, p1, b));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function GalaxyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const still = reduced;

    const w0 = window.innerWidth;
    const bp: "mobile" | "tablet" | "desktop" =
      w0 < 640 ? "mobile" : w0 < 1024 ? "tablet" : "desktop";

    const COUNTS = {
      desktop: { stars: 560, bhParticles: 90, crystals: 150, asteroids: 14 },
      tablet: { stars: 320, bhParticles: 60, crystals: 90, asteroids: 9 },
      // Mobile keeps counts low for perf but a touch denser than before so the
      // cosmos actually reads on a small, mostly-dark screen.
      mobile: { stars: 170, bhParticles: 34, crystals: 52, asteroids: 5 },
    }[bp];

    // On narrow screens the cosmic layers are dialed UP (they otherwise vanish
    // because the readability overlays cover most of a small viewport). Desktop
    // is left exactly as-is.
    const vis = bp === "mobile" ? 1.7 : 1;

    const rand = mulberry32(0x9e3779b1);

    let W = 0;
    let H = 0;
    let dpr = 1;

    // =========================================================================
    // SPRITE FACTORY
    // =========================================================================
    const spriteCanvas = (size: number) => {
      const c = document.createElement("canvas");
      c.width = c.height = Math.max(1, Math.ceil(size * dpr));
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      g.translate(size / 2, size / 2);
      return { c, g };
    };

    const makeGlow = (rgb: string, peak: number, size = 26) => {
      const { c, g } = spriteCanvas(size);
      const r = size / 2;
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
      grad.addColorStop(0, `rgba(${rgb},${peak})`);
      grad.addColorStop(0.5, `rgba(${rgb},${peak * 0.32})`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.fill();
      return c;
    };

    // tiny faceted crystal (diamond) sprite
    const makeCrystal = (rgb: string, size = 10) => {
      const { c, g } = spriteCanvas(size + 6);
      const r = size / 2;
      g.beginPath();
      g.moveTo(0, -r);
      g.lineTo(r * 0.6, 0);
      g.lineTo(0, r);
      g.lineTo(-r * 0.6, 0);
      g.closePath();
      g.fillStyle = `rgba(${rgb},0.9)`;
      g.shadowColor = `rgba(${rgb},0.7)`;
      g.shadowBlur = 4;
      g.fill();
      return c;
    };

    // BIG detailed BLACK HOLE. Visible object radius ~0.34 of sprite side.
    // The DISK is what reads; the core stays pure black. The disk is split into
    // a bright thin inner ring, a detailed golden inner disk, and a wider dusty
    // outer disk, plus a subtle lensing halo — no blur over the structure.
    const makeBlackHole = (side: number) => {
      const { c, g } = spriteCanvas(side);
      const R = side * 0.34;
      const r2 = mulberry32(0xbeef01);

      // lensing halo (soft, only the outer glow is soft)
      const halo = g.createRadialGradient(0, 0, R * 0.62, 0, 0, R * 1.9);
      halo.addColorStop(0, "rgba(243,201,105,0.14)");
      halo.addColorStop(0.5, "rgba(212,166,77,0.05)");
      halo.addColorStop(1, "rgba(212,166,77,0)");
      g.fillStyle = halo;
      g.beginPath();
      g.arc(0, 0, R * 1.9, 0, Math.PI * 2);
      g.fill();

      // accretion disk drawn in a tilted, flattened frame
      const drawDiskLayer = (
        rInner: number,
        rOuter: number,
        stops: [number, string][],
      ) => {
        g.save();
        g.rotate(-0.42);
        g.scale(1, 0.32);
        const grad = g.createRadialGradient(0, 0, rInner, 0, 0, rOuter);
        for (const [o, col] of stops) grad.addColorStop(o, col);
        g.fillStyle = grad;
        g.beginPath();
        g.arc(0, 0, rOuter, 0, Math.PI * 2);
        g.fill();
        g.restore();
      };

      // outer dusty disk (wider, darker, fading)
      drawDiskLayer(R * 0.7, R * 1.7, [
        [0, "rgba(0,0,0,0)"],
        [0.5, "rgba(150,96,34,0.14)"],
        [0.72, "rgba(196,140,60,0.28)"],
        [0.9, "rgba(150,96,34,0.1)"],
        [1, "rgba(120,78,26,0)"],
      ]);
      // inner golden disk (detailed, warm)
      drawDiskLayer(R * 0.5, R * 1.25, [
        [0, "rgba(0,0,0,0)"],
        [0.5, "rgba(212,166,77,0.4)"],
        [0.66, "rgba(243,201,105,0.75)"],
        [0.76, "rgba(255,236,190,0.85)"],
        [0.88, "rgba(212,166,77,0.35)"],
        [1, "rgba(185,130,50,0)"],
      ]);

      // fine dust flecks along the disk for micro-detail (crisp, not blurred)
      g.save();
      g.rotate(-0.42);
      g.scale(1, 0.32);
      for (let i = 0; i < 420; i++) {
        const a = r2() * Math.PI * 2;
        const rr = R * (0.62 + r2() * 0.62);
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        const b = 0.1 + r2() * 0.5;
        g.globalAlpha = b;
        g.fillStyle = r2() < 0.3 ? "rgba(255,240,200,1)" : "rgba(230,180,110,1)";
        g.beginPath();
        g.arc(x, y, 0.5 + r2() * 1.1, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
      g.restore();

      // dark core (event horizon) — solid black, soft edge
      const core = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.6);
      core.addColorStop(0, "#000000");
      core.addColorStop(0.8, "#000000");
      core.addColorStop(0.92, "rgba(0,0,0,0.92)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = core;
      g.beginPath();
      g.arc(0, 0, R * 0.6, 0, Math.PI * 2);
      g.fill();

      // thin bright inner photon ring (brightest element)
      g.save();
      g.rotate(-0.42);
      g.scale(1, 0.36);
      g.beginPath();
      g.arc(0, 0, R * 0.6, 0, Math.PI * 2);
      g.strokeStyle = "rgba(255,244,214,0.75)";
      g.lineWidth = 2.6;
      g.stroke();
      g.restore();

      return c;
    };

    // SHARP procedural spiral galaxy. Rendered large so it survives the zoom.
    // Two/three log-spiral arms built from thousands of crisp star points, dust
    // lanes as thin dark arcs, and a layered warm-white/pink core. Only the
    // faint outer haze uses a soft gradient — the structure stays sharp.
    const makeGalaxy = (side: number) => {
      const { c, g } = spriteCanvas(side);
      const R = side * 0.46;
      const r2 = mulberry32(0x5eed11);

      // faint outer haze (the ONLY soft element)
      g.save();
      g.rotate(-0.38);
      g.scale(1, 0.4);
      const haze = g.createRadialGradient(0, 0, R * 0.1, 0, 0, R);
      haze.addColorStop(0, "rgba(255,220,226,0.16)");
      haze.addColorStop(0.4, "rgba(216,180,186,0.08)");
      haze.addColorStop(1, "rgba(200,200,205,0)");
      g.fillStyle = haze;
      g.beginPath();
      g.arc(0, 0, R, 0, Math.PI * 2);
      g.fill();
      g.restore();

      g.rotate(-0.38);
      g.scale(1, 0.42); // galaxy plane tilt

      const arms = 2;
      const twist = 3.3; // spiral tightness
      const points = bp === "mobile" ? 4200 : bp === "tablet" ? 8000 : 14000;

      // dust lanes — thin darker arcs slightly offset from the bright arms
      for (let i = 0; i < points * 0.18; i++) {
        const arm = i % arms;
        const tt = Math.pow(r2(), 0.7);
        const ang = tt * twist * Math.PI * 2 + (arm / arms) * Math.PI * 2 + (r2() - 0.5) * 0.28 + 0.25;
        const rr = R * (0.14 + tt * 0.86) + (r2() - 0.5) * R * 0.03;
        const x = Math.cos(ang) * rr;
        const y = Math.sin(ang) * rr;
        g.globalAlpha = 0.06 + r2() * 0.12;
        g.fillStyle = "rgba(20,10,14,1)";
        g.beginPath();
        g.arc(x, y, 0.7 + r2() * 1.6, 0, Math.PI * 2);
        g.fill();
      }

      // bright spiral-arm stars (crisp points)
      for (let i = 0; i < points; i++) {
        const arm = i % arms;
        const tt = Math.pow(r2(), 0.6); // more density toward center
        const spread = (1 - tt) * 0.5 + 0.08;
        const ang =
          tt * twist * Math.PI * 2 +
          (arm / arms) * Math.PI * 2 +
          (r2() - 0.5) * spread;
        const rr = R * (0.1 + tt * 0.9) + (r2() - 0.5) * R * 0.06;
        const x = Math.cos(ang) * rr;
        const y = Math.sin(ang) * rr;
        const edge = rr / R; // 0 center → 1 outer
        let col: string;
        const cr = r2();
        if (edge < 0.2) col = cr < 0.5 ? "255,255,255" : "255,226,230"; // white / soft pink
        else if (edge < 0.42) col = cr < 0.4 ? "255,181,192" : "255,240,242"; // pink core edge
        else if (edge < 0.7) col = cr < 0.5 ? "244,244,242" : "216,216,213"; // white/gray arms
        else col = "184,184,181"; // faint outer
        const a = clamp01((0.9 - edge) * (0.35 + r2() * 0.6));
        if (a <= 0.02) continue;
        g.globalAlpha = a;
        g.fillStyle = `rgba(${col},1)`;
        g.beginPath();
        g.arc(x, y, edge < 0.25 ? 0.7 + r2() * 1.4 : 0.4 + r2() * 1.0, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;

      // a few brighter star clusters
      for (let i = 0; i < 26; i++) {
        const arm = i % arms;
        const tt = 0.2 + r2() * 0.7;
        const ang = tt * twist * Math.PI * 2 + (arm / arms) * Math.PI * 2 + (r2() - 0.5) * 0.2;
        const rr = R * (0.12 + tt * 0.86);
        const x = Math.cos(ang) * rr;
        const y = Math.sin(ang) * rr;
        const cg = g.createRadialGradient(x, y, 0, x, y, 5 + r2() * 7);
        cg.addColorStop(0, "rgba(255,248,240,0.6)");
        cg.addColorStop(1, "rgba(255,248,240,0)");
        g.fillStyle = cg;
        g.beginPath();
        g.arc(x, y, 5 + r2() * 7, 0, Math.PI * 2);
        g.fill();
      }

      // layered bright core (white → pink → reddish), sharp-ish
      g.scale(1, 1 / 0.42); // undo tilt for a round-ish bulge
      const core = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.24);
      core.addColorStop(0, "rgba(255,255,255,0.95)");
      core.addColorStop(0.28, "rgba(255,230,232,0.7)");
      core.addColorStop(0.55, "rgba(255,181,192,0.4)");
      core.addColorStop(0.8, "rgba(217,106,126,0.18)");
      core.addColorStop(1, "rgba(217,106,126,0)");
      g.fillStyle = core;
      g.beginPath();
      g.arc(0, 0, R * 0.24, 0, Math.PI * 2);
      g.fill();

      return c;
    };

    const makeSun = (side: number) => {
      const { c, g } = spriteCanvas(side);
      const R = side / 2;
      const cor = g.createRadialGradient(0, 0, 0, 0, 0, R);
      cor.addColorStop(0, "rgba(255,252,240,1)");
      cor.addColorStop(0.14, "rgba(255,238,182,0.97)");
      cor.addColorStop(0.32, "rgba(255,212,120,0.5)");
      cor.addColorStop(0.6, "rgba(255,190,90,0.16)");
      cor.addColorStop(1, "rgba(255,180,80,0)");
      g.fillStyle = cor;
      g.beginPath();
      g.arc(0, 0, R, 0, Math.PI * 2);
      g.fill();
      return c;
    };

    const makePlanet = (radius: number, rgb: string, ring?: string) => {
      const pad = ring ? radius * 2.8 : radius * 1.6;
      const side = Math.ceil(pad * 2);
      const { c, g } = spriteCanvas(side);
      if (ring) {
        g.save();
        g.rotate(-0.5);
        g.scale(1, 0.3);
        g.beginPath();
        g.arc(0, 0, radius * 2, 0, Math.PI * 2);
        g.strokeStyle = ring;
        g.lineWidth = radius * 0.55;
        g.stroke();
        g.restore();
      }
      const grad = g.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
      grad.addColorStop(0, `rgba(${rgb},1)`);
      grad.addColorStop(0.7, `rgba(${rgb},0.95)`);
      grad.addColorStop(1, "rgba(0,0,0,0.7)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(0, 0, radius, 0, Math.PI * 2);
      g.fill();
      return c;
    };

    // Detailed EARTH: shaded blue sphere with land/ocean/cloud speckle, a dark
    // night terminator, and a soft blue atmosphere rim.
    const makeEarth = (side: number) => {
      const { c, g } = spriteCanvas(side);
      const R = side * 0.4;
      const r2 = mulberry32(0xea27bead);

      // atmosphere glow rim
      const atmo = g.createRadialGradient(0, 0, R * 0.82, 0, 0, R * 1.16);
      atmo.addColorStop(0, "rgba(120,170,235,0)");
      atmo.addColorStop(0.75, "rgba(120,175,240,0.28)");
      atmo.addColorStop(1, "rgba(120,175,240,0)");
      g.fillStyle = atmo;
      g.beginPath();
      g.arc(0, 0, R * 1.16, 0, Math.PI * 2);
      g.fill();

      // clip to the globe for surface detail
      g.save();
      g.beginPath();
      g.arc(0, 0, R, 0, Math.PI * 2);
      g.clip();

      // ocean base with day-lit gradient (light toward upper-left)
      const ocean = g.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
      ocean.addColorStop(0, "rgba(90,150,205,1)");
      ocean.addColorStop(0.6, "rgba(40,90,150,1)");
      ocean.addColorStop(1, "rgba(12,34,66,1)");
      g.fillStyle = ocean;
      g.fillRect(-R, -R, R * 2, R * 2);

      // land masses (green/brown blobs)
      for (let i = 0; i < 46; i++) {
        const a = r2() * Math.PI * 2;
        const rr = r2() * R * 0.95;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        g.globalAlpha = 0.5 + r2() * 0.4;
        g.fillStyle = r2() < 0.5 ? "rgba(70,120,70,1)" : "rgba(120,110,70,1)";
        g.beginPath();
        g.ellipse(x, y, 4 + r2() * 16, 3 + r2() * 12, r2() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
      // clouds (white wisps)
      for (let i = 0; i < 40; i++) {
        const a = r2() * Math.PI * 2;
        const rr = r2() * R * 0.98;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        g.globalAlpha = 0.2 + r2() * 0.35;
        g.fillStyle = "rgba(255,255,255,1)";
        g.beginPath();
        g.ellipse(x, y, 5 + r2() * 18, 3 + r2() * 8, r2() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;

      // night side terminator (dark gradient sweeping in from lower-right)
      const night = g.createLinearGradient(R * 0.1, -R, R, R);
      night.addColorStop(0, "rgba(2,6,16,0)");
      night.addColorStop(0.55, "rgba(2,6,16,0.4)");
      night.addColorStop(1, "rgba(1,3,10,0.92)");
      g.fillStyle = night;
      g.fillRect(-R, -R, R * 2, R * 2);

      g.restore();
      return c;
    };

    const makeAsteroid = (size: number, seed: number) => {
      const r2 = mulberry32(seed);
      const side = size + 8;
      const { c, g } = spriteCanvas(side);
      const n = 10;
      const verts = Array.from({ length: n }, () => 0.72 + r2() * 0.4);
      g.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = (size / 2) * verts[i % n];
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillStyle = "#0c0b0a";
      g.fill();
      const rim = g.createRadialGradient(-size * 0.22, -size * 0.22, size * 0.05, 0, 0, size * 0.62);
      rim.addColorStop(0, "rgba(212,166,77,0.3)");
      rim.addColorStop(1, "rgba(212,166,77,0)");
      g.fillStyle = rim;
      g.beginPath();
      g.arc(0, 0, size * 0.62, 0, Math.PI * 2);
      g.fill();
      return c;
    };

    type Sprites = {
      blackhole: HTMLCanvasElement;
      galaxy: HTMLCanvasElement;
      sun: HTMLCanvasElement;
      earth: HTMLCanvasElement;
      planets: { name: string; sprite: HTMLCanvasElement; base: number }[];
      glowGold: HTMLCanvasElement;
      glowWhite: HTMLCanvasElement;
      glowPink: HTMLCanvasElement;
      crystalWhite: HTMLCanvasElement;
      crystalPink: HTMLCanvasElement;
      asteroids: HTMLCanvasElement[];
    };
    let SP: Sprites | null = null;

    const planetDefs = () => {
      const k = Math.min(W, H) / 780;
      return [
        { name: "Mercury", r: 2.8 * k, rgb: "150,140,130", base: 0.09 },
        { name: "Venus", r: 4.8 * k, rgb: "216,190,142", base: 0.16 },
        { name: "Earth", r: 5.2 * k, rgb: "90,140,180", base: 0.24 },
        { name: "Mars", r: 3.8 * k, rgb: "182,110,78", base: 0.32 },
        { name: "Jupiter", r: 12 * k, rgb: "204,172,132", base: 0.48 },
        { name: "Saturn", r: 10 * k, rgb: "212,192,150", base: 0.64, ring: "rgba(232,222,192,0.55)" },
        { name: "Uranus", r: 6.6 * k, rgb: "172,204,208", base: 0.8 },
        { name: "Neptune", r: 6.2 * k, rgb: "108,140,196", base: 0.94 },
      ];
    };

    const buildSprites = () => {
      const minSide = Math.min(W, H);
      const maxSide = Math.max(W, H);
      // black hole sprite: object radius 0.34*side. To get ~40vw disk width
      // (disk spans ~2*R = 0.68*side), side ≈ 0.6*W → disk ≈ 0.41*W. Use minSide
      // basis so it stays big but not overwhelming on tall screens.
      const bhSide = Math.round(maxSide * (bp === "mobile" ? 1.05 : 0.92));
      const galSide = Math.round(maxSide * 2.2); // large → detail survives zoom
      const defs = planetDefs();
      SP = {
        blackhole: makeBlackHole(bhSide),
        galaxy: makeGalaxy(galSide),
        sun: makeSun(Math.round(minSide * 0.4)),
        earth: makeEarth(Math.round(minSide * 1.15)),
        planets: defs.map((d) => ({
          name: d.name,
          base: d.base,
          sprite: makePlanet(d.r, d.rgb, (d as { ring?: string }).ring),
        })),
        glowGold: makeGlow("212,166,77", 0.85),
        glowWhite: makeGlow("255,255,255", 0.95),
        glowPink: makeGlow("255,214,224", 0.9),
        crystalWhite: makeCrystal("255,255,255", 9),
        crystalPink: makeCrystal("255,220,228", 9),
        asteroids: [20, 35, 50, 80, 120].map((s, i) =>
          makeAsteroid(Math.round(s * (minSide / 900)), 0x1200 + i * 733),
        ),
      };
    };

    // =========================================================================
    // SCENE DATA
    // =========================================================================
    const bhParticles = Array.from({ length: COUNTS.bhParticles }, () => {
      const b = 0.55 + rand() * 0.95;
      return {
        rx: b,
        ry: b * 0.32,
        angle: rand() * Math.PI * 2,
        speed: (0.0008 + rand() * 0.0018) * (0.6 + rand() * 0.8),
        scale: 0.08 + rand() * 0.14,
        alpha: 0.4 + rand() * 0.5,
      };
    });

    const stars = Array.from({ length: COUNTS.stars }, () => ({
      x: rand(),
      y: rand(),
      z: 0.2 + rand() * 0.8,
      r: 0.4 + rand() * 1.3,
      a: 0.25 + rand() * 0.6,
      tw: 0.0006 + rand() * 0.0016,
      ph: rand() * Math.PI * 2,
      col: rand() < 0.72 ? "255,255,255" : rand() < 0.5 ? "255,236,214" : "214,224,255",
    }));

    const orbitCount = bp === "mobile" ? 5 : bp === "tablet" ? 7 : 9;
    const crystalOrbits = Array.from({ length: orbitCount }, (_, i) => ({
      rf: 0.32 + (i / orbitCount) * 0.95 + rand() * 0.05,
      flat: 0.28 + rand() * 0.18,
      rot: -0.38 + (rand() - 0.5) * 0.5,
      speed: (0.00015 + rand() * 0.0003) * (rand() < 0.5 ? 1 : -1),
    }));
    const crystals = Array.from({ length: COUNTS.crystals }, () => {
      const o = crystalOrbits[Math.floor(rand() * crystalOrbits.length)];
      const cr = rand();
      return {
        orbit: o,
        angle: rand() * Math.PI * 2,
        scale: 0.5 + rand() * 0.9,
        alpha: 0.45 + rand() * 0.5,
        tw: 0.0012 + rand() * 0.003,
        ph: rand() * Math.PI * 2,
        kind: cr < 0.5 ? "dotW" : cr < 0.72 ? "dotP" : cr < 0.88 ? "cryW" : "cryP",
      };
    });

    const asteroids = Array.from({ length: COUNTS.asteroids }, () => ({
      x: rand(),
      y: rand(),
      z: 0.3 + rand() * 0.7,
      rot: rand() * Math.PI * 2,
      spin: (rand() < 0.5 ? 1 : -1) * (0.00006 + rand() * 0.00014),
      variant: Math.floor(rand() * 5),
      drift: (rand() - 0.5) * 0.0006,
    }));

    // =========================================================================
    // SIZING
    // =========================================================================
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildSprites();
    };
    resize();

    // =========================================================================
    // SCROLL PROGRESS
    // =========================================================================
    const scrollMax = () =>
      Math.max(1, (document.documentElement.scrollHeight || 0) - window.innerHeight);
    let progress = clamp01(window.scrollY / scrollMax());
    let progEased = progress;
    let mx = 0;
    let my = 0;
    let mxE = 0;
    let myE = 0;

    const onScroll = () => {
      progress = clamp01(window.scrollY / scrollMax());
    };
    const onMouse = (e: PointerEvent) => {
      mx = (e.clientX / W - 0.5) * 2;
      my = (e.clientY / H - 0.5) * 2;
    };
    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resize();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (!coarse && !reduced) window.addEventListener("pointermove", onMouse, { passive: true });

    // =========================================================================
    // DRAW
    // =========================================================================
    let frame = 0;
    const draw = (t: number) => {
      if (!SP) return;
      progEased += (progress - progEased) * 0.08;
      mxE += (mx - mxE) * 0.06;
      myE += (my - myE) * 0.06;
      const p = still ? clamp01(progress) : progEased;

      // ---- stage weights ----
      const wBlack = 1 - ramp(p, 0.5, 0.72); // present until it recedes
      const bhShrink = ramp(p, 0.18, 0.4); // scale 1 → 0.35
      const bhRight = ramp(p, 0.38, 0.72); // slide to far right
      const wGalaxy = band(p, 0.2, 0.5, 0.82, 1.0); // enter → dominate → recede
      const galEnter = ramp(p, 0.2, 0.55); // left-entry progress
      const galZoom = ramp(p, 0.5, 0.86); // zoom into galaxy
      const wStars = band(p, 0.28, 0.6, 0.86, 1.0);
      const enter = ramp(p, 0.55, 0.86);
      const wSolar = band(p, 0.74, 0.84, 0.94, 1.0);
      const wEarth = ramp(p, 0.9, 1.0);
      const goldToWhite = ramp(p, 0.22, 0.44);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      // ---- FAR: star field ----
      if (wStars > 0.001) {
        const push = 1 + enter * 2.0;
        for (const s of stars) {
          const tw = still ? 1 : 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
          const dx = (s.x - 0.5) * push * s.z;
          const dy = (s.y - 0.5) * push * s.z;
          const x = (0.5 + dx) * W + mxE * 6 * s.z;
          const y = (0.5 + dy) * H + myE * 6 * s.z;
          if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
          ctx.globalAlpha = clamp01(s.a * tw * wStars * vis);
          ctx.fillStyle = `rgba(${s.col},1)`;
          ctx.beginPath();
          ctx.arc(x, y, s.r * (1 + enter * s.z), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // ---- MID: MILKY WAY (enters from LEFT, grows, zooms in) ----
      if (wGalaxy > 0.001) {
        const gal = SP.galaxy;
        const side = gal.width / dpr;
        const scale = lerp(0.55, 3.0, galZoom) * lerp(0.75, 1, galEnter);
        // enters from far left → settles left-of-center, then camera pushes in
        const cx = lerp(-W * 0.35, W * 0.42, galEnter) + mxE * 10;
        const cy = lerp(H * 0.4, H * 0.5, galEnter) + myE * 8;
        ctx.save();
        ctx.globalAlpha = clamp01(wGalaxy * vis);
        ctx.translate(cx, cy);
        if (!still) ctx.rotate(t * 0.000004 + enter * 0.12);
        ctx.drawImage(gal, (-side / 2) * scale, (-side / 2) * scale, side * scale, side * scale);
        ctx.restore();

        // ---- NEAR: white crystalline orbital particles ----
        const cAlpha = clamp01(wGalaxy * (0.4 + 0.6 * galEnter) * vis);
        if (cAlpha > 0.01) {
          const baseR = Math.max(W, H) * 0.4 * lerp(0.7, 1.7, galZoom);
          ctx.save();
          ctx.translate(cx, cy);
          for (const cr of crystals) {
            if (!still) cr.angle += cr.orbit.speed;
            const o = cr.orbit;
            const rr = baseR * o.rf;
            const ex = Math.cos(cr.angle) * rr;
            const ey = Math.sin(cr.angle) * rr * o.flat;
            const rx = ex * Math.cos(o.rot) - ey * Math.sin(o.rot);
            const ry = ex * Math.sin(o.rot) + ey * Math.cos(o.rot);
            const tw = still ? 1 : 0.5 + 0.5 * Math.sin(t * cr.tw + cr.ph);
            let sprite: HTMLCanvasElement;
            if (cr.kind === "dotW") sprite = SP.glowWhite;
            else if (cr.kind === "dotP") sprite = SP.glowPink;
            else if (cr.kind === "cryW") sprite = SP.crystalWhite;
            else sprite = SP.crystalPink;
            const sz = sprite.width / dpr * cr.scale;
            ctx.globalAlpha = cAlpha * cr.alpha * tw;
            ctx.drawImage(sprite, rx - sz / 2, ry - sz / 2, sz, sz);
          }
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      // ---- BIG BLACK HOLE (center-right → shrinks → slides far right) ----
      if (wBlack > 0.002) {
        const bh = SP.blackhole;
        const baseSide = bh.width / dpr;
        const scale = lerp(1, 0.35, bhShrink);
        const cx = lerp(W * 0.66, W * 1.18, bhRight) + mxE * 5;
        const cy = lerp(H * 0.46, H * 0.26, bhRight) + myE * 4;
        const side = baseSide * scale;
        const op = lerp(1, 0.55, bhRight) * wBlack * (bp === "mobile" ? Math.min(1, vis) : 1);
        // slow idle rotation of the whole disk + gentle glow pulse
        const spin = still ? 0 : t * 0.00003;
        const pulse = still ? 1 : 0.94 + 0.06 * Math.sin(t * 0.0006);
        ctx.save();
        ctx.globalAlpha = clamp01(op * pulse);
        ctx.translate(cx, cy);
        ctx.rotate(spin);
        ctx.drawImage(bh, -side / 2, -side / 2, side, side);
        ctx.restore();

        // orbiting particles around the disk (gold → white in transition)
        const R = side * 0.34;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.42 + spin);
        ctx.scale(1, 0.32);
        for (const pt of bhParticles) {
          if (!still) pt.angle += pt.speed;
          const ex = Math.cos(pt.angle) * R * pt.rx;
          const ey = Math.sin(pt.angle) * R * pt.ry;
          const sprite = goldToWhite > 0.5 ? SP.glowWhite : SP.glowGold;
          const sz = (sprite.width / dpr) * pt.scale;
          ctx.globalAlpha = clamp01(pt.alpha * wBlack * vis);
          ctx.drawImage(sprite, ex - sz / 2, ey - sz / 2, sz, sz);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // ---- VERY NEAR: asteroids (ramp in with the journey) ----
      const wAst = band(p, 0.04, 0.3, 0.78, 0.94);
      if (wAst > 0.002) {
        const push = 1 + enter * 1.4;
        asteroids.forEach((a, i) => {
          // count ramps: few early, more mid/deep
          const activeFrac = ramp(p, 0.0, 0.6);
          if (i / asteroids.length > 0.35 + activeFrac * 0.65) return;
          if (!still) {
            a.rot += a.spin;
            a.x += a.drift;
            if (a.x > 1.1) a.x = -0.1;
            if (a.x < -0.1) a.x = 1.1;
          }
          const dx = (a.x - 0.5) * push * a.z;
          const dy = (a.y - 0.5) * push * a.z;
          const x = (0.5 + dx) * W + mxE * 10 * a.z;
          const y = (0.5 + dy) * H + myE * 8 * a.z;
          const sprite = SP!.asteroids[a.variant];
          const s = (sprite.width / dpr) * (0.7 + a.z * 0.8) * (1 + enter * 0.5);
          ctx.save();
          ctx.globalAlpha = clamp01(wAst * (0.6 + a.z * 0.4));
          ctx.translate(x, y);
          ctx.rotate(a.rot);
          ctx.drawImage(sprite, -s / 2, -s / 2, s, s);
          ctx.restore();
        });
        ctx.globalAlpha = 1;
      }

      // ---- SOLAR SYSTEM ----
      if (wSolar > 0.002) {
        const cx = W * 0.5 + mxE * 4;
        const cy = H * 0.52 + myE * 4;
        const sysScale = lerp(0.72, 1.05, ramp(p, 0.8, 0.98));
        const maxOrbit = Math.min(W, H) * 0.46 * sysScale;

        // thin elegant orbital rings (appear progressively)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.5);
        SP.planets.forEach((pl, i) => {
          const showRing = ramp(p, 0.76 + i * 0.014, 0.84 + i * 0.014);
          if (showRing <= 0.01) return;
          const orad = lerp(Math.min(W, H) * 0.08, maxOrbit, pl.base);
          ctx.globalAlpha = clamp01(wSolar * showRing * 0.32);
          ctx.beginPath();
          ctx.arc(0, 0, orad, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(244,244,242,0.6)";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        ctx.restore();
        ctx.globalAlpha = 1;

        // Sun
        const sunSide = (SP.sun.width / dpr) * lerp(0.5, 0.9, ramp(p, 0.74, 1.0));
        ctx.globalAlpha = clamp01(wSolar);
        ctx.drawImage(SP.sun, cx - sunSide / 2, cy - sunSide / 2, sunSide, sunSide);

        // planets reveal in order
        SP.planets.forEach((pl, i) => {
          const appear = ramp(p, 0.78 + i * 0.013, 0.88 + i * 0.013);
          if (appear <= 0.01) return;
          const orad = lerp(Math.min(W, H) * 0.08, maxOrbit, pl.base);
          const ang = (still ? i * 1.7 : t * (0.00003 + (1 - pl.base) * 0.00006) + i * 1.7);
          const px = cx + Math.cos(ang) * orad;
          const py = cy + Math.sin(ang) * orad * 0.5;
          const pSide = (pl.sprite.width / dpr) * sysScale;
          ctx.globalAlpha = clamp01(wSolar * appear);
          ctx.drawImage(pl.sprite, px - pSide / 2, py - pSide / 2, pSide, pSide);
        });
        ctx.globalAlpha = 1;
      }

      // ---- EARTH final close-up ----
      if (wEarth > 0.002) {
        const earth = SP.earth;
        const side0 = earth.width / dpr;
        const scale = lerp(0.5, 1.35, wEarth); // fills a large part of the frame
        const side = side0 * scale;
        // drift up from lower-right toward center as it grows
        const cx = lerp(W * 0.66, W * 0.54, wEarth) + mxE * 3;
        const cy = lerp(H * 0.72, H * 0.54, wEarth) + myE * 3;
        ctx.save();
        ctx.globalAlpha = clamp01(wEarth);
        ctx.translate(cx, cy);
        if (!still) ctx.rotate(t * 0.000012);
        ctx.drawImage(earth, -side / 2, -side / 2, side, side);
        ctx.restore();
      }

      if (!still && !document.hidden) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    const onVisibility = () => {
      if (document.hidden) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      } else if (!still && !frame) {
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMouse);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050505]"
      style={{ contain: "paint" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* readability layer: darken the left/content side so the hero stays clean.
          Backgrounds live in globals.css so a mobile media query can lighten
          them (on a narrow screen the desktop gradient smothers the cosmos). */}
      <div className="galaxy-readability absolute inset-0" />
      {/* soft vignette — darkens far edges only */}
      <div className="galaxy-vignette absolute inset-0" />
    </div>
  );
}
