"use client";

import { mainUrl, portalPath } from "@/lib/hosts";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building,
  User,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { getInviteDetailsAction, acceptPortalInviteAction } from "@/app/actions/invite-actions";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = (params?.token as string) || "";

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [inviteData, setInviteData] = useState<{
    valid: boolean;
    email?: string;
    orgName?: string;
    role?: string;
    error?: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadInvite() {
      if (!token) {
        setInviteData({ valid: false, error: "Missing invitation token." });
        setLoadingDetails(false);
        return;
      }

      const res = await getInviteDetailsAction(token);
      if (isMounted) {
        setInviteData(res);
        setLoadingDetails(false);
      }
    }
    loadInvite();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !password.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await acceptPortalInviteAction({
        token,
        name: name.trim(),
        password: password.trim(),
      });

      if (res?.error) {
        setError(res.error);
        setSubmitting(false);
      } else {
        router.push(portalPath());
      }
    } catch (err: any) {
      setError("Failed to accept invitation. Please try again or contact support.");
      setSubmitting(false);
    }
  };

  if (loadingDetails) {
    return (
      <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-12 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
        <div className="text-sm font-semibold text-ink">Verifying your client workspace invitation...</div>
        <p className="text-xs text-muted">Securing encryption channels and verifying token authenticity.</p>
      </div>
    );
  }

  if (!inviteData?.valid) {
    return (
      <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink">Invitation Link Expired or Invalid</h2>
          <p className="text-xs text-muted mt-2 max-w-sm mx-auto leading-relaxed">
            {inviteData?.error || "This invitation link has expired or has already been used. Please contact your organization owner or SiroTech administrator for a fresh invitation."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/sign-in"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1B2E24] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Go to Sign In
          </Link>
          <Link
            href={mainUrl("/contact")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-rule text-ink text-xs font-semibold hover:bg-surface transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  const orgName = inviteData.orgName || "Client Workspace";
  const email = inviteData.email || "";

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-3">
          <Building className="w-3.5 h-3.5 text-emerald-600" />
          <span>{inviteData.role === "OWNER" ? "Organization Owner Setup" : "Team Member Invitation"}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Join {orgName}
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-1.5 leading-relaxed">
          Welcome to SiroTech Solutions. Choose a secure password to activate your account and access your engineering workspace, project milestones, and billing documents.
        </p>
      </div>

      <form onSubmit={handleAccept} className="space-y-4">
        {/* Email Address Readonly */}
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Account Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              disabled
              value={email}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface/80 border border-rule/80 text-xs sm:text-sm text-ink/70 font-mono cursor-not-allowed select-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Your Full Name *</label>
          <div className="relative">
            <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Faith Wanjiku"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Choose Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs mt-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Activating workspace account...</span>
            </>
          ) : (
            <>
              <span>Activate Account &amp; Access Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-rule/70 text-center text-xs text-muted">
        Already activated your portal account?{" "}
        <Link href="/sign-in" className="font-bold text-ink hover:text-emerald-700 underline underline-offset-2">
          Sign in
        </Link>
      </div>
    </div>
  );
}
