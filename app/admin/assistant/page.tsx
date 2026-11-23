import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminAssistantData } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AssistantControlClient } from "./AssistantControlClient";

export default async function AdminAssistantPage() {
  await requireStaffUser("assistant:read");
  const data = await getAdminAssistantData();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="AI Assistant Governance &amp; Telemetry"
        subtitle="Manage Claude assistant killswitch, model routing allowlist, live knowledge base previews, usage and quality metrics, and interactive test console."
        breadcrumbs={[{ label: "Site" }, { label: "Assistant Management" }]}
      />

      <AssistantControlClient 
        config={JSON.parse(JSON.stringify(data.config))} 
        knowledgePreview={JSON.parse(JSON.stringify(data.knowledgePreview))}
        usage={JSON.parse(JSON.stringify(data.usage))}
        quality={JSON.parse(JSON.stringify(data.quality))}
        evals={JSON.parse(JSON.stringify(data.evals))} 
        kbCounts={data.kbCounts} 
      />
    </div>
  );
}
