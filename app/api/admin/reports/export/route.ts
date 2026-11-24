import { NextRequest, NextResponse } from "next/server";
import { requireStaffUser, can, recordExport } from "@/lib/admin-permissions";
import { unstable_rethrow } from "next/navigation";
import { query } from "@/lib/db";

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  if (val instanceof Date) {
    return `"${val.toISOString().slice(0, 19).replace("T", " ")}"`;
  }
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function getDateClause(columnName: string, range: string): string {
  if (range === "30d") {
    return ` AND ${columnName} >= NOW() - INTERVAL '30 days'`;
  }
  if (range === "quarter") {
    return ` AND ${columnName} >= date_trunc('quarter', NOW())`;
  }
  if (range === "year") {
    return ` AND ${columnName} >= date_trunc('year', NOW())`;
  }
  return "";
}

/** Each report needs its own export permission (audited, owners alerted). */
const REPORT_PERMISSION: Record<string, string> = {
  revenue: "payments:export",
  leads: "leads:export",
  consultations: "leads:export",
  delivery: "projects:write",
  support: "tickets:assign",
  audit: "audit:read"
};

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaffUser("reports:read");
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "revenue";
    const range = searchParams.get("range") || "all";
    if (!can(staff, REPORT_PERMISSION[type] || "backups:export")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const dateToday = new Date().toISOString().slice(0, 10);
    let filename = `sirotech_${type}_report_${dateToday}.csv`;
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === "revenue") {
      const dateClause = getDateClause("inv.issue_date", range);
      const res = await query(`
        SELECT 
          inv.invoice_number,
          o.name AS client_name,
          COALESCE(o.tax_pin, 'N/A') AS tax_pin,
          COALESCE(p.title, inv.project_title, 'Standard Software Contract') AS project_title,
          inv.issue_date,
          inv.due_date,
          inv.amount_kes,
          inv.amount_usd,
          inv.status,
          inv.paid_at,
          COALESCE(pay.method::text, inv.payment_reference, 'Paystack / Bank Wire') AS payment_method,
          COALESCE(pay.reference, inv.payment_reference, '') AS transaction_ref
        FROM invoices inv
        INNER JOIN organizations o ON o.id = inv.org_id
        LEFT JOIN projects p ON p.id = inv.project_id
        LEFT JOIN LATERAL (
          SELECT method, reference, created_at 
          FROM payments 
          WHERE invoice_id = inv.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) pay ON true
        WHERE 1=1 ${dateClause}
        ORDER BY inv.issue_date DESC
      `);

      headers = [
        "Invoice Number",
        "Client Organization",
        "KRA PIN",
        "Project / Contract",
        "Issue Date",
        "Due Date",
        "Subtotal Excl VAT (KES)",
        "VAT (16%) (KES)",
        "Total Invoiced (KES)",
        "Total Invoiced (USD)",
        "Status",
        "Payment Date",
        "Settlement Method",
        "Payment Reference"
      ];

      rows = res.rows.map((r: any) => {
        const totalKes = Number(r.amount_kes || 0);
        // Assuming VAT 16% standard inclusive pricing: Subtotal = Total / 1.16, VAT = Total - Subtotal
        const subtotalKes = Math.round(totalKes / 1.16);
        const vatKes = totalKes - subtotalKes;

        return [
          r.invoice_number || "",
          r.client_name || "",
          r.tax_pin || "",
          r.project_title || "",
          r.issue_date ? new Date(r.issue_date).toISOString().slice(0, 10) : "",
          r.due_date ? new Date(r.due_date).toISOString().slice(0, 10) : "",
          subtotalKes.toString(),
          vatKes.toString(),
          totalKes.toString(),
          Number(r.amount_usd || 0).toString(),
          r.status || "",
          r.paid_at ? new Date(r.paid_at).toISOString().slice(0, 19).replace("T", " ") : "",
          r.payment_method || "",
          r.transaction_ref || ""
        ];
      });
    } else if (type === "leads") {
      const dateClause = getDateClause("l.created_at", range);
      const res = await query(`
        SELECT 
          l.id,
          l.name,
          l.email,
          l.phone,
          l.company,
          l.service,
          l.budget,
          l.timeline,
          l.status,
          l.value,
          l.currency,
          l.utm,
          l.created_at,
          l.updated_at
        FROM leads l
        WHERE (l.spam IS NULL OR l.spam = false) ${dateClause}
        ORDER BY l.created_at DESC
      `);

      headers = [
        "Lead ID",
        "Client Contact",
        "Email Address",
        "Phone Number",
        "Company / Org",
        "Service Required",
        "Stated Budget",
        "Target Timeline",
        "Pipeline Stage",
        "Deal Value (KES)",
        "Currency",
        "Campaign / UTM Source",
        "Campaign Medium",
        "Created Date"
      ];

      rows = res.rows.map((l: any) => {
        const utm = typeof l.utm === "object" && l.utm !== null ? l.utm : {};
        return [
          l.id || "",
          l.name || "",
          l.email || "",
          l.phone || "",
          l.company || "",
          l.service || "",
          l.budget || "",
          l.timeline || "",
          l.status || "NEW",
          Number(l.value || 0).toString(),
          l.currency || "KES",
          utm.source || utm.utm_source || "direct",
          utm.medium || utm.utm_medium || "none",
          l.created_at ? new Date(l.created_at).toISOString().slice(0, 19).replace("T", " ") : ""
        ];
      });
    } else if (type === "consultations") {
      const dateClause = getDateClause("c.scheduled_at", range);
      const res = await query(`
        SELECT 
          c.id,
          c.name,
          c.email,
          c.phone,
          c.company,
          c.scheduled_at,
          c.status,
          c.cal_booking_id,
          c.notes,
          c.created_at
        FROM consultations c
        WHERE 1=1 ${dateClause}
        ORDER BY c.scheduled_at DESC
      `);

      headers = [
        "Booking ID",
        "Client Contact",
        "Email Address",
        "Phone Number",
        "Company",
        "Scheduled Date & Time",
        "Status",
        "Cal.com Booking Ref",
        "Client Notes / Goals",
        "Booked Date"
      ];

      rows = res.rows.map((c: any) => [
        c.id || "",
        c.name || "",
        c.email || "",
        c.phone || "",
        c.company || "",
        c.scheduled_at ? new Date(c.scheduled_at).toISOString().slice(0, 19).replace("T", " ") : "",
        c.status || "SCHEDULED",
        c.cal_booking_id || "",
        c.notes || "",
        c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : ""
      ]);
    } else if (type === "delivery") {
      const dateClause = getDateClause("m.due_date", range);
      const res = await query(`
        SELECT 
          m.id,
          m.phase,
          m.title,
          m.deliverables,
          m.due_date,
          m.status,
          m.approved_at,
          u.name AS approved_by_name,
          p.title AS project_title,
          o.name AS client_name
        FROM milestones m
        INNER JOIN projects p ON p.id = m.project_id
        INNER JOIN organizations o ON o.id = p.org_id
        LEFT JOIN users u ON u.id = m.approved_by_id
        WHERE 1=1 ${dateClause}
        ORDER BY p.title ASC, m.phase ASC, m.due_date ASC
      `);

      headers = [
        "Milestone ID",
        "Client Organization",
        "Project Title",
        "Sprint Phase",
        "Milestone Title",
        "Key Deliverables",
        "Target Due Date",
        "Approval Status",
        "Approved At",
        "Approved By"
      ];

      rows = res.rows.map((m: any) => [
        m.id || "",
        m.client_name || "",
        m.project_title || "",
        `Phase ${m.phase}`,
        m.title || "",
        m.deliverables || "",
        m.due_date ? new Date(m.due_date).toISOString().slice(0, 10) : "",
        m.status || "IN_PROGRESS",
        m.approved_at ? new Date(m.approved_at).toISOString().slice(0, 19).replace("T", " ") : "",
        m.approved_by_name || ""
      ]);
    } else if (type === "support") {
      const dateClause = getDateClause("t.created_at", range);
      const res = await query(`
        SELECT 
          t.id,
          t.ticket_number,
          o.name AS client_name,
          COALESCE(p.title, t.project_title, 'General Platform') AS project_title,
          t.subject,
          t.category,
          t.priority,
          t.status,
          t.assignee_name,
          t.created_at,
          t.updated_at,
          (SELECT COUNT(*) FROM ticket_replies r WHERE r.ticket_id = t.id) AS reply_count
        FROM support_tickets t
        INNER JOIN organizations o ON o.id = t.org_id
        LEFT JOIN projects p ON p.id = t.project_id
        WHERE 1=1 ${dateClause}
        ORDER BY t.created_at DESC
      `);

      headers = [
        "Ticket Number",
        "Client Organization",
        "Project",
        "Subject / Issue",
        "Category",
        "Priority",
        "Ticket Status",
        "Assigned Engineer",
        "Total Replies",
        "Created At",
        "Last Activity"
      ];

      rows = res.rows.map((t: any) => [
        t.ticket_number || "",
        t.client_name || "",
        t.project_title || "",
        t.subject || "",
        t.category || "",
        t.priority || "",
        t.status || "",
        t.assignee_name || "Unassigned",
        (t.reply_count || 0).toString(),
        t.created_at ? new Date(t.created_at).toISOString().slice(0, 19).replace("T", " ") : "",
        t.updated_at ? new Date(t.updated_at).toISOString().slice(0, 19).replace("T", " ") : ""
      ]);
    } else if (type === "audit") {
      const dateClause = getDateClause("al.created_at", range);
      const res = await query(`
        SELECT 
          al.id,
          al.created_at,
          COALESCE(o.name, 'Global') AS org_name,
          COALESCE(u.name, 'System') AS user_name,
          COALESCE(u.email, 'system@sirotech.co.ke') AS user_email,
          al.action,
          al.entity,
          al.entity_id,
          al.ip_address,
          al.user_agent,
          al.metadata
        FROM audit_logs al
        LEFT JOIN organizations o ON o.id = al.org_id
        LEFT JOIN users u ON u.id = al.user_id
        WHERE 1=1 ${dateClause}
        ORDER BY al.created_at DESC
        LIMIT 2500
      `);

      headers = [
        "Log ID",
        "Timestamp (UTC)",
        "Organization",
        "User Name",
        "User Email",
        "Action Executed",
        "Entity Type",
        "Target ID",
        "IP Address",
        "User Agent",
        "Metadata Payload"
      ];

      rows = res.rows.map((al: any) => [
        al.id || "",
        al.created_at ? new Date(al.created_at).toISOString().slice(0, 19).replace("T", " ") : "",
        al.org_name || "",
        al.user_name || "",
        al.user_email || "",
        al.action || "",
        al.entity || "",
        al.entity_id || "",
        al.ip_address || "",
        al.user_agent || "",
        typeof al.metadata === "object" ? JSON.stringify(al.metadata) : String(al.metadata || "")
      ]);
    } else {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    // Build RFC 4180 CSV with UTF-8 BOM (\uFEFF)
    const headerLine = headers.map(escapeCsv).join(",");
    const bodyLines = rows.map((r) => r.map(escapeCsv).join(","));
    const csvContent = "\uFEFF" + [headerLine, ...bodyLines].join("\r\n");

    // Audit entry, plus an alert to the owners when someone else exports
    await recordExport(staff, `${type} report (${range})`, rows.length, Buffer.byteLength(csvContent));

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    unstable_rethrow(error); // let notFound()/redirect() through
    console.error("[Admin Reports CSV Export Error]", error);
    return NextResponse.json({ error: "Export generation failed" }, { status: 500 });
  }
}
