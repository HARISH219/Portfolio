import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050505",
          900: "#0a0a0c",
          850: "#0e0e11",
          800: "#141418",
          700: "#1c1c22",
          600: "#26262e",
        },
        bone: {
          DEFAULT: "#f2f0ea",
          muted: "#a9a7a0",
          faint: "#6f6e69",
        },
        accent: {
          DEFAULT: "#d6a94e",
          soft: "#f0d38a",
          deep: "#9c7a45",
          bright: "#ffcf6b",
        },
        emerald: {
          DEFAULT: "#2ee08a",
          soft: "#6ff0b3",
        },
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.05em",
      },
      maxWidth: {
        editorial: "1200px",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.9)" },
        },
        scrollLine: {
          "0%": { transform: "scaleY(0)", transformOrigin: "top" },
          "45%": { transform: "scaleY(1)", transformOrigin: "top" },
          "55%": { transform: "scaleY(1)", transformOrigin: "bottom" },
          "100%": { transform: "scaleY(0)", transformOrigin: "bottom" },
        },
        // Slow drift + rotate used by floating crystals.
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(0deg)" },
          "50%": { transform: "translate3d(0,-16px,0) rotate(8deg)" },
        },
        driftAlt: {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(0deg)" },
          "50%": { transform: "translate3d(12px,-10px,0) rotate(-10deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseDot: "pulseDot 2.4s ease-in-out infinite",
        scrollLine: "scrollLine 2.2s ease-in-out infinite",
        drift: "drift 14s ease-in-out infinite",
        driftAlt: "driftAlt 18s ease-in-out infinite",
        twinkle: "twinkle 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
