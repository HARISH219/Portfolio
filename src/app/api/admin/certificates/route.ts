import { makeResourceHandlers } from "@/server/crud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { GET, POST } = makeResourceHandlers({
  table: "certificates",
  idPrefix: "cert",
  category: "Portfolio",
  label: "Certificate",
  orderBy: "sort_order ASC, created_at DESC",
  columns: [
    { name: "title", type: "text", required: true },
    { name: "issuer", type: "text" },
    { name: "date", type: "text" },
    { name: "url", type: "text" },
    { name: "sort_order", type: "int" },
  ],
});

export { GET, POST };
