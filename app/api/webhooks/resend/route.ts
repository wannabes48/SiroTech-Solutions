import crypto from "crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resend delivery webhook (register at https://sirotech.co.ke/api/webhooks/resend).
 * Verifies the Svix signature with RESEND_WEBHOOK_SECRET (whsec_…), then updates
 * email_logs.status by provider id: DELIVERED | BOUNCED | COMPLAINED | DELAYED.
 */
const STATUS: Record<string, string> = {
  "email.delivered": "DELIVERED",
  "email.bounced": "BOUNCED",
  "email.complained": "COMPLAINED",
  "email.delivery_delayed": "DELAYED",
  "email.failed": "FAILED",
};

function verifySvix(body: string, headers: Headers, secret: string): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;
  // Reject replays older/newer than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  return signatures.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig || sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  });
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const body = await request.text();
  if (!verifySvix(body, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = STATUS[event?.type];
  const emailId = event?.data?.email_id;
  if (status && emailId) {
    const reason = event?.data?.bounce?.message || event?.data?.failed?.reason || null;
    await query(
      `UPDATE email_logs SET status = $1, error = COALESCE($2, error) WHERE provider_id = $3`,
      [status, status === "DELIVERED" ? null : reason, emailId]
    );
  }
  return NextResponse.json({ received: true });
}
