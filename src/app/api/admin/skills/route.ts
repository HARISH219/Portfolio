import { makeResourceHandlers } from "@/server/crud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { GET, POST } = makeResourceHandlers({
  table: "skills",
  idPrefix: "skl",
  category: "Portfolio",
  label: "Skill",
  orderBy: "sort_order ASC, name ASC",
  columns: [
    { name: "name", type: "text", required: true },
    { name: "category", type: "text" },
    { name: "level", type: "int" },
    { name: "sort_order", type: "int" },
  ],
});

export { GET, POST };
