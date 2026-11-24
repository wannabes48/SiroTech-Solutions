"use server";

import { portalPath, portalUrl } from "@/lib/hosts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { query, withTransaction } from "@/lib/db";
import {
  clearSession,
  getSessionUser,
  requireUser,
  requireOrgScope,
  logAudit,
} from "@/lib/auth-server";
import {
  notifyClientUsers,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";

// ==========================================
// 1. Authentication Actions
// ==========================================

// Sign-in, sign-up, links and codes live in app/(auth)/actions.ts (Supabase Auth).
export async function signOutAction() {
  const user = await getSessionUser();
  if (user) {
    await logAudit(user.orgId, user.id, "AUTH_LOGOUT", "USER", user.id);
  }
  await clearSession();
  redirect("/sign-in");
}

// ==========================================
// 2. Milestone Approvals & Changes
// ==========================================

export async function approveMilestoneAction(milestoneId: string) {
  const user = await requireUser();

  try {
    const res = await query(
      `SELECT m.id, m.project_id, p.org_id, p.title as project_title
       FROM milestones m
       INNER JOIN projects p ON p.id = m.project_id
       WHERE m.id = $1`,
      [milestoneId]
    );

    if (res.rowCount === 0) {
      return { error: "Milestone not found." };
    }

    const { project_id: projectId, org_id: orgId } = res.rows[0];
    await requireOrgScope(orgId);

    // Update milestone to APPROVED
    await query(
      `UPDATE milestones 
       SET status = 'APPROVED', approved_by_id = $1, approved_at = NOW(), feedback = null
       WHERE id = $2`,
      [user.id, milestoneId]
    );

    // Recalculate project progress = (approved milestones / total milestones) * 100
    const countRes = await query(
      `SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::int AS approved
       FROM milestones
       WHERE project_id = $1`,
      [projectId]
    );

    const total = countRes.rows[0].total || 1;
    const approved = countRes.rows[0].approved || 0;
    const progress = Math.round((approved / total) * 100);

    await query("UPDATE projects SET progress = $1 WHERE id = $2", [progress, projectId]);

    // Audit log & notification
    await logAudit(orgId, user.id, "MILESTONE_APPROVED", "MILESTONE", milestoneId, {
      projectId,
      newProgress: progress,
    });

    await notifyClientUsers(orgId, {
      type: "MILESTONE",
      title: "Milestone Approved",
      description: `${user.name} approved milestone. Project progress is now ${progress}%.`,
      targetHref: portalPath(`/projects/${projectId}`),
    });

    revalidatePath("/portal");
    revalidatePath(`/portal/projects/${projectId}`);
    return { success: true, progress };
  } catch (err: any) {
    console.error("[approveMilestoneAction Error]", err);
    return { error: err.message || "Failed to approve milestone." };
  }
}

export async function requestChangesAction(milestoneId: string, feedback: string) {
  const user = await requireUser();

  if (!feedback || feedback.trim().length < 10) {
    return { error: "Please provide a detailed explanation (at least 10 characters) explaining the changes needed." };
  }

  try {
    const res = await query(
      `SELECT m.id, m.project_id, p.org_id, m.title
       FROM milestones m
       INNER JOIN projects p ON p.id = m.project_id
       WHERE m.id = $1`,
      [milestoneId]
    );

    if (res.rowCount === 0) {
      return { error: "Milestone not found." };
    }

    const { project_id: projectId, org_id: orgId, title } = res.rows[0];
    await requireOrgScope(orgId);

    await query(
      `UPDATE milestones 
       SET status = 'CHANGES_REQUESTED', feedback = $1, approved_by_id = null, approved_at = null
       WHERE id = $2`,
      [feedback.trim(), milestoneId]
    );

    await logAudit(orgId, user.id, "MILESTONE_CHANGES_REQUESTED", "MILESTONE", milestoneId, {
      projectId,
      feedback: feedback.trim(),
    });

    await notifyClientUsers(orgId, {
      type: "MILESTONE",
      title: "Changes Requested on Milestone",
      description: `${user.name} requested changes on "${title}": ${feedback.slice(0, 100)}...`,
      targetHref: portalPath(`/projects/${projectId}`),
    });

    revalidatePath("/portal");
    revalidatePath(`/portal/projects/${projectId}`);
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/admin/projects");
    return { success: true };
  } catch (err: any) {
    console.error("[requestChangesAction Error]", err);
    return { error: err.message || "Failed to submit change request." };
  }
}

// ==========================================
// 3. Messaging Server Action
// ==========================================

export async function sendMessageAction(
  projectId: string,
  content: string,
  attachmentName?: string,
  attachmentSize?: string,
  attachmentUrl?: string
) {
  const user = await requireUser();

  if (!content || !content.trim()) {
    return { error: "Message content cannot be empty." };
  }

  try {
    const pRes = await query("SELECT org_id FROM projects WHERE id = $1", [projectId]);
    if (pRes.rowCount === 0) {
      return { error: "Project not found." };
    }
    const orgId = pRes.rows[0].org_id;
    await requireOrgScope(orgId);

    const isStaff = user.role === "STAFF" || user.role === "ADMIN";
    const authorRole = isStaff ? "Lead Solutions Architect" : "Client Operations";

    const insertRes = await query(
      `INSERT INTO messages (project_id, author_id, author_name, author_role, is_staff, content, attachment_name, attachment_size, attachment_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [
        projectId,
        user.id,
        user.name,
        authorRole,
        isStaff,
        content.trim(),
        attachmentName || null,
        attachmentSize || null,
        attachmentUrl || null,
      ]
    );

    // Create Notification for colleagues in the org (excluding sender)
    await notifyClientUsers(orgId, {
      type: "MESSAGE",
      title: "New Project Message",
      description: `${user.name}: "${content.slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
      targetHref: portalPath("/messages"),
    }, user.id);

    revalidatePath("/portal/messages");
    revalidatePath(`/portal/projects/${projectId}`);
    revalidatePath("/admin/messages");
    return { success: true, messageId: insertRes.rows[0].id };
  } catch (err: any) {
    console.error("[sendMessageAction Error]", err);
    return { error: err.message || "Failed to send message." };
  }
}

