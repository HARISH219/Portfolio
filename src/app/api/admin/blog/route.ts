import { makeResourceHandlers } from "@/server/crud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { GET, POST } = makeResourceHandlers({
  table: "blog_posts",
  idPrefix: "post",
  category: "Portfolio",
  label: "Blog post",
  orderBy: "created_at DESC",
  columns: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text" },
    { name: "excerpt", type: "text" },
    { name: "content", type: "text" },
    { name: "tags", type: "json" },
    { name: "featured_image", type: "text" },
    { name: "status", type: "text" },
  ],
});

export { GET, POST };
