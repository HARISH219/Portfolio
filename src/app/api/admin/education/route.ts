import { makeResourceHandlers } from "@/server/crud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { GET, POST } = makeResourceHandlers({
  table: "education",
  idPrefix: "edu",
  category: "Portfolio",
  label: "Education",
  orderBy: "sort_order ASC, created_at DESC",
  columns: [
    { name: "institution", type: "text", required: true },
    { name: "degree", type: "text" },
    { name: "field", type: "text" },
    { name: "start_date", type: "text" },
    { name: "end_date", type: "text" },
    { name: "description", type: "text" },
    { name: "sort_order", type: "int" },
  ],
});

export { GET, POST };
