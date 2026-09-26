"use client";

import { useEffect, useRef } from "react";

// -----------------------------------------------------------------------------
// GalaxyField — one continuous, scroll-driven camera journey.
//
// This is one persistent pseudo-3D scene, not a sequence of backgrounds. The
// black hole, galaxy, galactic star field, Sun, orbital planes, every planet,
// and Earth exist from the first frame. Scroll advances one smoothed camera
// along a logarithmic path. Distance, projection, viewport position, and level
// of detail determine what can be resolved; nothing is spawned by a stage flag.
//
// Performance contract:
// - One fixed canvas. No React state in the animation path.
// - Heavy visuals are cached offscreen once (black hole, spiral galaxy, dust,
//   Sun, planets, Earth, crystals, asteroids).
// - The frame loop uses drawImage + transforms and capped particle buffers.
// - DPR <= 2; sprite resolutions/counts drop on mobile.
// - Passive scroll, frame-rate-independent camera inertia, hidden-tab pause,
//   reduced-motion static frame, and complete listener/rAF cleanup.
// -----------------------------------------------------------------------------

const TAU = Math.PI * 2;

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
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const smoother = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const expMix = (a: number, b: number, t: number) =>
  Math.exp(mix(Math.log(a), Math.log(b), clamp01(t)));

interface GalaxyAsset {
  canvas: HTMLCanvasElement;
  sunNX: number;
  sunNY: number;
}

interface EarthAsset {
  surface: HTMLCanvasElement;
  shade: HTMLCanvasElement;
  visualRadius: number;
}

interface PlanetAsset {
  name: string;
  canvas?: HTMLCanvasElement;
  orbit: number;
  radius: number;
  speed: number;
  phase: number;
  tilt: number;
  visualRadius: number;
  isEarth?: boolean;
}

interface SceneAssets {
  blackHole: HTMLCanvasElement;
  galaxy: GalaxyAsset;
  dust: HTMLCanvasElement[];
  glowGold: HTMLCanvasElement;
  glowWhite: HTMLCanvasElement;
  glowPink: HTMLCanvasElement;
  crystalWhite: HTMLCanvasElement;
  crystalPink: HTMLCanvasElement;
  asteroid: HTMLCanvasElement[];
  sun: HTMLCanvasElement;
  earth: EarthAsset;
  planets: PlanetAsset[];
}

