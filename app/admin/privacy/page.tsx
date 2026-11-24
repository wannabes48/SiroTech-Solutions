import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPrivacyClient } from "./AdminPrivacyClient";

export default async function AdminPrivacyPage() {
  await requireStaffUser("privacy:write");

  let requests: any[] = [];
  try {
    const res = await query(`
      SELECT 
        pr.id,
        pr.user_id,
        pr.email,
        pr.type,
        pr.status,
        COALESCE(pr.channel, 'PORTAL') AS channel,
        pr.notes,
        pr.created_at,
        pr.target_completion_date,
        pr.completed_at,
        pr.completed_by_name,
        pr.rejection_reason,
        pr.statutory_retention_notice,
        u.name AS user_name,
        o.name AS org_name
      FROM privacy_requests pr
      LEFT JOIN users u ON u.id = pr.user_id
      LEFT JOIN memberships m ON m.user_id = u.id
      LEFT JOIN organizations o ON o.id = m.org_id
      ORDER BY 
        CASE 
          WHEN pr.status = 'PENDING' THEN 1 
          WHEN pr.status = 'IN_PROGRESS' THEN 2 
          ELSE 3 
        END,
        pr.created_at DESC
    `);
    requests = res.rows;
  } catch (err) {
    console.error("Error loading privacy requests:", err);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Privacy &amp; Statutory GDPR Queue"
        subtitle="Manage data subject access requests (DSAR), ZIP archive exports, and right-to-erasure workflows under Kenya DPA 2019 &amp; GDPR."
        breadcrumbs={[{ label: "System" }, { label: "Privacy & GDPR" }]}
      />

      <AdminPrivacyClient initialRequests={JSON.parse(JSON.stringify(requests))} />
    </div>
  );
}
