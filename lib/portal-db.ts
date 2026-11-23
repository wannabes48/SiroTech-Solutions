import { portalPath } from "@/lib/hosts";
import { query } from "./db";
import { accessStatus } from "./access-status";

// ==========================================
// 1. Dashboard Aggregate Data
// ==========================================
export async function getPortalDashboardData(orgId: string, userId?: string) {
  // 1. Active Projects
  const projectsRes = await query(
    `SELECT id, slug, title, summary, status, progress, target_launch, staging_url, repo_url, next_step_summary
     FROM projects
     WHERE org_id = $1 OR ($2::text IS NOT NULL AND org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid))
     ORDER BY created_at DESC`,
    [orgId, userId || null]
  );

  // 2. Invoices & Totals
  const invoicesRes = await query(
    `SELECT id, invoice_number, project_title, issue_date, due_date, amount_kes, amount_usd, status
     FROM invoices
     WHERE org_id = $1 OR ($2::text IS NOT NULL AND org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid))
     ORDER BY issue_date DESC`,
    [orgId, userId || null]
  );

  const unpaidInvoices = invoicesRes.rows.filter((i) => i.status !== "PAID");
  const totalPendingKES = unpaidInvoices.reduce((acc, curr) => acc + Number(curr.amount_kes || 0), 0);
  const totalPendingUSD = unpaidInvoices.reduce((acc, curr) => acc + Number(curr.amount_usd || 0), 0);

  // 3. Open Support Tickets
  const ticketsRes = await query(
    `SELECT id, ticket_number, subject, category, priority, status, assignee_name, updated_at
     FROM support_tickets
     WHERE org_id = $1 OR ($2::text IS NOT NULL AND org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid))
     ORDER BY updated_at DESC`,
    [orgId, userId || null]
  );

  const openTicketsCount = ticketsRes.rows.filter(
    (t) => t.status === "OPEN" || t.status === "WAITING_ON_CLIENT" || t.status === "IN_PROGRESS"
  ).length;

  // 4. Pending Milestones awaiting approval
  const milestonesAwaitingRes = await query(
    `SELECT m.id, m.phase, m.title, m.due_date, m.deliverables, p.id AS project_id, p.title AS project_title
     FROM milestones m
     INNER JOIN projects p ON p.id = m.project_id
     WHERE (p.org_id = $1 OR ($2::text IS NOT NULL AND p.org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid))) 
       AND (m.status = 'AWAITING_APPROVAL' OR m.status = 'READY_FOR_APPROVAL')
     ORDER BY m.due_date ASC`,
    [orgId, userId || null]
  );

  // 5. Unaccepted Proposals
  const proposalsRes = await query(
    `SELECT id, title, version, summary, file_url
     FROM proposals
     WHERE (org_id = $1 OR ($2::text IS NOT NULL AND org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid))) 
       AND is_accepted = false
     ORDER BY created_at DESC`,
    [orgId, userId || null]
  );

  // 6. Build Attention Items (merged actionable list only client can do)
  const attentionItems: any[] = [];

  // Add milestones awaiting sign-off
  for (const m of milestonesAwaitingRes.rows) {
    attentionItems.push({
      id: `milestone-${m.id}`,
      type: "milestone",
      title: `${m.phase} Deliverables Awaiting Sign-off`,
      description: `Review deliverables for "${m.title}" to authorize sprint release.`,
      urgency: "HIGH",
      dueInDays: 3,
      actionLabel: "Review & Sign Off",
      actionHref: portalPath(`/projects/${m.project_id}`),
      rawId: m.id,
    });
  }

  // Add unpaid invoices due
  for (const inv of unpaidInvoices) {
    attentionItems.push({
      id: `invoice-${inv.id}`,
      type: "invoice",
      title: `Invoice ${inv.invoice_number} Due`,
      description: `KES ${Number(inv.amount_kes).toLocaleString()} (${inv.project_title}) awaiting payment.`,
      urgency: inv.status === "OVERDUE" ? "HIGH" : "MEDIUM",
      dueInDays: 7,
      actionLabel: "Pay via Paystack",
      actionHref: portalPath(`/invoices`),
      rawId: inv.id,
    });
  }

  // Add tickets waiting on client response
  for (const t of ticketsRes.rows.filter((t) => t.status === "WAITING_ON_CLIENT")) {
    attentionItems.push({
      id: `ticket-${t.id}`,
      type: "ticket",
      title: `Response Required: Ticket ${t.ticket_number}`,
      description: `Staff left a reply regarding "${t.subject}".`,
      urgency: "MEDIUM",
      dueInDays: 1,
      actionLabel: "Reply to Staff",
      actionHref: portalPath(`/support`),
      rawId: t.id,
    });
  }

  // Add proposals needing acceptance
  for (const p of proposalsRes.rows) {
    attentionItems.push({
      id: `proposal-${p.id}`,
      type: "proposal",
      title: `Agreement Ready: ${p.title} (${p.version})`,
      description: p.summary,
      urgency: "LOW",
      dueInDays: 5,
      actionLabel: "Review & Accept",
      actionHref: portalPath(`/projects/${projectsRes.rows[0]?.id || ""}`),
      rawId: p.id,
    });
  }

  // 7. Recent Activity (derived dynamically from audit logs and project updates)
  const activityRes = await query(
    `SELECT id, action, entity, metadata, created_at
     FROM audit_logs
     WHERE org_id = $1 OR ($2::text IS NOT NULL AND org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid))
     ORDER BY created_at DESC
     LIMIT 8`,
    [orgId, userId || null]
  );

  return {
    projects: projectsRes.rows,
    invoices: invoicesRes.rows,
    tickets: ticketsRes.rows,
    attentionItems,
    activities: activityRes.rows,
    proposals: proposalsRes.rows,
    stats: {
      activeProjectsCount: projectsRes.rows.filter(
        (p) => p.status !== "CANCELLED" && p.status !== "ARCHIVED"
      ).length,
      totalPendingKES,
      totalPendingUSD,
      openTicketsCount,
      needsAttentionCount: attentionItems.length,
    },
  };
}

