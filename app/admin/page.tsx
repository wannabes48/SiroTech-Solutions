import { adminPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminOverviewData } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { SiteTrafficWidget } from "@/components/admin/SiteTrafficWidget";
import {
  Users,
  FolderGit2,
  Receipt,
  LifeBuoy,
  ArrowRight,
  ShieldCheck,
  Activity,
  Plus,
  Clock,
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Globe,
  Server,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export default async function AdminDashboardPage() {
  const staff = await requireStaffUser();
  const data = await getAdminOverviewData();
  const { metrics, today, pipelineByStage, money, projectsAtRisk, site, system, recentLeads, recentActivity, activeProjects } = data;

  const firstName = staff.name.split(" ")[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <AdminPageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Centralized operations control room for SiroTech: client delivery, revenue pipeline, content, and system health."
        badge={`${staff.staffRole} ACCESS`}
        badgeVariant={staff.staffRole === "ADMIN" ? "success" : "default"}
        primaryAction={{
          label: "New Lead",
          href: adminPath("/leads?create=true"),
          icon: <Plus className="w-3.5 h-3.5" />
        }}
        secondaryAction={{
          label: "Audit Trail",
          href: adminPath("/audit"),
          icon: <Activity className="w-3.5 h-3.5" />
        }}
      />

      {/* 2. "TODAY" Operational Hub (Role-Aware) */}
      <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-800">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">Today at SiroTech</h2>
              <p className="text-xs text-muted">Real-time actions requiring staff attention today.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Live Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
          <Link
            href={adminPath("/leads?created=today")}
            className="p-4 rounded-2xl bg-surface/50 border border-rule/60 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all group"
          >
            <div className="text-xs font-semibold text-muted group-hover:text-emerald-900">New Leads</div>
            <div className="text-2xl font-bold text-ink mt-1 group-hover:text-emerald-800">{today.newLeadsToday}</div>
            <div className="text-[11px] text-muted mt-0.5">last 24 hours &rarr;</div>
          </Link>

          <Link
            href={adminPath("/support?status=OPEN")}
            className="p-4 rounded-2xl bg-surface/50 border border-rule/60 hover:bg-amber-50/50 hover:border-amber-300 transition-all group"
          >
            <div className="text-xs font-semibold text-muted group-hover:text-amber-900">Tickets Waiting</div>
            <div className="text-2xl font-bold text-ink mt-1 group-hover:text-amber-800">{today.ticketsWaiting}</div>
            <div className="text-[11px] text-muted mt-0.5">SLA countdown &rarr;</div>
          </Link>

          <Link
            href={adminPath("/messages?unread=true")}
            className="p-4 rounded-2xl bg-surface/50 border border-rule/60 hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
          >
            <div className="text-xs font-semibold text-muted group-hover:text-blue-900">Unread Messages</div>
            <div className="text-2xl font-bold text-ink mt-1 group-hover:text-blue-800">{today.unreadMessagesCount}</div>
            <div className="text-[11px] text-muted mt-0.5">across sprints &rarr;</div>
          </Link>

          <Link
            href={adminPath("/payments")}
            className="p-4 rounded-2xl bg-surface/50 border border-rule/60 hover:bg-sage-100 hover:border-sage-300 transition-all group"
          >
            <div className="text-xs font-semibold text-muted group-hover:text-sage-900">Payments Month</div>
            <div className="text-xl font-bold text-ink mt-1 group-hover:text-sage-900">
              {(today.paymentsReceivedThisMonth / 1000000).toFixed(2)}M
            </div>
            <div className="text-[11px] text-muted mt-0.5">settled KES &rarr;</div>
          </Link>

          <Link
            href={adminPath("/projects")}
            className="p-4 rounded-2xl bg-surface/50 border border-rule/60 hover:bg-purple-50/50 hover:border-purple-300 transition-all group col-span-2 sm:col-span-1"
          >
            <div className="text-xs font-semibold text-muted group-hover:text-purple-900">Client Approvals</div>
            <div className="text-2xl font-bold text-ink mt-1 group-hover:text-purple-800">{today.milestonesAwaitingClient}</div>
            <div className="text-[11px] text-muted mt-0.5">milestones ready &rarr;</div>
          </Link>
        </div>

        {today.milestonesChangesRequested > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-bold">
                {today.milestonesChangesRequested} milestone{today.milestonesChangesRequested > 1 ? "s have" : " has"} changes requested by clients requiring staff review.
              </span>
            </div>
            <Link
              href={adminPath("/projects")}
              className="px-3.5 py-1.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
            >
              Review Revisions &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* 3. PIPELINE & MONEY Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pipeline Widget (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                Pipeline by Stage
              </h2>
              <p className="text-xs text-muted mt-0.5">Leads weighted by qualification stage and monetary deal value.</p>
            </div>
            <Link
              href={adminPath("/leads")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              <span>Kanban Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pipelineByStage.map((p: any) => (
              <Link
                key={p.stage}
                href={adminPath(`/leads?status=${p.stage}`)}
                className="p-3.5 rounded-2xl bg-surface/40 border border-rule/60 hover:bg-surface/80 hover:border-emerald-600/40 transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted group-hover:text-ink">
                    {p.stage}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-rule text-[10px] font-bold text-ink">
                    {p.count}
                  </span>
                </div>
                <div className="text-sm font-bold text-ink mt-2 group-hover:text-emerald-800">
                  KES {(Number(p.valueKES || 0) / 1000).toLocaleString()}k
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Recent Leads Snippet */}
          <div className="pt-2 border-t border-rule/60 divide-y divide-rule/60">
            {recentLeads.slice(0, 3).map((lead: any) => (
              <div key={lead.id} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink truncate">{lead.name}</span>
                    <AdminStatusPill status={lead.status} />
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    {lead.company || "Independent"} &bull; {lead.service || "General Inquiry"}
                  </div>
                </div>
                <Link
                  href={adminPath(`/leads/${lead.id}`)}
                  className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
                >
                  KES {Number(lead.value || 0).toLocaleString()} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Money & Aging Widget (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                Revenue &amp; Overdue Aging
              </h2>
              <p className="text-xs text-muted mt-0.5">Outstanding and overdue aging buckets.</p>
            </div>
            <Link
              href={adminPath("/invoices")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              <span>Invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Collected This Month:</span>
              <span className="font-bold text-ink">KES {money.revenueThisMonth.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Total Outstanding:</span>
              <span className="font-bold text-ink">KES {money.outstandingTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-rule/50">
              <span className="font-bold text-red-700">Total Overdue:</span>
              <span className="font-bold text-red-700">KES {money.overdueTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Overdue Aging Buckets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink block">Overdue Aging Buckets:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <Link
                href={adminPath("/invoices?status=OVERDUE&aging=under30")}
                className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 hover:bg-amber-100 transition-colors block"
              >
                <div className="text-[10px] uppercase font-bold text-amber-800">&lt; 30 Days</div>
                <div className="font-bold text-ink mt-1">{(money.agingUnder30 / 1000).toLocaleString()}k</div>
              </Link>
              <Link
                href={adminPath("/invoices?status=OVERDUE&aging=30to60")}
                className="p-3 rounded-2xl bg-orange-50/60 border border-orange-200 hover:bg-orange-100 transition-colors block"
              >
                <div className="text-[10px] uppercase font-bold text-orange-800">30–60 Days</div>
                <div className="font-bold text-ink mt-1">{(money.aging30To60 / 1000).toLocaleString()}k</div>
              </Link>
              <Link
                href={adminPath("/invoices?status=OVERDUE&aging=over60")}
                className="p-3 rounded-2xl bg-red-50/60 border border-red-200 hover:bg-red-100 transition-colors block"
              >
                <div className="text-[10px] uppercase font-bold text-red-800">&gt; 60 Days</div>
                <div className="font-bold text-ink mt-1">{(money.agingOver60 / 1000).toLocaleString()}k</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DELIVERY & SITE & SYSTEM Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Delivery (Projects at Risk) */}
        <div className="bg-white rounded-3xl border border-rule/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-700" />
              Delivery Health
            </h3>
            <span className="text-[11px] font-semibold text-muted">
              {metrics.activeProjectsCount} active
            </span>
          </div>

          {projectsAtRisk.length > 0 ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{projectsAtRisk.length} sprint(s) requiring attention (no update in 14d)</span>
              </div>
              {projectsAtRisk.map((p: any) => (
                <Link
                  key={p.id}
                  href={adminPath(`/projects/${p.id}`)}
                  className="p-3 rounded-xl border border-rule/80 hover:bg-surface block text-xs"
                >
                  <div className="font-bold text-ink truncate">{p.title}</div>
                  <div className="text-muted text-[11px] mt-0.5">Progress: {p.progress}%</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>All active sprints on schedule with no overdue milestones.</span>
            </div>
          )}

          <Link
            href={adminPath("/projects")}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1 pt-2"
          >
            <span>All Projects Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Site Analytics (Google Analytics 4) & Publish Queue */}
        <SiteTrafficWidget initialSite={site} />

        {/* System & AI Health */}
        <div className="bg-white rounded-3xl border border-rule/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-700" />
              System Status
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Online
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/60 border border-rule/60">
              <span className="text-muted">Postgres Pool:</span>
              <span className="font-semibold text-emerald-800">{system.dbStatus}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/60 border border-rule/60">
              <span className="text-muted">Cloudflare R2:</span>
              <span className="font-semibold text-ink">{system.r2Status}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/60 border border-rule/60">
              <span className="text-muted">Assistant Spend Today:</span>
              <span className="font-semibold text-ink">{system.assistantSpendToday}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/60 border border-rule/60">
              <span className="text-muted">Failed Webhooks:</span>
              <Link href={adminPath("/integrations")} className="font-bold text-ink hover:underline">
                {system.failedWebhooks} failed &rarr;
              </Link>
            </div>
          </div>

          <Link
            href={adminPath("/health")}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1 pt-2"
          >
            <span>Health &amp; Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. Live Operational Audit Trail */}
      <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-ink">Live Operational Audit Trail</h2>
              <p className="text-xs text-muted">Immutable trail of administrative mutations, approvals, and credentials.</p>
            </div>
          </div>
          <Link
            href={adminPath("/audit")}
            className="text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            Full Log &rarr;
          </Link>
        </div>

        <div className="divide-y divide-rule/60 text-xs">
          {recentActivity.map((log: any) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-ink flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-surface border border-rule font-mono text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-muted">on {log.entity}</span>
                </div>
                <div className="text-[11px] text-muted mt-1 font-mono">
                  IP: {log.ip_address} &bull; {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <span className="text-[11px] text-muted shrink-0">
                {new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
