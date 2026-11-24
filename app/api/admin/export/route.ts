import { NextRequest, NextResponse } from "next/server";
import { requireStaffUser, can, recordExport } from "@/lib/admin-permissions";
import { unstable_rethrow } from "next/navigation";
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

/** Each table needs its own export permission; anything not listed is a full backup export (owner). */
const TABLE_PERMISSION: Record<string, string> = {
  leads: "leads:export",
  consultations: "leads:export",
  organizations: "clients:export",
  invoices: "payments:export",
  payments: "payments:export"
};

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaffUser();
    const { searchParams } = new URL(request.url);
    const tableKey = searchParams.get("table") || "";
    if (!can(staff, TABLE_PERMISSION[tableKey] || "backups:export")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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

    // Private notes never leave in an export unless the person could read them.
    const visibleRows = sanitizedRows.map((row) => {
      const copy: Record<string, any> = { ...row };
      if ("account_notes" in copy && !can(staff, "clients:internal")) delete copy.account_notes;
      if ("delivery_notes" in copy && !can(staff, "projects:internal")) delete copy.delivery_notes;
      if ("staff_permissions" in copy && !can(staff, "staff:read")) delete copy.staff_permissions;
      return copy;
    });
    const body = JSON.stringify(visibleRows, null, 2);
    await recordExport(staff, tableName, visibleRows.length, Buffer.byteLength(body));

    const filename = `sirotech_${tableName}_export_${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    unstable_rethrow(error); // let notFound()/redirect() through
    console.error("[Export API Error]", error);
    return NextResponse.json({ error: "Internal export failure" }, { status: 500 });
  }
}
