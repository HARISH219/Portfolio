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
  | "grid"
  | "whatsapp"
  | "pill";

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

// Which mockup UI preview to render on a featured card / case study.
// "none" => fall back to the abstract gradient thumbnail.
export type PreviewKind = "whatsapp" | "medicine" | "none";

// Extra long-form content shown only on premium featured project pages.
export type CaseStudy = {
  // Section labels vary per project (e.g. "The idea" vs "The problem").
  intro: { heading: string; body: string }[];
  // A simple vertical flow diagram: each string is a step.
  flow: string[];
};

// A visual build-progress indicator for in-development projects.
export type BuildProgress = { phase: string; percent: number };

export type FeaturedProject = {
  name: string;
  slug: string; // route: /projects/[slug]
  description: string;
  longDescription?: string;
  tagline?: string; // short punchy line for the featured card
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
  repoName?: string; // e.g. "harish219/whatsapp-ai" — shown on the case study
  liveUrl?: string; // real deployment only — omit if none exists
  lastUpdated?: string; // e.g. "2026" — shown on the case study
  external?: boolean; // for the "More projects" tile: link straight out
  href?: string; // used only when external === true

  // --- Premium "newest build" treatment ---
  featured?: boolean; // renders the large card + accent styling
  isNew?: boolean; // shows the animated "✦ NEW" badge
  newLabel?: string; // e.g. "NEW BUILD · 2026"
  accent?: "cyan"; // optional accent theme for the featured card
  preview?: PreviewKind; // which mockup to render
  caseStudy?: CaseStudy; // long-form case-study content
  buildProgress?: BuildProgress; // status indicator on the case study
  // When true, the project page renders the LIVE interactive WhatsApp chat
  // (backed by /api/whatsapp-ai/chat) instead of the static mockup preview.
  liveChat?: boolean;
};

const GH = "https://github.com/HARISH219";

const WHATSAPP_AI_REPO = "https://github.com/HARISH219/whatsapp-ai";
// TODO(harish): replace with the real repository URL once available.
const MEDICINE_APP_REPO = "https://github.com/HARISH219/REPLACE_ME-medicine-app";

// Single source of truth: powers the hero panel cards, the marquee, and every
// /projects/[slug] page. The two newest builds are marked `featured` + `isNew`
// and are ordered first so they lead the section.
export const featuredProjects: FeaturedProject[] = [
  {
    name: "WhatsApp AI",
    slug: "whatsapp-ai",
    description:
      "An AI-powered WhatsApp system built for natural, contextual conversations.",
    tagline: "AI-powered WhatsApp system",
    longDescription:
      "A WhatsApp automation layer that turns incoming messages into natural, context-aware replies. It processes each message, keeps track of conversation context, and generates a response that flows back to the user — all through WhatsApp.",
    category: "AI / Automation / WhatsApp",
    status: "IN DEVELOPMENT",
    projectType: "showcase",
    icon: "whatsapp",
    thumb: "from-[#25D366]/22 via-[#0e0e11] to-[#0a0a0c]",
    technologies: ["AI", "WhatsApp", "Node.js", "Automation"],
    features: [
      { title: "Contextual replies", body: "Keeps track of the conversation so replies stay on-topic." },
      { title: "Message processing", body: "Parses and routes each incoming WhatsApp message." },
      { title: "AI responses", body: "Generates natural-language answers rather than canned text." },
      { title: "Automation-first", body: "Runs unattended so conversations are handled automatically." },
    ],
    architecture: [
      { step: "WhatsApp", detail: "A message arrives from a user on WhatsApp." },
      { step: "Processing", detail: "The message is parsed, cleaned and routed." },
      { step: "AI / Context", detail: "Context is applied and an AI response is generated." },
      { step: "Response", detail: "The reply is sent back to the user on WhatsApp." },
    ],
    demoType: "none",
    demoEnabled: false,
    githubUrl: WHATSAPP_AI_REPO,
    repoName: "HARISH219/whatsapp-ai",
    lastUpdated: "2026",
    featured: true,
    isNew: true,
    newLabel: "NEW BUILD · 2026",
    accent: "cyan",
    preview: "whatsapp",
    liveChat: true,
    buildProgress: { phase: "Building", percent: 65 },
    caseStudy: {
      intro: [
        {
          heading: "The idea",
          body: "Most WhatsApp bots feel robotic — rigid menus and canned replies. WhatsApp AI is built to hold natural, contextual conversations: it understands what was said, remembers the thread, and responds like a real assistant, right inside WhatsApp.",
        },
      ],
      flow: ["WhatsApp", "Message Processing", "AI / Context", "Response", "WhatsApp"],
    },
  },
  {
    name: "Medicine App",
    slug: "medicine-app",
    description:
      "A smart medication reminder and monitoring system designed around real daily medication schedules.",
    tagline: "Smart medication management",
    longDescription:
      "A mobile-first app that manages real medication schedules — different medicines, doses and recurring timings — with reminders, taken/missed tracking, database-backed history and cross-device sync.",
    category: "Health Tech / Mobile App / Automation",
    status: "IN DEVELOPMENT",
    projectType: "showcase",
    icon: "pill",
    thumb: "from-[#22b8cf]/22 via-[#0e0e11] to-[#0a0a0c]",
    technologies: ["Mobile", "Health Tech", "Notifications", "Database", "Scheduling"],
    features: [
      { title: "Scheduled reminders", body: "Reminders fire at each medicine's real scheduled time." },
      { title: "Dose tracking", body: "Track doses per medicine across the day." },
      { title: "Taken / missed states", body: "Mark each dose as taken or missed and keep the history." },
      { title: "Recurring schedules", body: "Support medicines that repeat daily or on custom patterns." },
      { title: "Database-backed history", body: "Every confirmation is stored for later monitoring." },
      { title: "Cross-device sync", body: "Schedules and status stay in sync across devices." },
    ],
    architecture: [
      { step: "Schedule", detail: "Medicines are added with doses and recurring timings." },
      { step: "Reminder", detail: "A daily reminder fires at each scheduled time." },
      { step: "Confirmation", detail: "The user marks the dose as taken or missed." },
      { step: "Sync", detail: "State is written to the database and synced across devices." },
      { step: "Monitoring", detail: "History and status feed a monitoring view." },
    ],
    demoType: "none",
    demoEnabled: false,
    githubUrl: MEDICINE_APP_REPO,
    repoName: "HARISH219/medicine-app",
    lastUpdated: "2026",
    featured: true,
    isNew: true,
    newLabel: "NEW BUILD · 2026",
    accent: "cyan",
    preview: "medicine",
    buildProgress: { phase: "Building", percent: 55 },
    caseStudy: {
      intro: [
        {
          heading: "The problem",
          body: "Medication schedules get complicated fast — different medicines have different timings, doses and recurring patterns, and it's easy to lose track of what was taken and when.",
        },
        {
          heading: "The solution",
          body: "A dedicated app that manages medication schedules, sends reminders, tracks taken/missed states, and keeps everything synced and monitored from one place.",
        },
      ],
      flow: [
        "Medicine Schedule",
        "Daily Reminder",
        "User Confirmation",
        "Database Sync",
        "Monitoring / Status",
      ],
    },
  },
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

// The premium "newest build" projects (large cards + Currently Building).
export const newestProjects = featuredProjects.filter((p) => p.featured);

// The rest, for the standard card list / marquee.
export const standardFeatured = featuredProjects.filter((p) => !p.featured);
