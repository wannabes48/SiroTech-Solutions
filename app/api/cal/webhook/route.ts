import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // 1. Optional Signature Verification if CAL_WEBHOOK_SECRET is set
    const webhookSecret = process.env.CAL_WEBHOOK_SECRET;
    const signature = request.headers.get("X-Cal-Signature-256");

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.warn("[Cal.com Webhook] Signature mismatch detected.");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    const event = body.triggerEvent || body.event || "BOOKING_CREATED";
    const payload = body.payload?.booking || body.payload || body;

    console.log(`[Cal.com Webhook] Ingesting event: ${event}`);

    // 2. Extract attendee and booking attributes safely
    const attendee = payload.attendees?.[0] || payload.attendee || {};
    const name = attendee.name || payload.name || payload.responses?.name?.value || payload.responses?.name || "Client";
    const email = attendee.email || payload.email || payload.responses?.email?.value || payload.responses?.email || "";
    const phone = attendee.phone || attendee.phoneNumber || payload.phone || payload.responses?.phone?.value || payload.responses?.phone || null;
    const company = payload.responses?.company?.value || payload.responses?.company || payload.company || null;
    const startTime = payload.startTime || payload.startsAt || new Date().toISOString();
    const notes = payload.description || payload.title || payload.responses?.notes?.value || payload.responses?.notes || payload.topic || "Cal.com Technical Consultation";
    const calBookingId = String(payload.uid || payload.bookingId || payload.id || `cal_${Date.now()}`);

    let scheduledAtDate = new Date(startTime);
    if (isNaN(scheduledAtDate.getTime())) {
      scheduledAtDate = new Date();
    }

    let consultationId: string | null = null;

    // 3. Handle Events (CREATED, RESCHEDULED, CANCELLED)
    if (event === "BOOKING_CANCELLED" || event === "BOOKING_REJECTED") {
      const res = await query(
        `UPDATE consultations 
         SET status = 'CANCELLED' 
         WHERE cal_booking_id = $1 
         RETURNING id`,
        [calBookingId]
      );
      consultationId = res.rows[0]?.id || null;
      console.log(`[Cal.com Webhook] Marked booking ${calBookingId} as CANCELLED`);
    } else if (event === "BOOKING_RESCHEDULED") {
      const res = await query(
        `UPDATE consultations 
         SET scheduled_at = $1, status = 'SCHEDULED', notes = COALESCE($2, notes) 
         WHERE cal_booking_id = $3 
         RETURNING id`,
        [scheduledAtDate.toISOString(), notes, calBookingId]
      );
      consultationId = res.rows[0]?.id || null;
      console.log(`[Cal.com Webhook] Rescheduled booking ${calBookingId} to ${scheduledAtDate.toISOString()}`);
    } else {
      // BOOKING_CREATED (or default)
      if (email) {
        const res = await query<{ id: string }>(
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
           RETURNING id`,
          [name, email, phone, company, scheduledAtDate.toISOString(), notes, calBookingId]
        );
        consultationId = res.rows[0]?.id;

        // Ensure lead in sales pipeline
        try {
          const leadCheck = await query(
            "SELECT id FROM leads WHERE LOWER(email) = LOWER($1) LIMIT 1",
            [email]
          );
          if (leadCheck.rows.length === 0) {
            await query(
              `INSERT INTO leads (name, company, email, phone, service, message, status, spam, created_at, updated_at)
               VALUES ($1, $2, $3, $4, 'Engineering Consultation', $5, 'QUALIFIED', false, NOW(), NOW())`,
              [name, company, email, phone, notes]
            );
          }
        } catch (leadErr) {
          console.warn("[Cal.com Webhook lead sync warning]", leadErr);
        }
      }
    }

    // 4. Record into webhook_events table for telemetry and admin visibility
    try {
      await query(
        `INSERT INTO webhook_events (provider, type, status, attempts, payload, received_at, processed_at)
         VALUES ('CAL', $1, 'PROCESSED', 1, $2, NOW(), NOW())`,
        [event, JSON.stringify(body)]
      );
    } catch (whErr) {
      console.warn("[Cal.com Webhook webhook_events warning]", whErr);
    }

    // 5. Invalidate admin caches
    revalidatePath("/admin/consultations");
    revalidatePath("/admin/integrations");
    revalidatePath("/admin/leads");
    revalidatePath("/admin");

    return NextResponse.json({
      received: true,
      event,
      calBookingId,
      consultationId,
      status: "SUCCESS"
    });
  } catch (error: any) {
    console.error("[Cal.com Webhook Error]", error);
    return NextResponse.json(
      { error: "Webhook processing failed", message: error.message },
      { status: 500 }
    );
  }
}
