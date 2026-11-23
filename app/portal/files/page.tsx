import { portalPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getPortalFiles, getPortalProjects } from "@/lib/portal-db";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { FilesListClient } from "@/components/portal/files/FilesListClient";

export default async function PortalFilesPage() {
  const user = await requireUser();
  const dbFiles = await getPortalFiles(user.orgId);
  const projects = await getPortalProjects(user.orgId);
  const primaryProjectId = projects[0]?.id || "";

  const files = dbFiles.map((f: any) => ({
    id: f.id,
    name: f.name,
    size: f.size,
    kind: f.kind,
    uploadedAt: new Date(f.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    category: f.kind,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Shared Files & Vault"
        subtitle="Access system architecture blueprints, OpenAPI specifications, contracts, and compliance audits."
        badge={user.orgName}
        primaryAction={
          primaryProjectId
            ? {
                label: "Upload in Project Hub",
                href: portalPath(`/projects/${primaryProjectId}`),
                icon: "folder",
              }
            : undefined
        }
      />

      <FilesListClient initialFiles={files} />
    </div>
  );
}
