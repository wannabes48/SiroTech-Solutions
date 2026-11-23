import { NextRequest, NextResponse } from "next/server";
import { requireStaffUser, logAdminAudit } from "@/lib/admin-permissions";
import { query } from "@/lib/db";

const ALLOWED_TABLES: Record<string, string> = {
  leads: "leads",
  organizations: "organizations",
  users: "users",
  projects: "projects",
  milestones: "milestones",
  invoices: "invoices",
  payments: "payments",
  support_tickets: "support_tickets",
  audit_logs: "audit_logs",
  content_items: "content_items",
  media: "media",
  system_backups: "system_backups",
  tasks: "tasks",
  consultations: "consultations"
};

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaffUser("reports:export");
    const { searchParams } = new URL(request.url);
    const tableKey = searchParams.get("table") || "";

    const tableName = ALLOWED_TABLES[tableKey];
    if (!tableName) {
      return NextResponse.json(
        { error: `Invalid table: '${tableKey}'. Allowed tables: ${Object.keys(ALLOWED_TABLES).join(", ")}` },
        { status: 400 }
      );
    }

    const res = await query(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT 5000`);
    
    // Sanitize any sensitive credentials
    const sanitizedRows = res.rows.map(row => {
      const copy = { ...row };
      if ("password_hash" in copy) delete copy.password_hash;
      if ("totp_secret" in copy) delete copy.totp_secret;
      return copy;
    });

    await logAdminAudit({
      userId: staff.id,
      userName: staff.name,
      action: "TABLE_DATA_EXPORTED",
      entity: tableName,
      metadata: { rowCount: sanitizedRows.length }
    });

    const filename = `sirotech_${tableName}_export_${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(sanitizedRows, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_NOT_FOUND" || error?.message?.includes("Forbidden")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Export API Error]", error);
    return NextResponse.json({ error: "Internal export failure" }, { status: 500 });
  }
}
