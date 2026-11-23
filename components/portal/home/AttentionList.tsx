"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles, X, ShieldCheck } from "lucide-react";
import { Card } from "@/components/portal/shared/Card";

export interface AttentionItem {
  id: string;
  type: "milestone" | "invoice" | "ticket" | "proposal";
  title: string;
  description: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  dueInDays?: number;
  actionLabel: string;
  actionHref: string;
  rawId: string;
}

export function AttentionList({ initialItems }: { initialItems: AttentionItem[] }) {
  const [items, setItems] = useState<AttentionItem[]>(initialItems);

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center bg-white border border-rule/80">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-ink">You&apos;re all caught up!</h3>
        <p className="text-xs text-muted max-w-md mx-auto mt-1 leading-relaxed">
          No pending approvals, overdue invoices, or blocking tickets. Our engineering team is executing your sprints.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card
          key={item.id}
          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-rule/90 hover:border-rule hover:shadow-xs transition-all bg-white"
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                item.urgency === "HIGH"
                  ? "bg-amber-100 text-amber-800"
                  : item.type === "proposal"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-sage-100 text-sage-900"
              }`}
            >
              {item.type === "milestone" && <Sparkles className="w-4 h-4" />}
              {item.type === "invoice" && <Clock className="w-4 h-4" />}
              {item.type === "ticket" && <ShieldCheck className="w-4 h-4" />}
              {item.type === "proposal" && <Sparkles className="w-4 h-4" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-ink">{item.title}</h3>
                {item.urgency === "HIGH" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                    High Priority
                  </span>
                )}
                {item.dueInDays !== undefined && (
                  <span className="text-[11px] text-muted">
                    Due in {item.dueInDays} {item.dueInDays === 1 ? "day" : "days"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed max-w-2xl">{item.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center shrink-0">
            <Link
              href={item.actionHref}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => handleDismiss(item.id)}
              aria-label="Dismiss item"
              className="p-2 rounded-full border border-rule hover:bg-surface text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
