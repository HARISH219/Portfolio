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
    slug: "spitzvilla",
    number: "01",
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
    number: "02",
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

// How a project is experienced from its detail page.
export type ProjectType = "live" | "interactive-demo" | "showcase" | "coming-soon";

// The badge shown in the hero of a project page + on the card.
export type FeaturedStatus = "LIVE" | "INTERACTIVE DEMO" | "IN DEVELOPMENT" | "ARCHIVED";

// Which lazy-loaded demo component renders in the project's interactive area.
// "none" => no demo area (showcase-only).
export type DemoType =
  | "discord-dashboard"
  | "ai-scam-detection"
  | "minecraft-server"
  | "automation-tools"
  | "document-manager"
  | "none";

export type ProjectFeature = { title: string; body: string };
export type ArchitectureStep = { step: string; detail: string };

export type FeaturedProject = {
  name: string;
  slug: string; // route: /projects/[slug]
  description: string;
  longDescription?: string;
  category: string;
  status: FeaturedStatus;
  projectType: ProjectType;
  icon: FeaturedIcon;
  thumb: string; // tailwind gradient classes for the thumbnail backdrop
  technologies: string[];
  features: ProjectFeature[];
  architecture: ArchitectureStep[];
  demoType: DemoType;
  demoEnabled: boolean;
  githubUrl?: string; // secondary "View source" link
  liveUrl?: string; // real deployment only — omit if none exists
  external?: boolean; // for the "More projects" tile: link straight out
  href?: string; // used only when external === true
};

const GH = "https://github.com/HARISH219";

