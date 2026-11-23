import { query } from "@/lib/db";

/**
 * Single outbound mail path (Resend REST API) + email_logs record.
 *
 * Env:
 *   RESEND_API_KEY      without it, mail is logged as SIMULATED and not sent
 *   MAIL_FROM           default From, e.g. "SiroTech <notifications@mail.sirotech.co.ke>"
 *   MAIL_FROM_ADDRESS   bare address used for "SiroTech Website <…>" team notifications
 *   LEADS_TO            team inbox for new enquiries (staging: your own address)
 *
 * Rules: a visitor never appears in From (breaks DMARC) — they go in Reply-To.
 * Every message carries a plain-text part.
 *
 * email_logs.status: SENT (accepted by Resend) → DELIVERED | BOUNCED | COMPLAINED via
 * the Resend webhook; FAILED when the API call fails; SIMULATED without an API key.
 */
export const MAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_FROM || "SiroTech <notifications@mail.sirotech.co.ke>";
export const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS || "notifications@mail.sirotech.co.ke";
export const LEADS_TO = process.env.LEADS_TO || "leads@sirotech.co.ke";
export const HELLO_REPLY_TO = "hello@sirotech.co.ke";

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
  /** Template key or purpose, stored in email_logs.template */
  template: string;
}

export interface MailResult {
  ok: boolean;
  id?: string;
  error?: string;
  logId?: string;
}

/** Strip CR/LF so user-provided text can never inject headers, and cap length. */
export const headerSafe = (s: string, max = 150) => s.replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function sendMail(m: MailInput): Promise<MailResult> {
  const subject = headerSafe(m.subject, 200);
  const apiKey = process.env.RESEND_API_KEY;
  let status = "SIMULATED";
  let providerId: string | null = null;
  let error: string | null = null;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          from: m.from || MAIL_FROM,
          to: [m.to],
          subject,
          text: m.text,
          ...(m.html ? { html: m.html } : {}),
          ...(m.replyTo ? { reply_to: m.replyTo } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        status = "SENT";
        providerId = data.id;
      } else {
        status = "FAILED";
        error = data.message || `Resend responded with HTTP ${res.status}`;
      }
    } catch (err: any) {
      status = "FAILED";
      error = err?.name === "TimeoutError" ? "Timed out contacting Resend" : err?.message || "Network error contacting Resend";
    }
  } else {
    console.log(`[Email Simulated] To: ${m.to} | Subject: "${subject}"`);
  }

  let logId: string | undefined;
  try {
    const log = await query<{ id: string }>(
      `INSERT INTO email_logs (to_email, template, subject, status, provider_id, error, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [m.to, m.template, subject, status, providerId, error]
    );
    logId = log.rows[0]?.id;
  } catch (logErr) {
    console.warn("[email_logs insert failed]", logErr);
  }

  if (error) console.warn(`[Email FAILED] ${m.template} → ${m.to}: ${error}`);
  return { ok: status !== "FAILED", id: providerId || undefined, error: error || undefined, logId };
}

/** Best-effort operational alert to ALERT_EMAIL (defaults to LEADS_TO). Never throws. */
export async function sendMailAlert(subject: string, text: string): Promise<void> {
  try {
    await sendMail({
      template: "ops_alert",
      to: process.env.ALERT_EMAIL || LEADS_TO,
      subject: `[SiroTech alert] ${subject}`,
      text,
    });
  } catch (err) {
    console.error("[sendMailAlert]", err);
  }
}
