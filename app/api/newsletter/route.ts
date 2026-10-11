import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // In production with database wired up, persist to Subscriber model:
    // await prisma.subscriber.upsert({ where: { email }, create: { email }, update: {} });
    console.log(`[Newsletter] New subscriber: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to SiroTech Insights!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
