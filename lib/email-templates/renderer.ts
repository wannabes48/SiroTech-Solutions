import { SYSTEM_EMAIL_TEMPLATES } from "./registry";
import { EmailRenderResult, EmailTemplateDefinition } from "./types";
import { interpolate } from "./interpolator";
import { sendMail } from "@/lib/email";
import { query } from "@/lib/db";

/**
 * Normalizes legacy or alternative template keys to canonical system template keys.
 */
export function normalizeTemplateKey(key: string): string {
  const map: Record<string, string> = {
    invoice_issued: "invoice",
    verify_email: "verify",
    reset_password: "reset",
    welcome_staff: "invite",
  };
  return map[key] || key;
}

/**
 * Retrieves the template definition for a given key.
 */
export function getTemplateDefinition(key: string): EmailTemplateDefinition | undefined {
  const canonical = normalizeTemplateKey(key);
  return SYSTEM_EMAIL_TEMPLATES[canonical];
}

/**
 * Returns all system email template definitions in a consistent order.
 */
export function getAllTemplateDefinitions(): EmailTemplateDefinition[] {
  return Object.values(SYSTEM_EMAIL_TEMPLATES);
}

/**
 * Renders an email template to both HTML and Plain-Text representations.
 */
export function renderEmail(
  key: string,
  data: Record<string, any> = {},
  customSubject?: string,
  customBody?: string
): EmailRenderResult {
  const template = getTemplateDefinition(key);
  if (!template) {
    throw new Error(`Unknown email template key: "${key}"`);
  }

  const mergedData = { ...template.sampleData, ...data };
  const rawSubject = customSubject || template.defaultSubject;
  const subject = interpolate(rawSubject, mergedData);

  const html = template.renderHtml(mergedData, customSubject, customBody);
  const text = template.renderText(mergedData, customSubject, customBody);

  return {
    subject,
    html,
    text,
  };
}

/**
 * Dispatches an email using Resend (if configured) and audits the event in email_logs.
 */
export async function sendEmailWithLog({
  templateKey,
  to,
  data = {},
  customSubject,
  customBody,
  from,
  replyTo,
}: {
  templateKey: string;
  to: string;
  data?: Record<string, any>;
  customSubject?: string;
  customBody?: string;
  metadata?: Record<string, any>;
  from?: string;
  replyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Apply subject/body edits saved in Admin > Email unless the caller overrides them.
    if (customSubject === undefined || customBody === undefined) {
      try {
        const o = await query<{ subject: string | null; body: string | null }>(
          "SELECT subject, body FROM email_templates WHERE key = $1 LIMIT 1",
          [normalizeTemplateKey(templateKey)]
        );
        if (o.rows[0]) {
          customSubject ??= o.rows[0].subject || undefined;
          customBody ??= o.rows[0].body || undefined;
        }
      } catch {
        // table missing or unavailable: fall back to built-in copy
      }
    }
    const rendered = renderEmail(templateKey, data, customSubject, customBody);
    const result = await sendMail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      from,
      replyTo,
      template: templateKey,
    });
    return { success: result.ok, messageId: result.id, error: result.error };
  } catch (err: any) {
    console.error("[sendEmailWithLog Error]:", err);
    return {
      success: false,
      error: err?.message || "Failed to render or dispatch email",
    };
  }
}
