import { execute, query, isConfigured } from "./db";

/**
 * Backend-persisted admin settings (key/value). Falls back to defaults when the
 * DB is not configured so the settings page still renders.
 */

const DEFAULTS: Record<string, string> = {
  "general.siteName": "Harish Bag — Portfolio",
  "general.tagline": "Developer / Builder / Experimenter",
  "portfolio.publicUrl": "https://harishbag.dev",
  "appearance.accent": "#ec4899",
  "notifications.emailOnMessage": "false",
  "logs.retentionDays": "90",
  "security.rateLimit": "true",
};

export async function getSetting(key: string): Promise<string> {
  if (!isConfigured()) return DEFAULTS[key] ?? "";
  try {
    const rows = await query<{ value: string }>(`SELECT value FROM settings WHERE key = ?`, [key]);
    return rows[0]?.value ?? DEFAULTS[key] ?? "";
  } catch {
    return DEFAULTS[key] ?? "";
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const merged = { ...DEFAULTS };
  if (!isConfigured()) return merged;
  try {
    const rows = await query<{ key: string; value: string }>(`SELECT key, value FROM settings`);
    rows.forEach((r) => (merged[r.key] = r.value));
  } catch {
    /* return defaults */
  }
  return merged;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await execute(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    [key, value],
  );
}
