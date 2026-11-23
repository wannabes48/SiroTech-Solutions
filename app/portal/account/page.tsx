"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Lock,
  Users,
  Building,
  Bell,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  Save,
  CheckCircle2,
  Trash2,
  Download,
  AlertTriangle,
  KeyRound,
  ExternalLink,
  Plus,
  RefreshCw,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  defaultPortalUser,
  defaultOrganization,
  initialTeamMembers,
  TeamMember,
  PortalUser,
  Organization,
} from "@/data/portal-data";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { Card } from "@/components/portal/shared/Card";
import { Toast } from "@/components/portal/shared/Toast";
import { ConfirmDialog } from "@/components/portal/shared/ConfirmDialog";
import {
  updateProfileAction,
  updatePasswordAction,
  updateBillingDetailsAction,
  updateNotificationPreferencesAction,
  inviteTeamMemberAction,
  revokeTeamMemberAction,
  resendInviteAction,
  createTicketAction,
  signOutAction,
  requestDataExportAction,
  requestAccountErasureAction,
  getPortalPrivacyRequestsAction,
} from "@/app/portal/actions";

type AccountTab = "profile" | "security" | "team" | "billing" | "notifications" | "privacy";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get("tab") as AccountTab) || "profile";
  const [activeTab, setActiveTab] = useState<AccountTab>(tabParam);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Loading states for buttons
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);
  const [invitingMember, setInvitingMember] = useState(false);
  const [revokingMemberId, setRevokingMemberId] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [privacyRequests, setPrivacyRequests] = useState<any[]>([]);

  useEffect(() => {
    const t = searchParams.get("tab") as AccountTab;
    if (t && ["profile", "security", "team", "billing", "notifications", "privacy"].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "privacy") {
      getPortalPrivacyRequestsAction().then((res) => {
        if (res.requests) setPrivacyRequests(res.requests);
      });
    }
  }, [activeTab]);

  // Profile State
  const [user, setUser] = useState<PortalUser>({
    id: "",
    name: "",
    email: "",
    role: "CLIENT",
    orgId: "",
    company: "",
    orgRole: "OWNER",
    phone: "",
    timezone: "Africa/Nairobi",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("Africa/Nairobi");

  // Organization & Billing State
  const [org, setOrg] = useState<Organization>(defaultOrganization);
  const [companyName, setCompanyName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [taxPin, setTaxPin] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState<"KES" | "USD">("KES");

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  // Visible 60s resend cooldown per address (matches Supabase's per-address interval)
  const [resendCooldowns, setResendCooldowns] = useState<Record<string, number>>({});
  const startResendCooldown = (email: string, seconds = 60) =>
    setResendCooldowns((prev) => ({ ...prev, [email]: seconds }));
  useEffect(() => {
    if (!Object.values(resendCooldowns).some((v) => v > 0)) return;
    const t = setTimeout(() => {
      setResendCooldowns((prev) =>
        Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, Math.max(0, v - 1)]))
      );
    }, 1000);
    return () => clearTimeout(t);
  }, [resendCooldowns]);

  // Notifications State
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(true);
  const [notifInvoices, setNotifInvoices] = useState(true);
  const [notifTickets, setNotifTickets] = useState(true);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [signingOutEverywhere, setSigningOutEverywhere] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetch("/api/portal/me")
      .then((res) => {
        if (res.status === 401) {
          router.push("/sign-in");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          const u = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            company: data.user.orgName,
            role: data.user.role,
            orgRole: data.user.orgRole || "MEMBER",
            phone: data.user.phone || "+254 712 345 678",
            timezone: data.user.timezone || "Africa/Nairobi",
          };
          setUser(u as any);
          setName(u.name);
          setEmail(u.email);
          if (u.phone) setPhone(u.phone);
          if (u.timezone) setTimezone(u.timezone);
          setCompanyName(data.user.orgName);
        }

        if (data?.organization) {
          setOrg({
            id: data.organization.id,
            name: data.organization.name,
            billingEmail: data.organization.billing_email,
            taxPin: data.organization.tax_pin,
            address: data.organization.address,
            country: data.organization.country || "Kenya",
            currency: (data.organization.currency as "KES" | "USD") || "KES",
          });
          setCompanyName(data.organization.name);
          setBillingEmail(data.organization.billing_email);
          setTaxPin(data.organization.tax_pin);
          setAddress(data.organization.address);
          setCurrency((data.organization.currency as "KES" | "USD") || "KES");
        }

        if (data?.teamMembers && Array.isArray(data.teamMembers)) {
          setTeamMembers(data.teamMembers);
        }

        if (data?.notificationPreferences) {
          setNotifMessages(Boolean(data.notificationPreferences.emailMessages));
          setNotifUpdates(Boolean(data.notificationPreferences.emailUpdates));
          setNotifInvoices(Boolean(data.notificationPreferences.emailInvoices));
          setNotifTickets(Boolean(data.notificationPreferences.emailTickets));
        }
      })
      .catch(() => {});
  }, [router]);

  // 1. Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("timezone", timezone);

      const res = await updateProfileAction(formData);
      setSavingProfile(false);

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        // A changed email only takes effect after the person confirms it from their inbox.
        setUser((prev) => ({ ...prev, name: name.trim(), phone: phone.trim(), timezone }));
        setToast({ message: (res as any).message || "Personal profile details updated successfully.", type: "success" });
        router.refresh();
      }
    } catch (err: any) {
      setSavingProfile(false);
      setToast({ message: err.message || "Failed to update profile.", type: "error" });
    }
  };

  // 2. Save Billing Handler
  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBilling(true);

    try {
      const formData = new FormData();
      formData.append("name", companyName.trim());
      formData.append("billingEmail", billingEmail.trim());
      formData.append("taxPin", taxPin.trim());
      formData.append("address", address.trim());
      formData.append("currency", currency);

      const res = await updateBillingDetailsAction(formData);
      setSavingBilling(false);

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setOrg((prev) => ({
          ...prev,
          name: companyName.trim(),
          billingEmail: billingEmail.trim(),
          taxPin: taxPin.trim(),
          address: address.trim(),
          currency,
        }));
        setToast({ message: "Company and billing details saved successfully.", type: "success" });
      }
    } catch (err: any) {
      setSavingBilling(false);
      setToast({ message: err.message || "Failed to save billing details.", type: "error" });
    }
  };

  // 3. Invite Member Handler
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInvitingMember(true);

    try {
      const formData = new FormData();
      formData.append("email", inviteEmail.trim());
      formData.append("title", inviteTitle.trim() || "Operations Specialist");
      formData.append("role", "MEMBER");

      const res = await inviteTeamMemberAction(formData);
      setInvitingMember(false);

      // Show the real outcome: "Invite sent", "Sign-in link sent", or the exact error.
      if (res.invite) {
        setTeamMembers((prev) => [...prev, res.invite as any]);
        setInviteEmail("");
        setInviteTitle("");
      }
      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else if (res.invite) {
        startResendCooldown(res.invite.email);
        setToast({ message: `${res.message || "Invite sent"} to ${res.invite.email}.`, type: "success" });
      }
    } catch (err: any) {
      setInvitingMember(false);
      setToast({ message: err.message || "Failed to dispatch invitation.", type: "error" });
    }
  };

  // 4. Revoke Member Handler (Triggers Warning Constraint Dialog)
  const handleRequestRevokeMember = (member: TeamMember) => {
    setMemberToDelete(member);
  };

  const confirmRevokeMember = async () => {
    if (!memberToDelete) return;
    const targetId = memberToDelete.id;
    const targetName = memberToDelete.name || memberToDelete.email;
    setRevokingMemberId(targetId);
    setMemberToDelete(null);

    try {
      const res = await revokeTeamMemberAction(targetId);
      setRevokingMemberId(null);

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setTeamMembers((prev) => prev.filter((m) => m.id !== targetId));
        setToast({ message: `${targetName} was removed from the workspace.`, type: "success" });
      }
    } catch (err: any) {
      setRevokingMemberId(null);
      setToast({ message: err.message || "Failed to remove member.", type: "error" });
    }
  };

  // 5. Resend Invite Handler
  const handleResendInvite = async (targetEmail: string) => {
    setResendingEmail(targetEmail);

    try {
      const res = await resendInviteAction(targetEmail);
      setResendingEmail(null);

      if (res.error) {
        if (res.retryAfterSeconds) startResendCooldown(targetEmail, res.retryAfterSeconds);
        setToast({ message: res.error, type: "error" });
      } else {
        startResendCooldown(targetEmail);
        setToast({ message: `${res.message || "Email sent"} to ${targetEmail}.`, type: "success" });
      }
    } catch (err: any) {
      setResendingEmail(null);
      setToast({ message: err.message || "Failed to resend invite.", type: "error" });
    }
  };

  // 6. Update Password Handler (with constraints)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPassword === newPassword) {
      setToast({ message: "New password cannot be the same as your current password.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: "New passwords do not match. Please verify.", type: "error" });
      return;
    }

    if (newPassword.length < 8) {
      setToast({ message: "Password must be at least 8 characters long.", type: "error" });
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setToast({ message: "Password must contain both letters and numbers.", type: "error" });
      return;
    }

    setSavingPassword(true);

    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await updatePasswordAction(formData);
      setSavingPassword(false);

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setToast({ message: "Password updated successfully across all devices.", type: "success" });
      }
    } catch (err: any) {
      setSavingPassword(false);
      setToast({ message: err.message || "Failed to update password.", type: "error" });
    }
  };

  // 7. Update Notification Preferences Handler
  const handleNotificationToggle = async (key: "messages" | "updates" | "invoices" | "tickets", val: boolean) => {
    const nextState = {
      emailMessages: key === "messages" ? val : notifMessages,
      emailUpdates: key === "updates" ? val : notifUpdates,
      emailInvoices: key === "invoices" ? val : notifInvoices,
      emailTickets: key === "tickets" ? val : notifTickets,
    };

    if (key === "messages") setNotifMessages(val);
    if (key === "updates") setNotifUpdates(val);
    if (key === "invoices") setNotifInvoices(val);
    if (key === "tickets") setNotifTickets(val);

    setSavingNotifs(true);
    try {
      const res = await updateNotificationPreferencesAction(nextState);
      setSavingNotifs(false);
      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "Notification preferences saved.", type: "success" });
      }
    } catch {
      setSavingNotifs(false);
      setToast({ message: "Failed to save preferences.", type: "error" });
    }
  };

  // 8. Download Organization Dataset
  const handleDownloadData = async () => {
    setExportingData(true);
    try {
      const res = await requestDataExportAction();
      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({
          message: res.message || "Data portability export requested. Compiling full ZIP archive...",
          type: "success",
        });
        const updated = await getPortalPrivacyRequestsAction();
        if (updated.requests) setPrivacyRequests(updated.requests);

        if (res.requestId) {
          window.open(`/api/admin/privacy/export-zip?requestId=${encodeURIComponent(res.requestId)}`, "_blank");
        }
      }
    } catch {
      setToast({ message: "Failed to generate dataset export.", type: "error" });
    } finally {
      setExportingData(false);
    }
  };

  // 9. Request Deletion Handler
  const handleRequestDeletion = async () => {
    setDeleteModalOpen(false);

    try {
      const res = await requestAccountErasureAction(
        `Authorized Owner ${user.name} (${user.email}) requested account deletion and statutory data purge under Kenya DPA 2019 / GDPR.`
      );

      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({
          message: res.message || "Right to erasure request queued. Target completion date is 30 days from intake.",
          type: "info",
        });
        const updated = await getPortalPrivacyRequestsAction();
        if (updated.requests) setPrivacyRequests(updated.requests);
      }
    } catch {
      setToast({
        message: "Failed to submit erasure request.",
        type: "error",
      });
    }
  };

  const isOwner = user.orgRole === "OWNER";

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Account &amp; Workspace"
        subtitle="Manage your personal profile, security credentials, colleagues, and company billing."
        badge={`${user.orgRole || "Client"} Access`}
      />

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 p-1 bg-surface rounded-2xl border border-rule/80 w-full overflow-x-auto">
        {[
          { id: "profile" as AccountTab, label: "Profile", icon: User },
          { id: "security" as AccountTab, label: "Security", icon: Lock },
          { id: "team" as AccountTab, label: "Team", icon: Users },
          { id: "billing" as AccountTab, label: "Company & Billing", icon: Building },
          { id: "notifications" as AccountTab, label: "Notifications", icon: Bell },
          { id: "privacy" as AccountTab, label: "Privacy & Data", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? "bg-white text-ink shadow-2xs font-bold"
                  : "text-muted hover:text-ink hover:bg-white/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-700" : "text-muted"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE (Name, phone/WhatsApp, avatar, timezone) */}
      {activeTab === "profile" && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-rule/70">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-ink">Personal Profile</h3>
                {(name !== user.name || email !== user.email || phone !== (user.phone || "") || timezone !== user.timezone) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                    Unsaved Edits
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                Used across milestone sign-offs, support tickets, and sprint engineering threads.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div className="flex items-center gap-4 pb-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 text-xl font-bold flex items-center justify-center border-2 border-emerald-300">
                {name.charAt(0) || "U"}
              </div>
              <div>
                <div className="text-xs font-bold text-ink">{name}</div>
                <div className="text-[11px] text-muted">{user.company}</div>
                <button
                  type="button"
                  onClick={() => setToast({ message: "Gravatar synced automatically with work email.", type: "info" })}
                  className="mt-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  Change profile avatar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Work Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
              <p className="text-[11px] text-muted mt-1">
                Updating your work email updates your sign-in credentials and official notifications across the portal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Phone / WhatsApp Number (For Sev-1 SMS escalations)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 712 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              >
                <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3) &bull; Standard Operating</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="America/New_York">America/New York (EST/EDT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{savingProfile ? "Saving Profile..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: SECURITY (Change password, connected Google, active sign-in method, authenticator app, sign out all) */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="pb-4 border-b border-rule/70">
              <h3 className="text-base font-bold text-ink">Change Account Password</h3>
              <p className="text-xs text-muted">
                Requires at least 8 characters with numbers and symbols.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-2.5 rounded-full bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingPassword ? "Updating Password..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </Card>

          {/* Connected Providers & Authenticator App */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-ink">Connected Sign-In Methods</h3>
            <div className="divide-y divide-rule/60 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-ink">Google Workspace SSO</div>
                  <div className="text-muted">Connected to {user.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                  Active
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-ink">Two-Factor Authenticator (Phase 2)</div>
                  <div className="text-muted">TOTP Authenticator app with one-time backup codes</div>
                </div>
                <button
                  type="button"
                  onClick={() => setToast({ message: "Two-factor authenticator setup is scheduled for Q4 rollout.", type: "info" })}
                  className="px-3.5 py-1.5 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold cursor-pointer"
                >
                  Configure TOTP
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-ink">Active Sessions</div>
                  <div className="text-muted">Logged in on current browser session &bull; Standard Nairobi SLA</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSignOutModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold cursor-pointer"
                >
                  Sign out of all devices
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: TEAM (Members list with roles, invite by email owner only, resend/revoke, remove) */}
      {activeTab === "team" && (
        <Card className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule/70">
            <div>
              <h3 className="text-base font-bold text-ink">Organization Colleagues</h3>
              <p className="text-xs text-muted">
                Colleagues invited by the Owner see the same projects, milestones, invoices, and files.
              </p>
            </div>
          </div>

          {/* Invite form (Owner only) */}
          {isOwner ? (
            <form onSubmit={handleInviteMember} className="p-4 sm:p-5 rounded-2xl bg-surface border border-rule space-y-3">
              <div className="text-xs font-bold text-ink">Invite Colleague to Workspace</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@yourcompany.co.ke"
                  className="sm:col-span-6 px-3.5 py-2 rounded-xl bg-white border border-rule text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
                <input
                  type="text"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="Role (e.g. Finance Lead)"
                  className="sm:col-span-4 px-3.5 py-2 rounded-xl bg-white border border-rule text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
                <button
                  type="submit"
                  disabled={invitingMember}
                  className="sm:col-span-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {invitingMember && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{invitingMember ? "Inviting..." : "Send Invite"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              Only organization Owners ({org.billingEmail || "Authorized Lead"}) can dispatch invites or manage team roles.
            </div>
          )}

          {/* Members Table */}
          <div className="divide-y divide-rule/60 text-xs">
            {teamMembers.map((member) => (
              <div key={member.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300">
                    {member.name.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-ink flex items-center gap-2">
                      <span>{member.name}</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-surface border border-rule text-muted">
                        {member.role}
                      </span>
                      {member.status === "INVITED" && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Invited
                        </span>
                      )}
                      {member.status === "EXPIRED" && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                          Link not used
                        </span>
                      )}
                      {member.status === "DISABLED" && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-surface text-muted border border-rule">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted">
                      {member.email} &bull; {member.title}
                    </div>
                  </div>
                </div>

                {isOwner && member.email !== user.email && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {(member.status === "INVITED" || member.status === "EXPIRED") && (
                      <button
                        type="button"
                        disabled={resendingEmail === member.email || (resendCooldowns[member.email] || 0) > 0}
                        onClick={() => handleResendInvite(member.email)}
                        className="px-3 py-1 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {resendingEmail === member.email && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>
                          {(resendCooldowns[member.email] || 0) > 0 ? `Resend in ${resendCooldowns[member.email]}s` : "Resend"}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={revokingMemberId === member.id}
                      onClick={() => handleRequestRevokeMember(member)}
                      className="p-1.5 text-muted hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                      title="Remove member"
                    >
                      {revokingMemberId === member.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: COMPANY & BILLING (Organisation name, billing email, tax PIN, address, preferred currency) */}
      {activeTab === "billing" && (
        <Card className="space-y-6">
          <div className="pb-4 border-b border-rule/70">
            <h3 className="text-base font-bold text-ink">Company &amp; Tax Billing Details</h3>
            <p className="text-xs text-muted">
              Appears on all official statements, KRA tax invoices, and payment receipts.
            </p>
          </div>

          <form onSubmit={handleSaveBilling} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Registered Organization Name *</label>
              <input
                type="text"
                required
                disabled={!isOwner}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink disabled:opacity-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Billing Notification Email *</label>
              <input
                type="email"
                required
                disabled={!isOwner}
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink disabled:opacity-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Kenya KRA Tax PIN / VAT Number *</label>
              <input
                type="text"
                required
                disabled={!isOwner}
                value={taxPin}
                onChange={(e) => setTaxPin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink font-mono disabled:opacity-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Physical &amp; Postal Address *</label>
              <input
                type="text"
                required
                disabled={!isOwner}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink disabled:opacity-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Preferred Invoice Currency</label>
              <select
                disabled={!isOwner}
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "KES" | "USD")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs text-ink disabled:opacity-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              >
                <option value="KES">Kenya Shillings (KES) &bull; Paystack (Cards &amp; M-Pesa) &amp; Local Wire</option>
                <option value="USD">US Dollars (USD) &bull; International Paystack &amp; Swift</option>
              </select>
            </div>

            {isOwner && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingBilling}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingBilling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingBilling ? "Saving Billing..." : "Save Billing Details"}</span>
                </button>
              </div>
            )}
          </form>
        </Card>
      )}

      {/* TAB 5: NOTIFICATIONS (Email toggles: messages, updates, invoices, tickets; in-app always on) */}
      {activeTab === "notifications" && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-rule/70">
            <div>
              <h3 className="text-base font-bold text-ink">Notification Preferences</h3>
              <p className="text-xs text-muted">
                In-app notifications are always enabled. Configure email alerts below.
              </p>
            </div>
            {savingNotifs && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Saving...</span>
              </div>
            )}
          </div>

          <div className="divide-y divide-rule/60 text-xs max-w-xl space-y-2">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="font-bold text-ink">Engineering Team Messages</div>
                <div className="text-muted">Instant email when staff replies in project threads</div>
              </div>
              <input
                type="checkbox"
                checked={notifMessages}
                onChange={(e) => handleNotificationToggle("messages", e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-ink">Sprint &amp; Deployment Updates</div>
                <div className="text-muted">Changelogs and staging milestone notifications</div>
              </div>
              <input
                type="checkbox"
                checked={notifUpdates}
                onChange={(e) => handleNotificationToggle("updates", e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-ink">Invoices &amp; Receipts</div>
                <div className="text-muted">Milestone statements, payment receipts, and +3/+7 day reminders</div>
              </div>
              <input
                type="checkbox"
                checked={notifInvoices}
                onChange={(e) => handleNotificationToggle("invoices", e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-ink">Support Ticket Activity</div>
                <div className="text-muted">Status updates, SLA notifications, and engineer replies</div>
              </div>
              <input
                type="checkbox"
                checked={notifTickets}
                onChange={(e) => handleNotificationToggle("tickets", e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: PRIVACY & DATA (Download data ZIP, request account erasure, view queue) */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          {/* Card 1: Data Portability ZIP Export */}
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">Data Portability (ZIP Archive)</h3>
                <p className="text-xs text-body leading-relaxed">
                  Generate a complete, machine-readable archive containing your personal profile, organization memberships, support history, project messages, audit security logs, and financial records pursuant to Kenya DPA 2019 (Section 26) and GDPR Article 20.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
              <button
                type="button"
                disabled={exportingData}
                onClick={handleDownloadData}
                className="px-5 py-2.5 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {exportingData ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>{exportingData ? "Packaging ZIP Dataset..." : "Export My Data (ZIP)"}</span>
              </button>

              <span className="text-[11px] text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted • Standardized JSON &amp; CSV Formats</span>
              </span>
            </div>
          </Card>

          {/* Card 2: Right to Erasure */}
          <Card className="space-y-4 border-red-200 bg-red-50/20">
            <h3 className="text-base font-bold text-red-900">Right to Erasure &amp; Account Anonymization</h3>
            <p className="text-xs text-red-800/80 leading-relaxed">
              Initiates account anonymization and soft-deletes personal identifiers and communications in accordance with statutory data protection rights.
            </p>

            <div className="p-4 rounded-2xl bg-white/80 border border-red-200 text-xs text-body space-y-1.5">
              <div className="font-bold text-ink flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-800" />
                <span>Statutory Financial Records Notice:</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Pursuant to Section 23 of the Kenya Tax Procedures Act (2015) and commercial tax laws, tax invoices, VAT documentation, and audited payment transactions are <strong>legally retained for a mandatory 7-year statutory period</strong>. Anonymization removes personal profiling data while preserving tax records. (Confirm with your accountant or lawyer).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Request Right to Erasure</span>
            </button>
          </Card>

          {/* Card 3: My Privacy & Data Requests Queue */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">My Privacy &amp; Data Requests</h3>
                <p className="text-xs text-muted">Statutory tracking of your submitted data export and erasure requests</p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                30-Day Statutory Clock
              </span>
            </div>

            {privacyRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Request Type</th>
                      <th className="py-2.5 px-4">Date Submitted</th>
                      <th className="py-2.5 px-4">Target Resolution</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule/60">
                    {privacyRequests.map((req: any) => {
                      const isExport = req.type.toUpperCase() === "EXPORT";
                      const isCompleted = req.status === "COMPLETED";

                      return (
                        <tr key={req.id} className="hover:bg-surface/30">
                          <td className="py-3 px-4 font-bold text-ink">
                            {isExport ? "Data Portability (ZIP)" : "Right to Erasure"}
                          </td>
                          <td className="py-3 px-4 text-muted">
                            {req.created_at ? new Date(req.created_at).toISOString().slice(0, 10) : "-"}
                          </td>
                          <td className="py-3 px-4">
                            {isCompleted ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Completed
                              </span>
                            ) : (
                              <span className="text-slate-700 font-medium">
                                {req.target_completion_date
                                  ? new Date(req.target_completion_date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })
                                  : "30 days"}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : req.status === "REJECTED"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isCompleted && isExport ? (
                              <a
                                href={`/api/admin/privacy/export-zip?requestId=${encodeURIComponent(req.id)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 border border-emerald-300 hover:bg-emerald-50 transition inline-flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download ZIP</span>
                              </a>
                            ) : isCompleted && !isExport ? (
                              <span className="text-[11px] text-muted font-medium">Personal data anonymized</span>
                            ) : (
                              <span className="text-[11px] text-muted font-medium">Under review by DPO</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted py-4 text-center">
                You currently have no active or historical data privacy requests on file.
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Warning Constraint: Confirm Team Member Removal Dialog */}
      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        title={`Remove ${memberToDelete?.name || memberToDelete?.email} from organization?`}
        description={`This colleague will immediately lose access to ${org.name}'s software codebases, sprint deliverables, audit logs, and billing invoices.`}
        confirmLabel="Remove Colleague"
        cancelLabel="Keep Colleague"
        isDestructive={true}
        onConfirm={confirmRevokeMember}
        onCancel={() => setMemberToDelete(null)}
      />

      {/* Confirm Sign Out All Devices Modal */}
      <ConfirmDialog
        isOpen={signOutModalOpen}
        title="Sign out of all devices?"
        description="You will be disconnected from active browser sessions across all mobile handsets and workstations."
        confirmLabel="Sign Out Everywhere"
        isDestructive={true}
        isLoading={signingOutEverywhere}
        onConfirm={async () => {
          setSigningOutEverywhere(true);
          try {
            await signOutAction();
          } catch {
            router.push("/sign-in");
          } finally {
            setSigningOutEverywhere(false);
            setSignOutModalOpen(false);
          }
        }}
        onCancel={() => setSignOutModalOpen(false)}
      />

      {/* Confirm Deletion Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Submit Right to Erasure Request?"
        description="This action queues a statutory erasure request under Kenya DPA 2019 / GDPR. Your personal profile, credentials, and communications will be anonymized and soft-deleted. Statutory financial records (invoices, payments, VAT logs) are legally preserved for 7 years pursuant to Section 23 of the Kenya Tax Procedures Act (confirm with your accountant or lawyer)."
        confirmLabel="Submit Erasure Request"
        isDestructive={true}
        onConfirm={handleRequestDeletion}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted">Loading account settings...</div>}>
      <AccountContent />
    </Suspense>
  );
}
