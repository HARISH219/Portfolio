"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, LoadingBlock, ErrorBlock } from "@/components/admin/ui";

type Settings = Record<string, string>;

const SECTIONS: { heading: string; fields: { key: string; label: string; type?: "text" | "toggle" | "number" }[] }[] = [
  {
    heading: "General",
    fields: [
      { key: "general.siteName", label: "Site name" },
      { key: "general.tagline", label: "Tagline" },
    ],
  },
  {
    heading: "Portfolio",
    fields: [{ key: "portfolio.publicUrl", label: "Public URL" }],
  },
  {
    heading: "Appearance",
    fields: [{ key: "appearance.accent", label: "Accent color (hex)" }],
  },
  {
    heading: "Notifications",
    fields: [{ key: "notifications.emailOnMessage", label: "Email on new message", type: "toggle" }],
  },
  {
    heading: "Logs",
    fields: [{ key: "logs.retentionDays", label: "Log retention (days)", type: "number" }],
  },
  {
    heading: "Security",
    fields: [{ key: "security.rateLimit", label: "Enable rate limiting", type: "toggle" }],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dbConfigured, setDbConfigured] = useState(true);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { if (d.success) { setSettings(d.settings ?? {}); setDbConfigured(d.dbConfigured !== false); } else setError(d.error || "Failed to load settings."); })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function set(key: string, value: string) { setSettings((p) => ({ ...p, [key]: value })); setSaved(false); }

  async function save() {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const d = await res.json();
      if (d.success) setSaved(true);
      else alert(d.error || "Save failed.");
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <p className="mt-0.5 text-xs text-[#8b8797]">Configuration stored in the backend.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[11px] text-emerald-400">Saved ✓</span>}
          <button onClick={save} disabled={saving || !dbConfigured} className="rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] px-3.5 py-2 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {!dbConfigured && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">Database not configured — settings can be viewed but not saved.</div>
      )}

      {loading ? (
        <LoadingBlock label="Loading settings..." />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <Card key={section.heading} className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">{section.heading}</h3>
              <div className="space-y-3">
                {section.fields.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-[11px] text-[#a5a1b3]">{f.label}</label>
                    {f.type === "toggle" ? (
                      <button
                        type="button"
                        onClick={() => set(f.key, settings[f.key] === "true" ? "false" : "true")}
                        className={`relative h-6 w-11 rounded-full transition-colors ${settings[f.key] === "true" ? "bg-[#ec4899]" : "bg-white/10"}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings[f.key] === "true" ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                      </button>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        value={settings[f.key] ?? ""}
                        onChange={(e) => set(f.key, e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#ec4899]/50"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
