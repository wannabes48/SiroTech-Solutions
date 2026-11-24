import { query } from "./db";
import { sendMail } from "./email";
import { adminUrl } from "./hosts";
import { can, isPresetKey, presetFromLegacy, sanitizeOverrides, type StaffSessionUser } from "./admin-permissions-client";
import { getScopeSet, filterByScope } from "./admin-scope";

/**
 * Monday digest for staff: new leads, project requests awaiting scoping, overdue
 * invoices, tickets near SLA breach and (owners) approvals waiting. Each person
 * only gets the sections their permissions (and assigned-only scope) allow.
 * Sent by /api/cron/weekly-digest.
 */

type Recipient = { id: string; name: string; email: string; role: string; staff_role: string | null; staff_preset: string | null; staff_permissions: string[] | null; staff_scope: string | null };

async function loadRecipients(): Promise<Recipient[]> {
  try {
    const r = await query<Recipient>(
      `SELECT id, name, email, role, staff_role, staff_preset, staff_permissions, COALESCE(staff_scope, 'all') AS staff_scope
       FROM users WHERE role IN ('ADMIN','STAFF') AND COALESCE(active, true) = true AND email IS NOT NULL`
    );
    return r.rows;
  } catch {
    const r = await query<Recipient>(
      `SELECT id, name, email, role, staff_role, NULL AS staff_preset, NULL::text[] AS staff_permissions, 'all' AS staff_scope
       FROM users WHERE role IN ('ADMIN','STAFF') AND COALESCE(active, true) = true`
    );
    return r.rows;
  }
}

