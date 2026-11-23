import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminConsultations } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminConsultationsClient } from "./AdminConsultationsClient";

export default async function AdminConsultationsPage() {
  await requireStaffUser("consultations:read");
  const consultations = await getAdminConsultations();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Consultations &amp; Discovery Calls"
        subtitle="Review upcoming and completed technical consultations booked via Cal.com and discovery intake."
        breadcrumbs={[{ label: "Sales" }, { label: "Consultations" }]}
      />

      <AdminConsultationsClient initialConsultations={consultations} />
    </div>
  );
}
