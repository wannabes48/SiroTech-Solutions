"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { decideApprovalAction } from "@/app/admin/actions";

const LABEL: Record<string, string> = {
  void_invoice: "Void invoice",
  refund_invoice: "Refund invoice",
  refund_payment: "Refund payment"
};

/** Owner's queue of approval requests. Approving runs the action straight away. */
export function ApprovalsPanel({ approvals }: { approvals: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const decide = (id: string, decision: "APPROVE" | "DENY", label: string) => {
    if (decision === "APPROVE" && !confirm(`Approve and run "${label}" now? This can't be undone.`)) return;
    setBusyId(id);
    startTransition(async () => {
      const res = await decideApprovalAction(id, decision, notes[id]);
      setBusyId(null);
      setMsg(res?.error ? { ok: false, text: res.error } : { ok: true, text: res?.result || "Done" });
      router.refresh();
    });
  };

  return (
    <div className="bg-rose-50/60 rounded-3xl border border-rose-200 p-6 shadow-xs space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-rose-950 inline-flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-700" /> Approvals waiting for you
        </h2>
        <span className="font-semibold text-rose-900">{approvals.length} open</span>
      </div>
      {msg && <p className={`font-semibold ${msg.ok ? "text-emerald-800" : "text-rose-800"}`}>{msg.text}</p>}
      <div className="divide-y divide-rose-200">
        {approvals.map((a) => {
          const label = `${LABEL[a.action] || a.action} ${a.label || ""}`.trim();
          const href = a.entity === "payment" ? adminPath("/payments") : adminPath(`/invoices/${a.entity_id}`);
          return (
            <div key={a.id} className="py-3 flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
              <div className="min-w-0 space-y-0.5">
                <div className="font-bold text-ink">
                  <Link href={href} className="hover:underline">{label}</Link>
                  {a.org_name && <span className="text-muted font-normal"> • {a.org_name}</span>}
                </div>
                <div className="text-body">
                  {a.payload?.amountKes ? <b>KES {Number(a.payload.amountKes).toLocaleString()} • </b> : null}
                  &ldquo;{a.reason}&rdquo;
                </div>
                <div className="text-muted">
                  Requested by {a.requested_by_name || "staff"} on {new Date(a.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  value={notes[a.id] || ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))}
                  placeholder="Note (optional)"
                  className="px-3 py-1.5 rounded-xl bg-white border border-rule w-40"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => decide(a.id, "DENY", label)}
                  className="px-3 py-1.5 rounded-full border border-rule bg-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {busyId === a.id ? "…" : "Deny"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => decide(a.id, "APPROVE", label)}
                  className="px-3 py-1.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {busyId === a.id ? "…" : "Approve & run"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
