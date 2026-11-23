"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  updateConsultationStatusAction,
  addConsultationNoteAction,
  createAdminTaskAction,
  createAdminConsultationAction
} from "@/app/admin/actions";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  CheckSquare,
  Loader2,
  Plus,
  ArrowRight,
  Filter,
  RefreshCw,
  ExternalLink,
  Sparkles
} from "lucide-react";

export function AdminConsultationsClient({ initialConsultations }: { initialConsultations: any[] }) {
  const router = useRouter();
  const [consultations, setConsultations] = useState(initialConsultations);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [taskConsultationId, setTaskConsultationId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 1. Sync consultations with server props
  useEffect(() => {
    setConsultations(initialConsultations);
  }, [initialConsultations]);

  // 2. Real-time 15-second polling for newly booked consultations
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(timer);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const statuses = ["ALL", "SCHEDULED", "ATTENDED", "NO_SHOW", "CANCELLED"];

  const filtered = consultations.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    startTransition(async () => {
      await updateConsultationStatusAction(id, newStatus);
      router.refresh();
    });
  };

  const handleSaveNotes = (id: string) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: noteText } : c))
    );
    setEditingNotesId(null);

    startTransition(async () => {
      await addConsultationNoteAction(id, noteText);
      router.refresh();
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskConsultationId) return;

    const formData = new FormData();
    formData.append("title", taskTitle.trim());

    startTransition(async () => {
      await createAdminTaskAction(formData);
      setTaskConsultationId(null);
      setTaskTitle("");
      router.refresh();
    });
  };

  const handleManualCreateConsultation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createAdminConsultationAction(formData);
      if (res?.error) {
        setCreateError(res.error);
      } else {
        setShowCreateModal(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#1B2E24] text-white"
                  : "bg-white border border-rule text-muted hover:text-ink"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 rounded-full bg-white border border-rule text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Refresh latest Cal.com bookings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : "text-muted"}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-1.5 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Consultation</span>
          </button>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Prospect / Organization</th>
                <th className="py-3 px-6">Scheduled Date (EAT)</th>
                <th className="py-3 px-6">Contact Details</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Notes &amp; Scope</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {filtered.length > 0 ? (
                filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-ink">{c.name}</div>
                      <div className="text-muted text-[11px] mt-0.5">{c.company || "Independent Prospect"}</div>
                      {c.cal_booking_id && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                            Cal.com: {c.cal_booking_id}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-semibold text-ink">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        <span>
                          {new Date(c.scheduled_at).toLocaleDateString("en-KE", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "Africa/Nairobi"
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted text-[11px] mt-0.5">
                        <Clock className="w-3 h-3 text-muted" />
                        <span>
                          {new Date(c.scheduled_at).toLocaleTimeString("en-KE", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Africa/Nairobi"
                          })}{" "}
                          EAT
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-ink">
                        <a href={`mailto:${c.email}`} className="hover:underline text-emerald-800 font-medium">
                          {c.email}
                        </a>
                      </div>
                      <div className="text-muted text-[11px] mt-0.5">{c.phone || "No phone provided"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <AdminStatusPill status={c.status} />
                    </td>
                    <td className="py-4 px-6">
                      {editingNotesId === c.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full p-2 rounded-xl bg-surface border border-rule text-xs focus:outline-none"
                          />
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveNotes(c.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[10px]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNotesId(null)}
                              className="px-2.5 py-1 rounded-lg bg-surface text-muted font-bold text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(c.id);
                            setNoteText(c.notes || "");
                          }}
                          className="cursor-pointer group flex items-start gap-1 text-[11px] text-muted hover:text-ink"
                        >
                          <span className="line-clamp-2 max-w-xs">{c.notes || "Click to add engineering notes..."}</span>
                          <MessageSquare className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status !== "ATTENDED" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(c.id, "ATTENDED")}
                            title="Mark Attended"
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Attended</span>
                          </button>
                        )}
                        {c.status !== "NO_SHOW" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(c.id, "NO_SHOW")}
                            title="Mark No-Show"
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3 text-amber-700" />
                            <span>No-Show</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setTaskConsultationId(c.id);
                            setTaskTitle(`Follow up with ${c.name} (${c.company || "Consultation"})`);
                          }}
                          title="Schedule Follow-up Task"
                          className="p-1 text-muted hover:text-ink rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted">
                    <div className="max-w-md mx-auto space-y-2">
                      <Calendar className="w-8 h-8 text-muted/40 mx-auto" />
                      <p className="font-semibold text-ink text-sm">No consultations found</p>
                      <p className="text-xs text-muted">
                        Any prospective client booking an engineering session from the public <code className="bg-surface px-1.5 py-0.5 rounded border">/book</code> page via Cal.com will be automatically ingested and displayed here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Consultation Creation Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-ink">Log Technical Consultation</h3>
              <p className="text-xs text-muted mt-1">
                Manually record a client discovery session or scheduled engineering call.
              </p>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {createError}
              </div>
            )}

            <form onSubmit={handleManualCreateConsultation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted">Prospect Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted">Company / Org</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. CoastLane Logistics"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+254 7XX XXX XXX"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted">Scheduled Date &amp; Time (EAT) *</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  required
                  defaultValue={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted">Scope / Discussion Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Architecture review, requirements scope, cloud hosting questions..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-rule/60">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Save Consultation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Creation Dialog */}
      {taskConsultationId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink">Schedule Follow-up Task</h3>
            <p className="text-xs text-muted">
              Create an internal task linked to this consultation for the engineering and sales team.
            </p>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task description..."
                className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTaskConsultationId(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