// ==========================================
// 4. Support Tickets Server Actions
// ==========================================

export async function createTicketAction(formData: FormData) {
  const user = await requireUser();
  const subject = (formData.get("subject") as string)?.trim();
  const category = (formData.get("category") as string) || "QUESTION";
  const priority = (formData.get("priority") as string) || "NORMAL";
  const message = (formData.get("message") as string)?.trim();
  const projectId = (formData.get("projectId") as string) || null;

  if (!subject || subject.length < 5) {
    return { error: "Ticket subject must be at least 5 characters long." };
  }

  if (!message || message.length < 15) {
    return { error: "Please provide a detailed description (at least 15 characters) of the issue." };
  }

  try {
    const ticketNum = `ST-${Math.floor(100 + Math.random() * 900)}`;

    const ticketRes = await withTransaction(async (client) => {
      const t = await client.query(
        `INSERT INTO support_tickets (ticket_number, org_id, project_id, subject, category, priority, status, assignee_name)
         VALUES ($1, $2, $3, $4, $5, $6, 'OPEN', 'Daniel Siro')
         RETURNING id, ticket_number`,
        [ticketNum, user.orgId, projectId, subject, category, priority]
      );
      const newTicketId = t.rows[0].id;

      await client.query(
        `INSERT INTO ticket_replies (ticket_id, author_id, author_name, author_role, is_staff, content, message)
         VALUES ($1, $2, $3, 'Client', false, $4, $4)`,
        [newTicketId, user.id, user.name, message]
      );

      return t.rows[0];
    });

    await logAudit(user.orgId, user.id, "TICKET_CREATED", "SUPPORT_TICKET", ticketRes.id, {
      subject,
      priority,
    });

    // Route to the right side of the team and tell them.
    const { routeNewTicket } = await import("@/lib/ticket-routing");
    const assignee = await routeNewTicket(ticketRes.id, category);
    if (assignee) {
      const { notifyUser } = await import("@/lib/notifications");
      const { adminPath } = await import("@/lib/hosts");
      await notifyUser(assignee.id, user.orgId, {
        type: "TICKET",
        title: `New ticket ${ticketRes.ticket_number}: ${subject}`.slice(0, 250),
        description: `${user.name} (${user.orgName}) opened a ${category.toLowerCase().replace("_", " ")} ticket. It's assigned to you.`,
        targetHref: adminPath(`/support/${ticketRes.id}`),
      });
    }

    revalidatePath("/portal/support");
    return { success: true, ticketNumber: ticketRes.ticket_number };
  } catch (err: any) {
    console.error("[createTicketAction Error]", err);
    return { error: err.message || "Failed to create support ticket." };
  }
}

export async function replyTicketAction(ticketId: string, content: string) {
  const user = await requireUser();

  if (!content || !content.trim()) {
    return { error: "Reply cannot be empty." };
  }

  try {
    const tRes = await query("SELECT org_id FROM support_tickets WHERE id = $1", [ticketId]);
    if (tRes.rowCount === 0) return { error: "Ticket not found." };
    await requireOrgScope(tRes.rows[0].org_id);

    const isStaff = user.role === "STAFF" || user.role === "ADMIN";
    const authorRole = isStaff ? "Support Staff" : "Client";

    await query(
      `INSERT INTO ticket_replies (ticket_id, author_id, author_name, author_role, is_staff, content, message)
       VALUES ($1, $2, $3, $4, $5, $6, $6)`,
      [ticketId, user.id, user.name, authorRole, isStaff, content.trim()]
    );

    // Update status: If staff replies -> WAITING_ON_CLIENT; if client replies -> IN_PROGRESS
    const newStatus = isStaff ? "WAITING_ON_CLIENT" : "IN_PROGRESS";
    await query("UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2", [
      newStatus,
      ticketId,
    ]);

    revalidatePath("/portal/support");
    return { success: true };
  } catch (err: any) {
    console.error("[replyTicketAction Error]", err);
    return { error: err.message || "Failed to post reply." };
  }
}

