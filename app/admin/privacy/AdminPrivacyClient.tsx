"use client";

import React, { useState, useTransition } from "react";
import {
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  Lock,
  Mail,
  Globe,
  Filter,
  Plus,
  X,
  FileArchive,
  ShieldAlert,
  Loader2,
  HelpCircle,
  FileText,
  Search,
  Calendar
} from "lucide-react";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  processPrivacyRequestAction,
  createInboundPrivacyRequestAction
} from "@/app/admin/actions";

export interface PrivacyRequestRow {
  id: string;
  user_id?: string | null;
  email: string;
  type: "EXPORT" | "ERASURE" | string;
  status: string;
  channel: "PORTAL" | "EMAIL" | "MANUAL" | string;
  notes?: string | null;
  created_at: string;
  target_completion_date?: string | null;
  completed_at?: string | null;
  completed_by_name?: string | null;
  rejection_reason?: string | null;
  statutory_retention_notice?: string | null;
  user_name?: string | null;
  org_name?: string | null;
}

export function AdminPrivacyClient({ initialRequests }: { initialRequests: PrivacyRequestRow[] }) {
  const [requests, setRequests] = useState<PrivacyRequestRow[]>(initialRequests);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [erasureModalTarget, setErasureModalTarget] = useState<PrivacyRequestRow | null>(null);
  const [rejectModalTarget, setRejectModalTarget] = useState<PrivacyRequestRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // New Request Form
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"EXPORT" | "ERASURE">("EXPORT");
  const [newChannel, setNewChannel] = useState<"EMAIL" | "PORTAL" | "MANUAL">("EMAIL");
  const [newNotes, setNewNotes] = useState("");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filtered dataset
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.user_name && req.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.org_name && req.org_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.notes && req.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && (req.status === "PENDING" || req.status === "IN_PROGRESS")) ||
      req.status.toUpperCase() === statusFilter.toUpperCase();

    const matchesChannel =
      channelFilter === "ALL" ||
      (req.channel || "PORTAL").toUpperCase() === channelFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesChannel;
  });

  // Calculate KPIs
  const pendingCount = requests.filter((r) => r.status === "PENDING" || r.status === "IN_PROGRESS").length;
  const exportCount = requests.filter((r) => r.type.toUpperCase() === "EXPORT").length;
  const erasureCount = requests.filter((r) => r.type.toUpperCase() === "ERASURE").length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;

  // Format Days Remaining for Statutory Target Date
  const getTargetDaysBadge = (targetDateStr?: string | null, isCompleted?: boolean) => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Statutory Goal Met
        </span>
      );
    }

    if (!targetDateStr) {
      return <span className="text-[11px] text-muted">30 days from intake</span>;
    }

    const now = new Date();
    const target = new Date(targetDateStr);
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          {Math.abs(diffDays)}d Overdue
        </span>
      );
    }

    if (diffDays <= 7) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          {diffDays}d remaining
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
        <Clock className="w-3 h-3 text-slate-500" />
        {diffDays}d remaining
      </span>
    );
  };

  // Handler for Export Action
  const handleExport = (req: PrivacyRequestRow) => {
    startTransition(async () => {
      const res = await processPrivacyRequestAction(req.id, "EXPORT");
      if (res.error) {
        showToast(res.error, "error");
      } else if (res.downloadUrl) {
        showToast("Personal data ZIP archive compiled and download initiated.", "success");
        setRequests((prev) =>
          prev.map((r) =>
            r.id === req.id
              ? {
                  ...r,
                  status: "COMPLETED",
                  completed_at: new Date().toISOString(),
                  completed_by_name: "Staff",
                  statutory_retention_notice: "Complete personal dataset archive built and delivered in ZIP format."
                }
              : r
          )
        );
        window.open(res.downloadUrl, "_blank");
      }
    });
  };

  // Handler for Erasure Execution
  const handleExecuteErasure = () => {
    if (!erasureModalTarget) return;

    startTransition(async () => {
      const res = await processPrivacyRequestAction(erasureModalTarget.id, "ANONYMIZE");
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast(
          "Data subject personal identity anonymized and personal content soft-deleted. Statutory financial records preserved.",
          "success"
        );
        setRequests((prev) =>
          prev.map((r) =>
            r.id === erasureModalTarget.id
              ? {
                  ...r,
                  status: "COMPLETED",
                  completed_at: new Date().toISOString(),
                  completed_by_name: "Staff",
                  statutory_retention_notice: res.retentionNotice || "Financial records retained pursuant to KRA 7-year statutory rule."
                }
              : r
          )
        );
        setErasureModalTarget(null);
      }
    });
  };

  // Handler for Rejection
  const handleReject = () => {
    if (!rejectModalTarget) return;

    startTransition(async () => {
      const res = await processPrivacyRequestAction(rejectModalTarget.id, "REJECT", rejectReason);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Request marked as rejected with statutory justification.", "info");
        setRequests((prev) =>
          prev.map((r) =>
            r.id === rejectModalTarget.id
              ? {
                  ...r,
                  status: "REJECTED",
                  completed_at: new Date().toISOString(),
                  rejection_reason: rejectReason || "Rejected by staff review"
                }
              : r
          )
        );
        setRejectModalTarget(null);
        setRejectReason("");
      }
    });
  };

  // Handler for Inbound Request Submission
  const handleCreateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      showToast("Please provide a valid email address.", "error");
      return;
    }

    setIsSubmittingNew(true);
    try {
      const res = await createInboundPrivacyRequestAction({
        email: newEmail,
        name: newName,
        type: newType,
        channel: newChannel,
        notes: newNotes
      });

      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast(`Inbound ${newType} request successfully logged into queue.`, "success");
        setCreateModalOpen(false);

        // Add to state
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);

        setRequests((prev) => [
          {
            id: res.requestId || `temp-${Date.now()}`,
            email: newEmail.trim().toLowerCase(),
            user_name: newName || null,
            type: newType,
            channel: newChannel,
            status: "PENDING",
            notes: newNotes,
            created_at: new Date().toISOString(),
            target_completion_date: targetDate.toISOString()
          },
          ...prev
        ]);

        // Reset form
        setNewEmail("");
        setNewName("");
        setNewNotes("");
      }
    } catch {
      showToast("Failed to record privacy request.", "error");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B2E24] text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-3 border border-emerald-500/30 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending In Queue</span>
          </div>
          <div className="text-xl font-bold text-ink">{pendingCount} requests</div>
          <p className="text-[11px] text-muted mt-1">Awaiting staff action</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <FileArchive className="w-3.5 h-3.5 text-indigo-600" />
            <span>Data Exports (ZIP)</span>
          </div>
          <div className="text-xl font-bold text-ink">{exportCount} requested</div>
          <p className="text-[11px] text-muted mt-1">DSAR data portability</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Right to Erasure</span>
          </div>
          <div className="text-xl font-bold text-ink">{erasureCount} requested</div>
          <p className="text-[11px] text-muted mt-1">Anonymization requests</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed &amp; Audited</span>
          </div>
          <div className="text-xl font-bold text-ink">{completedCount} resolved</div>
          <p className="text-[11px] text-muted mt-1">100% compliance trail</p>
        </div>
      </div>

      {/* Statutory Legal & Tax Notice Banner */}
      <div className="p-5 rounded-3xl bg-[#F4F7F5] border border-emerald-900/10 text-xs text-body space-y-2">
        <div className="flex items-center gap-2 font-bold text-ink">
          <Lock className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>Kenya DPA 2019 &amp; GDPR Statutory Compliance Guide</span>
        </div>
        <p className="leading-relaxed">
          Subject Access Requests must be fulfilled within <strong>30 calendar days</strong> of intake. When executing Right to Erasure, <strong>personal identifiers (name, email, phone, credentials, messages) are anonymized and personal content soft-deleted</strong>.
        </p>
        <p className="leading-relaxed font-medium text-emerald-950 bg-white/70 p-3 rounded-2xl border border-emerald-900/10">
          <strong className="text-ink">Statutory Financial Retention:</strong> Pursuant to Section 23 of the Kenya Tax Procedures Act (2015) and international tax regulations, commercial accounting ledgers, VAT documentation, invoices, and verified payment transactions are <strong>legally retained for the mandatory 7-year statutory period</strong>. Confirm with your accountant or lawyer before altering financial schedules.
        </p>
      </div>

      {/* Control Bar: Search, Filters, and Log Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-rule/80 shadow-2xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by email, name, or org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-rule rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-surface border border-rule rounded-xl text-ink focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Action</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-surface border border-rule rounded-xl text-ink focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL">All Channels</option>
              <option value="PORTAL">Portal Requests</option>
              <option value="EMAIL">Email Requests</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="py-2 px-4 rounded-xl text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Inbound Email Request</span>
        </button>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/70 border-b border-rule/70 text-muted uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Requester</th>
                <th className="py-3.5 px-6">Intake Channel</th>
                <th className="py-3.5 px-6">Request Type</th>
                <th className="py-3.5 px-6">Date Received</th>
                <th className="py-3.5 px-6">Target Completion</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const isCompleted = req.status === "COMPLETED";
                  const isRejected = req.status === "REJECTED";
                  const isPendingStatus = !isCompleted && !isRejected;
                  const isErasure = req.type.toUpperCase() === "ERASURE";

                  return (
                    <tr key={req.id} className="hover:bg-surface/30 transition-colors">
                      {/* Requester */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-ink">{req.email}</div>
                        {req.user_name && (
                          <div className="text-[11px] text-muted">{req.user_name}</div>
                        )}
                        {req.org_name && (
                          <div className="text-[10px] text-emerald-800 font-semibold">{req.org_name}</div>
                        )}
                      </td>

                      {/* Intake Channel */}
                      <td className="py-4 px-6">
                        {req.channel?.toUpperCase() === "EMAIL" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            <Mail className="w-3 h-3 text-indigo-600" />
                            Email Intake
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Globe className="w-3 h-3 text-emerald-600" />
                            Client Portal
                          </span>
                        )}
                      </td>

                      {/* Request Type */}
                      <td className="py-4 px-6">
                        {isErasure ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            Right to Erasure
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <FileArchive className="w-3 h-3 text-blue-600" />
                            Data Export (ZIP)
                          </span>
                        )}
                      </td>

                      {/* Date Received */}
                      <td className="py-4 px-6 text-muted font-medium">
                        {req.created_at ? new Date(req.created_at).toISOString().slice(0, 10) : "-"}
                      </td>

                      {/* Target Completion */}
                      <td className="py-4 px-6">
                        {getTargetDaysBadge(req.target_completion_date, isCompleted)}
                        <span className="text-[10px] text-muted block mt-0.5">
                          {req.target_completion_date
                            ? new Date(req.target_completion_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })
                            : "30-day statutory target"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <AdminStatusPill status={req.status} />
                        {req.statutory_retention_notice && (
                          <span className="text-[10px] text-emerald-800 block mt-1 line-clamp-1" title={req.statutory_retention_notice}>
                            Financials Retained (7y)
                          </span>
                        )}
                        {req.rejection_reason && (
                          <span className="text-[10px] text-rose-700 block mt-1 line-clamp-1" title={req.rejection_reason}>
                            {req.rejection_reason}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {isPendingStatus && (
                          <div className="flex items-center justify-end gap-2">
                            {isErasure ? (
                              <button
                                type="button"
                                onClick={() => setErasureModalTarget(req)}
                                disabled={isPending}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Execute Erasure</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleExport(req)}
                                disabled={isPending}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Build &amp; Download ZIP</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalTarget(req);
                                setRejectReason("");
                              }}
                              className="px-2.5 py-1.5 rounded-full text-xs text-muted hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                              title="Reject request with statutory justification"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {isCompleted && !isErasure && (
                          <button
                            type="button"
                            onClick={() => handleExport(req)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold text-ink border border-rule hover:bg-surface transition cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Download ZIP</span>
                          </button>
                        )}

                        {isCompleted && isErasure && (
                          <span className="text-[11px] font-semibold text-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Anonymized &amp; Audited
                          </span>
                        )}

                        {isRejected && (
                          <span className="text-[11px] font-semibold text-muted">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted">
                    No privacy or statutory data requests found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Inbound Email Request */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-rule/80 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-rule/60 pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Log Inbound Privacy Request</h3>
                <p className="text-[11px] text-muted">Record requests received via email or legal notice</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-full text-muted hover:text-ink hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInbound} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Requester Email *</label>
                <input
                  type="email"
                  required
                  placeholder="client@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-rule rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Elizabeth Ochieng"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-rule rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Request Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 bg-surface border border-rule rounded-xl text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="EXPORT">Data Export (ZIP)</option>
                    <option value="ERASURE">Right to Erasure</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Intake Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full p-2.5 bg-surface border border-rule rounded-xl text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="EMAIL">Inbound Email (DPO)</option>
                    <option value="MANUAL">Formal Written Notice</option>
                    <option value="PORTAL">Customer Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Intake Notes / Ticket ID</label>
                <textarea
                  rows={3}
                  placeholder="Reference email thread, client ticket number, or identity verification notes..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-rule rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>30-Day Statutory Clock:</strong> A target completion deadline will be automatically generated 30 days from intake in compliance with Kenya DPA 2019.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule/60">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmittingNew ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Queue Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Right to Erasure Execution */}
      {erasureModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-rose-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3 border-b border-rule/60 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Execute Right to Erasure</h3>
                <p className="text-[11px] text-muted">Data Subject: {erasureModalTarget.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-body">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 space-y-2">
                <p className="font-bold text-rose-900">This action will execute the following:</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>User identity will be permanently anonymized to <code>Redacted Data Subject (GDPR Erasure)</code>.</li>
                  <li>Email will be scrubbed to <code>anonymized_id@deleted.sirotech.co.ke</code>.</li>
                  <li>Password hashes and TOTP authentication credentials will be erased.</li>
                  <li>All active mobile and desktop sessions will be immediately invalidated.</li>
                  <li>Personal support messages and lead comments will be soft-deleted.</li>
                </ul>
              </div>

              <div className="p-4 bg-[#F4F7F5] rounded-2xl border border-emerald-900/10 text-emerald-950 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-ink">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Statutory Tax &amp; Financial Retention</span>
                </div>
                <p>
                  Pursuant to Section 23 of the Kenya Tax Procedures Act (2015), <strong>invoices, payments, and audited accounting ledgers are legally retained</strong> for 7 years. Erasure does NOT delete statutory financial records. (Confirm with your accountant or lawyer).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule/60">
              <button
                type="button"
                onClick={() => setErasureModalTarget(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteErasure}
                disabled={isPending}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm &amp; Execute Erasure</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Request */}
      {rejectModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-rule/80 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-ink">Reject Privacy Request</h3>
            <p className="text-xs text-muted">
              Specify statutory justification for rejecting request from <strong>{rejectModalTarget.email}</strong>:
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Identity verification failed, manifestly unfounded or excessive request under GDPR Art 12(5)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 bg-surface border border-rule rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule/60">
              <button
                type="button"
                onClick={() => setRejectModalTarget(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isPending}
                className="px-5 py-2 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
