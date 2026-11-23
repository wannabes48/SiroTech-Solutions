"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  startImpersonationAction,
  editClientBillingDetailsAction,
  inviteOrgUserAction,
  removeOrgUserAction,
  changeOrgUserRoleAction,
  deactivateOrgAction,
  reactivateOrgAction,
  deleteOrganizationAction,
  deleteProjectAction,
  resendClientPortalInviteAction,
  revokeAccessAction,
  setAccountActiveAction
} from "@/app/admin/actions";
import { ACCESS_STATUS_LABEL, type AccessStatus } from "@/lib/access-status";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  Building2,
  Mail,
  Receipt,
  FolderGit2,
  Users,
  Eye,
  Loader2,
  ArrowRight,
  ShieldAlert,
  ExternalLink,
  Edit2,
  UserPlus,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Send,
  RefreshCw,
  X
} from "lucide-react";

export function ClientDetailClient({ client }: { client: any }) {
  const router = useRouter();
  const [impersonating, setImpersonating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDeactivated = Boolean(client.name?.startsWith("[DEACTIVATED]"));
  const cleanOrgName = client.name?.replace(/^\[DEACTIVATED\]\s*/i, "").trim() || client.name;

  // Modals & Feedback state
  const [showEditBilling, setShowEditBilling] = useState(false);
  const [billingName, setBillingName] = useState(cleanOrgName);
  const [billingEmail, setBillingEmail] = useState(client.billing_email || "");
  const [taxPin, setTaxPin] = useState(client.tax_pin || "");
  const [currency, setCurrency] = useState(client.currency || "KES");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");

  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingOrg, setDeletingOrg] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [invitingEmail, setInvitingEmail] = useState<string | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  const handleImpersonate = () => {
    setImpersonating(true);
    startTransition(async () => {
      const res = await startImpersonationAction(client.id);
      if (res?.success) {
        window.location.href = adminPath();
      }
    });
  };

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await editClientBillingDetailsAction(client.id, {
        name: billingName.trim(),
        billingEmail: billingEmail.trim(),
        taxPin: taxPin.trim(),
        currency
      });
      setShowEditBilling(false);
      showToast("Company billing profile updated successfully.");
      router.refresh();
    });
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const targetEmail = inviteEmail.trim();
    startTransition(async () => {
      // Creates the profile + membership, then sends an invite or sign-in link; shows the real outcome.
      const res = await inviteOrgUserAction(client.id, targetEmail, inviteName.trim(), inviteRole);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteName("");
      startCooldown(targetEmail, (res as any)?.retryAfterSeconds || 60);
      if ((res as any)?.error) showToast((res as any).error, "error");
      else showToast(`${(res as any)?.message || "Invite sent"} to ${targetEmail}.`);
      router.refresh();
    });
  };

  // Visible 60s resend cooldown per address (matches Supabase's per-address interval)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const startCooldown = (email: string, seconds = 60) => setCooldowns((c) => ({ ...c, [email]: seconds }));
  React.useEffect(() => {
    if (!Object.values(cooldowns).some((v) => v > 0)) return;
    const t = setTimeout(
      () => setCooldowns((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, Math.max(0, v - 1)]))),
      1000
    );
    return () => clearTimeout(t);
  }, [cooldowns]);

  const handleSendInviteToUser = (email: string, name?: string, role?: string) => {
    setInvitingEmail(email);
    startTransition(async () => {
      const res = await resendClientPortalInviteAction({
        orgId: client.id,
        email,
        name,
        role: role || "MEMBER"
      });
      setInvitingEmail(null);
      if (res?.success) {
        startCooldown(email);
        showToast(`${res.message || "Email sent"} to ${email}.`);
        router.refresh();
      } else {
        if (res?.retryAfterSeconds) startCooldown(email, res.retryAfterSeconds);
        showToast(res?.error || `Failed to send to ${email}.`, "error");
      }
    });
  };

  const handleRevokeAccess = (userId: string, label: string) => {
    if (!confirm(`Revoke ${label}'s access? An unused invite link stops working; an active account is disabled.`)) return;
    startTransition(async () => {
      const res = await revokeAccessAction(userId);
      if (res.error) showToast(res.error, "error");
      else showToast(res.deleted ? "Invitation revoked." : "Account disabled.");
      router.refresh();
    });
  };

  const handleEnableAccess = (userId: string) => {
    startTransition(async () => {
      const res = await setAccountActiveAction(userId, true);
      if (res.error) showToast(res.error, "error");
      else showToast("Account enabled.");
      router.refresh();
    });
  };

  const handleRemoveUser = (userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the organization?")) return;
    startTransition(async () => {
      await removeOrgUserAction(client.id, userId);
      showToast("User removed from workspace.");
      router.refresh();
    });
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    startTransition(async () => {
      await changeOrgUserRoleAction(client.id, userId, newRole);
      showToast(`Role updated to ${newRole}.`);
      router.refresh();
    });
  };

  const handleDeactivate = () => {
    if (!confirm(`Deactivate "${cleanOrgName}"? Client user access will be suspended and new billing paused.`)) return;
    startTransition(async () => {
      await deactivateOrgAction(client.id);
      showToast(`Organization "${cleanOrgName}" has been deactivated.`);
      router.refresh();
    });
  };

  const handleReactivate = () => {
    startTransition(async () => {
      await reactivateOrgAction(client.id);
      showToast(`Organization "${cleanOrgName}" has been reactivated.`);
      router.refresh();
    });
  };

  const handleDeleteOrganization = () => {
    if (deleteConfirmText.trim().toLowerCase() !== cleanOrgName.trim().toLowerCase()) return;
    setDeletingOrg(true);
    startTransition(async () => {
      const res = await deleteOrganizationAction(client.id);
      if (res?.success) {
        router.push(adminPath("/clients"));
      } else {
        setDeletingOrg(false);
        showToast("Failed to delete organization.", "error");
      }
    });
  };

  const handleDeleteProject = (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${projectTitle}" and all associated milestones, updates, and deliverables? This action cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      await deleteProjectAction(projectId);
      showToast(`Project "${projectTitle}" was deleted.`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-700" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs hover:opacity-75 cursor-pointer ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Deactivated Notice Banner */}
      {isDeactivated && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-950">This Organization is Deactivated</div>
              <p className="text-xs text-amber-800 mt-0.5">
                Client portal access is suspended and new invoices cannot be issued while deactivated.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleReactivate}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Reactivate Organization</span>
          </button>
        </div>
      )}

      {/* Impersonation & Top Meta Banner */}
      <div className="p-6 rounded-3xl bg-sage-100 border border-sage-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-ink">Client Experience Preview</div>
          <p className="text-xs text-body mt-0.5">
            Preview the exact view, active projects, and invoice downloads this client sees in their portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={impersonating || isPending}
            onClick={handleImpersonate}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
          >
            {impersonating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span>View as Client</span>
          </button>

          <a
            href={`/api/admin/export?table=organizations`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-white border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Export Organization Record"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Export Data</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Projects & Invoices (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Projects Hub */}
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Assigned Projects</h2>
                <p className="text-xs text-muted">Software engineering deliverables and sprint progress.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={adminPath(`/projects?create=true&orgId=${client.id}`)}
                  className="py-1.5 px-3 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </Link>
                <Link
                  href={adminPath(`/projects`)}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>Projects Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {client.projects && client.projects.length > 0 ? (
                client.projects.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-surface/50 border border-rule/60 space-y-3 block hover:border-emerald-600/40 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <Link href={adminPath(`/projects/${p.id}`)} className="font-bold text-sm text-ink hover:text-emerald-700 transition-colors">
                        {p.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <AdminStatusPill status={p.status} />
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(p.id, p.title)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-body">{p.summary}</p>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs text-muted">
                        <span>Milestone Completion</span>
                        <span className="font-bold text-ink">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-rule/70 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-rule/40 text-muted">
                      <span>Target: {p.target_launch || "Not specified"}</span>
                      <Link
                        href={adminPath(`/projects/${p.id}`)}
                        className="font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
                      >
                        <span>Manage Project</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted">
                  No active projects currently linked to this organization.
                </div>
              )}
            </div>
          </div>

          {/* Invoices Record */}
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Invoices &amp; Billing History</h2>
                <p className="text-xs text-muted">Statements issued to this organization.</p>
              </div>
              <Link
                href={adminPath("/invoices")}
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>Billing Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-rule/60">
              {client.invoices && client.invoices.length > 0 ? (
                client.invoices.map((inv: any) => (
                  <div key={inv.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-mono font-bold text-ink">{inv.number}</div>
                      <div className="text-[11px] text-muted">Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "Upon receipt"}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-ink">
                          {inv.currency} {Number(inv.amount || inv.amount_kes || 0).toLocaleString()}
                        </div>
                        <AdminStatusPill status={inv.status} />
                      </div>
                      <Link
                        href={adminPath(`/invoices`)}
                        className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted">No invoices issued for this organization.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Organization Details & Members (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Organization Meta */}
          <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Company Record</h3>
              <button
                type="button"
                onClick={() => setShowEditBilling(true)}
                className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted block text-[11px]">Organization Name</span>
                <span className="font-semibold text-ink">{cleanOrgName}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Status</span>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isDeactivated
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {isDeactivated ? "DEACTIVATED" : "ACTIVE"}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Billing Email</span>
                <span className="font-semibold text-ink">{client.billing_email || "None"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">KRA Tax PIN</span>
                <span className="font-semibold text-ink font-mono">{client.tax_pin || "Not Registered"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Primary Currency</span>
                <span className="font-bold text-ink">{client.currency || "KES"}</span>
              </div>
            </div>
          </div>

          {/* Members List with Portal Invite Action */}
          <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Workspace Users</h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                <span>Invite Colleague</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {client.users && client.users.map((u: any) => (
                <div key={u.id} className="p-3.5 rounded-2xl bg-surface/50 border border-rule/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{u.name}</span>
                    <select
                      value={u.org_role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="text-[10px] font-semibold bg-white border border-rule rounded-md px-1.5 py-0.5 cursor-pointer"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </div>
                  <div className="text-muted text-[11px] truncate">{u.email}</div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted">
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-bold border ${
                        u.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : u.status === "EXPIRED"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : u.status === "DISABLED" || u.status === "NOT_INVITED"
                          ? "bg-white text-muted border-rule"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {ACCESS_STATUS_LABEL[u.status as AccessStatus] || "Unknown"}
                    </span>
                    {u.invited_at && <span>Invited {new Date(u.invited_at).toLocaleDateString()}</span>}
                    <span>Last sign-in {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "never"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-rule/40 text-[11px]">
                    {u.status === "DISABLED" ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleEnableAccess(u.id)}
                        className="font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer disabled:opacity-50"
                      >
                        Enable access
                      </button>
                    ) : (
                    <button
                      type="button"
                      disabled={isPending || invitingEmail === u.email || (cooldowns[u.email] || 0) > 0}
                      onClick={() => handleSendInviteToUser(u.email, u.name, u.org_role)}
                      className="font-semibold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Sends an invite to new people, or a sign-in link to existing accounts"
                    >
                      {invitingEmail === u.email ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Mail className="w-3 h-3" />
                      )}
                      <span>
                        {(cooldowns[u.email] || 0) > 0
                          ? `Resend in ${cooldowns[u.email]}s`
                          : u.status === "ACTIVE"
                          ? "Send sign-in link"
                          : u.status === "NOT_INVITED"
                          ? "Send invite"
                          : "Resend invite"}
                      </span>
                    </button>
                    )}

                    {(u.status === "INVITED" || u.status === "EXPIRED" || u.status === "ACTIVE") && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRevokeAccess(u.id, u.name || u.email)}
                        className="text-muted hover:text-red-700 font-semibold cursor-pointer"
                        title={u.status === "ACTIVE" ? "Disable sign-in" : "Revoke the unused invitation"}
                      >
                        {u.status === "ACTIVE" ? "Disable" : "Revoke"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveUser(u.id)}
                      className="text-red-700 hover:text-red-900 p-0.5 cursor-pointer"
                      title="Remove User from Workspace"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organization Lifecycle & Danger Zone */}
          <div className="p-6 rounded-3xl bg-red-50/40 border border-red-200 text-xs space-y-3">
            <h4 className="font-bold text-red-950 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-700" />
              <span>Organization Lifecycle Controls</span>
            </h4>
            <p className="text-[11px] text-red-800 leading-normal">
              Manage operational status or permanently decommission this client organization.
            </p>

            <div className="space-y-2 pt-1">
              {isDeactivated ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleReactivate}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Reactivate Organization</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDeactivate}
                  className="w-full py-2 px-3 rounded-xl border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Deactivate Organization</span>
                </button>
              )}

              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setDeleteConfirmText("");
                  setShowDeleteOrgModal(true);
                }}
                className="w-full py-2 px-3 rounded-xl border border-red-300 text-red-700 hover:bg-red-100 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Organization</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Organization Confirmation Modal */}
      {showDeleteOrgModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-ink">Delete Organization</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              This will permanently delete <strong className="text-ink">{cleanOrgName}</strong>, along with all associated projects, milestone deliverables, memberships, and billing history.
            </p>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              To confirm, type <strong className="font-mono text-red-950 select-all">{cleanOrgName}</strong> below:
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={cleanOrgName}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteOrgModal(false)}
                className="px-4 py-2 rounded-xl font-semibold text-muted hover:text-ink text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim().toLowerCase() !== cleanOrgName.trim().toLowerCase() || deletingOrg}
                onClick={handleDeleteOrganization}
                className="px-4 py-2 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                {deletingOrg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Billing Modal */}
      {showEditBilling && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink">Edit Billing Details</h3>
            <form onSubmit={handleSaveBilling} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                />
              </div>
              <div>
                <label className="font-semibold text-ink block mb-1">Billing Email</label>
                <input
                  type="email"
                  required
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                />
              </div>
              <div>
                <label className="font-semibold text-ink block mb-1">KRA Tax PIN</label>
                <input
                  type="text"
                  value={taxPin}
                  onChange={(e) => setTaxPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-mono"
                  placeholder="P051982344A"
                />
              </div>
              <div>
                <label className="font-semibold text-ink block mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-semibold"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-rule/50">
                <button
                  type="button"
                  onClick={() => setShowEditBilling(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink">Invite Workspace Colleague</h3>
            <p className="text-xs text-muted">
              Inviting a team member sends an email with an activation link to access the client portal.
            </p>
            <form onSubmit={handleInviteUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Grace Mwangi"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                />
              </div>
              <div>
                <label className="font-semibold text-ink block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="grace@client.co.ke"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                />
              </div>
              <div>
                <label className="font-semibold text-ink block mb-1">Workspace Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-semibold"
                >
                  <option value="MEMBER">MEMBER (Standard Collaboration)</option>
                  <option value="OWNER">OWNER (Full Billing &amp; Approvals)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-rule/50">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Portal Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
