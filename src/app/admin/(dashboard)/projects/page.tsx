"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

export default function ProjectsPage() {
  return (
    <ResourceManager
      title="Projects"
      subtitle="Manage the projects shown on your portfolio."
      endpoint="/api/admin/projects"
      singular="Project"
      fields={[
        { name: "title", label: "Title", type: "text", inTable: true, placeholder: "Project name" },
        { name: "slug", label: "Slug", type: "text", inTable: true, placeholder: "my-project" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Short description" },
        { name: "technologies", label: "Technologies (comma-separated)", type: "tags", inTable: true, placeholder: "React, Node.js" },
        { name: "github_url", label: "GitHub URL", type: "url", placeholder: "https://github.com/..." },
        { name: "live_url", label: "Live URL", type: "url", placeholder: "https://..." },
        { name: "image", label: "Image URL", type: "url", placeholder: "https://..." },
        { name: "featured", label: "Featured", type: "toggle" },
        { name: "published", label: "Published", type: "toggle", inTable: true },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}
