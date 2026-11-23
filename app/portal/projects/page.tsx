import { portalPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { FolderKanban, ArrowRight, ExternalLink, Calendar } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getPortalProjects } from "@/lib/portal-db";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { Card } from "@/components/portal/shared/Card";
import { StatusPill } from "@/components/portal/shared/StatusPill";
import { ProgressBar } from "@/components/portal/shared/ProgressBar";
import { EmptyState } from "@/components/portal/shared/EmptyState";

export default async function ProjectsListPage() {
  const user = await requireUser();
  const projects = await getPortalProjects(user.orgId, user.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Projects"
        subtitle="Manage active deliverables, milestone sign-offs, staging previews, and engineering threads."
        badge={user.orgName}
        primaryAction={{
          label: "Book engineering call",
          href: portalPath("/book"),
          icon: "calendar",
        }}
      />

      {/* Projects List */}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          sentence="A dedicated project workspace appears here once engineering discovery and architecture sign-off starts."
          action={{
            label: "Book a discovery call",
            href: portalPath("/book"),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project: any) => {
            const milestones = project.milestones || [];
            const nextMilestone =
              milestones.find(
                (m: any) => m.status === "IN_PROGRESS" || m.status === "AWAITING_APPROVAL"
              ) || milestones[0];

            return (
              <Card
                key={project.id}
                className="hover:border-emerald-300 transition-all flex flex-col justify-between gap-6 bg-white border border-rule/80"
              >
                <div className="space-y-4">
                  {/* Top: Status & Target Date */}
                  <div className="flex items-center justify-between gap-2">
                    <StatusPill
                      status={project.status === "BUILD" ? "In progress" : project.status}
                      size="sm"
                    />
                    <span className="text-xs font-semibold text-muted">
                      Target:{" "}
                      {project.target_launch
                        ? new Date(project.target_launch).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "TBD"}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h2 className="text-xl font-bold text-ink">
                      <Link
                        href={portalPath(`/projects/${project.id}`)}
                        className="hover:text-emerald-700 transition-colors"
                      >
                        {project.title}
                      </Link>
                    </h2>
                    <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <ProgressBar
                    progress={project.progress}
                    label="Sprint Progress"
                    size="md"
                  />

                  {/* Lead Engineer & Next Milestone */}
                  <div className="p-3.5 rounded-2xl bg-surface border border-rule/70 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center border border-emerald-300 shrink-0">
                        {(project.lead_name || "Daniel Siro").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-ink truncate">{project.lead_name || "Daniel Siro"}</div>
                        <div className="text-[10px] text-muted truncate">
                          {project.lead_role || "Lead Solutions Architect"}
                        </div>
                      </div>
                    </div>

                    {nextMilestone && (
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                          Next
                        </div>
                        <div className="font-semibold text-ink text-xs truncate max-w-[130px]">
                          {nextMilestone.title}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Card Action: Emerald Pill */}
                <div className="pt-4 border-t border-rule/70 flex items-center justify-between gap-3">
                  {project.staging_url ? (
                    <a
                      href={project.staging_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-muted hover:text-ink flex items-center gap-1.5 transition-colors"
                    >
                      <span>Staging Preview</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted">Internal repo</span>
                  )}

                  <Link
                    href={portalPath(`/projects/${project.id}`)}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Open Project Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
