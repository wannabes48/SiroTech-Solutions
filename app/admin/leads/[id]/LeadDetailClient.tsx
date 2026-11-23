"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  updateLeadStatusAction,
  addLeadNoteAction,
  convertLeadToClientAction,
  createAdminTaskAction,
  toggleAdminTaskDoneAction,
  markLeadSpamAction,
  updateLeadLostReasonAction,
  replyLeadEmailAction,
  retryLeadEmailsAction
} from "@/app/admin/actions";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  Loader2,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Tag,
  CheckSquare,
  Plus,
  ShieldAlert,
  Bot,
  Compass,
  ArrowRight
} from "lucide-react";

export function LeadDetailClient({ lead }: { lead: any }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(lead.status);
  const [noteBody, setNoteBody] = useState("");
  const [notes, setNotes] = useState(lead.notes || []);
  const [tasks, setTasks] = useState(lead.tasks || []);
  const [converting, setConverting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Email reply composer modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(`Re: SiroTech Solutions Technical Scoping — ${lead.service || "Engineering"}`);
  const [emailTemplate, setEmailTemplate] = useState("DISCOVERY");
  const [emailBody, setEmailBody] = useState(
    `Hi ${lead.name.split(" ")[0]},\n\nThank you for reaching out to SiroTech Solutions. We reviewed your project requirements for ${lead.service || "custom software development"}.\n\nWhen would you be available for a brief 20-minute technical discovery call to align on system architecture and milestone deliverables?\n\nBest regards,\nDaniel Siro\nPrincipal Solutions Architect\nSiroTech Solutions`
  );
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Lost Reason state
  const [showLostPrompt, setShowLostPrompt] = useState(false);
  const [lostReasonText, setLostReasonText] = useState("");

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const handleStatusSelect = (newStatus: string) => {
    if (newStatus === "LOST") {
      setShowLostPrompt(true);
      return;
    }
    setCurrentStatus(newStatus);
    startTransition(async () => {
      await updateLeadStatusAction(lead.id, newStatus);
      router.refresh();
    });
  };

  const handleConfirmLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostReasonText.trim()) return;
    setCurrentStatus("LOST");
    setShowLostPrompt(false);

    startTransition(async () => {
      await updateLeadLostReasonAction(lead.id, lostReasonText.trim());
      router.refresh();
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;

    const body = noteBody.trim();
    setNoteBody("");

    startTransition(async () => {
      const res = await addLeadNoteAction(lead.id, body);
      if (res?.success) {
        setNotes((prev: any[]) => [
          {
            id: `temp-${Date.now()}`,
            body,
            author_name: "Staff",
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        router.refresh();
      }
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const formData = new FormData();
    formData.append("title", taskTitle.trim());
    if (taskDueDate) formData.append("dueAt", taskDueDate);
    formData.append("leadId", lead.id);

    setTaskTitle("");
    setTaskDueDate("");

    startTransition(async () => {
      const res = await createAdminTaskAction(formData);
      if (res.success) {
        setTasks((prev: any[]) => [
          {
            id: res.taskId || `task-${Date.now()}`,
            title: taskTitle.trim(),
            due_at: taskDueDate ? new Date(taskDueDate).toISOString() : null,
            done_at: null
          },
          ...prev
        ]);
        router.refresh();
      }
    });
  };

  const handleToggleTask = (taskId: string, currentDone: boolean) => {
    setTasks((prev: any[]) =>
      prev.map((t) => (t.id === taskId ? { ...t, done_at: currentDone ? null : new Date().toISOString() } : t))
    );

    startTransition(async () => {
      await toggleAdminTaskDoneAction(taskId, !currentDone);
      router.refresh();
    });
  };

  const handleSendEmailReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;

    startTransition(async () => {
      const res = await replyLeadEmailAction(lead.id, emailSubject.trim(), emailBody.trim(), emailTemplate);
      if (res.success) {
        setEmailSentSuccess(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSentSuccess(false);
        }, 1500);
        router.refresh();
      } else if (res.error) {
        alert(res.error); // never fail silently
        router.refresh();
      }
    });
  };

  const handleMarkSpam = () => {
    if (!confirm("Are you sure you want to mark this lead as spam?")) return;
    startTransition(async () => {
      await markLeadSpamAction(lead.id);
      router.push(adminPath("/leads"));
    });
  };

  const handleConvert = () => {
    setConverting(true);
    startTransition(async () => {
      const res = await convertLeadToClientAction(lead.id);
      setConverting(false);
      if (res?.success) {
        router.push(adminPath(`/clients/${res.orgId}`));
      }
    });
  };

  const utmData = lead.utm || {};

  const emailFailed = lead.notify_status === "FAILED" || lead.autoreply_status === "FAILED";

  return (
    <div className="space-y-6">
      {/* Enquiry email failure flag: the lead is safe; emails retry automatically via cron */}
      {emailFailed && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="font-bold">An enquiry email did not send</div>
            <div>
              Team notification: <strong>{lead.notify_status || "PENDING"}</strong> · Auto-reply to visitor:{" "}
              <strong>{lead.autoreply_status || "PENDING"}</strong> · Attempts: {lead.email_attempts || 0}
              {lead.email_next_retry_at && <> · Next retry {new Date(lead.email_next_retry_at).toLocaleString()}</>}
            </div>
            {lead.email_last_error && <div className="font-mono text-[11px] text-red-800 break-all">{lead.email_last_error}</div>}
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await retryLeadEmailsAction(lead.id);
                if (res.error) alert(`Still failing: ${res.error}`);
                router.refresh();
              })
            }
            className="px-3 py-1.5 rounded-full bg-red-700 hover:bg-red-800 text-white font-semibold cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Retrying…" : "Retry now"}
          </button>
        </div>
      )}

      {/* Top Banner Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-rule/80 shadow-xs">
        <div className="flex items-center gap-2">
          <AdminStatusPill status={currentStatus} />
          <span className="text-xs font-semibold text-muted">
            Deal Value: <strong className="text-ink font-mono">{lead.currency} {Number(lead.value || 0).toLocaleString()}</strong>
          </span>
          {lead.lost_reason && (
            <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              Lost: {lead.lost_reason}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmailModal(true)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-rule hover:bg-surface text-ink transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-700" />
            <span>Reply via Email</span>
          </button>

          <button
            type="button"
            onClick={handleMarkSpam}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-red-700 border border-rule hover:border-red-300 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Spam</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scope, Message, Tasks & Notes (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Inquiry Scope & Message Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-ink">Inquiry Brief &amp; Scope Requirements</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface/60 border border-rule/60 text-xs">
              <div>
                <span className="text-muted block text-[11px]">Requested Service</span>
                <span className="font-bold text-ink mt-0.5 block">{lead.service || "Custom Software"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Estimated Budget</span>
                <span className="font-bold text-ink mt-0.5 block">{lead.budget || "Unspecified"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Target Timeline</span>
                <span className="font-bold text-ink mt-0.5 block">{lead.timeline || "Flexible"}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                Client Message
              </span>
              <div className="p-4 rounded-2xl bg-surface/40 border border-rule/40 text-xs sm:text-sm text-body leading-relaxed whitespace-pre-wrap">
                {lead.message || "No initial message text provided."}
              </div>
            </div>

            {/* Source & UTM Tracking */}
            <div className="pt-3 border-t border-rule/50 flex flex-wrap items-center gap-2 text-[11px] text-muted">
              <Compass className="w-3.5 h-3.5 text-sage-600" />
              <span>Source: <strong className="text-ink">{utmData.source || "Direct Organic"}</strong></span>
              {utmData.medium && <span>&bull; Medium: <strong className="text-ink">{utmData.medium}</strong></span>}
              {utmData.campaign && <span>&bull; Campaign: <strong className="text-ink">{utmData.campaign}</strong></span>}
            </div>
          </div>

          {/* Follow-up Tasks with Due Dates */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                  Follow-up Tasks
                </h2>
                <p className="text-xs text-muted">Action items and calendar milestones for this prospect.</p>
              </div>
            </div>

            {/* Task Creation Form */}
            <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Schedule follow-up call, prepare scope PDF..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-surface border border-rule text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </form>

            <div className="divide-y divide-rule/60 text-xs">
              {tasks.length > 0 ? (
                tasks.map((task: any) => (
                  <div key={task.id} className="py-2.5 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={Boolean(task.done_at)}
                        onChange={() => handleToggleTask(task.id, Boolean(task.done_at))}
                        className="rounded border-rule text-emerald-700 focus:ring-emerald-600/30"
                      />
                      <span className={`truncate ${task.done_at ? "line-through text-muted" : "font-semibold text-ink"}`}>
                        {task.title}
                      </span>
                    </label>
                    {task.due_at && (
                      <span className="text-[11px] text-muted shrink-0 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-muted">
                  No active follow-up tasks scheduled for this lead.
                </div>
              )}
            </div>
          </div>

          {/* Internal Staff Notes & Activity Thread */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Internal Qualification Notes</h2>
                <p className="text-xs text-muted">Confidential discussion, budget evaluations, and scoping notes.</p>
              </div>
              <MessageSquare className="w-4 h-4 text-muted" />
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                required
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Post a qualification note or next steps for the engineering team..."
                className="w-full p-3.5 rounded-2xl bg-surface border border-rule/80 text-xs sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Post Note</span>
                </button>
              </div>
            </form>

            <div className="divide-y divide-rule/60 pt-2">
              {notes.length > 0 ? (
                notes.map((note: any) => (
                  <div key={note.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">{note.author_name}</span>
                      <span className="text-[11px] text-muted">
                        {new Date(note.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-body leading-relaxed whitespace-pre-wrap">{note.body}</p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted">
                  No internal notes posted yet. Use the field above to record discovery notes.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Contact Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Convert to Client Card */}
          <div className="p-6 rounded-3xl bg-sage-100 border border-sage-300 shadow-xs space-y-4">
            <div className="text-sm font-bold text-ink">Client Onboarding</div>
            <p className="text-xs text-body leading-relaxed">
              Convert this lead into a client organization with portal access, a pre-filled draft project workspace, and invoice capabilities.
            </p>

            {lead.status === "WON" && lead.converted_org_id ? (
              <Link
                href={adminPath(`/clients/${lead.converted_org_id}`)}
                className="w-full py-2.5 px-4 rounded-full bg-emerald-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View Client Workspace</span>
              </Link>
            ) : (
              <button
                type="button"
                disabled={converting || isPending}
                onClick={handleConvert}
                className="w-full py-2.5 px-4 rounded-full bg-[#1B2E24] hover:bg-black text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                <span>Convert to Client (1-Click)</span>
              </button>
            )}
          </div>

          {/* Lead Stage Selector */}
          <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-3">
            <label className="text-xs font-bold text-ink uppercase tracking-wider block">
              Pipeline Stage
            </label>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusSelect(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none font-semibold cursor-pointer"
            >
              <option value="NEW">New Inquiry</option>
              <option value="CONTACTED">Contacted / In Discussion</option>
              <option value="QUALIFIED">Qualified Technical Scope</option>
              <option value="PROPOSAL">Proposal Submitted</option>
              <option value="WON">Won (Converted)</option>
              <option value="LOST">Lost / Unresponsive</option>
            </select>
          </div>

          {/* Contact Information */}
          <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Contact Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-muted shrink-0" />
                <span className="font-semibold text-ink">{lead.company || "Independent"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted shrink-0" />
                <a href={`mailto:${lead.email}`} className="text-emerald-800 hover:underline">
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted shrink-0" />
                  <a href={`tel:${lead.phone}`} className="text-emerald-800 hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lost Reason Modal */}
      {showLostPrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink">Record Lost Reason</h3>
            <p className="text-xs text-muted">
              Why was this lead marked as lost? This helps calibrate our sales qualification and proposal pricing.
            </p>
            <form onSubmit={handleConfirmLost} className="space-y-4">
              <textarea
                rows={3}
                required
                value={lostReasonText}
                onChange={(e) => setLostReasonText(e.target.value)}
                placeholder="e.g. Budget constraints, opted for internal hiring, timeline incompatible..."
                className="w-full p-3 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLostPrompt(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-red-700 hover:bg-red-800 text-white cursor-pointer"
                >
                  Mark Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply by Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                Reply to {lead.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-muted hover:text-ink text-xs font-semibold cursor-pointer"
              >
                &times; Close
              </button>
            </div>

            {emailSentSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Email dispatched and logged in EmailLog!</span>
              </div>
            ) : (
              <form onSubmit={handleSendEmailReply} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-ink block mb-1">Email Template</label>
                  <select
                    value={emailTemplate}
                    onChange={(e) => {
                      setEmailTemplate(e.target.value);
                      if (e.target.value === "PROPOSAL") {
                        setEmailSubject(`SiroTech Solutions — Proposal & Scope Document`);
                        setEmailBody(`Hi ${lead.name.split(" ")[0]},\n\nAttached is our technical proposal and delivery milestone outline for ${lead.company || "your organization"}.\n\nPlease review and let us know if you would like any adjustments before we proceed to contract.\n\nBest regards,\nDaniel Siro`);
                      } else {
                        setEmailSubject(`Re: SiroTech Solutions Technical Scoping — ${lead.service || "Engineering"}`);
                        setEmailBody(`Hi ${lead.name.split(" ")[0]},\n\nThank you for reaching out to SiroTech Solutions. We reviewed your project requirements for ${lead.service || "custom software development"}.\n\nWhen would you be available for a brief 20-minute technical discovery call?\n\nBest regards,\nDaniel Siro`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                  >
                    <option value="DISCOVERY">Technical Discovery Intro</option>
                    <option value="PROPOSAL">Proposal &amp; Milestone Scope</option>
                    <option value="CUSTOM">Custom Message</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Message Body</label>
                  <textarea
                    rows={6}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface border border-rule text-xs text-ink font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Dispatch Email</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
