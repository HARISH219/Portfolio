"use client";

import { useEffect, useRef } from "react";

// -----------------------------------------------------------------------------
// GalaxyField  (SYSTEM C — isolated canvas, never touches React state)
//
// A large, clearly-visible but elegant golden galaxy: a dark black-hole core
// with a warm accretion disk, a wide dust halo, orbiting golden particles in
// depth tiers, a few dark asteroids, thin orbital rings, and faint code
// fragments. Reacts to scroll (subtle zoom + parallax) and, on desktop, a very
// light mouse parallax on asteroids.
//
// PERFORMANCE CONTRACT — everything expensive is pre-rendered ONCE:
//  - The whole static galaxy (halo + dust + disk + orbital rings + core) is
//    painted to an OFFSCREEN canvas a single time. Per frame we only
//    ctx.drawImage() that sprite with a translate/scale transform. There are
//    NO createRadialGradient / createLinearGradient calls in the animation loop.
//  - Particles use ONE tiny pre-rendered glow sprite per brightness tier,
//    stamped with drawImage. Asteroids are pre-rendered sprites too.
//  - DPR capped at 2, counts scale by breakpoint, the loop pauses on hidden
//    tabs, reduced-motion / coarse-pointer render a single static frame.
// -----------------------------------------------------------------------------

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

const CODE_TOKENS = [
  "<>", "</>", "{}", "[]", "()", "=>", "&&", "//", "0x", "01",
  "const", "async", "await", "return", "null", "git", "npm", "fn",
];

type Orbit = {
  rx: number; // radius x (fraction of R)
  ry: number; // radius y
  angle: number;
  speed: number; // rad per frame-ish
  scale: number; // sprite scale
  tierGlow: 0 | 1 | 2; // which glow sprite
  alpha: number;
  twk: number;
  ph: number;
};
type Asteroid = {
  x: number; // fraction of width
  y: number; // fraction of height
  sprite: HTMLCanvasElement;
  size: number;
  tier: Tier;
  rot: number;
  spin: number;
  parX: number;
  parY: number;
  scrollPar: number;
};
type CodeBit = { x: number; y: number; size: number; alpha: number; token: string; par: number };