export async function resolveTicketAction(ticketId: string) {
  const user = await requireUser();
  try {
    const tRes = await query("SELECT org_id FROM support_tickets WHERE id = $1", [ticketId]);
    if (tRes.rowCount === 0) return { error: "Ticket not found." };
    await requireOrgScope(tRes.rows[0].org_id);

    await query("UPDATE support_tickets SET status = 'RESOLVED', updated_at = NOW() WHERE id = $1", [ticketId]);
    await logAudit(tRes.rows[0].org_id, user.id, "TICKET_RESOLVED", "SUPPORT_TICKET", ticketId);

    revalidatePath("/portal/support");
    return { success: true };
  } catch (err: any) {
    console.error("[resolveTicketAction Error]", err);
    return { error: err.message || "Failed to resolve ticket." };
  }
}

// ==========================================
// 5. Contract & Proposal Acceptance
// ==========================================

export async function acceptProposalAction(proposalId: string, agreed: boolean) {
  const user = await requireUser();

  if (!agreed) {
    return { error: "You must check 'I agree' to accept the proposal." };
  }

  try {
    const pRes = await query("SELECT org_id, title, version FROM proposals WHERE id = $1", [proposalId]);
    if (pRes.rowCount === 0) return { error: "Proposal not found." };
    await requireOrgScope(pRes.rows[0].org_id);

    await query(
      "UPDATE proposals SET is_accepted = true, accepted_at = NOW() WHERE id = $1",
      [proposalId]
    );

    await logAudit(pRes.rows[0].org_id, user.id, "PROPOSAL_ACCEPTED", "PROPOSAL", proposalId, {
      title: pRes.rows[0].title,
      version: pRes.rows[0].version,
      legalDisclaimer: "Lightweight client acceptance timestamp recorded.",
    });

    revalidatePath("/portal");
    return { success: true };
  } catch (err: any) {
    console.error("[acceptProposalAction Error]", err);
    return { error: err.message || "Failed to accept agreement." };
  }
}

// ==========================================
// 6. File Upload Confirmation
// ==========================================

export async function confirmFileUploadAction(params: {
  projectId: string;
  name: string;
  size: string;
  kind: "DELIVERABLE" | "DOCUMENT" | "ASSET" | "CONTRACT";
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const user = await requireUser();

  // Validate file: Block executable file types and dangerous extensions
  const blockedExtensions = [".exe", ".bat", ".cmd", ".sh", ".bin", ".msi", ".vbs", ".ps1", ".com"];
  const lowerName = params.name.toLowerCase();
  if (blockedExtensions.some((ext) => lowerName.endsWith(ext))) {
    return { error: "Executable and script files are strictly blocked for security." };
  }

  if (params.sizeBytes > 25 * 1024 * 1024) {
    return { error: "File exceeds the maximum allowed size of 25 MB." };
  }

  try {
    const pRes = await query("SELECT org_id FROM projects WHERE id = $1", [params.projectId]);
    if (pRes.rowCount === 0) return { error: "Project not found." };
    const orgId = pRes.rows[0].org_id;
    await requireOrgScope(orgId);

    const fRes = await query(
      `INSERT INTO files (org_id, project_id, name, size, kind, storage_path, uploaded_by, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        orgId,
        params.projectId,
        params.name,
        params.size,
        params.kind,
        params.storagePath,
        user.name,
        params.mimeType,
        params.sizeBytes,
      ]
    );

    await logAudit(orgId, user.id, "FILE_UPLOADED", "FILE", fRes.rows[0].id, {
      fileName: params.name,
      fileSize: params.size,
    });

    revalidatePath("/portal/files");
    revalidatePath(`/portal/projects/${params.projectId}`);
    return { success: true, fileId: fRes.rows[0].id };
  } catch (err: any) {
    console.error("[confirmFileUploadAction Error]", err);
    return { error: err.message || "Failed to register uploaded file." };
  }
}

// ==========================================
// 7. Payment Processing Action
// ==========================================

export async function processPaymentAction(
  invoiceId: string,
  method: "PAYSTACK" | "BANK",
  reference: string,
  phone?: string
) {
  const user = await requireUser();

  try {
    const invRes = await query(
      "SELECT id, org_id, amount_kes, amount_usd, status FROM invoices WHERE id = $1",
      [invoiceId]
    );

    if (invRes.rowCount === 0) return { error: "Invoice not found." };
    const inv = invRes.rows[0];
    await requireOrgScope(inv.org_id);

    if (inv.status === "PAID") {
      return { error: "Invoice has already been paid." };
    }

    await withTransaction(async (client) => {
      // 1. Record payment
      await client.query(
        `INSERT INTO payments (invoice_id, amount_kes, amount_usd, method, provider_tx_id, phone_number, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED')`,
        [invoiceId, inv.amount_kes, inv.amount_usd, method, reference, phone || null]
      );

      // 2. Mark invoice PAID
      await client.query(
        `UPDATE invoices 
         SET status = 'PAID', paid_at = NOW(), payment_reference = $1, updated_at = NOW()
         WHERE id = $2`,
        [reference, invoiceId]
      );
    });

    await logAudit(inv.org_id, user.id, "INVOICE_PAID", "INVOICE", invoiceId, {
      method,
      reference,
      amountKes: inv.amount_kes,
      amountUsd: inv.amount_usd,
    });

    revalidatePath("/portal");
    revalidatePath("/portal/invoices");
    return { success: true };
  } catch (err: any) {
    console.error("[processPaymentAction Error]", err);
    return { error: err.message || "Payment processing failed." };
  }
}

