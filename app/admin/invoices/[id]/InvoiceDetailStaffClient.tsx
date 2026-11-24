"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  recordManualPaymentAction,
  voidInvoiceAction,
  refundInvoiceAction,
  generatePaystackInvoiceLinkAction,
  requestApprovalAction,
} from "@/app/admin/actions";
import {
  Receipt,
  CreditCard,
  Ban,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Building2,
  Clock,
  Calendar,
  Zap,
  Copy,
  Check,
  ExternalLink,
  X,
} from "lucide-react";

export interface InvoicePerms {
  void: boolean;
  refund: boolean;
  markPaid: boolean;
  send: boolean;
}

const ALL_INVOICE_PERMS: InvoicePerms = { void: true, refund: true, markPaid: true, send: true };

export function InvoiceDetailStaffClient({
  invoice,
  perms = ALL_INVOICE_PERMS,
  pendingApprovals = []
}: {
  invoice: any;
  /** Without void/refund the buttons become "Request approval". The server checks either way. */
  perms?: InvoicePerms;
  pendingApprovals?: { action: string; requested_by_name: string | null; created_at: string }[];
}) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const pendingVoid = pendingApprovals.find((a) => a.action === "void_invoice");
  const pendingRefund = pendingApprovals.find((a) => a.action === "refund_invoice");
  const [modalMode, setModalMode] = useState<"PAYMENT" | "VOID" | "REFUND" | null>(null);

  // Form states
  const [payAmount, setPayAmount] = useState(invoice.amount_kes || 0);
  const [payMethod, setPayMethod] = useState("PAYSTACK");
  const [payRef, setPayRef] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(invoice.amount_kes || 0);
  const [refundReason, setRefundReason] = useState("");

  // Paystack Link Modal
  const [paystackLinkModal, setPaystackLinkModal] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleGeneratePaystackLink = async () => {
    setIsGeneratingLink(true);
    try {
      const res = await generatePaystackInvoiceLinkAction(invoice.id);
      if (res?.authorizationUrl) {
        setPaystackLinkModal(res.authorizationUrl);
      } else {
        alert(res?.error || "Failed to generate Paystack link.");
      }
    } catch (err: any) {
      alert(err.message || "Error generating link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await recordManualPaymentAction(
        invoice.id,
        Number(payAmount),
        payMethod,
        payRef || `MAN-${Date.now()}`
      );
      if (res?.success) {
        setModalMode(null);
        router.refresh();
      }
    });
  };

  const finish = (res: any, okNotice?: string) => {
    if (res?.error) {
      setActionError(res.error);
      return;
    }
    setActionError(null);
    setModalMode(null);
    if (okNotice) setNotice(okNotice);
    router.refresh();
  };

  const handleVoid = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (perms.void) finish(await voidInvoiceAction(invoice.id, voidReason));
      else
        finish(
          await requestApprovalAction({ action: "void_invoice", entityId: invoice.id, reason: voidReason }),
          "Approval requested. You'll be notified when an owner decides."
        );
    });
  };

  const handleRefund = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (perms.refund) finish(await refundInvoiceAction(invoice.id, Number(refundAmount), refundReason));
      else
        finish(
          await requestApprovalAction({ action: "refund_invoice", entityId: invoice.id, reason: refundReason, amountKes: Number(refundAmount) }),
          "Refund approval requested. You'll be notified when an owner decides."
        );
    });
  };

  return (
    <div className="space-y-8">
      {(notice || pendingApprovals.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          {notice && <p className="font-semibold">{notice}</p>}
          {pendingApprovals.map((a) => (
            <p key={a.action}>
              {a.action === "void_invoice" ? "Void" : "Refund"} approval requested
              {a.requested_by_name ? ` by ${a.requested_by_name}` : ""} on {new Date(a.created_at).toLocaleDateString()} and waiting for an owner.
            </p>
          ))}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AdminStatusPill status={invoice.status} />
          <span className="text-xs text-muted">
            Due {new Date(invoice.due_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status !== "PAID" && invoice.status !== "VOID" && (
            <>
              <button
                type="button"
                hidden={!perms.send}
                onClick={handleGeneratePaystackLink}
                disabled={isGeneratingLink}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              >
                {isGeneratingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" /> : <Zap className="w-3.5 h-3.5 text-emerald-700" />}
                <span>Paystack Payment Link</span>
              </button>

              <button
                type="button"
                hidden={!perms.markPaid}
                onClick={() => setModalMode("PAYMENT")}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            </>
          )}

          {invoice.status === "PAID" && (
            <button
              type="button"
              disabled={Boolean(pendingRefund)}
              onClick={() => { setActionError(null); setModalMode("REFUND"); }}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-rule hover:bg-surface text-ink transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{pendingRefund ? "Refund requested" : perms.refund ? "Issue Refund" : "Request refund"}</span>
            </button>
          )}

          {invoice.status !== "VOID" && invoice.status !== "PAID" && (
            <button
              type="button"
              disabled={Boolean(pendingVoid)}
              onClick={() => { setActionError(null); setModalMode("VOID"); }}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{pendingVoid ? "Void requested" : perms.void ? "Void Invoice" : "Request void"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Line Items & VAT (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-ink">Invoice Line Items</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Item Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit (KES)</th>
                    <th className="py-2.5 px-4 text-right">Total (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((it: any) => (
                      <tr key={it.id}>
                        <td className="py-3 px-4 font-medium text-ink">{it.description}</td>
                        <td className="py-3 px-4 text-center">{it.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono">
                          {Number(it.unit_price_kes).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-ink font-mono">
                          {Number(it.amount_kes).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted">
                        Deliverable sprint milestone retainer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Calculation */}
            <div className="pt-4 border-t border-rule/60 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal:</span>
                  <span className="font-mono">KES {Number(invoice.amount_kes).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>VAT (16% Included):</span>
                  <span className="font-mono">KES {(Number(invoice.amount_kes) * 0.16).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-ink pt-2 border-t border-rule/60">
                  <span>Total Amount:</span>
                  <span className="font-mono">KES {Number(invoice.amount_kes).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipts & Ledger */}
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-ink">Settlement Transactions &amp; Receipts</h2>
            <div className="divide-y divide-rule/60 text-xs">
              {invoice.payments && invoice.payments.length > 0 ? (
                invoice.payments.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-ink">{p.method} &bull; Ref: {p.reference}</span>
                      <span className="text-muted block text-[11px]">{new Date(p.created_at).toLocaleString()}</span>
                    </div>
                    <span className="font-bold text-emerald-800">
                      KES {Number(p.amount_kes).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted">No payments recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Billing Organization Metadata (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Client Billing Entity</h3>
            <div className="space-y-2.5">
              <div>
                <span className="text-muted block text-[11px]">Organization Name</span>
                <span className="font-bold text-ink">{invoice.org_name}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Billing Email</span>
                <span className="font-semibold text-ink">{invoice.billing_email || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Tax PIN</span>
                <span className="font-mono text-ink font-semibold">{invoice.tax_pin || "P051982344A"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Billing Address</span>
                <span className="text-ink">{invoice.address || "Nairobi, Kenya"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {modalMode === "PAYMENT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rule space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-ink">Record Manual Settlement</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
                >
                  <option value="PAYSTACK">Paystack (Card / M-Pesa / Bank)</option>
                  <option value="BANK">Direct Bank Transfer (KCB / NCBA / Equity)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Amount (KES)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Transaction Reference Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PSTK_... or Wire Slip Ref"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-full text-xs text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {modalMode === "VOID" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rule space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-rose-700">{perms.void ? "Void Invoice" : "Request approval to void"}</h3>
            <p className="text-xs text-muted">
              {perms.void
                ? "Voiding marks this invoice as canceled and invalidates client payment requests."
                : "An owner will be asked to approve. If they approve, the invoice is voided automatically."}
            </p>
            {actionError && <p className="text-xs font-semibold text-rose-700">{actionError}</p>}
            <form onSubmit={handleVoid} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Reason for Voiding</label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Scope revised under SOW amendment #2"
                  className="w-full p-3 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-full text-xs text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{perms.void ? "Void Invoice" : "Send request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {modalMode === "REFUND" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rule space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-ink">{perms.refund ? "Refund invoice" : "Request approval to refund"}</h3>
            <p className="text-xs text-muted">
              {perms.refund
                ? "Marks the invoice refunded and records the amount. Send the money back through the payment provider or bank."
                : "An owner will be asked to approve. If they approve, the refund is recorded automatically."}
            </p>
            {actionError && <p className="text-xs font-semibold text-rose-700">{actionError}</p>}
            <form onSubmit={handleRefund} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Amount (KES)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={invoice.amount_kes || undefined}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Duplicate payment via M-Pesa and card"
                  className="w-full p-3 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 rounded-full text-xs text-muted hover:text-ink cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{perms.refund ? "Record refund" : "Send request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paystack Payment Link Modal */}
      {paystackLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rule space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-rule/70">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Zap className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Paystack Checkout Link</h3>
                  <p className="text-xs text-muted">Ready to share with client or billing department</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaystackLinkModal(null)}
                className="text-muted hover:text-ink cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted leading-relaxed">
                Send this link to the customer to allow them to settle Invoice <strong className="text-ink">{invoice.invoice_number}</strong> (KES {Number(invoice.amount_kes).toLocaleString()}) via Card, M-Pesa, or Bank Transfer:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={paystackLinkModal}
                  className="flex-1 px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono text-ink select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(paystackLinkModal);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={paystackLinkModal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1"
                >
                  <span>Open Checkout Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => setPaystackLinkModal(null)}
                  className="px-4 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white text-xs cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
