import { NextResponse } from "next/server";
import { dueLeadEmailRetries, processLeadEmails } from "@/lib/lead-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retries enquiry emails (team notification / auto-reply) that failed.
 * Scheduled in vercel.json; Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ids = await dueLeadEmailRetries();
  const results: Record<string, unknown> = {};
  for (const id of ids) {
    try {
      results[id] = await processLeadEmails(id);
    } catch (err: any) {
      results[id] = { error: err?.message || String(err) };
    }
  }
  return NextResponse.json({ retried: ids.length, results });
}