export async function initializePaystackCheckoutAction(invoiceId: string) {
  const user = await requireUser();

  try {
    const invRes = await query(
      "SELECT id, invoice_number, org_id, amount_kes, amount_usd, status FROM invoices WHERE id = $1",
      [invoiceId]
    );

    if (invRes.rowCount === 0) return { error: "Invoice not found." };
    const inv = invRes.rows[0];
    await requireOrgScope(inv.org_id);

    if (inv.status === "PAID") {
      return { error: "Invoice has already been settled." };
    }

    const { getPaystackConfig, initializePaystackTransaction } = await import("@/lib/paystack");
    const config = await getPaystackConfig();

    const callbackUrl = portalUrl(`/invoices/${invoiceId}`);

    const cleanInvNumber = inv.invoice_number.replace(/[^a-zA-Z0-9]/g, "");
    const reference = `PSTK-INV-${cleanInvNumber}-${Date.now().toString(36).toUpperCase()}`;

    const initResult = await initializePaystackTransaction({
      email: user.email,
      amountKes: Number(inv.amount_kes),
      amountUsd: Number(inv.amount_usd),
      currency: "KES",
      reference,
      callbackUrl,
      metadata: {
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        org_id: inv.org_id,
        user_id: user.id,
        user_name: user.name,
      },
      channels: ["card", "mobile_money", "bank"],
    });

    if (!initResult.success) {
      return { error: initResult.error || "Failed to initialize Paystack checkout." };
    }

    return {
      success: true,
      authorizationUrl: initResult.authorizationUrl,
      accessCode: initResult.accessCode,
      reference: initResult.reference,
      publicKey: config.publicKey,
      isMock: initResult.isMock,
      amountKes: Number(inv.amount_kes),
      email: user.email,
    };
  } catch (err: any) {
    console.error("[initializePaystackCheckoutAction Error]", err);
    return { error: err.message || "Failed to initialize Paystack checkout." };
  }
}

export async function verifyPaystackPaymentAction(invoiceId: string, reference: string) {
  const user = await requireUser();

  try {
    const invRes = await query(
      "SELECT id, invoice_number, org_id, amount_kes, amount_usd, status FROM invoices WHERE id = $1",
      [invoiceId]
    );

    if (invRes.rowCount === 0) return { error: "Invoice not found." };
    const inv = invRes.rows[0];
    await requireOrgScope(inv.org_id);

    if (inv.status === "PAID") {
      return { success: true, message: "Invoice has already been marked as paid." };
    }

    const { verifyPaystackTransaction } = await import("@/lib/paystack");
    const verifyRes = await verifyPaystackTransaction(reference);

    if (!verifyRes.success || verifyRes.status !== "success") {
      return {
        error: verifyRes.error || `Payment verification failed with status: ${verifyRes.status}`,
      };
    }

    const receiptNumber = `RCP-PSTK-${reference.slice(-8)}`;
    const providerTxId = String(verifyRes.rawResponse?.data?.id || verifyRes.reference || reference);

    await withTransaction(async (client) => {
      // 1. Record in payments
      await client.query(
        `INSERT INTO payments (
          invoice_id, org_id, amount_kes, amount_usd, method, provider_tx_id,
          reference, receipt_number, status, gateway_response, notes, created_at
        ) VALUES ($1, $2, $3, $4, 'PAYSTACK', $5, $6, $7, 'SUCCESS', $8, $9, NOW())`,
        [
          inv.id,
          inv.org_id,
          inv.amount_kes,
          inv.amount_usd,
          providerTxId,
          reference,
          receiptNumber,
          JSON.stringify(verifyRes.rawResponse || {}),
          `Settled via Paystack (${verifyRes.channel || "card"}) by ${user.name} (${user.email})`,
        ]
      );

      // 2. Mark invoice PAID
      await client.query(
        `UPDATE invoices 
         SET status = 'PAID', paid_at = COALESCE($1, NOW()), payment_reference = $2, updated_at = NOW() 
         WHERE id = $3`,
        [verifyRes.paidAt ? new Date(verifyRes.paidAt) : new Date(), reference, inv.id]
      );
    });

    await logAudit(inv.org_id, user.id, "INVOICE_PAID", "INVOICE", invoiceId, {
      method: "PAYSTACK",
      reference,
      amountKes: inv.amount_kes,
      channel: verifyRes.channel,
      receiptNumber,
    });

    try {
      await notifyClientUsers(
        inv.org_id,
        {
          type: "PAYMENT",
          title: "Payment Confirmed",
          description: `Payment of KES ${Number(inv.amount_kes).toLocaleString()} for invoice ${inv.invoice_number} successfully verified via Paystack.`,
          targetHref: portalPath(`/invoices/${inv.id}`),
        }
      );
    } catch (notifErr) {
      console.warn("[verifyPaystackPaymentAction Notification Warning]", notifErr);
    }

    revalidatePath("/portal");
    revalidatePath("/portal/invoices");
    revalidatePath(`/portal/invoices/${invoiceId}`);
    revalidatePath("/admin/payments");
    revalidatePath("/admin/invoices");

    return {
      success: true,
      reference,
      receiptNumber,
      channel: verifyRes.channel,
    };
  } catch (err: any) {
    console.error("[verifyPaystackPaymentAction Error]", err);
    return { error: err.message || "Failed to verify Paystack payment." };
  }
}

