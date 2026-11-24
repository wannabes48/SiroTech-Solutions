"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { setAssignmentAction } from "@/app/admin/actions";

/** Owner control: account manager (client) or delivery lead (project). Drives assigned-only access. */
export function AssignmentControl({
  kind,
  targetId,
  currentUserId,
  staff
}: {
  kind: "account_manager" | "delivery_lead";
  targetId: string;
  currentUserId: string | null;
  staff: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentUserId || "");
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const label = kind === "account_manager" ? "Account manager" : "Delivery lead";

  const change = (id: string) => {
    setValue(id);
    startTransition(async () => {
      const res = await setAssignmentAction({ kind, targetId, userId: id || null });
      setMsg(res?.error || "Saved");
      setTimeout(() => setMsg(null), 3000);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs bg-white rounded-2xl border border-rule/80 px-4 py-2.5">
      <UserCog className="w-3.5 h-3.5 text-emerald-700" />
      <label htmlFor={`assign-${kind}`} className="font-semibold text-ink">{label}</label>
      <select
        id={`assign-${kind}`}
        value={value}
        disabled={isPending}
        onChange={(e) => change(e.target.value)}
        className="px-3 py-1.5 rounded-xl bg-surface border border-rule font-semibold"
      >
        <option value="">Not assigned</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <span className="text-muted">Staff with assigned-only access see this {kind === "account_manager" ? "client" : "project"} only if it&apos;s theirs.</span>
      {msg && <span className="text-muted font-semibold">{msg}</span>}
    </div>
  );
}
