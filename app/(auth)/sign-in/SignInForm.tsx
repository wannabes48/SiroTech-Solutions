"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, AlertCircle, Eye, KeyRound } from "lucide-react";
import { signInAction } from "@/app/portal/actions";
import ConcentricRing from "@/components/ui/concentric-ring";
import { mainUrl } from "@/lib/hosts";

/** Only same-host relative paths are allowed as post-login destinations. */
function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

export default function SignInForm({ variant }: { variant: "portal" | "admin" }) {
  const isAdmin = variant === "admin";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const togglePasswordVisibility = () => {
    if (showPassword) {
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
      setShowPassword(false);
    } else {
      setShowPassword(true);
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
      // Reveal password briefly for 3 seconds then automatically re-hide
      passwordTimerRef.current = setTimeout(() => {
        setShowPassword(false);
      }, 3000);
    }
  };

  React.useEffect(() => {
    return () => {
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
    };
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (isAdmin) formData.append("totp", totpCode);

    startTransition(async () => {
      try {
        const result = await signInAction(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          // ?next= is set by middleware; otherwise use the action's default for this host.
          const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          const destination = safeNext(searchParams?.get("next")) || result.redirect || "/";
          router.push(destination);
          router.refresh();
        }
      } catch (err: any) {
        setError(err.message || "Failed to sign in. Please verify your credentials.");
      }
    });
  };

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

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
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
                pattern="\d{6}"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink tracking-widest"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {isPending ? (
            <>
              <ConcentricRing size="sm" variant="white" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>{isAdmin ? "Sign In" : "Sign In to Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

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
