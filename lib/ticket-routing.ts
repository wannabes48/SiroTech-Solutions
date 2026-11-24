import { query } from "./db";

/**
 * Default assignee per ticket category. Billing, account and general questions go
 * to the client manager; bugs and change requests go to delivery (the owner).
 * Either side can reassign from the ticket (tickets:assign).
 */
const CLIENT_SIDE = new Set(["BILLING", "QUESTION", "OTHER"]);

type Staff = { id: string; name: string };

async function firstStaff(where: string): Promise<Staff | null> {
  try {
    const res = await query<Staff>(
      `SELECT u.id, u.name FROM users u
       WHERE u.role IN ('ADMIN','STAFF') AND COALESCE(u.active, true) = true AND (${where})
       ORDER BY u.created_at ASC LIMIT 1`
    );
    return res.rows[0] || null;
  } catch {
    return null; // staff_preset column not migrated yet
  }
}

const clientManager = () =>
  firstStaff("u.staff_preset = 'client_manager' OR (u.staff_preset IS NULL AND u.staff_role = 'MANAGER')");
const owner = () =>
  firstStaff("u.staff_preset = 'admin' OR (u.staff_preset IS NULL AND (u.staff_role = 'ADMIN' OR (u.staff_role IS NULL AND u.role = 'ADMIN')))");

export async function defaultTicketAssignee(category: string): Promise<Staff | null> {
  if (CLIENT_SIDE.has(category)) return (await clientManager()) || (await owner());
  return (await owner()) || (await clientManager());
}

/** Best-effort: set the assignee on a new ticket. Never throws. */
export async function routeNewTicket(ticketId: string, category: string): Promise<Staff | null> {
  try {
    const who = await defaultTicketAssignee(category);
    if (!who) return null;
    try {
      await query("UPDATE support_tickets SET assignee_id = $1, assignee_name = $2 WHERE id = $3", [who.id, who.name, ticketId]);
    } catch {
      await query("UPDATE support_tickets SET assignee_name = $1 WHERE id = $2", [who.name, ticketId]);
    }
    return who;
  } catch (err) {
    console.error("[routeNewTicket]", err);
    return null;
  }
}