// ==========================================
// 8. User Profile & Account Actions
// ==========================================

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const timezone = (formData.get("timezone") as string)?.trim() || "Africa/Nairobi";

  if (!name || name.length < 2) {
    return { error: "Full name must be at least 2 characters long." };
  }

  if (!email || !email.includes("@") || !email.includes(".")) {
    return { error: "A valid email address is required." };
  }

  try {
    // Constraint: Check if email changed and if already taken by another account
    if (email !== user.email.toLowerCase()) {
      const dupRes = await query("SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2", [email, user.id]);
      if (dupRes.rowCount && dupRes.rowCount > 0) {
        return { error: "An account with this email address already exists." };
      }
    }

    // Email is the sign-in identity: Supabase confirms the new address first, and the
    // profile email is updated when the person completes that confirmation (completeSignIn).
    let emailChangePending = false;
    if (email !== user.email.toLowerCase()) {
      const { supabaseServer } = await import("@/lib/supabase/server");
      const supabase = await supabaseServer();
      const { error: emailErr } = await supabase.auth.updateUser({ email }, { emailRedirectTo: portalUrl() });
      if (emailErr) return { error: emailErr.message };
      emailChangePending = true;
    }

    await query(
      `UPDATE users 
       SET name = $1, phone = $2, timezone = $3, updated_at = NOW() 
       WHERE id = $4`,
      [name, phone, timezone, user.id]
    );

    // Synchronize active session cookie so TopBar and layouts reflect changes immediately
    const updatedUser = {
      ...user,
      name,
      phone,
      timezone,
    };

    await logAudit(user.orgId, user.id, "USER_PROFILE_UPDATED", "USER", user.id, {
      name,
      email,
      phone,
      timezone,
    });

    revalidatePath("/portal");
    revalidatePath("/portal/account");
    return {
      success: true,
      user: updatedUser,
      ...(emailChangePending ? { message: `Check ${email} and confirm the change. Your sign-in email stays the same until then.` } : {}),
    };
  } catch (err: any) {
    console.error("[updateProfileAction Error]", err);
    return { error: err.message || "Failed to update profile settings." };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const user = await requireUser();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmPassword) {
    return { error: "Please enter and confirm your new password." };
  }
  if (currentPassword && currentPassword === newPassword) {
    return { error: "New password cannot be the same as your current password." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation do not match." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long." };
  }
  if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { error: "New password must contain both letters and numbers." };
  }

  try {
    // Re-check the current password when one is given (accounts created by invite/link may have none yet).
    if (currentPassword) {
      const { supabaseAnon } = await import("@/lib/supabase/admin");
      const { error: checkErr } = await supabaseAnon.auth.signInWithPassword({ email: user.email, password: currentPassword });
      if (checkErr) return { error: "Current password is incorrect." };
    }
    const { supabaseServer } = await import("@/lib/supabase/server");
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    await query("UPDATE users SET password_hash = NULL, updated_at = NOW() WHERE id = $1", [user.id]);

    await logAudit(user.orgId, user.id, "AUTH_PASSWORD_CHANGED", "USER", user.id);
    return { success: true };
  } catch (err: any) {
    console.error("[updatePasswordAction Error]", err);
    return { error: err.message || "Failed to update password." };
  }
}

