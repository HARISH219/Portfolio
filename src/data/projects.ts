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

// -----------------------------------------------------------------------------
// FEATURED PROJECTS (hero panel)
// A scrollable, clickable list shown in the hero's right-side glass panel.
// Each card is fully clickable and opens `href` in a new tab.
//
// TO EDIT: change `href` to the real URL for each project. Set `live: true` to
// show the green LIVE indicator. `icon` picks a built-in glyph; `thumb` is a
// tailwind gradient used behind the icon.
// -----------------------------------------------------------------------------

export type FeaturedIcon =
  | "portfolio"
  | "bot"
  | "shield"
  | "cube"
  | "terminal"
  | "doc"
  | "chart"
  | "spark"
  | "grid";

export type FeaturedProject = {
  name: string;
  description: string;
  category: string;
  href: string; // opened in a new tab when the card is clicked
  live?: boolean;
  icon: FeaturedIcon;
  thumb: string; // tailwind gradient classes for the thumbnail backdrop
};

// Replace `href` values with real project URLs as they go live.
export const featuredProjects: FeaturedProject[] = [
  {
    name: "Discord Bot",
    description: "A feature-rich Discord bot with moderation, XP system and more.",
    category: "Bot Development",
    href: "https://github.com/HARISH219",
    live: true,
    icon: "bot",
    thumb: "from-[#5865F2]/25 via-[#0e0e11] to-[#0a0a0c]",
  },
  {
    name: "AI Scam Detection",
    description: "Detects AI-generated voices from call recordings using ML.",
    category: "AI / Machine Learning",
    href: "https://github.com/HARISH219",
    icon: "shield",
    thumb: "from-[#4f8bff]/25 via-[#0e0e11] to-[#0a0a0c]",
  },
  {
    name: "Minecraft Server",
    description: "A 24/7 free Minecraft server with custom features and plugins.",
    category: "Game Server",
    href: "https://github.com/HARISH219",
    live: true,
    icon: "cube",
    thumb: "from-[#5fbf60]/25 via-[#0e0e11] to-[#0a0a0c]",
  },
  {
    name: "Automation Tools",
    description: "Various automation scripts and tools to save time and boost productivity.",
    category: "Automation",
    href: "https://github.com/HARISH219",
    icon: "terminal",
    thumb: "from-[#d6a94e]/25 via-[#0e0e11] to-[#0a0a0c]",
  },
  {
    name: "Document Manager",
    description: "Secure and simple document management system with encryption.",
    category: "Full Stack",
    href: "https://github.com/HARISH219",
    icon: "doc",
    thumb: "from-[#b06ff0]/25 via-[#0e0e11] to-[#0a0a0c]",
  },
  {
    name: "Analytics Dashboard",
    description: "Real-time analytics dashboard with clean charts and live data.",
    category: "Data Viz",
    href: "https://github.com/HARISH219",
    icon: "chart",
    thumb: "from-[#2ee08a]/22 via-[#0e0e11] to-[#0a0a0c]",
  },
  {
    name: "AI Experiments",
    description: "A collection of small AI experiments and practical prototypes.",
    category: "AI / Research",
    href: "https://github.com/HARISH219",
    icon: "spark",
    thumb: "from-[#ff9f6b]/22 via-[#0e0e11] to-[#0a0a0c]",
  },
  {
    name: "More projects",
    description: "Browse the rest of my work and experiments on GitHub.",
    category: "GitHub",
    href: "https://github.com/HARISH219",
    icon: "grid",
    thumb: "from-[#d6a94e]/18 via-[#0e0e11] to-[#0a0a0c]",
  },
];
