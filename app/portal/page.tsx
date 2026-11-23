import { portalPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FolderKanban,
  ReceiptText,
  LifeBuoy,
  Calendar,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { getPortalDashboardData } from "@/lib/portal-db";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { Card } from "@/components/portal/shared/Card";
import { StatCard } from "@/components/portal/shared/StatCard";
import { StatusPill } from "@/components/portal/shared/StatusPill";
import { ProgressBar } from "@/components/portal/shared/ProgressBar";
import { AttentionList } from "@/components/portal/home/AttentionList";

export default async function PortalHomePage() {
  const user = await requireUser();

  // Check if first-login client user needs the welcome onboarding checklist
  if (user.role === "CLIENT") {
    const welcomeCheck = await query<{ welcome_completed: boolean }>(
      "SELECT welcome_completed FROM users WHERE id = $1",
      [user.id]
    );
    if (welcomeCheck.rows[0] && !welcomeCheck.rows[0].welcome_completed) {
      redirect(portalPath("/welcome"));
    }
  }

  const data = await getPortalDashboardData(user.orgId, user.id);

  const firstName = user.name ? user.name.split(" ")[0] : "Client";

  // Calculate greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const primaryProjectId = data.projects[0]?.id || "";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Page Header & Personalized Greeting */}
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Here is everything requiring your action and sprint progress across your organization's systems."
        badge={user.orgName}
        primaryAction={{
          label: "+ Open Project Hub",
          href: primaryProjectId ? portalPath(`/projects/${primaryProjectId}`) : portalPath("/projects"),
        }}
        secondaryAction={{
          label: "Book a call",
          href: portalPath("/book"),
          icon: "calendar",
        }}
      />

      {/* 2. "NEEDS YOUR ATTENTION" FIRST: Merged action list only client can do */}
      <section className="space-y-3.5" aria-labelledby="attention-heading">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 id="attention-heading" className="text-base sm:text-lg font-bold text-[#1B2E24]">
              Needs Your Attention
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              {data.attentionItems.length}
            </span>
          </div>
          <span className="text-xs text-muted">Prioritized client actions</span>
        </div>

        <AttentionList initialItems={data.attentionItems} />
      </section>

      {/* 3. KPI Stat Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Systems"
          value={data.stats.activeProjectsCount}
          subtext="In active engineering sprints"
          icon={FolderKanban}
        />

        <StatCard
          label="Needs Attention"
          value={data.stats.needsAttentionCount}
          subtext="Milestones, bills & approvals"
          icon={Sparkles}
        />

        <StatCard
          label="Outstanding Balance"
          value={`KES ${data.stats.totalPendingKES.toLocaleString()}`}
          subtext={`≈ $${data.stats.totalPendingUSD.toLocaleString()} USD pending`}
          icon={ReceiptText}
        />

        <StatCard
          label="Open Tickets"
          value={data.stats.openTicketsCount}
          subtext="SLA response within 4 hours"
          icon={LifeBuoy}
        />
      </div>

      {/* 4. Active Projects Overview */}
      <section className="space-y-4" aria-labelledby="projects-heading">
        <div className="flex items-center justify-between">
          <h2 id="projects-heading" className="text-base sm:text-lg font-bold text-[#1B2E24]">
            Active Software Projects
          </h2>
          <Link
            href={portalPath("/projects")}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
          >
            <span>All projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.projects.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-rule/80">
            <FolderKanban className="w-8 h-8 text-muted mx-auto mb-2" />
            <h3 className="text-sm font-bold text-ink">No active projects yet</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              Ready to architect a new software platform? Book an engineering discovery session.
            </p>
            <Link
              href={portalPath("/book")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
            >
              <span>Book Discovery Call</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.projects.map((proj) => (
              <Card
                key={proj.id}
                className="p-5 sm:p-6 border border-rule/80 hover:border-rule hover:shadow-xs transition-all bg-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-rule/70">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        href={portalPath(`/projects/${proj.id}`)}
                        className="text-base font-bold text-ink hover:text-emerald-700 transition-colors"
                      >
                        {proj.title}
                      </Link>
                      <StatusPill status={proj.status === "BUILD" ? "In progress" : proj.status} />
                    </div>
                    <p className="text-xs text-body leading-relaxed max-w-3xl">{proj.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {proj.staging_url && (
                      <a
                        href={proj.staging_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Staging</span>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                    <Link
                      href={portalPath(`/projects/${proj.id}`)}
                      className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>Open Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink">Sprint Completion</span>
                      <span className="font-extrabold text-emerald-800">{proj.progress}%</span>
                    </div>
                    <ProgressBar progress={proj.progress} />
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-muted block text-[11px] font-semibold uppercase tracking-wider">
                      Target Launch
                    </span>
                    <span className="font-bold text-ink">
                      {proj.target_launch
                        ? new Date(proj.target_launch).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "TBD"}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 bg-surface p-2.5 rounded-xl border border-rule/60">
                    <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                      Current Engineering Focus
                    </span>
                    <p className="text-ink font-medium text-[11px] line-clamp-2">
                      {proj.next_step_summary || "Feature implementation and telemetry testing."}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 5. Recent Activity Feed & Direct Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#1B2E24]">Recent Workspace Activity</h2>
            <span className="text-xs text-muted">Audited timeline</span>
          </div>

          <Card className="p-4 sm:p-5 border border-rule/80 bg-white">
            {data.activities.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No recent events recorded.</p>
            ) : (
              <div className="divide-y divide-rule/60">
                {data.activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                    <div className="w-8 h-8 rounded-xl bg-surface border border-rule flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-ink">
                          {act.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-muted">
                          {new Date(act.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        Target: {act.entity} {act.metadata ? JSON.stringify(act.metadata) : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions (1 col) */}
        <div className="space-y-3.5">
          <h2 className="text-base sm:text-lg font-bold text-[#1B2E24]">Quick Actions</h2>

          <div className="space-y-2.5">
            <Link
              href={portalPath("/book")}
              className="p-4 rounded-2xl border border-rule/80 hover:border-emerald-600/50 bg-white hover:bg-emerald-50/30 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink group-hover:text-emerald-700 transition-colors">
                    Book Architecture Call
                  </h3>
                  <p className="text-[11px] text-muted">30 or 60 min engineering session</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href={portalPath("/support")}
              className="p-4 rounded-2xl border border-rule/80 hover:border-emerald-600/50 bg-white hover:bg-emerald-50/30 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink group-hover:text-emerald-700 transition-colors">
                    Submit Support Ticket
                  </h3>
                  <p className="text-[11px] text-muted">Bug report or change request</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href={portalPath("/invoices")}
              className="p-4 rounded-2xl border border-rule/80 hover:border-emerald-600/50 bg-white hover:bg-emerald-50/30 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ReceiptText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink group-hover:text-emerald-700 transition-colors">
                    View Invoices & Receipts
                  </h3>
                  <p className="text-[11px] text-muted">Pay securely via Paystack</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
