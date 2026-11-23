import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import { getAdminBackups } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminHealthClient } from "./AdminHealthClient";

export default async function AdminHealthPage() {
  await requireStaffUser("system:read");

  const start = Date.now();
  let dbLatency = 0;
  try {
    await query("SELECT 1");
    dbLatency = Date.now() - start;
  } catch {
    dbLatency = 999;
  }

  const memoryUsage = process.memoryUsage();
  const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(1);
  const heapTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(1);

  const backups = await getAdminBackups();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="System Health, Backups &amp; Disaster Recovery"
        subtitle="Upstream infrastructure telemetry, automated AES-256 database snapshots, and full disaster recovery archives."
        breadcrumbs={[{ label: "System" }, { label: "Health" }]}
      />

      <AdminHealthClient
        dbLatencyMs={dbLatency}
        heapUsedMB={heapUsedMB}
        heapTotalMB={heapTotalMB}
        initialBackups={JSON.parse(JSON.stringify(backups))}
      />
    </div>
  );
}
