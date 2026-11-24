import { query } from "./db";

/**
 * Approval requests: someone without a permission (e.g. the client manager and
 * invoices:void / payments:refund) asks; an owner approves or denies from the
 * Overview, and approval runs the action automatically.
 */
export type ApprovalAction = "void_invoice" | "refund_invoice" | "refund_payment";

/** The permission an approver must hold for each action. */
export const APPROVAL_PERMISSION: Record<ApprovalAction, string> = {
  void_invoice: "invoices:void",
  refund_invoice: "payments:refund",
  refund_payment: "payments:refund"
};

export const APPROVAL_LABEL: Record<ApprovalAction, string> = {
  void_invoice: "Void invoice",
  refund_invoice: "Refund invoice",
  refund_payment: "Refund payment"
};

export function isApprovalAction(v: unknown): v is ApprovalAction {
  return typeof v === "string" && v in APPROVAL_PERMISSION;
}

export interface ApprovalRow {
  id: string;
  entity: string;
  entity_id: string;
  action: ApprovalAction;
  payload: Record<string, any>;
  reason: string | null;
  status: string;
  requested_by_id: string | null;
  requested_by_name: string | null;
  created_at: string;
  label: string | null; // invoice number or payment reference
  amount_kes: number | null;
  org_name: string | null;
}

const SELECT = `
  SELECT a.*, u.name AS requested_by_name,
         COALESCE(inv.invoice_number, pay.reference, payinv.invoice_number) AS label,
         COALESCE(inv.amount_kes, pay.amount_kes) AS amount_kes,
         COALESCE(o1.name, o2.name) AS org_name
  FROM approvals a
  LEFT JOIN users u ON u.id = a.requested_by_id
  LEFT JOIN invoices inv ON a.entity = 'invoice' AND inv.id = a.entity_id
  LEFT JOIN payments pay ON a.entity = 'payment' AND pay.id = a.entity_id
  LEFT JOIN invoices payinv ON payinv.id = pay.invoice_id
  LEFT JOIN organizations o1 ON o1.id = inv.org_id
  LEFT JOIN organizations o2 ON o2.id = COALESCE(pay.org_id, payinv.org_id)`;

export async function getPendingApprovals(): Promise<ApprovalRow[]> {
  try {
    const res = await query<ApprovalRow>(`${SELECT} WHERE a.status = 'PENDING' ORDER BY a.created_at ASC LIMIT 50`);
    return res.rows;
  } catch {
    return []; // table arrives with scripts/migrate-staff-controls.js
  }
}

/** Open requests on one record, so its page can show "Approval requested". */
export async function getPendingApprovalsFor(entity: "invoice" | "payment", entityIds: string[]): Promise<ApprovalRow[]> {
  if (entityIds.length === 0) return [];
  try {
    const res = await query<ApprovalRow>(
      `${SELECT} WHERE a.status = 'PENDING' AND a.entity = $1 AND a.entity_id = ANY($2::uuid[])`,
      [entity, entityIds]
    );
    return res.rows;
  } catch {
    return [];
  }
}
