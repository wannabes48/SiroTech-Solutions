"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  replySupportTicketAction,
  updateSupportTicketInternalNoteAction
} from "@/app/admin/actions";
import {
  LifeBuoy,
  Clock,
  Send,
  Loader2,
  FileText,
  MessageSquare,
  AlertTriangle,
  Lock,
  Sparkles
} from "lucide-react";

export function TicketDetailStaffClient({
  ticket,
  currentStaff
}: {
  ticket: any;
  currentStaff?: any;
}) {
  const router = useRouter();
  const [replyMessage, setReplyMessage] = useState("");
  const [internalNotes, setInternalNotes] = useState(ticket.internal_notes || "");
  const [replies, setReplies] = useState(ticket.replies || []);
  const [ticketStatus, setTicketStatus] = useState(ticket.status);
  const [isPending, startTransition] = useTransition();

  const handleApplyCanned = (cannedBody: string) => {
    const clientName = ticket.author_name || ticket.client_name || "Client";
    const company = ticket.org_name || "your organization";
    const ticketNumber = ticket.ticket_number || "";
    const message = ticket.subject || "";
    const staffName = currentStaff?.name || "SiroTech Support";
    const service = ticket.project_title || "your application";

    const interpolated = cannedBody
      .replace(/\{\{client_name\}\}/gi, clientName)
      .replace(/\{\{company\}\}/gi, company)
      .replace(/\{\{ticket_number\}\}/gi, String(ticketNumber))
      .replace(/\{\{message\}\}/gi, message)
      .replace(/\{\{staff_name\}\}/gi, staffName)
      .replace(/\{\{service\}\}/gi, service);

    setReplyMessage((prev) => (prev ? `${prev}\n\n${interpolated}` : interpolated));
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    const message = replyMessage.trim();
    setReplyMessage("");

    startTransition(async () => {
      const res = await replySupportTicketAction(ticket.id, message, ticketStatus);
      if (res?.success) {
        const staffRoleTitle = currentStaff?.staffRole === "ADMIN"
          ? "Staff Admin"
          : (currentStaff?.staffRole ? `Staff ${currentStaff.staffRole.charAt(0) + currentStaff.staffRole.slice(1).toLowerCase()}` : "Support Staff");

        setReplies((prev: any[]) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            message,
            content: message,
            author_name: currentStaff?.name || "Staff Support",
            author_role: staffRoleTitle,
            is_staff: true,
            ticket_subject: ticket.subject,
            created_at: new Date().toISOString()
          }
        ]);
        router.refresh();
      }
    });
  };

  const handleSaveInternalNote = () => {
    startTransition(async () => {
      await updateSupportTicketInternalNoteAction(ticket.id, internalNotes);
      router.refresh();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Thread & Reply Form (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Thread History */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-6">
          <div className="border-b border-rule/60 pb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AdminStatusPill status={ticketStatus} />
                <span className="text-xs text-muted">Priority: <strong className="text-ink font-semibold">{ticket.priority}</strong></span>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                  #{ticket.ticket_number}
                </span>
              </div>
              {ticket.sla_due_at && (
                <span className="text-xs text-rose-700 font-semibold flex items-center gap-1 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  SLA Due: {new Date(ticket.sla_due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-ink">
              {ticket.subject}
            </h2>
          </div>

          <div className="space-y-4">
            {replies.map((r: any) => {
              const isStaffAuthor = Boolean(
                r.is_staff ||
                r.author_role?.toLowerCase().includes("staff") ||
                r.author_role?.toLowerCase().includes("admin") ||
                r.author_role?.toLowerCase().includes("support") ||
                r.author_role?.toLowerCase().includes("architect")
              );
              const roleLabel = r.author_role || (isStaffAuthor ? "Staff Support" : "Client");
              const subjectText = r.ticket_subject || ticket.subject;

              return (
                <div
                  key={r.id}
                  className={`p-4 rounded-2xl text-xs space-y-2 ${
                    isStaffAuthor
                      ? "bg-[#1B2E24] text-white ml-6"
                      : "bg-surface/80 border border-rule/70 text-ink mr-6"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] opacity-75">
                    <span className="font-bold">{r.author_name} ({roleLabel})</span>
                    <span>{new Date(r.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  {subjectText && (
                    <div className={`text-xs font-semibold ${isStaffAuthor ? "text-emerald-200" : "text-ink"}`}>
                      <span className="opacity-75 font-normal">Subject: </span>
                      {subjectText}
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{r.message || r.content}</p>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="pt-4 border-t border-rule/60 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink">Post Staff Reply to Client</span>
              {ticket.cannedReplies && ticket.cannedReplies.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sage-700" />
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleApplyCanned(e.target.value);
                      e.target.value = "";
                    }}
                    className="px-2 py-1 rounded-lg bg-surface border border-rule text-xs text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="">Insert Canned Reply...</option>
                    {ticket.cannedReplies.map((c: any) => (
                      <option key={c.id} value={c.body}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <textarea
              rows={4}
              required
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Draft your engineering response to the client organization..."
              className="w-full p-4 rounded-2xl bg-surface border border-rule/80 text-xs sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium">Next Ticket Status:</span>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-surface border border-rule text-xs text-ink font-semibold"
                >
                  <option value="WAITING_ON_CLIENT">Waiting on Client</option>
                  <option value="IN_PROGRESS">In Progress / Investigating</option>
                  <option value="RESOLVED">Mark as Resolved</option>
                  <option value="CLOSED">Close Ticket</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Reply &amp; Update</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Internal Confidential Notes (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 rounded-3xl bg-amber-50/40 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Staff Internal Notes</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-normal">
            These notes are strictly invisible to clients. Use for technical post-mortems, root cause analysis, or escalation notes.
          </p>

          <textarea
            rows={5}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Record internal engineering findings, commit hashes, or server logs..."
            className="w-full p-3 rounded-2xl bg-white border border-amber-200 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveInternalNote}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Save Internal Note</span>
            </button>
          </div>
        </div>

        {/* Ticket Metadata Card */}
        <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-3 text-xs">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Client Context</h3>
          <div className="space-y-2">
            <div>
              <span className="text-muted block text-[11px]">Organization</span>
              <span className="font-bold text-ink">{ticket.org_name}</span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Category</span>
              <span className="font-semibold text-ink">{ticket.category}</span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Created At</span>
              <span className="text-ink">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
