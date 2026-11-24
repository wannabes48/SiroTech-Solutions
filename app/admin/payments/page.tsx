import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getPendingApprovalsFor } from "@/lib/approvals";
import { getScopeSet, filterByScope, enforceScope } from "@/lib/admin-scope";

import { getAdminPayments } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPaymentsClient } from "./AdminPaymentsClient";

export default async function AdminPaymentsPage() {
  const staff = await requireStaffUser("payments:read");
  const [allPayments, invoicesRes] = await Promise.all([
    getAdminPayments(),
    query(`
      SELECT inv.id, inv.invoice_number, inv.amount_kes, o.name AS org_name, inv.org_id, inv.project_id
      FROM invoices inv
      INNER JOIN organizations o ON o.id = inv.org_id
      WHERE inv.status = 'SENT' OR inv.status = 'OVERDUE' OR inv.status = 'VIEWED'
      ORDER BY inv.due_date ASC
    `)
  ]);
  const scope = await getScopeSet(staff);
  const payments = filterByScope(
    allPayments.map((p: any) => ({ ...p, scope_org_id: p.invoice_org_id || p.org_id })),
    scope,
    { project: "invoice_project_id", org: "scope_org_id" }
  );
  invoicesRes.rows = filterByScope(invoicesRes.rows, scope, { project: "project_id", org: "org_id" });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Payment &amp; Transaction Ledger"
        subtitle="Complete record of inbound customer settlements across Paystack, M-Pesa Daraja, card gateways, and direct bank wires."
        breadcrumbs={[{ label: "Delivery" }, { label: "Payments" }]}
      />

      <AdminPaymentsClient
        initialPayments={payments}
        pendingInvoices={invoicesRes.rows}
        currentStaff={staff}
        pendingRefundIds={(await getPendingApprovalsFor("payment", payments.map((p: any) => p.id))).map((a) => a.entity_id)}
      />
    </div>
  );
}
