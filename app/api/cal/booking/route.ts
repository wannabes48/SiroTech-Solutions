import { NextResponse } from "next/server";
import { recordConsultationBookingAction } from "@/app/actions/consultation-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const attendee = body.attendees?.[0] || body.attendee || {};
    const name = body.name || attendee.name || body.responses?.name?.value || body.responses?.name || "Client";
    const email = body.email || attendee.email || body.responses?.email?.value || body.responses?.email || "";
    const phone = body.phone || attendee.phone || attendee.phoneNumber || body.responses?.phone?.value || body.responses?.phone || null;
    const company = body.company || body.responses?.company?.value || body.responses?.company || null;
    const scheduledAt = body.startTime || body.startsAt || body.scheduledAt || new Date().toISOString();
    const notes = body.notes || body.description || body.title || body.responses?.notes?.value || body.responses?.notes || "Consultation booked via Cal.com embed";
    const calBookingId = body.calBookingId || body.uid || body.bookingId || body.id || `cal_${Date.now()}`;
    const eventType = body.eventType || body.type || "discovery";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await recordConsultationBookingAction({
      name,
      email,
      phone,
      company,
      scheduledAt,
      notes,
      calBookingId,
      eventType
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[POST /api/cal/booking Error]", error);
    return NextResponse.json({ error: error.message || "Failed to record booking" }, { status: 500 });
  }
}
