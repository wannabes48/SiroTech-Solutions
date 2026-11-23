import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminAuditLogs } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAuditClient } from "./AdminAuditClient";

export default async function AdminAuditPage() {
  await requireStaffUser("audit:read");
  const logs = await getAdminAuditLogs(100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Immutable Operational Audit Log"
        subtitle="Cryptographically sealed log of administrative mutations, auth events, and data access records with mutation diff inspection and CSV export."
        breadcrumbs={[{ label: "System" }, { label: "Audit Log" }]}
      />

      <AdminAuditClient initialLogs={JSON.parse(JSON.stringify(logs))} />
    </div>
  );
}
