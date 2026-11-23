"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  togglePauseRecurringPlanAction,
  editRecurringPlanAction,
  createRecurringPlanAction,
  autoCreateAndSendRecurringInvoiceAction,
  dismissRecurringFailureAlertAction
} from "@/app/admin/actions";
import {
  RefreshCw,
  Plus,
  Search,
  Play,
  Pause,
  Edit,
  Send,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  Clock,
  ShieldCheck,
  Check,
  X,
  FileSpreadsheet
} from "lucide-react";

export function AdminRecurringClient({
  initialPlans,
  organizations,
  projects,
  currentStaff
}: {
  initialPlans: any[];
  organizations: any[];
  projects: any[];
  currentStaff: any;
}) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [activeTab, setActiveTab] = useState<"ALL" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ALERTS">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOrgId, setNewOrgId] = useState(organizations[0]?.id || "");
  const [newProjectId, setNewProjectId] = useState("");
  const [newPlanType, setNewPlanType] = useState<"CARE_PLAN" | "RETAINER" | "MAINTENANCE">("CARE_PLAN");
  const [newSchedule, setNewSchedule] = useState<"MONTHLY" | "QUARTERLY" | "YEARLY">("MONTHLY");
  const [newAmountKes, setNewAmountKes] = useState(150000);
  const [newAutoSend, setNewAutoSend] = useState(true);
  const [newNextRunDate, setNewNextRunDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  // Edit Modal State
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      plan.title.toLowerCase().includes(term) ||
      (plan.org_name && plan.org_name.toLowerCase().includes(term)) ||
      plan.plan_type.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (activeTab === "ALL") return true;
    if (activeTab === "ALERTS") return Boolean(plan.failure_alert);
    return plan.schedule === activeTab;
  });

  // Calculate MRR (Monthly Recurring Revenue)
  const calculateMRR = () => {
    return plans.reduce((acc, plan) => {
      if (plan.status !== "ACTIVE") return acc;
      const amt = Number(plan.amount_kes) || 0;
      if (plan.schedule === "MONTHLY") return acc + amt;
      if (plan.schedule === "QUARTERLY") return acc + Math.round(amt / 3);
      if (plan.schedule === "YEARLY") return acc + Math.round(amt / 12);
      return acc;
    }, 0);
  };

  const activePlansCount = plans.filter((p) => p.status === "ACTIVE").length;
  const failureAlertsCount = plans.filter((p) => Boolean(p.failure_alert)).length;

  // Upcoming runs in 14 days
  const now = new Date();
  const fourteenDaysLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const upcomingRunsCount = plans.filter((p) => {
    if (p.status !== "ACTIVE") return false;
    const runDate = new Date(p.next_run_date);
    return runDate >= now && runDate <= fourteenDaysLater;
  }).length;

  const handleTogglePause = (plan: any) => {
    const isPaused = plan.status === "PAUSED";
    startTransition(async () => {
      await togglePauseRecurringPlanAction(plan.id, !isPaused);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: isPaused ? "ACTIVE" : "PAUSED" } : p))
      );
      showToast(`${plan.title} is now ${isPaused ? "ACTIVE" : "PAUSED"}.`);
      router.refresh();
    });
  };

  const handleAutoCreateAndSend = (plan: any) => {
    startTransition(async () => {
      const res = await autoCreateAndSendRecurringInvoiceAction(plan.id);
      if (res.success) {
        showToast(`Invoice ${res.invoiceNumber} successfully created & dispatched for ${plan.title}!`);
        router.refresh();
      } else {
        alert(res.error || "Failed to generate invoice.");
      }
    });
  };

  const handleDismissAlert = (planId: string) => {
    startTransition(async () => {
      await dismissRecurringFailureAlertAction(planId);
      setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, failure_alert: null } : p)));
      showToast("Failure alert dismissed.");
      router.refresh();
    });
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrgId) return;

    startTransition(async () => {
      const res = await createRecurringPlanAction({
        orgId: newOrgId,
        projectId: newProjectId || undefined,
        title: newTitle.trim(),
        planType: newPlanType,
        schedule: newSchedule,
        amountKes: Number(newAmountKes),
        autoSend: newAutoSend,
        nextRunDate: newNextRunDate
      });

      if (res.success) {
        setShowCreateModal(false);
        setNewTitle("");
        showToast("New recurring care plan created successfully.");
        router.refresh();
      } else {
        alert(res.error || "Failed to create plan.");
      }
    });
  };

  const handleEditPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    startTransition(async () => {
      const res = await editRecurringPlanAction({
        id: editingPlan.id,
        title: editingPlan.title,
        planType: editingPlan.plan_type,
        schedule: editingPlan.schedule,
        amountKes: Number(editingPlan.amount_kes),
        amountUsd: Number(editingPlan.amount_usd),
        autoSend: Boolean(editingPlan.auto_send),
        nextRunDate: editingPlan.next_run_date,
        failureAlert: editingPlan.failure_alert
      });

      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id ? { ...p, ...editingPlan } : p))
        );
        setEditingPlan(null);
        showToast("Recurring care plan updated.");
        router.refresh();
      } else {
        alert(res.error || "Failed to update plan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white font-medium text-xs flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-muted">Active Retainers &amp; Care Plans</span>
          <div className="text-2xl font-bold text-ink">{activePlansCount} Plans</div>
          <div className="text-[11px] text-muted">Across active client organizations</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-muted">Monthly Recurring Volume (MRR)</span>
          <div className="text-2xl font-bold text-emerald-800">
            KES {calculateMRR().toLocaleString()}
          </div>
          <div className="text-[11px] text-muted">Normalized monthly subscription value</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-muted">Upcoming Runs (14 Days)</span>
          <div className="text-2xl font-bold text-blue-800">{upcomingRunsCount} Runs</div>
          <div className="text-[11px] text-muted">Scheduled for auto-invoice generation</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-muted">Failure Alerts</span>
          <div className={`text-2xl font-bold ${failureAlertsCount > 0 ? "text-amber-600" : "text-ink"}`}>
            {failureAlertsCount}
          </div>
          <div className="text-[11px] text-muted">
            {failureAlertsCount > 0 ? "Requires review or gateway re-auth" : "All cycles healthy"}
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["ALL", "MONTHLY", "QUARTERLY", "YEARLY"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === tab
                  ? "bg-[#1B2E24] text-white"
                  : "bg-white border border-rule text-muted hover:text-ink"
              }`}
            >
              {tab === "ALL" ? `All Plans (${plans.length})` : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setActiveTab("ALERTS")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === "ALERTS"
                ? "bg-amber-800 text-white"
                : "bg-white border border-rule text-amber-900 hover:bg-amber-50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Failure Alerts ({failureAlertsCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search retainers, clients..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="py-1.5 px-4 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Recurring Plan</span>
          </button>
        </div>
      </div>

      {/* Plans List Table */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Plan Title &amp; Client</th>
                <th className="py-3 px-6">Type &amp; Schedule</th>
                <th className="py-3 px-6">Amount (KES)</th>
                <th className="py-3 px-6">Next Run Date</th>
                <th className="py-3 px-6">Auto-Create &amp; Send</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => {
                  const isPaused = plan.status === "PAUSED";
                  const nextDate = new Date(plan.next_run_date);
                  const isDueSoon = nextDate <= fourteenDaysLater && !isPaused;

                  return (
                    <React.Fragment key={plan.id}>
                      <tr className="hover:bg-surface/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-ink text-sm">{plan.title}</div>
                          <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-muted" />
                            <span>{plan.org_name || "Direct Client"}</span>
                            {plan.project_title && (
                              <>
                                <span>&bull;</span>
                                <span className="text-ink font-medium">{plan.project_title}</span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-rule text-ink">
                              {plan.plan_type.replace("_", " ")}
                            </span>
                            <span className="text-[10px] font-semibold text-muted uppercase">
                              {plan.schedule}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono">
                          <div className="font-bold text-ink">
                            KES {Number(plan.amount_kes).toLocaleString()}
                          </div>
                          {plan.amount_usd && (
                            <div className="text-[10px] text-muted">
                              ${Number(plan.amount_usd).toLocaleString()} USD
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 font-medium text-ink">
                            <Calendar className="w-3.5 h-3.5 text-muted" />
                            <span>{nextDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                          {isDueSoon && (
                            <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Upcoming Cycle
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {plan.auto_send ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Auto-Send Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
                              <Clock className="w-3.5 h-3.5" />
                              Manual Review Only
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaused
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}
                          >
                            {plan.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePause(plan)}
                              disabled={isPending}
                              title={isPaused ? "Resume recurring schedule" : "Pause recurring schedule"}
                              className="p-1.5 rounded-full hover:bg-surface border border-rule text-ink cursor-pointer transition-colors"
                            >
                              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-700" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingPlan({ ...plan })}
                              title="Edit Plan"
                              className="p-1.5 rounded-full hover:bg-surface border border-rule text-ink cursor-pointer transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAutoCreateAndSend(plan)}
                              disabled={isPending}
                              title="Auto-create & Send Invoice Now"
                              className="py-1 px-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>Run Now</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Failure Alert Banner Row if Present */}
                      {plan.failure_alert && (
                        <tr className="bg-amber-50/60 border-b border-amber-200">
                          <td colSpan={7} className="py-2.5 px-6">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-amber-900 font-medium">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>
                                  <strong>Failure Alert:</strong> {plan.failure_alert}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAutoCreateAndSend(plan)}
                                  disabled={isPending}
                                  className="px-2.5 py-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Retry Invoice Creation
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDismissAlert(plan.id)}
                                  disabled={isPending}
                                  className="px-2.5 py-1 rounded-full bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-[10px] font-semibold cursor-pointer"
                                >
                                  Dismiss Alert
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted">
                    No recurring care plans or retainers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Recurring Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">New Recurring Care Plan or Retainer</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Client Organization *</label>
                <select
                  required
                  value={newOrgId}
                  onChange={(e) => setNewOrgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-medium"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Associated Project (Optional)</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-medium"
                >
                  <option value="">No specific project (Org-wide Retainer)</option>
                  {projects
                    .filter((p) => !newOrgId || p.org_id === newOrgId)
                    .map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Plan Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 24/7 Production SLA & DevOps Retainer"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Plan Category</label>
                  <select
                    value={newPlanType}
                    onChange={(e: any) => setNewPlanType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-medium"
                  >
                    <option value="CARE_PLAN">Care Plan</option>
                    <option value="RETAINER">Retainer</option>
                    <option value="MAINTENANCE">Infrastructure Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Billing Schedule *</label>
                  <select
                    value={newSchedule}
                    onChange={(e: any) => setNewSchedule(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-medium"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Amount (KES) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newAmountKes}
                    onChange={(e) => setNewAmountKes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">First Run Date *</label>
                  <input
                    type="date"
                    required
                    value={newNextRunDate}
                    onChange={(e) => setNewNextRunDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface/80 border border-rule/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink">Auto-Create &amp; Dispatch Invoices</div>
                  <div className="text-[11px] text-muted">
                    Automatically generate invoice and notify client owner on each cycle run
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newAutoSend}
                  onChange={(e) => setNewAutoSend(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer shadow-xs"
                >
                  Create Recurring Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Recurring Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Edit Recurring Plan</h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditPlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={editingPlan.title}
                  onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Billing Schedule</label>
                  <select
                    value={editingPlan.schedule}
                    onChange={(e) => setEditingPlan({ ...editingPlan, schedule: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-medium"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Amount (KES)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingPlan.amount_kes}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, amount_kes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Next Run Date</label>
                  <input
                    type="date"
                    required
                    value={
                      editingPlan.next_run_date
                        ? new Date(editingPlan.next_run_date).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, next_run_date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Plan Category</label>
                  <select
                    value={editingPlan.plan_type}
                    onChange={(e) => setEditingPlan({ ...editingPlan, plan_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-medium"
                  >
                    <option value="CARE_PLAN">Care Plan</option>
                    <option value="RETAINER">Retainer</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">
                  Failure Alert Message (Optional)
                </label>
                <input
                  type="text"
                  value={editingPlan.failure_alert || ""}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      failure_alert: e.target.value || null
                    })
                  }
                  placeholder="e.g. Card expired or gateway timeout on previous attempt"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule placeholder:text-muted"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface/80 border border-rule/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink">Auto-Create &amp; Dispatch Invoices</div>
                  <div className="text-[11px] text-muted">
                    Execute invoice creation automatically when next run date arrives
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(editingPlan.auto_send)}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, auto_send: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
