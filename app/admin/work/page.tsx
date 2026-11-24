import React from "react";
import { requireStaffUser, can } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminWorkPage() {
  const staff = await requireStaffUser("content:read");
  const caseStudies = await getAdminContentList("work");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Case Studies &amp; Portfolio"
        subtitle="Detailed architectural writeups, client impact metrics, and technology breakdowns."
        breadcrumbs={[{ label: "Content" }, { label: "Case Studies" }]}
      />

      <ContentListManager
        type="work"
        canPublish={can(staff, "content:publish")}
        canDelete={can(staff, "content:delete")}
        typeName="Case Studies"
        items={caseStudies}
      />
    </div>
  );
}
