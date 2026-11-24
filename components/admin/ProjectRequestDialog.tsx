"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, X } from "lucide-react";
import { createProjectRequestAction } from "@/app/admin/actions";

/**
 * Client manager -> delivery hand-off. Creates a project in REQUESTED status with
 * the brief; delivery is notified and scopes it. Hidden from the client portal
 * until accepted.
 */
export function ProjectRequestDialog({
  organizations,
  defaultOrgId,
  defaultTitle = "",
  defaultBrief = "",
  defaultBudget,
  leadId,
  label = "Request a project",
  className
}: {
  organizations: { id: string; name: string }[];
  defaultOrgId?: string;
  defaultTitle?: string;
  defaultBrief?: string;
  defaultBudget?: number;
  leadId?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [orgId, setOrgId] = useState(defaultOrgId || organizations[0]?.id || "");
  const [title, setTitle] = useState(defaultTitle);
  const [brief, setBrief] = useState(defaultBrief);
  const [budget, setBudget] = useState<string>(defaultBudget ? String(defaultBudget) : "");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createProjectRequestAction({
        orgId,
        title: title.trim(),
        brief: brief.trim(),
        budgetKes: budget ? Number(budget) : undefined,
        deadline: deadline || undefined,
        leadId
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      if (res?.projectId) router.push(adminPath(`/projects/${res.projectId}`));
      else router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "py-2 px-4 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        }
      >
        <Send className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-white rounded-3xl max-w-lg w-full border border-rule shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-ink">Request a project</h3>
                <p className="text-muted mt-0.5">Delivery is notified and scopes it: milestones, dates and status. You can follow progress from the project page.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 text-muted hover:text-ink cursor-pointer" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block">
              <span className="font-semibold text-ink block mb-1">Client</span>
              <select value={orgId} onChange={(e) => setOrgId(e.target.value)} required className="w-full px-3 py-2 rounded-xl bg-surface border border-rule">
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-semibold text-ink block mb-1">Project name</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} className="w-full px-3 py-2 rounded-xl bg-surface border border-rule" />
            </label>
            <label className="block">
              <span className="font-semibold text-ink block mb-1">Brief</span>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                required
                minLength={20}
                rows={6}
                placeholder="What the client wants, what was agreed, must-haves, links to the proposal…"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-semibold text-ink block mb-1">Budget (KES)</span>
                <input type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-surface border border-rule" />
              </label>
              <label className="block">
                <span className="font-semibold text-ink block mb-1">Deadline</span>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-surface border border-rule" />
              </label>
            </div>

            {error && <p className="text-rose-700 font-semibold">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-full border border-rule font-semibold cursor-pointer">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 rounded-full bg-[#1B2E24] text-white font-bold cursor-pointer">
                {isPending ? "Sending…" : "Send to delivery"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
