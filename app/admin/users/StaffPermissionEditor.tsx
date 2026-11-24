"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, ShieldCheck, X } from "lucide-react";
import { setStaffAccessAction } from "@/app/admin/actions";
import {
  ASSIGNABLE_PRESETS,
  PERMISSION_CATALOG,
  PRESETS,
  PRESET_KEYS,
  can,
  effectivePermissions,
  type PresetKey
} from "@/lib/admin-permissions-client";
import { visibleNavigation } from "@/components/admin/AdminShell";

type Mode = "inherit" | "allow" | "deny";

function modeFor(overrides: string[], perm: string): Mode {
  if (overrides.includes(`!${perm}`)) return "deny";
  if (overrides.includes(perm)) return "allow";
  return "inherit";
}

/**
 * Owner-only editor: a preset plus per-permission overrides (inherit / allow / deny,
 * deny always wins), the live effective list, and a read-only "view as" preview of
 * the sidebar this person will get. Saving is audited with before and after.
 */
export function StaffPermissionEditor({
  user,
  onClose,
  runWithReauth = (fn) => fn()
}: {
  user: { id: string; name: string; preset: PresetKey; overrides: string[]; scope?: "all" | "assigned" };
  onClose: () => void;
  /** Wraps the save so the owner is asked to re-authenticate when needed. */
  runWithReauth?: <T>(fn: () => Promise<T>) => Promise<T>;
}) {
  const [scope, setScope] = useState<"all" | "assigned">(user.scope || "all");
  const router = useRouter();
  const [preset, setPreset] = useState<PresetKey>(user.preset);
  const [overrides, setOverrides] = useState<string[]>(user.overrides || []);
  const [tab, setTab] = useState<"permissions" | "preview">("permissions");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subject = useMemo(() => ({ preset, overrides: preset === "admin" ? [] : overrides, isOwner: preset === "admin" }), [preset, overrides]);
  const effective = useMemo(() => effectivePermissions(subject), [subject]);
  const presetOnly = useMemo(() => ({ preset, overrides: [], isOwner: preset === "admin" }), [preset]);

  const setMode = (perm: string, mode: Mode) =>
    setOverrides((prev) => {
      const rest = prev.filter((x) => x !== perm && x !== `!${perm}`);
      if (mode === "allow") return [...rest, perm];
      if (mode === "deny") return [...rest, `!${perm}`];
      return rest;
    });

  const save = () =>
    startTransition(async () => {
      setError(null);
      const res = await runWithReauth(() => setStaffAccessAction(user.id, { preset, overrides, scope }));
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });

  const offered = PRESET_KEYS.filter((k) => ASSIGNABLE_PRESETS.includes(k) || k === user.preset);

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="perm-editor-title">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-rule shadow-2xl p-6 space-y-4 max-h-[92vh] flex flex-col text-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="perm-editor-title" className="font-bold text-base text-ink">Permissions: {user.name}</h3>
            <p className="text-muted mt-0.5">Start from a preset, then allow or deny single actions. A deny always wins. Every action is checked on the server.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-muted hover:text-ink cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="font-semibold text-ink" htmlFor="perm-preset">Preset</label>
          <select
            id="perm-preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value as PresetKey)}
            className="px-3 py-2 rounded-xl bg-surface border border-rule font-semibold"
          >
            {offered.map((k) => (
              <option key={k} value={k}>{PRESETS[k].label}</option>
            ))}
          </select>
          <span className="text-muted flex-1 min-w-[200px]">{PRESETS[preset].description}</span>
          <div className="inline-flex rounded-full border border-rule p-0.5">
            {(["permissions", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-full font-semibold cursor-pointer ${tab === t ? "bg-[#1B2E24] text-white" : "text-muted"}`}
              >
                {t === "permissions" ? "Permissions" : <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> View as</span>}
              </button>
            ))}
          </div>
        </div>

        {preset !== "admin" && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-ink">Access to clients</span>
            <div className="inline-flex rounded-full border border-rule p-0.5" role="radiogroup" aria-label="Client access">
              {(["all", "assigned"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={scope === v}
                  onClick={() => setScope(v)}
                  className={`px-3 py-1 rounded-full font-semibold cursor-pointer ${scope === v ? "bg-[#1B2E24] text-white" : "text-muted"}`}
                >
                  {v === "all" ? "All clients and projects" : "Only assigned"}
                </button>
              ))}
            </div>
            <span className="text-muted flex-1 min-w-[220px]">
              {scope === "assigned"
                ? "Only clients where they're the account manager and projects where they're the delivery lead. Business-wide totals, exports and reports are hidden."
                : "Sees every client and project their permissions allow."}
            </span>
          </div>
        )}

        {preset === "admin" && (
          <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            Owners can do everything, including staff, refunds and voids. Only give this to a business owner.
          </p>
        )}

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
          {tab === "permissions" ? (
            <div className="md:col-span-2 space-y-4">
              {PERMISSION_CATALOG.map((group) => (
                <div key={group.group} className="rounded-2xl border border-rule/70 overflow-hidden">
                  <div className="px-3 py-2 bg-surface/60 font-bold text-ink">{group.group}</div>
                  <div className="divide-y divide-rule/50">
                    {group.perms.map((p) => {
                      const mode = modeFor(overrides, p.key);
                      const inherited = can(presetOnly, p.key);
                      const on = effective.includes(p.key);
                      return (
                        <div key={p.key} className="px-3 py-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className={`font-semibold ${on ? "text-ink" : "text-muted"}`}>{p.label}</div>
                            <div className="font-mono text-[10px] text-muted">{p.key}</div>
                          </div>
                          <div className="inline-flex rounded-full border border-rule p-0.5 shrink-0" role="radiogroup" aria-label={p.key}>
                            {(["inherit", "allow", "deny"] as Mode[]).map((m) => (
                              <button
                                key={m}
                                type="button"
                                role="radio"
                                aria-checked={mode === m}
                                disabled={preset === "admin"}
                                onClick={() => setMode(p.key, m)}
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer disabled:cursor-not-allowed ${
                                  mode === m
                                    ? m === "deny"
                                      ? "bg-red-700 text-white"
                                      : m === "allow"
                                        ? "bg-emerald-700 text-white"
                                        : "bg-ink text-white"
                                    : "text-muted"
                                }`}
                              >
                                {m === "inherit" ? `Inherit (${inherited ? "on" : "off"})` : m === "allow" ? "Allow" : "Deny"}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="md:col-span-2 rounded-2xl border border-rule/70 p-4 space-y-3 bg-surface/30">
              <p className="text-muted">The sidebar {user.name} will see. Pages not listed return a 404 if they type the address. Nothing is changed by previewing.</p>
              {visibleNavigation(subject).map((g) => (
                <div key={g.group}>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1">{g.group}</div>
                  <ul className="space-y-1">
                    {g.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.href} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-rule/60 text-ink">
                          <Icon className="w-3.5 h-3.5 text-muted" /> {item.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-rule/70 p-3 space-y-2 h-fit md:sticky md:top-0">
            <div className="font-bold text-ink inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Effective permissions ({effective.length})
            </div>
            <ul className="space-y-0.5 font-mono text-[10px] text-body max-h-[50vh] overflow-y-auto">
              {effective.map((perm) => (
                <li key={perm}>{perm}</li>
              ))}
            </ul>
          </div>
        </div>

        {error && <p className="text-red-700 font-semibold">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-rule">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-full border border-rule font-semibold cursor-pointer">Cancel</button>
          <button type="button" onClick={save} disabled={isPending} className="px-5 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-50">
            {isPending ? "Saving…" : "Save permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}
