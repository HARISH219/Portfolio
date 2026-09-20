import { makeResourceHandlers } from "@/server/crud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { GET, POST } = makeResourceHandlers({
  table: "projects",
  idPrefix: "prj",
  category: "Portfolio",
  label: "Project",
  orderBy: "sort_order ASC, created_at DESC",
  columns: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text" },
    { name: "description", type: "text" },
    { name: "technologies", type: "json" },
    { name: "image", type: "text" },
    { name: "github_url", type: "text" },
    { name: "live_url", type: "text" },
    { name: "featured", type: "int" },
    { name: "published", type: "int" },
    { name: "sort_order", type: "int" },
  ],
});

export { GET, POST };
