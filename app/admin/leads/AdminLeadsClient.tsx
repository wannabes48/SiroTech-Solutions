"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { convertLeadToClientAction, updateLeadStatusAction, markLeadSpamAction } from "@/app/admin/actions";
import {
  Search,
  Filter,
  UserCheck,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  Tag,
  DollarSign,
  Calendar,
  Download,
  ShieldAlert,
  GripVertical,
  RefreshCw
} from "lucide-react";

export function AdminLeadsClient({
  initialLeads,
  currentStatus
}: {
  initialLeads: any[];
  currentStatus: string;
}) {
  const router = useRouter();
  const [leadsList, setLeadsList] = useState(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"LIST" | "PIPELINE">("LIST");
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state whenever props change (e.g. from server component revalidation or router.refresh())
  useEffect(() => {
    setLeadsList(initialLeads);
  }, [initialLeads]);

  // Auto-refresh interval (10 seconds) to ensure real-time visibility of new incoming leads
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(timer);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const statuses = ["ALL", "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];
  const kanbanColumns = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;

  const filtered = leadsList.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(term) ||
      (l.company && l.company.toLowerCase().includes(term)) ||
      l.email.toLowerCase().includes(term) ||
      (l.service && l.service.toLowerCase().includes(term));

    if (!matchesSearch) return false;
    if (currentStatus && currentStatus !== "ALL") {
      return l.status === currentStatus;
    }
    return true;
  });

  const handleConvert = (leadId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConvertingId(leadId);

    startTransition(async () => {
      const res = await convertLeadToClientAction(leadId);
      setConvertingId(null);
      if (res?.success) {
        router.push(adminPath(`/clients/${res.orgId}`));
      }
    });
  };

  const handleStageDrop = (targetStage: string) => {
    if (!draggingLeadId) return;
    const leadId = draggingLeadId;
    setDraggingLeadId(null);

    // Optimistic update
    setLeadsList((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: targetStage } : l))
    );

    startTransition(async () => {
      await updateLeadStatusAction(leadId, targetStage);
      router.refresh();
    });
  };

  const handleMarkSpam = (leadId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to mark this lead as spam?")) return;

    setLeadsList((prev) => prev.filter((l) => l.id !== leadId));
    startTransition(async () => {
      await markLeadSpamAction(leadId);
      router.refresh();
    });
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Company", "Email", "Phone", "Service", "Budget", "Timeline", "Status", "Value_KES", "Created_At"];
    const rows = filtered.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      l.email,
      l.phone || "",
      `"${(l.service || "").replace(/"/g, '""')}"`,
      l.budget || "",
      l.timeline || "",
      l.status,
      l.value || 0,
      l.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sirotech_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter Tabs & View Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <Link
              key={st}
              href={st === "ALL" ? adminPath("/leads") : adminPath(`/leads?status=${st}`)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                (st === "ALL" && !currentStatus) || currentStatus === st
                  ? "bg-[#1B2E24] text-white"
                  : "bg-white border border-rule text-muted hover:text-ink"
              }`}
            >
              {st}
            </Link>
          ))}
        </div>

        {/* Search Input, CSV Export & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads, emails..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            title="Refresh leads list"
            disabled={isRefreshing}
            className="p-2 rounded-full bg-white border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            title="Export filtered leads to CSV"
            className="p-2 rounded-full bg-white border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <div className="bg-white border border-rule rounded-full p-0.5 flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                viewMode === "LIST" ? "bg-sage-100 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("PIPELINE")}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                viewMode === "PIPELINE" ? "bg-sage-100 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Render Table or Kanban Pipeline Board */}
      {viewMode === "LIST" ? (
        <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Lead / Company</th>
                  <th className="py-3 px-6">Service Scope</th>
                  <th className="py-3 px-6">Pipeline Value</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {filtered.length > 0 ? (
                  filtered.map((lead) => (
                    <tr key={lead.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-4 px-6">
                        <Link href={adminPath(`/leads/${lead.id}`)} className="block group">
                          <div className="font-bold text-ink group-hover:text-emerald-700 transition-colors">
                            {lead.name}
                          </div>
                          <div className="text-muted flex items-center gap-2 mt-0.5">
                            {lead.company && <span>{lead.company}</span>}
                            <span>&bull;</span>
                            <span>{lead.email}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-ink font-medium">{lead.service || "Bespoke System"}</div>
                        <div className="text-muted text-[11px] mt-0.5">{lead.timeline || "Flexible"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-ink">
                          {lead.currency} {Number(lead.value || 0).toLocaleString()}
                        </div>
                        <div className="text-muted text-[11px] mt-0.5">{lead.budget || "Estimated"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <AdminStatusPill status={lead.status} />
                        {(lead.notify_status === "FAILED" || lead.autoreply_status === "FAILED") && (
                          <div
                            className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200"
                            title={lead.email_last_error || "An enquiry email failed; it retries automatically."}
                          >
                            Email failed
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lead.status !== "WON" && (
                            <button
                              type="button"
                              disabled={convertingId === lead.id}
                              onClick={(e) => handleConvert(lead.id, e)}
                              className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              {convertingId === lead.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                              <span>Convert</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleMarkSpam(lead.id, e)}
                            title="Mark as Spam"
                            className="p-1 text-muted hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          <Link
                            href={adminPath(`/leads/${lead.id}`)}
                            className="p-1 text-muted hover:text-ink rounded-lg hover:bg-surface transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted">
                      No leads matching your current criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Pipeline Board (Drag to Change Stage) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colLeads = filtered.filter((l) => l.status === col);
            const colTotalValue = colLeads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

            return (
              <div
                key={col}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleStageDrop(col)}
                className="bg-surface/50 rounded-3xl border border-rule/70 p-3.5 space-y-3 min-w-[220px] transition-colors"
              >
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-[11px] font-bold text-ink uppercase tracking-wider">{col}</span>
                    <div className="text-[10px] text-muted font-mono">
                      {(colTotalValue / 1000).toLocaleString()}k KES
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-rule text-[10px] font-bold text-ink">
                    {colLeads.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[140px]">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggingLeadId(lead.id)}
                      className="p-3.5 rounded-2xl bg-white border border-rule/80 hover:border-emerald-600/50 shadow-2xs transition-all space-y-2 cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <Link
                          href={adminPath(`/leads/${lead.id}`)}
                          className="font-bold text-xs text-ink group-hover:text-emerald-700 truncate block flex-1"
                        >
                          {lead.name}
                        </Link>
                        <GripVertical className="w-3.5 h-3.5 text-muted/60 shrink-0 mt-0.5" />
                      </div>
                      <div className="text-[11px] text-muted truncate">
                        {lead.company || lead.service}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-rule/40 text-[10px]">
                        <span className="font-bold text-ink font-mono">
                          {lead.currency} {Number(lead.value || 0).toLocaleString()}
                        </span>
                        <Link
                          href={adminPath(`/leads/${lead.id}`)}
                          className="text-emerald-700 hover:underline font-semibold"
                        >
                          View &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="h-28 border border-dashed border-rule/70 rounded-2xl flex items-center justify-center text-[11px] text-muted text-center p-2">
                      Drop here to set {col}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
