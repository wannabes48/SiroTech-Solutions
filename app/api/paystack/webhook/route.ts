import { portalPath, portalUrl } from "@/lib/hosts";
import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { getPaystackConfig, verifyPaystackSignature } from "@/lib/paystack";
import { logAudit } from "@/lib/auth-server";
import { notifyClientUsers } from "@/lib/notifications";
import { sendEmailWithLog } from "@/lib/email-templates/renderer";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    const config = await getPaystackConfig();

    // Verify signature if secretKey or webhookSecret is configured
    const secretKey = config.webhookSecret || config.secretKey;
    if (secretKey) {
      const isValid = verifyPaystackSignature(rawBody, signature, secretKey);
      if (!isValid) {
        console.warn("[Paystack Webhook] Signature verification failed.");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const event = payload.event || "unknown";
    const data = payload.data || {};

    console.log(`[Paystack Webhook] Received event: ${event} (Ref: ${data.reference || "N/A"})`);

    // ==========================================
    // 1. Handle Successful Charge
    // ==========================================
    if (event === "charge.success") {
      const reference = String(data.reference || "");
      const amountSubunits = Number(data.amount || 0);
      const amountKes = amountSubunits > 0 ? amountSubunits / 100 : 0;
      const metadata = data.metadata || {};
      const invoiceId = metadata.invoice_id || metadata.invoiceId;
      const invoiceNumber = metadata.invoice_number || metadata.invoiceNumber;
      const customerEmail = data.customer?.email || "";
      const providerTxId = String(data.id || reference);
      const receiptNumber = `RCP-PSTK-${reference.slice(-8)}`;

      // Locate invoice
      let targetInvoice: any = null;
      if (invoiceId) {
        const invRes = await query("SELECT * FROM invoices WHERE id = $1", [invoiceId]);
        if (invRes.rows.length > 0) targetInvoice = invRes.rows[0];
      }

      if (!targetInvoice && reference) {
        const invRes = await query("SELECT * FROM invoices WHERE payment_reference = $1", [reference]);
        if (invRes.rows.length > 0) targetInvoice = invRes.rows[0];
      }

      if (!targetInvoice && invoiceNumber) {
        const invRes = await query("SELECT * FROM invoices WHERE invoice_number = $1", [invoiceNumber]);
        if (invRes.rows.length > 0) targetInvoice = invRes.rows[0];
      }

      if (targetInvoice) {
        if (targetInvoice.status !== "PAID") {
          await withTransaction(async (client) => {
            // Record payment
            await client.query(
              `INSERT INTO payments (
                invoice_id, org_id, amount_kes, amount_usd, method, provider_tx_id,
                reference, receipt_number, status, gateway_response, notes, created_at
              ) VALUES ($1, $2, $3, $4, 'PAYSTACK', $5, $6, $7, 'SUCCESS', $8, $9, NOW())`,
              [
                targetInvoice.id,
                targetInvoice.org_id,
                amountKes || targetInvoice.amount_kes,
                targetInvoice.amount_usd,
                providerTxId,
                reference,
                receiptNumber,
                JSON.stringify(data),
                `Settled via Paystack (${data.channel || "card"}) - Customer: ${customerEmail}`,
              ]
            );

            // Mark invoice PAID
            await client.query(
              `UPDATE invoices 
               SET status = 'PAID', paid_at = COALESCE($1, NOW()), payment_reference = $2, updated_at = NOW() 
               WHERE id = $3`,
              [data.paid_at ? new Date(data.paid_at) : new Date(), reference, targetInvoice.id]
            );
          });

          // Audit log
          await logAudit(
            targetInvoice.org_id,
            null,
            "INVOICE_PAID",
            "INVOICE",
            targetInvoice.id,
            {
              method: "PAYSTACK",
              reference,
              amountKes: amountKes || targetInvoice.amount_kes,
              channel: data.channel,
              providerTxId,
            }
          );

          // Notifications
          try {
            await notifyClientUsers(
              targetInvoice.org_id,
              {
                type: "PAYMENT",
                title: "Payment Received",
                description: `Payment of KES ${Number(amountKes || targetInvoice.amount_kes).toLocaleString()} received via Paystack for invoice ${targetInvoice.invoice_number}.`,
                targetHref: portalPath(`/invoices/${targetInvoice.id}`)
              }
            );
          } catch (notifErr) {
            console.warn("[Paystack Webhook] Notification error:", notifErr);
          }

          // Email receipt
          try {
            const orgUsers = await query(
              `SELECT u.email, u.name FROM users u 
               INNER JOIN memberships m ON m.user_id = u.id 
               WHERE m.org_id = $1 LIMIT 3`,
              [targetInvoice.org_id]
            );

            for (const u of orgUsers.rows) {
              await sendEmailWithLog({
                templateKey: "payment_received",
                to: u.email,
                data: {
                  client_name: u.name,
                  invoice_number: targetInvoice.invoice_number,
                  "payment.amount": `KES ${Number(amountKes || targetInvoice.amount_kes).toLocaleString()}`,
                  "payment.currency": data.currency || "KES",
                  "payment.reference": reference,
                  "payment.date": new Date(data.paid_at || Date.now()).toLocaleDateString("en-KE", { dateStyle: "long" }),
                  receipt_url: portalUrl(`/invoices/${targetInvoice.id}`),
                },
                metadata: {
                  orgId: targetInvoice.org_id,
                },
              });
            }
          } catch (emailErr) {
            console.warn("[Paystack Webhook] Receipt email error:", emailErr);
          }
        }
      }

      // Log in webhook_events
      await query(
        `INSERT INTO webhook_events (provider, type, status, attempts, payload, received_at, processed_at)
         VALUES ('PAYSTACK', $1, 'PROCESSED', 1, $2, NOW(), NOW())`,
        [event, JSON.stringify(payload)]
      );

      revalidatePath("/portal");
      revalidatePath("/portal/invoices");
      revalidatePath("/admin/payments");
      revalidatePath("/admin/invoices");

      return NextResponse.json({ status: true, message: "Charge processed" });
    }

    // ==========================================
    // 2. Handle Refund Processed
    // ==========================================
    if (event === "refund.processed") {
      const txRef = String(data.transaction_reference || data.reference || "");
      if (txRef) {
        await query(
          `UPDATE payments 
           SET status = 'REFUNDED', refunded_at = NOW(), refund_reason = $1 
           WHERE provider_tx_id = $2 OR reference = $3`,
          [data.customer_note || "Paystack automated refund", txRef, txRef]
        );
      }

      await query(
        `INSERT INTO webhook_events (provider, type, status, attempts, payload, received_at, processed_at)
         VALUES ('PAYSTACK', $1, 'PROCESSED', 1, $2, NOW(), NOW())`,
        [event, JSON.stringify(payload)]
      );

      return NextResponse.json({ status: true, message: "Refund recorded" });
    }

    // Record other Paystack webhook events
    await query(
      `INSERT INTO webhook_events (provider, type, status, attempts, payload, received_at, processed_at)
       VALUES ('PAYSTACK', $1, 'PROCESSED', 1, $2, NOW(), NOW())`,
      [event, JSON.stringify(payload)]
    );

    return NextResponse.json({ status: true, message: "Event ingested" });
  } catch (err: any) {
    console.error("[Paystack Webhook Exception]", err);
    return NextResponse.json({ error: err.message || "Webhook processing error" }, { status: 500 });
  }
}
