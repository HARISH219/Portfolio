"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

export default function ExperiencePage() {
  return (
    <ResourceManager
      title="Experience"
      subtitle="Manage your work history and roles."
      endpoint="/api/admin/experience"
      singular="Experience"
      fields={[
        { name: "company", label: "Company", type: "text", inTable: true, placeholder: "Company name" },
        { name: "role", label: "Role", type: "text", inTable: true, placeholder: "Your title" },
        { name: "start_date", label: "Start date", type: "text", inTable: true, placeholder: "Jan 2024" },
        { name: "end_date", label: "End date", type: "text", inTable: true, placeholder: "Present" },
        { name: "description", label: "Description", type: "textarea", placeholder: "What you did" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}
