import { PORTAL_URL, adminPath, adminUrl } from "@/lib/hosts";
import { getAuthContext, getSessionUser } from "./auth-server";
import { isMfaVerified } from "./mfa";
import { query } from "./db";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  PresetKey,
  StaffSessionUser,
  can,
  isPresetKey,
  presetFromLegacy,
  sanitizeOverrides
} from "./admin-permissions-client";

export * from "./admin-permissions-client";

// Staff have no membership; same fallback org the audit log and session use.
const FALLBACK_ORG_ID = "e0f52cf9-0000-0000-0000-000000000001";

type StaffRow = {
  staff_role: string | null;
  staff_preset?: string | null;
  staff_permissions?: string[] | null;
  totp_enabled: boolean | null;
  totp_secret: string | null;
};

async function loadStaffRow(userId: string): Promise<StaffRow | null> {
  try {
    const res = await query<StaffRow>(
      "SELECT staff_role, staff_preset, staff_permissions, totp_enabled, totp_secret FROM users WHERE id = $1",
      [userId]
    );
    return res.rows[0] || null;
  } catch {
    // Before scripts/migrate-staff-permissions.js has run: legacy columns only.
    const res = await query<StaffRow>("SELECT staff_role, totp_enabled, totp_secret FROM users WHERE id = $1", [userId]);
    return res.rows[0] || null;
  }
}

export function resolvePreset(row: Pick<StaffRow, "staff_role" | "staff_preset"> | null, userRole?: string | null): PresetKey {
  if (row && isPresetKey(row.staff_preset)) return row.staff_preset;
  return presetFromLegacy(row?.staff_role, userRole);
}

export interface RequireStaffOptions {
  /** Only the profile page (and the two-step setup action) may load before two-step is set up. */
  allowWithoutTwoStep?: boolean;
}

// ==========================================
// 1. Server authentication and permission guard
// ==========================================
/**
 * Every admin page, server action and API route calls this with the permission
 * it needs. A missing permission is a 404 (never a "forbidden" page that would
 * confirm the page exists).
 */
export async function requireStaffUser(requiredPermission?: string, opts: RequireStaffOptions = {}): Promise<StaffSessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect((await getAuthContext()) ? "/sign-in?error=not-allowed" : "/sign-in");
  }

  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    redirect(PORTAL_URL); // Not authorized for the admin control room
  }

  let row: StaffRow | null = null;
  try {
    row = await loadStaffRow(user.id);
  } catch (err) {
    console.warn("Could not load staff permissions; using least privilege", err);
  }

  const preset = row ? resolvePreset(row, user.role) : "support";
  const isOwner = preset === "admin";
  const totpEnabled = Boolean(row?.totp_enabled && row?.totp_secret);

  // Two-step: a Supabase session alone is not enough when the account has an authenticator.
  if (totpEnabled) {
    const ctx = await getAuthContext();
    if (!ctx || !(await isMfaVerified(ctx.authUserId, ctx.sessionId))) {
      redirect("/two-step");
    }
  } else if (!isOwner && !opts.allowWithoutTwoStep) {
    // Non-owner staff must set up an authenticator before any admin page loads.
    redirect(adminPath("/profile?setup=two-step"));
  }

  const staffUser: StaffSessionUser = {
    ...user,
    staffRole: row?.staff_role || (isOwner ? "ADMIN" : "STAFF"),
    preset,
    overrides: isOwner ? [] : sanitizeOverrides(row?.staff_permissions || []),
    isOwner,
    totpEnabled
  };

  if (requiredPermission && !can(staffUser, requiredPermission)) {
    notFound();
  }

  return staffUser;
}

/** Same guard, for code that reads better as requirePerm("invoices:send"). */
export const requirePerm = (perm: string) => requireStaffUser(perm);

/** True when the request is allowed; returns false instead of a 404 (for optional parts of a page). */
export function staffCan(staff: StaffSessionUser, perm: string): boolean {
  return can(staff, perm);
}

