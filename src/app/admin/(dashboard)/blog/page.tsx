"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

export default function BlogPage() {
  return (
    <ResourceManager
      title="Blog / Articles"
      subtitle="Write and manage articles. Draft or publish."
      endpoint="/api/admin/blog"
      singular="Blog post"
      fields={[
        { name: "title", label: "Title", type: "text", inTable: true, placeholder: "Post title" },
        { name: "slug", label: "Slug", type: "text", inTable: true, placeholder: "my-post" },
        { name: "status", label: "Status", type: "select", options: ["draft", "published"], inTable: true },
        { name: "excerpt", label: "Excerpt", type: "textarea", placeholder: "Short summary" },
        { name: "content", label: "Content", type: "textarea", placeholder: "Full article (markdown ok)" },
        { name: "tags", label: "Tags (comma-separated)", type: "tags", placeholder: "nextjs, web" },
        { name: "featured_image", label: "Featured image URL", type: "url", placeholder: "https://..." },
      ]}
    />
  );
}
