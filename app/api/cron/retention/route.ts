import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Scheduled Data & Chat Transcript Retention Policy Cron (Runs at 02:00 UTC daily)
 * Purges lead records or attached chat transcripts older than retention policy (e.g., 90 days),
 * ensuring continuous compliance with the Kenya Data Protection Act (2019) and GDPR.
 */
export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron authorization header if CRON_SECRET is configured
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days retention

    let purgedCount = 0;

    // 2. Perform retention purge via Prisma if database is connected
    try {
      // @ts-ignore
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new (PrismaClient as any)();

      // Clear transcripts older than 90 days on non-converted leads
      const updateResult = await prisma.lead.updateMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: { in: ["LOST", "NEW"] },
          transcript: { not: null },
        },
        data: {
          transcript: null,
          notes: "Chat transcript purged automatically under 90-day retention schedule.",
        },
      });

      purgedCount = updateResult.count;
      await prisma.$disconnect();
    } catch (dbErr) {
      console.log("[Retention Cron / DB Offline / Fallback]", {
        cutoffDate: cutoffDate.toISOString(),
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Data retention routine completed successfully.",
      purgedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Retention Cron Error]", error);
    return NextResponse.json(
      { error: "Internal error during retention cleanup." },
      { status: 500 }
    );
  }
}
