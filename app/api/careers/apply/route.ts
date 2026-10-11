import { NextResponse } from "next/server";

// In-memory rate limiting map: IP -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    // 1. Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = Date.now();
    const rateData = rateLimitMap.get(ip);

    if (rateData) {
      if (now < rateData.expiresAt) {
        if (rateData.count >= 5) {
          return NextResponse.json(
            {
              error:
                "Too many applications submitted from this connection. Please wait a minute or email careers@sirotech.com directly.",
            },
            { status: 429 }
          );
        }
        rateData.count += 1;
      } else {
        rateLimitMap.set(ip, { count: 1, expiresAt: now + 60_000 });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, expiresAt: now + 60_000 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const role = formData.get("role")?.toString().trim() || "General Application";
    const portfolioUrl = formData.get("portfolioUrl")?.toString().trim() || "";
    const message = formData.get("message")?.toString().trim() || "";
    const cvFile = formData.get("cv") as File | null;

    // Honeypot check
    const honeypot = formData.get("website")?.toString().trim();
    if (honeypot) {
      return NextResponse.json({ success: true, message: "Application received." });
    }

    // Validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!phone || phone.length < 6) {
      return NextResponse.json(
        { error: "Please provide a valid phone or WhatsApp number." },
        { status: 400 }
      );
    }

    if (cvFile && cvFile.size > 0) {
      if (cvFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Resume file size exceeds the 5 MB limit. Please upload a smaller PDF." },
          { status: 400 }
        );
      }

      const isPdfType = cvFile.type === "application/pdf" || cvFile.name.toLowerCase().endsWith(".pdf");
      if (!isPdfType) {
        return NextResponse.json(
          { error: "Invalid file format. Please upload your resume in PDF format (.pdf)." },
          { status: 400 }
        );
      }
    }

    // Application received - In production, send email to team or push to ATS/Storage
    console.log(`[Career Application] Received candidate: ${name} (${email}) for role: ${role}`);

    return NextResponse.json({
      success: true,
      message: `Thank you, ${name}! Your application for ${role} has been received. Our engineering lead will review your profile and reach out within 5 business days.`,
    });
  } catch (err: any) {
    console.error("[Career Application Error]", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while submitting your application. Please try again or email careers@sirotech.com directly." },
      { status: 500 }
    );
  }
}
