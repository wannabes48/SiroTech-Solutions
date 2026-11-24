"use client";

import React, { useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { reauthenticateAction } from "@/app/admin/actions";

/**
 * Asks the owner to confirm it's them (authenticator code, or password) before a
 * staff change. Use through useReauth(): it runs the action, and if the server
 * answers { reauthRequired: true } it shows this dialog and retries once confirmed.
 */
function ReauthDialog({ hasAuthenticator, onDone }: { hasAuthenticator: boolean; onDone: (ok: boolean) => void }) {
  const [mode, setMode] = useState<"code" | "password">(hasAuthenticator ? "code" : "password");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await reauthenticateAction(mode === "code" ? { code: value } : { password: value });
    setBusy(false);
    if (res?.error) {
      setError(res.error);
      setValue("");
      return;
    }
    onDone(true);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reauth-title">
      <form onSubmit={submit} className="bg-white rounded-3xl max-w-sm w-full border border-rule shadow-2xl p-6 space-y-4 text-xs">
        <div className="flex items-start gap-3">
          <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-800"><ShieldCheck className="w-4 h-4" /></span>
          <div>
            <h3 id="reauth-title" className="font-bold text-base text-ink">Confirm it&apos;s you</h3>
            <p className="text-muted mt-0.5">Staff changes need a fresh check. You won&apos;t be asked again for 10 minutes.</p>
          </div>
        </div>

        {mode === "code" ? (
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="6-digit code from your authenticator"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-mono text-base tracking-widest text-center outline-none focus:ring-1 focus:ring-emerald-700"
            required
          />
        ) : (
          <input
            autoFocus
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your password"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule outline-none focus:ring-1 focus:ring-emerald-700"
            required
          />
        )}

        {error && <p className="text-red-700 font-semibold">{error}</p>}

        <div className="flex items-center justify-between gap-2">
          {hasAuthenticator ? (
            <button
              type="button"
              onClick={() => { setMode(mode === "code" ? "password" : "code"); setValue(""); setError(null); }}
              className="text-emerald-800 font-semibold hover:underline cursor-pointer"
            >
              {mode === "code" ? "Use password instead" : "Use authenticator code"}
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={() => onDone(false)} className="px-4 py-2 rounded-full border border-rule font-semibold cursor-pointer">Cancel</button>
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-full bg-emerald-800 text-white font-semibold cursor-pointer disabled:opacity-50">
              {busy ? "Checking…" : "Confirm"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function useReauth(hasAuthenticator: boolean) {
  const [open, setOpen] = useState(false);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const ask = () =>
    new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOpen(true);
    });

  /** Run a server action; if it needs re-authentication, ask and retry once. */
  async function call<T>(fn: () => Promise<T>): Promise<T> {
    let res = await fn();
    if (res && (res as { reauthRequired?: boolean }).reauthRequired) {
      if (await ask()) res = await fn();
    }
    return res;
  }

  const dialog = open ? (
    <ReauthDialog
      hasAuthenticator={hasAuthenticator}
      onDone={(ok) => {
        setOpen(false);
        resolver.current?.(ok);
        resolver.current = null;
      }}
    />
  ) : null;

  return { call, dialog };
}
