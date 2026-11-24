"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock, UserPlus, KeyRound, Sparkles, AlertCircle, Mail, Ban, RotateCcw, Trash2, SlidersHorizontal } from "lucide-react";
import {
  inviteStaffUserAction,
  resendAccessAction,
  revokeAccessAction,
  setAccountActiveAction,
  resetTwoStepAction,
} from "@/app/admin/actions";
import { ACCESS_STATUS_LABEL, type AccessStatus } from "@/lib/access-status";
import { ASSIGNABLE_PRESETS, PRESETS, type PresetKey } from "@/lib/admin-permissions-client";
import { StaffPermissionEditor } from "./StaffPermissionEditor";
import { useReauth } from "@/components/admin/ReauthDialog";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  preset: PresetKey;
  overrides: string[];
  scope: "all" | "assigned";
  totp_enabled: boolean;
  last_login_at?: string | null;
  invited_at?: string | null;
  created_at: string;
  status: AccessStatus;
}

const roleBadges: Record<PresetKey, string> = {
  admin: "bg-emerald-100 text-emerald-800 border-emerald-200",
  client_manager: "bg-sage-100 text-ink border-sage-300",
  delivery_lead: "bg-blue-50 text-blue-800 border-blue-200",
  editor: "bg-blue-50 text-blue-800 border-blue-200",
  support: "bg-amber-50 text-amber-800 border-amber-200",
  finance: "bg-purple-100 text-purple-900 border-purple-200",
};

const statusBadges: Record<AccessStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200",
  INVITED: "bg-amber-50 text-amber-800 border-amber-200",
  EXPIRED: "bg-red-50 text-red-800 border-red-200",
  DISABLED: "bg-surface text-muted border-rule",
  NOT_INVITED: "bg-surface text-muted border-rule",
};

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—");

