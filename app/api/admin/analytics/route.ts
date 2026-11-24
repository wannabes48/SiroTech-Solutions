import { NextRequest, NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin-permissions";
import { unstable_rethrow } from "next/navigation";
import { getGoogleAnalyticsReport } from "@/lib/analytics/google-analytics";

export async function GET(req: NextRequest) {
  try {
    await requireStaffUser("analytics:read");

    const searchParams = req.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "true";

    const report = await getGoogleAnalyticsReport(forceRefresh);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    unstable_rethrow(error);
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[GET /api/admin/analytics error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStaffUser("analytics:read");

    const body = await req.json().catch(() => ({}));
    const forceRefresh = Boolean(body.forceRefresh);

    const report = await getGoogleAnalyticsReport(forceRefresh);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    unstable_rethrow(error);
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[POST /api/admin/analytics error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to query analytics" },
      { status: 500 }
    );
  }
}