// ==========================================
// 2. Projects & Milestones
// ==========================================
export async function getPortalProjects(orgId: string, userId?: string) {
  const res = await query(
    `SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.id,
            'phase', m.phase,
            'title', m.title,
            'order_num', m.order_num,
            'status', m.status,
            'due_date', m.due_date,
            'completed_date', m.completed_date,
            'deliverables', m.deliverables,
            'feedback', m.feedback,
            'approved_at', m.approved_at
          ) ORDER BY m.order_num ASC
        ) FILTER (WHERE m.id IS NOT NULL), '[]'
      ) AS milestones
     FROM projects p
     LEFT JOIN milestones m ON m.project_id = p.id
     WHERE p.org_id = $1 OR ($2::text IS NOT NULL AND p.org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid))
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [orgId, userId || null]
  );

  return res.rows;
}

export async function getPortalProjectDetail(orgId: string, idOrSlug: string, isStaff: boolean = false, userId?: string) {
  // Query project
  const pRes = await query(
    `SELECT * FROM projects 
     WHERE (id::text = $1 OR slug = $1)
     AND (
       $2 = true 
       OR org_id = $3 
       OR ($4::text IS NOT NULL AND org_id IN (SELECT org_id FROM memberships WHERE user_id = $4::uuid))
     )`,
    [idOrSlug, isStaff, orgId, userId || null]
  );

  if (pRes.rowCount === 0) return null;
  const project = pRes.rows[0];

  // Milestones
  const mRes = await query(
    `SELECT * FROM milestones 
     WHERE project_id = $1 
     ORDER BY order_num ASC`,
    [project.id]
  );

  // Updates
  const uRes = await query(
    `SELECT * FROM project_updates 
     WHERE project_id = $1 
     ORDER BY created_at DESC`,
    [project.id]
  );

  // Files
  const fRes = await query(
    `SELECT * FROM files 
     WHERE project_id = $1 
     ORDER BY created_at DESC`,
    [project.id]
  );

  // Messages
  const msgRes = await query(
    `SELECT m.id, m.project_id, m.author_id, m.is_staff, m.is_internal,
            m.content, m.attachment_name, m.attachment_size, m.attachment_url, m.created_at,
            CASE 
              WHEN m.is_staff = true THEN m.author_name
              ELSE COALESCE(u.name, owner.name, m.author_name, 'Account Owner')
            END AS author_name,
            CASE 
              WHEN m.is_staff = true THEN COALESCE(m.author_role, 'Solutions Architect')
              ELSE COALESCE(m.author_role, 'Account Owner')
            END AS author_role
     FROM messages m
     LEFT JOIN users u ON u.id = m.author_id
     LEFT JOIN LATERAL (
       SELECT u2.name 
       FROM users u2 
       JOIN memberships mem ON mem.user_id = u2.id 
       WHERE mem.org_id = $2 AND mem.role = 'OWNER' 
       LIMIT 1
     ) owner ON true
     WHERE m.project_id = $1 
     ORDER BY m.created_at ASC`,
    [project.id, orgId]
  );

  return {
    ...project,
    milestones: mRes.rows,
    updates: uRes.rows,
    files: fRes.rows,
    messages: msgRes.rows,
  };
}

// ==========================================
// 3. Invoices
// ==========================================
export async function getPortalInvoices(orgId: string, userId?: string) {
  const res = await query(
    `SELECT 
      i.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', it.id,
            'description', it.description,
            'quantity', it.quantity,
            'unit_price_kes', it.unit_price_kes,
            'unit_price_usd', it.unit_price_usd
          ) ORDER BY it.order_num ASC
        ) FILTER (WHERE it.id IS NOT NULL), '[]'
      ) AS items
     FROM invoices i
     LEFT JOIN invoice_items it ON it.invoice_id = i.id
     WHERE i.org_id = $1 OR ($2::text IS NOT NULL AND i.org_id IN (SELECT org_id FROM memberships WHERE user_id = $2::uuid))
     GROUP BY i.id
     ORDER BY i.issue_date DESC`,
    [orgId, userId || null]
  );

  return res.rows;
}

export async function getPortalInvoiceDetail(orgId: string, invoiceId: string, isStaff: boolean = false) {
  const res = await query(
    `SELECT 
      i.*,
      o.name AS org_name,
      o.billing_email,
      o.tax_pin,
      o.address AS org_address,
      COALESCE(
        json_agg(
          json_build_object(
            'id', it.id,
            'description', it.description,
            'quantity', it.quantity,
            'unit_price_kes', it.unit_price_kes,
            'unit_price_usd', it.unit_price_usd
          ) ORDER BY it.order_num ASC
        ) FILTER (WHERE it.id IS NOT NULL), '[]'
      ) AS items
     FROM invoices i
     INNER JOIN organizations o ON o.id = i.org_id
     LEFT JOIN invoice_items it ON it.invoice_id = i.id
     WHERE i.id = $1 AND ($2 = true OR i.org_id = $3)
     GROUP BY i.id, o.id`,
    [invoiceId, isStaff, orgId]
  );

  return res.rows[0] || null;
}

// ==========================================
// 4. Support Tickets
// ==========================================
export async function getPortalSupportTickets(orgId: string) {
  const res = await query(
    `SELECT 
      t.*,
      COUNT(r.id)::int AS reply_count,
      MAX(r.created_at) AS last_reply_at
     FROM support_tickets t
     LEFT JOIN ticket_replies r ON r.ticket_id = t.id
     WHERE t.org_id = $1
     GROUP BY t.id
     ORDER BY t.updated_at DESC`,
    [orgId]
  );

  return res.rows;
}

export async function getPortalTicketDetail(orgId: string, ticketIdOrNum: string, isStaff: boolean = false) {
  const tRes = await query(
    `SELECT * FROM support_tickets 
     WHERE (id::text = $1 OR ticket_number = $1)
     AND ($2 = true OR org_id = $3)`,
    [ticketIdOrNum, isStaff, orgId]
  );

  if (tRes.rowCount === 0) return null;
  const ticket = tRes.rows[0];

  const rRes = await query(
    `SELECT r.*,
            COALESCE(r.message, r.content, '') AS message,
            COALESCE(r.content, r.message, '') AS content,
            t.subject AS ticket_subject,
            CASE 
              WHEN r.is_staff = true THEN r.author_name
              ELSE COALESCE(u.name, owner.name, r.author_name, 'Account Owner')
            END AS author_name,
            CASE
              WHEN r.is_staff = true THEN
                CASE
                  WHEN u.staff_role = 'ADMIN' THEN 'Staff Admin'
                  WHEN u.staff_role = 'SUPPORT' THEN 'Support Engineer'
                  WHEN u.staff_role = 'MANAGER' THEN 'Support Manager'
                  WHEN u.staff_role IS NOT NULL THEN u.staff_role
                  WHEN r.author_role IS NOT NULL AND r.author_role <> 'STAFF' THEN r.author_role
                  ELSE 'Support Staff'
                END
              ELSE
                CASE
                  WHEN mem.role = 'OWNER' THEN 'Client Owner'
                  WHEN mem.role = 'MEMBER' THEN 'Client Member'
                  WHEN r.author_role IS NOT NULL AND r.author_role <> 'STAFF' THEN r.author_role
                  ELSE 'Client'
                END
            END AS author_role
     FROM ticket_replies r
     LEFT JOIN support_tickets t ON t.id = r.ticket_id
     LEFT JOIN users u ON u.id = r.author_id
     LEFT JOIN memberships mem ON mem.user_id = u.id AND mem.org_id = t.org_id
     LEFT JOIN LATERAL (
       SELECT u2.name 
       FROM users u2 
       JOIN memberships mem2 ON mem2.user_id = u2.id 
       WHERE mem2.org_id = $2 AND mem2.role = 'OWNER' 
       LIMIT 1
     ) owner ON true
     WHERE r.ticket_id = $1 
     ORDER BY r.created_at ASC`,
    [ticket.id, orgId]
  );

  return {
    ...ticket,
    replies: rRes.rows,
  };
}

// ==========================================
// 5. Files
// ==========================================
export async function getPortalFiles(orgId: string) {
  const res = await query(
    `SELECT f.*, p.title AS project_title
     FROM files f
     LEFT JOIN projects p ON p.id = f.project_id
     WHERE f.org_id = $1
     ORDER BY f.created_at DESC`,
    [orgId]
  );

  return res.rows;
}

// ==========================================
// 6. Messages
// ==========================================
export async function getPortalMessages(orgId: string, projectId?: string) {
  if (projectId) {
    const res = await query(
      `SELECT m.id, m.project_id, m.author_id, m.is_staff, m.is_internal,
              m.content, m.attachment_name, m.attachment_size, m.attachment_url, m.created_at,
              CASE 
                WHEN m.is_staff = true THEN m.author_name
                ELSE COALESCE(u.name, owner.name, m.author_name, 'Account Owner')
              END AS author_name,
              CASE 
                WHEN m.is_staff = true THEN COALESCE(m.author_role, 'Solutions Architect')
                ELSE COALESCE(m.author_role, 'Account Owner')
              END AS author_role,
              p.title AS project_title
       FROM messages m
       INNER JOIN projects p ON p.id = m.project_id
       LEFT JOIN users u ON u.id = m.author_id
       LEFT JOIN LATERAL (
         SELECT u2.name 
         FROM users u2 
         JOIN memberships mem ON mem.user_id = u2.id 
         WHERE mem.org_id = p.org_id AND mem.role = 'OWNER' 
         LIMIT 1
       ) owner ON true
       WHERE p.org_id = $1 AND p.id = $2
       ORDER BY m.created_at ASC`,
      [orgId, projectId]
    );
    return res.rows;
  }

  const res = await query(
    `SELECT m.id, m.project_id, m.author_id, m.is_staff, m.is_internal,
            m.content, m.attachment_name, m.attachment_size, m.attachment_url, m.created_at,
            CASE 
              WHEN m.is_staff = true THEN m.author_name
              ELSE COALESCE(u.name, owner.name, m.author_name, 'Account Owner')
            END AS author_name,
            CASE 
              WHEN m.is_staff = true THEN COALESCE(m.author_role, 'Solutions Architect')
              ELSE COALESCE(m.author_role, 'Account Owner')
            END AS author_role,
            p.title AS project_title
     FROM messages m
     INNER JOIN projects p ON p.id = m.project_id
     LEFT JOIN users u ON u.id = m.author_id
     LEFT JOIN LATERAL (
       SELECT u2.name 
       FROM users u2 
       JOIN memberships mem ON mem.user_id = u2.id 
       WHERE mem.org_id = p.org_id AND mem.role = 'OWNER' 
       LIMIT 1
     ) owner ON true
     WHERE p.org_id = $1
     ORDER BY m.created_at ASC`,
    [orgId]
  );
  return res.rows;
}

// ==========================================
// 7. Notifications
// ==========================================
export async function getPortalNotifications(orgId: string, userId: string) {
  const res = await query(
    `SELECT * FROM notifications 
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );

  return res.rows;
}

