import { adminPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminCareersPage() {
  await requireStaffUser("careers:read");
  const jobs = await getAdminContentList("career");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Careers &amp; Engineering Roles"
        subtitle="Manage job openings, experience criteria, compensation bands, and candidate pipelines."
        breadcrumbs={[{ label: "Content" }, { label: "Careers" }]}
        secondaryAction={{
          label: "View Applications",
          href: adminPath("/applications")
        }}
      />

      <ContentListManager
        type="career"
        typeName="Job Openings"
        items={jobs}
      />
    </div>
  );
}
