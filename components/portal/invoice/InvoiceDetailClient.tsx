"use client";

import { portalPath } from "@/lib/hosts";
import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  CreditCard,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { StatusPill } from "@/components/portal/shared/StatusPill";
import { Toast } from "@/components/portal/shared/Toast";
import {
  processPaymentAction,
  initializePaystackCheckoutAction,
  verifyPaystackPaymentAction,
} from "@/app/portal/actions";

interface InvoiceDetailClientProps {
  invoice: any;
  user: any;
}

export function InvoiceDetailClient({ invoice, user }: InvoiceDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"PAYSTACK" | "BANK">("PAYSTACK");
  const [bankRef, setBankRef] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [isPending, startTransition] = useTransition();

  const isPaid = invoice.status === "PAID";
  const items = invoice.items || [];

  // Listen for Paystack redirect callback
  useEffect(() => {
    const ref = searchParams?.get("paystack_ref") || searchParams?.get("reference") || searchParams?.get("trxref");
    if (ref && invoice.status !== "PAID") {
      setToast({ message: "Verifying Paystack transaction...", type: "info" });
      startTransition(async () => {
        const res = await verifyPaystackPaymentAction(invoice.id, ref);
        if (res.success) {
          setToast({
            message: `Payment confirmed via Paystack! (Receipt: ${res.receiptNumber})`,
            type: "success",
          });
          router.refresh();
        } else {
          setToast({
            message: `Paystack verification notice: ${res.error}`,
            type: "error",
          });
        }
      });
    }
  }, [searchParams, invoice.id, invoice.status, router]);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    startTransition(async () => {
      // 1. Paystack Flow (Unified Card + M-Pesa + Bank)
      if (payMethod === "PAYSTACK") {
        const initRes = await initializePaystackCheckoutAction(invoice.id);
        if (initRes.error) {
          setIsProcessing(false);
          setToast({ message: `Paystack error: ${initRes.error}`, type: "error" });
          return;
        }

        // If mock / test sandbox without active keys
        if (initRes.isMock) {
          const verifyRes = await verifyPaystackPaymentAction(invoice.id, initRes.reference);
          setIsProcessing(false);
          if (verifyRes.success) {
            setToast({
              message: `Payment confirmed via Paystack Sandbox (Receipt: ${verifyRes.receiptNumber})`,
              type: "success",
            });
            setPayModalOpen(false);
            router.refresh();
          } else {
            setToast({ message: `Verification failed: ${verifyRes.error}`, type: "error" });
          }
          return;
        }

        // Live / Test Paystack Checkout Redirect
        if (initRes.authorizationUrl) {
          setToast({ message: "Redirecting to Paystack secure checkout...", type: "info" });
          window.location.href = initRes.authorizationUrl;
          return;
        }
      }

      // 2. Direct Bank Wire Flow
      const txRef = bankRef.trim() || `BNK-${Date.now().toString().slice(-6)}`;

      const res = await processPaymentAction(
        invoice.id,
        "BANK",
        txRef
      );

      setIsProcessing(false);

      if (res.error) {
        setToast({ message: `Payment recording failed: ${res.error}`, type: "error" });
      } else {
        setToast({ message: `Payment confirmed via ${payMethod} (Ref: ${txRef}). Audit log written.`, type: "success" });
        setPayModalOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Bar: Back Link & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href={portalPath("/invoices")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Invoices & Billing</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-muted" />
            <span>Print / PDF</span>
          </button>

          {!isPaid ? (
            <button
              type="button"
              onClick={() => setPayModalOpen(true)}
              className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay now (M-Pesa / Card)</span>
            </button>
          ) : (
            <div className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paid in Full</span>
            </div>
          )}
        </div>
      </div>

      {/* Printable Invoice Card */}
      <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-12 shadow-xs max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Header: Company & Invoice Number */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-rule">
          <div>
            <Logo variant="light" className="h-8 w-auto mb-3" />
            <div className="text-xs text-muted">SiroTech Solutions Ltd &bull; PIN: P051982344A</div>
            <div className="text-xs text-muted">Mombasa &bull; Nairobi &bull; billing@sirotech.com</div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="flex items-center sm:justify-end gap-2">
              <h1 className="text-2xl font-black text-ink">{invoice.invoice_number}</h1>
              <StatusPill status={isPaid ? "Paid" : "Waiting for you"} size="sm" />
            </div>
            <div className="text-xs text-muted">
              Issued:{" "}
              <span className="font-semibold text-ink">
                {new Date(invoice.issue_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="text-xs text-muted">
              Due Date:{" "}
              <span className="font-semibold text-ink">
                {new Date(invoice.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {invoice.paid_at && (
              <div className="text-xs font-bold text-emerald-700 flex items-center sm:justify-end gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Paid:{" "}
                  {new Date(invoice.paid_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {invoice.payment_reference && ` (Ref: ${invoice.payment_reference})`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Billed To Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-rule text-xs">
          <div>
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Billed To
            </div>
            <div className="font-bold text-sm text-ink">{invoice.org_name}</div>
            <div className="text-muted mt-0.5">{invoice.org_address}</div>
            <div className="text-ink font-semibold mt-1">Tax PIN: {invoice.tax_pin}</div>
            <div className="text-muted mt-0.5">Billing Email: {invoice.billing_email}</div>
          </div>

          <div className="sm:text-right">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Statement of Work
            </div>
            <div className="font-bold text-sm text-ink">{invoice.project_title}</div>
            <div className="text-muted mt-0.5">Organization: {invoice.org_name}</div>
            <div className="text-muted mt-0.5">Primary Currency: KES / USD</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 border-b border-rule">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-muted border-b border-rule pb-2">
              <tr>
                <th scope="col" className="pb-3">Description</th>
                <th scope="col" className="pb-3 text-center">Qty</th>
                <th scope="col" className="pb-3 text-right">Unit Price (KES)</th>
                <th scope="col" className="pb-3 text-right">Total (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-4 pr-4">
                    <div className="font-bold text-ink">{item.description}</div>
                  </td>
                  <td className="py-4 text-center text-muted font-medium">{item.quantity}</td>
                  <td className="py-4 text-right font-medium text-ink">
                    KES {Number(item.unit_price_kes).toLocaleString()}
                  </td>
                  <td className="py-4 text-right font-bold text-ink">
                    KES {(Number(item.unit_price_kes) * Number(item.quantity)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1 text-xs text-muted max-w-sm">
            <div className="font-bold text-ink">Payment Instructions</div>
            <p className="leading-relaxed">
              M-Pesa Paybill / STK Push or direct international wire transfer. Include invoice number as
              payment reference.
            </p>
          </div>

          <div className="space-y-2 w-full sm:w-72 text-xs">
            <div className="flex justify-between py-1 text-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">
                KES {Number(invoice.amount_kes).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1 text-muted">
              <span>VAT (16% inclusive)</span>
              <span className="font-semibold text-ink">
                KES {(Number(invoice.amount_kes) * 0.16).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-ink text-sm font-black text-ink">
              <span>Total Amount Due</span>
              <span>KES {Number(invoice.amount_kes).toLocaleString()}</span>
            </div>
            <div className="text-right text-[11px] text-muted font-medium">
              ≈ ${Number(invoice.amount_usd).toLocaleString()} USD
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Pay Now Dialog */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Settle Invoice {invoice.invoice_number}</h3>
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 p-1 bg-surface rounded-xl border border-rule/70 gap-1">
              <button
                type="button"
                onClick={() => setPayMethod("PAYSTACK")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  payMethod === "PAYSTACK" ? "bg-white text-emerald-800 shadow-xs border border-emerald-200" : "text-muted hover:text-ink"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paystack (Card / M-Pesa)</span>
              </button>
              <button
                type="button"
                onClick={() => setPayMethod("BANK")}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  payMethod === "BANK" ? "bg-white text-ink shadow-xs" : "text-muted hover:text-ink"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-muted" />
                <span>Direct Bank Wire</span>
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              {payMethod === "PAYSTACK" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                        <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                        <span>Unified Instant Checkout</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      Settle securely using <strong className="font-semibold text-ink">Cards (Visa, Mastercard)</strong> or <strong className="font-semibold text-ink">Safaricom M-Pesa</strong> (with asynchronous STK push directly to your handset).
                    </p>
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Automated Webhook Reconciliation &bull; 256-Bit SSL Encrypted</span>
                    </div>
                  </div>
                </div>
              )}

              {payMethod === "BANK" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-surface border border-rule text-xs space-y-1.5 text-muted">
                    <div className="font-semibold text-ink">SiroTech Solutions Corporate Account</div>
                    <div className="font-mono text-[11px]">Bank: NCBA Bank Kenya &bull; A/C: 10023489201</div>
                    <div className="font-mono text-[11px]">Swift: CBAFKENA &bull; Branch: Upper Hill Nairobi</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Bank Wire / RTGS Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="e.g. NCBA-FT-948201 or Wire Slip #"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-rule hover:bg-surface text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || isPending}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {(isProcessing || isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {payMethod === "PAYSTACK"
                      ? `Pay KES ${Number(invoice.amount_kes).toLocaleString()} with Paystack`
                      : `Confirm & Settle KES ${Number(invoice.amount_kes).toLocaleString()}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
