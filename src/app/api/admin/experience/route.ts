import { makeResourceHandlers } from "@/server/crud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { GET, POST } = makeResourceHandlers({
  table: "experience",
  idPrefix: "exp",
  category: "Portfolio",
  label: "Experience",
  orderBy: "sort_order ASC, created_at DESC",
  columns: [
    { name: "company", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "start_date", type: "text" },
    { name: "end_date", type: "text" },
    { name: "description", type: "text" },
    { name: "sort_order", type: "int" },
  ],
});

export { GET, POST };
