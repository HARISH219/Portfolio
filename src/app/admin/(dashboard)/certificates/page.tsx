"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

export default function CertificatesPage() {
  return (
    <ResourceManager
      title="Certificates"
      subtitle="Manage your certifications and credentials."
      endpoint="/api/admin/certificates"
      singular="Certificate"
      fields={[
        { name: "title", label: "Title", type: "text", inTable: true, placeholder: "Certificate name" },
        { name: "issuer", label: "Issuer", type: "text", inTable: true, placeholder: "e.g. Coursera" },
        { name: "date", label: "Date", type: "text", inTable: true, placeholder: "2025" },
        { name: "url", label: "Certificate URL", type: "url", placeholder: "https://..." },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}
