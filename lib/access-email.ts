import { query } from "@/lib/db";
import { supabaseAdmin, supabaseAnon, findAuthUserByEmail, hasServiceRole } from "@/lib/supabase/admin";
import { getProfileByEmail, type ProfileRow } from "@/lib/auth-server";
import { PORTAL_URL, ADMIN_URL } from "@/lib/hosts";

/**
 * Invites and sign-in links (Supabase Auth).
 * The admin UI creates the profile (users row: role, staff preset or org membership)
 * first, then calls sendAccessEmail, which picks the mechanism:
 *   - profile already linked to a Supabase user → sign-in link (signInWithOtp)
 *   - new person → Supabase invite (inviteUserByEmail, "Invite user" template)
 * Only the host origin is passed as redirect; the email templates add /auth/confirm.
 */
export type AccessArea = "portal" | "admin";
export const ORIGIN: Record<AccessArea, string> = { portal: PORTAL_URL, admin: ADMIN_URL };

export const RESEND_COOLDOWN_SECONDS = 60;
export { accessStatus, type AccessStatus } from "./access-status";

export type AccessResult = { ok: boolean; kind?: "invite" | "signin"; error?: string; retryAfterSeconds?: number };

export const areaForRole = (role: string): AccessArea => (role === "CLIENT" ? "portal" : "admin");
export const allowedOnArea = (role: string, area: AccessArea) =>
  area === "admin" ? role === "STAFF" || role === "ADMIN" : role === "CLIENT";

/** Record every invite / link request outcome (shown in Admin > Emails). */
export async function logAuthEmail(e: {
  type: "invite" | "signin_link" | "recovery" | "signup" | "revoke";
  email: string;
  userId?: string | null;
  area?: AccessArea | null;
  status: "SENT" | "FAILED" | "SKIPPED";
  error?: string | null;
}) {
  try {
    await query(
      `INSERT INTO auth_email_logs (type, email, user_id, area, status, error, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [e.type, e.email.toLowerCase(), e.userId || null, e.area || null, e.status, e.error || null]
    );
  } catch (err) {
    console.warn("[auth_email_logs insert failed]", err);
  }
}

async function audit(actorId: string | null, action: string, entityId: string, metadata: Record<string, any> = {}) {
  try {
    await query(
      `INSERT INTO audit_logs (org_id, user_id, action, entity, entity_id, metadata, created_at)
       VALUES (COALESCE((SELECT org_id FROM memberships WHERE user_id = $3 LIMIT 1), (SELECT id FROM organizations ORDER BY created_at LIMIT 1)),
               $1, $2, 'user', $3, $4, NOW())`,
      [actorId, action, entityId, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.warn("[access audit failed]", err);
  }
}

/** Make sure the profile has a Supabase auth user; returns its id. Never sends mail. */
export async function ensureAuthUser(profile: ProfileRow, password?: string): Promise<{ id: string } | { error: string }> {
  if (profile.auth_id) {
    if (password) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.auth_id, { password });
      if (error) return { error: error.message };
    }
    return { id: profile.auth_id };
  }
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: profile.email,
    email_confirm: true,
    ...(password ? { password } : {}),
    user_metadata: { full_name: profile.name }, // display only
    app_metadata: { role: profile.role }, // server-set; used by middleware routing
  });
  let authId = data?.user?.id;
  if (error) {
    // Already exists in Supabase but not linked to this profile yet.
    const existing = await findAuthUserByEmail(profile.email);
    if (!existing) return { error: error.message };
    authId = existing.id;
    await supabaseAdmin.auth.admin.updateUserById(authId, {
      app_metadata: { role: profile.role },
      ...(password ? { password } : {}),
    });
  }
  await query("UPDATE users SET auth_id = $1, updated_at = NOW() WHERE id = $2 AND auth_id IS NULL", [authId, profile.id]);
  return { id: authId! };
}

/** Visible 60s cooldown (matches Supabase's per-address interval). */
async function cooldownRemaining(profileId: string): Promise<number> {
  const r = await query<{ wait: number }>(
    `SELECT GREATEST(0, $2 - EXTRACT(EPOCH FROM (NOW() - last_access_email_at)))::int AS wait
     FROM users WHERE id = $1 AND last_access_email_at IS NOT NULL`,
    [profileId, RESEND_COOLDOWN_SECONDS]
  );
  return r.rows[0]?.wait || 0;
}

export async function sendAccessEmail(p: {
  email: string;
  area: AccessArea;
  name?: string;
  invitedById: string | null;
}): Promise<AccessResult> {
  if (!hasServiceRole()) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." };
  }
  const email = p.email.trim().toLowerCase();
  const profile = await getProfileByEmail(email);
  if (!profile) return { ok: false, error: "No profile for this email" };
  if (profile.active === false) return { ok: false, error: "This account is disabled. Enable it before sending access." };
  if (!allowedOnArea(profile.role, p.area)) {
    return { ok: false, error: `A ${profile.role} account can't be sent ${p.area} access.` };
  }

  const wait = await cooldownRemaining(profile.id);
  if (wait > 0) return { ok: false, error: `Please wait ${wait}s before sending again.`, retryAfterSeconds: wait };

  // Already has a Supabase account: a normal sign-in link
  if (profile.auth_id) {
    const { error } = await supabaseAnon.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: ORIGIN[p.area] },
    });
    await logAuthEmail({ type: "signin_link", email, userId: profile.id, area: p.area, status: error ? "FAILED" : "SENT", error: error?.message });
    if (error) return { ok: false, error: error.message };
    await query(
      "UPDATE users SET last_access_email_at = NOW(), invited_at = COALESCE(invited_at, NOW()), invited_by_id = COALESCE(invited_by_id, $2) WHERE id = $1",
      [profile.id, p.invitedById]
    );
    await audit(p.invitedById, "access_signin_link_sent", profile.id, { email, area: p.area });
    return { ok: true, kind: "signin" };
  }

  // New person: Supabase creates the user and sends the Invite template
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: ORIGIN[p.area],
    data: { full_name: p.name || profile.name }, // display only, never used for permissions
  });
  if (error || !data?.user) {
    // The address may already exist in Supabase (e.g. created elsewhere): link it and send a sign-in link.
    const existing = error ? await findAuthUserByEmail(email) : null;
    if (existing) {
      await query("UPDATE users SET auth_id = $1 WHERE id = $2 AND auth_id IS NULL", [existing.id, profile.id]);
      await supabaseAdmin.auth.admin.updateUserById(existing.id, { app_metadata: { role: profile.role } });
      return sendAccessEmail(p);
    }
    const msg = error?.message ?? "Invite failed";
    await logAuthEmail({ type: "invite", email, userId: profile.id, area: p.area, status: "FAILED", error: msg });
    return { ok: false, error: msg };
  }

  await query(
    `UPDATE users SET auth_id = $1, invited_at = NOW(), invited_by_id = $2, last_access_email_at = NOW(), updated_at = NOW()
     WHERE id = $3`,
    [data.user.id, p.invitedById, profile.id]
  );
  await supabaseAdmin.auth.admin.updateUserById(data.user.id, { app_metadata: { role: profile.role } }); // server-set
  await logAuthEmail({ type: "invite", email, userId: profile.id, area: p.area, status: "SENT" });
  await audit(p.invitedById, "invite_sent", profile.id, { email, area: p.area });
  return { ok: true, kind: "invite" };
}

