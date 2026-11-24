import { NextResponse } from "next/server";
import { sendWeeklyDigest } from "@/lib/weekly-digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Monday staff digest (new leads, requests awaiting scoping, overdue invoices,
 * tickets near SLA breach, approvals). Scheduled in vercel.json; Vercel sends
 * `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await sendWeeklyDigest();
  return NextResponse.json(result);
}
