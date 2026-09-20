"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

export default function EducationPage() {
  return (
    <ResourceManager
      title="Education"
      subtitle="Manage your education history."
      endpoint="/api/admin/education"
      singular="Education"
      fields={[
        { name: "institution", label: "Institution", type: "text", inTable: true, placeholder: "University name" },
        { name: "degree", label: "Degree", type: "text", inTable: true, placeholder: "B.Sc." },
        { name: "field", label: "Field of study", type: "text", inTable: true, placeholder: "Computer Science" },
        { name: "start_date", label: "Start date", type: "text", placeholder: "2021" },
        { name: "end_date", label: "End date", type: "text", inTable: true, placeholder: "2025" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}
