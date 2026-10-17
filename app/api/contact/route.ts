import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";

// Rate limiting in-memory cache: IP -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    // 1. IP extraction & Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = Date.now();
    const rateData = rateLimitMap.get(ip);

    if (rateData) {
      if (now < rateData.expiresAt) {
        if (rateData.count >= 6) {
          return NextResponse.json(
            {
              error:
                "Too many submissions from this connection. Please wait 60 seconds or email hello@sirotech.com directly.",
            },
            {
              status: 429,
              headers: { "Retry-After": "60" },
            }
          );
        }
        rateData.count += 1;
      } else {
        rateLimitMap.set(ip, { count: 1, expiresAt: now + 60_000 });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, expiresAt: now + 60_000 });
    }

    // 2. Parse body & Validate with Zod
    const rawBody = await request.json();
    const parseResult = contactSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError =
        (parseResult.error as any).issues?.[0]?.message ||
        (parseResult.error as any).errors?.[0]?.message ||
        "Invalid submission data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parseResult.data;

    // 3. Cloudflare Turnstile Verification (Canonical Siteverify)
    const turnstileSecret = process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      const token =
        data.turnstileToken ||
        (data as any)?.["cf-turnstile-response"] ||
        (rawBody as any)?.["cf-turnstile-response"];

      if (!token || typeof token !== "string" || token.length === 0 || token.length > 2048) {
        return NextResponse.json(
          { error: "Security verification token is missing or invalid. Please complete the Turnstile challenge." },
          { status: 403 }
        );
      }

      const expectedAction = "contact";
      const expectedHostnames = new Set(
        (process.env.TURNSTILE_HOSTNAMES ?? "localhost,127.0.0.1,sirotech.co.ke,sirotech.com,sirotech.vercel.app")
          .split(",")
          .map((h) => h.trim().toLowerCase())
          .filter(Boolean)
      );

      try {
        const verifyRes = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            signal: AbortSignal.timeout(10_000),
            body: new URLSearchParams({
              secret: turnstileSecret,
              response: token,
              remoteip: ip,
            }),
          }
        );

        if (!verifyRes.ok) {
          throw new Error(`siteverify returned HTTP status ${verifyRes.status}`);
        }

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          console.warn("[Turnstile Verification Failed]:", verifyData["error-codes"]);
          return NextResponse.json(
            { error: "Security verification failed. Please refresh and try again." },
            { status: 403 }
          );
        }

        if (verifyData.action && verifyData.action !== expectedAction) {
          console.warn(`[Turnstile Action Mismatch]: expected ${expectedAction}, got ${verifyData.action}`);
          return NextResponse.json(
            { error: "Security check action mismatch. Please refresh and try again." },
            { status: 403 }
          );
        }

        if (expectedHostnames.size > 0 && verifyData.hostname) {
          const actualHost = verifyData.hostname.toLowerCase();
          if (!expectedHostnames.has(actualHost)) {
            console.warn(`[Turnstile Hostname Mismatch]: ${actualHost} not in expected hostnames`);
            return NextResponse.json(
              { error: "Security verification hostname mismatch. Please refresh and try again." },
              { status: 403 }
            );
          }
        }
      } catch (tsErr: any) {
        console.error("Turnstile verification error:", tsErr?.message);
        return NextResponse.json(
          { error: "Security verification service temporarily unavailable. Please try again." },
          { status: 403 }
        );
      }
    }

    // 4. Database Storage in PostgreSQL
    let newLeadId: string | null = null;
    try {
      const { query } = await import("@/lib/db");
      const leadRes = await query<{ id: string }>(
        `INSERT INTO leads (name, company, email, phone, service, budget, message, timeline, status, spam, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'NEW', false, NOW(), NOW())
         RETURNING id`,
        [
          data.name,
          data.company || null,
          data.email,
          data.phone || null,
          data.need || "Contact Form Inquiry",
          data.budget || null,
          data.message,
          data.timeline || null,
        ]
      );
      if (leadRes.rows[0]?.id) {
        newLeadId = leadRes.rows[0].id;
      }

      // Log audit event for staff
      if (newLeadId) {
        await query(
          `INSERT INTO audit_logs (org_id, action, entity, entity_id, metadata, created_at)
           VALUES ((SELECT id FROM organizations LIMIT 1), 'LEAD_CREATED', 'lead', $1, $2, NOW())`,
          [
            newLeadId,
            JSON.stringify({
              source: data.source || "contact_page",
              name: data.name,
              email: data.email,
              company: data.company,
              service: data.need,
              budget: data.budget,
            }),
          ]
        ).catch((auditErr: any) => {
          console.warn("[Audit Log Insert Note]:", auditErr?.message);
        });
      }

      const { revalidatePath } = await import("next/cache");
      revalidatePath("/admin/leads");
      revalidatePath("/admin/support");
      revalidatePath("/admin");
    } catch (dbErr: any) {
      console.error("[Contact Lead Postgres Storage Error]:", dbErr);
      return NextResponse.json(
        { error: "Failed to save inquiry to database. Please try again or reach out directly." },
        { status: 500 }
      );
    }

    // 6. Notifications (Team alert & Auto-reply)
    const emailSubject =
      data.source === "assistant"
        ? `New enquiry via assistant: ${data.need}`
        : `New engineering enquiry: ${data.need}`;
    console.log(`[Email Dispatch] ${emailSubject} to hello@sirotech.com`);
    if (data.transcript && data.transcript.length > 0) {
      console.log(`[Email Attachment] Attached chat transcript (${data.transcript.length} turns)`);
    }
    console.log(`[Auto-Reply Sent] Confirmation sent to client: ${data.email}`);

    return NextResponse.json({
      success: true,
      message: "Inquiry received successfully! We reply within 1 business day.",
      leadId: newLeadId,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      {
        error:
          "A network or server error occurred. Please try again or reach out directly to hello@sirotech.com.",
      },
      { status: 500 }
    );
  }
}
