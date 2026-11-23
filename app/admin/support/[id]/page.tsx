import { adminPath } from "@/lib/hosts";
import React from "react";
import { notFound } from "next/navigation";
import { requireStaffUser } from "@/lib/admin-permissions";
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
  const ticket = await getAdminTicketById(id);

  if (!ticket) {
    notFound();
  }

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

      <TicketDetailStaffClient ticket={ticket} currentStaff={staff} />
    </div>
  );
}
