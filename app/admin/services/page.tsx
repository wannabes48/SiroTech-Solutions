import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminServicesPage() {
  await requireStaffUser("content:publish");
  const services = await getAdminContentList("service");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Services Catalog"
        subtitle="Manage engineering services, technical deliverables, and SEO discovery tags."
        breadcrumbs={[{ label: "Content" }, { label: "Services" }]}
      />

      <ContentListManager
        type="service"
        typeName="Services"
        items={services}
      />
    </div>
  );
}
