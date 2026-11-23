import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAutoSync } from "@/components/admin/AdminAutoSync";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SiroTech Control Room | Administration",
  description: "Unified administration platform for SiroTech Solutions: delivery, content, clients, SEO, and billing.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaffUser();

  // Check for impersonation cookie
  const cookieStore = await cookies();
  const impersonateOrgId = cookieStore.get("sirotech_impersonate_org")?.value;
  let impersonatedOrgName: string | null = null;

  if (impersonateOrgId) {
    try {
      const orgRes = await query("SELECT name FROM organizations WHERE id = $1", [impersonateOrgId]);
      if (orgRes.rows.length > 0) {
        impersonatedOrgName = orgRes.rows[0].name;
      }
    } catch {}
  }

  return (
    <AdminShell user={staff} impersonatedOrgName={impersonatedOrgName}>
      <AdminAutoSync intervalMs={25000} />
      {children}
    </AdminShell>
  );
}
