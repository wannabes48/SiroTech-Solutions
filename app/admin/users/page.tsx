import React from "react";
import { requireStaffUser, resolvePreset, sanitizeOverrides } from "@/lib/admin-permissions";
import { getAdminStaffUsers } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const me = await requireStaffUser("staff:read");
  const staffUsers = (await getAdminStaffUsers()).map((u: any) => {
    const preset = resolvePreset(u, u.role);
    return {
      ...u,
      preset,
      overrides: preset === "admin" ? [] : sanitizeOverrides(u.staff_permissions || []),
      scope: preset !== "admin" && u.staff_scope === "assigned" ? "assigned" : "all"
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Staff Accounts &amp; Access Roles"
        subtitle="Invite staff with a role preset, fine-tune single permissions, preview what they will see, and manage two-step sign-in."
        breadcrumbs={[{ label: "System" }, { label: "Users & Roles" }]}
      />

      <AdminUsersClient
        initialStaff={JSON.parse(JSON.stringify(staffUsers))}
        currentUserId={me.id}
        isAdmin={me.isOwner}
        hasAuthenticator={me.totpEnabled}
      />
    </div>
  );
}
