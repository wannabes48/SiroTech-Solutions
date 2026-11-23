"use client";

import React, { useState, useTransition } from "react";
import { createAdminTaskAction, toggleAdminTaskAction } from "@/app/admin/actions";
import { Check, Clock, Plus, Loader2, Calendar, AlertCircle } from "lucide-react";

export function AdminTasksClient({ initialTasks }: { initialTasks: any[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("PENDING");
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueAt, setDueAt] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = tasks.filter((t) => {
    if (filter === "PENDING") return !t.done_at;
    if (filter === "COMPLETED") return !!t.done_at;
    return true;
  });

  const handleToggle = (taskId: string, currentDone: boolean) => {
    const newDone = !currentDone;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, done_at: newDone ? new Date().toISOString() : null } : t
      )
    );

    startTransition(async () => {
      await toggleAdminTaskAction(taskId, newDone);
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("priority", priority);
    if (dueAt) formData.append("dueAt", dueAt);

    startTransition(async () => {
      const res = await createAdminTaskAction(formData);
      if (res?.success) {
        setTitle("");
        setDueAt("");
        setIsCreating(false);
        // Refresh local tasks optimistic
        setTasks((prev) => [
          {
            id: `temp-${Date.now()}`,
            title,
            priority,
            due_at: dueAt || null,
            done_at: null,
            assignee_name: "You"
          },
          ...prev
        ]);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(["PENDING", "COMPLETED", "ALL"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filter === tab
                  ? "bg-[#1B2E24] text-white"
                  : "bg-white border border-rule text-muted hover:text-ink"
              }`}
            >
              {tab === "PENDING" ? "Active Tasks" : tab === "COMPLETED" ? "Completed" : "All Tasks"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-rule hover:bg-surface text-ink transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="text-sm font-bold text-ink">Create Operational Task</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Follow up on Daraja B2B sandbox keys with CoastLane"
                className="w-full px-3.5 py-2 rounded-xl bg-surface border border-rule/80 text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-rule/80 text-xs text-ink focus:outline-none"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent SLA</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-rule/80 text-xs text-ink focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3.5 py-1.5 rounded-full text-xs text-muted hover:text-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Task</span>
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs divide-y divide-rule/60 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((task) => {
            const isDone = !!task.done_at;
            const isOverdue = task.due_at && new Date(task.due_at) < new Date() && !isDone;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                  isDone ? "bg-surface/30 opacity-70" : "hover:bg-surface/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(task.id, isDone)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                    isDone
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-rule/80 hover:border-ink bg-white"
                  }`}
                  aria-label={isDone ? "Mark as pending" : "Mark as done"}
                >
                  {isDone && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold text-ink ${isDone ? "line-through text-muted" : ""}`}>
                    {task.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted">
                    {task.assignee_name && <span>Assigned to {task.assignee_name}</span>}
                    {task.lead_name && <span>Lead: {task.lead_name}</span>}
                    {task.project_title && <span>Project: {task.project_title}</span>}
                    {task.due_at && (
                      <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-rose-600 font-bold" : ""}`}>
                        <Calendar className="w-3 h-3" />
                        Due {new Date(task.due_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === "URGENT"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : task.priority === "HIGH"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-surface text-muted border border-rule"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-muted">
            No tasks found in this view.
          </div>
        )}
      </div>
    </div>
  );
}
