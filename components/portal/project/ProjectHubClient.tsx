"use client";

import { portalPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  ReceiptText,
  Download,
  Send,
  Sparkles,
  Upload,
  X,
  Pin,
  Calendar,
  Users,
  ShieldCheck,
  Loader2,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { Card } from "@/components/portal/shared/Card";
import { StatusPill } from "@/components/portal/shared/StatusPill";
import { ProgressBar } from "@/components/portal/shared/ProgressBar";
import { Toast } from "@/components/portal/shared/Toast";
import {
  approveMilestoneAction,
  requestChangesAction,
  sendMessageAction,
  confirmFileUploadAction,
  acceptProposalAction,
} from "@/app/portal/actions";

type HubTab = "overview" | "updates" | "files" | "messages" | "invoices";

interface ProjectHubClientProps {
  project: any;
  user: any;
  proposals: any[];
  invoices: any[];
}

export function ProjectHubClient({ project, user, proposals, invoices }: ProjectHubClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HubTab>("overview");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Per-action loading states
  const [approvingMilestoneId, setApprovingMilestoneId] = useState<string | null>(null);
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Milestone Approval & Change Request States
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [changeFeedback, setChangeFeedback] = useState("");

  // Messaging State
  const [messageInput, setMessageInput] = useState("");

  // File Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadKind, setUploadKind] = useState<"DELIVERABLE" | "DOCUMENT" | "ASSET" | "CONTRACT">("DOCUMENT");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Proposal acceptance state
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Milestone approval handler
  const handleApprove = (milestoneId: string) => {
    setApprovingMilestoneId(milestoneId);
    startTransition(async () => {
      const res = await approveMilestoneAction(milestoneId);
      setApprovingMilestoneId(null);
      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "Milestone approved! Sprint progress has been recalculated.", type: "success" });
        router.refresh();
      }
    });
  };

  // Milestone change request handler
  const handleRequestChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone || !changeFeedback.trim()) return;

    setRequestingChanges(true);
    startTransition(async () => {
      const res = await requestChangesAction(selectedMilestone.id, changeFeedback);
      setRequestingChanges(false);
      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "Changes requested. Engineering lead has been notified.", type: "success" });
        setChangeModalOpen(false);
        setChangeFeedback("");
        router.refresh();
      }
    });
  };

  // Message sending handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const content = messageInput;
    setMessageInput("");
    setSendingMessage(true);

    startTransition(async () => {
      const res = await sendMessageAction(project.id, content);
      setSendingMessage(false);
      if (res.error) {
        setToast({ message: `Failed to send message: ${res.error}`, type: "error" });
      } else {
        router.refresh();
      }
    });
  };

  // Proposal acceptance handler
  const handleAcceptProposal = (proposalId: string) => {
    if (!agreeTerms) {
      setToast({ message: "Please check 'I agree' to accept the terms.", type: "error" });
      return;
    }

    setAcceptingProposalId(proposalId);
    startTransition(async () => {
      const res = await acceptProposalAction(proposalId, true);
      setAcceptingProposalId(null);
      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "Agreement successfully accepted and recorded in audit log.", type: "success" });
        router.refresh();
      }
    });
  };

  // File upload handler
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    // Size limit 25MB check
    if (uploadFile.size > 25 * 1024 * 1024) {
      setUploadError("File exceeds the maximum allowed size of 25 MB.");
      return;
    }

    // Block executables
    const blocked = [".exe", ".bat", ".cmd", ".sh", ".bin", ".msi", ".vbs", ".ps1", ".com"];
    const fileName = uploadFile.name.toLowerCase();
    if (blocked.some((ext) => fileName.endsWith(ext))) {
      setUploadError("Executable and script files are blocked for security.");
      return;
    }

    setUploadingFile(true);
    startTransition(async () => {
      const formattedSize =
        uploadFile.size > 1024 * 1024
          ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(uploadFile.size / 1024)} KB`;

      const storagePath = `org/${user.orgId}/project/${project.id}/${Date.now()}-${uploadFile.name}`;

      const res = await confirmFileUploadAction({
        projectId: project.id,
        name: uploadFile.name,
        size: formattedSize,
        kind: uploadKind,
        storagePath,
        mimeType: uploadFile.type || "application/octet-stream",
        sizeBytes: uploadFile.size,
      });

      setUploadingFile(false);
      if (res.error) {
        setUploadError(res.error);
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: `File "${uploadFile.name}" registered successfully.`, type: "success" });
        setUploadModalOpen(false);
        setUploadFile(null);
        router.refresh();
      }
    });
  };

  const milestones = project.milestones || [];
  const updates = project.updates || [];
  const files = project.files || [];
  const messages = project.messages || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
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
          href={portalPath("/projects")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all projects</span>
        </Link>
        <span className="text-xs text-muted font-mono">{project.slug}</span>
      </div>

      {/* Project Hub Header */}
      <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {project.title}
              </h1>
              <StatusPill status={project.status === "BUILD" ? "In progress" : project.status} />
            </div>
            <p className="text-xs sm:text-sm text-muted max-w-3xl leading-relaxed">
              {project.summary}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            {project.staging_url && (
              <a
                href={project.staging_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Staging Preview</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted" />
              </a>
            )}
            <Link
              href={portalPath("/book")}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Review Call</span>
            </Link>
          </div>
        </div>

        {/* Progress & Target Launch Bar */}
        <div className="pt-4 border-t border-rule/70 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted">Sprint Milestone Completion</span>
              <span className="text-emerald-800 font-extrabold">{project.progress}%</span>
            </div>
            <ProgressBar progress={project.progress} />
          </div>

          <div className="text-xs space-y-1">
            <span className="text-muted block text-[11px] font-semibold uppercase tracking-wider">
              Target Go-Live
            </span>
            <span className="font-bold text-ink">
              {new Date(project.target_launch).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="text-xs space-y-1 bg-surface p-3 rounded-2xl border border-rule/60">
            <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
              Lead Architect
            </span>
            <div className="font-bold text-ink flex items-center justify-between">
              <span>{project.lead_name || "Daniel Siro"}</span>
              <span className="text-[11px] text-emerald-700 font-medium">{project.lead_email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hub Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-rule/80 overflow-x-auto">
        {[
          { id: "overview" as HubTab, label: "Milestones & Scope" },
          { id: "updates" as HubTab, label: `Engineering Updates (${updates.length})` },
          { id: "files" as HubTab, label: `Files & Deliverables (${files.length})` },
          { id: "messages" as HubTab, label: `Team Thread (${messages.length})` },
          { id: "invoices" as HubTab, label: `Invoices (${invoices.length})` },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                active
                  ? "bg-white text-ink shadow-2xs font-bold"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & MILESTONES */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Milestone Deliverables & Sign-Offs</h2>
            <span className="text-xs text-muted">Client approval advances progress</span>
          </div>

          <div className="space-y-4">
            {milestones.map((m: any) => {
              const isApproved = m.status === "APPROVED";
              const isAwaiting = m.status === "AWAITING_APPROVAL";
              const isChangesRequested = m.status === "CHANGES_REQUESTED";

              return (
                <Card
                  key={m.id}
                  className={`p-6 border transition-all ${
                    isAwaiting
                      ? "border-amber-300 bg-amber-50/20 shadow-xs"
                      : "border-rule/80 bg-white"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface text-ink border border-rule">
                          {m.phase}
                        </span>
                        <h3 className="text-base font-bold text-ink">{m.title}</h3>
                        <StatusPill
                          status={
                            isApproved
                              ? "Done"
                              : isAwaiting
                              ? "Waiting for you"
                              : isChangesRequested
                              ? "Changes requested"
                              : "In progress"
                          }
                          size="sm"
                        />
                      </div>

                      <div className="text-xs text-muted">
                        Due:{" "}
                        {new Date(m.due_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {m.approved_at && (
                          <span className="ml-3 text-emerald-700 font-semibold">
                            ✓ Approved on{" "}
                            {new Date(m.approved_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {/* Deliverables Checklist */}
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                          Verified Deliverables:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(m.deliverables || []).map((d: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-rule/60 text-xs text-ink"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {m.feedback && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mt-2">
                          <span className="font-bold">Client Notes:</span> {m.feedback}
                        </div>
                      )}
                    </div>

                    {/* Action buttons: Only client can approve or request changes */}
                    <div className="flex items-center gap-2 lg:self-center shrink-0">
                      {isAwaiting && (
                        <>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setSelectedMilestone(m);
                              setChangeModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Request Changes
                          </button>

                          <button
                            type="button"
                            disabled={approvingMilestoneId === m.id || isPending}
                            onClick={() => handleApprove(m.id)}
                            className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {approvingMilestoneId === m.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{approvingMilestoneId === m.id ? "Approving..." : "Approve Milestone"}</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved & Signed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Proposals / Agreements Section */}
          {proposals.length > 0 && (
            <div className="pt-6 border-t border-rule space-y-4">
              <h2 className="text-base font-bold text-ink">Active Proposals & SLAs</h2>
              {proposals.map((prop: any) => (
                <Card key={prop.id} className="p-5 border border-rule/80 bg-white space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-ink">
                        {prop.title}{" "}
                        <span className="text-xs font-normal text-muted">({prop.version})</span>
                      </h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed">{prop.summary}</p>
                    </div>

                    {prop.is_accepted ? (
                      <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepted</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="rounded border-rule text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-ink">I agree to terms</span>
                        </label>

                        <button
                          type="button"
                          disabled={acceptingProposalId === prop.id || isPending || !agreeTerms}
                          onClick={() => handleAcceptProposal(prop.id)}
                          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {acceptingProposalId === prop.id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          )}
                          <span>{acceptingProposalId === prop.id ? "Recording..." : "Accept Agreement"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENGINEERING UPDATES */}
      {activeTab === "updates" && (
        <div className="space-y-4">
          {updates.length === 0 ? (
            <Card className="p-8 text-center bg-white border border-rule/80">
              <p className="text-xs text-muted">No sprint updates posted yet.</p>
            </Card>
          ) : (
            updates.map((upd: any) => (
              <Card key={upd.id} className="p-6 border border-rule/80 bg-white space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {upd.is_pinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sage-100 text-sage-900 border border-sage-300">
                        Pinned
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-ink">{upd.title}</h3>
                  </div>
                  <span className="text-[11px] text-muted">
                    {new Date(upd.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-body leading-relaxed">{upd.body}</p>
                <div className="text-[11px] text-muted font-medium pt-2 border-t border-rule/60">
                  Author: <span className="text-ink font-semibold">{upd.author_name}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FILES & DELIVERABLES */}
      {activeTab === "files" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Deliverables & Documents</h2>
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <Card className="divide-y divide-rule/70 border border-rule/80 bg-white overflow-hidden">
            {files.length === 0 ? (
              <p className="p-8 text-xs text-muted text-center">No files uploaded yet.</p>
            ) : (
              files.map((file: any) => (
                <div
                  key={file.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface border border-rule flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-ink truncate">{file.name}</div>
                      <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.kind}</span>
                        <span>•</span>
                        <span>Uploaded by {file.uploaded_by}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`/api/files/${file.id}`}
                    download
                    className="px-3.5 py-1.5 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Download className="w-3 h-3 text-muted" />
                    <span>Download</span>
                  </a>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: MESSAGES & TEAM THREAD */}
      {activeTab === "messages" && (
        <Card className="p-6 border border-rule/80 bg-white space-y-6">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">No messages in this thread yet.</p>
            ) : (
              messages.map((msg: any) => {
                const isMe = msg.author_id === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-ink">
                        {isMe ? `${user.name} (You)` : msg.author_name}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? "bg-emerald-600 text-white rounded-br-xs"
                          : "bg-surface text-ink border border-rule/80 rounded-bl-xs"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-rule flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type message to lead engineering team..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
            />
            <button
              type="submit"
              disabled={sendingMessage || isPending || !messageInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {sendingMessage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{sendingMessage ? "Sending..." : "Send"}</span>
            </button>
          </form>
        </Card>
      )}

      {/* TAB 5: INVOICES */}
      {activeTab === "invoices" && (
        <Card className="divide-y divide-rule/70 border border-rule/80 bg-white overflow-hidden">
          {invoices.length === 0 ? (
            <p className="p-8 text-xs text-muted text-center">No invoices issued for this project.</p>
          ) : (
            invoices.map((inv: any) => (
              <div
                key={inv.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-ink">{inv.invoice_number}</span>
                    <StatusPill status={inv.status === "PAID" ? "Paid" : "Waiting for you"} size="sm" />
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Due:{" "}
                    {new Date(inv.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-ink">
                      KES {Number(inv.amount_kes).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-muted">
                      ≈ ${Number(inv.amount_usd).toLocaleString()} USD
                    </div>
                  </div>

                  <Link
                    href={portalPath(`/invoices`)}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    View & Pay
                  </Link>
                </div>
              </div>
            ))
          )}
        </Card>
      )}

      {/* MODAL: Request Changes on Milestone */}
      {changeModalOpen && selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">
                Request Changes: {selectedMilestone.phase}
              </h3>
              <button
                type="button"
                onClick={() => setChangeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Please specify the modifications, edge-cases, or adjustments required before sprint
              acceptance.
            </p>

            <form onSubmit={handleRequestChanges} className="space-y-4">
              <textarea
                required
                rows={4}
                value={changeFeedback}
                onChange={(e) => setChangeFeedback(e.target.value)}
                placeholder="Describe feedback or acceptance criteria..."
                className="w-full p-3 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setChangeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-rule hover:bg-surface text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingChanges || isPending || !changeFeedback.trim()}
                  className="px-5 py-2 rounded-xl bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {requestingChanges && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{requestingChanges ? "Submitting..." : "Submit Change Request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload File */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Upload Project Document</h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Document Type</label>
                <select
                  value={uploadKind}
                  onChange={(e: any) => setUploadKind(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule/80 text-xs text-ink"
                >
                  <option value="DOCUMENT">Project Document</option>
                  <option value="DELIVERABLE">Deliverable / Code / Binary</option>
                  <option value="CONTRACT">Contract / Agreement</option>
                  <option value="ASSET">Asset / Media</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Select File (Max 25 MB)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-surface file:text-xs file:font-semibold hover:file:bg-rule"
                />
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-rule hover:bg-surface text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile || isPending || !uploadFile}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {uploadingFile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{uploadingFile ? "Uploading..." : "Upload File"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
