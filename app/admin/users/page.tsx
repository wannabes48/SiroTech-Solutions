import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminStaffUsers } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  await requireStaffUser("users:manage");
  const staffUsers = await getAdminStaffUsers();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Staff Accounts &amp; Access Roles"
        subtitle="Manage authorized staff members, role boundaries (Admin, Manager, Editor, Support), and enforce mandatory 2FA."
        breadcrumbs={[{ label: "System" }, { label: "Users & Roles" }]}
      />

      <AdminUsersClient initialStaff={JSON.parse(JSON.stringify(staffUsers))} />
    </div>
  );
}
