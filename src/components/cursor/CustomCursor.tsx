"use client";

import { useEffect, useRef, useState } from "react";

// -----------------------------------------------------------------------------
// CustomCursor
// A premium gold crosshair cursor with a short "comet" particle trail, hover
// and click states. Desktop / fine-pointer only; disabled on touch and for
// prefers-reduced-motion.
//
// Performance: a single requestAnimationFrame loop lerps the crosshair toward
// the real mouse and updates trail particle positions by writing translate3d()
// to refs — no per-frame React state, no layout-triggering properties.
// -----------------------------------------------------------------------------

const GOLD = "212,166,77"; // #D4A64D
const TRAIL_COUNT = 8;

// Selector for elements that should trigger the hover state.
const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, summary, label, [data-cursor="hover"]';

export function CustomCursor() {
  const [active, setActive] = useState(false); // becomes true only on a fine pointer

  // Refs to the DOM nodes we transform each frame.
  const crosshairRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Guard: only enable on fine pointers (mouse) and when motion is allowed.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    setActive(true);
    document.body.classList.add("cursor-none");

    // --- state kept in refs (no re-render) -----------------------------------
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { x: mouse.x, y: mouse.y }; // eased crosshair position
    // Trail nodes trail behind `pos` with progressive lag.
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({ x: pos.x, y: pos.y }));

    let hovering = false;
    let pressed = false;
    let visible = false;
    let hasMoved = false;

    // Scroll velocity → subtle trail stretch.
    let lastScrollY = window.scrollY;
    let scrollVel = 0;

    const crosshair = crosshairRef.current;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        for (const t of trail) {
          t.x = mouse.x;
          t.y = mouse.y;
        }
      }
      visible = true;

      // Hover detection via the element under the pointer.
      const el = e.target as Element | null;
      hovering = !!el?.closest?.(INTERACTIVE);
    };

    const onEnter = () => (visible = true);
    const onLeave = () => (visible = false);
    const onDown = () => {
      pressed = true;
      spawnRipple(pos.x, pos.y);
    };
    const onUp = () => (pressed = false);
    const onScroll = () => {
      const y = window.scrollY;
      scrollVel = y - lastScrollY;
      lastScrollY = y;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // --- click ripple (transient DOM nodes, self-removing) -------------------
    let rippleLayer: HTMLDivElement | null = document.getElementById(
      "cursor-ripple-layer",
    ) as HTMLDivElement | null;
    if (!rippleLayer) {
      rippleLayer = document.createElement("div");
      rippleLayer.id = "cursor-ripple-layer";
      rippleLayer.style.cssText =
        "position:fixed;inset:0;pointer-events:none;z-index:2147483646;";
      document.body.appendChild(rippleLayer);
    }
    const spawnRipple = (x: number, y: number) => {
      const r = document.createElement("span");
      r.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:9999px;border:1px solid rgba(${GOLD},0.5);box-shadow:0 0 12px rgba(${GOLD},0.4);transform:scale(0.4);opacity:0.9;transition:transform 420ms cubic-bezier(0.16,1,0.3,1),opacity 420ms ease-out;`;
      rippleLayer!.appendChild(r);
      // next frame → animate outward
      requestAnimationFrame(() => {
        r.style.transform = "scale(4)";
        r.style.opacity = "0";
      });
      setTimeout(() => r.remove(), 480);
    };

    // --- animation loop ------------------------------------------------------
    let raf = 0;
    const frame = () => {
      // Ease the crosshair toward the mouse (tiny physical weight).
      pos.x += (mouse.x - pos.x) * 0.22;
      pos.y += (mouse.y - pos.y) * 0.22;

      // Trail: each node eases toward the previous one → comet lag.
      let prevX = pos.x;
      let prevY = pos.y;
      // Decay scroll velocity for a smooth return.
      scrollVel *= 0.85;
      const stretch = Math.max(-14, Math.min(14, scrollVel * 0.25));

      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const ease = 0.35 - i * 0.02; // later nodes lag slightly more
        t.x += (prevX - t.x) * ease;
        t.y += (prevY - t.y) * ease + stretch * (i / trail.length) * 0.15;
        prevX = t.x;
        prevY = t.y;

        const node = trailRefs.current[i];
        if (node) {
          const age = i / trail.length; // 0 newest .. 1 oldest
          const scale = 1 - age * 0.8;
          const baseOpacity = visible ? (1 - age) * 0.5 : 0;
          node.style.transform = `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(
            2,
          )}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
          node.style.opacity = baseOpacity.toFixed(3);
        }
      }

      if (crosshair) {
        // Hover expands; press brightens/contracts slightly.
        const targetScale = hovering ? 1.35 : 1;
        const s = pressed ? targetScale * 0.9 : targetScale;
        crosshair.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(
          2,
        )}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
        crosshair.style.opacity = visible && hasMoved ? "1" : "0";
        crosshair.dataset.hover = hovering ? "true" : "false";
        crosshair.dataset.press = pressed ? "true" : "false";
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("cursor-none");
    };
  }, []);

  if (!active) return null;

  return (
    <div aria-hidden className="cursor-root pointer-events-none fixed inset-0 z-[2147483647]">
      {/* trail particles (newest = index 0) */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 h-[5px] w-[5px] rounded-full will-change-transform"
          style={{
            background: `rgba(${GOLD},0.9)`,
            boxShadow: `0 0 6px rgba(${GOLD},0.6)`,
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
        {/* soft halo */}
        <span className="cursor-halo" />
        {/* hover ring */}
        <span className="cursor-ring" />
        {/* crosshair lines */}
        <span className="cursor-line cursor-line-h" />
        <span className="cursor-line cursor-line-v" />
        {/* center dot */}
        <span className="cursor-dot" />
      </div>
    </div>
  );
}
