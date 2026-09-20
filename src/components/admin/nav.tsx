import type { ReactNode } from "react";

/**
 * Admin navigation config. Icons are inline SVGs (stroke-based, 18px) to avoid
 * pulling an icon dependency and to keep the admin bundle small.
 */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const icons = {
  dashboard: <Icon><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></Icon>,
  portfolio: <Icon><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></Icon>,
  projects: <Icon><path d="M2 7l10-4 10 4-10 4-10-4Z" /><path d="M2 7v10l10 4 10-4V7" /></Icon>,
  experience: <Icon><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>,
  skills: <Icon><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7Z" /></Icon>,
  education: <Icon><path d="M22 10L12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5" /></Icon>,
  certificates: <Icon><circle cx="12" cy="9" r="6" /><path d="M8.5 14L7 22l5-3 5 3-1.5-8" /></Icon>,
  blog: <Icon><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></Icon>,
  messages: <Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></Icon>,
  contact: <Icon><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></Icon>,
  analytics: <Icon><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></Icon>,
  testing: <Icon><path d="M9 3v6l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3" /><path d="M8 3h8" /></Icon>,
  api: <Icon><path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" /></Icon>,
  database: <Icon><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></Icon>,
  serverLogs: <Icon><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></Icon>,
  auditLogs: <Icon><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M9 13h6M9 17h4" /></Icon>,
  security: <Icon><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></Icon>,
  settings: <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3 12.6a1.65 1.65 0 0 0-1.51-1H1a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3 6.4Z" /></Icon>,
  back: <Icon><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></Icon>,
  logout: <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Icon>,
};

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/admin", icon: icons.dashboard },
      { id: "analytics", label: "Analytics", href: "/admin/analytics", icon: icons.analytics },
    ],
  },
  {
    heading: "Content",
    items: [
      { id: "projects", label: "Projects", href: "/admin/projects", icon: icons.projects },
      { id: "experience", label: "Experience", href: "/admin/experience", icon: icons.experience },
      { id: "skills", label: "Skills", href: "/admin/skills", icon: icons.skills },
      { id: "education", label: "Education", href: "/admin/education", icon: icons.education },
      { id: "certificates", label: "Certificates", href: "/admin/certificates", icon: icons.certificates },
      { id: "blog", label: "Blog / Articles", href: "/admin/blog", icon: icons.blog },
    ],
  },
  {
    heading: "Inbox",
    items: [
      { id: "messages", label: "Messages", href: "/admin/messages", icon: icons.messages },
    ],
  },
  {
    heading: "Monitoring",
    items: [
      { id: "testing", label: "Website Testing", href: "/admin/testing", icon: icons.testing },
      { id: "api", label: "API Testing", href: "/admin/api-testing", icon: icons.api },
      { id: "database", label: "Database", href: "/admin/database", icon: icons.database },
      { id: "server-logs", label: "Server Logs", href: "/admin/server-logs", icon: icons.serverLogs },
      { id: "audit-logs", label: "Audit Logs", href: "/admin/audit-logs", icon: icons.auditLogs },
      { id: "security", label: "Security", href: "/admin/security", icon: icons.security },
    ],
  },
  {
    heading: "System",
    items: [
      { id: "settings", label: "Settings", href: "/admin/settings", icon: icons.settings },
    ],
  },
];

export function findActive(pathname: string): string {
  // Longest-prefix match so /admin/projects/123 highlights Projects.
  let best = "dashboard";
  let bestLen = -1;
  for (const g of navGroups) {
    for (const it of g.items) {
      if (it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href)) {
        if (it.href.length > bestLen) { best = it.id; bestLen = it.href.length; }
      }
    }
  }
  return best;
}
