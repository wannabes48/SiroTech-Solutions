import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminLeads } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminLeadsClient } from "./AdminLeadsClient";

export default async function AdminLeadsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireStaffUser("leads:read");
  const params = await searchParams;
  const leads = await getAdminLeads(params.status);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Leads &amp; Sales Pipeline"
        subtitle="Manage client acquisition from initial marketing inquiry to qualified scope and onboarding conversion."
        breadcrumbs={[{ label: "Sales" }, { label: "Leads" }]}
      />

      <AdminLeadsClient initialLeads={leads} currentStatus={params.status || "ALL"} />
    </div>
  );
}
