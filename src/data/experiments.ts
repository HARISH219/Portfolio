// -----------------------------------------------------------------------------
// EXPERIMENTS
// Smaller projects, prototypes, and unfinished ideas.
// Add items freely — the grid is asymmetric and adapts to any count.
// `span` controls emphasis in the masonry-style layout: "wide" | "tall" | "normal".
// -----------------------------------------------------------------------------

export type ExperimentStatus = "LIVE" | "BUILDING" | "EXPERIMENT" | "ARCHIVED";

export type Experiment = {
  name: string;
  description: string;
  status: ExperimentStatus;
  date: string;
  tech: string[];
  span?: "wide" | "tall" | "normal";
  href?: string;
};

export const experiments: Experiment[] = [
  {
    name: "Voice fingerprinting",
    description:
      "Prototyping acoustic feature extraction to tell synthetic voices apart from real ones.",
    status: "EXPERIMENT",
    date: "2026",
    tech: ["Python", "Audio"],
    span: "wide",
  },
  {
    name: "XP engine",
    description: "A reusable progression system for community platforms.",
    status: "BUILDING",
    date: "2026",
    tech: ["Node.js"],
    span: "normal",
  },
  {
    name: "Event logger",
    description: "Lightweight Discord event logging with structured output.",
    status: "LIVE",
    date: "2026",
    tech: ["Node.js", "Discord"],
    span: "tall",
  },
  {
    name: "Automation snippets",
    description: "Small scripts that quietly remove repetitive work.",
    status: "LIVE",
    date: "2025",
    tech: ["Python", "Automation"],
    span: "normal",
  },
  {
    name: "UI sketches",
    description: "Interface ideas that may become real projects later.",
    status: "EXPERIMENT",
    date: "2025",
    tech: ["React", "Figma"],
    span: "normal",
  },
  {
    name: "Old bot v1",
    description: "The first bot experiment — kept for the memories.",
    status: "ARCHIVED",
    date: "2024",
    tech: ["Node.js"],
    span: "normal",
  },
];
