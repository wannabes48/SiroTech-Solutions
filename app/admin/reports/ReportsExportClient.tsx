"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Check,
  Loader2,
  Calendar,
  Receipt,
  Users,
  FolderGit2,
  LifeBuoy,
  ShieldCheck,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import type { AdminReportStats } from "@/lib/admin-db";

interface ReportsExportClientProps {
  stats: AdminReportStats;
}

export function ReportsExportClient({ stats }: ReportsExportClientProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>("all");
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reportPacks = [
    {
      id: "revenue",
      title: "Revenue & Tax Settlement Report",
      icon: Receipt,
      desc: "Complete transaction ledger of invoices, VAT (16%), withholding tax (5%), and settlement methods (Paystack & Bank Wire).",
      records: `${stats.revenue.invoicesCount} invoices • ${stats.revenue.paymentsCount} payments`,
      pill: `Collected: KES ${stats.revenue.totalCollectedKES.toLocaleString()}`,
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      id: "leads",
      title: "Sales Pipeline & Lead Attribution",
      icon: Users,
      desc: "All inbound inquiries, deal sizes, services requested, timelines, and marketing UTM attribution channels.",
      records: `${stats.leads.totalLeads} inquiries • ${stats.leads.wonLeads} won`,
      pill: `Pipeline: KES ${stats.leads.totalPipelineValueKES.toLocaleString()}`,
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    },
    {
      id: "consultations",
      title: "Consultations & Discovery Sessions",
      icon: Calendar,
      desc: "Client consultations booked via Cal.com, scheduled time slots, discovery notes, and booking statuses.",
      records: `${stats.consultations.totalBookings} booked • ${stats.consultations.scheduled} upcoming`,
      pill: `${stats.consultations.completed} completed`,
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    },
    {
      id: "delivery",
      title: "Sprint Milestones & Delivery Log",
      icon: FolderGit2,
      desc: "Engineering milestones, client approval signoffs, deliverables breakdown, and phase completion timestamps.",
      records: `${stats.delivery.totalMilestones} milestones • ${stats.delivery.approvedMilestones} approved`,
      pill: `${stats.delivery.inProgress} in progress`,
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      id: "support",
      title: "Support Tickets & SLA Compliance",
      icon: LifeBuoy,
      desc: "Client support tickets, priority categories, engineer assignments, response latencies, and resolution statuses.",
      records: `${stats.support.totalTickets} tickets • ${stats.support.openTickets} open`,
      pill: `${stats.support.urgentTickets} urgent priority`,
      badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    },
    {
      id: "audit",
      title: "Security & Audit Activity Stream",
      icon: ShieldCheck,
      desc: "Complete audit log of system mutations, client authentication, role changes, and administrative actions.",
      records: `${stats.audit.totalEvents} recorded events`,
      pill: "SOC-2 / Security Log",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    },
  ];

  const handleExport = async (reportId: string) => {
    setDownloading(reportId);
    setErrorMsg(null);

    try {
      const response = await fetch(
        `/api/admin/reports/export?type=${encodeURIComponent(reportId)}&range=${encodeURIComponent(dateRange)}`
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to generate report CSV.");
      }

      // Extract filename from header if available
      const disposition = response.headers.get("content-disposition");
      let filename = `sirotech_${reportId}_report.csv`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      // Convert to blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessId(reportId);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err: any) {
      console.error("[Export error]", err);
      setErrorMsg(err.message || "An unexpected error occurred while exporting.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Collected</span>
          </div>
          <div className="text-xl font-bold text-ink">
            KES {stats.revenue.totalCollectedKES.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted mt-1">
            Est. VAT 16%: KES {stats.revenue.vatLiabilityKES.toLocaleString()}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Pipeline Value</span>
          </div>
          <div className="text-xl font-bold text-ink">
            KES {stats.leads.totalPipelineValueKES.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted mt-1">
            {stats.leads.wonLeads} won of {stats.leads.totalLeads} total leads
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <FolderGit2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Milestone Delivery</span>
          </div>
          <div className="text-xl font-bold text-ink">
            {stats.delivery.approvedMilestones} / {stats.delivery.totalMilestones}
          </div>
          <p className="text-[11px] text-muted mt-1">
            {stats.delivery.inProgress} in progress • {stats.delivery.awaitingApproval} review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
            <span>Support Tickets</span>
          </div>
          <div className="text-xl font-bold text-ink">
            {stats.support.openTickets} Open
          </div>
          <p className="text-[11px] text-muted mt-1">
            {stats.support.resolvedTickets} resolved • {stats.support.urgentTickets} urgent
          </p>
        </div>
      </div>

      {/* Date Filter & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-rule/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-surface border border-rule flex items-center justify-center text-ink">
            <Filter className="w-4 h-4 text-muted" />
          </div>
          <div>
            <span className="text-xs font-bold text-ink block">Export Date Range</span>
            <span className="text-[11px] text-muted">Filter rows included in exported CSV datasets</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 text-xs font-semibold bg-surface border border-rule rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="all">All Time (Full Database)</option>
            <option value="30d">Last 30 Days</option>
            <option value="quarter">Current Quarter</option>
            <option value="year">Current Year (2026)</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Report Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportPacks.map((pack) => {
          const Icon = pack.icon;
          const isDownloading = downloading === pack.id;
          const isSuccess = successId === pack.id;

          return (
            <div
              key={pack.id}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-rule/80 shadow-2xs flex flex-col justify-between space-y-5 hover:border-emerald-600/30 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-surface border border-rule/80 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-ink">{pack.title}</h3>
                      <span className="text-[11px] font-mono text-muted">{pack.records}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${pack.badgeColor}`}
                  >
                    {pack.pill}
                  </span>
                </div>

                <p className="text-xs text-body leading-relaxed">{pack.desc}</p>
              </div>

              <div className="pt-2 border-t border-rule/50 flex items-center justify-between gap-3">
                <div className="text-[11px] text-muted flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>RFC 4180 CSV • UTF-8 BOM</span>
                </div>

                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={() => handleExport(pack.id)}
                  className={`py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50 ${
                    isSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-[#1B2E24] hover:bg-black text-white"
                  }`}
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloading ? "Generating..." : isSuccess ? "Exported!" : "Export CSV"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
