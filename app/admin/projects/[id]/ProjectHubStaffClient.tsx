"use client";

import { adminPath, portalUrl } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  addProjectMilestoneAction,
  updateProjectMilestoneStatusAction,
  postProjectUpdateAction,
  postProjectMessageAction,
  createProjectProposalAction,
  updateProjectDetailsAction,
  deleteProjectAction,
  acceptProjectRequestAction,
  saveDeliveryNotesAction
} from "@/app/admin/actions";
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Receipt,
  ExternalLink,
  Plus,
  GitBranch,
  UploadCloud,
  Send,
  Pin,
  Lock,
  Eye,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  ShieldCheck,
  FileCheck,
  Edit2,
  Loader2,
  Trash2
} from "lucide-react";

export interface ProjectHubPerms {
  projectsWrite: boolean;
  milestonesWrite: boolean;
  updatesPost: boolean;
  messagesWrite: boolean;
  proposalsSend: boolean;
  internal: boolean;
}

const ALL_PERMS: ProjectHubPerms = {
  projectsWrite: true,
  milestonesWrite: true,
  updatesPost: true,
  messagesWrite: true,
  proposalsSend: true,
  internal: true
};

export function ProjectHubStaffClient({
  project,
  organizations = [],
  perms = ALL_PERMS
}: {
  project: any;
  organizations?: any[];
  /** Hides controls the person can't use. Cosmetic: every action is checked on the server. */
  perms?: ProjectHubPerms;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "milestones" | "updates" | "files" | "messages" | "proposals" | "invoices"
  >("overview");
  const [isPending, startTransition] = useTransition();

  // Edit Project Modal state
  const [showEditProject, setShowEditProject] = useState(false);
  const [editOrgId, setEditOrgId] = useState(project.org_id || "");
  const [editTitle, setEditTitle] = useState(project.title || "");
  const [editSummary, setEditSummary] = useState(project.summary || "");
  const [editStatus, setEditStatus] = useState(project.status || "PLANNING");
  const [editProgress, setEditProgress] = useState(project.progress ?? 0);
  const [editTargetLaunch, setEditTargetLaunch] = useState(
    project.target_launch ? new Date(project.target_launch).toISOString().split("T")[0] : ""
  );
  const [editStagingUrl, setEditStagingUrl] = useState(project.staging_url || "");
  const [editRepoUrl, setEditRepoUrl] = useState(project.repo_url || "");
  const [editNextStepSummary, setEditNextStepSummary] = useState(project.next_step_summary || "");

  const handleSaveProjectDetails = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateProjectDetailsAction(project.id, {
        orgId: editOrgId,
        title: editTitle.trim(),
        summary: editSummary.trim(),
        status: editStatus,
        progress: Number(editProgress),
        targetLaunch: editTargetLaunch || undefined,
        stagingUrl: editStagingUrl.trim() || undefined,
        repoUrl: editRepoUrl.trim() || undefined,
        nextStepSummary: editNextStepSummary.trim() || undefined
      });
      setShowEditProject(false);
      router.refresh();
    });
  };

  const handleDeleteProject = () => {
    if (!confirm(`Are you sure you want to permanently delete "${project.title}" and all its milestones, updates, files, and deliverables? This action cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteProjectAction(project.id);
      if (res?.success) {
        router.push(adminPath("/projects"));
      }
    });
  };

  // Milestone Add Modal state
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [mPhase, setMPhase] = useState("Phase 4");
  const [mTitle, setMTitle] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mDueDate, setMDueDate] = useState("");

  // Update Composer state
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [updatePinned, setUpdatePinned] = useState(false);

  // Message Composer state
  const [messageText, setMessageText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Proposal Modal state
  const [showAddProposal, setShowAddProposal] = useState(false);
  const [propTitle, setPropTitle] = useState("Engineering SOW & Architecture Specification");
  const [propAmount, setPropAmount] = useState(350000);
  const [propSummary, setPropSummary] = useState("Detailed scope covering backend services, Next.js interface, and staging deployment.");

  // Re-submit milestone modal state
  const [resubmitModalMilestone, setResubmitModalMilestone] = useState<any | null>(null);
  const [resubmitComment, setResubmitComment] = useState("");

  const changesRequestedMilestones = project.milestones?.filter((m: any) => m.status === "CHANGES_REQUESTED") || [];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "milestones", label: `Milestones (${project.milestones?.length || 0})` },
    { id: "updates", label: `Updates (${project.updates?.length || 0})` },
    { id: "files", label: `Files (${project.files?.length || 0})` },
    { id: "messages", label: `Messages (${project.messages?.length || 0})` },
    { id: "proposals", label: `Proposals (${project.proposals?.length || 0})` },
    { id: "invoices", label: `Invoices (${project.invoices?.length || 0})` }
  ] as const;

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim()) return;

    startTransition(async () => {
      await addProjectMilestoneAction(project.id, {
        phase: mPhase,
        title: mTitle.trim(),
        description: mDesc.trim(),
        dueDate: mDueDate
      });
      setShowAddMilestone(false);
      setMTitle("");
      setMDesc("");
      router.refresh();
    });
  };

  const handleMilestoneStatus = (milestoneId: string, status: string, comment?: string) => {
    startTransition(async () => {
      await updateProjectMilestoneStatusAction(milestoneId, status, comment);
      router.refresh();
    });
  };

  const handleResubmitWithComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitModalMilestone) return;

    startTransition(async () => {
      await updateProjectMilestoneStatusAction(
        resubmitModalMilestone.id,
        "AWAITING_APPROVAL",
        resubmitComment.trim() || undefined
      );
      setResubmitModalMilestone(null);
      setResubmitComment("");
      router.refresh();
    });
  };

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateBody.trim()) return;

    startTransition(async () => {
      await postProjectUpdateAction(project.id, {
        title: updateTitle.trim(),
        body: updateBody.trim(),
        isPinned: updatePinned
      });
      setUpdateTitle("");
      setUpdateBody("");
      setUpdatePinned(false);
      router.refresh();
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    startTransition(async () => {
      await postProjectMessageAction(project.id, messageText.trim(), isInternalNote);
      setMessageText("");
      router.refresh();
    });
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim()) return;

    startTransition(async () => {
      await createProjectProposalAction(project.id, {
        title: propTitle.trim(),
        summary: propSummary.trim(),
        amountKes: Number(propAmount)
      });
      setShowAddProposal(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 border-b border-rule/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-t-2xl whitespace-nowrap transition-colors cursor-pointer border-b-2 inline-flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-[#1B2E24] text-ink bg-white font-bold shadow-2xs"
                : "border-transparent text-muted hover:text-ink hover:bg-surface/60"
            }`}
          >
            <span>{tab.label}</span>
            {tab.id === "milestones" && changesRequestedMilestones.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                {changesRequestedMilestones.length} Revision{changesRequestedMilestones.length > 1 ? "s" : ""}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {project.status === "REQUESTED" && (
              <ProjectRequestPanel project={project} canScope={perms.projectsWrite} />
            )}
            {perms.internal && <DeliveryNotesPanel projectId={project.id} initialNotes={project.delivery_notes || ""} />}
            {changesRequestedMilestones.length > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-950">
                        Action Required: Client Requested Changes on {changesRequestedMilestones.length} Milestone{changesRequestedMilestones.length > 1 ? "s" : ""}
                      </h4>
                      <p className="text-xs text-rose-900/80 mt-0.5">
                        The client has reviewed deliverables and submitted revision requests.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("milestones")}
                    className="px-4 py-2 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
                  >
                    View in Milestones &rarr;
                  </button>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-rose-200/80">
                  {changesRequestedMilestones.map((crm: any) => (
                    <div key={crm.id} className="p-3.5 rounded-2xl bg-white/95 border border-rose-200/80 shadow-2xs text-xs space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-ink">{crm.phase} — {crm.title}</span>
                        <AdminStatusPill status={crm.status} />
                      </div>
                      <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-200/50 text-ink/90 font-medium whitespace-pre-wrap leading-relaxed">
                        <span className="font-bold text-rose-900 block text-[11px] uppercase tracking-wider mb-0.5">Client Feedback:</span>
                        "{crm.feedback}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Project Blueprint &amp; Summary</h3>
                <AdminStatusPill status={project.status} />
              </div>
              <p className="text-xs sm:text-sm text-body leading-relaxed">{project.summary}</p>
            </div>

            {/* "What Happens Next" Client Guidance */}
            <div className="p-6 sm:p-8 rounded-3xl bg-sage-100/70 border border-sage-300 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CompassIcon className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-ink">What Happens Next (Client View)</h3>
              </div>
              <p className="text-xs text-body leading-relaxed">
                {project.next_step_summary ||
                  "The engineering team is currently prototyping the active sprint milestone deliverables. Once staging preview builds pass automated verification, you will receive an approval request to review."}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-ink">Repository &amp; Staging Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {project.staging_url ? (
                  <a
                    href={project.staging_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl bg-surface border border-rule/70 hover:border-emerald-600/50 flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-ink block">Staging Environment</span>
                      <span className="text-muted text-[11px] truncate block">{project.staging_url}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-emerald-700" />
                  </a>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-surface border border-rule/70 text-muted">
                    Staging link not configured
                  </div>
                )}

                {project.repo_url ? (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl bg-surface border border-rule/70 hover:border-emerald-600/50 flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-ink block">GitHub Repository</span>
                      <span className="text-muted text-[11px] truncate block">{project.repo_url}</span>
                    </div>
                    <GitBranch className="w-3.5 h-3.5 text-muted group-hover:text-emerald-700" />
                  </a>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-surface border border-rule/70 text-muted">
                    Private repo not attached
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Sprint Health</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  On Track
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted">
                  <span>Sprint Completion</span>
                  <span className="font-bold text-ink">{project.progress}%</span>
                </div>
                <div className="w-full bg-rule/70 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
              <div className="pt-2 text-xs space-y-2 border-t border-rule/60">
                <div className="flex justify-between">
                  <span className="text-muted">Target Launch:</span>
                  <span className="font-semibold text-ink">
                    {project.target_launch
                      ? new Date(project.target_launch).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })
                      : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Client Organization:</span>
                  <Link href={adminPath(`/clients/${project.org_id}`)} className="font-semibold text-emerald-700 hover:underline">
                    {project.org_name}
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 space-y-2 border-t border-rule/60">
                <button
                  type="button"
                  hidden={!perms.projectsWrite}
                  onClick={() => setShowEditProject(true)}
                  className="w-full py-2 px-3 rounded-xl bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Project / Reassign Org</span>
                </button>
                <a
                  href={portalUrl(`/projects/${project.id}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-surface border border-rule/70 hover:border-emerald-600/50 text-xs font-semibold text-ink flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>View in Client Portal</span>
                  <ExternalLink className="w-3 h-3 text-muted ml-auto" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Milestones */}
      {activeTab === "milestones" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Sprint Deliverables &amp; Milestones</h3>
              <p className="text-xs text-muted">Client approvals advance overall project progress.</p>
            </div>
            <button
              type="button"
              hidden={!perms.milestonesWrite}
              onClick={() => setShowAddMilestone(true)}
              className="py-1.5 px-3.5 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="space-y-4">
            {project.milestones && project.milestones.map((m: any) => {
              const isChangesRequested = m.status === "CHANGES_REQUESTED";
              const isAwaitingApproval = m.status === "AWAITING_APPROVAL" || m.status === "READY_FOR_APPROVAL";
              const isApproved = m.status === "APPROVED";

              return (
                <div
                  key={m.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    isChangesRequested
                      ? "bg-rose-50/20 border-rose-300 shadow-xs"
                      : isAwaitingApproval
                      ? "bg-amber-50/15 border-amber-300/80 shadow-2xs"
                      : "bg-surface/50 border-rule/60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-ink font-mono">{m.phase}</span>
                        <AdminStatusPill status={m.status} />
                        {m.due_date && (
                          <span className="text-[11px] text-muted flex items-center gap-1 font-medium ml-1">
                            <Clock className="w-3 h-3 text-muted" />
                            Target: {new Date(m.due_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        {m.completed_date && isApproved && (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 ml-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Completed {new Date(m.completed_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-ink">{m.title}</h4>
                      {m.description && <p className="text-xs text-body leading-relaxed">{m.description}</p>}
                    </div>

                    <div className={`flex items-center gap-2 shrink-0 flex-wrap ${perms.milestonesWrite ? "" : "hidden"}`}>
                      {isChangesRequested && (
                        <>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setResubmitModalMilestone(m);
                              setResubmitComment("");
                            }}
                            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>Re-submit for Sign-off</span>
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleMilestoneStatus(m.id, "IN_PROGRESS")}
                            className="px-3 py-1.5 rounded-full text-xs font-medium text-ink bg-white border border-rule hover:bg-surface transition-colors cursor-pointer"
                          >
                            Mark In Progress
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleMilestoneStatus(m.id, "APPROVED")}
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        </>
                      )}

                      {!isApproved && !isAwaitingApproval && !isChangesRequested && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleMilestoneStatus(m.id, "AWAITING_APPROVAL")}
                          className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          Ready for Client Approval
                        </button>
                      )}

                      {isAwaitingApproval && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Awaiting Client Sign-off
                        </span>
                      )}

                      {!isApproved && !isChangesRequested && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleMilestoneStatus(m.id, "APPROVED")}
                          className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      )}

                      {isApproved && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleMilestoneStatus(m.id, "IN_PROGRESS")}
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-muted hover:text-ink border border-rule transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Deliverables tags */}
                  {m.deliverables && m.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {m.deliverables.map((d: string, dIdx: number) => (
                        <span key={dIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-rule/70 text-[11px] text-body">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{d}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Client Change Request / Feedback Callout */}
                  {m.feedback && (
                    <div className={`mt-3.5 p-4 rounded-2xl border text-xs leading-relaxed ${
                      isChangesRequested
                        ? "bg-rose-50/90 border-rose-300 text-rose-950"
                        : "bg-amber-50/80 border-amber-300 text-amber-950"
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <AlertTriangle className={`w-4 h-4 shrink-0 ${
                            isChangesRequested ? "text-rose-600" : "text-amber-600"
                          }`} />
                          <span className="uppercase tracking-wider">
                            {isChangesRequested ? "Client Change Request (Action Required)" : "Previous Client Feedback"}
                          </span>
                        </div>
                        {m.updated_at && (
                          <span className="text-[11px] opacity-75 font-normal">
                            Received {new Date(m.updated_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                      <div className="bg-white/95 p-3.5 rounded-xl border border-rose-200/70 shadow-2xs text-ink font-medium whitespace-pre-wrap text-xs sm:text-sm">
                        {m.feedback}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Milestone Modal */}
          {showAddMilestone && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
                <h3 className="text-base font-bold text-ink">Add Deliverable Milestone</h3>
                <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-ink block mb-1">Phase</label>
                    <input
                      type="text"
                      required
                      value={mPhase}
                      onChange={(e) => setMPhase(e.target.value)}
                      placeholder="e.g. Phase 4 or Sprint 3"
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-ink block mb-1">Milestone Title</label>
                    <input
                      type="text"
                      required
                      value={mTitle}
                      onChange={(e) => setMTitle(e.target.value)}
                      placeholder="e.g. M-Pesa Checkout &amp; Webhook Integration"
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-ink block mb-1">Deliverable Scope</label>
                    <textarea
                      rows={3}
                      value={mDesc}
                      onChange={(e) => setMDesc(e.target.value)}
                      placeholder="Specify test criteria and client verification steps..."
                      className="w-full p-2.5 rounded-xl bg-surface border border-rule text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-ink block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={mDueDate}
                      onChange={(e) => setMDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMilestone(false)}
                      className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Re-submit Milestone with Revision Notes Modal */}
          {resubmitModalMilestone && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-ink">Re-submit Milestone for Client Approval</h3>
                    <p className="text-xs text-muted mt-0.5">{resubmitModalMilestone.phase} — {resubmitModalMilestone.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResubmitModalMilestone(null)}
                    className="w-8 h-8 rounded-full bg-surface hover:bg-rule/80 text-muted hover:text-ink flex items-center justify-center text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1.5">
                  <span className="font-bold block uppercase tracking-wider text-[11px] text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Client's Requested Changes:
                  </span>
                  <p className="font-medium text-ink bg-white/90 p-3 rounded-xl border border-rose-200/60 leading-relaxed whitespace-pre-wrap">
                    "{resubmitModalMilestone.feedback}"
                  </p>
                </div>

                <form onSubmit={handleResubmitWithComment} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-ink block mb-1">
                      Staff Resolution Note for Client (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={resubmitComment}
                      onChange={(e) => setResubmitComment(e.target.value)}
                      placeholder="Explain how the revision was addressed (e.g. 'Added logout warning prompt modal across desktop and mobile views')..."
                      className="w-full p-3 rounded-xl bg-surface border border-rule text-xs"
                    />
                    <p className="text-[11px] text-muted mt-1">
                      This will also publish an official sprint update so the client is informed of your resolution.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResubmitModalMilestone(null)}
                      className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                    >
                      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Re-submit to Client</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Updates */}
      {activeTab === "updates" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-ink">Engineering Sprint Updates</h3>

          {/* New Update Composer */}
          <form onSubmit={handlePostUpdate} hidden={!perms.updatesPost} className="p-5 rounded-2xl bg-surface/50 border border-rule/60 space-y-3 text-xs">
            <h4 className="font-bold text-ink">Post New Sprint Update</h4>
            <input
              type="text"
              required
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="Update title (e.g. Sprint 2: Core Auth &amp; Database Indexing Completed)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-rule text-xs"
            />
            <textarea
              rows={3}
              required
              value={updateBody}
              onChange={(e) => setUpdateBody(e.target.value)}
              placeholder="What was built, staging previews available, and next week focus..."
              className="w-full p-3 rounded-xl bg-white border border-rule text-xs"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
                <input
                  type="checkbox"
                  checked={updatePinned}
                  onChange={(e) => setUpdatePinned(e.target.checked)}
                  className="rounded text-emerald-700"
                />
                <span>Pin update to top of client portal</span>
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Update</span>
              </button>
            </div>
          </form>

          <div className="divide-y divide-rule/60 text-xs">
            {project.updates && project.updates.map((u: any) => (
              <div key={u.id} className="py-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">{u.title}</span>
                    {u.is_pinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5" />
                        Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-muted text-[11px]">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-body leading-relaxed">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Files */}
      {activeTab === "files" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Deliverable Documents &amp; Architecture Files</h3>
            <span className="text-xs text-muted">Uploads stored in Cloudflare R2</span>
          </div>

          <div className="divide-y divide-rule/60 text-xs">
            {project.files && project.files.map((f: any) => (
              <div key={f.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">{f.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface border border-rule text-muted">
                      {f.kind || "Deliverable"}
                    </span>
                  </div>
                  <span className="text-muted block text-[11px] mt-0.5">
                    {(Number(f.size_bytes || 0) / 1024).toFixed(0)} KB &bull; Uploaded {new Date(f.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-surface hover:bg-sage-100 text-ink border border-rule"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Messages */}
      {activeTab === "messages" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Project Communication &amp; Notes</h3>
              <p className="text-xs text-muted">Direct client thread with staff-only internal note toggle.</p>
            </div>
            {isInternalNote && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-700" />
                Staff Internal Note Mode (Hidden from client)
              </span>
            )}
          </div>

          {/* Messages Feed */}
          <div className="space-y-3 min-h-[180px] max-h-[420px] overflow-y-auto p-4 rounded-2xl bg-surface/30 border border-rule/60">
            {project.messages && project.messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl text-xs max-w-xl space-y-1 ${
                  msg.is_internal
                    ? "mr-auto bg-amber-50 border border-amber-300 text-amber-950"
                    : msg.author_role === "STAFF"
                    ? "ml-auto bg-[#1B2E24] text-white"
                    : "mr-auto bg-white border border-rule text-ink"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                  <span className="font-bold flex items-center gap-1">
                    {msg.is_internal && <Lock className="w-2.5 h-2.5" />}
                    {msg.author_name} ({msg.is_internal ? "Internal Staff Note" : msg.author_role})
                  </span>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content || msg.body}</p>
              </div>
            ))}
          </div>

          {/* Message Composer */}
          <form onSubmit={handleSendMessage} hidden={!perms.messagesWrite} className="space-y-3">
            <textarea
              rows={3}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={isInternalNote ? "Write a private internal note for the staff team..." : "Write a direct message to the client organization..."}
              className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm focus:outline-none ${
                isInternalNote ? "bg-amber-50/50 border-amber-300 text-amber-950" : "bg-surface border-rule/80 text-ink"
              }`}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded text-amber-700"
                />
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-700" />
                  Internal Note (Confidential)
                </span>
              </label>

              <button
                type="submit"
                disabled={isPending}
                className={`px-5 py-2 rounded-full font-bold text-xs text-white cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                  isInternalNote ? "bg-amber-800 hover:bg-amber-900" : "bg-[#1B2E24] hover:bg-black"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isInternalNote ? "Save Internal Note" : "Send Client Message"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 6: Proposals */}
      {activeTab === "proposals" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Engineering Proposals &amp; SOWs</h3>
            <button
              type="button"
              hidden={!perms.proposalsSend}
              onClick={() => setShowAddProposal(true)}
              className="py-1.5 px-3.5 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach New SOW</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {project.proposals && project.proposals.map((prop: any) => (
              <div key={prop.id} className="p-4 rounded-2xl bg-surface/60 border border-rule/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink text-sm block">{prop.title}</span>
                  <span className="text-muted text-[11px] block">{prop.summary}</span>
                  <div className="mt-1 font-bold text-ink font-mono">
                    KES {Number(prop.amount_kes || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${prop.is_accepted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {prop.is_accepted ? "Accepted" : "Pending Sign-off"}
                  </span>
                  {prop.accepted_at && (
                    <div className="text-[10px] text-muted mt-1 font-mono">
                      Signed: {new Date(prop.accepted_at).toLocaleString()} (IP: {prop.accepted_ip || "127.0.0.1"})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* New Proposal Modal */}
          {showAddProposal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
                <h3 className="text-base font-bold text-ink">Issue Engineering Proposal (SOW)</h3>
                <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-ink block mb-1">Proposal Title</label>
                    <input
                      type="text"
                      required
                      value={propTitle}
                      onChange={(e) => setPropTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-ink block mb-1">Total Fee (KES)</label>
                    <input
                      type="number"
                      required
                      value={propAmount}
                      onChange={(e) => setPropAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-ink block mb-1">Scope Summary</label>
                    <textarea
                      rows={3}
                      value={propSummary}
                      onChange={(e) => setPropSummary(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-surface border border-rule"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProposal(false)}
                      className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer"
                    >
                      Dispatch Proposal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Invoices */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Project Milestone Invoices</h3>
            <Link
              href={adminPath(`/invoices?create=true&projectId=${project.id}`)}
              className="py-1.5 px-3.5 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Project Invoice</span>
            </Link>
          </div>

          <div className="divide-y divide-rule/60 text-xs">
            {project.invoices && project.invoices.map((inv: any) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink block">{inv.invoice_number}</span>
                  <span className="text-muted text-[11px] block">Due: {new Date(inv.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <AdminStatusPill status={inv.status} />
                  <span className="font-bold text-ink">KES {Number(inv.amount_kes || 0).toLocaleString()}</span>
                  <Link href={adminPath(`/invoices/${inv.id}`)} className="text-emerald-700 hover:underline font-semibold">
                    Manage &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Project Details Modal */}
      {showEditProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-rule/80 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rule/60">
              <h3 className="text-base font-bold text-ink">Edit Project Settings</h3>
              <button
                type="button"
                onClick={() => setShowEditProject(false)}
                className="text-xs text-muted hover:text-ink cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProjectDetails} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Client Organization</label>
                <select
                  value={editOrgId}
                  onChange={(e) => setEditOrgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-medium text-xs"
                >
                  {organizations.map((org: any) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1">
                  Changing this assigns the project to another client organization so their users can view it.
                </p>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-semibold"
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="DESIGN">DESIGN</option>
                    <option value="BUILD">BUILD</option>
                    <option value="TESTING">TESTING</option>
                    <option value="LIVE">LIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Progress ({editProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Target Launch Date</label>
                <input
                  type="date"
                  value={editTargetLaunch}
                  onChange={(e) => setEditTargetLaunch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Project Summary / Scope</label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Next Step Guidance (Client View)</label>
                <textarea
                  rows={2}
                  value={editNextStepSummary}
                  onChange={(e) => setEditNextStepSummary(e.target.value)}
                  placeholder="Shown to client under 'What Happens Next'..."
                  className="w-full p-2.5 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Staging Preview URL</label>
                  <input
                    type="url"
                    value={editStagingUrl}
                    onChange={(e) => setEditStagingUrl(e.target.value)}
                    placeholder="https://preview.sirotech.dev/..."
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Repository URL</label>
                  <input
                    type="url"
                    value={editRepoUrl}
                    onChange={(e) => setEditRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-red-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-red-50/70 border border-red-200">
                  <div>
                    <span className="font-bold text-red-950 block">Danger Zone: Delete Project</span>
                    <span className="text-[11px] text-red-800">Permanently delete this project and all associated deliverables.</span>
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleDeleteProject}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Project</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-rule/50">
                <button
                  type="button"
                  onClick={() => setShowEditProject(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CompassIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx={12} cy={12} r={10} />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

/** Hand-off from the client manager: brief, budget and deadline, waiting for delivery to scope it. */
function ProjectRequestPanel({ project, canScope }: { project: any; canScope: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const accept = () =>
    startTransition(async () => {
      const res = await acceptProjectRequestAction(project.id);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 space-y-3 text-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-amber-950">Project request: awaiting scoping</h3>
          <p className="text-amber-900 mt-0.5">
            {project.requested_by_name ? `Requested by ${project.requested_by_name}. ` : ""}
            Hidden from the client portal until it&apos;s accepted.
          </p>
        </div>
        {canScope && (
          <button
            type="button"
            disabled={isPending}
            onClick={accept}
            className="px-4 py-2 rounded-full bg-[#1B2E24] hover:bg-black text-white font-bold cursor-pointer shrink-0"
          >
            {isPending ? "Accepting…" : "Accept and start planning"}
          </button>
        )}
      </div>
      {project.brief && <p className="whitespace-pre-wrap text-ink leading-relaxed bg-white/70 rounded-2xl p-3 border border-amber-200">{project.brief}</p>}
      <div className="flex flex-wrap gap-4 text-amber-950">
        {project.budget_kes != null && <span><b>Budget:</b> KES {Number(project.budget_kes).toLocaleString()}</span>}
        {project.target_launch && <span><b>Deadline:</b> {new Date(project.target_launch).toLocaleDateString()}</span>}
      </div>
      {error && <p className="text-rose-700 font-semibold">{error}</p>}
    </div>
  );
}

/** Delivery's private notes (projects:internal). The client manager never receives this field. */
function DeliveryNotesPanel({ projectId, initialNotes }: { projectId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const save = () =>
    startTransition(async () => {
      const res = await saveDeliveryNotesAction(projectId, notes);
      setSaved(res?.error ? res.error : "Saved");
      setTimeout(() => setSaved(null), 3000);
    });
  return (
    <div className="p-5 rounded-3xl bg-white border border-rule/80 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink inline-flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-700" /> Private delivery notes
        </h3>
        <span className="text-muted">Only people with delivery access see these.</span>
      </div>
      <textarea
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Technical risks, estimates, internal decisions…"
        className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={isPending} className="px-4 py-1.5 rounded-full bg-[#1B2E24] text-white font-semibold cursor-pointer">
          {isPending ? "Saving…" : "Save notes"}
        </button>
        {saved && <span className="text-muted">{saved}</span>}
      </div>
    </div>
  );
}
