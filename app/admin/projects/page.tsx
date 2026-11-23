import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminProjects } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProjectsClient } from "./AdminProjectsClient";

export default async function AdminProjectsPage({
  searchParams
}: {
  searchParams?: Promise<{ create?: string; orgId?: string }>;
}) {
  await requireStaffUser("projects:read");
  const resolvedParams = searchParams ? await searchParams : {};
  const [projects, orgsRes] = await Promise.all([
    getAdminProjects(),
    query("SELECT id, name FROM organizations ORDER BY name ASC")
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Projects &amp; Sprints"
        subtitle="Manage software deliverables, milestone sign-offs, staging deployments, and client repositories."
        breadcrumbs={[{ label: "Delivery" }, { label: "Projects" }]}
      />

      <AdminProjectsClient 
        initialProjects={JSON.parse(JSON.stringify(projects))} 
        organizations={JSON.parse(JSON.stringify(orgsRes.rows))}
        defaultOrgId={resolvedParams.orgId}
        initialOpenModal={resolvedParams.create === "true"}
      />
    </div>
  );
}
