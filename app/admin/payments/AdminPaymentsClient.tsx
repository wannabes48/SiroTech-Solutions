"use client";

import { PRESETS, can, type PresetKey } from "@/lib/admin-permissions-client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { refundPaystackPaymentAction } from "@/app/admin/actions";
import {
  CreditCard,
  CheckCircle2,
  Building2,
  Download,
  AlertTriangle,
  RotateCcw,
  Check,
  Search,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  ShieldAlert,
  Lock,
  X,
  Receipt,
  Smartphone,
  Banknote,
  DollarSign,
  Zap
} from "lucide-react";

export function AdminPaymentsClient({
  initialPayments,
  pendingInvoices,
  currentStaff
}: {
  initialPayments: any[];
  pendingInvoices: any[];
  currentStaff?: any;
}) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [activeTab, setActiveTab] = useState<"ALL" | "PAYSTACK" | "BANK" | "REFUNDED" | "RECONCILE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Check if current user has refund privileges (Admin and Finance only)
  // Cosmetic only: refundPaystackPaymentAction checks payments:refund on the server.
  const userRole = currentStaff ? (PRESETS[currentStaff.preset as PresetKey]?.label ?? "Staff") : "Staff";
  const canRefund = can(currentStaff, "payments:refund");

  // Refund dialog state
  const [refundingPayment, setRefundingPayment] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundError, setRefundError] = useState<string | null>(null);

  // Success message toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filter payments
  const filtered = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.reference && p.reference.toLowerCase().includes(term)) ||
      (p.receipt_number && p.receipt_number.toLowerCase().includes(term)) ||
      (p.provider_tx_id && p.provider_tx_id.toLowerCase().includes(term)) ||
      (p.org_name && p.org_name.toLowerCase().includes(term)) ||
      (p.invoice_number && p.invoice_number.toLowerCase().includes(term)) ||
      p.method.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (activeTab === "ALL") return true;
    if (activeTab === "PAYSTACK") return p.method === "PAYSTACK";
    if (activeTab === "BANK") return p.method === "BANK" || p.method === "CASH";
    if (activeTab === "REFUNDED") return p.status === "REFUNDED";
    return true;
  });

  // Calculate Monthly Metrics
  const currentMonthDate = new Date();
  const currentMonth = currentMonthDate.getMonth();
  const currentYear = currentMonthDate.getFullYear();

  const thisMonthPayments = payments.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const thisMonthSettledTotal = thisMonthPayments
    .filter((p) => p.status !== "REFUNDED")
    .reduce((acc, curr) => acc + (Number(curr.amount_kes) || 0), 0);

  const thisMonthPaystackTotal = thisMonthPayments
    .filter((p) => p.method === "PAYSTACK" && p.status !== "REFUNDED")
    .reduce((acc, curr) => acc + (Number(curr.amount_kes) || 0), 0);

  const thisMonthBankTotal = thisMonthPayments
    .filter((p) => (p.method === "BANK" || p.method === "CASH") && p.status !== "REFUNDED")
    .reduce((acc, curr) => acc + (Number(curr.amount_kes) || 0), 0);

  const refundedPayments = payments.filter((p) => p.status === "REFUNDED");
  const refundedTotal = refundedPayments.reduce((acc, curr) => acc + (Number(curr.amount_kes) || 0), 0);

  // Overall totals for reconcile tab
  const paystackTotal = payments.filter((p) => p.method === "PAYSTACK").reduce((acc, curr) => acc + (Number(curr.amount_kes) || 0), 0);
  const bankTotal = payments.filter((p) => p.method === "BANK" || p.method === "CASH").reduce((acc, curr) => acc + (Number(curr.amount_kes) || 0), 0);
  const grandTotal = paystackTotal + bankTotal;


  // Execute Paystack / payment refund
  const handleConfirmRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingPayment) return;
    if (!refundReason.trim()) {
      setRefundError("Please provide an audit justification reason for this refund.");
      return;
    }

    startTransition(async () => {
      setRefundError(null);
      const res = await refundPaystackPaymentAction({
        paymentId: refundingPayment.id,
        amountKes: Number(refundingPayment.amount_kes),
        reason: refundReason.trim()
      });

      if (res.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === refundingPayment.id
              ? {
                  ...p,
                  status: "REFUNDED",
                  refund_reason: refundReason.trim(),
                  refunded_by: currentStaff?.name || currentStaff?.email || "Admin",
                  refunded_at: new Date().toISOString()
                }
              : p
          )
        );
        showToast(
          `Refund of KES ${Number(refundingPayment.amount_kes).toLocaleString()} processed and logged in audit.`
        );
        setRefundingPayment(null);
        setRefundReason("");
        router.refresh();
      } else {
        setRefundError(res.error || "Failed to execute refund.");
      }
    });
  };

  // Export CSV for accounting
  const handleExportCSV = () => {
    const headers = [
      "Reference_Code",
      "Receipt_Number",
      "Payment_Method",
      "Client_Organization",
      "Invoice_Number",
      "Amount_KES",
      "Status",
      "Refund_Reason",
      "Refunded_By",
      "Settlement_Date"
    ];
    const rows = payments.map((p) => [
      `"${p.reference || ""}"`,
      `"${p.receipt_number || p.provider_tx_id || ""}"`,
      p.method,
      `"${(p.org_name || "").replace(/"/g, '""')}"`,
      p.invoice_number || "Direct Deposit",
      p.amount_kes,
      p.status || "SETTLED",
      `"${(p.refund_reason || "").replace(/"/g, '""')}"`,
      `"${(p.refunded_by || "").replace(/"/g, '""')}"`,
      p.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sirotech_payments_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white font-medium text-xs flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Monthly Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">This Month Settled</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
              Active
            </span>
          </div>
          <div className="text-2xl font-bold text-ink">
            KES {thisMonthSettledTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted">
            {thisMonthPayments.length} transactions settled this calendar month
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Paystack Settlements</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900">
              Paystack
            </span>
          </div>
          <div className="text-2xl font-bold text-cyan-900">
            KES {thisMonthPaystackTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted">
            {thisMonthSettledTotal > 0
              ? `${((thisMonthPaystackTotal / thisMonthSettledTotal) * 100).toFixed(1)}% of month volume`
              : "0% of month volume"}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Bank Direct &amp; Wire</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
              EFT / RTGS
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            KES {thisMonthBankTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted">
            {thisMonthSettledTotal > 0
              ? `${((thisMonthBankTotal / thisMonthSettledTotal) * 100).toFixed(1)}% of month volume`
              : "0% of month volume"}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Refunds &amp; Disputed</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
              Audit
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700">
            KES {refundedTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted">
            {refundedPayments.length} total payments reversed
          </div>
        </div>
      </div>

      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === "ALL"
                ? "bg-[#1B2E24] text-white"
                : "bg-white border border-rule text-muted hover:text-ink"
            }`}
          >
            All Settlements ({payments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PAYSTACK")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === "PAYSTACK"
                ? "bg-emerald-800 text-white"
                : "bg-white border border-rule text-emerald-900 hover:bg-emerald-50"
            }`}
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Paystack ({payments.filter((p) => p.method === "PAYSTACK").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("BANK")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === "BANK"
                ? "bg-blue-800 text-white"
                : "bg-white border border-rule text-blue-900 hover:bg-blue-50"
            }`}
          >
            Direct Bank Wire ({payments.filter((p) => p.method === "BANK" || p.method === "CASH").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("REFUNDED")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === "REFUNDED"
                ? "bg-amber-800 text-white"
                : "bg-white border border-rule text-amber-900 hover:bg-amber-50"
            }`}
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Refunds ({refundedPayments.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("RECONCILE")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === "RECONCILE"
                ? "bg-[#1B2E24] text-white"
                : "bg-white border border-rule text-muted hover:text-ink"
            }`}
          >
            Reconciliation View
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== "RECONCILE" && (
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Reconcile by ref, receipt, org..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="py-1.5 px-3.5 rounded-full bg-white border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV for Accounting</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Settlements Table */}
      {activeTab !== "RECONCILE" && (
        <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Reference / Receipt</th>
                  <th className="py-3 px-6">Client / Org</th>
                  <th className="py-3 px-6">Matched Invoice</th>
                  <th className="py-3 px-6">Gateway Method</th>
                  <th className="py-3 px-6">Amount (KES)</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Settlement Date</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {filtered.length > 0 ? (
                  filtered.map((p: any) => {
                    const isRefunded = p.status === "REFUNDED";

                    return (
                      <tr key={p.id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-mono font-bold text-ink">{p.reference}</div>
                          {(p.receipt_number || p.provider_tx_id) && (
                            <div className="text-[10px] font-mono text-muted flex items-center gap-1 mt-0.5">
                              <Receipt className="w-3 h-3 text-muted" />
                              <span>{p.receipt_number || p.provider_tx_id}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6 font-medium text-ink">
                          {p.org_name || "Direct Client"}
                        </td>

                        <td className="py-4 px-6 font-mono">
                          {p.invoice_id ? (
                            <Link
                              href={adminPath(`/invoices/${p.invoice_id}`)}
                              className="text-emerald-800 hover:underline font-semibold"
                            >
                              {p.invoice_number || "View Invoice"}
                            </Link>
                          ) : (
                            <span className="text-muted">Unassigned Direct Deposit</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {p.method === "PAYSTACK" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase inline-flex items-center gap-1">
                              <Zap className="w-3 h-3 text-emerald-700" />
                              <span>Paystack</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-rule text-ink uppercase">
                              {p.method}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 font-bold text-ink font-mono">
                          KES {Number(p.amount_kes).toLocaleString()}
                        </td>

                        <td className="py-4 px-6">
                          {isRefunded ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-200">
                                <RotateCcw className="w-3 h-3 text-red-600" />
                                Refunded
                              </span>
                              {p.refunded_by && (
                                <div className="text-[10px] text-muted mt-0.5">
                                  by {p.refunded_by}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Settled
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-muted">
                          {new Date(p.created_at).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short"
                          })}
                        </td>

                        <td className="py-4 px-6 text-right">
                          {!isRefunded && (
                            <div className="inline-flex items-center gap-1">
                              {canRefund ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRefundingPayment(p);
                                    setRefundReason("");
                                    setRefundError(null);
                                  }}
                                  className="px-2.5 py-1 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Refund settlement (Admin & Finance Only)"
                                >
                                  <RotateCcw className="w-3 h-3 text-red-600" />
                                  <span>Refund</span>
                                </button>
                              ) : (
                                <span
                                  className="px-2.5 py-1 rounded-full bg-surface border border-rule text-muted text-[10px] inline-flex items-center gap-1 cursor-not-allowed"
                                  title="Refund restricted to Admin and Finance roles only"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Refund Locked</span>
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted">
                      No matching settlements found. Try reconciling by reference or receipt code.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reconciliation View */}
      {activeTab === "RECONCILE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-muted">Total All-Time Settled</span>
              <div className="text-xl font-bold text-ink">KES {grandTotal.toLocaleString()}</div>
              <div className="text-[10px] text-muted">Across all payment channels</div>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-muted">Paystack Gateway (Cards &amp; M-Pesa)</span>
              <div className="text-xl font-bold text-emerald-800">
                KES {paystackTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted">
                {((paystackTotal / Math.max(grandTotal, 1)) * 100).toFixed(1)}% of total volume
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-muted">Bank Direct &amp; Wire</span>
              <div className="text-xl font-bold text-blue-900">
                KES {bankTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted">
                {((bankTotal / Math.max(grandTotal, 1)) * 100).toFixed(1)}% of total volume
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paystack Refund Confirmation Dialog (Admin & Finance Only) */}
      {refundingPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Confirm Paystack / Gateway Refund</span>
              </div>
              <button
                type="button"
                onClick={() => setRefundingPayment(null)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 leading-relaxed">
              <strong>Admin &amp; Finance Security Notice:</strong> You are about to initiate an official
              gateway reversal of{" "}
              <strong className="font-mono">
                KES {Number(refundingPayment.amount_kes).toLocaleString()}
              </strong>{" "}
              for reference <strong className="font-mono">{refundingPayment.reference}</strong>.
              This action updates the invoice status to REFUNDED and creates an immutable audit trail.
            </div>

            <form onSubmit={handleConfirmRefund} className="space-y-4 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl bg-surface/70 border border-rule/60">
                <div className="flex justify-between">
                  <span className="text-muted">Client / Organization:</span>
                  <span className="font-semibold text-ink">{refundingPayment.org_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Associated Invoice:</span>
                  <span className="font-mono font-semibold text-ink">
                    {refundingPayment.invoice_number || "Direct Deposit"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Gateway Method:</span>
                  <span className="font-bold text-ink">{refundingPayment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Authorized By:</span>
                  <span className="font-semibold text-ink">
                    {currentStaff?.name || currentStaff?.email} ({userRole})
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">
                  Refund Reason / Audit Justification *
                </label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Client requested contract amendment; duplicate Paystack charge reversal authorized by Finance."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {refundError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {refundError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundingPayment(null)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Execute Refund</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
