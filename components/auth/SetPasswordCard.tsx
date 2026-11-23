"use client";

import { useState, useTransition } from "react";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { setPasswordAction } from "@/app/(auth)/actions";

/** Optional "set a password" step shown after an invite or sign-in link. */
export function SetPasswordCard({ title = "Set a password (optional)" }: { title?: string }) {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("password", password);
    start(async () => {
      const res = await setPasswordAction(fd);
      setMsg(res.ok ? { ok: true, text: res.message || "Password saved." } : { ok: false, text: res.error });
      if (res.ok) setPassword("");
    });
  };

  return (
    <form onSubmit={submit} className="p-5 rounded-2xl bg-white border border-rule/80 shadow-xs space-y-3 text-xs">
      <div>
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        <p className="text-muted mt-0.5">You can always sign in with an emailed link instead.</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters, letters and numbers"
            aria-label="New password"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink"
          />
        </div>
        <button
          type="submit"
          disabled={pending || password.length < 8}
          className="px-4 py-2.5 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {msg && (
        <div className={`flex items-center gap-2 ${msg.ok ? "text-emerald-800" : "text-red-700"}`} role="status">
          {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}
    </form>
  );
}
