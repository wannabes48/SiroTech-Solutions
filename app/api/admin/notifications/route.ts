import { adminPath } from "@/lib/hosts";
import { NextRequest, NextResponse } from "next/server";
import { requireStaffUser, can } from "@/lib/admin-permissions";
import { unstable_rethrow } from "next/navigation";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const staff = await requireStaffUser();

    // 1. Direct staff notifications from `notifications` table
    const directRes = await query(
      `SELECT id, type, title, description, target_href, is_read, created_at
       FROM notifications
       WHERE user_id = $1 AND type != 'READ_MARKER'
       ORDER BY created_at DESC
       LIMIT 25`,
      [staff.id]
    );

    // 2. Fetch dismissed/read operational markers for this staff
    const markersRes = await query<{ item_id: string }>(
      `SELECT title AS item_id
       FROM notifications
       WHERE user_id = $1 AND type = 'READ_MARKER'`,
      [staff.id]
    );
    const readItemIds = new Set(markersRes.rows.map((r) => r.item_id));

    // 3. Operational items: open support tickets
    const ticketsRes = await query(
      `SELECT t.id, t.ticket_number, t.subject, t.priority, t.status, t.created_at, t.updated_at, o.name AS org_name
       FROM support_tickets t
       LEFT JOIN organizations o ON o.id = t.org_id
       WHERE t.status IN ('OPEN', 'WAITING_ON_CLIENT')
       ORDER BY t.updated_at DESC
       LIMIT 6`
    ).catch(() => ({ rows: [] }));

    // 4. Operational items: scheduled or recent consultations
    const consultsRes = await query(
      `SELECT id, name, company, scheduled_at, status, created_at
       FROM consultations
       ORDER BY created_at DESC
       LIMIT 5`
    ).catch(() => ({ rows: [] }));

    // 5. Operational items: recent payments
    const paymentsRes = await query(
      `SELECT pay.id, pay.amount_kes, pay.currency, pay.payment_method, pay.status, pay.created_at,
              inv.invoice_number, COALESCE(o.name, 'Client') AS org_name
       FROM payments pay
       LEFT JOIN invoices inv ON inv.id = pay.invoice_id
       LEFT JOIN organizations o ON o.id = inv.org_id
       ORDER BY pay.created_at DESC
       LIMIT 5`
    ).catch(() => ({ rows: [] }));

    // 6. Operational items: new inbound leads
    const leadsRes = await query(
      `SELECT id, name, company, service, status, value, created_at
       FROM leads
       WHERE status = 'NEW' AND (spam IS NULL OR spam = false)
       ORDER BY created_at DESC
       LIMIT 5`
    ).catch(() => ({ rows: [] }));

    // 7. Operational items: pending milestones awaiting review
    const milestonesRes = await query(
      `SELECT m.id, m.title, m.phase, m.status, m.created_at, p.title AS project_title
       FROM milestones m
       INNER JOIN projects p ON p.id = m.project_id
       WHERE m.status::text IN ('AWAITING_APPROVAL', 'READY_FOR_APPROVAL', 'CHANGES_REQUESTED')
       ORDER BY m.created_at DESC
       LIMIT 5`
    ).catch(() => ({ rows: [] }));

    // Transform operational items into standard notification format
    const operationalNotifs: any[] = [];

    // Tickets
    (can(staff, "tickets:read") ? ticketsRes.rows : []).forEach((t: any) => {
      const itemId = `ticket-${t.id}`;
      operationalNotifs.push({
        id: itemId,
        type: "ticket",
        title: `Ticket #${t.ticket_number} (${t.priority})`,
        description: `${t.subject} • ${t.org_name || "Client"}`,
        targetHref: adminPath(`/support?id=${t.id}`),
        read: readItemIds.has(itemId),
        timestamp: t.updated_at || t.created_at,
        isOperational: true,
      });
    });

    // Consultations
    (can(staff, "consultations:read") ? consultsRes.rows : []).forEach((c: any) => {
      const itemId = `consult-${c.id}`;
      const dateStr = c.scheduled_at
        ? new Date(c.scheduled_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Pending";
      operationalNotifs.push({
        id: itemId,
        type: "consultation",
        title: `Consultation: ${c.name}`,
        description: `${c.company || "Direct Booking"} • Scheduled: ${dateStr}`,
        targetHref: adminPath(`/consultations`),
        read: readItemIds.has(itemId),
        timestamp: c.created_at,
        isOperational: true,
      });
    });

    // Payments
    (can(staff, "payments:read") ? paymentsRes.rows : []).forEach((p: any) => {
      const itemId = `pay-${p.id}`;
      const amountStr = Number(p.amount_kes || 0).toLocaleString();
      operationalNotifs.push({
        id: itemId,
        type: "payment",
        title: `Payment: KES ${amountStr}`,
        description: `${p.org_name} • ${p.invoice_number || "Direct Payment"} (${p.payment_method || "Paystack"})`,
        targetHref: adminPath(`/invoices`),
        read: readItemIds.has(itemId),
        timestamp: p.created_at,
        isOperational: true,
      });
    });

    // Leads
    (can(staff, "leads:read") ? leadsRes.rows : []).forEach((l: any) => {
      const itemId = `lead-${l.id}`;
      const val = Number(l.value || 0);
      const valStr = val > 0 ? ` • Est. KES ${val.toLocaleString()}` : "";
      operationalNotifs.push({
        id: itemId,
        type: "lead",
        title: `New Lead: ${l.name}`,
        description: `${l.company || l.service || "New Inquiry"}${valStr}`,
        targetHref: adminPath(`/leads`),
        read: readItemIds.has(itemId),
        timestamp: l.created_at,
        isOperational: true,
      });
    });

    // Milestones
    (can(staff, "projects:read") ? milestonesRes.rows : []).forEach((m: any) => {
      const itemId = `milestone-${m.id}`;
      operationalNotifs.push({
        id: itemId,
        type: "milestone",
        title: `Milestone: Phase ${m.phase}`,
        description: `${m.title} (${m.project_title}) • ${m.status.replace(/_/g, " ")}`,
        targetHref: adminPath(`/projects`),
        read: readItemIds.has(itemId),
        timestamp: m.created_at,
        isOperational: true,
      });
    });

    // Direct notifications
    const directNotifs = directRes.rows.map((n: any) => ({
      id: n.id,
      type: (n.type || "UPDATE").toLowerCase(),
      title: n.title,
      description: n.description,
      targetHref: adminPath(n.target_href || "/"),
      read: Boolean(n.is_read),
      timestamp: n.created_at,
      isOperational: false,
    }));

    // Merge and sort newest first
    const allNotifs = [...directNotifs, ...operationalNotifs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      notifications: allNotifs.slice(0, 30),
      unreadCount: allNotifs.filter((n) => !n.read).length,
    });
  } catch (error: any) {
    unstable_rethrow(error);
    console.error("[Admin Notifications GET Error]", error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireStaffUser();
    const body = await request.json().catch(() => ({}));
    const { action, id, ids } = body;

    const fallbackOrgRes = await query("SELECT id FROM organizations LIMIT 1");
    const orgId = fallbackOrgRes.rows[0]?.id || "e0f52cf9-0000-0000-0000-000000000001";

    if (action === "mark_read" && id) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await query(
          `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
          [id, staff.id]
        );
      } else {
        // Operational marker
        await query(
          `INSERT INTO notifications (org_id, user_id, type, title, description, target_href, is_read, created_at)
           VALUES ($1, $2, 'READ_MARKER', $3, '', '', true, NOW())`,
          [orgId, staff.id, id]
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === "mark_all_read") {
      // 1. Mark all direct user notifications as read
      await query(
        `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
        [staff.id]
      );

      // 2. Mark any operational IDs as read markers
      if (Array.isArray(ids) && ids.length > 0) {
        for (const itemId of ids) {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId);
          if (!isUUID) {
            await query(
              `INSERT INTO notifications (org_id, user_id, type, title, description, target_href, is_read, created_at)
               VALUES ($1, $2, 'READ_MARKER', $3, '', '', true, NOW())`,
              [orgId, staff.id, itemId]
            );
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    unstable_rethrow(error);
    console.error("[Admin Notifications POST Error]", error);
    return NextResponse.json({ error: "Failed to update notification status" }, { status: 500 });
  }
}