export function GalaxyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const still = reduced; // fully static frame for reduced-motion
    const allowMouse = !coarse && !reduced;

    const w0 = window.innerWidth;
    const bp: "mobile" | "tablet" | "desktop" =
      w0 < 640 ? "mobile" : w0 < 1024 ? "tablet" : "desktop";

    const COUNTS = {
      desktop: { particles: 80, asteroids: 7, code: 20 },
      tablet: { particles: 34, asteroids: 5, code: 12 },
      mobile: { particles: 16, asteroids: 3, code: 7 },
    }[bp];

    const rand = mulberry32(0x51a3f00d);

    // --- viewport / DPR ------------------------------------------------------
    let W = 0;
    let H = 0;
    let dpr = 1;

    // Black-hole center — toward center-right so hero text (left) stays clean.
    const holeX = () => W * 0.68;
    const holeY = () => H * 0.46;
    // The galaxy is intentionally MASSIVE — extends well beyond the viewport.
    const baseR = () => Math.max(W, H) * 0.85;

    const TILT = -0.3; // radians — the disk is rotated for a dynamic composition

    // -------------------------------------------------------------------------
    // PRE-RENDER: the entire static galaxy → one offscreen sprite.
    // Drawn in a square canvas of side 2*S centered on (S,S). We compose it at
    // runtime with a single drawImage + transform. Rebuilt only on resize.
    // -------------------------------------------------------------------------
    let galaxySprite: HTMLCanvasElement | null = null;
    let coreSprite: HTMLCanvasElement | null = null;
    let spriteHalf = 0; // S (galaxy sprite half-size, in CSS px)

    const buildGalaxySprite = (R: number) => {
      const S = Math.ceil(R * 2.0); // extends well beyond the disk for the halo
      spriteHalf = S;
      const c = document.createElement("canvas");
      c.width = Math.floor(S * 2 * dpr);
      c.height = Math.floor(S * 2 * dpr);
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      g.translate(S, S);
      g.rotate(TILT);

      // 1) Wide amber dust halo (soft, brown-gold, fades to black). Brighter so
      //    the galaxy's overall shape reads clearly against the black page.
      const halo = g.createRadialGradient(0, 0, R * 0.1, 0, 0, R * 1.95);
      halo.addColorStop(0, "rgba(180,125,40,0.24)");
      halo.addColorStop(0.32, "rgba(165,112,36,0.15)");
      halo.addColorStop(0.62, "rgba(120,80,28,0.07)");
      halo.addColorStop(1, "rgba(90,60,20,0)");
      g.fillStyle = halo;
      g.beginPath();
      g.arc(0, 0, R * 1.95, 0, Math.PI * 2);
      g.fill();

      // 2) Outer dust cloud — a flattened elliptical band around the disk.
      g.save();
      g.scale(1, 0.44);
      const dust = g.createRadialGradient(0, 0, R * 0.4, 0, 0, R * 1.6);
      dust.addColorStop(0, "rgba(180,125,40,0.16)");
      dust.addColorStop(0.5, "rgba(200,145,55,0.22)");
      dust.addColorStop(0.8, "rgba(150,100,38,0.10)");
      dust.addColorStop(1, "rgba(120,80,28,0)");
      g.fillStyle = dust;
      g.beginPath();
      g.arc(0, 0, R * 1.6, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // 3) Accretion disk — bright warm-gold flattened ring (the visible star).
      g.save();
      g.scale(1, 0.4);
      const disk = g.createRadialGradient(0, 0, R * 0.22, 0, 0, R * 1.1);
      disk.addColorStop(0, "rgba(0,0,0,0)");
      disk.addColorStop(0.38, "rgba(212,166,77,0.24)");
      disk.addColorStop(0.56, "rgba(243,201,105,0.42)");
      disk.addColorStop(0.68, "rgba(255,230,170,0.34)");
      disk.addColorStop(0.82, "rgba(212,166,77,0.2)");
      disk.addColorStop(1, "rgba(180,125,40,0)");
      g.fillStyle = disk;
      g.beginPath();
      g.arc(0, 0, R * 1.1, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // 4) Thin orbital rings (elliptical, low opacity but visible).
      const rings = [
        { rf: 0.42, a: 0.22 },
        { rf: 0.62, a: 0.18 },
        { rf: 0.9, a: 0.13 },
        { rf: 1.25, a: 0.09 },
      ];
      for (const o of rings) {
        g.beginPath();
        g.ellipse(0, 0, R * o.rf, R * o.rf * 0.4, 0, 0, Math.PI * 2);
        g.strokeStyle = `rgba(212,166,77,${o.a})`;
        g.lineWidth = 1.2;
        g.stroke();
      }

      // 5) Photon-ring hint hugging the core.
      g.save();
      g.scale(1, 0.42);
      g.beginPath();
      g.arc(0, 0, R * 0.3, 0, Math.PI * 2);
      g.strokeStyle = "rgba(243,201,105,0.42)";
      g.lineWidth = 2.4;
      g.stroke();
      g.restore();

      galaxySprite = c;

      // Core sprite (unrotated, circular) — pure black centre with soft edge.
      const cs = Math.ceil(R * 0.4);
      const cc = document.createElement("canvas");
      cc.width = Math.floor(cs * 2 * dpr);
      cc.height = Math.floor(cs * 2 * dpr);
      const gc = cc.getContext("2d")!;
      gc.scale(dpr, dpr);
      gc.translate(cs, cs);
      const core = gc.createRadialGradient(0, 0, 0, 0, 0, cs);
      core.addColorStop(0, "#000000");
      core.addColorStop(0.62, "#000000");
      core.addColorStop(0.82, "rgba(2,2,2,0.85)");
      core.addColorStop(1, "rgba(3,3,3,0)");
      gc.fillStyle = core;
      gc.beginPath();
      gc.arc(0, 0, cs, 0, Math.PI * 2);
      gc.fill();
      coreSprite = cc;
    };

    // Particle glow sprites (3 brightness tiers) — pre-rendered once.
    const makeGlow = (rgb: string, peak: number) => {
      const s = 16;
      const c = document.createElement("canvas");
      c.width = c.height = s * 2;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(s, s, 0, s, s, s);
      grad.addColorStop(0, `rgba(${rgb},${peak})`);
      grad.addColorStop(0.5, `rgba(${rgb},${peak * 0.4})`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(s, s, s, 0, Math.PI * 2);
      g.fill();
      return c;
    };
    const glowSprites = [
      makeGlow("212,166,77", 0.7), // most — warm gold
      makeGlow("243,201,105", 0.9), // some — bright
      makeGlow("255,241,199", 1.0), // few — near white
    ];

    // Asteroid sprite: irregular dark blob + faint gold rim. Pre-rendered.
    const makeAsteroid = (size: number, seed: number) => {
      const r2 = mulberry32(seed);
      const pad = 6;
      const s = size + pad * 2;
      const c = document.createElement("canvas");
      c.width = c.height = Math.ceil(s * dpr);
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      g.translate(s / 2, s / 2);
      const n = 9;
      const verts = Array.from({ length: n }, () => 0.78 + r2() * 0.34);
      const path = () => {
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
      };
      path();
      g.fillStyle = "#0b0a09";
      g.fill();
      // gold rim light from the top-left (toward the hole side, roughly)
      const rim = g.createRadialGradient(-size * 0.22, -size * 0.22, size * 0.05, 0, 0, size * 0.6);
      rim.addColorStop(0, "rgba(212,166,77,0.3)");
      rim.addColorStop(1, "rgba(212,166,77,0)");
      path();
      g.fillStyle = rim;
      g.fill();
      return c;
    };

    // -------------------------------------------------------------------------
    // Scene data (positions/params only — visuals come from sprites)
    // -------------------------------------------------------------------------
    const orbits: Orbit[] = Array.from({ length: COUNTS.particles }, () => {
      const tr = rand();
      const tier: Tier = tr < 0.4 ? "far" : tr < 0.78 ? "mid" : "near";
      const band =
        tier === "near"
          ? 0.24 + rand() * 0.26
          : tier === "mid"
            ? 0.5 + rand() * 0.42
            : 0.95 + rand() * 0.55;
      const speed =
        (tier === "near" ? 0.0024 : tier === "mid" ? 0.0015 : 0.0009) * (0.7 + rand() * 0.6);
      const gr = rand();
      const tierGlow: 0 | 1 | 2 = gr < 0.68 ? 0 : gr < 0.92 ? 1 : 2;
      const sizeR = rand();
      const scale = sizeR < 0.82 ? 0.1 + rand() * 0.12 : 0.22 + rand() * 0.16;
      return {
        rx: band,
        ry: band * (0.36 + rand() * 0.1),
        angle: rand() * Math.PI * 2,
        speed,
        scale,
        tierGlow,
        alpha: 0.5 + rand() * 0.5,
        twk: 0.001 + rand() * 0.002,
        ph: rand() * Math.PI * 2,
      };
    });

    const asteroids: Asteroid[] = Array.from({ length: COUNTS.asteroids }, (_, i) => {
      const foreground = i < (bp === "mobile" ? 1 : 2);
      const tier: Tier = foreground ? "near" : rand() < 0.5 ? "far" : "mid";
      const size =
        tier === "near" ? 70 + rand() * 55 : tier === "mid" ? 32 + rand() * 24 : 18 + rand() * 14;
      return {
        x: rand(),
        y: rand(),
        sprite: makeAsteroid(size, 0x1000 + i * 977),
        size,
        tier,
        rot: rand() * Math.PI * 2,
        spin: (rand() < 0.5 ? 1 : -1) * (0.00006 + rand() * 0.0001),
        parX: tier === "near" ? 10 : tier === "mid" ? 5 : 2,
        parY: tier === "near" ? 7 : tier === "mid" ? 3.5 : 1.4,
        scrollPar: tier === "near" ? 0.42 : tier === "mid" ? 0.24 : 0.1,
      };
    });

    const codeBits: CodeBit[] = Array.from({ length: COUNTS.code }, () => {
      // bias away from the hero text region (upper-left)
      let x = rand();
      const y = rand();
      if (x > 0.1 && x < 0.48 && y > 0.12 && y < 0.58) x = x < 0.3 ? x * 0.35 : x + 0.32;
      return {
        x,
        y,
        size: 10 + rand() * 4,
        alpha: rand() < 0.8 ? 0.05 + rand() * 0.06 : 0.12 + rand() * 0.04,
        token: CODE_TOKENS[Math.floor(rand() * CODE_TOKENS.length)],
        par: 0.05 + rand() * 0.12,
      };
    });

    // -------------------------------------------------------------------------
    // Sizing (rebuilds sprites since gradients are resolution-dependent)
    // -------------------------------------------------------------------------
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGalaxySprite(baseR());
    };
    resize();

    // -------------------------------------------------------------------------
    // SYSTEM D — scroll state (passive listener → ref → eased in rAF)
    // -------------------------------------------------------------------------
    let scrollY = window.scrollY;
    let scrollEased = scrollY;
    let mx = 0;
    let my = 0;
    let mxE = 0;
    let myE = 0;

    const onScroll = () => {
      scrollY = window.scrollY;
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
    if (allowMouse) window.addEventListener("pointermove", onMouse, { passive: true });

    // -------------------------------------------------------------------------
    // DRAW — only drawImage + transforms. No gradient creation here.
    // -------------------------------------------------------------------------
    let frame = 0;
    const draw = (t: number) => {
      const hx = holeX();
      const hy = holeY();
      const R = baseR();

      scrollEased += (scrollY - scrollEased) * 0.09;
      mxE += (mx - mxE) * 0.06;
      myE += (my - myE) * 0.06;

      // subtle scroll zoom on the BACKGROUND only: 1.0 -> ~1.12
      const zoom = still ? 1 : 1 + Math.min(scrollEased / (H * 1.7), 1) * 0.12;
      const bgShiftY = still ? 0 : -scrollEased * 0.05;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      // 1) static galaxy sprite (halo+dust+disk+rings) — single drawImage
      if (galaxySprite) {
        ctx.save();
        ctx.translate(hx, hy + bgShiftY);
        ctx.scale(zoom, zoom);
        ctx.drawImage(galaxySprite, -spriteHalf, -spriteHalf, spriteHalf * 2, spriteHalf * 2);
        ctx.restore();
      }

      // 2) orbiting particles (in tilted disk space) — stamp glow sprites
      ctx.save();
      ctx.translate(hx, hy + bgShiftY);
      ctx.scale(zoom, zoom);
      ctx.rotate(TILT);
      for (const o of orbits) {
        if (!still) o.angle += o.speed;
        const ex = Math.cos(o.angle) * R * o.rx;
        const ey = Math.sin(o.angle) * R * o.ry;
        const tw = still ? 1 : 0.6 + 0.4 * Math.sin(t * o.twk + o.ph);
        const sprite = glowSprites[o.tierGlow];
        const sz = sprite.width * o.scale;
        ctx.globalAlpha = o.alpha * tw;
        ctx.drawImage(sprite, ex - sz / 2, ey - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // 3) core (black hole) on top of the disk, unrotated
      if (coreSprite) {
        const cs = R * 0.4 * zoom;
        ctx.drawImage(coreSprite, hx - cs, hy + bgShiftY - cs, cs * 2, cs * 2);
      }

      // 4) asteroids (screen space, parallax) — pre-rendered sprites
      for (const a of asteroids) {
        if (!still) a.rot += a.spin;
        const scrollOff = scrollEased * a.scrollPar;
        const cx = a.x * W + mxE * a.parX;
        let cy = a.y * H + myE * a.parY - scrollOff * 0.4 + scrollOff;
        // wrap vertically so they drift rather than vanish
        cy = ((cy % (H + 300)) + H + 300) % (H + 300) - 150;
        const s = a.sprite.width / dpr;
        const scl = a.tier === "near" ? zoom : 1;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a.rot);
        ctx.scale(scl, scl);
        ctx.drawImage(a.sprite, -s / 2, -s / 2, s, s);
        ctx.restore();
      }

      // 5) faint code fragments (cheap text)
      for (const c of codeBits) {
        const cx = c.x * W + mxE * c.par * 6;
        let cy = c.y * H - scrollEased * c.par;
        cy = ((cy % (H + 80)) + H + 80) % (H + 80) - 40;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(212,166,77,${c.alpha})`;
        ctx.font = `500 ${c.size}px ui-monospace, monospace`;
        ctx.fillText(c.token, cx, cy);
      }
      ctx.globalAlpha = 1;

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

      {/* readability layer: darken the left/content side, keep galaxy on the right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.80) 34%, rgba(5,5,5,0.30) 68%, rgba(5,5,5,0.06) 100%)",
        }}
      />
      {/* soft vignette — only darkens the far edges so the disk stays bright */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(150% 150% at 62% 46%, transparent 70%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
}
