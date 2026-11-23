"use client";

import { portalPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { StatusPill } from "@/components/portal/shared/StatusPill";
import { Card } from "@/components/portal/shared/Card";
import { Toast } from "@/components/portal/shared/Toast";
import { replyTicketAction, resolveTicketAction } from "@/app/portal/actions";

interface SupportTicketDetailClientProps {
  ticket: any;
  user: any;
}

export function SupportTicketDetailClient({ ticket, user }: SupportTicketDetailClientProps) {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [resolvingTicket, setResolvingTicket] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";
  const replies = ticket.replies || [];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const content = replyText.trim();
    setReplyText("");
    setSendingReply(true);

    startTransition(async () => {
      const res = await replyTicketAction(ticket.id, content);
      setSendingReply(false);
      if (res.error) {
        setToast({ message: `Failed to send reply: ${res.error}`, type: "error" });
      } else {
        setToast({ message: "Your reply was posted and staff has been notified.", type: "success" });
        router.refresh();
      }
    });
  };

  const handleMarkResolved = () => {
    setResolvingTicket(true);
    startTransition(async () => {
      const res = await resolveTicketAction(ticket.id);
      setResolvingTicket(false);
      if (res.error) {
        setToast({ message: `Error: ${res.error}`, type: "error" });
      } else {
        setToast({ message: "Ticket marked as resolved.", type: "success" });
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href={portalPath("/support")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Support Hub</span>
        </Link>
        <span className="text-xs font-mono text-emerald-800 font-bold">{ticket.ticket_number}</span>
      </div>

      {/* Ticket Header Card */}
      <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {ticket.ticket_number}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                {ticket.subject}
              </h1>
              <StatusPill
                status={
                  ticket.status === "RESOLVED"
                    ? "Done"
                    : ticket.status === "WAITING_ON_CLIENT"
                    ? "Waiting for you"
                    : "In progress"
                }
                size="sm"
              />
            </div>

            <div className="text-xs text-muted flex items-center gap-2 flex-wrap">
              <span>Category: <strong>{ticket.category}</strong></span>
              <span>•</span>
              <span>Priority: <strong>{ticket.priority}</strong></span>
              <span>•</span>
              <span>Assignee: <strong>{ticket.assignee_name || "Daniel Siro"}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isResolved ? (
              <button
                type="button"
                disabled={isPending || resolvingTicket}
                onClick={handleMarkResolved}
                className="px-4 py-2 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {resolvingTicket ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{resolvingTicket ? "Resolving..." : "Mark Resolved"}</span>
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resolved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies Thread */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Conversation Thread</h2>

        <div className="space-y-4">
          {replies.map((reply: any) => {
            const isMe = reply.author_id === user.id;

            return (
              <Card
                key={reply.id}
                className={`p-5 border transition-all ${
                  reply.is_staff
                    ? "border-emerald-200/80 bg-emerald-50/20"
                    : "border-rule/80 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-rule/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">{reply.author_name}</span>
                    {reply.is_staff ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                        {reply.author_role || "Staff Support"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-surface text-muted text-[10px] font-medium border border-rule/60">
                        {reply.author_role || "Client"}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted">
                    {new Date(reply.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-body leading-relaxed whitespace-pre-wrap">{reply.message || reply.content}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Reply Form */}
      {!isResolved && (
        <Card className="p-5 border border-rule/80 bg-white space-y-4">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Post Reply</h3>
          <form onSubmit={handleSendReply} className="space-y-3">
            <textarea
              required
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Provide additional details or respond to engineer..."
              className="w-full p-3.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted">
                Replies notify the assigned engineer in real-time.
              </span>

              <button
                type="submit"
                disabled={isPending || sendingReply || !replyText.trim()}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {sendingReply || isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <span>Post Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
