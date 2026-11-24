import { adminPath } from "@/lib/hosts";
import React from "react";
import { notFound } from "next/navigation";
import { requireStaffUser, can } from "@/lib/admin-permissions";
import { clientView } from "@/lib/admin-views";
import { query } from "@/lib/db";
import { AssignmentControl } from "@/components/admin/AssignmentControl";
import { getScopeSet, filterByScope, enforceScope } from "@/lib/admin-scope";

import { getAdminClientById } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ClientDetailClient } from "./ClientDetailClient";

export default async function AdminClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaffUser("clients:read");
  const { id } = await params;
  await enforceScope(staff, { orgId: id });
  const raw = await getAdminClientById(id);

  if (!raw) {
    notFound();
  }
  // Private notes are removed on the server for anyone without the matching permission.
  const client = clientView(staff, raw);
  const assignableStaff = staff.isOwner
    ? (await query<{ id: string; name: string }>(
        "SELECT id, name FROM users WHERE role IN ('ADMIN','STAFF') AND COALESCE(active, true) = true ORDER BY name ASC"
      )).rows
    : null;
  const perms = {
    impersonate: can(staff, "clients:impersonate"),
    archive: can(staff, "clients:archive"),
    export: can(staff, "clients:export"),
    projectsWrite: can(staff, "projects:write"),
    projectsCreate: can(staff, "projects:create"),
    internal: can(staff, "clients:internal")
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title={client.name}
        subtitle={`Organization Workspace • Created ${new Date(client.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[
          { label: "Sales", href: adminPath("/clients") },
          { label: "Clients", href: adminPath("/clients") },
          { label: client.name }
        ]}
      />

      {assignableStaff && (
        <AssignmentControl kind="account_manager" targetId={raw.id} currentUserId={raw.account_manager_id || null} staff={assignableStaff} />
      )}

      <ClientDetailClient client={JSON.parse(JSON.stringify(client))} perms={perms} />
    </div>
  );
}
