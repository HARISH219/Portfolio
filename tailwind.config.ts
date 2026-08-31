import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08080a",
          900: "#0b0b0e",
          850: "#101014",
          800: "#16161c",
          700: "#1e1e26",
          600: "#2a2a34",
        },
        bone: {
          DEFAULT: "#f2f0ea",
          muted: "#a9a7a0",
          faint: "#6f6e69",
        },
        accent: {
          DEFAULT: "#c8a26a",
          soft: "#d8bd93",
          deep: "#9c7a45",
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
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseDot: "pulseDot 2.4s ease-in-out infinite",
        scrollLine: "scrollLine 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
