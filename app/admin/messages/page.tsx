import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminMessagesClient } from "./AdminMessagesClient";

export default async function AdminMessagesPage() {
  await requireStaffUser("messages:read");

  let messages: any[] = [];
  let projects: any[] = [];

  try {
    const [msgRes, projRes] = await Promise.all([
      query(`
        SELECT 
          m.id,
          m.project_id,
          m.author_id,
          m.author_name,
          m.author_role,
          m.is_staff,
          COALESCE(m.is_internal, false) AS is_internal,
          COALESCE(m.is_handled, false) AS is_handled,
          COALESCE(m.content, '') AS content,
          m.attachment_name,
          m.attachment_url,
          m.created_at,
          p.title AS project_title,
          o.name AS org_name
        FROM messages m
        INNER JOIN projects p ON p.id = m.project_id
        INNER JOIN organizations o ON o.id = p.org_id
        ORDER BY m.created_at DESC
        LIMIT 200
      `),
      query(`
        SELECT p.id, p.title, o.name AS org_name
        FROM projects p
        INNER JOIN organizations o ON o.id = p.org_id
        ORDER BY o.name ASC, p.title ASC
      `)
    ]);

    messages = msgRes.rows;
    projects = projRes.rows;
  } catch (err) {
    console.error("Messages query error:", err);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Unified Messages Inbox"
        subtitle="Cross-project communication hub for client feedback, technical queries, sprint reviews, and staff internal notes."
        breadcrumbs={[{ label: "Delivery" }, { label: "Messages" }]}
      />

      <AdminMessagesClient
        initialMessages={messages}
        projects={projects}
      />
    </div>
  );
}
