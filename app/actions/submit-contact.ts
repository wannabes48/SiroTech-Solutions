"use server";

import { headers } from "next/headers";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { baseContact } from "@/lib/validators";

// ─── Types ───────────────────────────────────────────────────────────────────
type ActionResult = {
  status: "success" | "error";
  message: string;
};

// Same limit as /api/contact: 6 submissions per minute per IP (per server instance).
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const r = rateLimitMap.get(ip);
  if (!r || now > r.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 60_000 });
    return false;
  }
  r.count += 1;
  return r.count > 6;
}

// ─── Server Action ────────────────────────────────────────────────────────────
export async function submitContact(
  formData: FormData
): Promise<ActionResult> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  if (rateLimited(ip)) {
    return { status: "error", message: "Too many submissions. Please wait a minute or email hello@sirotech.co.ke." };
  }

  const parsed = baseContact.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
    need: formData.get("project_type")?.toString() || "Web application development",
    budget: formData.get("budget")?.toString() || undefined,
    company: formData.get("company")?.toString() || undefined,
    phone: formData.get("phone")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message || "Please fill in all required fields." };
  }
  const { name, email, message, need: projectType, company, phone } = parsed.data;
  const budget = formData.get("budget")?.toString().trim() ? parsed.data.budget : null;

  try {
    // 1. Save the lead FIRST — an email failure must never lose it
    const result = await query<{ id: string }>(
      `INSERT INTO leads (name, company, email, phone, service, budget, message, status, spam, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'NEW', false, NOW(), NOW())
       RETURNING id`,
      [name, company || null, email, phone || null, projectType, budget, message]
    );

    const leadId = result.rows[0]?.id;

    // 2. Audit log entry for real-time staff visibility
    if (leadId) {
      await query(
        `INSERT INTO audit_logs (org_id, action, entity, entity_id, metadata, created_at)
         VALUES ((SELECT id FROM organizations LIMIT 1), 'LEAD_CREATED', 'lead', $1, $2, NOW())`,
        [
          leadId,
          JSON.stringify({
            source: "contact_section",
            name,
            email,
            service: projectType,
            budget
          })
        ]
      ).catch((err: any) => {
        console.warn("[Audit Log Note]:", err?.message);
      });

      // 3. Team notification + auto-reply (failures are flagged in admin and retried by cron)
      try {
        const { processLeadEmails } = await import("@/lib/lead-emails");
        await processLeadEmails(leadId);
      } catch (mailErr) {
        console.error("[submitContact emails] lead kept, will retry:", mailErr);
      }
    }

    // 4. Revalidate Admin Pages
    revalidatePath("/admin/leads");
    revalidatePath("/admin/support");
    revalidatePath("/admin");

    return {
      status: "success",
      message: "Thanks for reaching out! We've received your enquiry and will reply within 1 business day.",
    };
  } catch (err: any) {
    console.error("[submitContact DB error]:", err);
    return {
      status: "error",
      message: "An unexpected error occurred while saving your inquiry. Please try again or email hello@sirotech.co.ke directly.",
    };
  }
}
