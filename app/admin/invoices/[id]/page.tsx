import { adminPath } from "@/lib/hosts";
import React from "react";
import { notFound } from "next/navigation";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminInvoiceById } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InvoiceDetailStaffClient } from "./InvoiceDetailStaffClient";

export default async function AdminInvoiceDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffUser("invoices:read");
  const { id } = await params;
  const invoice = await getAdminInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title={`Invoice ${invoice.invoice_number}`}
        subtitle={`${invoice.org_name} • Issued on ${new Date(invoice.issue_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[
          { label: "Delivery", href: adminPath("/invoices") },
          { label: "Invoices", href: adminPath("/invoices") },
          { label: invoice.invoice_number }
        ]}
      />

      <InvoiceDetailStaffClient invoice={invoice} />
    </div>
  );
}
