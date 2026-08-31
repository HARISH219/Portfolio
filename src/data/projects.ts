// -----------------------------------------------------------------------------
// PROJECTS
// Add a new project by appending an object to the `projects` array below.
// `detail` fields use realistic placeholders where real info isn't known yet —
// replace the placeholder strings as details become available.
// -----------------------------------------------------------------------------

export type ProjectStatus = "Active" | "In Development" | "Live" | "Archived";

export type ProjectDetail = {
  overview: string;
  problem: string;
  built: string;
  howItWorks: string;
  technology: string;
  challenges: string;
  result: string;
};

export type Project = {
  slug: string;
  number: string; // e.g. "01"
  name: string;
  description: string;
  tags: string[];
  status: ProjectStatus;
  // Visual accent tint used for the preview panel (subtle gradient).
  accent: string;
  liveUrl?: string;
  githubUrl?: string;
  lastUpdated?: string;
  detail: ProjectDetail;
};

const PLACEHOLDER = "Details coming soon — this section is a placeholder to be filled in.";

export const projects: Project[] = [
  {
    slug: "ai-scam-detection",
    number: "01",
    name: "AI Scam Detection",
    description:
      "An experimental system for detecting AI-generated voices and potential scam calls.",
    tags: ["AI", "Audio", "Detection", "Backend"],
    status: "In Development",
    accent: "from-[#c8a26a]/20 to-transparent",
    githubUrl: "",
    lastUpdated: "August 2026",
    detail: {
      overview:
        "An exploration into distinguishing synthetic, AI-generated speech from genuine human voices within call audio, aimed at flagging potential scam calls before they cause harm.",
      problem:
        "AI voice cloning has made scam calls more convincing than ever. Traditional spam filters rely on caller metadata, not on the audio itself — leaving a gap when the voice is the deception.",
      built:
        "A backend pipeline that ingests call audio, extracts acoustic features, and runs them through detection models to score the likelihood that a voice is synthetic.",
      howItWorks:
        PLACEHOLDER + " (Intended flow: audio capture → feature extraction → model inference → risk scoring.)",
      technology: "Python, audio feature extraction, and machine-learning models for classification.",
      challenges:
        PLACEHOLDER + " (Expected challenges: dataset quality, model generalization across accents and devices, real-time latency.)",
      result:
        "Currently in active development — an ongoing experiment rather than a finished product.",
    },
  },
  {
    slug: "spitzvilla",
    number: "02",
    name: "Spitzvilla",
    description:
      "A Discord-based competition and community management platform with registration, XP, roles, notifications, and administration tools.",
    tags: ["Discord", "Web", "CMS", "Automation"],
    status: "Active",
    accent: "from-[#6f8bd8]/18 to-transparent",
    githubUrl: "",
    lastUpdated: "August 2026",
    detail: {
      overview:
        "A platform that brings competition and community management into Discord, combining registration flows, an XP system, role automation, notifications, and admin tooling.",
      problem:
        "Running competitions and communities across Discord usually means stitching together manual roles, spreadsheets, and reminders. It doesn't scale and it burns out organizers.",
      built:
        "A connected system with member registration, an XP and progression layer, automated role assignment, notification delivery, and an administration surface for organizers.",
      howItWorks:
        PLACEHOLDER + " (Intended flow: members register → activity tracked as XP → roles and notifications automated → admins manage from a dashboard.)",
      technology: "Discord APIs, a web layer for management, and automation services.",
      challenges:
        PLACEHOLDER + " (Expected challenges: syncing state between Discord and the web layer, permission modelling, notification reliability.)",
      result: "Active and in use for community management.",
    },
  },
  {
    slug: "discord-server-management",
    number: "03",
    name: "Discord Server Management",
    description:
      "Custom bots and tools for managing communities, logging events, automating workflows, and improving server experiences.",
    tags: ["Discord", "Bots", "Automation", "Node.js"],
    status: "Active",
    accent: "from-[#7bd8a4]/16 to-transparent",
    githubUrl: "",
    lastUpdated: "August 2026",
    detail: {
      overview:
        "A collection of custom bots and utilities built to run smoother, better-moderated Discord communities through logging, automation, and quality-of-life tooling.",
      problem:
        "Community servers accumulate repetitive moderation and admin tasks. Off-the-shelf bots rarely fit a server's exact workflow.",
      built:
        "Purpose-built bots that log events, automate recurring workflows, and add tailored features to improve the day-to-day server experience.",
      howItWorks:
        PLACEHOLDER + " (Intended flow: events captured → logged and processed → automated actions triggered based on server rules.)",
      technology: "Node.js and the Discord API, with automation workflows.",
      challenges:
        PLACEHOLDER + " (Expected challenges: rate limits, uptime, and keeping automation predictable at scale.)",
      result: "Active across communities.",
    },
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);

// The single project surfaced in the "Currently Building" section.
export const currentlyBuildingSlug = "ai-scam-detection";
