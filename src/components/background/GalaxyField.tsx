"use client";

import { useEffect, useRef } from "react";

// -----------------------------------------------------------------------------
// GalaxyField — a scroll-driven cinematic "journey through the universe".
// (SYSTEM C — one isolated canvas, never touches React state.)
//
// A single eased scroll progress (0..1) drives a virtual camera through three
// stages that cross-fade continuously:
//
//   0.00 – 0.20  BLACK HOLE      right side, dark core + bright gold disk
//   0.20 – 0.40  TRANSITION      black hole drifts far-right & shrinks,
//                                gold particles fade to white, dust appears
//   0.40 – 0.60  MILKY WAY       enormous tilted white galaxy, pink core,
//                                white crystalline orbital particles, stars
//   0.60 – 0.80  ENTER GALAXY    galaxy grows / star field streams past
//   0.80 – 1.00  SOLAR SYSTEM    dense stars → Sun → orbits → planets
//
// PERFORMANCE CONTRACT — everything expensive is pre-rendered ONCE:
//  - Black hole, Milky Way, Sun, every planet, and all particle glows are
//    painted to OFFSCREEN canvases a single time. The animation loop only calls
//    ctx.drawImage() with translate/scale/rotate. NO createRadialGradient in
//    the loop. Star fields are cheap points batched by alpha.
//  - DPR capped at 2, counts scale by breakpoint, loop pauses on hidden tabs,
//    reduced-motion renders a single static frame, coarse pointers simplify.
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
// smoothstep ramp between edge0..edge1
const ramp = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// a soft 0→1→0 window peaking between a..b
const band = (x: number, a: number, peak0: number, peak1: number, b: number) =>
  Math.min(ramp(x, a, peak0), 1 - ramp(x, peak1, b));
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
      desktop: { stars: 520, bhParticles: 44, crystals: 130, asteroids: 6 },
      tablet: { stars: 300, bhParticles: 30, crystals: 80, asteroids: 4 },
      mobile: { stars: 150, bhParticles: 16, crystals: 40, asteroids: 2 },
    }[bp];

    const rand = mulberry32(0x9e3779b1);

    let W = 0;
    let H = 0;
    let dpr = 1;

    // =========================================================================
    // PRE-RENDERED SPRITES (built once per resize; loop never regenerates them)
    // =========================================================================
    type Sprites = {
      blackhole: HTMLCanvasElement;
      milkyway: HTMLCanvasElement;
      sun: HTMLCanvasElement;
      planets: { name: string; sprite: HTMLCanvasElement; base: number }[];
      glowGold: HTMLCanvasElement;
      glowWhite: HTMLCanvasElement;
      glowPink: HTMLCanvasElement;
      asteroid: HTMLCanvasElement;
    };
    let S: Sprites | null = null;

    const spriteCanvas = (size: number) => {
      const c = document.createElement("canvas");
      c.width = c.height = Math.ceil(size * dpr);
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      g.translate(size / 2, size / 2);
      return { c, g, size };
    };

    // radial glow dot (for particles / stars / crystals)
    const makeGlow = (rgb: string, peak: number, size = 24) => {
      const { c, g } = spriteCanvas(size);
      const r = size / 2;
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
      grad.addColorStop(0, `rgba(${rgb},${peak})`);
      grad.addColorStop(0.5, `rgba(${rgb},${peak * 0.35})`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.fill();
      return c;
    };

    // BLACK HOLE: dark core, bright gold/white accretion disk, inner ring,
    // gravitational-lensing halo. Drawn in a square sprite; the visible radius
    // is ~0.32 of the sprite side.
    const makeBlackHole = (side: number) => {
      const { c, g } = spriteCanvas(side);
      const R = side * 0.34;

      // lensing halo (subtle warm distortion glow)
      const halo = g.createRadialGradient(0, 0, R * 0.5, 0, 0, R * 1.7);
      halo.addColorStop(0, "rgba(243,201,105,0.16)");
      halo.addColorStop(0.5, "rgba(212,166,77,0.06)");
      halo.addColorStop(1, "rgba(212,166,77,0)");
      g.fillStyle = halo;
      g.beginPath();
      g.arc(0, 0, R * 1.7, 0, Math.PI * 2);
      g.fill();

      // accretion disk (flattened, tilted) — bright gold → white
      g.save();
      g.rotate(-0.4);
      g.scale(1, 0.34);
      const disk = g.createRadialGradient(0, 0, R * 0.55, 0, 0, R * 1.35);
      disk.addColorStop(0, "rgba(0,0,0,0)");
      disk.addColorStop(0.52, "rgba(212,166,77,0.35)");
      disk.addColorStop(0.68, "rgba(243,201,105,0.7)");
      disk.addColorStop(0.78, "rgba(255,244,214,0.85)");
      disk.addColorStop(0.9, "rgba(212,166,77,0.4)");
      disk.addColorStop(1, "rgba(185,130,50,0)");
      g.fillStyle = disk;
      g.beginPath();
      g.arc(0, 0, R * 1.35, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // dark core (event horizon) — solid black, soft edge
      const core = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.62);
      core.addColorStop(0, "#000000");
      core.addColorStop(0.78, "#000000");
      core.addColorStop(0.93, "rgba(0,0,0,0.9)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = core;
      g.beginPath();
      g.arc(0, 0, R * 0.62, 0, Math.PI * 2);
      g.fill();

      // thin bright inner photon ring
      g.save();
      g.rotate(-0.4);
      g.scale(1, 0.4);
      g.beginPath();
      g.arc(0, 0, R * 0.62, 0, Math.PI * 2);
      g.strokeStyle = "rgba(255,244,214,0.6)";
      g.lineWidth = 2.4;
      g.stroke();
      g.restore();

      return c;
    };

    // MILKY WAY: enormous tilted galaxy — white outer arms, warm pink→reddish
    // core, cosmic dust. Painted with a couple of spiral-ish arcs of soft dots.
    const makeMilkyWay = (side: number) => {
      const { c, g } = spriteCanvas(side);
      const R = side * 0.46;
      const r2 = mulberry32(0x1234abcd);

      g.rotate(-0.42); // diagonal tilt

      // wide soft disk glow (flattened)
      g.save();
      g.scale(1, 0.34);
      const disk = g.createRadialGradient(0, 0, R * 0.05, 0, 0, R);
      disk.addColorStop(0, "rgba(255,183,197,0.34)"); // FFB7C5 core
      disk.addColorStop(0.16, "rgba(232,143,165,0.24)"); // E88FA5
      disk.addColorStop(0.34, "rgba(168,63,90,0.14)"); // A83F5A deep
      disk.addColorStop(0.6, "rgba(232,229,223,0.1)"); // warm white
      disk.addColorStop(0.85, "rgba(244,244,242,0.06)"); // F4F4F2
      disk.addColorStop(1, "rgba(244,244,242,0)");
      g.fillStyle = disk;
      g.beginPath();
      g.arc(0, 0, R, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // bright central bulge (soft pink → white)
      const bulge = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.28);
      bulge.addColorStop(0, "rgba(255,222,230,0.6)");
      bulge.addColorStop(0.4, "rgba(255,183,197,0.34)");
      bulge.addColorStop(1, "rgba(232,143,165,0)");
      g.fillStyle = bulge;
      g.beginPath();
      g.arc(0, 0, R * 0.28, 0, Math.PI * 2);
      g.fill();

      // spiral arms — thousands of tiny soft white dots along two log-spirals
      const armDots = bp === "mobile" ? 900 : bp === "tablet" ? 1800 : 3200;
      for (let i = 0; i < armDots; i++) {
        const arm = i % 2;
        const tt = (i / armDots) * 5.4; // radial parameter
        const ang = tt * 2.3 + arm * Math.PI + (r2() - 0.5) * 0.5;
        const rad = R * 0.14 + (tt / 5.4) * R * 0.92 + (r2() - 0.5) * R * 0.08;
        const x = Math.cos(ang) * rad;
        const y = Math.sin(ang) * rad * 0.34; // flatten
        const edge = rad / R; // 0 center → 1 outer
        // color: pink near center, warm white outer
        let col: string;
        if (edge < 0.28) col = "255,200,214";
        else if (edge < 0.5) col = "244,232,236";
        else col = "244,244,242";
        const a = (0.5 - Math.abs(edge - 0.55)) * 0.5 * r2();
        if (a <= 0.01) continue;
        g.globalAlpha = clamp01(a);
        g.fillStyle = `rgba(${col},1)`;
        g.beginPath();
        g.arc(x, y, 0.6 + r2() * 1.3, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;

      return c;
    };

    // SUN: bright warm-white/yellow star with a soft corona.
    const makeSun = (side: number) => {
      const { c, g } = spriteCanvas(side);
      const R = side / 2;
      const corona = g.createRadialGradient(0, 0, 0, 0, 0, R);
      corona.addColorStop(0, "rgba(255,250,235,1)");
      corona.addColorStop(0.16, "rgba(255,236,178,0.95)");
      corona.addColorStop(0.34, "rgba(255,210,120,0.5)");
      corona.addColorStop(0.6, "rgba(255,190,90,0.18)");
      corona.addColorStop(1, "rgba(255,180,80,0)");
      g.fillStyle = corona;
      g.beginPath();
      g.arc(0, 0, R, 0, Math.PI * 2);
      g.fill();
      return c;
    };

    // A single planet disk with soft shading + optional ring.
    const makePlanet = (radius: number, rgb: string, ring?: string) => {
      const pad = ring ? radius * 2.6 : radius * 1.5;
      const side = Math.ceil(pad * 2);
      const { c, g } = spriteCanvas(side);
      if (ring) {
        g.save();
        g.rotate(-0.5);
        g.scale(1, 0.32);
        g.beginPath();
        g.arc(0, 0, radius * 1.9, 0, Math.PI * 2);
        g.strokeStyle = ring;
        g.lineWidth = radius * 0.5;
        g.stroke();
        g.restore();
      }
      const grad = g.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
      grad.addColorStop(0, `rgba(${rgb},1)`);
      grad.addColorStop(0.7, `rgba(${rgb},0.95)`);
      grad.addColorStop(1, "rgba(0,0,0,0.65)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(0, 0, radius, 0, Math.PI * 2);
      g.fill();
      return c;
    };

    const makeAsteroid = (size: number, seed: number) => {
      const r2 = mulberry32(seed);
      const side = size + 8;
      const { c, g } = spriteCanvas(side);
      const n = 9;
      const verts = Array.from({ length: n }, () => 0.78 + r2() * 0.34);
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
      g.fillStyle = "#0b0a09";
      g.fill();
      const rim = g.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.05, 0, 0, size * 0.6);
      rim.addColorStop(0, "rgba(212,166,77,0.28)");
      rim.addColorStop(1, "rgba(212,166,77,0)");
      g.fillStyle = rim;
      g.beginPath();
      g.arc(0, 0, size * 0.6, 0, Math.PI * 2);
      g.fill();
      return c;
    };

    // planet visual hierarchy (radii in CSS px; Sun dominates, gas giants big)
    const planetDefs = () => {
      const k = Math.min(W, H) / 900; // scale to viewport
      return [
        { name: "Mercury", r: 2.6 * k, rgb: "150,140,130", base: 0.1 },
        { name: "Venus", r: 4.4 * k, rgb: "214,188,140", base: 0.16 },
        { name: "Earth", r: 4.8 * k, rgb: "120,150,170", base: 0.23 },
        { name: "Mars", r: 3.6 * k, rgb: "180,110,80", base: 0.31 },
        { name: "Jupiter", r: 11 * k, rgb: "200,170,130", base: 0.46 },
        { name: "Saturn", r: 9.2 * k, rgb: "210,190,150", base: 0.62, ring: "rgba(230,220,190,0.5)" },
        { name: "Uranus", r: 6.2 * k, rgb: "170,200,205", base: 0.78 },
        { name: "Neptune", r: 6 * k, rgb: "110,140,190", base: 0.92 },
      ];
    };

    const buildSprites = () => {
      const bhSide = Math.round(Math.min(W, H) * (bp === "mobile" ? 0.9 : 0.7));
      const mwSide = Math.round(Math.max(W, H) * 2.0);
      const sunSide = Math.round(Math.min(W, H) * 0.42);
      const defs = planetDefs();
      S = {
        blackhole: makeBlackHole(bhSide),
        milkyway: makeMilkyWay(mwSide),
        sun: makeSun(sunSide),
        planets: defs.map((d) => ({
          name: d.name,
          base: d.base,
          sprite: makePlanet(d.r, d.rgb, d.ring),
        })),
        glowGold: makeGlow("212,166,77", 0.8),
        glowWhite: makeGlow("255,255,255", 0.9),
        glowPink: makeGlow("255,214,224", 0.85),
        asteroid: makeAsteroid(Math.round(Math.min(W, H) * 0.05), 0x777),
      };
    };

    // =========================================================================
    // SCENE DATA (positions/params only)
    // =========================================================================
    // Black-hole orbiting particles (disk space)
    const bhParticles = Array.from({ length: COUNTS.bhParticles }, () => {
      const b = 0.5 + rand() * 0.9;
      return {
        rx: b,
        ry: b * 0.34,
        angle: rand() * Math.PI * 2,
        speed: (0.001 + rand() * 0.002) * (0.6 + rand() * 0.8),
        scale: 0.1 + rand() * 0.16,
        alpha: 0.35 + rand() * 0.5,
      };
    });

    // Star field (fractional coords + depth for parallax/entering)
    const stars = Array.from({ length: COUNTS.stars }, () => ({
      x: rand(),
      y: rand(),
      z: 0.2 + rand() * 0.8, // depth: bigger z = closer, streams faster
      r: 0.4 + rand() * 1.3,
      a: 0.25 + rand() * 0.6,
      tw: 0.0006 + rand() * 0.0016,
      ph: rand() * Math.PI * 2,
      col: rand() < 0.7 ? "255,255,255" : rand() < 0.5 ? "255,236,214" : "214,224,255",
    }));

    // White crystalline orbital particles around the Milky Way (5-10 orbits)
    const orbitCount = bp === "mobile" ? 5 : bp === "tablet" ? 7 : 9;
    const crystalOrbits = Array.from({ length: orbitCount }, (_, i) => ({
      rf: 0.34 + (i / orbitCount) * 0.9 + rand() * 0.06,
      flat: 0.3 + rand() * 0.16,
      rot: -0.42 + (rand() - 0.5) * 0.5,
      speed: (0.00016 + rand() * 0.0003) * (rand() < 0.5 ? 1 : -1),
    }));
    const crystals = Array.from({ length: COUNTS.crystals }, () => {
      const o = crystalOrbits[Math.floor(rand() * crystalOrbits.length)];
      const cr = rand();
      return {
        orbit: o,
        angle: rand() * Math.PI * 2,
        scale: 0.05 + rand() * 0.1,
        alpha: 0.4 + rand() * 0.5,
        tw: 0.001 + rand() * 0.003,
        ph: rand() * Math.PI * 2,
        glow: cr < 0.6 ? "white" : cr < 0.85 ? "silver" : "pink",
      };
    });

    const asteroids = Array.from({ length: COUNTS.asteroids }, () => ({
      x: 0.55 + rand() * 0.45,
      y: rand(),
      rot: rand() * Math.PI * 2,
      spin: (rand() < 0.5 ? 1 : -1) * (0.00008 + rand() * 0.0001),
      scale: 0.5 + rand() * 1.1,
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
    // SYSTEM D — scroll progress (passive → ref → eased in rAF)
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
      if (!S) return;
      progEased += (progress - progEased) * 0.08;
      mxE += (mx - mxE) * 0.06;
      myE += (my - myE) * 0.06;
      const p = still ? clamp01(progress) : progEased;

      // ---- stage weights (continuous cross-fades) ----
      const wBlack = 1 - ramp(p, 0.14, 0.34); // fades out as we leave stage 1
      const bhDrift = ramp(p, 0.02, 0.5); // 0→1 push to far right + shrink
      const wMilky = band(p, 0.24, 0.44, 0.66, 0.96); // reveal → dominate → recede
      const milkyGrow = ramp(p, 0.4, 1.0); // galaxy grows as we "enter"
      const wStars = ramp(p, 0.3, 0.72); // star field builds in
      const enter = ramp(p, 0.6, 1.0); // camera push-in
      const wSolar = ramp(p, 0.72, 0.9); // solar system reveal
      const goldToWhite = ramp(p, 0.16, 0.42); // particle recolor

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      // ---- STAR FIELD (behind everything from transition onward) ----
      if (wStars > 0.001) {
        const push = 1 + enter * 1.8; // stars spread/stream as we enter
        for (const s of stars) {
          const tw = still ? 1 : 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
          // parallax outward from center as we push in
          const dx = (s.x - 0.5) * push * s.z;
          const dy = (s.y - 0.5) * push * s.z;
          const x = (0.5 + dx) * W + mxE * 6 * s.z;
          const y = (0.5 + dy) * H + myE * 6 * s.z;
          if (x < -5 || x > W + 5 || y < -5 || y > H + 5) continue;
          ctx.globalAlpha = clamp01(s.a * tw * wStars);
          ctx.fillStyle = `rgba(${s.col},1)`;
          ctx.beginPath();
          ctx.arc(x, y, s.r * (1 + enter * s.z), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // ---- MILKY WAY ----
      if (wMilky > 0.001) {
        const mw = S.milkyway;
        // grows and drifts toward center as we approach / enter
        const scale = lerp(0.6, 2.6, milkyGrow) * (0.9 + 0.1 * Math.sin(t * 0.00004));
        const cx = lerp(W * 0.64, W * 0.5, ramp(p, 0.4, 0.8)) + mxE * 10;
        const cy = lerp(H * 0.42, H * 0.5, ramp(p, 0.4, 0.8)) + myE * 8;
        const side = mw.width / dpr;
        ctx.save();
        ctx.globalAlpha = clamp01(wMilky);
        ctx.translate(cx, cy);
        if (!still) ctx.rotate(t * 0.0000045 + enter * 0.15);
        ctx.drawImage(mw, (-side / 2) * scale, (-side / 2) * scale, side * scale, side * scale);
        ctx.restore();

        // white crystalline orbital particles (drawn in tilted disk space)
        const cAlpha = clamp01(wMilky * (0.5 + 0.5 * ramp(p, 0.34, 0.6)));
        if (cAlpha > 0.01) {
          const baseR = Math.max(W, H) * 0.42 * lerp(0.7, 1.6, milkyGrow);
          ctx.save();
          ctx.translate(cx, cy);
          for (const cr of crystals) {
            if (!still) cr.angle += cr.orbit.speed;
            const o = cr.orbit;
            const rr = baseR * o.rf;
            const ex = Math.cos(cr.angle) * rr;
            const ey = Math.sin(cr.angle) * rr * o.flat;
            // rotate the orbit plane
            const rx = ex * Math.cos(o.rot) - ey * Math.sin(o.rot);
            const ry = ex * Math.sin(o.rot) + ey * Math.cos(o.rot);
            const tw = still ? 1 : 0.5 + 0.5 * Math.sin(t * cr.tw + cr.ph);
            const sprite =
              cr.glow === "white" ? S.glowWhite : cr.glow === "pink" ? S.glowPink : S.glowWhite;
            const sz = sprite.width * cr.scale;
            ctx.globalAlpha = cAlpha * cr.alpha * tw;
            ctx.drawImage(sprite, rx - sz / 2, ry - sz / 2, sz, sz);
          }
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      // ---- BLACK HOLE (stage 1 → drifts far right + shrinks) ----
      if (wBlack > 0.002) {
        const bh = S.blackhole;
        const baseSide = Math.min(W, H) * 0.7; // sprite draws hole at ~24vw
        const scale = lerp(1, 0.4, bhDrift);
        const cx = lerp(W * 0.72, W * 1.12, bhDrift) + mxE * 6;
        const cy = lerp(H * 0.44, H * 0.3, bhDrift) + myE * 5;
        const side = baseSide * scale;
        ctx.save();
        ctx.globalAlpha = clamp01(wBlack);
        ctx.translate(cx, cy);
        ctx.drawImage(bh, -side / 2, -side / 2, side, side);
        ctx.restore();

        // tiny orbiting particles (gold → white as we transition)
        const R = baseSide * scale * 0.34;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.4);
        for (const pt of bhParticles) {
          if (!still) pt.angle += pt.speed;
          const ex = Math.cos(pt.angle) * R * pt.rx;
          const ey = Math.sin(pt.angle) * R * pt.ry;
          const sprite = goldToWhite > 0.5 ? S.glowWhite : S.glowGold;
          const sz = sprite.width * pt.scale;
          ctx.globalAlpha = clamp01(pt.alpha * wBlack);
          ctx.drawImage(sprite, ex - sz / 2, ey - sz / 2, sz, sz);
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // a few distant asteroids near the hole (fade with stage 1)
        const ast = S.asteroid;
        const aSide = ast.width / dpr;
        for (const a of asteroids) {
          if (!still) a.rot += a.spin;
          const x = a.x * W + mxE * 8;
          const y = a.y * H + myE * 6;
          const s = aSide * a.scale * scale;
          ctx.save();
          ctx.globalAlpha = clamp01(wBlack * 0.9);
          ctx.translate(x, y);
          ctx.rotate(a.rot);
          ctx.drawImage(ast, -s / 2, -s / 2, s, s);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }

      // ---- SOLAR SYSTEM (stage 3) ----
      if (wSolar > 0.002) {
        const sunSprite = S.sun;
        const cx = W * 0.5 + mxE * 4;
        const cy = H * 0.52 + myE * 4;
        // system scales up slightly as it settles in
        const sysScale = lerp(0.7, 1.05, ramp(p, 0.78, 1.0));

        // thin white orbital rings
        const maxOrbit = Math.min(W, H) * 0.46 * sysScale;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.5); // slight top-down tilt
        for (const pl of S.planets) {
          const orad = lerp(Math.min(W, H) * 0.09, maxOrbit, pl.base);
          ctx.globalAlpha = clamp01(wSolar * 0.25);
          ctx.beginPath();
          ctx.arc(0, 0, orad, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(244,244,242,0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        // Sun
        const sunSide = (sunSprite.width / dpr) * lerp(0.5, 0.85, ramp(p, 0.74, 1.0));
        ctx.globalAlpha = clamp01(wSolar);
        ctx.drawImage(sunSprite, cx - sunSide / 2, cy - sunSide / 2, sunSide, sunSide);

        // planets — each fades/scales in a touch after its orbit appears
        S.planets.forEach((pl, i) => {
          const appear = ramp(p, 0.78 + i * 0.012, 0.9 + i * 0.012);
          if (appear <= 0.01) return;
          const orad = lerp(Math.min(W, H) * 0.09, maxOrbit, pl.base);
          // slow orbital motion — inner planets sweep a touch faster
          const ang = (still ? 0 : t * (0.00003 + (1 - pl.base) * 0.00006)) + i * 1.7;
          const px = cx + Math.cos(ang) * orad;
          const py = cy + Math.sin(ang) * orad * 0.5; // match tilt
          const pSide = (pl.sprite.width / dpr) * sysScale;
          ctx.globalAlpha = clamp01(wSolar * appear);
          ctx.drawImage(pl.sprite, px - pSide / 2, py - pSide / 2, pSide, pSide);
        });
        ctx.globalAlpha = 1;
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

      {/* readability layer: darken the left/content side so the hero stays clean */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,0.94) 0%, rgba(5,5,5,0.78) 34%, rgba(5,5,5,0.32) 68%, rgba(5,5,5,0.08) 100%)",
        }}
      />
      {/* soft vignette — darkens far edges only */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(150% 150% at 55% 48%, transparent 68%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </div>
  );
}
