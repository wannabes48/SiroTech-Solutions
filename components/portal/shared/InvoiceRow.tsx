"use client";

import { portalPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";
import { PortalInvoice } from "@/data/portal-data";
import { StatusPill } from "./StatusPill";

export interface InvoiceRowProps {
  invoice: PortalInvoice;
  onPayNow?: (invoice: PortalInvoice) => void;
  className?: string;
}

export function InvoiceRow({ invoice, onPayNow, className = "" }: InvoiceRowProps) {
  const isPaid = invoice.status === "Done" || invoice.rawStatus === "PAID";

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white border border-rule/80 hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-surface border border-rule flex items-center justify-center shrink-0">
          <ReceiptText className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={portalPath(`/invoices/${invoice.id}`)}
              className="text-xs sm:text-sm font-bold text-ink hover:text-emerald-700 transition-colors"
            >
              {invoice.invoiceNumber}
            </Link>
            <StatusPill status={invoice.status} size="sm" />
          </div>
          <div className="text-xs text-muted truncate mt-0.5">{invoice.projectTitle}</div>
          <div className="text-[11px] text-muted mt-0.5">
            Issued: {invoice.date} &bull; Due: {invoice.dueDate}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-rule/60">
        <div className="text-left md:text-right">
          <div className="text-sm sm:text-base font-bold text-ink">
            KES {invoice.amountKES.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted font-medium">
            (${invoice.amountUSD.toLocaleString()} USD)
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPaid ? (
            <Link
              href={portalPath(`/invoices/${invoice.id}`)}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Pay now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href={portalPath(`/invoices/${invoice.id}`)}
              className="px-3.5 py-1.5 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold transition-colors"
            >
              View Receipt
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
