import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import crypto from "crypto";
import { query } from "./db";
import { supabaseServer } from "./supabase/server";
import { clearMfa } from "./mfa";

/**
 * Identity comes from Supabase Auth (auth.users); the `users` table is the
 * profile and the source of truth for role, organisation and active status.
 * Never authorise from user_metadata — users can edit it from the browser.
 */
export interface SessionUser {
  id: string; // users.id (profile id)
  authUserId: string; // auth.users.id
  orgId: string;
  orgName: string;
  name: string;
  email: string;
  role: "CLIENT" | "STAFF" | "ADMIN";
  orgRole: "OWNER" | "MEMBER";
  phone?: string;
  timezone?: string;
  welcomeCompleted?: boolean;
}

export interface ProfileRow {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  role: "CLIENT" | "STAFF" | "ADMIN";
  phone: string | null;
  timezone: string | null;
  welcome_completed: boolean | null;
  active: boolean | null;
  staff_role: string | null;
  totp_enabled: boolean | null;
  totp_secret: string | null;
  password_hash: string | null;
  accepted_at: string | null;
  last_login_at: string | null;
  org_id: string | null;
  org_role: "OWNER" | "MEMBER" | null;
  org_name: string | null;
}

// Staff have no membership; keep the fallback org used before the Supabase migration.
const FALLBACK_ORG_ID = "e0f52cf9-0000-0000-0000-000000000001";

const PROFILE_SELECT = `
  SELECT u.id, u.auth_id, u.name, u.email, u.role, u.phone, u.timezone, u.welcome_completed,
         u.active, u.staff_role, u.totp_enabled, u.totp_secret, u.password_hash,
         u.accepted_at, u.last_login_at,
         m.org_id, m.role AS org_role, o.name AS org_name
  FROM users u
  LEFT JOIN LATERAL (
    SELECT org_id, role FROM memberships WHERE user_id = u.id ORDER BY created_at ASC LIMIT 1
  ) m ON true
  LEFT JOIN organizations o ON o.id = m.org_id`;

export async function getProfileByAuthId(authUserId: string): Promise<ProfileRow | null> {
  const res = await query<ProfileRow>(`${PROFILE_SELECT} WHERE u.auth_id = $1 LIMIT 1`, [authUserId]);
  return res.rows[0] || null;
}

export async function getProfileByEmail(email: string): Promise<ProfileRow | null> {
  const res = await query<ProfileRow>(`${PROFILE_SELECT} WHERE LOWER(u.email) = LOWER($1) LIMIT 1`, [email.trim()]);
  return res.rows[0] || null;
}

/** Link a profile to an auth user by email. Only call with a Supabase-verified email. */
export async function linkProfileByVerifiedEmail(authUserId: string, email: string): Promise<ProfileRow | null> {
  const res = await query(
    "UPDATE users SET auth_id = $1, updated_at = NOW() WHERE LOWER(email) = LOWER($2) AND auth_id IS NULL RETURNING id",
    [authUserId, email.trim()]
  );
  if (!res.rowCount) return null;
  return getProfileByAuthId(authUserId);
}

export function toSessionUser(p: ProfileRow, authUserId: string): SessionUser {
  return {
    id: p.id,
    authUserId,
    orgId: p.org_id || FALLBACK_ORG_ID,
    orgName: p.org_name?.replace(/^\[DEACTIVATED\]\s*/i, "").trim() || "SiroTech Solutions",
    name: p.name,
    email: p.email,
    role: p.role,
    orgRole: p.org_role || "OWNER",
    phone: p.phone || undefined,
    timezone: p.timezone || undefined,
    welcomeCompleted: Boolean(p.welcome_completed),
  };
}

// ==========================================
// 1. Legacy password hashes (pre-Supabase)
// ==========================================
// Kept only so existing scrypt passwords can be moved into Supabase on first sign-in.
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

// ==========================================
// 2. Session (Supabase)
// ==========================================
export interface AuthContext {
  authUserId: string;
  sessionId?: string;
  email?: string;
}

/** Verified JWT claims for this request (cached per request). */
export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims?.sub) return null;
    const c = data.claims as Record<string, any>;
    return { authUserId: c.sub, sessionId: c.session_id, email: c.email };
  } catch {
    return null;
  }
});

/** Active profile for the signed-in Supabase user, or null. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  try {
    let profile = await getProfileByAuthId(ctx.authUserId);
    if (!profile && ctx.email) {
      // First sign-in of a pre-existing profile: link it, but only for a confirmed email.
      const supabase = await supabaseServer();
      const { data } = await supabase.auth.getUser();
      if (data.user?.email_confirmed_at && data.user.email) {
        profile = await linkProfileByVerifiedEmail(ctx.authUserId, data.user.email);
      }
    }
    if (!profile || profile.active === false) return null;
    return toSessionUser(profile, ctx.authUserId);
  } catch (err) {
    console.error("[getSessionUser]", err);
    return null;
  }
});

export async function clearSession(): Promise<void> {
  try {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("[clearSession]", err);
  }
  await clearMfa();
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    // A Supabase session without an active profile must not loop back here.
    redirect((await getAuthContext()) ? "/sign-in?error=not-allowed" : "/sign-in");
  }
  return user;
}

export async function requireOrgScope(orgId: string): Promise<SessionUser> {
  const user = await requireUser();
  // Staff and Admin can view any org, clients can only access their own org
  if (user.role === "CLIENT" && user.orgId !== orgId) {
    const memberCheck = await query(
      "SELECT 1 FROM memberships WHERE user_id = $1 AND org_id = $2 LIMIT 1",
      [user.id, orgId]
    );
    if (memberCheck.rowCount === 0) {
      // J8 Security Checklist: Foreign or unknown IDs return 404, never 403 or data leaks
      const notFoundError = new Error("Resource not found");
      (notFoundError as any).digest = "NEXT_NOT_FOUND";
      throw notFoundError;
    }
  }
  return user;
}

// ==========================================
// 3. Rate Limiter (5 attempts / 15 mins per key)
// ==========================================
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) {
    return { allowed: true };
  }
  if (now > record.resetAt) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }
  if (record.count >= 5) {
    const retryAfter = Math.ceil((record.resetAt - now) / 60000);
    return { allowed: false, retryAfterMinutes: retryAfter };
  }
  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + fifteenMinutes });
  } else {
    record.count += 1;
  }
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// ==========================================
// 4. Audit Logging
// ==========================================
export async function logAudit(
  orgId: string,
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null = null,
  metadata: any = {}
): Promise<void> {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "unknown";

    await query(
      `INSERT INTO audit_logs (org_id, user_id, action, entity, entity_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orgId, userId, action, entity, entityId, JSON.stringify(metadata), ip, userAgent]
    );
  } catch (err) {
    console.error("[Audit Log Failed]", err);
  }
}
