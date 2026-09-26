"use client";

import { useEffect, useRef, useState } from "react";

// -----------------------------------------------------------------------------
// CustomCursor  (SYSTEM B — isolated from React render + galaxy canvas)
// A premium gold crosshair that feels physically attached to the mouse.
//
// Performance contract:
//  - Mouse coordinates live in plain variables/refs. React NEVER re-renders on
//    move (the only state is a one-time `active` toggle to mount the DOM).
//  - pointermove only writes target variables. A single rAF loop reads them and
//    writes transform/opacity. No DOM writes inside the pointer handler.
//  - The crosshair itself has NO lerp → zero perceived lag.
//  - A short 5-node trail eases at ~0.3 and PARKS (cancels its rAF) when idle.
//  - Only transform + opacity are animated per frame. Hover/press visuals are
//    driven by CSS transitions on scale/opacity (never width/height per frame).
//  - Loop pauses when the tab is hidden. Fine-pointer + motion-allowed only.
// -----------------------------------------------------------------------------

const GOLD = "212,166,77"; // #D4A64D
const TRAIL_COUNT = 5;
const TRAIL_EASE = 0.3; // responsive, no heavy inertia

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

    // target = where the mouse physically is (updated in pointermove).
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    // trail node positions (eased history behind the pointer).
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({ x: target.x, y: target.y }));

    let hovering = false;
    let pressed = false;
    let hasMoved = false;

    let raf = 0;
    let idleUntilFrame = 0; // keep looping a few frames after the last move

    // --- single rAF loop: crosshair (instant) + trail (eased) ----------------
    const tick = () => {
      // crosshair: snap directly to the mouse — feels attached, no lag.
      if (crosshair) {
        const scale = pressed ? (hovering ? 1.2 : 0.85) : hovering ? 1.35 : 1;
        crosshair.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }

      // trail: each node eases toward the one ahead of it.
      let prevX = target.x;
      let prevY = target.y;
      let moving = false;
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const nx = t.x + (prevX - t.x) * TRAIL_EASE;
        const ny = t.y + (prevY - t.y) * TRAIL_EASE;
        if (Math.abs(nx - t.x) > 0.1 || Math.abs(ny - t.y) > 0.1) moving = true;
        t.x = nx;
        t.y = ny;
        prevX = t.x;
        prevY = t.y;

        const node = trailRefs.current[i];
        if (node) {
          const age = (i + 1) / (trail.length + 1); // 0..1
          const s = 1 - age * 0.75;
          node.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%) scale(${s})`;
          node.style.opacity = hasMoved ? ((1 - age) * 0.45).toFixed(2) : "0";
        }
      }

      // Keep the loop alive while the trail is catching up or we recently moved;
      // otherwise park it to avoid burning frames while idle.
      if (moving || idleUntilFrame > 0) {
        idleUntilFrame = Math.max(0, idleUntilFrame - 1);
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    const wake = () => {
      idleUntilFrame = 4; // a few grace frames so a stopped cursor still settles
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    };

    // --- hover detection: throttled, not every move -------------------------
    let hoverAt = 0;
    const checkHover = (el: Element | null) => {
      const now = performance.now();
      if (now - hoverAt < 90) return;
      hoverAt = now;
      const hv = !!el?.closest?.(INTERACTIVE);
      if (hv !== hovering) {
        hovering = hv;
        if (crosshair) crosshair.dataset.hover = hv ? "true" : "false";
      }
    };

    // --- pointer handlers: write variables ONLY -----------------------------
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        for (const t of trail) {
          t.x = target.x;
          t.y = target.y;
        }
        if (crosshair) crosshair.style.opacity = "1";
      }
      checkHover(e.target as Element | null);
      wake();
    };
    const onLeave = () => {
      if (crosshair) crosshair.style.opacity = "0";
    };
    const onDown = () => {
      pressed = true;
      if (crosshair) crosshair.dataset.press = "true";
      spawnRipple(target.x, target.y);
      wake();
    };
    const onUp = () => {
      pressed = false;
      if (crosshair) crosshair.dataset.press = "false";
      wake();
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else {
        wake();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    // --- click ripple (transient, self-removing) — transform/opacity only ---
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
      r.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:9999px;border:1px solid rgba(${GOLD},0.5);will-change:transform,opacity;transform:translate3d(0,0,0) scale(0.4);opacity:0.8;transition:transform 380ms cubic-bezier(0.16,1,0.3,1),opacity 380ms ease-out;`;
      rippleLayer!.appendChild(r);
      requestAnimationFrame(() => {
        r.style.transform = "translate3d(0,0,0) scale(3.4)";
        r.style.opacity = "0";
      });
      setTimeout(() => r.remove(), 440);
    };

    wake();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("visibilitychange", onVisibility);
      document.body.classList.remove("cursor-none");
    };
  }, []);

  if (!active) return null;

  return (
    <div aria-hidden className="cursor-root pointer-events-none fixed inset-0 z-[2147483647]">
      {/* trail particles (reused nodes) — radial gradient, no box-shadow */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 h-[6px] w-[6px] rounded-full will-change-transform"
          style={{
            background: `radial-gradient(circle, rgba(${GOLD},0.9), rgba(${GOLD},0) 70%)`,
            opacity: 0,
          }}
        />
      ))}

      {/* crosshair — single element, transform/opacity driven */}
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
