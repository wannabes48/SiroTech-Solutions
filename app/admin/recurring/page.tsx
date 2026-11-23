import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminRecurringPlans } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRecurringClient } from "./AdminRecurringClient";

export default async function AdminRecurringPage() {
  const staff = await requireStaffUser("invoices:read");
  const [plans, orgsRes, projectsRes] = await Promise.all([
    getAdminRecurringPlans(),
    query("SELECT id, name FROM organizations ORDER BY name ASC"),
    query("SELECT id, title, org_id FROM projects ORDER BY title ASC")
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Recurring Care Plans &amp; Retainers"
        subtitle="Manage ongoing client retainers, SLAs, automated billing cycles, next run schedules, and failure alerts."
        breadcrumbs={[{ label: "Delivery" }, { label: "Recurring" }]}
      />

      <AdminRecurringClient
        initialPlans={plans}
        organizations={orgsRes.rows}
        projects={projectsRes.rows}
        currentStaff={staff}
      />
    </div>
  );
}
