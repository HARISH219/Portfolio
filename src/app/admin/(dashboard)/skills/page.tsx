"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

export default function SkillsPage() {
  return (
    <ResourceManager
      title="Skills"
      subtitle="Manage your skills and proficiency."
      endpoint="/api/admin/skills"
      singular="Skill"
      fields={[
        { name: "name", label: "Skill", type: "text", inTable: true, placeholder: "e.g. React" },
        { name: "category", label: "Category", type: "text", inTable: true, placeholder: "Frontend" },
        { name: "level", label: "Level (0–100)", type: "number", inTable: true, placeholder: "80" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}