const rows = async <T,>(sql: string): Promise<T[]> => (await query<T & Record<string, any>>(sql).catch(() => ({ rows: [] as T[] }))).rows as T[];
const kes = (n: unknown) => `KES ${Number(n || 0).toLocaleString()}`;
const day = (d: unknown) => (d ? new Date(String(d)).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");

export async function buildDigestData() {
  const [leads, requests, overdue, tickets, approvals] = await Promise.all([
    rows<{ id: string; name: string; company: string | null; value: number | null; created_at: string }>(
      `SELECT id, name, company, value, created_at FROM leads
       WHERE created_at > NOW() - INTERVAL '7 days' AND (spam IS NULL OR spam = false)
       ORDER BY created_at DESC`
    ),
    rows<{ id: string; title: string; org_name: string; budget_kes: number | null; created_at: string }>(
      `SELECT p.id, p.title, o.name AS org_name, p.budget_kes, p.created_at
       FROM projects p JOIN organizations o ON o.id = p.org_id
       WHERE p.status::text = 'REQUESTED' ORDER BY p.created_at ASC`
    ),
    rows<{ id: string; invoice_number: string; org_id: string; project_id: string | null; org_name: string; amount_kes: number; due_date: string }>(
      `SELECT i.id, i.invoice_number, i.org_id, i.project_id, o.name AS org_name, i.amount_kes, i.due_date
       FROM invoices i JOIN organizations o ON o.id = i.org_id
       WHERE i.status::text = 'OVERDUE' OR (i.status::text IN ('SENT','VIEWED','DUE') AND i.due_date < CURRENT_DATE)
       ORDER BY i.due_date ASC`
    ),
    rows<{ id: string; ticket_number: string; subject: string; priority: string; sla_due_at: string; org_id: string; project_id: string | null; assignee_name: string | null }>(
      `SELECT id, ticket_number, subject, priority, sla_due_at, org_id, project_id, assignee_name
       FROM support_tickets
       WHERE status::text NOT IN ('RESOLVED','CLOSED') AND sla_due_at IS NOT NULL AND sla_due_at < NOW() + INTERVAL '24 hours'
       ORDER BY sla_due_at ASC`
    ),
    rows<{ id: string; action: string; reason: string | null; created_at: string }>(
      `SELECT id, action, reason, created_at FROM approvals WHERE status = 'PENDING' ORDER BY created_at ASC`
    ),
  ]);
  return { leads, requests, overdue, tickets, approvals };
}

type Section = { title: string; lines: string[]; link: string; total?: string };

export function sectionsFor(staff: StaffSessionUser, data: Awaited<ReturnType<typeof buildDigestData>>, scope: Awaited<ReturnType<typeof getScopeSet>>): Section[] {
  const out: Section[] = [];
  const top = <T,>(list: T[], fmt: (x: T) => string) => [...list.slice(0, 10).map(fmt), ...(list.length > 10 ? [`…and ${list.length - 10} more`] : [])];

  if (can(staff, "leads:read") && !scope && data.leads.length) {
    const value = data.leads.reduce((a, l) => a + Number(l.value || 0), 0);
    out.push({
      title: `New leads this week: ${data.leads.length}`,
      total: value ? `Estimated value ${kes(value)}` : undefined,
      lines: top(data.leads, (l) => `${l.name}${l.company ? ` (${l.company})` : ""}${l.value ? `, ${kes(l.value)}` : ""}, ${day(l.created_at)}`),
      link: adminUrl("/leads"),
    });
  }
  if (staff.isOwner && data.approvals.length) {
    out.push({
      title: `Approvals waiting for you: ${data.approvals.length}`,
      lines: top(data.approvals, (a) => `${a.action.replace(/_/g, " ")}: "${(a.reason || "").slice(0, 80)}" (${day(a.created_at)})`),
      link: adminUrl("/"),
    });
  }
  const requests = filterByScope(data.requests, scope, { project: "id" });
  if (can(staff, "projects:read") && requests.length) {
    out.push({
      title: `Project requests awaiting scoping: ${requests.length}`,
      lines: top(requests, (r) => `${r.title} for ${r.org_name}${r.budget_kes ? `, ${kes(r.budget_kes)}` : ""}, waiting since ${day(r.created_at)}`),
      link: adminUrl("/projects"),
    });
  }
  const overdue = filterByScope(data.overdue, scope, { project: "project_id", org: "org_id" });
  if (can(staff, "invoices:read") && overdue.length) {
    out.push({
      title: `Overdue invoices: ${overdue.length}`,
      total: `Outstanding ${kes(overdue.reduce((a, i) => a + Number(i.amount_kes || 0), 0))}`,
      lines: top(overdue, (i) => `${i.invoice_number} ${i.org_name}, ${kes(i.amount_kes)}, due ${day(i.due_date)}`),
      link: adminUrl("/invoices?status=OVERDUE"),
    });
  }
  const tickets = filterByScope(data.tickets, scope, { project: "project_id", org: "org_id" });
  if (can(staff, "tickets:read") && tickets.length) {
    const now = Date.now();
    out.push({
      title: `Tickets breaching or near SLA: ${tickets.length}`,
      lines: top(tickets, (t) => `#${t.ticket_number} ${t.subject} (${t.priority}) ${new Date(t.sla_due_at).getTime() < now ? "BREACHED" : `due ${day(t.sla_due_at)}`}${t.assignee_name ? `, ${t.assignee_name}` : ""}`),
      link: adminUrl("/support"),
    });
  }
  return out;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function render(name: string, sections: Section[]) {
  const text = [
    `Hi ${name.split(" ")[0]},`,
    "",
    "Your week at SiroTech:",
    "",
    ...sections.flatMap((s) => [s.title, ...(s.total ? [s.total] : []), ...s.lines.map((l) => `  - ${l}`), `  ${s.link}`, ""]),
    "You get this every Monday. It only includes what your account can see.",
  ].join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#1b2e24;max-width:600px">
<p>Hi ${esc(name.split(" ")[0])},</p><p>Your week at SiroTech:</p>
${sections
  .map(
    (s) => `<h3 style="font-size:15px;margin:20px 0 4px">${esc(s.title)}</h3>${s.total ? `<p style="margin:0 0 6px;color:#555">${esc(s.total)}</p>` : ""}
<ul style="margin:0;padding-left:18px">${s.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
<p style="margin:6px 0 0"><a href="${esc(s.link)}" style="color:#166534">Open in the admin</a></p>`
  )
  .join("")}
<p style="color:#777;font-size:12px;margin-top:24px">You get this every Monday. It only includes what your account can see.</p></div>`;
  return { text, html };
}

export async function sendWeeklyDigest(): Promise<{ sent: number; skipped: number; failed: number }> {
  const data = await buildDigestData();
  const recipients = await loadRecipients();
  let sent = 0, skipped = 0, failed = 0;
  for (const r of recipients) {
    const preset = isPresetKey(r.staff_preset) ? r.staff_preset : presetFromLegacy(r.staff_role, r.role);
    const isOwner = preset === "admin";
    const staff = {
      id: r.id,
      name: r.name,
      email: r.email,
      preset,
      isOwner,
      overrides: isOwner ? [] : sanitizeOverrides(r.staff_permissions || []),
      scope: !isOwner && r.staff_scope === "assigned" ? "assigned" : "all",
    } as unknown as StaffSessionUser;
    const sections = sectionsFor(staff, data, await getScopeSet(staff));
    if (sections.length === 0) {
      skipped++;
      continue;
    }
    const { text, html } = render(r.name, sections);
    const res = await sendMail({ template: "weekly_digest", to: r.email, subject: `Your SiroTech week: ${sections.map((s) => s.title.split(":")[0]).join(", ")}`.slice(0, 180), text, html });
    if (res.ok) sent++;
    else failed++;
  }
  return { sent, skipped, failed };
}
