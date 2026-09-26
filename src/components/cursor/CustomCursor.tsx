"use client";

import { useEffect, useRef, useState } from "react";

// -----------------------------------------------------------------------------
// CustomCursor
// A premium gold crosshair cursor with a short "comet" trail + hover/click
// states. Desktop / fine-pointer only; disabled on touch and reduced-motion.
//
// Performance notes:
//  - The crosshair tracks the raw mouse position with NO lerp → zero perceived
//    lag. Its transform is written from the pointer handler (rAF-coalesced).
//  - A short trail (5 nodes) eases behind it in a lightweight rAF loop that
//    only runs while the trail is still catching up, then parks itself.
//  - Hover detection is throttled (not per-move), and trail particles use a
//    radial-gradient background instead of box-shadow (much cheaper to paint).
// -----------------------------------------------------------------------------

const GOLD = "212,166,77"; // #D4A64D
const TRAIL_COUNT = 5;

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, summary, label, [data-cursor="hover"]';

export function CustomCursor() {
  const [active, setActive] = useState(false);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    setActive(true);
    document.body.classList.add("cursor-none");

    const crosshair = crosshairRef.current;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({ x: mouse.x, y: mouse.y }));
    let hovering = false;
    let pressed = false;
    let hasMoved = false;

    // --- crosshair: update directly on move, coalesced to one rAF ------------
    let chFrame = 0;
    const drawCrosshair = () => {
      chFrame = 0;
      if (!crosshair) return;
      const scale = pressed ? (hovering ? 1.25 : 0.9) : hovering ? 1.35 : 1;
      crosshair.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      // Toggle attributes only when they change (drives the CSS hover visuals).
      const hv = hovering ? "true" : "false";
      if (crosshair.dataset.hover !== hv) crosshair.dataset.hover = hv;
    };
    const requestCrosshair = () => {
      if (!chFrame) chFrame = requestAnimationFrame(drawCrosshair);
    };

    // --- trail loop: runs only while nodes are still catching up -------------
    let trailFrame = 0;
    const runTrail = () => {
      let prevX = mouse.x;
      let prevY = mouse.y;
      let moving = false;

      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const ease = 0.4;
        const nx = t.x + (prevX - t.x) * ease;
        const ny = t.y + (prevY - t.y) * ease;
        if (Math.abs(nx - t.x) > 0.1 || Math.abs(ny - t.y) > 0.1) moving = true;
        t.x = nx;
        t.y = ny;
        prevX = t.x;
        prevY = t.y;

        const node = trailRefs.current[i];
        if (node) {
          const age = (i + 1) / (trail.length + 1); // 0..1
          const s = 1 - age * 0.8;
          node.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%) scale(${s})`;
          node.style.opacity = hasMoved ? ((1 - age) * 0.5).toFixed(2) : "0";
        }
      }

      // Keep looping only while the trail is still moving → parks when idle.
      trailFrame = moving ? requestAnimationFrame(runTrail) : 0;
    };
    const kickTrail = () => {
      if (!trailFrame) trailFrame = requestAnimationFrame(runTrail);
    };

    // --- hover detection: throttled, not per-move ----------------------------
    let hoverAt = 0;
    const checkHover = (el: Element | null) => {
      const now = performance.now();
      if (now - hoverAt < 80) return;
      hoverAt = now;
      hovering = !!el?.closest?.(INTERACTIVE);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        for (const t of trail) {
          t.x = mouse.x;
          t.y = mouse.y;
        }
        if (crosshair) crosshair.style.opacity = "1";
      }
      checkHover(e.target as Element | null);
      requestCrosshair();
      kickTrail();
    };

    const onLeave = () => {
      if (crosshair) crosshair.style.opacity = "0";
    };
    const onDown = () => {
      pressed = true;
      requestCrosshair();
      spawnRipple(mouse.x, mouse.y);
    };
    const onUp = () => {
      pressed = false;
      requestCrosshair();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });

    // --- click ripple (transient, self-removing) -----------------------------
    let rippleLayer = document.getElementById("cursor-ripple-layer") as HTMLDivElement | null;
    if (!rippleLayer) {
      rippleLayer = document.createElement("div");
      rippleLayer.id = "cursor-ripple-layer";
      rippleLayer.style.cssText =
        "position:fixed;inset:0;pointer-events:none;z-index:2147483646;";
      document.body.appendChild(rippleLayer);
    }
    const spawnRipple = (x: number, y: number) => {
      const r = document.createElement("span");
      r.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:9999px;border:1px solid rgba(${GOLD},0.5);will-change:transform,opacity;transform:scale(0.4);opacity:0.85;transition:transform 400ms cubic-bezier(0.16,1,0.3,1),opacity 400ms ease-out;`;
      rippleLayer!.appendChild(r);
      requestAnimationFrame(() => {
        r.style.transform = "scale(3.6)";
        r.style.opacity = "0";
      });
      setTimeout(() => r.remove(), 460);
    };

    return () => {
      if (chFrame) cancelAnimationFrame(chFrame);
      if (trailFrame) cancelAnimationFrame(trailFrame);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.body.classList.remove("cursor-none");
    };
  }, []);

  if (!active) return null;

  return (
    <div aria-hidden className="cursor-root pointer-events-none fixed inset-0 z-[2147483647]">
      {/* trail particles (newest first) — radial gradient, no box-shadow */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 h-2 w-2 rounded-full will-change-transform"
          style={{
            background: `radial-gradient(circle, rgba(${GOLD},0.9), rgba(${GOLD},0) 70%)`,
            opacity: 0,
          }}
        />
      ))}

      {/* crosshair */}
      <div
        ref={crosshairRef}
        className="cursor-crosshair absolute left-0 top-0 will-change-transform"
        style={{ opacity: 0 }}
      >
        <span className="cursor-halo" />
        <span className="cursor-ring" />
        <span className="cursor-line cursor-line-h" />
        <span className="cursor-line cursor-line-v" />
        <span className="cursor-dot" />
      </div>
    </div>
  );
}
