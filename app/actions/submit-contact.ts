"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── Types ───────────────────────────────────────────────────────────────────
type ActionResult = {
  status: "success" | "error";
  message: string;
};

// ─── Server Action ────────────────────────────────────────────────────────────
export async function submitContact(
  formData: FormData
): Promise<ActionResult> {
  const name        = formData.get("name")?.toString().trim()        ?? "";
  const email       = formData.get("email")?.toString().trim()       ?? "";
  const message     = formData.get("message")?.toString().trim()     ?? "";
  const projectType = formData.get("project_type")?.toString().trim() || "Web application development";
  const budget      = formData.get("budget")?.toString().trim()       || null;
  const company     = formData.get("company")?.toString().trim()      || null;
  const phone       = formData.get("phone")?.toString().trim()        || null;

  // Server-side validation
  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  try {
    // 1. Direct PostgreSQL Persistence into leads table
    const result = await query<{ id: string }>(
      `INSERT INTO leads (name, company, email, phone, service, budget, message, status, spam, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'NEW', false, NOW(), NOW())
       RETURNING id`,
      [name, company, email, phone, projectType, budget, message]
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
    }

    // 3. Revalidate Admin Pages
    revalidatePath("/admin/leads");
    revalidatePath("/admin/support");
    revalidatePath("/admin");

    return {
      status: "success",
      message: "Thanks for reaching out! We've received your inquiry and our team will review your project brief within 24 hours.",
    };
  } catch (err: any) {
    console.error("[submitContact DB error]:", err);
    return {
      status: "error",
      message: "An unexpected error occurred while saving your inquiry. Please try again or email hello@sirotech.com directly.",
    };
  }
}
