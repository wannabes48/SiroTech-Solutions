import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminAnalyticsData } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AnalyticsWebTrafficCard } from "@/components/admin/AnalyticsWebTrafficCard";
import { BarChart3, Users, Globe, ArrowUpRight, TrendingUp, CheckCircle2, ShieldCheck, DollarSign } from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requireStaffUser("reports:read");
  const data = await getAdminAnalyticsData();

  const leads = data?.leads || { total: 0, thisMonth: 0, won: 0, conversionRate: "0%", bySource: [], byService: [] };
  const revenue = data?.revenue || { totalCollectedKES: 0, byMonth: [], methods: [] };
  const delivery = data?.delivery || { totalProjects: 0, activeProjects: 0, avgProgress: 0, milestoneOnTimeRate: "100%" };
  const support = data?.support || { totalTickets: 0, openTickets: 0, urgentTickets: 0, avgCsat: "5.0" };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Platform Analytics &amp; Funnels"
        subtitle="Live telemetry across pipeline conversion rates, revenue collected, sprint delivery velocity, and support SLAs."
        breadcrumbs={[{ label: "Insights" }, { label: "Analytics" }]}
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          label="Total Revenue Collected"
          value={`KES ${revenue.totalCollectedKES.toLocaleString()}`}
          subValue="Verified settlements"
        />
        <AdminStatCard
          label="Lead-to-Client Rate"
          value={leads.conversionRate}
          subValue={`${leads.won} of ${leads.total} leads won`}
        />
        <AdminStatCard
          label="Sprint Milestone On-Time"
          value={delivery.milestoneOnTimeRate}
          subValue={`${delivery.activeProjects} active client sprints`}
        />
        <AdminStatCard
          label="Support CSAT Score"
          value={`${support.avgCsat} / 5.0`}
          subValue={`${support.openTickets} tickets in queue`}
        />
      </div>

      {/* Real Funnel Breakdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-ink">Inquiry Conversion Funnel (Real Database Data)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 text-center">
            <span className="text-muted block text-[11px]">1. Total Inquiries Logged</span>
            <span className="text-xl font-bold text-ink block mt-1">{leads.total}</span>
            <span className="text-emerald-700 font-semibold block text-[10px] mt-0.5">100% of pipeline</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 text-center">
            <span className="text-muted block text-[11px]">2. New Inquiries This Month</span>
            <span className="text-xl font-bold text-ink block mt-1">{leads.thisMonth}</span>
            <span className="text-emerald-700 font-semibold block text-[10px] mt-0.5">Active acquisition</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 text-center">
            <span className="text-muted block text-[11px]">3. Closed Won Contracts</span>
            <span className="text-xl font-bold text-ink block mt-1">{leads.won}</span>
            <span className="text-emerald-700 font-semibold block text-[10px] mt-0.5">{leads.conversionRate} conversion</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-emerald-800 block text-[11px]">4. Systems Deployed</span>
            <span className="text-xl font-bold text-emerald-900 block mt-1">{delivery.totalProjects}</span>
            <span className="text-emerald-700 font-semibold block text-[10px] mt-0.5">Avg Progress: {delivery.avgProgress}%</span>
          </div>
        </div>
      </div>

      {/* Google Analytics 4 Real Web Acquisition & Telemetry */}
      <AnalyticsWebTrafficCard initialData={data?.webTraffic || null} />

      {/* Leads by Source & Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads by Source / UTM */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-ink">Inbound Leads by Source</h3>
          <div className="space-y-2.5 text-xs">
            {leads.bySource.length > 0 ? (
              leads.bySource.map((s: any) => (
                <div key={s.source} className="p-3 rounded-xl bg-surface/60 border border-rule/60 flex items-center justify-between">
                  <span className="font-semibold text-ink">{s.source}</span>
                  <span className="font-mono text-muted">{s.count} leads</span>
                </div>
              ))
            ) : (
              <p className="text-muted py-4 text-center">No source tracking recorded yet.</p>
            )}
          </div>
        </div>

        {/* Inquiries by Engineering Requirement */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-ink">Demand by Service Offering</h3>
          <div className="space-y-2.5 text-xs">
            {leads.byService.length > 0 ? (
              leads.byService.map((s: any) => (
                <div key={s.service} className="p-3 rounded-xl bg-surface/60 border border-rule/60 flex items-center justify-between">
                  <span className="font-semibold text-ink">{s.service}</span>
                  <span className="font-mono text-muted">{s.count} requests</span>
                </div>
              ))
            ) : (
              <p className="text-muted py-4 text-center">No service inquiries logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
