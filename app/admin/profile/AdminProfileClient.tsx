"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateStaffProfileAction,
  changeStaffPasswordAction,
  toggleStaffTwoFactorAction,
  revokeStaffSessionAction,
  revokeAllOtherStaffSessionsAction,
  updateStaffNotificationPrefsAction
} from "@/app/admin/actions";
import {
  User,
  Lock,
  ShieldCheck,
  Smartphone,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  KeyRound,
  LogOut,
  Laptop,
  Monitor,
  MapPin,
  Globe,
  Check,
  X,
  Clock,
  ShieldAlert
} from "lucide-react";

function formatLastActive(dateString: string | Date | undefined, isCurrent?: boolean) {
  if (isCurrent) return "Active now";
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSecs = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
    if (diffSecs < 60) return "Just now";
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) {
      const hours = Math.floor(diffSecs / 3600);
      return `${hours}h ago`;
    }
    if (diffSecs < 172800) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    const days = Math.floor(diffSecs / 86400);
    return `${days}d ago (${date.toLocaleDateString([], { month: "short", day: "numeric" })})`;
  } catch {
    return "Recently";
  }
}

function renderDeviceIcon(s: any) {
  const type = (s.device_type || "").toLowerCase();
  const info = (s.device_info || "").toLowerCase();
  if (type === "mobile" || info.includes("iphone") || info.includes("android") || info.includes("mobile")) {
    return (
      <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-700 shrink-0">
        <Smartphone className="w-5 h-5" />
      </div>
    );
  }
  if (type === "laptop" || info.includes("macbook") || info.includes("laptop")) {
    return (
      <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-700 shrink-0">
        <Laptop className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 shrink-0">
      <Monitor className="w-5 h-5" />
    </div>
  );
}

export function AdminProfileClient({
  initialProfile,
  initialSessions,
  initialPrefs
}: {
  initialProfile: any;
  initialSessions: any[];
  initialPrefs: any;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [sessions, setSessions] = useState(initialSessions);
  const [prefs, setPrefs] = useState({
    emailLeads: initialPrefs?.email_leads ?? true,
    emailTickets: initialPrefs?.email_tickets ?? true,
    emailPayments: initialPrefs?.email_payments ?? true,
    emailHealth: initialPrefs?.email_health ?? false,
    inAppToasts: initialPrefs?.in_app_toasts ?? true
  });

  const [isPending, startTransition] = useTransition();

  // Profile Form State
  const [name, setName] = useState(initialProfile.name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [timezone, setTimezone] = useState(initialProfile.timezone || "Africa/Nairobi");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA Setup State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  // Fresh random 160-bit base32 secret per setup (never a shared constant).
  const [totpSecret, setTotpSecret] = useState(() => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const bytes = new Uint8Array(32);
    if (typeof crypto !== "undefined") crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => alphabet[b & 31]).join("");
  });
  const [totpError, setTotpError] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Save Profile Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const res = await updateStaffProfileAction({
        name: name.trim(),
        phone: phone.trim() || undefined,
        timezone
      });

      if (res.success) {
        setProfile((prev: any) => ({ ...prev, name: name.trim(), phone: phone.trim(), timezone }));
        showToast("Profile information updated successfully.");
        router.refresh();
      }
    });
  };

  // 2. Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await changeStaffPasswordAction({
        currentPassword,
        newPassword
      });

      if (res.error) {
        setPasswordError(res.error);
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password updated successfully.");
        router.refresh();
      }
    });
  };

  // 3. Confirm Two-Factor Setup
  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length < 6) {
      setTotpError("Please enter the 6-digit authenticator verification code.");
      return;
    }

    startTransition(async () => {
      const res = await toggleStaffTwoFactorAction({
        enable: true,
        secret: totpSecret,
        code: totpCode
      });

      if ("error" in res && res.error) {
        setTotpError(res.error);
        return;
      }
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, totp_enabled: true }));
        setShow2FAModal(false);
        setTotpCode("");
        showToast("Two-factor authentication successfully activated.");
        router.refresh();
      }
    });
  };

  // 4. Revoke Session
  const handleRevokeSession = (sessionId: string) => {
    startTransition(async () => {
      const res = await revokeStaffSessionAction(sessionId);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        showToast("Session revoked.");
        router.refresh();
      }
    });
  };

  // 5. Revoke All Other Sessions
  const handleRevokeAllOtherSessions = () => {
    startTransition(async () => {
      const res = await revokeAllOtherStaffSessionsAction();
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.is_current));
        showToast("Signed out of all other devices.");
        router.refresh();
      }
    });
  };

  // 6. Save Notification Preferences
  const handleSaveNotificationPrefs = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateStaffNotificationPrefsAction(prefs);
      if (res.success) {
        showToast("Notification preferences updated.");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B2E24] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mandatory Staff Policy Banner */}
      <div className="p-4 rounded-3xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold block">Mandatory Security Standard:</span>
            <span className="text-emerald-900 leading-relaxed">
              Two-step verification (2FA) is strictly required for all staff and admin accounts per SiroTech ISO 27001 policies.
            </span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-mono font-bold text-[11px] whitespace-nowrap">
          Policy: Enforced
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Profile & Password */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Own Name & Account Details */}
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-rule/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-surface border border-rule">
                  <User className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Personal Profile Details</h2>
                  <p className="text-xs text-muted">Update your display name, timezone, and phone number.</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface border border-rule text-ink">
                Role: {profile.staff_role || profile.role || "ADMIN"}
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-ink block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Work Email (Immutable)</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface/50 border border-rule text-muted cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-ink block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Operating Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-ink font-medium"
                  >
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer shadow-xs"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Password Management */}
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-rule/60 pb-4">
              <div className="p-2.5 rounded-2xl bg-surface border border-rule">
                <KeyRound className="w-5 h-5 text-ink" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Change Account Password</h2>
                <p className="text-xs text-muted">Use a strong, unique password of at least 8 characters.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-ink block mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {passwordError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Active Sign-In Sessions */}
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-surface border border-rule">
                  <Laptop className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Active Sign-In Sessions ({sessions.length})</h2>
                  <p className="text-xs text-muted">Devices and browsers currently logged into this staff account.</p>
                </div>
              </div>

              {sessions.some((s) => !s.is_current) && (
                <button
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  disabled={isPending}
                  className="px-3.5 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Other Devices</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-rule/60 text-xs">
              {sessions.map((s) => (
                <div key={s.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {renderDeviceIcon(s)}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-ink text-sm tracking-tight">
                          {s.browser || s.device_info}
                        </span>
                        {s.os && (
                          <span className="text-xs text-muted font-normal">
                            on {s.os}
                          </span>
                        )}
                        {s.is_current ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            THIS DEVICE &bull; ACTIVE NOW
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted border border-rule">
                            Authorized Session
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted shrink-0" />
                          <span className="font-medium text-ink/80">{s.location || "Nairobi, Kenya"}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="w-3 h-3 text-muted shrink-0" />
                          <span>{s.ip_address || "197.232.88.42"}</span>
                          {s.isp && <span className="text-muted/70">({s.isp})</span>}
                        </span>
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted shrink-0" />
                          <span className={s.is_current ? "text-emerald-700 font-semibold" : "text-muted"}>
                            {formatLastActive(s.last_active, s.is_current)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    {!s.is_current ? (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(s.id)}
                        disabled={isPending}
                        className="px-3.5 py-1.5 rounded-full bg-surface border border-rule hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-muted text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Current Session</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 2FA & Notification Preferences */}
        <div className="space-y-8">
          {/* Two-Step Verification Card */}
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-rule/60 pb-3">
              <div className="p-2.5 rounded-2xl bg-surface border border-rule">
                <Smartphone className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-sm">Two-Step Verification</h3>
                <span className="text-[11px] text-muted">Required for all staff</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Current Status:</span>
                {profile.totp_enabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ENFORCED &amp; ACTIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    SETUP REQUIRED
                  </span>
                )}
              </div>

              <p className="text-xs text-body leading-relaxed">
                Protects account access by requiring an ephemeral 6-digit TOTP token generated via Google Authenticator or 1Password during login.
              </p>

              <button
                type="button"
                onClick={() => setShow2FAModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-surface border border-rule hover:bg-surface/80 text-ink text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{profile.totp_enabled ? "Re-Configure Authenticator" : "Setup Authenticator App"}</span>
              </button>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-rule/60 pb-3">
              <div className="p-2.5 rounded-2xl bg-surface border border-rule">
                <Bell className="w-5 h-5 text-ink" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-sm">Notification Preferences</h3>
                <span className="text-[11px] text-muted">Real-time alert subscriptions</span>
              </div>
            </div>

            <form onSubmit={handleSaveNotificationPrefs} className="space-y-4 text-xs">
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-ink block">New Client Inquiries</span>
                    <span className="text-[11px] text-muted">Alerts on public contact form inquiries</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.emailLeads}
                    onChange={(e) => setPrefs({ ...prefs, emailLeads: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-ink block">Support Tickets &amp; SLA</span>
                    <span className="text-[11px] text-muted">Alerts on new tickets or breaching SLAs</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.emailTickets}
                    onChange={(e) => setPrefs({ ...prefs, emailTickets: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-ink block">Payment Settlements</span>
                    <span className="text-[11px] text-muted">Inbound Paystack &amp; M-Pesa settlements</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.emailPayments}
                    onChange={(e) => setPrefs({ ...prefs, emailPayments: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-ink block">System Health Alerts</span>
                    <span className="text-[11px] text-muted">Webhook timeouts or gateway downtime</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.emailHealth}
                    onChange={(e) => setPrefs({ ...prefs, emailHealth: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-ink block">In-App Desktop Toasts</span>
                    <span className="text-[11px] text-muted">Real-time alerts inside admin portal</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.inAppToasts}
                    onChange={(e) => setPrefs({ ...prefs, inAppToasts: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
                >
                  Save Alert Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Configure Two-Step Verification</span>
              </h3>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/80 border border-rule/60 text-xs space-y-2">
              <span className="font-semibold text-ink block">1. Add Secret Key to Authenticator App:</span>
              <div className="p-2 rounded-xl bg-white border border-rule font-mono font-bold text-ink text-center text-xs tracking-wider select-all">
                {totpSecret}
              </div>
              <p className="text-[11px] text-muted">
                Scan or paste this secret into Google Authenticator, Authy, or 1Password.
              </p>
            </div>

            <form onSubmit={handleConfirm2FA} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">
                  2. Enter 6-Digit Authenticator Code to Verify *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 849201"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface border border-rule text-center font-mono font-bold text-base tracking-widest text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              {totpError && (
                <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {totpError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer shadow-xs"
                >
                  Confirm &amp; Enforce 2FA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
