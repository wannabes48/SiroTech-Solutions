import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-server";
import { getPortalProjectDetail, getPortalInvoices } from "@/lib/portal-db";
import { query } from "@/lib/db";
import { ProjectHubClient } from "@/components/portal/project/ProjectHubClient";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const isStaff = user.role === "STAFF" || user.role === "ADMIN";

  const project = await getPortalProjectDetail(user.orgId, id, isStaff, user.id);
  if (!project) {
    notFound();
  }

  // Fetch proposals for this organization
  const pRes = await query(
    `SELECT * FROM proposals 
     WHERE org_id = $1 OR ($2::text IS NOT NULL AND org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid)) 
     ORDER BY created_at DESC`,
    [user.orgId, user.id || null]
  );
  const proposals = pRes.rows;

  // Fetch invoices for this organization & project
  const invoices = await getPortalInvoices(user.orgId, user.id);
  const projectInvoices = invoices.filter(
    (i: any) => i.project_id === project.id || !i.project_id
  );

  return (
    <ProjectHubClient
      project={project}
      user={user}
      proposals={proposals}
      invoices={projectInvoices}
    />
  );
}
