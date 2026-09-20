import { execute, query, newId, isConfigured } from "./db";

/**
 * Audit logging for the Portfolio Control Center.
 * Every meaningful admin action should call `logAudit`.
 */

export type AuditCategory =
  | "Authentication"
  | "Admin Actions"
  | "Portfolio"
  | "Messages"
  | "API"
  | "Database"
  | "Security"
  | "System"
  | "Testing";

export type AuditStatus = "Success" | "Failed" | "Warning";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  target: string | null;
  category: AuditCategory | string;
  status: AuditStatus | string;
  details: string;
  ip: string;
}

export async function logAudit(params: {
  actor: string;
  event: string;
  target?: string | null;
  category?: AuditCategory;
  status?: AuditStatus;
  details?: string;
  ip?: string;
}): Promise<void> {
  // Never let audit logging break the primary action.
  if (!isConfigured()) return;
  try {
    await execute(
      `INSERT INTO audit_log (id, actor, event, target, category, status, details, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId("evt"),
        params.actor,
        params.event,
        params.target ?? null,
        params.category ?? "System",
        params.status ?? "Success",
        params.details ?? "",
        params.ip ?? "",
      ],
    );
  } catch (err) {
    console.error("[audit] failed to write log:", err);
  }
}

export async function getAuditPage(opts: {
  limit?: number;
  offset?: number;
  category?: string;
  status?: string;
  actor?: string;
  search?: string;
  from?: string;
  to?: string;
}): Promise<{ logs: AuditEntry[]; total: number }> {
  const limit = Math.min(Math.max(1, opts.limit ?? 50), 200);
  const offset = Math.max(0, opts.offset ?? 0);

  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.category && opts.category !== "all") { where.push("category = ?"); args.push(opts.category); }
  if (opts.status && opts.status !== "all") { where.push("status = ?"); args.push(opts.status); }
  if (opts.actor && opts.actor !== "all") { where.push("actor = ?"); args.push(opts.actor); }
  if (opts.from) { where.push("timestamp >= ?"); args.push(opts.from); }
  if (opts.to) { where.push("timestamp <= ?"); args.push(opts.to); }
  if (opts.search) {
    where.push("(event LIKE ? OR target LIKE ? OR details LIKE ? OR actor LIKE ?)");
    const s = `%${opts.search}%`;
    args.push(s, s, s, s);
  }
  const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";

  const [rows, countRows] = await Promise.all([
    query<AuditEntry>(
      `SELECT * FROM audit_log${whereSql} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [...args, limit, offset],
    ),
    query<{ total: number }>(`SELECT COUNT(*) AS total FROM audit_log${whereSql}`, args),
  ]);
  return { logs: rows, total: Number(countRows[0]?.total ?? 0) };
}

export async function getAuditStats(): Promise<{
  total: number;
  today: number;
  byCategory: { label: string; value: number }[];
  last7Days: { date: string; total: number }[];
}> {
  const empty = { total: 0, today: 0, byCategory: [], last7Days: [] };
  if (!isConfigured()) return empty;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
    const [totalR, todayR, catR, dailyR] = await Promise.all([
      query<{ total: number }>(`SELECT COUNT(*) AS total FROM audit_log`),
      query<{ total: number }>(`SELECT COUNT(*) AS total FROM audit_log WHERE substr(timestamp,1,10)=?`, [today]),
      query<{ category: string; total: number }>(`SELECT category, COUNT(*) AS total FROM audit_log GROUP BY category ORDER BY total DESC`),
      query<{ d: string; total: number }>(`SELECT substr(timestamp,1,10) AS d, COUNT(*) AS total FROM audit_log WHERE substr(timestamp,1,10) >= ? GROUP BY d`, [weekAgo]),
    ]);
    const dayMap = new Map<string, number>();
    dailyR.forEach((r) => dayMap.set(r.d, Number(r.total)));
    const last7Days: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      last7Days.push({ date: d, total: dayMap.get(d) ?? 0 });
    }
    return {
      total: Number(totalR[0]?.total ?? 0),
      today: Number(todayR[0]?.total ?? 0),
      byCategory: catR.map((r) => ({ label: r.category, value: Number(r.total) })),
      last7Days,
    };
  } catch (err) {
    console.error("[audit] stats failed:", err);
    return empty;
  }
}