// ==========================================
// 2. Owner alerts (money and export safeguards, hand-offs)
// ==========================================
const OWNER_WHERE = `u.role IN ('ADMIN','STAFF') AND COALESCE(u.active, true) = true AND (
  u.staff_preset = 'admin'
  OR (u.staff_preset IS NULL AND (u.staff_role = 'ADMIN' OR (u.staff_role IS NULL AND u.role = 'ADMIN')))
)`;

export async function getOwnerIds(): Promise<{ id: string; email: string; name: string }[]> {
  try {
    const res = await query<{ id: string; email: string; name: string }>(`SELECT u.id, u.email, u.name FROM users u WHERE ${OWNER_WHERE}`);
    return res.rows;
  } catch {
    const res = await query<{ id: string; email: string; name: string }>(
      `SELECT u.id, u.email, u.name FROM users u
       WHERE u.role IN ('ADMIN','STAFF') AND (u.staff_role = 'ADMIN' OR (u.staff_role IS NULL AND u.role = 'ADMIN'))`
    );
    return res.rows;
  }
}

/**
 * In-app notification to every owner (except the actor), plus an optional email
 * to ALERT_EMAIL. Never throws: a failed alert must not undo the action.
 */
export async function notifyOwners(
  notif: { type: "UPDATE" | "PAYMENT" | "INVOICE" | "TICKET" | "MESSAGE"; title: string; description: string; targetHref: string },
  opts: { excludeUserId?: string; email?: boolean } = {}
): Promise<void> {
  try {
    const owners = await getOwnerIds();
    // notifications.org_id is required: prefer the staff fallback org, else any org.
    const org = await query<{ id: string }>("SELECT id FROM organizations ORDER BY (id = $1) DESC LIMIT 1", [FALLBACK_ORG_ID]);
    const orgId = org.rows[0]?.id;
    for (const o of orgId ? owners : []) {
      if (o.id === opts.excludeUserId) continue;
      await query(
        `INSERT INTO notifications (org_id, user_id, type, title, description, target_href, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
        [orgId, o.id, notif.type, notif.title, notif.description, notif.targetHref]
      );
    }
    if (opts.email) {
      const { sendMailAlert } = await import("./email");
      await sendMailAlert(notif.title, `${notif.description}\n\n${adminUrl(notif.targetHref)}`);
    }
  } catch (err) {
    console.error("[notifyOwners]", err);
  }
}

/** Audit + owner alert for every export (who, what, size, when). */
export async function recordExport(staff: StaffSessionUser, what: string, rowCount: number, bytes: number): Promise<void> {
  await logAdminAudit({
    userId: staff.id,
    userName: staff.name,
    action: "DATA_EXPORTED",
    entity: what,
    metadata: { rowCount, bytes, preset: staff.preset }
  });
  if (!staff.isOwner) {
    const kb = Math.max(1, Math.round(bytes / 1024));
    await notifyOwners(
      {
        type: "UPDATE",
        title: `Export: ${what} by ${staff.name}`,
        description: `${staff.name} exported ${rowCount} ${what} rows (${kb} KB) at ${new Date().toISOString()}.`,
        targetHref: adminPath("/audit")
      },
      { excludeUserId: staff.id, email: true }
    );
  }
}

// ==========================================
// 3. Centralized audit logger
// ==========================================
export async function logAdminAudit(options: {
  orgId?: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "unknown";

    const payload = {
      ...(options.metadata || {}),
      user_name: options.userName,
      before: options.before,
      after: options.after
    };

    let targetOrgId = options.orgId;
    if (!targetOrgId) {
      const fallbackOrg = await query("SELECT id FROM organizations LIMIT 1");
      targetOrgId = fallbackOrg.rows[0]?.id;
    }

    if (!targetOrgId) {
      console.warn("[Admin Audit Log Skipped] No organization available for foreign key constraint");
      return;
    }

    await query(
      `INSERT INTO audit_logs (org_id, user_id, action, entity, entity_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        targetOrgId,
        options.userId || null,
        options.action,
        options.entity,
        options.entityId || null,
        JSON.stringify(payload),
        ip,
        userAgent
      ]
    );
  } catch (err) {
    console.error("[Admin Audit Log Failed]", err);
  }
}
