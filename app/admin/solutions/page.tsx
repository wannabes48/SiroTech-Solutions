import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminSolutionsPage() {
  await requireStaffUser("content:publish");
  const solutions = await getAdminContentList("solution");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Solutions Catalog"
        subtitle="Turnkey domain solutions engineered for enterprise operations and logistics."
        breadcrumbs={[{ label: "Content" }, { label: "Solutions" }]}
      />

      <ContentListManager
        type="solution"
        typeName="Solutions"
        items={solutions}
      />
    </div>
  );
}