// ==========================================
// 8. Organization & Account Data
// ==========================================
export async function getPortalOrganization(orgId: string) {
  const res = await query(
    `SELECT id, name, billing_email, tax_pin, address, country, currency, created_at, updated_at
     FROM organizations
     WHERE id = $1`,
    [orgId]
  );
  return res.rows[0] || null;
}

export async function getPortalTeamMembers(orgId: string) {
  const membersRes = await query(
    `SELECT
       u.id, u.name, u.email, u.phone, m.role, m.created_at,
       u.active, u.accepted_at, u.last_login_at, u.invited_at, u.last_access_email_at
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     WHERE m.org_id = $1
     ORDER BY m.created_at ASC`,
    [orgId]
  );

  const invitesRes = await query(
    `SELECT 
       id, email, role, 'INVITED' AS status, created_at, expires_at
     FROM invites
     WHERE org_id = $1 AND accepted_at IS NULL
     ORDER BY created_at ASC`,
    [orgId]
  );

  const members = membersRes.rows.map((m: any) => {
    const s = accessStatus(m);
    const status = s === "NOT_INVITED" ? "INVITED" : s; // ACTIVE | INVITED | EXPIRED | DISABLED
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      title: m.role === "OWNER" ? "Authorized Director & Owner" : "Technical Lead / Collaborator",
      status,
      joinedAt:
        status === "ACTIVE"
          ? new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Pending acceptance",
      isOwner: m.role === "OWNER",
    };
  });

  const invites = invitesRes.rows.map((inv: any) => ({
    id: inv.id,
    name: inv.email.split("@")[0].replace(".", " "),
    email: inv.email,
    role: inv.role,
    title: "Pending Invitation",
    status: "INVITED",
    joinedAt: "Pending acceptance",
    isOwner: false,
  }));

  return [...members, ...invites];
}

export async function getPortalNotificationPreferences(userId: string) {
  const res = await query(
    `SELECT email_messages, email_updates, email_invoices, email_tickets
     FROM notification_preferences
     WHERE user_id = $1`,
    [userId]
  );
  if (res.rowCount === 0) {
    return {
      emailMessages: true,
      emailUpdates: true,
      emailInvoices: true,
      emailTickets: true,
    };
  }
  const row = res.rows[0];
  return {
    emailMessages: row.email_messages,
    emailUpdates: row.email_updates,
    emailInvoices: row.email_invoices,
    emailTickets: row.email_tickets,
  };
}

