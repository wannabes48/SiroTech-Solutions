import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { requireStaffUser, logAdminAudit } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import JSZip from "jszip";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId parameter" }, { status: 400 });
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Load the privacy request
    const reqRes = await query("SELECT * FROM privacy_requests WHERE id = $1", [requestId]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: "Privacy request not found" }, { status: 404 });
    }
    const privReq = reqRes.rows[0];

    // Authorization check: Must be staff OR the user requesting their own export
    const isStaff = sessionUser.role === "STAFF" || sessionUser.role === "ADMIN";
    const isOwnerOfRequest = sessionUser.email.toLowerCase() === privReq.email.toLowerCase() || sessionUser.id === privReq.user_id;

    if (!isStaff && !isOwnerOfRequest) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to download this export package" }, { status: 403 });
    }

    const email = privReq.email.toLowerCase();
    const userId = privReq.user_id;

    // 1. Fetch User Profile
    const userRes = await query(
      `SELECT id, name, email, role, phone, timezone, last_login_at, created_at, updated_at
       FROM users
       WHERE LOWER(email) = $1 OR ($2::text IS NOT NULL AND id = $2::uuid)
       LIMIT 1`,
      [email, userId || null]
    );
    const userData = userRes.rows[0] || { email, status: "UNREGISTERED_INQUIRER" };
    const matchedUserId = userData.id || userId;

    // 2. Notification Preferences
    let notifPrefs: any = null;
    if (matchedUserId) {
      const prefsRes = await query(
        "SELECT * FROM notification_preferences WHERE user_id = $1",
        [matchedUserId]
      ).catch(() => ({ rows: [] }));
      notifPrefs = prefsRes.rows[0] || null;
    }

    // 3. Organization & Memberships
    let orgData: any[] = [];
    if (matchedUserId) {
      const orgRes = await query(
        `SELECT o.id, o.name, o.billing_email, o.tax_pin, o.address, o.country, o.currency, m.role AS membership_role, m.created_at AS joined_at
         FROM memberships m
         INNER JOIN organizations o ON o.id = m.org_id
         WHERE m.user_id = $1`,
        [matchedUserId]
      ).catch(() => ({ rows: [] }));
      orgData = orgRes.rows;
    }

    // 4. Support Tickets and Replies
    let ticketsData: any[] = [];
    if (matchedUserId || email) {
      const ticketsRes = await query(
        `SELECT t.id, t.ticket_number, t.project_title, t.subject, t.category, t.priority, t.status, t.created_at, t.updated_at
         FROM support_tickets t
         WHERE t.org_id IN (SELECT org_id FROM memberships WHERE user_id = $1)
            OR LOWER(t.subject) LIKE '%' || $2 || '%'`,
        [matchedUserId || "00000000-0000-0000-0000-000000000000", email]
      ).catch(() => ({ rows: [] }));

      const repliesRes = await query(
        `SELECT r.ticket_id, r.author_name, r.author_role, r.is_staff, r.content, r.attachment_name, r.created_at
         FROM ticket_replies r
         WHERE r.author_id = $1 OR LOWER(r.author_name) = LOWER($2)`,
        [matchedUserId || "00000000-0000-0000-0000-000000000000", userData.name || email]
      ).catch(() => ({ rows: [] }));

      ticketsData = ticketsRes.rows.map((t: any) => ({
        ...t,
        myReplies: repliesRes.rows.filter((r: any) => r.ticket_id === t.id)
      }));
    }

    // 5. Communications & Project Messages
    let messagesData: any[] = [];
    if (matchedUserId) {
      const msgRes = await query(
        `SELECT m.id, p.title AS project_title, m.author_name, m.author_role, m.content, m.attachment_name, m.created_at
         FROM messages m
         LEFT JOIN projects p ON p.id = m.project_id
         WHERE m.author_id = $1
         ORDER BY m.created_at ASC`,
        [matchedUserId]
      ).catch(() => ({ rows: [] }));
      messagesData = msgRes.rows;
    }

    // 6. Security & Activity Audit Trail
    let auditData: any[] = [];
    if (matchedUserId || email) {
      const auditRes = await query(
        `SELECT id, action, entity, entity_id, ip_address, user_agent, metadata, created_at
         FROM audit_logs
         WHERE user_id = $1 OR (metadata->>'email' = $2)
         ORDER BY created_at DESC
         LIMIT 500`,
        [matchedUserId || "00000000-0000-0000-0000-000000000000", email]
      ).catch(() => ({ rows: [] }));
      auditData = auditRes.rows;
    }

    // 7. Statutory Financial Records (Invoices & Payments)
    let financialData: any = { invoices: [], payments: [] };
    if (orgData.length > 0) {
      const orgIds = orgData.map((o) => o.id);
      const invRes = await query(
        `SELECT inv.id, inv.invoice_number, inv.issue_date, inv.due_date, inv.amount_kes, inv.amount_usd, inv.status, inv.paid_at, inv.payment_reference
         FROM invoices inv
         WHERE inv.org_id = ANY($1::uuid[])
         ORDER BY inv.issue_date DESC`,
        [orgIds]
      ).catch(() => ({ rows: [] }));

      const payRes = await query(
        `SELECT pay.id, pay.invoice_id, pay.amount_kes, pay.amount_usd, pay.method, pay.reference, pay.receipt_number, pay.status, pay.created_at
         FROM payments pay
         WHERE pay.org_id = ANY($1::uuid[])
         ORDER BY pay.created_at DESC`,
        [orgIds]
      ).catch(() => ({ rows: [] }));

      financialData = {
        invoices: invRes.rows,
        payments: payRes.rows
      };
    }

    // 8. Leads / Public Inquiries
    const leadsRes = await query(
      `SELECT id, name, email, phone, company, service, budget, timeline, status, created_at
       FROM leads
       WHERE LOWER(email) = $1`,
      [email]
    ).catch(() => ({ rows: [] }));

    // 9. Consultations
    const consultRes = await query(
      `SELECT id, name, email, phone, company, scheduled_at, status, cal_booking_id, notes, created_at
       FROM consultations
       WHERE LOWER(email) = $1`,
      [email]
    ).catch(() => ({ rows: [] }));

    // Statutory README Content
    const statutoryNotice = `================================================================================
SIROTECH SOLUTIONS - DATA SUBJECT ACCESS REQUEST (DSAR) EXPORT ARCHIVE
================================================================================
Subject: ${userData.name || "Data Subject"} <${email}>
Request Reference: ${privReq.id}
Generated On: ${new Date().toISOString()}
Compliance Framework: 
- Kenya Data Protection Act (DPA 2019) Sections 25 & 26 (Right of Access & Portability)
- European Union General Data Protection Regulation (GDPR) Article 20

ARCHIVE CONTENTS:
1. 1_profile_and_account.json        - Identity, personal settings, and notification choices.
2. 2_organization_and_roles.json     - Company affiliations and permission assignments.
3. 3_support_tickets_and_replies.json- Customer service cases and engineering dialogue.
4. 4_project_messages.json           - Communications and sprint messages authored.
5. 5_audit_activity_trail.json       - Immutable security and access activity trail.
6. 6_financial_records_summary.json  - Invoices and settlement transactions.
7. 7_inbound_inquiries_and_leads.json- Discovery inquiries and consultation bookings.

STATUTORY RETENTION NOTICE REGARDING FINANCIAL RECORDS:
Pursuant to Section 23 of the Kenya Tax Procedures Act (2015) and statutory commercial 
regulations, books of account, VAT records, invoices, and verified payment transactions 
are legally required to be maintained for a mandatory period of not less than seven (7) years. 
Accordingly, while personal marketing and profiling content may be redacted or erased upon request, 
auditable financial records are retained to satisfy statutory tax obligations. 
(Confirm with your accountant or legal counsel regarding specific jurisdiction requirements).

For questions regarding this export archive, please contact our Data Protection Office:
Email: privacy@sirotech.co.ke | legal@sirotech.co.ke
SiroTech Solutions Limited, Nairobi, Kenya
================================================================================`;

    // 10. Build the ZIP Archive using JSZip
    const zip = new JSZip();
    zip.file("README_STATUTORY_DISCLOSURE.txt", statutoryNotice);
    zip.file("1_profile_and_account.json", JSON.stringify({ user: userData, notificationPreferences: notifPrefs }, null, 2));
    zip.file("2_organization_and_roles.json", JSON.stringify(orgData, null, 2));
    zip.file("3_support_tickets_and_replies.json", JSON.stringify(ticketsData, null, 2));
    zip.file("4_project_messages.json", JSON.stringify(messagesData, null, 2));
    zip.file("5_audit_activity_trail.json", JSON.stringify(auditData, null, 2));
    zip.file("6_financial_records_summary.json", JSON.stringify(financialData, null, 2));
    zip.file("7_inbound_inquiries_and_leads.json", JSON.stringify({ leads: leadsRes.rows, consultations: consultRes.rows }, null, 2));

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    // 11. Update request status to COMPLETED if not already
    const staffName = isStaff ? sessionUser.name : "Automated Self-Service Export";
    const staffId = isStaff ? sessionUser.id : null;

    await query(
      `UPDATE privacy_requests 
       SET status = 'COMPLETED',
           completed_at = COALESCE(completed_at, NOW()),
           completed_by_id = COALESCE(completed_by_id, $1),
           completed_by_name = COALESCE(completed_by_name, $2),
           statutory_retention_notice = 'Complete personal dataset archive built and delivered in ZIP format.'
       WHERE id = $3`,
      [staffId, staffName, requestId]
    );

    // 12. Centralized Audit Log
    await logAdminAudit({
      userId: sessionUser.id,
      userName: sessionUser.name,
      action: "PRIVACY_EXPORT_ZIP_GENERATED",
      entity: "privacy_request",
      entityId: requestId,
      metadata: {
        email,
        archiveSizeKb: Math.round(zipBuffer.length / 1024),
        includedEntities: ["profile", "organization", "tickets", "messages", "audit", "financials", "leads"]
      }
    });

    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `sirotech_data_export_${safeEmail}_${dateStr}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Length": String(zipBuffer.length)
      }
    });
  } catch (error: any) {
    console.error("[Privacy Export ZIP Error]", error);
    return NextResponse.json({ error: "Failed to generate data export ZIP package" }, { status: 500 });
  }
}