/**
 * Revoke access. Never signed in → delete the Supabase user (old links stop working),
 * otherwise disable. Either way the profile becomes inactive.
 */
export async function revokeAccess(profileId: string, actorId: string): Promise<{ ok: boolean; error?: string; deleted?: boolean }> {
  const r = await query<{ auth_id: string | null; email: string; accepted_at: string | null; last_login_at: string | null }>(
    "SELECT auth_id, email, accepted_at, last_login_at FROM users WHERE id = $1",
    [profileId]
  );
  const u = r.rows[0];
  if (!u) return { ok: false, error: "User not found" };
  const neverSignedIn = !u.accepted_at && !u.last_login_at;
  if (u.auth_id && neverSignedIn) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(u.auth_id);
    if (error) return { ok: false, error: error.message };
    await query("UPDATE users SET active = false, auth_id = NULL, updated_at = NOW() WHERE id = $1", [profileId]);
    await logAuthEmail({ type: "revoke", email: u.email, userId: profileId, status: "SENT" });
    await audit(actorId, "invite_revoked", profileId, { email: u.email, deletedAuthUser: true });
    return { ok: true, deleted: true };
  }
  const res = await setAccountActive(profileId, false, actorId);
  return { ...res, deleted: false };
}

/** Disable / enable sign-in. Disabled users are banned in Supabase and rejected by getSessionUser at once. */
export async function setAccountActive(profileId: string, active: boolean, actorId: string): Promise<{ ok: boolean; error?: string }> {
  const r = await query<{ auth_id: string | null; email: string }>("SELECT auth_id, email FROM users WHERE id = $1", [profileId]);
  const u = r.rows[0];
  if (!u) return { ok: false, error: "User not found" };
  if (u.auth_id) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(u.auth_id, { ban_duration: active ? "none" : "876000h" });
    if (error) return { ok: false, error: error.message };
  }
  await query("UPDATE users SET active = $1, updated_at = NOW() WHERE id = $2", [active, profileId]);
  await audit(actorId, active ? "account_enabled" : "account_disabled", profileId, { email: u.email });
  return { ok: true };
}

export async function resetTwoStep(profileId: string, actorId: string): Promise<{ ok: boolean }> {
  await query("UPDATE users SET totp_enabled = false, totp_secret = NULL, updated_at = NOW() WHERE id = $1", [profileId]);
  await audit(actorId, "two_step_reset", profileId);
  return { ok: true };
}
