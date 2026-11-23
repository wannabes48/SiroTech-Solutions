"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { verifyTwoStepAction, signOutAction } from "../actions";

export default function TwoStepForm({ next }: { next: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("code", code);
    fd.set("next", next);
    start(async () => {
      const res = await verifyTwoStepAction(fd);
      if (!res.ok) return setError(res.error);
      router.push(res.redirect || "/");
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Two-step verification</h1>
        <p className="text-muted text-xs sm:text-sm mt-1.5">Enter the 6-digit code from your authenticator app.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="relative">
          <KeyRound className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            aria-label="Authenticator code"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-sm text-ink tracking-[0.3em]"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <span>{pending ? "Checking…" : "Verify"}</span>
          {!pending && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      <form action={signOutAction} className="mt-5 text-center">
        <button type="submit" className="text-xs text-muted hover:text-ink underline underline-offset-2 cursor-pointer">
          Sign out
        </button>
      </form>
    </div>
  );
}
