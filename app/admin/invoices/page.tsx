import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getScopeSet, filterByScope, enforceScope } from "@/lib/admin-scope";

import { getAdminInvoices } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminInvoicesClient } from "./AdminInvoicesClient";

export default async function AdminInvoicesPage() {
  const staff = await requireStaffUser("invoices:read");
  const [allInvoices, orgsRes] = await Promise.all([
    getAdminInvoices(),
    query("SELECT id, name FROM organizations ORDER BY name ASC")
  ]);
  const scope = await getScopeSet(staff);
  const invoices = filterByScope(allInvoices, scope, { project: "project_id", org: "org_id" });
  orgsRes.rows = filterByScope(orgsRes.rows, scope, { org: "id" });
  // Milestones that can be billed; unapproved ones are listed but can't be picked.
  const milestones = filterByScope(
    await query(
      `SELECT m.id, m.title, m.status::text AS status, COALESCE(m.ready_to_bill, false) AS ready_to_bill,
              p.id AS project_id, p.title AS project_title, p.org_id
       FROM milestones m JOIN projects p ON p.id = m.project_id
       WHERE p.status::text NOT IN ('REQUESTED', 'COMPLETE')
       ORDER BY p.title, m.order_num`
    ).then((r) => r.rows).catch(() => []),
    scope,
    { project: "project_id" }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Invoices &amp; Revenue Billing"
        subtitle="Manage billing cycles, manual payment settlements, tax compliance receipts, and overdue tracking."
        breadcrumbs={[{ label: "Delivery" }, { label: "Invoices" }]}
      />

      <AdminInvoicesClient initialInvoices={invoices} organizations={orgsRes.rows} milestones={milestones} />
    </div>
  );
}
