import { adminPath } from "@/lib/hosts";
import React from "react";
import { notFound } from "next/navigation";
import { requireStaffUser, can } from "@/lib/admin-permissions";
import { projectView } from "@/lib/admin-views";
import { getAdminProjectById } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectHubStaffClient } from "./ProjectHubStaffClient";

export default async function AdminProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaffUser("projects:read");
  const { id } = await params;
  const [rawProject, orgsRes] = await Promise.all([
    getAdminProjectById(id),
    query("SELECT id, name FROM organizations ORDER BY name ASC")
  ]);

  if (!rawProject) {
    notFound();
  }
  // Private delivery notes are removed here for anyone without projects:internal.
  const project = projectView(staff, rawProject);
  if (project.requested_by_id) {
    const r = await query<{ name: string }>("SELECT name FROM users WHERE id = $1", [project.requested_by_id]);
    project.requested_by_name = r.rows[0]?.name || null;
  }
  const perms = {
    projectsWrite: can(staff, "projects:write"),
    milestonesWrite: can(staff, "milestones:write"),
    updatesPost: can(staff, "updates:post"),
    messagesWrite: can(staff, "messages:write"),
    proposalsSend: can(staff, "proposals:write") && can(staff, "proposals:send"),
    internal: can(staff, "projects:internal")
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title={project.title}
        subtitle={`${project.org_name} • Deliverables & Engineering Hub`}
        breadcrumbs={[
          { label: "Delivery", href: adminPath("/projects") },
          { label: "Projects", href: adminPath("/projects") },
          { label: project.title }
        ]}
      />

      <ProjectHubStaffClient 
        project={JSON.parse(JSON.stringify(project))} 
        organizations={JSON.parse(JSON.stringify(orgsRes.rows))}
        perms={perms}
      />
    </div>
  );
}
