import { createClient, type Client, type InArgs } from "@libsql/client";

/**
 * Database layer for the Portfolio Control Center.
 *
 * Uses Turso (libSQL) when TURSO_DATABASE_URL is set, otherwise falls back to a
 * local SQLite file so the panel still works in local development. If neither is
 * usable, `isConfigured()` returns false and callers render a graceful
 * "database not configured" state rather than crashing.
 *
 * This module is server-only. Never import it from client components.
 */

let client: Client | null = null;
let initPromise: Promise<void> | null = null;
let configured = false;

function resolveClient(): Client | null {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  try {
    if (url) {
      client = createClient({ url, authToken });
      configured = true;
    } else {
      // Local dev fallback: a file-based SQLite DB in the project root.
      client = createClient({ url: "file:.data/portfolio-admin.db" });
      configured = true;
    }
  } catch (err) {
    console.error("[db] Failed to create libSQL client:", err);
    client = null;
    configured = false;
  }
  return client;
}

export function isConfigured(): boolean {
  resolveClient();
  return configured;
}

/** Run a statement. Returns rows as plain objects. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = [],
): Promise<T[]> {
  const c = resolveClient();
  if (!c) throw new Error("DB_NOT_CONFIGURED");
  await ensureSchema();
  const res = await c.execute({ sql, args });
  return res.rows as unknown as T[];
}

/** Run a statement without needing the schema-ensure round-trip (used internally). */
async function raw(sql: string, args: InArgs = []) {
  const c = resolveClient();
  if (!c) throw new Error("DB_NOT_CONFIGURED");
  return c.execute({ sql, args });
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT (datetime('now')),
    actor TEXT NOT NULL,
    event TEXT NOT NULL,
    target TEXT,
    category TEXT NOT NULL DEFAULT 'System',
    status TEXT NOT NULL DEFAULT 'Success',
    details TEXT DEFAULT '',
    ip TEXT DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT DEFAULT '',
    technologies TEXT DEFAULT '[]',
    image TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    live_url TEXT DEFAULT '',
    featured INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS experience (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date TEXT DEFAULT '',
    end_date TEXT DEFAULT '',
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    level INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS education (
    id TEXT PRIMARY KEY,
    institution TEXT NOT NULL,
    degree TEXT DEFAULT '',
    field TEXT DEFAULT '',
    start_date TEXT DEFAULT '',
    end_date TEXT DEFAULT '',
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT DEFAULT '',
    date TEXT DEFAULT '',
    url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    excerpt TEXT DEFAULT '',
    content TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    featured_image TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT '',
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread',
    created_at TEXT DEFAULT (datetime('now')),
    ip TEXT DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    path TEXT DEFAULT '',
    referrer TEXT DEFAULT '',
    country TEXT DEFAULT '',
    device TEXT DEFAULT '',
    browser TEXT DEFAULT '',
    os TEXT DEFAULT '',
    visitor_id TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS api_tests (
    id TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    headers TEXT DEFAULT '{}',
    body TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
];

let schemaReady = false;
export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const c = resolveClient();
    if (!c) throw new Error("DB_NOT_CONFIGURED");
    for (const stmt of SCHEMA) {
      await c.execute(stmt);
    }
    schemaReady = true;
  })();
  return initPromise;
}

// ─── Small helpers ─────────────────────────────────────────────────────────

export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function execute(sql: string, args: InArgs = []) {
  await ensureSchema();
  return raw(sql, args);
}
