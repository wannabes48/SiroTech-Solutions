import { mainUrl, portalUrl } from "@/lib/hosts";
import React from "react";
import { EmailLayout } from "./EmailLayout";

// ─── 1. Verify Email ──────────────────────────────────────────────────────────
export function VerifyEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const verifyUrl = data.verify_url || portalUrl("/verify-email");
  const expiresIn = data.expires_in || "24 hours";

  return (
    <EmailLayout
      previewText="Verify your email address to access the SiroTech Client Portal"
      heading="Verify Your Email Address"
      subheading="Welcome to SiroTech Solutions. Complete your registration to access your workspace."
      badge="Account Activation"
      badgeColor="emerald"
      actionLabel="Verify Email Address"
      actionUrl={verifyUrl}
      footerNote={`This verification link is uniquely generated for your account and will expire in ${expiresIn}. If you did not sign up for a SiroTech account, you can safely ignore this email.`}
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            Thank you for creating an account with SiroTech Solutions. To ensure the security of your engineering projects, source code artifacts, and billing deliverables, please verify your email address.
          </p>
          <div style={{ margin: "20px 0", padding: "16px", backgroundColor: "#F7FAF8", borderRadius: "10px", borderLeft: "4px solid #1B2E24" }}>
            <span style={{ fontSize: "12px", color: "#5C6F62", display: "block" }}>ACCOUNT EMAIL</span>
            <strong style={{ fontSize: "14px", color: "#1B2E24" }}>{data.email || "client@company.com"}</strong>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 2. Magic Link ────────────────────────────────────────────────────────────
export function MagicLinkEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const magicLinkUrl = data.magic_link_url || portalUrl("/sign-in");
  const expiresIn = data.expires_in || "15 minutes";
  const device = data.device || "Chrome on macOS";
  const location = data.location || "Nairobi, Kenya";

  return (
    <EmailLayout
      previewText="Your passwordless sign-in link for SiroTech Client Portal"
      heading="Sign In with Magic Link"
      subheading="Click the secure button below to authenticate directly into your client dashboard."
      badge="Passwordless Sign-In"
      badgeColor="blue"
      actionLabel="Sign In to Portal"
      actionUrl={magicLinkUrl}
      footerNote={`This sign-in link expires in ${expiresIn} and can only be used once. If you did not request this link, no action is required.`}
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            We received a request to sign in to your SiroTech Portal account without a password. Click the button below to authenticate instantly:
          </p>
          <div style={{ margin: "20px 0", padding: "16px", backgroundColor: "#F4F8FA", borderRadius: "10px", border: "1px solid #D6E6F0" }}>
            <table width="100%" style={{ fontSize: "12px" }}>
              <tr>
                <td style={{ color: "#667D8C", paddingBottom: "6px" }}>REQUESTED FOR:</td>
                <td align="right"><strong>{data.email || "client@company.com"}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#667D8C", paddingBottom: "6px" }}>DEVICE / BROWSER:</td>
                <td align="right"><strong>{device}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#667D8C" }}>ESTIMATED LOCATION:</td>
                <td align="right"><strong>{location}</strong></td>
              </tr>
            </table>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 3. Reset Password ────────────────────────────────────────────────────────
export function ResetPasswordEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const resetUrl = data.reset_url || portalUrl("/reset-password");
  const expiresIn = data.expires_in || "60 minutes";

  return (
    <EmailLayout
      previewText="Reset your SiroTech account password"
      heading="Password Reset Request"
      subheading="Follow the link below to choose a new password for your account."
      badge="Security Notice"
      badgeColor="amber"
      actionLabel="Reset My Password"
      actionUrl={resetUrl}
      footerNote={`This password reset link expires in ${expiresIn}. If you did not make this request, please contact our security team immediately at security@sirotech.co.ke.`}
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            We received a request to reset the password for your SiroTech portal account. To configure your new password, click the button below:
          </p>
          <div style={{ margin: "20px 0", padding: "16px", backgroundColor: "#FDF9F0", borderRadius: "10px", borderLeft: "4px solid #D9822B" }}>
            <strong style={{ fontSize: "13px", color: "#874D00", display: "block", marginBottom: "4px" }}>
              Didn't request this change?
            </strong>
            <span style={{ fontSize: "12px", color: "#6E502B" }}>
              Your password remains secure. If you suspect unauthorized access, consider enabling Two-Factor Authentication inside your profile settings.
            </span>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 4. Password Changed ──────────────────────────────────────────────────────
export function PasswordChangedEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const time = data.time || new Date().toUTCString();
  const device = data.device || "Unknown browser / device";
  const supportUrl = data.support_url || portalUrl("/support");

  return (
    <EmailLayout
      previewText="Your SiroTech portal password has been changed"
      heading="Password Changed Successfully"
      subheading="This is an automated confirmation that your account password was updated."
      badge="Security Alert"
      badgeColor="rose"
      actionLabel="Open Security Settings"
      actionUrl={supportUrl}
      footerNote="If you performed this action, no further steps are needed. If you did NOT change your password, lock your account immediately and contact security@sirotech.co.ke."
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            The password for your SiroTech portal account was successfully changed. All active sessions other than your current device have been invalidated.
          </p>
          <div style={{ margin: "20px 0", padding: "16px", backgroundColor: "#FDF2F3", borderRadius: "10px", border: "1px solid #F5CCD0" }}>
            <table width="100%" style={{ fontSize: "12px" }}>
              <tr>
                <td style={{ color: "#8E3B46", paddingBottom: "6px" }}>TIMESTAMP:</td>
                <td align="right"><strong>{time}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#8E3B46" }}>DEVICE DETAILS:</td>
                <td align="right"><strong>{device}</strong></td>
              </tr>
            </table>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 5. Portal Invitation ─────────────────────────────────────────────────────
export function InviteEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "colleague";
  const orgName = data["organization.name"] || data.organization_name || "your organization";
  const inviterName = data["inviter.name"] || data.inviter_name || "Your team administrator";
  const role = data.role || "Client Member";
  const inviteUrl = data.invite_url || portalUrl("/invite");
  const expiresIn = data.expires_in || "7 days";

  return (
    <EmailLayout
      previewText={`You've been invited to join ${orgName} on SiroTech Portal`}
      heading="Welcome to the SiroTech Portal"
      subheading={`You have been invited to collaborate with our engineering team on behalf of ${orgName}.`}
      badge="Workspace Invitation"
      badgeColor="emerald"
      actionLabel="Accept Invitation & Set Password"
      actionUrl={inviteUrl}
      footerNote={`This invitation will remain valid for ${expiresIn}. Once accepted, you will have access to project milestones, invoices, and technical tickets.`}
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            <strong>{inviterName}</strong> has added you to <strong>{orgName}</strong> on the SiroTech Client Portal. Through this portal, you can monitor sprint delivery, review milestone approvals, manage invoices, and communicate with dedicated software engineers.
          </p>
          <div style={{ margin: "20px 0", padding: "16px", backgroundColor: "#F7FAF8", borderRadius: "10px", borderLeft: "4px solid #1B2E24" }}>
            <table width="100%" style={{ fontSize: "12px" }}>
              <tr>
                <td style={{ color: "#5C6F62", paddingBottom: "6px" }}>ORGANIZATION:</td>
                <td align="right"><strong>{orgName}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#5C6F62" }}>ASSIGNED ROLE:</td>
                <td align="right"><strong>{role}</strong></td>
              </tr>
            </table>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 6. New Message ───────────────────────────────────────────────────────────
export function NewMessageEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const senderName = data["sender.name"] || data.sender_name || "Engineering Team";
  const projectName = data["project.name"] || data.project_name || "Active Project";
  const preview = data["message.preview"] || data.message_preview || "We have pushed the latest updates to staging for your review...";
  const messageUrl = data.message_url || portalUrl("/messages");

  return (
    <EmailLayout
      previewText={`New message from ${senderName} regarding ${projectName}`}
      heading={`New Message: ${projectName}`}
      subheading={`${senderName} posted an update on your project message board.`}
      badge="Portal Message"
      badgeColor="blue"
      actionLabel="View &amp; Reply in Portal"
      actionUrl={messageUrl}
      footerNote="To preserve conversation context and technical audit trails, please submit your replies directly through the client portal."
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            You have received a new message from <strong>{senderName}</strong> concerning <strong>{projectName}</strong>:
          </p>
          <div style={{ margin: "20px 0", padding: "18px", backgroundColor: "#F9FAF9", borderRadius: "12px", border: "1px solid #E5ECE7", fontStyle: "italic", color: "#3B4D41" }}>
            &ldquo;{preview}&rdquo;
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 7. Milestone Awaiting Approval ───────────────────────────────────────────
export function MilestoneApprovalEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const milestoneTitle = data["milestone.title"] || data.milestone_title || "Milestone 1: Architecture & Auth";
  const projectName = data["project.name"] || data.project_name || "Enterprise SaaS Platform";
  const deliverables = data["milestone.deliverables"] || data.milestone_deliverables || "Core database schema, Next.js authentication flows, and API tests.";
  const approvalUrl = data.approval_url || portalUrl("/milestones");
  const dueDate = data.due_date || "3 business days";

  return (
    <EmailLayout
      previewText={`Milestone Ready for Review: ${milestoneTitle} (${projectName})`}
      heading="Milestone Ready for Approval"
      subheading="Engineering deliverables for this sprint have completed QA and await client acceptance."
      badge="Action Required"
      badgeColor="amber"
      actionLabel="Review &amp; Approve Milestone"
      actionUrl={approvalUrl}
      footerNote={`Your timely feedback helps maintain sprint velocity. Please complete your review within ${dueDate}.`}
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            Our engineering team has marked <strong>{milestoneTitle}</strong> for <strong>{projectName}</strong> as complete. Please inspect the deployed demo artifacts and verify acceptance criteria:
          </p>
          <div style={{ margin: "20px 0", padding: "18px", backgroundColor: "#FCFAF6", borderRadius: "12px", border: "1px solid #EFE4D2" }}>
            <table width="100%" style={{ fontSize: "12px" }}>
              <tr>
                <td style={{ color: "#7B6240", paddingBottom: "8px" }}>PROJECT:</td>
                <td align="right"><strong>{projectName}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#7B6240", paddingBottom: "8px" }}>MILESTONE:</td>
                <td align="right"><strong>{milestoneTitle}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#7B6240", verticalAlign: "top" }}>DELIVERABLES:</td>
                <td align="right" style={{ maxWidth: "260px" }}><strong>{deliverables}</strong></td>
              </tr>
            </table>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 8. Invoice Issued ────────────────────────────────────────────────────────
export function InvoiceIssuedEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const invoiceNumber = data["invoice.number"] || data.invoice_number || "INV-2026-0042";
  const amount = data["invoice.amount"] || data.amount || "KSh 85,000";
  const dueDate = data["invoice.due_date"] || data.due_date || "October 30, 2026";
  const payUrl = data["invoice.pay_url"] || data.pay_url || portalUrl("/invoices");
  const projectName = data["project.name"] || data.project_name || "Custom Web App Development";

  return (
    <EmailLayout
      previewText={`Invoice ${invoiceNumber} issued by SiroTech Solutions - ${amount}`}
      heading={`New Invoice: ${invoiceNumber}`}
      subheading={`An invoice has been generated for ${projectName}.`}
      badge="Payment Due"
      badgeColor="emerald"
      actionLabel="View &amp; Pay Invoice"
      actionUrl={payUrl}
      footerNote="SiroTech accepts Paystack, Credit/Debit cards, M-Pesa Till &amp; Paybill, and International Wire transfers with instant automated reconciliation."
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            A new invoice has been generated for engineering services rendered on <strong>{projectName}</strong>. Summary details are provided below:
          </p>
          <div style={{ margin: "22px 0", padding: "20px", backgroundColor: "#F7FAF8", borderRadius: "12px", border: "1px solid #DCE6DF" }}>
            <table width="100%" style={{ fontSize: "13px" }}>
              <tr>
                <td style={{ color: "#596E60", paddingBottom: "8px" }}>INVOICE NUMBER:</td>
                <td align="right"><strong style={{ fontFamily: "monospace" }}>{invoiceNumber}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#596E60", paddingBottom: "8px" }}>AMOUNT DUE:</td>
                <td align="right"><strong style={{ fontSize: "16px", color: "#1B2E24" }}>{amount}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#596E60" }}>PAYMENT DUE DATE:</td>
                <td align="right"><strong>{dueDate}</strong></td>
              </tr>
            </table>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 9. Payment Received ──────────────────────────────────────────────────────
export function PaymentReceivedEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const amount = data["payment.amount"] || data.amount || "KSh 85,000";
  const reference = data["payment.reference"] || data.reference || "PAY-PSTK-928104";
  const paymentDate = data["payment.date"] || data.date || "October 16, 2026";
  const invoiceNumber = data["invoice.number"] || data.invoice_number || "INV-2026-0042";
  const receiptUrl = data.receipt_url || portalUrl("/payments");

  return (
    <EmailLayout
      previewText={`Payment of ${amount} confirmed for Invoice ${invoiceNumber}`}
      heading="Payment Received — Thank You!"
      subheading={`Your transaction has been confirmed and reconciled against invoice ${invoiceNumber}.`}
      badge="Receipt Issued"
      badgeColor="emerald"
      actionLabel="Download Official Receipt"
      actionUrl={receiptUrl}
      footerNote="This electronic confirmation serves as an official proof of payment. A VAT-compliant PDF receipt is permanently archived in your client portal."
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            We have successfully received and processed your payment. Thank you for your business! Below are the transaction details:
          </p>
          <div style={{ margin: "22px 0", padding: "20px", backgroundColor: "#F7FAF8", borderRadius: "12px", border: "1px solid #DCE6DF" }}>
            <table width="100%" style={{ fontSize: "13px" }}>
              <tr>
                <td style={{ color: "#596E60", paddingBottom: "8px" }}>AMOUNT RECEIVED:</td>
                <td align="right"><strong style={{ fontSize: "16px", color: "#1B2E24" }}>{amount}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#596E60", paddingBottom: "8px" }}>TRANSACTION REF:</td>
                <td align="right"><strong style={{ fontFamily: "monospace" }}>{reference}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#596E60", paddingBottom: "8px" }}>APPLIED TO INVOICE:</td>
                <td align="right"><strong style={{ fontFamily: "monospace" }}>{invoiceNumber}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#596E60" }}>PAYMENT DATE:</td>
                <td align="right"><strong>{paymentDate}</strong></td>
              </tr>
            </table>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 10. Ticket Reply ─────────────────────────────────────────────────────────
export function TicketReplyEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const ticketNumber = data["ticket.number"] || data.ticket_number || "TK-1082";
  const ticketSubject = data["ticket.subject"] || data.ticket_subject || "Production API Latency Optimization";
  const author = data["reply.author"] || data.author || "SiroTech Support Engineer";
  const message = data["reply.message"] || data.message || "We have analyzed the traces and deployed an index update to alleviate the slow query...";
  const ticketUrl = data.ticket_url || portalUrl("/tickets");

  return (
    <EmailLayout
      previewText={`Update on Ticket #${ticketNumber}: ${ticketSubject}`}
      heading={`Support Update #${ticketNumber}`}
      subheading={ticketSubject}
      badge="Support Ticket"
      badgeColor="blue"
      actionLabel="View Ticket Conversation"
      actionUrl={ticketUrl}
      footerNote="To guarantee SLA compliance and avoid email thread dropping, kindly post follow-up comments directly inside the portal."
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            <strong>{author}</strong> from SiroTech Solutions has posted an update on your support ticket:
          </p>
          <div style={{ margin: "20px 0", padding: "18px", backgroundColor: "#F7FAFC", borderRadius: "12px", border: "1px solid #D9E4EC" }}>
            <div style={{ fontSize: "11px", color: "#667D8C", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
              ENGINEERING RESPONSE &bull; {author}
            </div>
            <div style={{ fontSize: "13px", color: "#2B3C47", lineHeight: "1.6" }}>
              {message}
            </div>
          </div>
        </>
      )}
    </EmailLayout>
  );
}

// ─── 11. Lead Auto-Reply ──────────────────────────────────────────────────────
export function LeadAutoReplyEmailComponent({ data, customBody }: { data: Record<string, any>; customBody?: string }) {
  const name = data.name || "there";
  const company = data.company || "Your organization";
  const service = data.service || "Web Application Development";
  const turnaroundTime = data.turnaround_time || "1 business day";
  const siteLink = data.portal_url || mainUrl();

  return (
    <EmailLayout
      previewText="We've received your project brief at SiroTech Solutions"
      heading="Project Brief Received"
      subheading="Thank you for reaching out to SiroTech Solutions. Our lead architects are reviewing your specifications."
      badge="Inquiry Confirmed"
      badgeColor="emerald"
      actionLabel="Explore Our Case Studies"
      actionUrl={siteLink}
      footerNote={`Our team typically reviews and replies within ${turnaroundTime} with an architectural proposal and delivery estimate.`}
    >
      {customBody ? (
        <div style={{ whiteSpace: "pre-line" }}>{customBody}</div>
      ) : (
        <>
          <p style={{ margin: "0 0 16px 0" }}>Hello <strong>{name}</strong>,</p>
          <p style={{ margin: "0 0 16px 0" }}>
            We have successfully received your project inquiry on behalf of <strong>{company}</strong>. One of our senior software engineers will review your objectives and prepare a tailored technical recommendation.
          </p>
          <div style={{ margin: "20px 0", padding: "18px", backgroundColor: "#F7FAF8", borderRadius: "12px", border: "1px solid #DCE6DF" }}>
            <table width="100%" style={{ fontSize: "12px" }}>
              <tr>
                <td style={{ color: "#5C6F62", paddingBottom: "6px" }}>REQUESTED SERVICE:</td>
                <td align="right"><strong>{service}</strong></td>
              </tr>
              <tr>
                <td style={{ color: "#5C6F62" }}>ESTIMATED RESPONSE:</td>
                <td align="right"><strong>Within {turnaroundTime}</strong></td>
              </tr>
            </table>
          </div>
        </>
      )}
    </EmailLayout>
  );
}
