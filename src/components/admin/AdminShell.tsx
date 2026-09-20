"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navGroups, findActive, icons } from "./nav";

/**
 * The persistent admin chrome: collapsible sidebar (desktop), drawer (mobile),
 * and top header. Pink/magenta dark theme, self-contained styling so it never
 * touches the public portfolio's gold theme.
 */
export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const active = findActive(pathname);

  const currentLabel =
    navGroups.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? "Dashboard";

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  const sidebarWidth = collapsed ? "w-[74px]" : "w-[248px]";

  return (
    <div className="min-h-screen bg-[#08070c] text-[#ece9f1]">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#ec4899]/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#a855f7]/[0.06] blur-[120px]" />
      </div>

      {/* ── Sidebar (desktop) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/[0.06] bg-[#0b0a11]/80 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex ${sidebarWidth}`}
      >
        <SidebarContent
          collapsed={collapsed}
          active={active}
          username={username}
          onLogout={logout}
          onToggle={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[264px] flex-col border-r border-white/[0.06] bg-[#0b0a11] animate-[slidein_.2s_ease-out]">
            <SidebarContent
              collapsed={false}
              active={active}
              username={username}
              onLogout={logout}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main column ── */}
      <div className={`relative z-10 transition-[padding] duration-300 ${collapsed ? "lg:pl-[74px]" : "lg:pl-[248px]"}`}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/[0.06] bg-[#08070c]/85 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-[#c9c5d6] hover:bg-white/5 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-[var(--font-display)] text-[15px] font-semibold text-white">{currentLabel}</h1>
            <p className="truncate text-[11px] text-[#8b8797]">
              Portfolio Administration <span className="text-[#5a5766]">/</span> {currentLabel}
            </p>
          </div>

          {/* System status */}
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> All Systems Operational
          </span>

          <button
            onClick={() => router.refresh()}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-[#c9c5d6] hover:bg-white/5"
            aria-label="Refresh"
            title="Refresh"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
          </button>

          <div className="hidden items-center gap-2 rounded-lg border border-white/10 px-2.5 py-1.5 sm:flex">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-[#ec4899] to-[#a855f7] text-[10px] font-bold text-white">
              {username.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-[12px] text-[#c9c5d6]">{username}</span>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>

      <style>{`@keyframes slidein{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

function SidebarContent({
  collapsed,
  active,
  username,
  onLogout,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  active: string;
  username: string;
  onLogout: () => void;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ec4899] to-[#a855f7] text-sm font-bold text-white shadow-lg shadow-[#ec4899]/20">
          HB
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-white">Portfolio</div>
            <div className="truncate text-[10px] uppercase tracking-wider text-[#8b8797]">Administration</div>
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="ml-auto hidden h-7 w-7 place-items-center rounded-md text-[#8b8797] hover:bg-white/5 hover:text-white lg:grid"
            aria-label="Toggle sidebar"
            title="Collapse"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 scroll-subtle">
        {navGroups.map((group) => (
          <div key={group.heading} className="mb-3">
            {!collapsed && (
              <div className="px-2 pb-1.5 pt-1 text-[10px] font-medium uppercase tracking-wider text-[#5a5766]">
                {group.heading}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={`group/navitem flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                      isActive
                        ? "bg-[#ec4899]/12 text-white ring-1 ring-[#ec4899]/25"
                        : "text-[#a5a1b3] hover:bg-white/[0.04] hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <span className={isActive ? "text-[#f472b6]" : "text-[#8b8797] group-hover/navitem:text-[#c9c5d6]"}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-2.5">
        <a
          href="/"
          title={collapsed ? "Back to Portfolio" : undefined}
          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#a5a1b3] hover:bg-white/[0.04] hover:text-white ${collapsed ? "justify-center" : ""}`}
        >
          <span className="text-[#8b8797]">{icons.back}</span>
          {!collapsed && <span>Back to Portfolio</span>}
        </a>
        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={`mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#a5a1b3] hover:bg-[#fb7185]/10 hover:text-[#fb7185] ${collapsed ? "justify-center" : ""}`}
        >
          <span className="text-[#8b8797]">{icons.logout}</span>
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.06] px-2.5 py-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#ec4899] to-[#a855f7] text-[11px] font-bold text-white">
              {username.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-medium text-white">{username}</div>
              <div className="text-[10px] text-[#8b8797]">Owner</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