export async function updateBillingDetailsAction(formData: FormData) {
  const user = await requireUser();
  await requireOrgScope(user.orgId);

  if (user.orgRole !== "OWNER") {
    return { error: "Only organization Owners have permission to modify company billing details." };
  }

  const name = (formData.get("name") as string)?.trim();
  const billingEmail = (formData.get("billingEmail") as string)?.trim().toLowerCase();
  const taxPin = (formData.get("taxPin") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const currency = (formData.get("currency") as string)?.trim() || "KES";

  if (!name || !billingEmail || !taxPin || !address) {
    return { error: "All organization details and tax identification are required." };
  }

  try {
    await query(
      `UPDATE organizations 
       SET name = $1, billing_email = $2, tax_pin = $3, address = $4, currency = $5, updated_at = NOW() 
       WHERE id = $6`,
      [name, billingEmail, taxPin, address, currency, user.orgId]
    );

    await logAudit(user.orgId, user.id, "ORG_BILLING_UPDATED", "ORGANIZATION", user.orgId, {
      name,
      billingEmail,
      taxPin,
      currency,
    });

    revalidatePath("/portal");
    revalidatePath("/portal/account");
    return { success: true };
  } catch (err: any) {
    console.error("[updateBillingDetailsAction Error]", err);
    return { error: err.message || "Failed to save billing details." };
  }
}

export async function updateNotificationPreferencesAction(data: {
  emailMessages: boolean;
  emailUpdates: boolean;
  emailInvoices: boolean;
  emailTickets: boolean;
}) {
  const user = await requireUser();

  try {
    await query(
      `INSERT INTO notification_preferences (user_id, email_messages, email_updates, email_invoices, email_tickets, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         email_messages = EXCLUDED.email_messages,
         email_updates = EXCLUDED.email_updates,
         email_invoices = EXCLUDED.email_invoices,
         email_tickets = EXCLUDED.email_tickets,
         updated_at = NOW()`,
      [user.id, data.emailMessages, data.emailUpdates, data.emailInvoices, data.emailTickets]
    );

    return { success: true };
  } catch (err: any) {
    console.error("[updateNotificationPreferencesAction Error]", err);
    return { error: err.message || "Failed to save notification preferences." };
  }
}

export async function completePortalWelcomeAction(params: {
  name?: string;
  phone?: string;
  timezone?: string;
  notificationPreferences?: {
    emailMessages: boolean;
    emailUpdates: boolean;
    emailInvoices: boolean;
    emailTickets: boolean;
  };
  skipped?: boolean;
}) {
  const user = await requireUser();

  try {
    if (params.skipped) {
      // Mark as completed via skip so it is never shown again
      await query(
        "UPDATE users SET welcome_completed = true, welcome_completed_at = NOW(), updated_at = NOW() WHERE id = $1",
        [user.id]
      );

      const updatedUser = {
        ...user,
        welcomeCompleted: true,
      };

      await logAudit(user.orgId, user.id, "PORTAL_WELCOME_SKIPPED", "USER", user.id, {
        skippedAt: new Date().toISOString(),
      });

      revalidatePath("/portal");
      return { success: true, redirect: portalPath() };
    }

    // Save confirmed profile info
    const name = params.name?.trim() || user.name;
    const phone = params.phone?.trim() || user.phone || null;
    const timezone = params.timezone?.trim() || user.timezone || "Africa/Nairobi";

    await query(
      `UPDATE users 
       SET name = $1, phone = $2, timezone = $3, welcome_completed = true, welcome_completed_at = NOW(), updated_at = NOW() 
       WHERE id = $4`,
      [name, phone, timezone, user.id]
    );

    // Save notification choices if provided
    if (params.notificationPreferences) {
      await query(
        `INSERT INTO notification_preferences (user_id, email_messages, email_updates, email_invoices, email_tickets, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           email_messages = EXCLUDED.email_messages,
           email_updates = EXCLUDED.email_updates,
           email_invoices = EXCLUDED.email_invoices,
           email_tickets = EXCLUDED.email_tickets,
           updated_at = NOW()`,
        [
          user.id,
          params.notificationPreferences.emailMessages,
          params.notificationPreferences.emailUpdates,
          params.notificationPreferences.emailInvoices,
          params.notificationPreferences.emailTickets,
        ]
      );
    }

    const updatedUser = {
      ...user,
      name,
      phone,
      timezone,
      welcomeCompleted: true,
    };

    await logAudit(user.orgId, user.id, "PORTAL_WELCOME_COMPLETED", "USER", user.id, {
      name,
      phone,
      timezone,
      notificationPreferences: params.notificationPreferences,
    });

    revalidatePath("/portal");
    revalidatePath("/portal/account");
    return { success: true, redirect: portalPath() };
  } catch (err: any) {
    console.error("[completePortalWelcomeAction Error]", err);
    return { error: err.message || "Failed to complete workspace onboarding checklist." };
  }
}

export async function inviteTeamMemberAction(formData: FormData) {
  const user = await requireUser();
  await requireOrgScope(user.orgId);

  if (user.orgRole !== "OWNER") {
    return { error: "Only organization Owners can invite colleagues to the workspace." };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string)?.trim() || email?.split("@")[0].replace(/[._-]+/g, " ");
  const title = (formData.get("title") as string)?.trim() || "Operations Specialist";
  const role = (formData.get("role") as string) === "OWNER" ? "OWNER" : "MEMBER";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid colleague email address is required." };
  }

  try {
    const existing = await query<{ id: string; role: string; in_org: boolean }>(
      `SELECT u.id, u.role, EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = u.id AND m.org_id = $2) AS in_org
       FROM users u WHERE LOWER(u.email) = $1`,
      [email, user.orgId]
    );
    const row = existing.rows[0];
    if (row?.in_org) return { error: "This person is already a member of this organization." };
    if (row && row.role !== "CLIENT") return { error: "This email belongs to a SiroTech staff account and can't be invited." };

    // 1. Profile first (role CLIENT + membership), then the access email.
    const profileId =
      row?.id ||
      (
        await query<{ id: string }>(
          `INSERT INTO users (name, email, role, active, invited_by_id) VALUES ($1, $2, 'CLIENT', true, $3) RETURNING id`,
          [name, email, user.id]
        )
      ).rows[0].id;
    await query(
      `INSERT INTO memberships (org_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (org_id, user_id) DO NOTHING`,
      [user.orgId, profileId, role]
    );

    const { sendAccessEmail } = await import("@/lib/access-email");
    const sent = await sendAccessEmail({ email, area: "portal", name, invitedById: user.id });
    await logAudit(user.orgId, user.id, "TEAM_MEMBER_INVITED", "USER", profileId, {
      email,
      role,
      title,
      result: sent.ok ? sent.kind : sent.error,
    });
    revalidatePath("/portal/account");

    const invite = {
      id: profileId,
      email,
      name,
      role,
      title,
      status: "INVITED",
      joinedAt: "Pending acceptance",
    };
    if (!sent.ok) {
      return { invite, error: `Member added, but the email was not sent: ${sent.error}` };
    }
    return { success: true, invite, message: sent.kind === "invite" ? "Invite sent" : "Sign-in link sent" };
  } catch (err: any) {
    console.error("[inviteTeamMemberAction Error]", err);
    return { error: err.message || "Failed to dispatch invitation." };
  }
}

