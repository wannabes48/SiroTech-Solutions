import { query } from "@/lib/db";

export type NotificationType =
  | "UPDATE"
  | "MESSAGE"
  | "MILESTONE"
  | "INVOICE"
  | "PAYMENT"
  | "TICKET"
  | "FILE"
  | "INVITE";

export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  description: string;
  targetHref: string;
}

/**
 * Dispatches a private notification to each CLIENT user belonging to the organization.
 * Each user receives their own individual row in the `notifications` table, ensuring
 * that read/unread status and notification histories are completely isolated per user.
 */
export async function notifyClientUsers(
  orgId: string,
  notif: CreateNotificationParams,
  excludeUserId?: string
): Promise<number> {
  try {
    // 1. Fetch all CLIENT users enrolled in this organization
    const membersRes = await query<{ user_id: string }>(
      `SELECT m.user_id 
       FROM memberships m
       JOIN users u ON u.id = m.user_id
       WHERE m.org_id = $1 AND u.role = 'CLIENT'
       ${excludeUserId ? "AND m.user_id != $2" : ""}`,
      excludeUserId ? [orgId, excludeUserId] : [orgId]
    );

    if (membersRes.rows.length === 0) {
      return 0;
    }

    // 2. Insert a private notification for each client user
    let insertedCount = 0;
    for (const member of membersRes.rows) {
      await query(
        `INSERT INTO notifications (org_id, user_id, type, title, description, target_href, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
        [
          orgId,
          member.user_id,
          notif.type,
          notif.title,
          notif.description,
          notif.targetHref,
        ]
      );
      insertedCount++;
    }

    return insertedCount;
  } catch (error) {
    console.error("[notifyClientUsers Error]", { orgId, notif, error });
    return 0;
  }
}

/**
 * Dispatches a notification to a specific single user.
 */
export async function notifyUser(
  userId: string,
  orgId: string,
  notif: CreateNotificationParams
): Promise<boolean> {
  try {
    await query(
      `INSERT INTO notifications (org_id, user_id, type, title, description, target_href, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
      [
        orgId,
        userId,
        notif.type,
        notif.title,
        notif.description,
        notif.targetHref,
      ]
    );
    return true;
  } catch (error) {
    console.error("[notifyUser Error]", { userId, orgId, notif, error });
    return false;
  }
}

/**
 * Marks a single notification as read for a specific user (enforcing private isolation).
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const res = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("[markNotificationRead Error]", { notificationId, userId, error });
    return false;
  }
}

/**
 * Marks all notifications as read for a specific user.
 */
export async function markAllNotificationsRead(userId: string): Promise<number> {
  try {
    const res = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return res.rowCount ?? 0;
  } catch (error) {
    console.error("[markAllNotificationsRead Error]", { userId, error });
    return 0;
  }
}
