"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, RefreshCw, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { verifySignInCodeAction, resendConfirmationAction } from "../actions";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("code", code);
    start(async () => {
      const res = await verifySignInCodeAction(fd);
      if (!res.ok) return setError(res.error);
      router.push(res.redirect || "/");
      router.refresh();
    });
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    start(async () => {
      const res = await resendConfirmationAction(fd);
      if (!res.ok) return setError(res.error);
      setNotice("We've sent a new email.");
      setCooldown(60);
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
        <Mail className="w-6 h-6" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Check your email</h1>
        <p className="text-muted text-xs sm:text-sm mt-1.5 leading-relaxed">
          If <span className="font-semibold text-ink">{email || "your address"}</span> can use the portal, we&apos;ve sent it a
          confirmation link and a code. Click the link, or enter the code here.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-ink mb-2">Code from the email</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Code"
            className="w-full px-4 py-3 text-center text-lg font-bold tracking-[0.3em] rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink"
          />
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div role="status" className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending || code.length < 6 || !email}
          className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {pending ? (
            <span>Verifying code...</span>
          ) : (
            <>
              <span>Verify &amp; Continue to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={pending || cooldown > 0 || !email}
            className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}</span>
          </button>
          <Link href="/sign-up" className="text-muted hover:text-ink">
            Change email
          </Link>
        </div>
      </form>

      <div className="mt-8 pt-5 border-t border-rule/70">
        <div className="flex items-start gap-2.5 text-[11px] text-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Links and codes work once and expire soon. Never share them with anyone.</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted text-sm">Loading email verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