export async function revokeTeamMemberAction(id: string) {
  const user = await requireUser();
  await requireOrgScope(user.orgId);

  if (user.orgRole !== "OWNER") {
    return { error: "Only organization Owners have permission to remove members or revoke invites." };
  }
  if (id === user.id) {
    return { error: "You cannot remove yourself from the organization workspace." };
  }

  try {
    // Legacy pending invite rows (pre-Supabase)
    const invRes = await query(`DELETE FROM invites WHERE id = $1 AND org_id = $2 RETURNING id, email`, [id, user.orgId]);
    if (invRes.rowCount && invRes.rowCount > 0) {
      await logAudit(user.orgId, user.id, "INVITE_REVOKED", "INVITE", id, { email: invRes.rows[0].email });
      revalidatePath("/portal/account");
      return { success: true };
    }

    const memRes = await query(`DELETE FROM memberships WHERE user_id = $1 AND org_id = $2 RETURNING id`, [id, user.orgId]);
    if (!memRes.rowCount) return { error: "Member or invite not found in this organization." };

    // No other organisation left: revoke their access entirely (deletes never-used invites).
    const others = await query("SELECT 1 FROM memberships WHERE user_id = $1 LIMIT 1", [id]);
    if (others.rowCount === 0) {
      const { revokeAccess } = await import("@/lib/access-email");
      await revokeAccess(id, user.id);
    }
    await logAudit(user.orgId, user.id, "MEMBERSHIP_REMOVED", "MEMBERSHIP", memRes.rows[0].id, { userId: id });
    revalidatePath("/portal/account");
    return { success: true };
  } catch (err: any) {
    console.error("[revokeTeamMemberAction Error]", err);
    return { error: err.message || "Failed to remove team member." };
  }
}

export async function resendInviteAction(email: string) {
  const user = await requireUser();
  await requireOrgScope(user.orgId);

  if (user.orgRole !== "OWNER") {
    return { error: "Only organization Owners can manage workspace invites." };
  }

  try {
    const target = await query<{ id: string }>(
      `SELECT u.id FROM users u JOIN memberships m ON m.user_id = u.id
       WHERE m.org_id = $1 AND LOWER(u.email) = $2 AND u.role = 'CLIENT'`,
      [user.orgId, email.toLowerCase()]
    );
    if (!target.rows[0]) return { error: "No member with this email in your organization." };

    const { sendAccessEmail } = await import("@/lib/access-email");
    const sent = await sendAccessEmail({ email, area: "portal", invitedById: user.id });
    if (!sent.ok) return { error: sent.error, retryAfterSeconds: sent.retryAfterSeconds };

    await logAudit(user.orgId, user.id, "INVITE_RESENT", "USER", target.rows[0].id, { email, kind: sent.kind });
    return { success: true, message: sent.kind === "invite" ? "Invite sent" : "Sign-in link sent" };
  } catch (err: any) {
    console.error("[resendInviteAction Error]", err);
    return { error: err.message || "Failed to resend invite." };
  }
}

