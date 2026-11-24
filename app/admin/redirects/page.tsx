import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminRedirects, getAdminNotFoundLogs } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRedirectsClient } from "./AdminRedirectsClient";

export default async function AdminRedirectsPage() {
  await requireStaffUser("seo:write");
  const [redirects, notFoundLogs] = await Promise.all([
    getAdminRedirects(),
    getAdminNotFoundLogs()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <AdminPageHeader
        title="URL Redirects &amp; 404 Not Found Log"
        subtitle="Manage permanent (301) and temporary (302) route migrations and monitor missing pages."
        breadcrumbs={[{ label: "Site" }, { label: "Redirects" }]}
      />

      <AdminRedirectsClient
        initialRedirects={JSON.parse(JSON.stringify(redirects))}
        initialNotFoundLogs={JSON.parse(JSON.stringify(notFoundLogs))}
      />
    </div>
  );
}