// Single source of truth: powers the hero panel cards, the marquee, and every
// /projects/[slug] page. Add a new project by appending one object here.
export const featuredProjects: FeaturedProject[] = [
  {
    name: "Discord Bot",
    slug: "discord-bot",
    description: "A feature-rich Discord bot with moderation, XP system and more.",
    longDescription:
      "A community-management bot with moderation tooling, an XP/levelling system, automod filters, logging, and a management dashboard. The demo below is a simulated version of that dashboard.",
    category: "Bot Development",
    status: "LIVE",
    projectType: "interactive-demo",
    icon: "bot",
    thumb: "from-[#5865F2]/25 via-[#0e0e11] to-[#0a0a0c]",
    technologies: ["Node.js", "Discord.js", "TypeScript", "SQLite"],
    features: [
      { title: "Moderation suite", body: "Warnings, mutes, bans and an audit trail, all from one panel." },
      { title: "XP & levelling", body: "Message-based XP with a live leaderboard and role rewards." },
      { title: "Automod", body: "Configurable filters for spam, links, and banned words." },
      { title: "Event logging", body: "Structured logs for joins, edits, deletes and mod actions." },
    ],
    architecture: [
      { step: "Gateway", detail: "Listens to Discord events over the websocket gateway." },
      { step: "Handlers", detail: "Commands and event handlers process each interaction." },
      { step: "Store", detail: "XP, warnings and settings persist to a local database." },
      { step: "Dashboard", detail: "A web layer surfaces stats and controls for admins." },
    ],
    demoType: "discord-dashboard",
    demoEnabled: true,
    githubUrl: GH,
  },
  {
    name: "AI Scam Detection",
    slug: "ai-scam-detection",
    description: "Analyzes messages for scam and phishing patterns and scores the risk.",
    longDescription:
      "An experimental classifier that flags scam and phishing messages by scoring linguistic and structural risk signals. Paste any message into the demo to see a deterministic, on-device analysis.",
    category: "AI / Machine Learning",
    status: "INTERACTIVE DEMO",
    projectType: "interactive-demo",
    icon: "shield",
    thumb: "from-[#4f8bff]/25 via-[#0e0e11] to-[#0a0a0c]",
    technologies: ["Python", "scikit-learn", "NLP", "FastAPI"],
    features: [
      { title: "Risk scoring", body: "Combines multiple weak signals into a single 0–100 risk score." },
      { title: "Indicator breakdown", body: "Shows exactly which patterns triggered the score." },
      { title: "Classification", body: "Labels a message as safe, suspicious, or high-risk." },
      { title: "Explainable", body: "Every result comes with a plain-language explanation." },
    ],
    architecture: [
      { step: "Ingest", detail: "The raw message text is normalized and tokenized." },
      { step: "Features", detail: "Urgency, payment, credential and link signals are extracted." },
      { step: "Score", detail: "Weighted signals produce a calibrated risk score." },
      { step: "Explain", detail: "Triggered indicators are surfaced back to the user." },
    ],
    demoType: "ai-scam-detection",
    demoEnabled: true,
    githubUrl: GH,
  },
  {
    name: "Minecraft Server",
    slug: "minecraft-server",
    description: "A 24/7 Minecraft server with custom features, plugins, and a control panel.",
    longDescription:
      "A managed Minecraft server with custom plugins and a control panel for status, players, and console. The demo simulates that control panel with live-updating stats.",
    category: "Game Server",
    status: "LIVE",
    projectType: "interactive-demo",
    icon: "cube",
    thumb: "from-[#5fbf60]/25 via-[#0e0e11] to-[#0a0a0c]",
    technologies: ["Java", "Paper", "Plugins", "Linux"],
    features: [
      { title: "Live status", body: "TPS, RAM, CPU and uptime at a glance." },
      { title: "Player list", body: "See who's online with ping and playtime." },
      { title: "Console", body: "Issue simulated commands and read the output stream." },
      { title: "Plugins", body: "Enable or disable plugins from the panel." },
    ],
    architecture: [
      { step: "Server", detail: "A Paper server runs the world and game loop." },
      { step: "Plugins", detail: "Custom plugins add gameplay and admin features." },
      { step: "Metrics", detail: "TPS/RAM/CPU are sampled and streamed to the panel." },
      { step: "Panel", detail: "A dashboard exposes status, players and console." },
    ],
    demoType: "minecraft-server",
    demoEnabled: true,
    githubUrl: GH,
  },
  {
    name: "Automation Tools",
    slug: "automation-tools",
    description: "Scripts and workflows that remove repetitive work and run on a schedule.",
    longDescription:
      "A collection of automations with a dashboard to create, toggle, run, and monitor tasks. The demo lets you build and run simulated automations and watch their logs.",
    category: "Automation",
    status: "INTERACTIVE DEMO",
    projectType: "interactive-demo",
    icon: "terminal",
    thumb: "from-[#d6a94e]/25 via-[#0e0e11] to-[#0a0a0c]",
    technologies: ["Python", "Node.js", "Cron", "APIs"],
    features: [
      { title: "Create automations", body: "Define a task with a trigger and an action." },
      { title: "Run on demand", body: "Trigger any automation and stream its logs." },
      { title: "Toggle & monitor", body: "Enable/disable tasks and track success/failure." },
      { title: "History", body: "Review completed and failed runs with timestamps." },
    ],
    architecture: [
      { step: "Trigger", detail: "A schedule or event kicks off an automation." },
      { step: "Runner", detail: "The task executes its steps and captures output." },
      { step: "Logs", detail: "Each run records status, duration and log lines." },
      { step: "Dashboard", detail: "Tasks and history are managed from one view." },
    ],
    demoType: "automation-tools",
    demoEnabled: true,
    githubUrl: GH,
  },
  {
    name: "Document Manager",
    slug: "document-manager",
    description: "A secure document manager with search, folders, categories and previews.",
    longDescription:
      "A full-stack document manager with folders, categories, search, and previews. The demo is a fully interactive file manager backed by simulated data.",
    category: "Full Stack",
    status: "INTERACTIVE DEMO",
    projectType: "interactive-demo",
    icon: "doc",
    thumb: "from-[#b06ff0]/25 via-[#0e0e11] to-[#0a0a0c]",
    technologies: ["React", "Node.js", "PostgreSQL", "S3"],
    features: [
      { title: "Search", body: "Instant search across names, types and categories." },
      { title: "Folders & categories", body: "Organize files and filter by category." },
      { title: "Preview", body: "Open a file to see its metadata and details." },
      { title: "Upload UI", body: "A simulated upload flow with progress." },
    ],
    architecture: [
      { step: "Upload", detail: "Files are received and metadata is extracted." },
      { step: "Store", detail: "Objects go to storage; metadata to the database." },
      { step: "Index", detail: "Names and tags are indexed for fast search." },
      { step: "Serve", detail: "The UI lists, filters and previews documents." },
    ],
    demoType: "document-manager",
    demoEnabled: true,
    githubUrl: GH,
  },
  {
    name: "More projects",
    slug: "more",
    description: "Browse the rest of my work and experiments on GitHub.",
    category: "GitHub",
    status: "LIVE",
    projectType: "showcase",
    icon: "grid",
    thumb: "from-[#d6a94e]/18 via-[#0e0e11] to-[#0a0a0c]",
    technologies: [],
    features: [],
    architecture: [],
    demoType: "none",
    demoEnabled: false,
    external: true,
    href: GH,
    githubUrl: GH,
  },
];

export const getFeaturedProject = (slug: string) =>
  featuredProjects.find((p) => p.slug === slug);

// Projects that get their own /projects/[slug] page (excludes external tiles).
export const routableProjects = featuredProjects.filter((p) => !p.external);
