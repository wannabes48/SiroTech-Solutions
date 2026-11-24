import { notFound } from "next/navigation";
import { query } from "./db";
import type { StaffSessionUser } from "./admin-permissions-client";

/**
 * Assigned-only access (users.staff_scope = 'assigned').
 *
 *   A client is in scope when organizations.account_manager_id is the person, or one
 *   of its projects has them as delivery lead.
 *   A project is in scope when projects.delivery_lead_id is the person, or its
 *   organisation's account manager is the person.
 *
 * Staff with scope 'all' (owners always) skip every query here. Outside scope is a
 * 404, same as a missing permission.
 */

export interface StaffScopeSet {
  orgIds: Set<string>;
  projectIds: Set<string>;
}

/** null = sees everything. Otherwise the organisations and projects this person may see. */
export async function getScopeSet(staff: StaffSessionUser): Promise<StaffScopeSet | null> {
  if (staff.scope !== "assigned") return null;
  try {
    const res = await query<{ org_id: string; project_id: string | null }>(
      `SELECT o.id AS org_id, NULL::uuid AS project_id FROM organizations o WHERE o.account_manager_id = $1
       UNION
       SELECT p.org_id, p.id FROM projects p
       LEFT JOIN organizations o ON o.id = p.org_id
       WHERE p.delivery_lead_id = $1 OR o.account_manager_id = $1`,
      [staff.id]
    );
    const orgIds = new Set<string>();
    const projectIds = new Set<string>();
    for (const r of res.rows) {
      orgIds.add(r.org_id);
      if (r.project_id) projectIds.add(r.project_id);
    }
    return { orgIds, projectIds };
  } catch {
    return { orgIds: new Set(), projectIds: new Set() }; // fail closed
  }
}

/** Keep rows whose organisation (or project, when given) is in scope. */
export function filterByScope<T extends Record<string, any>>(
  rows: T[],
  scope: StaffScopeSet | null,
  keys: { org?: string; project?: string } = { org: "org_id" }
): T[] {
  if (!scope) return rows;
  return rows.filter((r) => {
    if (keys.project && r[keys.project]) return scope.projectIds.has(r[keys.project]);
    if (keys.org) return scope.orgIds.has(r[keys.org]);
    return false;
  });
}

type Target = {
  orgId?: string | null;
  projectId?: string | null;
  invoiceId?: string | null;
  ticketId?: string | null;
  milestoneId?: string | null;
  paymentId?: string | null;
  messageId?: string | null;
  planId?: string | null;
  userId?: string | null; // a client user: in scope through any of their organisations
};

/** Resolve a record to its organisation (and project, if it belongs to one). */
async function resolveTarget(t: Target): Promise<{ orgIds: string[]; projectId: string | null }> {
  const one = async (sql: string, id: string) => (await query<{ org_id: string; project_id: string | null }>(sql, [id])).rows[0];
  let row: { org_id: string; project_id: string | null } | undefined;
  if (t.projectId) row = await one("SELECT org_id, id AS project_id FROM projects WHERE id = $1", t.projectId);
  else if (t.milestoneId) row = await one("SELECT p.org_id, p.id AS project_id FROM milestones m JOIN projects p ON p.id = m.project_id WHERE m.id = $1", t.milestoneId);
  else if (t.messageId) row = await one("SELECT p.org_id, p.id AS project_id FROM messages m JOIN projects p ON p.id = m.project_id WHERE m.id = $1", t.messageId);
  else if (t.invoiceId) row = await one("SELECT org_id, project_id FROM invoices WHERE id = $1", t.invoiceId);
  else if (t.ticketId) row = await one("SELECT org_id, project_id FROM support_tickets WHERE id = $1", t.ticketId);
  else if (t.paymentId) row = await one("SELECT COALESCE(p.org_id, i.org_id) AS org_id, i.project_id FROM payments p LEFT JOIN invoices i ON i.id = p.invoice_id WHERE p.id = $1", t.paymentId);
  else if (t.planId) row = await one("SELECT org_id, project_id FROM recurring_plans WHERE id = $1", t.planId);
  else if (t.userId) {
    const r = await query<{ org_id: string }>("SELECT org_id FROM memberships WHERE user_id = $1", [t.userId]);
    return { orgIds: r.rows.map((x) => x.org_id), projectId: null };
  } else if (t.orgId) return { orgIds: [t.orgId], projectId: null };
  return { orgIds: row ? [row.org_id] : [], projectId: row?.project_id ?? null };
}

export async function isInScope(staff: StaffSessionUser, t: Target): Promise<boolean> {
  const scope = await getScopeSet(staff);
  if (!scope) return true;
  const { orgIds, projectId } = await resolveTarget(t);
  if (projectId) return scope.projectIds.has(projectId);
  return orgIds.length > 0 && orgIds.some((id) => scope.orgIds.has(id));
}

/** 404 unless the record is in this person's scope. No-op for scope 'all'. */
export async function enforceScope(staff: StaffSessionUser, t: Target): Promise<void> {
  if (staff.scope !== "assigned") return;
  if (!(await isInScope(staff, t))) notFound();
}

/** Bulk views (exports, reports, aggregates) are only for staff who see everything. */
export function requireFullScope(staff: StaffSessionUser): void {
  if (staff.scope === "assigned") notFound();
}
