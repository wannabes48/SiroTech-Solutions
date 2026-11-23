"use server";

import { query } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth-server";

/**
 * Validates an invite token and returns invite metadata (org name, email, role).
 */
export async function getInviteDetailsAction(token: string) {
  try {
    const res = await query(
      `SELECT i.id, i.email, i.role, i.expires_at, o.name AS org_name
       FROM invites i
       JOIN organizations o ON o.id = i.org_id
       WHERE i.token = $1 AND i.expires_at > NOW() AND i.accepted_at IS NULL`,
      [token]
    );

    if (res.rows.length === 0) {
      return { valid: false, error: "Invitation is invalid, has expired, or was already accepted." };
    }

    const row = res.rows[0];
    return {
      valid: true,
      email: row.email,
      orgName: row.org_name?.replace(/^\[DEACTIVATED\]\s*/i, "").trim() || "SiroTech Client Workspace",
      role: row.role,
    };
  } catch (err: any) {
    console.error("[getInviteDetailsAction] Error:", err);
    return { valid: false, error: "Failed to verify invitation token." };
  }
}

/**
 * Accepts an invitation, sets user password, binds membership, establishes session, and returns success.
 */
export async function acceptPortalInviteAction({
  token,
  name,
  password,
}: {
  token: string;
  name: string;
  password: string;
}) {
  try {
    if (!token || !password || password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    // 1. Fetch valid invite
    const inviteRes = await query(
      `SELECT i.*, o.name AS org_name
       FROM invites i
       JOIN organizations o ON o.id = i.org_id
       WHERE i.token = $1 AND i.expires_at > NOW() AND i.accepted_at IS NULL`,
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return { error: "This invitation link is invalid or has expired. Please request a new invitation." };
    }

    const invite = inviteRes.rows[0];
    const passwordHash = hashPassword(password);

    // 2. Check if user already exists
    const userRes = await query("SELECT id, name, role FROM users WHERE email = $1", [invite.email]);
    let userId: string;

    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
      await query(
        `UPDATE users 
         SET name = COALESCE(NULLIF($1, ''), name), password_hash = $2, email_confirmed_at = NOW(), updated_at = NOW() 
         WHERE id = $3`,
        [name?.trim() || null, passwordHash, userId]
      );
    } else {
      const newUser = await query(
        `INSERT INTO users (name, email, password_hash, role, email_confirmed_at, created_at, updated_at)
         VALUES ($1, $2, $3, 'CLIENT', NOW(), NOW(), NOW())
         RETURNING id`,
        [name.trim(), invite.email, passwordHash]
      );
      userId = newUser.rows[0].id;
    }

    // 3. Ensure membership in organization
    await query(
      `INSERT INTO memberships (org_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (org_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
      [invite.org_id, userId, invite.role || "MEMBER"]
    );

    // 4. Mark invite as accepted
    await query("UPDATE invites SET accepted_at = NOW() WHERE id = $1", [invite.id]);

    // 5. Establish authenticated session cookie
    const cleanOrgName = invite.org_name?.replace(/^\[DEACTIVATED\]\s*/i, "").trim() || "Organization Workspace";
    await createSession({
      id: userId,
      orgId: invite.org_id,
      orgName: cleanOrgName,
      name: name.trim() || invite.email.split("@")[0],
      email: invite.email,
      role: "CLIENT",
      orgRole: invite.role as "OWNER" | "MEMBER",
    });

    return { success: true };
  } catch (err: any) {
    console.error("[acceptPortalInviteAction] Error:", err);
    return { error: "An unexpected error occurred while accepting your invitation. Please try again." };
  }
}