// ==========================================
// 8. Notification Read Isolation Actions
// ==========================================
export async function markNotificationReadAction(notificationId: string) {
  const user = await requireUser();
  await markNotificationRead(notificationId, user.id);
  revalidatePath("/portal/notifications");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  await markAllNotificationsRead(user.id);
  revalidatePath("/portal/notifications");
  return { success: true };
}

// ==========================================
// 9. Privacy, GDPR & Statutory Portability Actions
// ==========================================
export async function requestDataExportAction(): Promise<{ success?: boolean; error?: string; requestId?: string; message?: string }> {
  try {
    const user = await requireUser();

    // Check for existing pending request
    const existingRes = await query(
      "SELECT id FROM privacy_requests WHERE (user_id = $1 OR LOWER(email) = LOWER($2)) AND type = 'EXPORT' AND status = 'PENDING' LIMIT 1",
      [user.id, user.email]
    );

    if (existingRes.rows.length > 0) {
      return {
        success: true,
        requestId: existingRes.rows[0].id,
        message: "A data export request is already active in the queue. You can download the ZIP archive once compiled."
      };
    }

    const res = await query(
      `INSERT INTO privacy_requests (
         user_id, email, type, status, channel, notes, created_at, target_completion_date
       ) VALUES (
         $1, $2, 'EXPORT', 'PENDING', 'PORTAL', 'Self-service data portability export requested from Client Portal', NOW(), NOW() + INTERVAL '30 days'
       ) RETURNING id`,
      [user.id, user.email.toLowerCase()]
    );

    const newId = res.rows[0]?.id;

    await logAudit(user.orgId, user.id, "PRIVACY_EXPORT_REQUESTED", "PRIVACY_REQUEST", newId, {
      email: user.email,
      statutoryFramework: "Kenya DPA 2019 / GDPR Art 20"
    });

    revalidatePath("/portal/account");
    revalidatePath("/admin/privacy");
    return { success: true, requestId: newId };
  } catch (err: any) {
    console.error("[requestDataExportAction Error]", err);
    return { error: err.message || "Failed to submit data export request." };
  }
}

export async function requestAccountErasureAction(reason?: string): Promise<{ success?: boolean; error?: string; requestId?: string; message?: string }> {
  try {
    const user = await requireUser();

    // Check for existing pending request
    const existingRes = await query(
      "SELECT id FROM privacy_requests WHERE (user_id = $1 OR LOWER(email) = LOWER($2)) AND type = 'ERASURE' AND status = 'PENDING' LIMIT 1",
      [user.id, user.email]
    );

    if (existingRes.rows.length > 0) {
      return {
        success: true,
        requestId: existingRes.rows[0].id,
        message: "An erasure request is already under review by our Data Protection Office."
      };
    }

    const res = await query(
      `INSERT INTO privacy_requests (
         user_id, email, type, status, channel, notes, created_at, target_completion_date
       ) VALUES (
         $1, $2, 'ERASURE', 'PENDING', 'PORTAL', $3, NOW(), NOW() + INTERVAL '30 days'
       ) RETURNING id`,
      [
        user.id,
        user.email.toLowerCase(),
        reason || `Account deletion requested by ${user.name} (${user.email}) from Client Portal.`
      ]
    );

    const newId = res.rows[0]?.id;

    await logAudit(user.orgId, user.id, "PRIVACY_ERASURE_REQUESTED", "PRIVACY_REQUEST", newId, {
      email: user.email,
      reason: reason || "User initiated account deletion",
      notice: "Financial records retained pursuant to Kenya Tax Procedures Act (7-year rule)"
    });

    revalidatePath("/portal/account");
    revalidatePath("/admin/privacy");
    return { success: true, requestId: newId };
  } catch (err: any) {
    console.error("[requestAccountErasureAction Error]", err);
    return { error: err.message || "Failed to submit account erasure request." };
  }
}

export async function getPortalPrivacyRequestsAction(): Promise<{ requests: any[]; error?: string }> {
  try {
    const user = await requireUser();

    const res = await query(
      `SELECT id, type, status, channel, notes, created_at, target_completion_date, completed_at, export_download_url, statutory_retention_notice
       FROM privacy_requests
       WHERE user_id = $1 OR LOWER(email) = LOWER($2)
       ORDER BY created_at DESC
       LIMIT 10`,
      [user.id, user.email]
    );

    return { requests: res.rows };
  } catch (err: any) {
    console.error("[getPortalPrivacyRequestsAction Error]", err);
    return { requests: [], error: err.message };
  }
}



