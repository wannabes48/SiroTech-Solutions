import { adminPath } from "@/lib/hosts";
import React from "react";
import { notFound } from "next/navigation";
import { requireStaffUser, can } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import { TicketAssignControl } from "@/components/admin/TicketAssignControl";
import { getScopeSet, filterByScope, enforceScope } from "@/lib/admin-scope";

import { getAdminTicketById } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TicketDetailStaffClient } from "./TicketDetailStaffClient";

export default async function AdminTicketDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaffUser("tickets:read");
  const { id } = await params;
  await enforceScope(staff, { ticketId: id });
  const ticket = await getAdminTicketById(id);

  if (!ticket) {
    notFound();
  }
  const staffList = can(staff, "tickets:assign")
    ? (await query<{ id: string; name: string }>(
        "SELECT id, name FROM users WHERE role IN ('ADMIN','STAFF') AND COALESCE(active, true) = true ORDER BY name ASC"
      )).rows
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title={`#${ticket.ticket_number}: ${ticket.subject}`}
        subtitle={`${ticket.org_name} • Category: ${ticket.category} • Created ${new Date(ticket.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[
          { label: "Delivery", href: adminPath("/support") },
          { label: "Support", href: adminPath("/support") },
          { label: `#${ticket.ticket_number}` }
        ]}
      />

      {staffList && <TicketAssignControl ticketId={ticket.id} currentAssigneeName={ticket.assignee_name || null} staff={staffList} />}

      <TicketDetailStaffClient ticket={ticket} currentStaff={staff} />
    </div>
  );
}
