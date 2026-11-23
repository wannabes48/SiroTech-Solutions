import { SYSTEM_EMAIL_TEMPLATES } from "./registry";
import { EmailRenderResult, EmailTemplateDefinition } from "./types";
import { interpolate } from "./interpolator";
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
  metadata = {},
}: {
  templateKey: string;
  to: string;
  data?: Record<string, any>;
  customSubject?: string;
  customBody?: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const rendered = renderEmail(templateKey, data, customSubject, customBody);
    const resendApiKey = process.env.RESEND_API_KEY;

    let providerId = `local_msg_${Date.now().toString(36)}`;
    let status = "DELIVERED";
    let errorMessage: string | null = null;

    if (resendApiKey) {
      try {
        const fromAddress = process.env.EMAIL_FROM || "SiroTech Solutions <notifications@sirotech.co.ke>";
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [to],
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
          }),
        });

        const resData = await res.json();
        if (res.ok && resData.id) {
          providerId = resData.id;
        } else {
          status = "FAILED";
          errorMessage = resData.message || `Resend error code ${res.status}`;
          console.warn("[Resend Dispatch Warning]:", errorMessage);
        }
      } catch (sendErr: any) {
        status = "FAILED";
        errorMessage = sendErr?.message || "Network error contacting Resend API";
        console.error("[Resend Network Error]:", sendErr);
      }
    } else {
      console.log(`[Email Simulated Dispatch] To: ${to} | Subject: "${rendered.subject}" | Provider ID: ${providerId}`);
    }

    // Record in email_logs
    try {
      await query(
        `INSERT INTO email_logs (to_email, template, subject, status, provider_id, error, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [to, templateKey, rendered.subject, status, providerId, errorMessage]
      );
    } catch (logErr) {
      console.warn("[Email Log Record Warning]:", logErr);
    }

    return {
      success: status === "DELIVERED",
      messageId: providerId,
      error: errorMessage || undefined,
    };
  } catch (err: any) {
    console.error("[sendEmailWithLog Error]:", err);
    return {
      success: false,
      error: err?.message || "Failed to render or dispatch email",
    };
  }
}
