"use client";

import { mainUrl, portalPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, User, Building, AlertCircle, Eye } from "lucide-react";
import { signUpAction } from "../actions";
import ConcentricRing from "@/components/ui/concentric-ring";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const confirmPasswordTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const togglePasswordVisibility = () => {
    if (showPassword) {
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
      setShowPassword(false);
    } else {
      setShowPassword(true);
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
      // Reveal briefly for 3 seconds then automatically re-hide
      passwordTimerRef.current = setTimeout(() => {
        setShowPassword(false);
      }, 3000);
    }
  };

  const toggleConfirmPasswordVisibility = () => {
    if (showConfirmPassword) {
      if (confirmPasswordTimerRef.current) clearTimeout(confirmPasswordTimerRef.current);
      setShowConfirmPassword(false);
    } else {
      setShowConfirmPassword(true);
      if (confirmPasswordTimerRef.current) clearTimeout(confirmPasswordTimerRef.current);
      // Reveal briefly for 3 seconds then automatically re-hide
      confirmPasswordTimerRef.current = setTimeout(() => {
        setShowConfirmPassword(false);
      }, 3000);
    }
  };

  React.useEffect(() => {
    return () => {
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
      if (confirmPasswordTimerRef.current) clearTimeout(confirmPasswordTimerRef.current);
    };
  }, []);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("company", company);
    formData.append("password", password);

    startTransition(async () => {
      try {
        const result = await signUpAction(formData);
        if (!result.ok) {
          setError(result.error);
        } else {
          // Usually /verify-email (Supabase sends a confirmation email); /welcome if confirmation is off.
          router.push(result.redirect || portalPath());
          router.refresh();
        }
      } catch (err: any) {
        setError(err.message || "Failed to create account. Please try again.");
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Create Client Account</h1>
        <p className="text-muted text-xs sm:text-sm mt-1.5">
          Join SiroTech Client Portal to track your software milestones, codebases, and invoices.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Full Name *</label>
          <div className="relative">
            <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amina Mohammed"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Work Email *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amina@savannahcoldchain.co.ke"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Company or Organisation</label>
          <div className="relative">
            <Building className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Savannah Cold Chain Logistics Ltd"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
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
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs sm:text-sm text-ink"
              />
              <Eye
                className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                  showConfirmPassword ? "text-emerald-700" : "text-muted hover:text-ink"
                }`}
                onClick={toggleConfirmPasswordVisibility}
              />
            </div>
          </div>
        </div>

        {/* Terms agreement */}
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-rule"
          />
          <span className="text-[11px] text-muted leading-tight">
            I agree to SiroTech&apos;s{" "}
            <Link href={mainUrl("/legal/terms")} target="_blank" className="text-ink font-semibold underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href={mainUrl("/legal/privacy")} target="_blank" className="text-ink font-semibold underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs mt-2"
        >
          {isPending ? (
            <>
              <ConcentricRing size="sm" variant="white" />
              <span>Creating your workspace...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Link to sign in */}
      <div className="mt-6 text-center text-xs text-muted">
        Already have a client account?{" "}
        <Link href="/sign-in" className="font-bold text-ink hover:text-emerald-700 underline underline-offset-2">
          Sign in here
        </Link>
      </div>

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
