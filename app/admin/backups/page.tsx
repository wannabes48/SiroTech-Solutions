import { adminPath } from "@/lib/hosts";
import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminBackups } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminBackupsClient } from "./AdminBackupsClient";

export default async function AdminBackupsPage() {
  await requireStaffUser("backups:export");
  const backups = await getAdminBackups();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Backups & Disaster Recovery"
        subtitle="Automated daily pg_dump snapshots, zero-knowledge encryption, and table data exports."
        breadcrumbs={[
          { label: "Admin", href: adminPath() },
          { label: "System", href: adminPath("/health") },
          { label: "Backups" }
        ]}
      />

      <AdminBackupsClient initialBackups={backups} />
    </div>
  );
}
