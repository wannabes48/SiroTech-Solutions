import { adminPath } from "@/lib/hosts";
import React from "react";
import { notFound } from "next/navigation";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminLeadById } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LeadDetailClient } from "./LeadDetailClient";

export default async function AdminLeadDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffUser("leads:read");
  const { id } = await params;
  const lead = await getAdminLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title={lead.name}
        subtitle={`${lead.company || "Independent Client"} • Pipeline lead created on ${new Date(lead.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[
          { label: "Sales", href: adminPath("/leads") },
          { label: "Leads", href: adminPath("/leads") },
          { label: lead.name }
        ]}
      />

      <LeadDetailClient lead={lead} />
    </div>
  );
}
