import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import { getStaffSessions, getStaffNotificationPrefs } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProfileClient } from "./AdminProfileClient";

export default async function AdminProfilePage() {
  const staff = await requireStaffUser();

  const [userRes, sessions, notificationPrefs] = await Promise.all([
    query(
      "SELECT id, name, email, phone, timezone, staff_role, role, totp_enabled, totp_required, created_at FROM users WHERE id = $1",
      [staff.id]
    ),
    getStaffSessions(staff.id),
    getStaffNotificationPrefs(staff.id)
  ]);

  const profileData = userRes.rows[0] || staff;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="My Profile &amp; Staff Security"
        subtitle="Manage your personal staff credentials, password, mandatory two-step verification, active sign-in sessions, and alert subscriptions."
        breadcrumbs={[{ label: "System" }, { label: "My Profile" }]}
      />

      <AdminProfileClient
        initialProfile={profileData}
        initialSessions={sessions}
        initialPrefs={notificationPrefs || {
          email_leads: true,
          email_tickets: true,
          email_payments: true,
          email_health: false,
          in_app_toasts: true
        }}
      />
    </div>
  );
}
