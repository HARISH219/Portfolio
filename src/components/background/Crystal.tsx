import type { CSSProperties } from "react";

// A faceted golden diamond/crystal rendered as SVG with layered gradients so it
// reads as a 3D glass/crystal object rather than a flat shape. Each instance
// gets unique gradient ids to avoid collisions when many are on the page.
let counter = 0;

export function Crystal({
  size = 80,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const id = `xtl-${counter++}`;

  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 100 150"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe6a8" />
          <stop offset="45%" stopColor="#d6a94e" />
          <stop offset="100%" stopColor="#7d5f2f" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c79640" />
          <stop offset="100%" stopColor="#4a3818" />
        </linearGradient>
        <linearGradient id={`${id}-c`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fff2cf" />
          <stop offset="100%" stopColor="#b98b3f" />
        </linearGradient>
      </defs>

      {/* top table facets */}
      <polygon points="50,4 26,42 50,42" fill={`url(#${id}-c)`} opacity="0.95" />
      <polygon points="50,4 74,42 50,42" fill={`url(#${id}-b)`} opacity="0.9" />
      {/* upper girdle */}
      <polygon points="26,42 74,42 50,58" fill={`url(#${id}-a)`} />
      {/* long lower pavilion, left + right */}
      <polygon points="26,42 50,58 50,146" fill={`url(#${id}-b)`} />
      <polygon points="74,42 50,58 50,146" fill={`url(#${id}-a)`} />
      {/* thin highlight edge */}
      <polyline
        points="50,4 50,58 50,146"
        fill="none"
        stroke="#fff4d6"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
    </svg>
  );
}
