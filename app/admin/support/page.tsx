import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getScopeSet, filterByScope, enforceScope } from "@/lib/admin-scope";

import { getAdminTickets, getAdminCannedReplies, getAdminContactInquiries } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSupportClient } from "./AdminSupportClient";

export default async function AdminSupportPage() {
  const staff = await requireStaffUser("tickets:read");
  const scope = await getScopeSet(staff);
  const [tickets, cannedReplies, contactInquiries] = await Promise.all([
    getAdminTickets().then((rows) => filterByScope(rows, scope, { project: "project_id", org: "org_id" })),
    getAdminCannedReplies(),
    getAdminContactInquiries()
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Support, Inquiries &amp; SLA Queue"
        subtitle="Customer technical support, public website contact inquiries, SLA response commitments, and dynamic canned responses."
        breadcrumbs={[{ label: "Delivery" }, { label: "Support" }]}
      />

      <AdminSupportClient
        initialTickets={tickets}
        initialCannedReplies={cannedReplies}
        initialContactInquiries={contactInquiries}
      />
    </div>
  );
}
