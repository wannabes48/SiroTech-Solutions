import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminInvoices } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminInvoicesClient } from "./AdminInvoicesClient";

export default async function AdminInvoicesPage() {
  await requireStaffUser("invoices:read");
  const [invoices, orgsRes] = await Promise.all([
    getAdminInvoices(),
    query("SELECT id, name FROM organizations ORDER BY name ASC")
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Invoices &amp; Revenue Billing"
        subtitle="Manage billing cycles, manual payment settlements, tax compliance receipts, and overdue tracking."
        breadcrumbs={[{ label: "Delivery" }, { label: "Invoices" }]}
      />

      <AdminInvoicesClient initialInvoices={invoices} organizations={orgsRes.rows} />
    </div>
  );
}
