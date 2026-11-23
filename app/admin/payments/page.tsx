import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminPayments } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPaymentsClient } from "./AdminPaymentsClient";

export default async function AdminPaymentsPage() {
  const staff = await requireStaffUser("payments:read");
  const [payments, invoicesRes] = await Promise.all([
    getAdminPayments(),
    query(`
      SELECT inv.id, inv.invoice_number, inv.amount_kes, o.name AS org_name
      FROM invoices inv
      INNER JOIN organizations o ON o.id = inv.org_id
      WHERE inv.status = 'SENT' OR inv.status = 'OVERDUE' OR inv.status = 'VIEWED'
      ORDER BY inv.due_date ASC
    `)
  ]);

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
      />
    </div>
  );
}
