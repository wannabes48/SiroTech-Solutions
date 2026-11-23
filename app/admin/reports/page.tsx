import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReportsExportClient } from "./ReportsExportClient";
import { getAdminReportStats } from "@/lib/admin-db";

export default async function AdminReportsPage() {
  await requireStaffUser("reports:read");

  const stats = await getAdminReportStats();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Reports &amp; Data Exports"
        subtitle="Export financial statements, VAT ledgers, audit records, sprint delivery logs, and support metrics as RFC 4180 CSV."
        breadcrumbs={[{ label: "Insights" }, { label: "Reports" }]}
      />

      <ReportsExportClient stats={stats} />
    </div>
  );
}
