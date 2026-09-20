import { query, execute, newId, isConfigured } from "./db";
import { projects as staticProjects } from "@/data/projects";
import { techStack } from "@/data/tech";

/**
 * One-time idempotent seed: populates the DB from the existing static data
 * files so the CMS shows the current portfolio content on first run. Guarded by
 * a settings flag so it never re-seeds or overwrites edits.
 */
let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!isConfigured()) return;
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const flag = await query<{ value: string }>(`SELECT value FROM settings WHERE key = 'seed.done'`);
      if (flag[0]?.value === "1") return;

      // Only seed projects if the table is empty (respect any manual edits).
      const existing = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM projects`);
      if (Number(existing[0]?.n ?? 0) === 0) {
        let order = 0;
        for (const p of staticProjects) {
          await execute(
            `INSERT INTO projects (id, title, slug, description, technologies, github_url, live_url, featured, published, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newId("prj"),
              p.name,
              p.slug,
              p.description,
              JSON.stringify(p.tags ?? []),
              p.githubUrl ?? "",
              p.liveUrl ?? "",
              0,
              1,
              order++,
            ],
          );
        }
      }

      // Seed skills from the tech stack groups if empty.
      const skillCount = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM skills`);
      if (Number(skillCount[0]?.n ?? 0) === 0) {
        let order = 0;
        for (const group of techStack) {
          for (const item of group.items) {
            await execute(
              `INSERT INTO skills (id, name, category, level, sort_order) VALUES (?, ?, ?, ?, ?)`,
              [newId("skl"), item, group.label, 0, order++],
            );
          }
        }
      }

      await execute(
        `INSERT INTO settings (key, value) VALUES ('seed.done', '1')
         ON CONFLICT(key) DO UPDATE SET value = '1'`,
      );
    } catch (err) {
      console.error("[seed] failed:", err);
    }
  })();
  return seedPromise;
}
