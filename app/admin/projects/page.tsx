import React from "react";
import { requireStaffUser, can } from "@/lib/admin-permissions";
import { projectView } from "@/lib/admin-views";
import { getScopeSet, filterByScope, enforceScope } from "@/lib/admin-scope";

import { getAdminProjects } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProjectsClient } from "./AdminProjectsClient";

export default async function AdminProjectsPage({
  searchParams
}: {
  searchParams?: Promise<{ create?: string; orgId?: string }>;
}) {
  const staff = await requireStaffUser("projects:read");
  const resolvedParams = searchParams ? await searchParams : {};
  const [allProjects, orgsRes] = await Promise.all([
    getAdminProjects(),
    query("SELECT id, name FROM organizations ORDER BY name ASC")
  ]);
  const scope = await getScopeSet(staff);
  const projects = filterByScope(allProjects, scope, { project: "id" });
  orgsRes.rows = filterByScope(orgsRes.rows, scope, { org: "id" });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Projects &amp; Sprints"
        subtitle="Manage software deliverables, milestone sign-offs, staging deployments, and client repositories."
        breadcrumbs={[{ label: "Delivery" }, { label: "Projects" }]}
      />

      <AdminProjectsClient 
        initialProjects={JSON.parse(JSON.stringify(projects.map((p) => projectView(staff, p))))}
        organizations={JSON.parse(JSON.stringify(orgsRes.rows))}
        defaultOrgId={resolvedParams.orgId}
        initialOpenModal={resolvedParams.create === "true" && can(staff, "projects:write")}
        canCreateProject={can(staff, "projects:write")}
        canRequestProject={can(staff, "projects:create")}
      />
    </div>
  );
}
