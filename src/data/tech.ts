// -----------------------------------------------------------------------------
// TECH STACK
// Grouped tools. No skill percentages by design — just what I work with.
// Add or reorder categories/items freely.
// -----------------------------------------------------------------------------

export type TechCategory = {
  label: string;
  items: string[];
};

export const techStack: TechCategory[] = [
  {
    label: "Frontend",
    items: ["React", "Next.js", "HTML", "CSS", "JavaScript / TypeScript"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Python", "APIs", "Databases"],
  },
  {
    label: "Tools",
    items: ["Git", "Docker", "Discord", "Figma"],
  },
  {
    label: "Exploring",
    items: ["AI", "Voice AI", "Automation"],
  },
];

// Playful, non-statistical "numbers" section.
export const thingsIEnjoyBuilding: string[] = [
  "Web apps",
  "Automation",
  "Bots",
  "AI experiments",
  "Random ideas that somehow become projects",
];

// About-section journey stages.
export const journey: { stage: string; note: string }[] = [
  { stage: "Explore", note: "Chase the 'what if' until it gets interesting." },
  { stage: "Build", note: "Turn the idea into something that actually runs." },
  { stage: "Break", note: "Push it until it falls over — then learn why." },
  { stage: "Improve", note: "Sand down the rough edges, make it feel right." },
  { stage: "Ship", note: "Get it out into the world and iterate." },
];
