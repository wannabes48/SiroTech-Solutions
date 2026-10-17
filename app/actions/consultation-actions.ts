"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ConsultationBookingInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  scheduledAt: string | Date;
  notes?: string | null;
  calBookingId?: string | null;
  eventType?: string | null;
}

export async function recordConsultationBookingAction(input: ConsultationBookingInput) {
  const name = input.name?.trim() || "Prospective Client";
  const email = input.email?.trim() || "";
  const phone = input.phone?.trim() || null;
  const company = input.company?.trim() || null;
  const notes = input.notes?.trim() || (input.eventType ? `Booked via Cal.com (${input.eventType})` : "Engineering consultation booked via Cal.com");
  const calBookingId = input.calBookingId ? String(input.calBookingId).trim() : `cal_${Date.now()}`;
  
  // Format scheduledAt safely
  let scheduledAtDate: Date;
  try {
    scheduledAtDate = new Date(input.scheduledAt);
    if (isNaN(scheduledAtDate.getTime())) {
      scheduledAtDate = new Date();
    }
  } catch {
    scheduledAtDate = new Date();
  }

  if (!email) {
    return { error: "Email address is required to record a consultation." };
  }

  try {
    // 1. Upsert into consultations table
    const consultRes = await query<{ id: string; name: string; scheduled_at: string }>(
      `INSERT INTO consultations (name, email, phone, company, scheduled_at, status, notes, cal_booking_id, created_at)
       VALUES ($1, $2, $3, $4, $5, 'SCHEDULED', $6, $7, NOW())
       ON CONFLICT (cal_booking_id) DO UPDATE SET
         name = COALESCE(EXCLUDED.name, consultations.name),
         email = COALESCE(EXCLUDED.email, consultations.email),
         phone = COALESCE(EXCLUDED.phone, consultations.phone),
         company = COALESCE(EXCLUDED.company, consultations.company),
         scheduled_at = EXCLUDED.scheduled_at,
         notes = COALESCE(EXCLUDED.notes, consultations.notes),
         status = 'SCHEDULED'
       RETURNING id, name, scheduled_at`,
      [name, email, phone, company, scheduledAtDate.toISOString(), notes, calBookingId]
    );

    const consultationId = consultRes.rows[0]?.id;

    // 2. Ensure linked record in leads pipeline for high-intent prospect visibility
    try {
      const existingLead = await query<{ id: string }>(
        "SELECT id FROM leads WHERE LOWER(email) = LOWER($1) LIMIT 1",
        [email]
      );

      if (existingLead.rows.length === 0) {
        await query(
          `INSERT INTO leads (name, company, email, phone, service, message, status, spam, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'QUALIFIED', false, NOW(), NOW())`,
          [
            name,
            company,
            email,
            phone,
            input.eventType === "scoping" ? "60-Min Technical Scoping" : "30-Min Discovery Consultation",
            `[Cal.com Consultation Booked for ${scheduledAtDate.toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT] ${notes}`
          ]
        );
      }
    } catch (leadErr) {
      console.warn("[recordConsultationBookingAction lead sync error]", leadErr);
    }

    // 3. Record webhook/telemetry event for audit and integration visibility
    try {
      await query(
        `INSERT INTO webhook_events (provider, type, status, attempts, payload, received_at, processed_at)
         VALUES ('CAL', 'cal.booking.created', 'PROCESSED', 1, $1, NOW(), NOW())`,
        [
          JSON.stringify({
            calBookingId,
            name,
            email,
            phone,
            company,
            scheduledAt: scheduledAtDate.toISOString(),
            notes,
            eventType: input.eventType || "discovery",
            source: "cal.com_embed"
          })
        ]
      );
    } catch (whErr) {
      console.warn("[recordConsultationBookingAction webhook_events error]", whErr);
    }

    // 4. Log in audit_logs
    try {
      await query(
        `INSERT INTO audit_logs (org_id, action, entity, entity_id, metadata, created_at)
         VALUES (
           (SELECT id FROM organizations LIMIT 1),
           'CONSULTATION_BOOKED',
           'consultation',
           $1,
           $2,
           NOW()
         )`,
        [
          consultationId,
          JSON.stringify({
            name,
            email,
            calBookingId,
            scheduledAt: scheduledAtDate.toISOString()
          })
        ]
      );
    } catch (auditErr) {
      console.warn("[recordConsultationBookingAction audit_logs error]", auditErr);
    }

    // 5. Revalidate cache on affected admin pages
    revalidatePath("/admin/consultations");
    revalidatePath("/admin/integrations");
    revalidatePath("/admin/leads");
    revalidatePath("/admin");

    return {
      success: true,
      consultationId,
      name,
      email,
      scheduledAt: scheduledAtDate.toISOString(),
      calBookingId
    };
  } catch (error: any) {
    console.error("[recordConsultationBookingAction fatal error]", error);
    return { error: error.message || "Failed to record consultation booking in database." };
  }
}