export function AdminUsersClient({
  initialStaff,
  currentUserId,
  isAdmin,
  hasAuthenticator = false,
}: {
  initialStaff: StaffUser[];
  currentUserId: string;
  isAdmin: boolean;
  /** Whether the signed-in owner can confirm changes with an authenticator code (else password). */
  hasAuthenticator?: boolean;
}) {
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffUser[]>(initialStaff);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PresetKey>("client_manager");
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const reauth = useReauth(hasAuthenticator);
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => setStaffList(initialStaff), [initialStaff]);

  // Visible 60s resend cooldown per person
  useEffect(() => {
    if (!Object.values(cooldowns).some((v) => v > 0)) return;
    const t = setTimeout(
      () => setCooldowns((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, Math.max(0, v - 1)]))),
      1000
    );
    return () => clearTimeout(t);
  }, [cooldowns]);

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 6000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setInviteResult(null);

    startTransition(async () => {
      const res = await reauth.call(() => inviteStaffUserAction({ name, email, preset: role }));
      if (res.userId) {
        setCooldowns((c) => ({ ...c, [res.userId!]: res.retryAfterSeconds || 60 }));
        router.refresh();
      }
      if (res.error) {
        // e.g. "Email rate limit reached, try again in 12 minutes" — shown exactly as returned
        setInviteResult({ ok: false, text: res.error });
      } else {
        setInviteResult({ ok: true, text: `${res.message} to ${email.trim()}.` });
        setName("");
        setEmail("");
      }
    });
  };

  const run = (fn: () => Promise<{ success?: boolean; error?: string; message?: string; retryAfterSeconds?: number }>, okText: string, userId?: string) =>
    startTransition(async () => {
      const res = await reauth.call(fn);
      if (res.error) {
        if (userId && res.retryAfterSeconds) setCooldowns((c) => ({ ...c, [userId]: res.retryAfterSeconds! }));
        showToast(false, res.error);
      } else {
        if (userId) setCooldowns((c) => ({ ...c, [userId]: 60 }));
        showToast(true, res.message || okText);
        router.refresh();
      }
    });

  return (
    <div className="space-y-6">
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 ${
            toast.ok ? "bg-ink text-white" : "bg-red-700 text-white"
          }`}
        >
          {toast.ok ? <Sparkles className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-start gap-3">
          <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong className="font-bold">Two-step sign-in:</strong> staff must use an authenticator app. New staff are prompted to set it
            up after accepting their invite.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setInviteResult(null);
            setInviteModalOpen(true);
          }}
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
                <th className="py-3 px-5">Staff Member</th>
                <th className="py-3 px-5">Preset</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Two-step</th>
                <th className="py-3 px-5">Invited</th>
                <th className="py-3 px-5">Last sign-in</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {staffList.map((u) => {
                const isMe = u.id === currentUserId;
                const cd = cooldowns[u.id] || 0;
                return (
                  <tr key={u.id} className="hover:bg-surface/40 transition-colors align-top">
                    <td className="py-4 px-5">
                      <div className="font-bold text-ink">{u.name}</div>
                      <div className="text-muted font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadges[u.preset] || roleBadges.support}`}>
                          {PRESETS[u.preset]?.label || u.preset}
                        </span>
                        {u.scope === "assigned" && <span className="text-[10px] font-semibold text-amber-800">Assigned clients only</span>}
                        {u.overrides?.length > 0 && (
                          <span className="text-[10px] text-muted">{u.overrides.length} override{u.overrides.length > 1 ? "s" : ""}</span>
                        )}
                        {isAdmin && !isMe && (
                          <button
                            type="button"
                            onClick={() => setEditing(u)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3 h-3" /> Edit permissions
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadges[u.status]}`}>
                        {ACCESS_STATUS_LABEL[u.status]}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {u.totp_enabled ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                          <Lock className="w-3.5 h-3.5" /> On
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                          <Unlock className="w-3.5 h-3.5" /> Not set up
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-muted text-[11px]">{fmt(u.invited_at)}</td>
                    <td className="py-4 px-5 text-muted text-[11px]">{u.last_login_at ? fmt(u.last_login_at) : "Never"}</td>
                    <td className="py-4 px-5">
                      {!isMe && (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {u.status !== "DISABLED" && u.status !== "ACTIVE" && (
                            <button
                              type="button"
                              disabled={isPending || cd > 0}
                              onClick={() => run(() => resendAccessAction(u.id), "Email sent", u.id)}
                              className="px-2.5 py-1 rounded-lg border border-rule text-[11px] font-semibold text-ink hover:bg-surface transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3" /> {cd > 0 ? `Resend in ${cd}s` : "Resend"}
                            </button>
                          )}
                          {u.status === "ACTIVE" && (
                            <button
                              type="button"
                              disabled={isPending || cd > 0}
                              onClick={() => run(() => resendAccessAction(u.id), "Sign-in link sent", u.id)}
                              title="Email a one-time sign-in link"
                              className="px-2.5 py-1 rounded-lg border border-rule text-[11px] font-semibold text-ink hover:bg-surface transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3" /> {cd > 0 ? `${cd}s` : "Send link"}
                            </button>
                          )}
                          {(u.status === "INVITED" || u.status === "EXPIRED" || u.status === "NOT_INVITED") && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => {
                                if (confirm(`Revoke ${u.name}'s invitation? Their link stops working.`))
                                  run(() => revokeAccessAction(u.id), "Invitation revoked");
                              }}
                              className="px-2.5 py-1 rounded-lg border border-rule text-[11px] font-semibold text-muted hover:text-red-700 hover:border-red-200 transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Revoke
                            </button>
                          )}
                          {u.status === "DISABLED" ? (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => run(() => setAccountActiveAction(u.id, true), "Account enabled")}
                              className="px-2.5 py-1 rounded-lg border border-rule text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 transition cursor-pointer"
                            >
                              Enable
                            </button>
                          ) : (
                            u.status === "ACTIVE" && (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                  if (confirm(`Disable ${u.name}? They are signed out and can't sign in until re-enabled.`))
                                    run(() => setAccountActiveAction(u.id, false), "Account disabled");
                                }}
                                className="px-2.5 py-1 rounded-lg border border-rule text-[11px] font-semibold text-muted hover:text-red-700 hover:border-red-200 transition cursor-pointer inline-flex items-center gap-1"
                              >
                                <Ban className="w-3 h-3" /> Disable
                              </button>
                            )
                          )}
                          {isAdmin && u.totp_enabled && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => {
                                if (confirm(`Reset two-step sign-in for ${u.name}? They'll set up their authenticator again.`))
                                  run(() => resetTwoStepAction(u.id), "Two-step reset");
                              }}
                              className="px-2.5 py-1 rounded-lg border border-rule text-[11px] font-semibold text-muted hover:text-amber-800 hover:border-amber-200 transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Reset two-step
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <StaffPermissionEditor user={editing} onClose={() => setEditing(null)} runWithReauth={reauth.call} />}
      {reauth.dialog}

      {/* Invite dialog */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="invite-staff-title">
          <div className="bg-white rounded-3xl max-w-md w-full border border-rule shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <h3 id="invite-staff-title" className="font-bold text-base text-ink">Invite staff</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-muted hover:text-ink text-sm font-semibold p-1" aria-label="Close">
                &times;
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1" htmlFor="invite-name">Full name</label>
                <input
                  id="invite-name"
                  type="text"
                  placeholder="e.g. Alex Kamau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1" htmlFor="invite-email">Email address</label>
                <input
                  id="invite-email"
                  type="email"
                  placeholder="alex@sirotech.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-mono outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1" htmlFor="invite-role">Permission preset</label>
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as PresetKey)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-medium outline-none"
                >
                  {ASSIGNABLE_PRESETS.filter((k) => isAdmin || k !== "admin").map((k) => (
                    <option key={k} value={k}>{PRESETS[k].label}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-muted">{PRESETS[role].description} They must set up two-step verification before any admin page opens. You can fine-tune single permissions after inviting.</p>
              </div>

              {inviteResult && (
                <div
                  role="status"
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    inviteResult.ok ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {inviteResult.ok ? <Mail className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{inviteResult.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-rule text-xs font-semibold text-body hover:bg-surface"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                >
                  {isPending ? "Sending…" : "Send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
