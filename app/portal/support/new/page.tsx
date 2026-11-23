"use client";

import { portalPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { createTicketAction } from "@/app/portal/actions";

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("BUG");
  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !message.trim()) {
      setError("Please fill in both the ticket subject and description.");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject.trim());
    formData.append("category", category);
    formData.append("priority", priority);
    formData.append("message", message.trim());

    startTransition(async () => {
      try {
        const res = await createTicketAction(formData);
        if (res.error) {
          setError(res.error);
        } else if (res.success) {
          setCreatedTicketNumber(res.ticketNumber);
          setTimeout(() => {
            router.push(portalPath("/support"));
          }, 1600);
        }
      } catch (err: any) {
        setError(err.message || "Failed to create support ticket.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <Link
          href={portalPath("/support")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Support Hub</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-10 shadow-xs">
        <div className="mb-6 pb-6 border-b border-rule/70">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Raise a Support Ticket</h1>
          <p className="text-muted text-xs sm:text-sm mt-1">
            Logged directly into our engineering sprint queue. Guaranteed response under 2 hours during EAT business hours.
          </p>
        </div>

        {createdTicketNumber ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in duration-200 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-ink">Support Ticket Dispatched!</h3>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Ticket <strong className="text-ink">#{createdTicketNumber}</strong> has been logged to the database. Lead solutions architect has been notified. Redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Ticket Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. M-Pesa B2B callback retry delay in staging"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule/80 text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface border border-rule/80 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                >
                  <option value="BUG">Bug Report</option>
                  <option value="CHANGE_REQUEST">Change Request</option>
                  <option value="QUESTION">Question / Architecture</option>
                  <option value="BILLING">Billing & Milestone</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "NORMAL" | "URGENT")}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface border border-rule/80 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                >
                  <option value="NORMAL">Normal (&lt; 2 hrs)</option>
                  <option value="URGENT">Urgent (&lt; 30 mins)</option>
                </select>
              </div>
            </div>

            {priority === "URGENT" && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Urgent Escalation:</strong> Expected response time is &lt; 30 minutes. An immediate alert is paged to Daniel Siro and on-call engineers.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Description & Reproduction Details *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the issue, what occurred, expected outcome, and provide any error logs or steps to reproduce..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule/80 text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Audited database record created & engineers paged.</span>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Ticket</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
