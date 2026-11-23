import React from "react";
import { renderToHtml } from "./renderToHtml";
import { EmailTemplateDefinition } from "./types";
import { interpolate } from "./interpolator";
import { renderPlainTextLayout } from "./components/EmailLayout";
import {
  VerifyEmailComponent,
  MagicLinkEmailComponent,
  ResetPasswordEmailComponent,
  PasswordChangedEmailComponent,
  InviteEmailComponent,
  NewMessageEmailComponent,
  MilestoneApprovalEmailComponent,
  InvoiceIssuedEmailComponent,
  PaymentReceivedEmailComponent,
  TicketReplyEmailComponent,
  LeadAutoReplyEmailComponent,
} from "./components/templates";

export const SYSTEM_EMAIL_TEMPLATES: Record<string, EmailTemplateDefinition> = {
  verify: {
    key: "verify",
    title: "Verify Email",
    description: "Sent to new users upon registration to verify their email address and activate access.",
    category: "auth",
    defaultSubject: "Verify your SiroTech portal account",
    defaultBody: `Hello {{name}},

Thank you for creating an account with SiroTech Solutions. To ensure the security of your engineering projects, source code artifacts, and billing deliverables, please verify your email address: {{email}}.

Click the verification button below to activate your account.`,
    allowedVariables: [
      { token: "name", label: "User Name", description: "Recipient's full name", example: "Faith Wanjiku" },
      { token: "email", label: "Account Email", description: "Registered email address", example: "faith@wanjiku.ke" },
      { token: "verify_url", label: "Verification URL", description: "Secure token activation link", example: "https://portal.sirotech.co.ke/verify-email?token=xyz" },
      { token: "expires_in", label: "Link Expiration", description: "Time until token expires", example: "24 hours" },
    ],
    sampleData: {
      name: "Faith Wanjiku",
      email: "faith@wanjiku.ke",
      verify_url: "https://portal.sirotech.co.ke/verify-email?token=demo_auth_token_9918",
      expires_in: "24 hours",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.verify.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<VerifyEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.verify.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.verify.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : SYSTEM_EMAIL_TEMPLATES.verify.defaultSubject,
        body,
        actionLabel: "Verify Email Address",
        actionUrl: merged.verify_url,
        metadata: [{ label: "Account Email", value: merged.email }],
      });
    },
  },

  magic_link: {
    key: "magic_link",
    title: "Magic Link Sign-In",
    description: "Passwordless authentication email providing a secure single-use sign-in link.",
    category: "auth",
    defaultSubject: "Sign in to SiroTech Portal",
    defaultBody: `Hello {{name}},

We received a request to sign in to your SiroTech Portal account ({{email}}) without a password.

Click the link below to authenticate immediately from your {{device}}.`,
    allowedVariables: [
      { token: "name", label: "User Name", description: "Recipient's name", example: "Alex Kimani" },
      { token: "email", label: "Account Email", description: "Sign-in email address", example: "alex@kimani.ke" },
      { token: "magic_link_url", label: "Magic Link URL", description: "Single-use sign-in URL", example: "https://portal.sirotech.co.ke/sign-in?token=xyz" },
      { token: "expires_in", label: "Expiration Time", description: "Lifespan of the magic link", example: "15 minutes" },
      { token: "device", label: "Request Device", description: "Client device and browser", example: "Chrome on macOS" },
      { token: "location", label: "Request Location", description: "Estimated city and country", example: "Nairobi, Kenya" },
    ],
    sampleData: {
      name: "Alex Kimani",
      email: "alex@kimani.ke",
      magic_link_url: "https://portal.sirotech.co.ke/sign-in?token=demo_magic_token_2174",
      expires_in: "15 minutes",
      device: "Edge 128 on Windows 11",
      location: "Nairobi, Kenya",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.magic_link.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<MagicLinkEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.magic_link.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.magic_link.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : SYSTEM_EMAIL_TEMPLATES.magic_link.defaultSubject,
        body,
        actionLabel: "Sign In to Portal",
        actionUrl: merged.magic_link_url,
        metadata: [
          { label: "Account", value: merged.email },
          { label: "Device", value: merged.device },
          { label: "Location", value: merged.location },
        ],
      });
    },
  },

  reset: {
    key: "reset",
    title: "Reset Password",
    description: "Sent when a user requests a password reset link to recover their account.",
    category: "auth",
    defaultSubject: "Reset your SiroTech account password",
    defaultBody: `Hello {{name}},

We received a request to reset the password for your SiroTech portal account ({{email}}).

Click the button below to configure your new password. This link is valid for {{expires_in}}.`,
    allowedVariables: [
      { token: "name", label: "User Name", description: "Recipient's name", example: "Grace Mutua" },
      { token: "email", label: "Account Email", description: "Account email", example: "grace@savannahexports.com" },
      { token: "reset_url", label: "Reset Password URL", description: "Password reset link", example: "https://portal.sirotech.co.ke/reset-password?token=xyz" },
      { token: "expires_in", label: "Link Expiration", description: "Validity duration", example: "60 minutes" },
    ],
    sampleData: {
      name: "Grace Mutua",
      email: "grace@savannahexports.com",
      reset_url: "https://portal.sirotech.co.ke/reset-password?token=demo_reset_token_4831",
      expires_in: "60 minutes",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.reset.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<ResetPasswordEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.reset.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.reset.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : SYSTEM_EMAIL_TEMPLATES.reset.defaultSubject,
        body,
        actionLabel: "Reset My Password",
        actionUrl: merged.reset_url,
        metadata: [{ label: "Account Email", value: merged.email }],
      });
    },
  },

  password_changed: {
    key: "password_changed",
    title: "Password Changed",
    description: "Security alert triggered immediately after an account password is modified.",
    category: "auth",
    defaultSubject: "Security Alert: Your SiroTech password has been changed",
    defaultBody: `Hello {{name}},

The password for your SiroTech portal account ({{email}}) was successfully changed on {{time}} from {{device}}.

If you initiated this change, no further action is required. If you did not make this change, please lock your account immediately and contact our security desk.`,
    allowedVariables: [
      { token: "name", label: "User Name", description: "Recipient's name", example: "Faith Wanjiku" },
      { token: "email", label: "Account Email", description: "Account email", example: "faith@wanjiku.ke" },
      { token: "time", label: "Timestamp", description: "Time of password change", example: "Fri, 16 Oct 2026 08:30:00 GMT" },
      { token: "device", label: "Device Info", description: "Browser and operating system", example: "Chrome 129 on Windows" },
      { token: "support_url", label: "Security URL", description: "Portal security desk link", example: "https://portal.sirotech.co.ke/support" },
    ],
    sampleData: {
      name: "Faith Wanjiku",
      email: "faith@wanjiku.ke",
      time: "Friday, October 16, 2026 at 08:30 EAT",
      device: "Chrome 129 on Windows 11",
      support_url: "https://portal.sirotech.co.ke/profile/security",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.password_changed.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<PasswordChangedEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.password_changed.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.password_changed.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : SYSTEM_EMAIL_TEMPLATES.password_changed.defaultSubject,
        body,
        actionLabel: "Open Security Settings",
        actionUrl: merged.support_url,
        metadata: [
          { label: "Account Email", value: merged.email },
          { label: "Timestamp", value: merged.time },
          { label: "Device", value: merged.device },
        ],
      });
    },
  },

  invite: {
    key: "invite",
    title: "Portal Invitation",
    description: "Sent to new client team members or staff when invited to a portal workspace.",
    category: "auth",
    defaultSubject: "You've been invited to the SiroTech Client Portal",
    defaultBody: `Hello {{name}},

{{inviter.name}} has invited you to collaborate with our engineering studio on behalf of {{organization.name}} as a {{role}}.

Click below to accept your invitation, configure your password, and access your project milestones and deliverables.`,
    allowedVariables: [
      { token: "name", label: "Invitee Name", description: "Invited person's name", example: "David Ochieng" },
      { token: "organization.name", label: "Organization Name", description: "Client company name", example: "Apex Health Kenya" },
      { token: "role", label: "Portal Role", description: "Assigned role", example: "Billing Admin" },
      { token: "invite_url", label: "Invitation URL", description: "Acceptance onboarding link", example: "https://portal.sirotech.co.ke/invite/xyz" },
      { token: "inviter.name", label: "Inviter Name", description: "Person who sent the invitation", example: "Faith Wanjiku" },
      { token: "expires_in", label: "Invitation Expiry", description: "Validity lifespan", example: "7 days" },
    ],
    sampleData: {
      name: "David Ochieng",
      "organization.name": "Apex Health Kenya Ltd",
      role: "Project Stakeholder",
      invite_url: "https://portal.sirotech.co.ke/invite/demo_invite_token_8821",
      "inviter.name": "Faith Wanjiku",
      expires_in: "7 days",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.invite.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<InviteEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.invite.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.invite.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : SYSTEM_EMAIL_TEMPLATES.invite.defaultSubject,
        body,
        actionLabel: "Accept Invitation & Join Portal",
        actionUrl: merged.invite_url,
        metadata: [
          { label: "Organization", value: merged["organization.name"] },
          { label: "Role", value: merged.role },
          { label: "Invited By", value: merged["inviter.name"] },
        ],
      });
    },
  },

  new_message: {
    key: "new_message",
    title: "New Portal Message",
    description: "Notification dispatched when an engineering team member or client posts a message.",
    category: "project",
    defaultSubject: "New message from {{sender.name}} regarding {{project.name}}",
    defaultBody: `Hello {{name}},

{{sender.name}} posted a new message regarding {{project.name}}:

"{{message.preview}}"

Click below to view the conversation history and reply directly inside the client portal.`,
    allowedVariables: [
      { token: "name", label: "Recipient Name", description: "Account owner name", example: "Faith Wanjiku" },
      { token: "sender.name", label: "Sender Name", description: "Person posting the message", example: "Brian Mwangi (Staff)" },
      { token: "project.name", label: "Project Title", description: "Associated project", example: "FinTech Settlement Engine" },
      { token: "message.preview", label: "Message Preview", description: "Excerpt of message body", example: "Staging deployment has passed all automated tests..." },
      { token: "message_url", label: "Message URL", description: "Direct link to thread in portal", example: "https://portal.sirotech.co.ke/messages?thread=42" },
    ],
    sampleData: {
      name: "Faith Wanjiku",
      "sender.name": "Brian Mwangi (Lead Architect)",
      "project.name": "FinTech Settlement Engine",
      "message.preview": "We have completed the M-Pesa B2C callback reconciliation module and deployed the sandbox artifacts to staging for your team's review.",
      message_url: "https://portal.sirotech.co.ke/messages/thread_8829",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.new_message.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<NewMessageEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.new_message.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.new_message.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.new_message.defaultSubject, merged),
        body,
        actionLabel: "Reply in Portal",
        actionUrl: merged.message_url,
        metadata: [
          { label: "Project", value: merged["project.name"] },
          { label: "From", value: merged["sender.name"] },
        ],
      });
    },
  },

  milestone_approval: {
    key: "milestone_approval",
    title: "Milestone Awaiting Approval",
    description: "Alerts client when a sprint milestone is finished and awaits formal sign-off.",
    category: "project",
    defaultSubject: "Milestone Ready for Review: {{milestone.title}} ({{project.name}})",
    defaultBody: `Hello {{name}},

Our engineering team has delivered {{milestone.title}} for {{project.name}}.

Deliverables: {{milestone.deliverables}}

Please inspect the staging build and approve the milestone within {{due_date}} to release the next sprint phase.`,
    allowedVariables: [
      { token: "name", label: "Client Name", description: "Account owner name", example: "Faith Wanjiku" },
      { token: "milestone.title", label: "Milestone Name", description: "Title of completed milestone", example: "Milestone 2: M-Pesa Gateway" },
      { token: "project.name", label: "Project Name", description: "Project title", example: "FinTech Settlement Engine" },
      { token: "milestone.deliverables", label: "Deliverables Summary", description: "Summary of delivered artifacts", example: "C2B callback listeners, instant IPN verification" },
      { token: "approval_url", label: "Approval URL", description: "Link to review & approve in portal", example: "https://portal.sirotech.co.ke/milestones/ms_42" },
      { token: "due_date", label: "Review Due Date", description: "SLA review turnaround window", example: "3 business days" },
    ],
    sampleData: {
      name: "Faith Wanjiku",
      "milestone.title": "Milestone 2: M-Pesa Gateway & Automated Settlement",
      "project.name": "FinTech Settlement Engine",
      "milestone.deliverables": "Daraja 2.0 C2B/B2C API integration, webhook retry queues, and idempotent ledger recording.",
      approval_url: "https://portal.sirotech.co.ke/milestones/ms_9912",
      due_date: "3 business days",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.milestone_approval.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<MilestoneApprovalEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.milestone_approval.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.milestone_approval.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.milestone_approval.defaultSubject, merged),
        body,
        actionLabel: "Review & Approve Milestone",
        actionUrl: merged.approval_url,
        metadata: [
          { label: "Milestone", value: merged["milestone.title"] },
          { label: "Project", value: merged["project.name"] },
          { label: "Review Window", value: merged.due_date },
        ],
      });
    },
  },

  invoice: {
    key: "invoice",
    title: "Invoice Issued",
    description: "Notifies clients when a new milestone or recurring care plan invoice is generated.",
    category: "billing",
    defaultSubject: "Invoice {{invoice.number}} from SiroTech Solutions - {{invoice.amount}}",
    defaultBody: `Hello {{name}},

A new invoice ({{invoice.number}}) has been issued for engineering services rendered on {{project.name}}.

Amount Due: {{invoice.amount}}
Due Date: {{invoice.due_date}}

Click below to view the line items and settle via Paystack, M-Pesa, or Card.`,
    allowedVariables: [
      { token: "name", label: "Client Name", description: "Organization contact name", example: "Faith Wanjiku" },
      { token: "invoice.number", label: "Invoice Number", description: "Unique invoice reference", example: "INV-2026-0042" },
      { token: "invoice.amount", label: "Amount Due", description: "Formatted currency & amount", example: "KSh 120,000" },
      { token: "invoice.currency", label: "Currency Code", description: "Currency symbol or ISO code", example: "KES" },
      { token: "invoice.due_date", label: "Due Date", description: "Payment deadline date", example: "October 31, 2026" },
      { token: "invoice.pay_url", label: "Payment URL", description: "Direct checkout / payment link", example: "https://portal.sirotech.co.ke/invoices/inv_42" },
      { token: "project.name", label: "Project Title", description: "Associated project or retainer plan", example: "Production Care Retainer" },
    ],
    sampleData: {
      name: "Faith Wanjiku",
      "invoice.number": "INV-2026-0089",
      "invoice.amount": "KSh 120,000",
      "invoice.currency": "KES",
      "invoice.due_date": "October 31, 2026",
      "invoice.pay_url": "https://portal.sirotech.co.ke/invoices/inv_0089",
      "project.name": "FinTech Settlement Engine",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.invoice.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<InvoiceIssuedEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.invoice.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.invoice.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.invoice.defaultSubject, merged),
        body,
        actionLabel: "View & Pay Invoice",
        actionUrl: merged["invoice.pay_url"],
        metadata: [
          { label: "Invoice Number", value: merged["invoice.number"] },
          { label: "Amount Due", value: merged["invoice.amount"] },
          { label: "Due Date", value: merged["invoice.due_date"] },
          { label: "Project", value: merged["project.name"] },
        ],
      });
    },
  },

  payment_received: {
    key: "payment_received",
    title: "Payment Received",
    description: "Official receipt confirmation dispatched upon successful payment reconciliation.",
    category: "billing",
    defaultSubject: "Receipt: Payment of {{payment.amount}} received for {{invoice.number}}",
    defaultBody: `Hello {{name}},

We have received and processed your payment of {{payment.amount}} for invoice {{invoice.number}}.

Transaction Reference: {{payment.reference}}
Date Processed: {{payment.date}}

Thank you for your prompt settlement. Your official VAT receipt has been generated and archived in your portal.`,
    allowedVariables: [
      { token: "name", label: "Client Name", description: "Payer contact name", example: "Faith Wanjiku" },
      { token: "payment.amount", label: "Payment Amount", description: "Settled amount", example: "KSh 120,000" },
      { token: "payment.currency", label: "Currency", description: "Currency ISO code", example: "KES" },
      { token: "payment.reference", label: "Transaction Reference", description: "Receipt or gateway confirmation code", example: "QHK9281903" },
      { token: "payment.date", label: "Payment Date", description: "Date of transaction settlement", example: "October 16, 2026" },
      { token: "invoice.number", label: "Invoice Number", description: "Reconciled invoice reference", example: "INV-2026-0089" },
      { token: "receipt_url", label: "Receipt Download URL", description: "PDF receipt download link", example: "https://portal.sirotech.co.ke/payments/rcpt_42" },
    ],
    sampleData: {
      name: "Faith Wanjiku",
      "payment.amount": "KSh 120,000",
      "payment.currency": "KES",
      "payment.reference": "PAY-PSTK-9281903",
      "payment.date": "October 16, 2026",
      "invoice.number": "INV-2026-0089",
      receipt_url: "https://portal.sirotech.co.ke/payments/rcpt_8829",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.payment_received.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<PaymentReceivedEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.payment_received.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.payment_received.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.payment_received.defaultSubject, merged),
        body,
        actionLabel: "Download Official Receipt",
        actionUrl: merged.receipt_url,
        metadata: [
          { label: "Amount Paid", value: merged["payment.amount"] },
          { label: "Transaction Ref", value: merged["payment.reference"] },
          { label: "Invoice", value: merged["invoice.number"] },
          { label: "Date", value: merged["payment.date"] },
        ],
      });
    },
  },

  ticket_reply: {
    key: "ticket_reply",
    title: "Support Ticket Reply",
    description: "Notifies clients when staff post technical updates or responses on support tickets.",
    category: "support",
    defaultSubject: "Update on Ticket #{{ticket.number}}: {{ticket.subject}}",
    defaultBody: `Hello {{name}},

{{reply.author}} from SiroTech Engineering has posted a response to your support request #{{ticket.number}} ({{ticket.subject}}):

"{{reply.message}}"

Click below to inspect the logs, follow up, or mark this issue as resolved.`,
    allowedVariables: [
      { token: "name", label: "Client Name", description: "Ticket author name", example: "Faith Wanjiku" },
      { token: "ticket.number", label: "Ticket Number", description: "Numeric or alphanumeric ticket code", example: "TK-1082" },
      { token: "ticket.subject", label: "Ticket Subject", description: "Support inquiry title", example: "Database Query Latency" },
      { token: "reply.author", label: "Responder Name", description: "Engineer who posted response", example: "John Doe" },
      { token: "reply.message", label: "Reply Message", description: "Body of engineer's answer", example: "The missing index has been applied to production..." },
      { token: "ticket_url", label: "Ticket URL", description: "Direct portal link to ticket thread", example: "https://portal.sirotech.co.ke/tickets/tk_1082" },
    ],
    sampleData: {
      name: "Faith Wanjiku",
      "ticket.number": "TK-1082",
      "ticket.subject": "Database Query Latency Optimization",
      "reply.author": "Marcus Roy (Lead Infrastructure Engineer)",
      "reply.message": "We analyzed the slow query telemetry on the transactions table, added a composite B-tree index, and latency dropped from 1,200ms to 18ms. Please verify on staging.",
      ticket_url: "https://portal.sirotech.co.ke/tickets/tk_1082",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.ticket_reply.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<TicketReplyEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.ticket_reply.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.ticket_reply.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.ticket_reply.defaultSubject, merged),
        body,
        actionLabel: "View Ticket Conversation",
        actionUrl: merged.ticket_url,
        metadata: [
          { label: "Ticket Number", value: `#${merged["ticket.number"]}` },
          { label: "Subject", value: merged["ticket.subject"] },
          { label: "Engineer", value: merged["reply.author"] },
        ],
      });
    },
  },

  lead_auto_reply: {
    key: "lead_auto_reply",
    title: "Contact Inquiry Auto-Reply",
    description: "Instant confirmation sent to visitors who submit a project brief through the public contact form.",
    category: "marketing",
    defaultSubject: "Thank you for contacting SiroTech Solutions - We've received your brief",
    defaultBody: `Hello {{name}},

Thank you for reaching out to SiroTech Solutions on behalf of {{company}}. We have safely received your project brief regarding {{service}}.

Our lead software architects are reviewing your specifications and will respond within {{turnaround_time}} with an actionable architectural proposal.`,
    allowedVariables: [
      { token: "name", label: "Visitor Name", description: "Name entered in form", example: "Faith Wanjiku" },
      { token: "company", label: "Company Name", description: "Visitor company or startup", example: "Wanjiku Ventures" },
      { token: "service", label: "Requested Service", description: "Selected engineering service", example: "Web Application Development" },
      { token: "turnaround_time", label: "Response SLA", description: "Standard reply turnaround", example: "1 business day" },
      { token: "portal_url", label: "Website URL", description: "Link to SiroTech portal / portfolio", example: "https://sirotech.co.ke" },
    ],
    sampleData: {
      name: "Faith Wanjiku",
      company: "Wanjiku Ventures Ltd",
      service: "Custom Web Application & FinTech Integration",
      turnaround_time: "1 business day",
      portal_url: "https://sirotech.co.ke",
    },
    renderHtml: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.lead_auto_reply.sampleData, ...data };
      const bodyInterpolated = customBody ? interpolate(customBody, merged) : undefined;
      return "<!DOCTYPE html>" + renderToHtml(<LeadAutoReplyEmailComponent data={merged} customBody={bodyInterpolated} />);
    },
    renderText: (data, customSubject, customBody) => {
      const merged = { ...SYSTEM_EMAIL_TEMPLATES.lead_auto_reply.sampleData, ...data };
      const body = customBody ? interpolate(customBody, merged) : interpolate(SYSTEM_EMAIL_TEMPLATES.lead_auto_reply.defaultBody, merged);
      return renderPlainTextLayout({
        title: customSubject ? interpolate(customSubject, merged) : SYSTEM_EMAIL_TEMPLATES.lead_auto_reply.defaultSubject,
        body,
        actionLabel: "Explore SiroTech Studio",
        actionUrl: merged.portal_url,
        metadata: [
          { label: "Company", value: merged.company },
          { label: "Service", value: merged.service },
          { label: "Estimated Response", value: merged.turnaround_time },
        ],
      });
    },
  },
};
