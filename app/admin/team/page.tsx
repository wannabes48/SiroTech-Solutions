import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminTeamPage() {
  await requireStaffUser("content:read");
  const team = await getAdminContentList("team");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Engineering Leadership &amp; Team"
        subtitle="Manage engineering team profiles, leadership biographies, and specialty credentials."
        breadcrumbs={[{ label: "Content" }, { label: "Team" }]}
      />

      <ContentListManager
        type="team"
        typeName="Team Members"
        items={team}
      />
    </div>
  );
}
