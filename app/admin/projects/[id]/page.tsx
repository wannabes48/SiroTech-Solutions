import { adminPath } from "@/lib/hosts";
import React from "react";
import { notFound } from "next/navigation";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminProjectById } from "@/lib/admin-db";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectHubStaffClient } from "./ProjectHubStaffClient";

export default async function AdminProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffUser("projects:read");
  const { id } = await params;
  const [project, orgsRes] = await Promise.all([
    getAdminProjectById(id),
    query("SELECT id, name FROM organizations ORDER BY name ASC")
  ]);

  if (!project) {
    notFound();
  }

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
      />
    </div>
  );
}
