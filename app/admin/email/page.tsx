import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmailClient } from "./AdminEmailClient";
import { getAllTemplateDefinitions } from "@/lib/email-templates/renderer";

export default async function AdminEmailPage() {
  const staff = await requireStaffUser("emails:write");

  let dbTemplates: any[] = [];
  let logs: any[] = [];
  let authLogs: any[] = [];

  try {
    const [tRes, lRes] = await Promise.all([
      query("SELECT * FROM email_templates ORDER BY key ASC"),
      query("SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 60")
    ]);
    dbTemplates = tRes.rows;
    logs = lRes.rows;
  } catch (err) {
    console.error("Error loading email data:", err);
  }
  try {
    const aRes = await query("SELECT id, type, email, area, status, error, created_at FROM auth_email_logs ORDER BY created_at DESC LIMIT 100");
    authLogs = aRes.rows;
  } catch (err) {
    console.error("Error loading auth email logs (run scripts/migrate-supabase-auth.js):", err);
  }

  const definitions = getAllTemplateDefinitions();
  const dbMap = new Map(dbTemplates.map((t) => [t.key, t]));

  const templates = definitions.map((def) => {
    const dbRow = dbMap.get(def.key);
    return {
      key: def.key,
      title: def.title,
      description: def.description,
      category: def.category,
      subject: dbRow?.subject || def.defaultSubject,
      body: dbRow?.body || def.defaultBody,
      defaultSubject: def.defaultSubject,
      defaultBody: def.defaultBody,
      allowedVariables: def.allowedVariables,
      sampleData: def.sampleData,
      updated_at: dbRow?.updated_at || null,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Email Notifications &amp; Templates"
        subtitle="Brand-styled transactional React Email templates with allowed variables, live HTML & plain-text previews, test dispatching, and audited delivery logs."
        breadcrumbs={[{ label: "System" }, { label: "Email Templates" }]}
      />

      <AdminEmailClient
        initialTemplates={JSON.parse(JSON.stringify(templates))}
        initialLogs={JSON.parse(JSON.stringify(logs))}
        initialAuthLogs={JSON.parse(JSON.stringify(authLogs))}
        currentUserEmail={staff.email}
      />
    </div>
  );
}
