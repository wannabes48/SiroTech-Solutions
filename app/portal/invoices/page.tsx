import React from "react";
import Link from "next/link";
import { ReceiptText, CreditCard, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getPortalInvoices } from "@/lib/portal-db";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { StatCard } from "@/components/portal/shared/StatCard";
import { InvoiceRow } from "@/components/portal/shared/InvoiceRow";
import { EmptyState } from "@/components/portal/shared/EmptyState";

export default async function InvoicesListPage() {
  const user = await requireUser();
  const dbInvoices = await getPortalInvoices(user.orgId);

  const invoices = dbInvoices.map((inv: any) => ({
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    projectTitle: inv.project_title,
    date: new Date(inv.issue_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    dueDate: new Date(inv.due_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    amountKES: Number(inv.amount_kes),
    amountUSD: Number(inv.amount_usd),
    status: inv.status === "PAID" ? "Done" : "Waiting for you",
    rawStatus: inv.status,
    items: inv.items || [],
  }));

  const unpaidInvoices = invoices.filter((i: any) => i.rawStatus !== "PAID");
  const paidInvoices = invoices.filter((i: any) => i.rawStatus === "PAID");

  const totalOutstandingKES = unpaidInvoices.reduce((acc: number, curr: any) => acc + curr.amountKES, 0);
  const totalOutstandingUSD = unpaidInvoices.reduce((acc: number, curr: any) => acc + curr.amountUSD, 0);
  const totalSettledKES = paidInvoices.reduce((acc: number, curr: any) => acc + curr.amountKES, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Invoices & Billing"
        subtitle="Review milestone statements, download tax receipts, and settle securely via Paystack (Card, M-Pesa, or Bank Transfer)."
        badge={user.orgName}
      />

      {/* Financial Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Financial Summary">
        <StatCard
          label="Total Outstanding (KES)"
          value={`KES ${totalOutstandingKES.toLocaleString()}`}
          subtext="Active milestone invoices awaiting settlement"
          badge={{ text: `${unpaidInvoices.length} Pending`, variant: "amber" }}
          icon={ReceiptText}
        />

        <StatCard
          label="Total Outstanding (USD)"
          value={`$${totalOutstandingUSD.toLocaleString()} USD`}
          subtext="Standard international billing"
          badge={{ text: "KES / USD Dual Currency", variant: "sage" }}
          icon={CreditCard}
        />

        <StatCard
          label="Total Paid to Date"
          value={`KES ${totalSettledKES.toLocaleString()}`}
          subtext="Settled milestones with recorded audit references"
          badge={{ text: "Reconciled", variant: "emerald" }}
          icon={CheckCircle2}
        />
      </section>

      {/* Invoice List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-ink">
            Issued Statements ({invoices.length})
          </h2>
          <span className="text-xs text-muted">All amounts in minor units / KES & USD</span>
        </div>

        {invoices.length === 0 ? (
          <EmptyState
            title="No invoices issued yet"
            sentence="Invoices are generated upon milestone completion or sprint initialization."
          />
        ) : (
          <div className="space-y-3">
            {invoices.map((inv: any) => (
              <InvoiceRow key={inv.id} invoice={inv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
