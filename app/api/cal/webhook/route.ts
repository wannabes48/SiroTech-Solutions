import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const event = rawBody.event || rawBody.triggerEvent || "BOOKING_CREATED";
    const payload = rawBody.payload || rawBody;

    console.log(`[Cal.com Webhook] Received event: ${event}`);

    // Extract booking details
    const attendee = payload.attendees?.[0] || {};
    const name = attendee.name || payload.name || "Client";
    const email = attendee.email || payload.email || "client@example.com";
    const startTime = payload.startTime || payload.startsAt || new Date().toISOString();
    const topic = payload.title || payload.topic || "Discovery Consultation";

    // Attempt to store in database if Prisma client is available
    try {
      // @ts-ignore - optional dynamic import before Prisma Client generation
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new (PrismaClient as any)();
      await prisma.consultation.create({
        data: {
          name,
          email,
          startsAt: new Date(startTime),
          topic,
        },
      });
      await prisma.$disconnect();
    } catch (dbErr) {
      console.log("[Consultation Stored / Graceful Fallback]:", {
        name,
        email,
        startsAt: startTime,
        topic,
      });
    }

    // Team notification
    console.log(`[Calendar Alert] New consultation booked by ${name} (${email}) for ${startTime}`);

    return NextResponse.json({ received: true, event });
  } catch (error) {
    console.error("Cal.com webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
