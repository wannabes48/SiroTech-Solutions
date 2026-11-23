"use client";

import { mainUrl } from "@/lib/hosts";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { forgotPasswordAction } from "../actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please provide your work email address.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("email", email.trim());
      const res = await forgotPasswordAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      setError("Unable to process reset request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Sign In</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Reset Your Password</h1>
        <p className="text-muted text-xs sm:text-sm mt-1.5">
          Enter your registered client email address and we&apos;ll send you a secure link to reset your account password.
        </p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-ink">Check Your Inbox</h3>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            If an account exists for <span className="font-semibold text-ink">{email}</span>, you will receive password reset instructions within a few moments.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="text-xs text-muted hover:text-ink font-medium transition-colors"
            >
              Didn&apos;t receive it? Try another email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
              />
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
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-8 pt-5 border-t border-rule/70 text-center text-xs text-muted">
        Need technical assistance?{" "}
        <Link href={mainUrl("/contact")} className="font-semibold text-ink hover:text-emerald-700">
          Contact SiroTech Support
        </Link>
      </div>
    </div>
  );
}
