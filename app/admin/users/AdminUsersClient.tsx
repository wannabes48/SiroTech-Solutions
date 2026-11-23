"use client";

import React, { useState, useTransition } from "react";
import { Shield, Lock, UserPlus, KeyRound, Sparkles, RefreshCw, Check, AlertCircle } from "lucide-react";
import { inviteStaffUserAction, changeStaffRoleAction, revokeStaffSessionsAction } from "@/app/admin/actions";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  staff_role: "ADMIN" | "MANAGER" | "EDITOR" | "SUPPORT";
  totp_enabled: boolean;
  last_login_at?: string;
  created_at: string;
}

const roleBadges: Record<string, string> = {
  ADMIN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  MANAGER: "bg-sage-100 text-ink border-sage-300",
  EDITOR: "bg-blue-50 text-blue-800 border-blue-200",
  SUPPORT: "bg-amber-50 text-amber-800 border-amber-200"
};

export function AdminUsersClient({ initialStaff }: { initialStaff: StaffUser[] }) {
  const [staffList, setStaffList] = useState<StaffUser[]>(initialStaff);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MANAGER" | "EDITOR" | "SUPPORT">("SUPPORT");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    startTransition(async () => {
      const res = await inviteStaffUserAction({
        name,
        email,
        staffRole: role
      });

      if (res?.error) {
        showToast(`Invite failed: ${res.error}`);
      } else {
        showToast(`Staff access granted for ${email}`);
        setStaffList([
          ...staffList,
          {
            id: `usr-${Date.now()}`,
            name: name.trim(),
            email: email.trim(),
            role: "STAFF",
            staff_role: role,
            totp_enabled: false,
            created_at: new Date().toISOString()
          }
        ]);
        setName("");
        setEmail("");
        setInviteModalOpen(false);
      }
    });
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    startTransition(async () => {
      const res = await changeStaffRoleAction(userId, newRole);
      if (res?.error) {
        showToast(`Role change failed: ${res.error}`);
      } else {
        showToast("Staff permission boundary updated.");
        setStaffList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, staff_role: newRole as any } : u))
        );
      }
    });
  };

  const handleRevokeSessions = (userId: string, userName: string) => {
    if (!confirm(`Revoke all active web & API sessions for ${userName}? They will be forced to re-authenticate with TOTP.`)) return;

    startTransition(async () => {
      const res = await revokeStaffSessionsAction(userId);
      if (res?.error) {
        showToast(`Revocation error: ${res.error}`);
      } else {
        showToast(`All active sessions revoked for ${userName}.`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mandatory 2FA Staff Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-start gap-3">
          <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong className="font-bold">Mandatory Two-Step Sign-In:</strong> Staff accounts are required to use an authenticator app (TOTP) to access the Control Room. In the client portal this is optional.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="px-4 py-2 rounded-full bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Staff</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Staff Member</th>
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6">Assigned Role</th>
                <th className="py-3 px-6">Two-Factor Auth</th>
                <th className="py-3 px-6">Last Active</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {staffList.map((u) => (
                <tr key={u.id} className="hover:bg-surface/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-ink">{u.name}</td>
                  <td className="py-4 px-6 text-muted font-mono">{u.email}</td>
                  <td className="py-4 px-6">
                    <select
                      value={u.staff_role || "SUPPORT"}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      disabled={isPending}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border outline-none cursor-pointer ${
                        roleBadges[u.staff_role || "SUPPORT"]
                      }`}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="SUPPORT">SUPPORT</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      Enforced (TOTP)
                    </span>
                  </td>
                  <td className="py-4 px-6 text-muted font-mono text-[11px]">
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                      : "Never"}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleRevokeSessions(u.id, u.name)}
                      disabled={isPending}
                      title="Bump token version to force logout across all devices"
                      className="px-2.5 py-1 rounded-lg border border-rule text-[11px] font-semibold text-muted hover:text-red-700 hover:border-red-200 transition cursor-pointer"
                    >
                      Revoke Sessions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-rule shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <h3 className="font-bold text-base text-ink">Provision Staff Access</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-muted hover:text-ink text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Kamau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="alex.k@sirotech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-mono outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-medium outline-none"
                >
                  <option value="ADMIN">ADMIN — Full platform control</option>
                  <option value="MANAGER">MANAGER — Leads, projects, billing &amp; reports</option>
                  <option value="EDITOR">EDITOR — Content, blog, media &amp; SEO</option>
                  <option value="SUPPORT">SUPPORT — Tickets &amp; communication</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-rule text-xs font-semibold text-body hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 transition shadow-xs"
                >
                  {isPending ? "Inviting..." : "Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