export function GalaxyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const initialWidth = window.innerWidth;
    const tier: "mobile" | "tablet" | "desktop" =
      initialWidth < 640 ? "mobile" : initialWidth < 1024 ? "tablet" : "desktop";

    const counts = {
      desktop: {
        farStars: 440,
        fieldStars: 760,
        holeDust: 72,
        crystals: 108,
        asteroids: 12,
        galaxyPoints: 15000,
      },
      tablet: {
        farStars: 280,
        fieldStars: 440,
        holeDust: 48,
        crystals: 68,
        asteroids: 8,
        galaxyPoints: 8500,
      },
      mobile: {
        farStars: 150,
        fieldStars: 210,
        holeDust: 30,
        crystals: 34,
        asteroids: 5,
        galaxyPoints: 4200,
      },
    }[tier];

    const mobileBoost = tier === "mobile" ? 1.45 : 1;
    const rand = mulberry32(0x4f1bbcdc);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let assets: SceneAssets | null = null;

    // -------------------------------------------------------------------------
    // Offscreen asset builders. Their resolution is explicitly capped instead
    // of growing with viewport * DPR, preventing huge textures and resize stalls.
    // -------------------------------------------------------------------------
    const makeCanvas = (pixels: number) => {
      const side = Math.max(8, Math.round(pixels));
      const out = document.createElement("canvas");
      out.width = out.height = side;
      const g = out.getContext("2d")!;
      g.translate(side / 2, side / 2);
      return { canvas: out, g, side };
    };

    const makeGlow = (rgb: string, peak: number, pixels = 32) => {
      const { canvas: out, g, side } = makeCanvas(pixels);
      const radius = side / 2;
      const gradient = g.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, `rgba(${rgb},${peak})`);
      gradient.addColorStop(0.34, `rgba(${rgb},${peak * 0.65})`);
      gradient.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gradient;
      g.beginPath();
      g.arc(0, 0, radius, 0, TAU);
      g.fill();
      return out;
    };

    const makeCrystal = (rgb: string) => {
      const { canvas: out, g } = makeCanvas(24);
      g.shadowColor = `rgba(${rgb},0.55)`;
      g.shadowBlur = 3;
      g.fillStyle = `rgba(${rgb},0.9)`;
      g.beginPath();
      g.moveTo(0, -7);
      g.lineTo(4, 0);
      g.lineTo(0, 7);
      g.lineTo(-4, 0);
      g.closePath();
      g.fill();
      g.shadowBlur = 0;
      g.strokeStyle = `rgba(${rgb},0.55)`;
      g.lineWidth = 0.7;
      g.beginPath();
      g.moveTo(0, -7);
      g.lineTo(0, 7);
      g.moveTo(-4, 0);
      g.lineTo(4, 0);
      g.stroke();
      return out;
    };

    const makeBlackHole = (resolution: number) => {
      const { canvas: out, g, side } = makeCanvas(resolution);
      const radius = side * 0.245;
      const detailRand = mulberry32(0x0b1ac001);

      // Gravitational-lensing halo. Only this distant envelope is soft.
      const lens = g.createRadialGradient(0, 0, radius * 0.55, 0, 0, radius * 1.95);
      lens.addColorStop(0, "rgba(255,229,170,0.16)");
      lens.addColorStop(0.48, "rgba(212,150,66,0.065)");
      lens.addColorStop(1, "rgba(156,96,30,0)");
      g.fillStyle = lens;
      g.beginPath();
      g.arc(0, 0, radius * 1.95, 0, TAU);
      g.fill();

      const diskLayer = (
        inner: number,
        outer: number,
        flatness: number,
        stops: Array<[number, string]>,
      ) => {
        g.save();
        g.rotate(-0.33);
        g.scale(1, flatness);
        const gradient = g.createRadialGradient(0, 0, inner, 0, 0, outer);
        stops.forEach(([at, color]) => gradient.addColorStop(at, color));
        g.fillStyle = gradient;
        g.beginPath();
        g.arc(0, 0, outer, 0, TAU);
        g.fill();
        g.restore();
      };

      // Wide dusty outer disk.
      diskLayer(radius * 0.55, radius * 1.72, 0.3, [
        [0, "rgba(0,0,0,0)"],
        [0.36, "rgba(125,76,25,0.08)"],
        [0.6, "rgba(181,113,40,0.24)"],
        [0.78, "rgba(215,151,67,0.17)"],
        [1, "rgba(130,76,22,0)"],
      ]);

      // Structured inner disk with a warm-white hot edge.
      diskLayer(radius * 0.5, radius * 1.3, 0.255, [
        [0, "rgba(0,0,0,0)"],
        [0.43, "rgba(191,119,41,0.22)"],
        [0.58, "rgba(235,171,75,0.58)"],
        [0.69, "rgba(255,218,145,0.88)"],
        [0.77, "rgba(255,246,220,0.92)"],
        [0.88, "rgba(214,147,56,0.38)"],
        [1, "rgba(143,83,24,0)"],
      ]);

      // Crisp accretion streaks and dust granularity.
      g.save();
      g.rotate(-0.33);
      g.scale(1, 0.255);
      for (let i = 0; i < (tier === "mobile" ? 360 : 920); i++) {
        const angle = detailRand() * TAU;
        const rr = radius * (0.58 + Math.pow(detailRand(), 0.72) * 0.78);
        const length = radius * (0.006 + detailRand() * 0.035);
        g.globalAlpha = 0.14 + detailRand() * 0.58;
        g.strokeStyle = detailRand() < 0.22 ? "#fff1c7" : detailRand() < 0.6 ? "#e6b467" : "#b8742e";
        g.lineWidth = 0.45 + detailRand() * 1.15;
        g.beginPath();
        g.arc(0, 0, rr, angle, angle + length / rr);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.restore();

      // Pure-black event horizon with a controlled edge.
      const eventHorizon = g.createRadialGradient(0, 0, radius * 0.08, 0, 0, radius * 0.62);
      eventHorizon.addColorStop(0, "#000000");
      eventHorizon.addColorStop(0.82, "#000000");
      eventHorizon.addColorStop(0.94, "rgba(0,0,0,0.96)");
      eventHorizon.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = eventHorizon;
      g.beginPath();
      g.arc(0, 0, radius * 0.62, 0, TAU);
      g.fill();

      // Thin photon ring and two lensing arcs.
      g.save();
      g.rotate(-0.33);
      g.scale(1, 0.31);
      g.strokeStyle = "rgba(255,247,224,0.82)";
      g.lineWidth = Math.max(1.4, side * 0.0022);
      g.beginPath();
      g.arc(0, 0, radius * 0.625, 0, TAU);
      g.stroke();
      g.globalAlpha = 0.34;
      g.lineWidth *= 0.55;
      g.beginPath();
      g.arc(0, 0, radius * 0.76, Math.PI * 1.06, Math.PI * 1.94);
      g.stroke();
      g.beginPath();
      g.arc(0, 0, radius * 0.72, 0.08, Math.PI * 0.92);
      g.stroke();
      g.restore();

      return out;
    };

    // Procedural spiral rendered once at a bounded resolution. Sharp, projected
    // 3D field stars later provide fresh micro-detail as the camera moves inside.
    const makeGalaxy = (resolution: number, points: number): GalaxyAsset => {
      const { canvas: out, g, side } = makeCanvas(resolution);
      const radius = side * 0.455;
      const galaxyRand = mulberry32(0x61a1ac7e);
      const diagonal = -0.31;
      const flatten = 0.39;
      const cosD = Math.cos(diagonal);
      const sinD = Math.sin(diagonal);

      const planeToSprite = (x: number, y: number) => {
        const fy = y * flatten;
        return {
          x: x * cosD - fy * sinD,
          y: x * sinD + fy * cosD,
        };
      };

      // Faint outer gas only; no blur covers the arm structure.
      g.save();
      g.rotate(diagonal);
      g.scale(1, flatten);
      const haze = g.createRadialGradient(0, 0, radius * 0.06, 0, 0, radius);
      haze.addColorStop(0, "rgba(255,220,228,0.2)");
      haze.addColorStop(0.3, "rgba(220,151,167,0.1)");
      haze.addColorStop(0.68, "rgba(230,229,225,0.055)");
      haze.addColorStop(1, "rgba(220,220,216,0)");
      g.fillStyle = haze;
      g.beginPath();
      g.arc(0, 0, radius, 0, TAU);
      g.fill();
      g.restore();

      const armCount = 2;
      const turns = 2.72;

      // Layered gas points: broader and dimmer than stellar arms.
      for (let i = 0; i < Math.round(points * 0.34); i++) {
        const arm = i % armCount;
        const radialT = Math.pow(galaxyRand(), 0.72);
        const theta = radialT * turns * TAU + arm * Math.PI + (galaxyRand() - 0.5) * 0.72;
        const rr = radius * (0.075 + radialT * 0.91) + (galaxyRand() - 0.5) * radius * 0.09;
        const pos = planeToSprite(Math.cos(theta) * rr, Math.sin(theta) * rr);
        const central = 1 - radialT;
        g.globalAlpha = 0.025 + galaxyRand() * 0.075;
        g.fillStyle = central > 0.58 ? "#d96a7e" : galaxyRand() < 0.35 ? "#ffe1e6" : "#e8e5df";
        g.beginPath();
        g.arc(pos.x, pos.y, 1.1 + galaxyRand() * 3.2, 0, TAU);
        g.fill();
      }

      // Crisp stellar spiral arms.
      for (let i = 0; i < points; i++) {
        const arm = i % armCount;
        const radialT = Math.pow(galaxyRand(), 0.64);
        const armWidth = 0.08 + (1 - radialT) * 0.26;
        const theta = radialT * turns * TAU + arm * Math.PI + (galaxyRand() - 0.5) * armWidth;
        const rr = radius * (0.065 + radialT * 0.93) + (galaxyRand() - 0.5) * radius * 0.045;
        const pos = planeToSprite(Math.cos(theta) * rr, Math.sin(theta) * rr);
        const edge = rr / radius;
        const colorPick = galaxyRand();
        let color = "#f4f4f2";
        if (edge < 0.2) color = colorPick < 0.48 ? "#ffffff" : "#ffe6e8";
        else if (edge < 0.42) color = colorPick < 0.35 ? "#ffb5c0" : "#f7ecee";
        else if (edge > 0.76) color = colorPick < 0.55 ? "#d8d8d5" : "#b8b8b5";
        const opacity = clamp01((1.03 - edge) * (0.34 + galaxyRand() * 0.72));
        if (opacity < 0.025) continue;
        g.globalAlpha = opacity;
        g.fillStyle = color;
        g.beginPath();
        g.arc(pos.x, pos.y, 0.42 + galaxyRand() * (edge < 0.28 ? 1.7 : 1.05), 0, TAU);
        g.fill();
      }
      g.globalAlpha = 1;

      // Dark dust lanes slightly offset from each luminous arm.
      for (let i = 0; i < Math.round(points * 0.16); i++) {
        const arm = i % armCount;
        const radialT = 0.12 + galaxyRand() * 0.84;
        const theta = radialT * turns * TAU + arm * Math.PI + 0.12 + (galaxyRand() - 0.5) * 0.11;
        const rr = radius * (0.065 + radialT * 0.93);
        const pos = planeToSprite(Math.cos(theta) * rr, Math.sin(theta) * rr);
        g.globalAlpha = 0.08 + galaxyRand() * 0.17;
        g.fillStyle = "#070507";
        g.beginPath();
        g.arc(pos.x, pos.y, 0.8 + galaxyRand() * 2.15, 0, TAU);
        g.fill();
      }
      g.globalAlpha = 1;

      // Layered core under crisp central stars—never a flat white circle.
      const core = g.createRadialGradient(0, 0, 0, 0, 0, radius * 0.205);
      core.addColorStop(0, "rgba(255,255,255,0.86)");
      core.addColorStop(0.16, "rgba(255,240,242,0.72)");
      core.addColorStop(0.42, "rgba(255,181,192,0.48)");
      core.addColorStop(0.72, "rgba(217,106,126,0.22)");
      core.addColorStop(1, "rgba(168,63,90,0)");
      g.fillStyle = core;
      g.beginPath();
      g.arc(0, 0, radius * 0.205, 0, TAU);
      g.fill();
      for (let i = 0; i < (tier === "mobile" ? 120 : 360); i++) {
        const angle = galaxyRand() * TAU;
        const rr = Math.pow(galaxyRand(), 1.7) * radius * 0.2;
        g.globalAlpha = 0.18 + galaxyRand() * 0.7;
        g.fillStyle = galaxyRand() < 0.5 ? "#ffffff" : "#ffdfe5";
        g.beginPath();
        g.arc(Math.cos(angle) * rr, Math.sin(angle) * rr, 0.4 + galaxyRand() * 1.15, 0, TAU);
        g.fill();
      }
      g.globalAlpha = 1;

      // One fixed star in an outer arm is the actual Sun. The independent solar
      // renderer is projected at this exact coordinate, so it does not spawn.
      const sunT = 0.64;
      const sunTheta = sunT * turns * TAU + Math.PI;
      const sunR = radius * (0.065 + sunT * 0.93);
      const sunPos = planeToSprite(Math.cos(sunTheta) * sunR, Math.sin(sunTheta) * sunR);
      g.fillStyle = "rgba(255,247,222,0.95)";
      g.beginPath();
      g.arc(sunPos.x, sunPos.y, Math.max(1, side * 0.0012), 0, TAU);
      g.fill();

      return {
        canvas: out,
        sunNX: sunPos.x / side,
        sunNY: sunPos.y / side,
      };
    };

    const makeDustCloud = (resolution: number, rgb: string) => {
      const { canvas: out, g, side } = makeCanvas(resolution);
      const radius = side / 2;
      const cloud = g.createRadialGradient(0, 0, radius * 0.05, 0, 0, radius);
      cloud.addColorStop(0, `rgba(${rgb},0.18)`);
      cloud.addColorStop(0.45, `rgba(${rgb},0.075)`);
      cloud.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = cloud;
      g.beginPath();
      g.arc(0, 0, radius, 0, TAU);
      g.fill();
      return out;
    };

    const makeAsteroid = (seed: number) => {
      const { canvas: out, g, side } = makeCanvas(160);
      const asteroidRand = mulberry32(seed);
      const radius = side * 0.37;
      const vertices = 11;
      const multipliers = Array.from({ length: vertices }, () => 0.72 + asteroidRand() * 0.38);
      const path = () => {
        g.beginPath();
        for (let i = 0; i <= vertices; i++) {
          const angle = (i / vertices) * TAU;
          const rr = radius * multipliers[i % vertices];
          const x = Math.cos(angle) * rr;
          const y = Math.sin(angle) * rr;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.closePath();
      };
      path();
      g.fillStyle = "#0c0b0a";
      g.fill();
      const light = g.createRadialGradient(-radius * 0.45, -radius * 0.45, radius * 0.05, 0, 0, radius * 1.15);
      light.addColorStop(0, "rgba(218,178,115,0.38)");
      light.addColorStop(0.52, "rgba(100,77,50,0.12)");
      light.addColorStop(1, "rgba(0,0,0,0.48)");
      path();
      g.fillStyle = light;
      g.fill();
      return out;
    };

    const makeSun = () => {
      const { canvas: out, g, side } = makeCanvas(512);
      const radius = side / 2;
      const corona = g.createRadialGradient(0, 0, 0, 0, 0, radius);
      corona.addColorStop(0, "rgba(255,255,247,1)");
      corona.addColorStop(0.12, "rgba(255,239,185,0.98)");
      corona.addColorStop(0.26, "rgba(255,211,115,0.67)");
      corona.addColorStop(0.53, "rgba(255,185,75,0.2)");
      corona.addColorStop(1, "rgba(255,170,60,0)");
      g.fillStyle = corona;
      g.beginPath();
      g.arc(0, 0, radius, 0, TAU);
      g.fill();
      return out;
    };

    const makePlanet = (baseRgb: string, bandRgb?: string, ring = false) => {
      const { canvas: out, g, side } = makeCanvas(ring ? 384 : 256);
      const radius = ring ? side * 0.18 : side * 0.31;
      if (ring) {
        g.save();
        g.rotate(-0.42);
        g.scale(1, 0.28);
        g.strokeStyle = "rgba(225,211,172,0.62)";
        g.lineWidth = side * 0.045;
        g.beginPath();
        g.arc(0, 0, side * 0.38, 0, TAU);
        g.stroke();
        g.strokeStyle = "rgba(143,124,92,0.34)";
        g.lineWidth = side * 0.012;
        g.beginPath();
        g.arc(0, 0, side * 0.3, 0, TAU);
        g.stroke();
        g.restore();
      }
      const sphere = g.createRadialGradient(-radius * 0.38, -radius * 0.42, radius * 0.08, 0, 0, radius);
      sphere.addColorStop(0, `rgba(${baseRgb},1)`);
      sphere.addColorStop(0.66, `rgba(${baseRgb},0.96)`);
      sphere.addColorStop(1, "rgba(1,3,8,0.8)");
      g.fillStyle = sphere;
      g.beginPath();
      g.arc(0, 0, radius, 0, TAU);
      g.fill();
      if (bandRgb) {
        g.save();
        g.beginPath();
        g.arc(0, 0, radius, 0, TAU);
        g.clip();
        g.globalAlpha = 0.25;
        g.fillStyle = `rgba(${bandRgb},1)`;
        for (let y = -radius * 0.62; y < radius * 0.75; y += radius * 0.3) {
          g.fillRect(-radius, y, radius * 2, radius * 0.1);
        }
        g.restore();
      }
      return { canvas: out, visualRadius: radius / side };
    };

    // The Earth surface and lighting are separate cached layers. The surface
    // rotates slowly; the sunlight terminator stays fixed to the light source.
    const makeEarth = (resolution: number): EarthAsset => {
      const surfaceLayer = makeCanvas(resolution);
      const shadeLayer = makeCanvas(resolution);
      const surface = surfaceLayer.g;
      const shade = shadeLayer.g;
      const side = surfaceLayer.side;
      const radius = side * 0.405;
      const earthRand = mulberry32(0xea27bead);

      surface.save();
      surface.beginPath();
      surface.arc(0, 0, radius, 0, TAU);
      surface.clip();
      const ocean = surface.createRadialGradient(-radius * 0.35, -radius * 0.36, radius * 0.05, 0, 0, radius);
      ocean.addColorStop(0, "#70afd5");
      ocean.addColorStop(0.48, "#2d76ad");
      ocean.addColorStop(0.82, "#174776");
      ocean.addColorStop(1, "#0a203d");
      surface.fillStyle = ocean;
      surface.fillRect(-radius, -radius, radius * 2, radius * 2);

      // Continent clusters built from overlapping deterministic ellipses.
      const continents = [
        [-0.25, -0.18, 0.34, 0.18, -0.35],
        [-0.08, 0.16, 0.19, 0.32, 0.18],
        [0.28, -0.24, 0.31, 0.16, 0.22],
        [0.39, 0.08, 0.2, 0.22, -0.2],
        [-0.48, 0.18, 0.16, 0.12, 0.48],
      ];
      continents.forEach(([nx, ny, rx, ry, rotation], cluster) => {
        for (let i = 0; i < 15; i++) {
          const x = (nx + (earthRand() - 0.5) * rx) * radius;
          const y = (ny + (earthRand() - 0.5) * ry) * radius;
          surface.globalAlpha = 0.54 + earthRand() * 0.3;
          surface.fillStyle = cluster % 2 === 0 ? "#6f8b58" : "#8c8253";
          surface.beginPath();
          surface.ellipse(
            x,
            y,
            radius * (0.035 + earthRand() * 0.09),
            radius * (0.025 + earthRand() * 0.065),
            rotation + earthRand() * 0.6,
            0,
            TAU,
          );
          surface.fill();
        }
      });

      // Cloud bands and systems remain crisp enough for close-up.
      for (let i = 0; i < (tier === "mobile" ? 55 : 100); i++) {
        const angle = earthRand() * TAU;
        const rr = Math.sqrt(earthRand()) * radius * 0.92;
        const x = Math.cos(angle) * rr;
        const y = Math.sin(angle) * rr;
        surface.globalAlpha = 0.16 + earthRand() * 0.34;
        surface.fillStyle = "#ffffff";
        surface.beginPath();
        surface.ellipse(
          x,
          y,
          radius * (0.025 + earthRand() * 0.08),
          radius * (0.009 + earthRand() * 0.028),
          earthRand() * Math.PI,
          0,
          TAU,
        );
        surface.fill();
      }
      surface.globalAlpha = 1;
      surface.restore();

      // Atmosphere + fixed day/night terminator.
      const atmosphere = shade.createRadialGradient(0, 0, radius * 0.82, 0, 0, radius * 1.16);
      atmosphere.addColorStop(0, "rgba(108,178,242,0)");
      atmosphere.addColorStop(0.71, "rgba(108,178,242,0.15)");
      atmosphere.addColorStop(0.86, "rgba(143,204,255,0.44)");
      atmosphere.addColorStop(1, "rgba(108,178,242,0)");
      shade.fillStyle = atmosphere;
      shade.beginPath();
      shade.arc(0, 0, radius * 1.16, 0, TAU);
      shade.fill();
      shade.save();
      shade.beginPath();
      shade.arc(0, 0, radius, 0, TAU);
      shade.clip();
      const terminator = shade.createLinearGradient(-radius * 0.45, -radius, radius, radius * 0.35);
      terminator.addColorStop(0, "rgba(1,4,12,0)");
      terminator.addColorStop(0.5, "rgba(1,4,12,0.1)");
      terminator.addColorStop(0.72, "rgba(1,4,12,0.54)");
      terminator.addColorStop(1, "rgba(0,2,8,0.94)");
      shade.fillStyle = terminator;
      shade.fillRect(-radius, -radius, radius * 2, radius * 2);
      shade.restore();

      return {
        surface: surfaceLayer.canvas,
        shade: shadeLayer.canvas,
        visualRadius: radius / side,
      };
    };

    const buildAssets = () => {
      const galaxyResolution = tier === "desktop" ? 2048 : tier === "tablet" ? 1536 : 1024;
      const blackHoleResolution = tier === "mobile" ? 768 : 1024;
      const earthResolution = tier === "mobile" ? 768 : 1152;
      const earth = makeEarth(earthResolution);
      const mercury = makePlanet("151,143,132");
      const venus = makePlanet("216,187,131");
      const mars = makePlanet("179,99,70");
      const jupiter = makePlanet("205,172,132", "242,220,184");
      const saturn = makePlanet("209,190,147", "239,221,179", true);
      const uranus = makePlanet("164,203,209");
      const neptune = makePlanet("89,126,190");

      assets = {
        blackHole: makeBlackHole(blackHoleResolution),
        galaxy: makeGalaxy(galaxyResolution, counts.galaxyPoints),
        dust: [
          makeDustCloud(tier === "mobile" ? 192 : 320, "190,148,158"),
          makeDustCloud(tier === "mobile" ? 192 : 320, "226,220,213"),
          makeDustCloud(tier === "mobile" ? 192 : 320, "168,86,111"),
        ],
        glowGold: makeGlow("229,178,91", 0.9),
        glowWhite: makeGlow("255,255,250", 0.96),
        glowPink: makeGlow("255,218,227", 0.88),
        crystalWhite: makeCrystal("255,255,250"),
        crystalPink: makeCrystal("255,221,229"),
        asteroid: [0x915, 0x1915, 0x2915, 0x3915, 0x4915].map(makeAsteroid),
        sun: makeSun(),
        earth,
        planets: [
          { name: "Mercury", canvas: mercury.canvas, orbit: 0.12, radius: 0.008, speed: 0.11, phase: 0.7, tilt: 0.44, visualRadius: mercury.visualRadius },
          { name: "Venus", canvas: venus.canvas, orbit: 0.19, radius: 0.013, speed: 0.082, phase: 2.2, tilt: 0.43, visualRadius: venus.visualRadius },
          { name: "Earth", orbit: 0.27, radius: 0.025, speed: 0.068, phase: 4.18, tilt: 0.42, visualRadius: earth.visualRadius, isEarth: true },
          { name: "Mars", canvas: mars.canvas, orbit: 0.35, radius: 0.01, speed: 0.056, phase: 1.2, tilt: 0.41, visualRadius: mars.visualRadius },
          { name: "Jupiter", canvas: jupiter.canvas, orbit: 0.53, radius: 0.043, speed: 0.031, phase: 3.35, tilt: 0.4, visualRadius: jupiter.visualRadius },
          { name: "Saturn", canvas: saturn.canvas, orbit: 0.67, radius: 0.037, speed: 0.024, phase: 5.2, tilt: 0.39, visualRadius: saturn.visualRadius },
          { name: "Uranus", canvas: uranus.canvas, orbit: 0.82, radius: 0.023, speed: 0.017, phase: 2.75, tilt: 0.38, visualRadius: uranus.visualRadius },
          { name: "Neptune", canvas: neptune.canvas, orbit: 0.98, radius: 0.022, speed: 0.013, phase: 0.15, tilt: 0.37, visualRadius: neptune.visualRadius },
        ],
      };
    };

    // -------------------------------------------------------------------------
    // Persistent scene buffers. All coordinates are allocated once and remain
    // fixed; the camera passes them. Nothing is generated during scrolling.
    // -------------------------------------------------------------------------
    const farStars = Array.from({ length: counts.farStars }, () => ({
      x: rand(),
      y: rand(),
      depth: 0.1 + rand() * 0.9,
      radius: 0.35 + rand() * 1.15,
      alpha: 0.18 + rand() * 0.56,
      phase: rand() * TAU,
      twinkle: 0.0004 + rand() * 0.001,
      color: rand() < 0.78 ? "255,255,250" : rand() < 0.55 ? "255,233,207" : "210,220,238",
    }));

    const holeDust = Array.from({ length: counts.holeDust }, () => {
      const bandRadius = 0.68 + rand() * 0.76;
      return {
        radius: bandRadius,
        angle: rand() * TAU,
        speed: 0.00008 + rand() * 0.00018,
        size: 0.07 + rand() * 0.15,
        alpha: 0.34 + rand() * 0.56,
      };
    });

    const holeAsteroids = Array.from({ length: tier === "mobile" ? 2 : 4 }, (_, index) => ({
      angle: rand() * TAU,
      radius: 0.9 + rand() * 0.72,
      scale: 0.035 + rand() * 0.055,
      spin: (index % 2 ? -1 : 1) * (0.000025 + rand() * 0.000035),
      phase: rand() * TAU,
      variant: Math.floor(rand() * 5),
    }));

    const orbitCount = tier === "mobile" ? 5 : tier === "tablet" ? 7 : 9;
    const crystalOrbits = Array.from({ length: orbitCount }, (_, index) => ({
      radius: 0.34 + (index / Math.max(1, orbitCount - 1)) * 0.82 + rand() * 0.045,
      flatness: 0.28 + rand() * 0.15,
      rotation: -0.36 + (rand() - 0.5) * 0.42,
      speed: (0.000035 + rand() * 0.000075) * (index % 2 ? -1 : 1),
    }));
    const crystals = Array.from({ length: counts.crystals }, () => ({
      orbit: crystalOrbits[Math.floor(rand() * crystalOrbits.length)],
      angle: rand() * TAU,
      size: 0.006 + rand() * 0.01,
      alpha: 0.34 + rand() * 0.58,
      phase: rand() * TAU,
      faceted: rand() > 0.8,
      pink: rand() > 0.84,
    }));

    // 3D corridor through the chosen galactic region. The Sun sits beyond this
    // field at z=2.72; camera z advances through these fixed points.
    const fieldStars = Array.from({ length: counts.fieldStars }, () => {
      const angle = rand() * TAU;
      const radius = Math.pow(rand(), 0.54) * 2.8;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * (0.58 + rand() * 0.34),
        z: -0.4 + rand() * 3.02,
        radius: 0.32 + rand() * 1.25,
        alpha: 0.24 + rand() * 0.7,
        phase: rand() * TAU,
        twinkle: 0.00035 + rand() * 0.0012,
        color: rand() < 0.74 ? "255,255,250" : rand() < 0.55 ? "255,220,225" : "223,226,233",
      };
    });

    const dustClouds = Array.from({ length: tier === "mobile" ? 3 : 6 }, (_, index) => ({
      x: (rand() - 0.5) * 3.4,
      y: (rand() - 0.5) * 2.15,
      z: 0.15 + (index / (tier === "mobile" ? 3 : 6)) * 2.35 + rand() * 0.25,
      radius: 0.35 + rand() * 0.65,
      variant: index % 3,
      alpha: 0.22 + rand() * 0.24,
    }));

    const corridorAsteroids = Array.from({ length: counts.asteroids }, (_, index) => ({
      x: (rand() - 0.5) * 4.1,
      y: (rand() - 0.5) * 2.7,
      z: -0.1 + rand() * 2.75,
      radius: 0.025 + Math.pow(rand(), 2) * 0.14,
      rotation: rand() * TAU,
      spin: (index % 2 ? -1 : 1) * (0.00002 + rand() * 0.00006),
      variant: index % 5,
    }));

    // -------------------------------------------------------------------------
    // Main canvas sizing.
    // -------------------------------------------------------------------------
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildAssets();
    };
    resize();

    // -------------------------------------------------------------------------
    // Camera input and inertia. scrollTarget is the only scroll-listener write.
    // The rAF camera uses dt-aware exponential smoothing, so fast wheel/touch
    // input catches up cinematically instead of teleporting between scales.
    // -------------------------------------------------------------------------
    const maxScroll = () =>
      Math.max(1, (document.documentElement.scrollHeight || 0) - window.innerHeight);
    let scrollTarget = clamp01(window.scrollY / maxScroll());
    let camera = scrollTarget;
    let pointerX = 0;
    let pointerY = 0;
    let pointerEaseX = 0;
    let pointerEaseY = 0;
    let resizeFrame = 0;

    const onScroll = () => {
      scrollTarget = clamp01(window.scrollY / maxScroll());
    };
    const onPointer = (event: PointerEvent) => {
      pointerX = (event.clientX / Math.max(1, width) - 0.5) * 2;
      pointerY = (event.clientY / Math.max(1, height) - 0.5) * 2;
    };
    const onResize = () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        resize();
        scrollTarget = clamp01(window.scrollY / maxScroll());
      });
    };

    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (!coarse && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    // Project a fixed point in the galactic corridor from camera z.
    const projectCorridor = (
      x: number,
      y: number,
      z: number,
      cameraZ: number,
      anchorX: number,
      anchorY: number,
      focal: number,
    ) => {
      const distance = z - cameraZ;
      if (distance <= 0.055) return null; // point has physically passed camera
      const projection = focal / distance;
      return {
        x: anchorX + x * projection,
        y: anchorY + y * projection,
        projection,
        distance,
      };
    };

    let animationFrame = 0;
    let previousTime = performance.now();

    const draw = (time: number) => {
      if (!assets) return;

      const dt = Math.min(0.05, Math.max(0.001, (time - previousTime) / 1000));
      previousTime = time;
      if (!reduced) {
        const cameraEase = 1 - Math.exp(-dt * 4.15);
        const pointerEase = 1 - Math.exp(-dt * 7);
        camera += (scrollTarget - camera) * cameraEase;
        pointerEaseX += (pointerX - pointerEaseX) * pointerEase;
        pointerEaseY += (pointerY - pointerEaseY) * pointerEase;
      }
      const p = reduced ? scrollTarget : clamp01(camera);
      const elapsed = reduced ? 0 : time;
      const minSide = Math.min(width, height);
      const maxSide = Math.max(width, height);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      // Continuous camera controls. These are camera movements—not visibility
      // stages. Bodies below are always projected with these same values.
      const awayFromHole = smoother(p, 0.015, 0.31);
      const cameraTurn = smoother(p, 0.15, 0.52);
      const galaxyApproach = smoother(p, 0.19, 0.79);
      const galacticDive = smoother(p, 0.43, 0.89);
      const solarApproach = smoother(p, 0.57, 1);
      const earthFocus = smoother(p, 0.85, 1);

      // FAR universe stars exist throughout; camera yaw/parallax is subtle.
      const farSpread = 1 + galaxyApproach * 0.18 + galacticDive * 0.34;
      for (const star of farStars) {
        const x =
          width * 0.5 +
          (star.x - 0.5) * width * farSpread -
          cameraTurn * width * 0.045 * star.depth +
          pointerEaseX * 3 * star.depth;
        const y =
          height * 0.5 +
          (star.y - 0.5) * height * farSpread +
          pointerEaseY * 3 * star.depth;
        if (x < -3 || x > width + 3 || y < -3 || y > height + 3) continue;
        const twinkle = reduced ? 1 : 0.67 + 0.33 * Math.sin(elapsed * star.twinkle + star.phase);
        ctx.globalAlpha = clamp01(star.alpha * twinkle * mobileBoost);
        ctx.fillStyle = `rgb(${star.color})`;
        ctx.beginPath();
        ctx.arc(x, y, star.radius * (1 + galacticDive * star.depth * 0.55), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // GALAXY: always present outside the initial left edge. Camera yaw moves
      // it physically into view; camera approach increases angular size.
      const galaxyCanvas = assets.galaxy.canvas;
      const galaxyBase = maxSide * (tier === "mobile" ? 0.66 : 0.6);
      const galaxySize = galaxyBase * expMix(1, tier === "mobile" ? 5.1 : 5.7, galaxyApproach);
      const rawGalaxyX = mix(-width * 0.82, width * 0.43, cameraTurn);
      const rawGalaxyY = mix(height * 0.38, height * 0.5, cameraTurn);
      const galaxyIdleRotation = reduced ? 0 : Math.sin(elapsed * 0.000025) * 0.022;
      const cosG = Math.cos(galaxyIdleRotation);
      const sinG = Math.sin(galaxyIdleRotation);
      const rawSunOffsetX = assets.galaxy.sunNX * galaxySize;
      const rawSunOffsetY = assets.galaxy.sunNY * galaxySize;
      const rotatedSunOffsetX = rawSunOffsetX * cosG - rawSunOffsetY * sinG;
      const rotatedSunOffsetY = rawSunOffsetX * sinG + rawSunOffsetY * cosG;

      // The camera progressively locks onto the already-baked Sun in one arm.
      // Moving the galaxy center by the inverse offset is equivalent to panning
      // the camera toward that fixed location; there is no replacement scene.
      const sunLock = smoother(p, 0.48, 0.78);
      const desiredSunX = width * 0.5 + pointerEaseX * 4;
      const desiredSunY = height * 0.49 + pointerEaseY * 4;
      const uncorrectedSunX = rawGalaxyX + rotatedSunOffsetX;
      const uncorrectedSunY = rawGalaxyY + rotatedSunOffsetY;
      const galaxyX = rawGalaxyX + (desiredSunX - uncorrectedSunX) * sunLock;
      const galaxyY = rawGalaxyY + (desiredSunY - uncorrectedSunY) * sunLock;
      const sunAnchorX = galaxyX + rotatedSunOffsetX;
      const sunAnchorY = galaxyY + rotatedSunOffsetY;

      // Optical LOD: the bounded base texture remains a broad galactic plane as
      // it grows, while the projected 3D points below become the sharp detail.
      const texturePixelsPerCss = galaxyCanvas.width / Math.max(1, galaxySize);
      const galaxyLodAlpha = clamp01(0.28 + texturePixelsPerCss * 0.75);
      ctx.save();
      ctx.globalAlpha = clamp01(galaxyLodAlpha * mobileBoost);
      ctx.translate(galaxyX, galaxyY);
      ctx.rotate(galaxyIdleRotation);
      ctx.drawImage(galaxyCanvas, -galaxySize / 2, -galaxySize / 2, galaxySize, galaxySize);
      ctx.restore();

      // Crystalline streams are fixed in the galactic plane and therefore enter
      // from the left with the galaxy. Their apparent orbit radii grow naturally.
      for (const crystal of crystals) {
        const orbit = crystal.orbit;
        const angle = crystal.angle + elapsed * orbit.speed;
        const orbitRadius = galaxySize * 0.24 * orbit.radius;
        const planeX = Math.cos(angle) * orbitRadius;
        const planeY = Math.sin(angle) * orbitRadius * orbit.flatness;
        const cosO = Math.cos(orbit.rotation + galaxyIdleRotation);
        const sinO = Math.sin(orbit.rotation + galaxyIdleRotation);
        const x = galaxyX + planeX * cosO - planeY * sinO;
        const y = galaxyY + planeX * sinO + planeY * cosO;
        if (x < -30 || x > width + 30 || y < -30 || y > height + 30) continue;
        const apparent = clamp01(galaxySize / (maxSide * 1.15));
        const twinkle = reduced ? 1 : 0.58 + 0.42 * Math.sin(elapsed * 0.0012 + crystal.phase);
        const sprite = crystal.faceted
          ? crystal.pink
            ? assets.crystalPink
            : assets.crystalWhite
          : crystal.pink
            ? assets.glowPink
            : assets.glowWhite;
        const size = Math.max(1.1, galaxySize * crystal.size * 0.12);
        ctx.globalAlpha = clamp01(crystal.alpha * twinkle * apparent * mobileBoost);
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      // BLACK HOLE: the first camera motion increases distance; a later camera
      // yaw sends it right. It remains rendered with a minimum optical strength.
      const holeDistance = expMix(1, 2.85, awayFromHole);
      const holeScale = 1 / holeDistance;
      const holeRight = smoother(p, 0.19, 0.58);
      const holeX = mix(width * 0.72, width * 1.1, holeRight) + pointerEaseX * 4;
      const holeY = mix(height * 0.45, height * 0.3, holeRight) + pointerEaseY * 3;
      const holeVisualWidth = width * (tier === "mobile" ? 0.82 : 0.42);
      // Sprite's bright outer disk spans ~84% of its side.
      const holeSide = (holeVisualWidth / 0.84) * holeScale;
      const holeOpacity = Math.max(0.55, 1 / Math.sqrt(holeDistance));
      const holeRotation = reduced ? 0 : elapsed * 0.000014;
      const holePulse = reduced ? 1 : 0.97 + Math.sin(elapsed * 0.00042) * 0.03;
      ctx.save();
      ctx.globalAlpha = holeOpacity * holePulse;
      ctx.translate(holeX, holeY);
      ctx.rotate(holeRotation);
      ctx.drawImage(assets.blackHole, -holeSide / 2, -holeSide / 2, holeSide, holeSide);
      ctx.restore();

      // Persistent accretion dust and four fixed nearby asteroids.
      const holeRadius = holeSide * 0.245;
      ctx.save();
      ctx.translate(holeX, holeY);
      ctx.rotate(-0.33 + holeRotation);
      ctx.scale(1, 0.3);
      for (const dust of holeDust) {
        const angle = dust.angle + elapsed * dust.speed;
        const x = Math.cos(angle) * holeRadius * dust.radius;
        const y = Math.sin(angle) * holeRadius * dust.radius;
        const sprite = assets.glowGold;
        const size = Math.max(0.8, holeSide * dust.size * 0.024);
        ctx.globalAlpha = clamp01(dust.alpha * holeOpacity * mobileBoost);
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      for (const rock of holeAsteroids) {
        const angle = rock.angle + elapsed * 0.000006;
        const x = holeX + Math.cos(angle) * holeSide * rock.radius * 0.48;
        const y = holeY + Math.sin(angle) * holeSide * rock.radius * 0.2;
        const size = holeSide * rock.scale;
        if (x < -size || x > width + size || y < -size || y > height + size) continue;
        ctx.save();
        ctx.globalAlpha = holeOpacity * 0.82;
        ctx.translate(x, y);
        ctx.rotate(rock.phase + elapsed * rock.spin);
        ctx.drawImage(assets.asteroid[rock.variant], -size / 2, -size / 2, size, size);
        ctx.restore();
      }

      // GALACTIC CORRIDOR: these stars/dust/asteroids are physically inside the
      // galaxy. The camera z advances through their fixed coordinates, so they
      // expand, pass the viewer, and leave the viewport without wrapping/spawn.
      const cameraZ = mix(-7.6, 2.64, galacticDive);
      const focal = minSide * (tier === "mobile" ? 0.48 : 0.58);

      for (const cloud of dustClouds) {
        const projected = projectCorridor(
          cloud.x,
          cloud.y,
          cloud.z,
          cameraZ,
          sunAnchorX,
          sunAnchorY,
          focal,
        );
        if (!projected) continue;
        const size = cloud.radius * projected.projection * 2.5;
        if (size < 2 || projected.x < -size || projected.x > width + size || projected.y < -size || projected.y > height + size) continue;
        ctx.globalAlpha = clamp01(cloud.alpha * clamp01(projected.projection / 80) * mobileBoost);
        ctx.drawImage(assets.dust[cloud.variant], projected.x - size / 2, projected.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      for (const star of fieldStars) {
        const projected = projectCorridor(
          star.x,
          star.y,
          star.z,
          cameraZ,
          sunAnchorX,
          sunAnchorY,
          focal,
        );
        if (!projected) continue;
        if (projected.x < -8 || projected.x > width + 8 || projected.y < -8 || projected.y > height + 8) continue;
        const resolvability = clamp01(projected.projection / 42);
        if (resolvability < 0.015) continue;
        const twinkle = reduced ? 1 : 0.7 + 0.3 * Math.sin(elapsed * star.twinkle + star.phase);
        const size = Math.min(5.2, star.radius * (0.34 + projected.projection / 70));
        ctx.globalAlpha = clamp01(star.alpha * resolvability * twinkle * mobileBoost);
        ctx.fillStyle = `rgb(${star.color})`;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const rock of corridorAsteroids) {
        const projected = projectCorridor(
          rock.x,
          rock.y,
          rock.z,
          cameraZ,
          sunAnchorX,
          sunAnchorY,
          focal,
        );
        if (!projected) continue;
        const size = rock.radius * projected.projection * 1.65;
        if (size < 1.2 || projected.x < -size || projected.x > width + size || projected.y < -size || projected.y > height + size) continue;
        ctx.save();
        ctx.globalAlpha = clamp01(0.3 + projected.projection / 280);
        ctx.translate(projected.x, projected.y);
        ctx.rotate(rock.rotation + elapsed * rock.spin);
        ctx.drawImage(assets.asteroid[rock.variant], -size / 2, -size / 2, size, size);
        ctx.restore();
      }

      // SOLAR SYSTEM: always centered on the selected arm star. Its logarithmic
      // pixels-per-world-unit grows continuously as camera distance closes.
      const finalSystemScale = minSide * (tier === "mobile" ? 14 : 12.5);
      const pixelsPerWorld = expMix(0.32, finalSystemScale, solarApproach);
      const seconds = elapsed / 1000;
      const earth = assets.planets.find((planet) => planet.isEarth)!;
      const earthAngle = earth.phase + seconds * earth.speed;
      const earthWorldX = Math.cos(earthAngle) * earth.orbit;
      const earthWorldY = Math.sin(earthAngle) * earth.orbit * earth.tilt;

      // Camera target shifts continuously from the Sun to the already-orbiting
      // Earth. Following Earth's moving world position keeps one persistent body
      // under the camera; there is no separate close-up Earth.
      const focusWorldX = earthWorldX * earthFocus;
      const focusWorldY = earthWorldY * earthFocus;
      const viewTargetX = mix(sunAnchorX, width * (tier === "mobile" ? 0.54 : 0.61), earthFocus);
      const viewTargetY = mix(sunAnchorY, height * 0.54, earthFocus);
      const systemOriginX = viewTargetX - focusWorldX * pixelsPerWorld;
      const systemOriginY = viewTargetY - focusWorldY * pixelsPerWorld;

      // Faint scientific orbital planes. Opacity comes from projected radius;
      // while sub-pixel they are physically unresolvable, not hidden by a stage.
      ctx.save();
      ctx.translate(systemOriginX, systemOriginY);
      for (const planet of assets.planets) {
        const orbitX = planet.orbit * pixelsPerWorld;
        const orbitY = orbitX * planet.tilt;
        if (orbitX < 0.45) continue;
        const lineVisibility = clamp01((orbitX - 0.45) / 95);
        ctx.globalAlpha = 0.035 + lineVisibility * 0.21;
        ctx.strokeStyle = "rgba(244,244,242,0.9)";
        ctx.lineWidth = Math.min(1, 0.45 + lineVisibility * 0.55);
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitX, orbitY, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = 1;

      // The same Sun is visible first as a tiny star, then as the solar anchor.
      const sunRadius = 0.068 * pixelsPerWorld;
      if (sunRadius < 1.1) {
        const pointSize = Math.max(0.8, sunRadius * 2.4);
        ctx.globalAlpha = clamp01(0.46 + sunRadius * 0.42);
        ctx.fillStyle = "#fff7de";
        ctx.beginPath();
        ctx.arc(systemOriginX, systemOriginY, pointSize, 0, TAU);
        ctx.fill();
      } else {
        const sunDrawSide = Math.min(maxSide * 3, sunRadius * 7.5);
        ctx.globalAlpha = clamp01(0.64 + sunRadius / 80);
        ctx.drawImage(
          assets.sun,
          systemOriginX - sunDrawSide / 2,
          systemOriginY - sunDrawSide / 2,
          sunDrawSide,
          sunDrawSide,
        );
      }
      ctx.globalAlpha = 1;

      // Every planet is projected every frame at its current orbit position.
      for (const planet of assets.planets) {
        const angle = planet.phase + seconds * planet.speed;
        const worldX = Math.cos(angle) * planet.orbit;
        const worldY = Math.sin(angle) * planet.orbit * planet.tilt;
        const x = systemOriginX + worldX * pixelsPerWorld;
        const y = systemOriginY + worldY * pixelsPerWorld;
        const apparentRadius = planet.radius * pixelsPerWorld;

        // Sub-pixel planets still contribute a point; once resolvable, the same
        // cached sphere replaces that point at the exact position and scale.
        if (apparentRadius < 0.75) {
          if (x < -2 || x > width + 2 || y < -2 || y > height + 2) continue;
          ctx.globalAlpha = clamp01(apparentRadius * 0.72);
          ctx.fillStyle = planet.isEarth ? "#9fc9e8" : "#e6dfd3";
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.3, apparentRadius), 0, TAU);
          ctx.fill();
          continue;
        }

        const drawSide = apparentRadius / planet.visualRadius;
        if (x < -drawSide || x > width + drawSide || y < -drawSide || y > height + drawSide) continue;
        const distanceVisibility = clamp01((apparentRadius - 0.55) / 2.8);
        ctx.globalAlpha = 0.42 + distanceVisibility * 0.58;

        if (planet.isEarth) {
          // Persistent Earth surface rotates; fixed shade keeps a realistic
          // terminator and atmosphere as the camera closes from orbit to planet.
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(reduced ? 0 : seconds * 0.012);
          ctx.drawImage(assets.earth.surface, -drawSide / 2, -drawSide / 2, drawSide, drawSide);
          ctx.restore();
          ctx.drawImage(
            assets.earth.shade,
            x - drawSide / 2,
            y - drawSide / 2,
            drawSide,
            drawSide,
          );
        } else if (planet.canvas) {
          ctx.drawImage(planet.canvas, x - drawSide / 2, y - drawSide / 2, drawSide, drawSide);
        }
      }
      ctx.globalAlpha = 1;

      if (!reduced && !document.hidden) animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    const onVisibility = () => {
      if (document.hidden) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else if (!reduced && !animationFrame) {
        previousTime = performance.now();
        animationFrame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
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
      <div className="galaxy-readability absolute inset-0" />
      <div className="galaxy-vignette absolute inset-0" />
    </div>
  );
}
