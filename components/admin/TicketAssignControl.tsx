"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { assignSupportTicketAction } from "@/app/admin/actions";

/** Reassign a ticket. Default routing: billing/account/questions to the client manager, bugs/changes to delivery. */
export function TicketAssignControl({
  ticketId,
  currentAssigneeName,
  staff
}: {
  ticketId: string;
  currentAssigneeName: string | null;
  staff: { id: string; name: string }[];
}) {
  const router = useRouter();
  const current = staff.find((s) => s.name === currentAssigneeName)?.id || "";
  const [value, setValue] = useState(current);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const change = (id: string) => {
    setValue(id);
    startTransition(async () => {
      const res = await assignSupportTicketAction(ticketId, id);
      setMsg(res?.error || "Reassigned");
      setTimeout(() => setMsg(null), 3000);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs bg-white rounded-2xl border border-rule/80 px-4 py-2.5">
      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
      <label htmlFor="ticket-assignee" className="font-semibold text-ink">Assigned to</label>
      <select
        id="ticket-assignee"
        value={value}
        disabled={isPending}
        onChange={(e) => change(e.target.value)}
        className="px-3 py-1.5 rounded-xl bg-surface border border-rule font-semibold"
      >
        {!current && <option value="">{currentAssigneeName || "Unassigned"}</option>}
        {staff.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      {msg && <span className="text-muted">{msg}</span>}
    </div>
  );
}
