"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, AlertCircle, Eye, KeyRound, CheckCircle2, Hash } from "lucide-react";
import { signInWithPasswordAction, requestSignInLinkAction, verifySignInCodeAction } from "../actions";
import ConcentricRing from "@/components/ui/concentric-ring";
import { mainUrl } from "@/lib/hosts";

type Mode = "password" | "link" | "code";
const RESEND_COOLDOWN = 60;

const inputCls =
  "w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink";

export default function SignInForm({
  variant,
  initialError,
  next,
}: {
  variant: "portal" | "admin";
  initialError: string | null;
  next: string;
}) {
  const isAdmin = variant === "admin";
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => () => {
    if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
  }, []);

  const togglePasswordVisibility = () => {
    if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
    if (showPassword) return setShowPassword(false);
    setShowPassword(true);
    // Reveal password briefly for 3 seconds then automatically re-hide
    passwordTimerRef.current = setTimeout(() => setShowPassword(false), 3000);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  const go = (dest?: string) => {
    router.push(dest || "/");
    router.refresh();
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    fd.set("next", next);
    if (isAdmin) fd.set("totp", totpCode);
    startTransition(async () => {
      const res = await signInWithPasswordAction(fd);
      if (!res.ok) return setError(res.error);
      go(res.redirect);
    });
  };

  const handleRequestLink = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (cooldown > 0) return;
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    startTransition(async () => {
      const res = await requestSignInLinkAction(fd);
      if (!res.ok) return setError(res.error);
      setNotice(res.message || null);
      setCooldown(RESEND_COOLDOWN);
    });
  };

  const handleCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("code", emailCode);
    fd.set("next", next);
    startTransition(async () => {
      const res = await verifySignInCodeAction(fd);
      if (!res.ok) return setError(res.error);
      go(res.redirect);
    });
  };

  const emailField = (
    <div>
      <label className="block text-xs font-semibold text-ink mb-1.5">Work Email</label>
      <div className="relative">
        <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className={inputCls}
        />
      </div>
    </div>
  );

  const submitButton = (label: string, busy: string, disabled = false) => (
    <button
      type="submit"
      disabled={isPending || disabled}
      className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
    >
      {isPending ? (
        <>
          <ConcentricRing size="sm" variant="white" />
          <span>{busy}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {isAdmin ? "Staff sign in" : "Sign in to Client Portal"}
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-1.5">
          {isAdmin
            ? "SiroTech team members only. Use your work email, password and authenticator app."
            : "Access your active software deliverables, invoices, and direct support lines."}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === "password" && (
        <form onSubmit={handlePassword} className="space-y-4">
          {emailField}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ink">Password</label>
              <Link href="/forgot-password" className="text-xs text-emerald-700 hover:text-emerald-800 font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`${inputCls} pr-10`}
              />
              <Eye
                className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                  showPassword ? "text-emerald-700" : "text-muted hover:text-ink"
                }`}
                onClick={togglePasswordVisibility}
              />
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Authenticator code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="totp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  className={`${inputCls} tracking-widest`}
                />
              </div>
            </div>
          )}

          {submitButton(isAdmin ? "Sign In" : "Sign In to Portal", "Verifying credentials...")}
        </form>
      )}

      {mode === "link" && (
        <form onSubmit={handleRequestLink} className="space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            We&apos;ll email you a one-time sign-in link and a short code. No password needed.
          </p>
          {emailField}
          {notice && (
            <div role="status" className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}
          {submitButton(
            cooldown > 0 ? `Send again in ${cooldown}s` : notice ? "Send another link" : "Email me a sign-in link",
            "Sending...",
            cooldown > 0
          )}
          {notice && (
            <button
              type="button"
              onClick={() => switchMode("code")}
              className="w-full text-xs font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer"
            >
              Enter the code from the email instead
            </button>
          )}
        </form>
      )}

      {mode === "code" && (
        <form onSubmit={handleCode} className="space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            Use this if the link doesn&apos;t work for you (for example, a strict company mail filter opened it first).
          </p>
          {emailField}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Code from the email</label>
            <div className="relative">
              <Hash className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={10}
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Code"
                className={`${inputCls} tracking-widest`}
              />
            </div>
          </div>
          {submitButton("Sign In", "Checking code...", emailCode.length < 6)}
        </form>
      )}

      {/* Mode switches */}
      <div className="mt-5 flex flex-col items-center gap-2 text-xs">
        {mode !== "link" && (
          <button type="button" onClick={() => switchMode("link")} className="font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer">
            Request a sign-in link instead
          </button>
        )}
        {mode !== "code" && (
          <button type="button" onClick={() => switchMode("code")} className="text-muted hover:text-ink cursor-pointer">
            I have a code from an email
          </button>
        )}
        {mode !== "password" && (
          <button type="button" onClick={() => switchMode("password")} className="text-muted hover:text-ink cursor-pointer">
            Sign in with password
          </button>
        )}
      </div>

      {/* Sign Up Link (client portal only — staff accounts are invite-only) */}
      {!isAdmin && (
        <div className="mt-6 text-center text-xs text-muted">
          Don&apos;t have an account yet?{" "}
          <Link href="/sign-up" className="font-bold text-ink hover:text-emerald-700 underline underline-offset-2">
            Create client account
          </Link>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-rule/50 flex items-center justify-between text-xs text-muted">
        <Link href={mainUrl()} className="hover:text-ink transition-colors">
          ← Return to homepage
        </Link>
        <Link href={mainUrl("/contact")} className="hover:text-ink transition-colors">
          Need support?
        </Link>
      </div>
    </div>
  );
}
