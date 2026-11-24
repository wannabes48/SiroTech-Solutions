import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminIndustriesPage() {
  await requireStaffUser("content:publish");
  const industries = await getAdminContentList("industry");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Industry Verticals"
        subtitle="Manage industry domains, compliance frameworks, and sector case studies."
        breadcrumbs={[{ label: "Content" }, { label: "Industries" }]}
      />

      <ContentListManager
        type="industry"
        typeName="Industries"
        items={industries}
      />
    </div>
  );
}
