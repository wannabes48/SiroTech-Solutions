"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { createAdminInvoiceAction } from "@/app/admin/actions";
import {
  Receipt,
  Plus,
  ArrowRight,
  DollarSign,
  Search,
  Download,
  Trash2,
  Loader2,
  Calendar,
  RefreshCw
} from "lucide-react";

export function AdminInvoicesClient({
  initialInvoices,
  organizations,
  milestones = []
}: {
  initialInvoices: any[];
  organizations: any[];
  milestones?: { id: string; title: string; status: string; ready_to_bill: boolean; project_title: string; org_id: string }[];
}) {
  const [milestoneId, setMilestoneId] = useState("");
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // New Invoice Form state
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id || "");
  const [currency, setCurrency] = useState<"KES" | "USD" | "CAD">("KES");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [discountKes, setDiscountKes] = useState(0);
  const [lineItems, setLineItems] = useState([
    { description: "Sprint Milestone Engineering Deliverable", quantity: 1, unitPrice: 150000 }
  ]);

  const statuses = ["ALL", "DRAFT", "SENT", "PAID", "OVERDUE", "VOID", "REFUNDED"];

  const filtered = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(term) ||
      (inv.org_name && inv.org_name.toLowerCase().includes(term));
    if (!matchesSearch) return false;
    if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
    return true;
  });

  const handleAddLineItem = () => {
    setLineItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 50000 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = lineItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const taxable = Math.max(0, subtotal - discountKes);
  const taxKes = Math.round(taxable * 0.16);
  const totalKes = taxable + taxKes;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || lineItems.length === 0) return;
    setFormError(null);

    startTransition(async () => {
      try {
        const res = await createAdminInvoiceAction({
          orgId: selectedOrgId,
          lineItems,
          currency,
          dueDate,
          discountKes: Number(discountKes),
          milestoneId: milestoneId || undefined
        });

        if (res?.success && res.invoiceId) {
          setShowCreateModal(false);
          router.push(adminPath(`/invoices/${res.invoiceId}`));
        } else if ((res as any)?.error) {
          setFormError((res as any).error);
        }
      } catch (err: any) {
        setFormError(err.message || "Failed to create invoice.");
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ["Invoice_Number", "Client_Organization", "Issue_Date", "Due_Date", "Amount_KES", "Status"];
    const rows = filtered.map((inv) => [
      inv.invoice_number,
      `"${(inv.org_name || "").replace(/"/g, '""')}"`,
      inv.issue_date,
      inv.due_date,
      inv.amount_kes,
      inv.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sirotech_invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#1B2E24] text-white"
                  : "bg-white border border-rule text-muted hover:text-ink"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoice number, client..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 rounded-full bg-white border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Export Invoices to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <Link
            href={adminPath("/recurring")}
            className="p-2 sm:px-3.5 py-1.5 rounded-full bg-white border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
            title="Manage Recurring Care Plans & Retainers"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Recurring Retainers</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="py-1.5 px-3.5 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Invoice Number</th>
                <th className="py-3 px-6">Client Organization</th>
                <th className="py-3 px-6">Issue Date</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Amount (KES)</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {filtered.length > 0 ? (
                filtered.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-ink font-mono">
                      <Link href={adminPath(`/invoices/${inv.id}`)} className="hover:text-emerald-700">
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-medium text-ink">{inv.org_name}</td>
                    <td className="py-4 px-6 text-muted">{new Date(inv.issue_date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-muted">{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 font-bold text-ink font-mono">
                      KES {Number(inv.amount_kes || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <AdminStatusPill status={inv.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={adminPath(`/invoices/${inv.id}`)}
                        className="p-1 rounded-lg text-muted hover:text-ink inline-block"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted">
                    No invoices matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">Issue Tax Invoice</h3>
                <p className="text-xs text-muted">16% VAT auto-calculated per statutory revenue rules.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-ink text-xs font-semibold cursor-pointer"
              >
                &times; Close
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-ink block mb-1">Client Organization</label>
                  <select
                    required
                    value={selectedOrgId}
                    onChange={(e) => {
                      setSelectedOrgId(e.target.value);
                      setMilestoneId("");
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                {milestones.some((m) => m.org_id === selectedOrgId) && (
                  <div className="sm:col-span-3">
                    <label className="font-semibold text-ink block mb-1">Bill a milestone (optional)</label>
                    <select
                      value={milestoneId}
                      onChange={(e) => setMilestoneId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                    >
                      <option value="">Not linked to a milestone</option>
                      {milestones
                        .filter((m) => m.org_id === selectedOrgId)
                        .map((m) => {
                          const billable = m.status === "APPROVED" || m.ready_to_bill;
                          return (
                            <option key={m.id} value={m.id} disabled={!billable}>
                              {m.project_title}: {m.title} {billable ? (m.status === "APPROVED" ? "(approved)" : "(ready to bill)") : "(waiting for approval)"}
                            </option>
                          );
                        })}
                    </select>
                    <p className="text-muted mt-1">Milestones can be billed once the client approves them or delivery marks them Ready to bill.</p>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-ink block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2 border-t border-rule/60">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Description..."
                        value={item.description}
                        onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-surface border border-rule text-xs"
                      />
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, "quantity", Number(e.target.value))}
                        className="w-16 px-2 py-1.5 rounded-xl bg-surface border border-rule text-xs text-center font-mono"
                      />
                      <input
                        type="number"
                        required
                        step="1000"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(idx, "unitPrice", Number(e.target.value))}
                        className="w-28 px-2 py-1.5 rounded-xl bg-surface border border-rule text-xs font-mono"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1.5 text-muted hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="p-4 rounded-2xl bg-surface/50 border border-rule/60 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal:</span>
                  <span className="font-mono font-semibold">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">16% Statutory VAT:</span>
                  <span className="font-mono font-semibold">KES {taxKes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-ink pt-1.5 border-t border-rule/40">
                  <span>Total Due:</span>
                  <span className="font-mono text-emerald-800">KES {totalKes.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
                  <span>Issue &amp; Send Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
