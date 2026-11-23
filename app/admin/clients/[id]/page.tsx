import { adminPath } from "@/lib/hosts";
import React from "react";
import { notFound } from "next/navigation";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminClientById } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ClientDetailClient } from "./ClientDetailClient";

export default async function AdminClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffUser("clients:read");
  const { id } = await params;
  const client = await getAdminClientById(id);

  if (!client) {
    notFound();
  }

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

      <ClientDetailClient client={JSON.parse(JSON.stringify(client))} />
    </div>
  );
}
