import { PORTAL_URL } from "@/lib/hosts";
import { getAuthContext, getSessionUser } from "./auth-server";
import { isMfaVerified } from "./mfa";
import { query } from "./db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  StaffRole,
  StaffSessionUser,
  hasPermission
} from "./admin-permissions-client";

export * from "./admin-permissions-client";

// ==========================================
// 2. Server Authentication & Permission Guard
// ==========================================
export async function requireStaffUser(requiredPermission?: string): Promise<StaffSessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect((await getAuthContext()) ? "/sign-in?error=not-allowed" : "/sign-in");
  }

  // Ensure user is staff or admin
  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    redirect(PORTAL_URL); // Not authorized for admin control room
  }

  // Fetch staff_role and totp_enabled from database
  let staffRole: StaffRole = "SUPPORT"; // least privilege if the lookup fails
  let totpEnabled = false;

  try {
    const res = await query(
      "SELECT staff_role, totp_enabled, totp_secret FROM users WHERE id = $1",
      [user.id]
    );
    if (res.rows.length > 0) {
      staffRole = (res.rows[0].staff_role as StaffRole) || (user.role === "ADMIN" ? "ADMIN" : "SUPPORT");
      totpEnabled = Boolean(res.rows[0].totp_enabled && res.rows[0].totp_secret);
    }
  } catch (err) {
    console.warn("Could not query user staff_role, defaulting to SUPPORT", err);
  }

  // Two-step: a Supabase session alone is not enough when the account has an authenticator.
  if (totpEnabled) {
    const ctx = await getAuthContext();
    if (!ctx || !(await isMfaVerified(ctx.authUserId, ctx.sessionId))) {
      redirect("/two-step");
    }
  }

  const staffUser: StaffSessionUser = {
    ...user,
    staffRole,
    totpEnabled
  };

  // Check specific permission if specified
  if (requiredPermission && !hasPermission(staffRole, requiredPermission)) {
    const error = new Error(`Forbidden: Staff role ${staffRole} lacks permission '${requiredPermission}'`);
    (error as any).digest = "NEXT_NOT_FOUND"; // Hide existence per security spec
    throw error;
  }

  return staffUser;
}

// ==========================================
// 3. Centralized Audit Logger
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
