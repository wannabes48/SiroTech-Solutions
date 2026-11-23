import { query } from "@/lib/db";
import { sendMail, sendMailAlert, LEADS_TO, MAIL_FROM_ADDRESS, HELLO_REPLY_TO, MAIL_FROM, headerSafe } from "@/lib/email";
import { renderEmail } from "@/lib/email-templates/renderer";
import { mainUrl } from "@/lib/hosts";

/**
 * Enquiry emails. The lead is always saved first; these run afterwards and never
 * lose a lead. Each email's state is tracked on the lead row:
 *   notify_status / autoreply_status: PENDING | SENT | FAILED
 * Failures keep the lead, show a flag in Admin > Leads, retry via
 * /api/cron/lead-emails with backoff, and alert staff on the first failure.
 */

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  budget: string | null;
  timeline: string | null;
  message: string | null;
  notify_status: string | null;
  autoreply_status: string | null;
  email_attempts: number | null;
}

/** Minutes to wait before attempt n+1 (index = attempts made so far). */
const BACKOFF_MINUTES = [5, 15, 60, 180, 720];
export const MAX_LEAD_EMAIL_ATTEMPTS = BACKOFF_MINUTES.length + 1;

export async function notifyTeam(lead: LeadRow) {
  const need = headerSafe(lead.service || "General enquiry", 80);
  const budget = headerSafe(lead.budget || "budget not given", 40);
  const lines = [
    `${lead.name} (${lead.company || "no company"})`,
    `${lead.email} ${lead.phone || ""}`.trim(),
    "",
    `Need: ${lead.service || "-"}`,
    `Budget: ${lead.budget || "-"}`,
    `Timeline: ${lead.timeline || "-"}`,
    "",
    lead.message || "",
    "",
    `Open in admin: ${process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.sirotech.co.ke"}/leads/${lead.id}`,
  ];
  return sendMail({
    template: "lead_team_notification",
    from: `SiroTech Website <${MAIL_FROM_ADDRESS}>`,
    to: LEADS_TO,
    replyTo: lead.email, // Reply in Gmail answers the visitor; the visitor is never the From
    subject: `New enquiry: ${need} (${budget})`, // never the visitor's message
    text: lines.join("\n"),
  });
}

export async function autoReply(lead: LeadRow) {
  const rendered = renderEmail("lead_auto_reply", {
    name: lead.name,
    company: lead.company || "your team",
    service: lead.service || "your project",
    turnaround_time: "1 business day",
    portal_url: mainUrl("/work"),
  });
  return sendMail({
    template: "lead_auto_reply",
    from: MAIL_FROM,
    to: lead.email,
    replyTo: HELLO_REPLY_TO,
    subject: "We've received your enquiry",
    html: rendered.html,
    text: rendered.text,
  });
}

/** Send whichever of the two emails hasn't gone out yet, and record the outcome on the lead. */
export async function processLeadEmails(leadId: string): Promise<{ notify: string; autoreply: string; error?: string }> {
  const res = await query<LeadRow>(
    `SELECT id, name, email, phone, company, service, budget, timeline, message,
            notify_status, autoreply_status, email_attempts
     FROM leads WHERE id = $1`,
    [leadId]
  );
  const lead = res.rows[0];
  if (!lead) return { notify: "MISSING", autoreply: "MISSING", error: "Lead not found" };

  let notify = lead.notify_status || "PENDING";
  let autoreply = lead.autoreply_status || "PENDING";
  const errors: string[] = [];

  if (notify !== "SENT") {
    const r = await notifyTeam(lead);
    notify = r.ok ? "SENT" : "FAILED";
    if (!r.ok) errors.push(`Team notification: ${r.error}`);
  }
  if (autoreply !== "SENT") {
    const r = await autoReply(lead);
    autoreply = r.ok ? "SENT" : "FAILED";
    if (!r.ok) errors.push(`Auto-reply: ${r.error}`);
  }

  const attempts = (lead.email_attempts || 0) + 1;
  const failed = errors.length > 0;
  const backoff = BACKOFF_MINUTES[attempts - 1];
  await query(
    `UPDATE leads
     SET notify_status = $2, autoreply_status = $3, email_attempts = $4,
         email_last_error = $5,
         email_next_retry_at = CASE WHEN $6::int IS NULL THEN NULL ELSE NOW() + ($6::int * INTERVAL '1 minute') END,
         updated_at = NOW()
     WHERE id = $1`,
    [leadId, notify, autoreply, attempts, failed ? errors.join(" | ") : null, failed && backoff ? backoff : null]
  );

  if (failed && attempts === 1) {
    await alertLeadEmailFailure(lead, errors.join(" | "));
  }
  return { notify, autoreply, error: failed ? errors.join(" | ") : undefined };
}

/** Alert staff: in-app notification for every ADMIN, plus a best-effort email to LEADS_TO. */
async function alertLeadEmailFailure(lead: LeadRow, error: string) {
  try {
    await query(
      `INSERT INTO notifications (org_id, user_id, type, title, description, target_href, is_read, created_at)
       SELECT COALESCE((SELECT org_id FROM memberships WHERE user_id = u.id LIMIT 1), (SELECT id FROM organizations ORDER BY created_at LIMIT 1)),
              u.id, 'UPDATE', $1, $2, $3, false, NOW()
       FROM users u WHERE u.role IN ('ADMIN','STAFF') AND COALESCE(u.staff_role, 'ADMIN') IN ('ADMIN','MANAGER')`,
      [
        `Enquiry email failed: ${headerSafe(lead.name, 60)}`,
        `The lead was saved, but an email did not send (${error.slice(0, 300)}). It will retry automatically.`,
        `/admin/leads/${lead.id}`,
      ]
    );
  } catch (err) {
    console.error("[lead email alert: notification insert failed]", err);
  }
  // If the team notification itself failed, this email may fail too; the in-app alert is the reliable one.
  await sendMailAlert(`Enquiry email failed for lead ${lead.id}`, `Lead ${lead.name} <${lead.email}> was saved.\n\nError: ${error}`);
}

/** Leads whose emails failed and are due for another try. */
export async function dueLeadEmailRetries(limit = 20): Promise<string[]> {
  const r = await query<{ id: string }>(
    `SELECT id FROM leads
     WHERE (notify_status = 'FAILED' OR autoreply_status = 'FAILED')
       AND COALESCE(email_attempts, 0) < $1
       AND (email_next_retry_at IS NULL OR email_next_retry_at <= NOW())
       AND COALESCE(spam, false) = false
     ORDER BY created_at ASC LIMIT $2`,
    [MAX_LEAD_EMAIL_ATTEMPTS, limit]
  );
  return r.rows.map((x) => x.id);
}
