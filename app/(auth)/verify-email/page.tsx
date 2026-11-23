"use client";

import { portalPath } from "@/lib/hosts";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { defaultPortalUser } from "@/data/portal-data";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "client@example.com";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const updated = [...code];
    updated[index] = val;
    setCode(updated);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerifying(true);

    try {
      await new Promise((r) => setTimeout(r, 600));
      // Ensure user session exists in localStorage
      const existing = localStorage.getItem("sirotech_portal_user_v1");
      if (!existing) {
        localStorage.setItem("sirotech_portal_user_v1", JSON.stringify({
          ...defaultPortalUser,
          email,
        }));
      }
      router.push(portalPath());
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    await new Promise((r) => setTimeout(r, 600));
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
        <Mail className="w-6 h-6" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Verify Your Email</h1>
        <p className="text-muted text-xs sm:text-sm mt-1.5 leading-relaxed">
          We&apos;ve dispatched a 6-digit confirmation code to{" "}
          <span className="font-semibold text-ink">{email}</span>. Please verify your address to activate portal access.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-ink mb-2">Enter 6-Digit Code</label>
          <div className="flex items-center justify-between gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`digit-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digit && idx > 0) {
                    const prev = document.getElementById(`digit-${idx - 1}`);
                    prev?.focus();
                  }
                }}
                className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={verifying}
          className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {verifying ? (
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
            disabled={resending}
            className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>{resent ? "Code Resent!" : "Resend email"}</span>
          </button>

          <Link href="/sign-in" className="text-muted hover:text-ink">
            Change email
          </Link>
        </div>
      </form>

      <div className="mt-8 pt-5 border-t border-rule/70">
        <div className="flex items-start gap-2.5 text-[11px] text-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Enterprise 2-Factor Authentication protects all proprietary repository links and production deployment keys.
          </span>
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
