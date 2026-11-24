/**
 * Staff controls migration (additive, safe to re-run). Run after migrate-staff-permissions.js.
 *
 *   node scripts/migrate-staff-controls.js
 *
 * - approvals: "Request approval" for actions a person isn't allowed to run
 *   (void invoice, refund). An owner approves or denies; approval runs the action.
 * - milestones.ready_to_bill: delivery can release a milestone for billing before
 *   the client approves it. invoices.milestone_id links an invoice to its milestone.
 * - users.staff_scope: 'all' (default) or 'assigned' (only clients where they are the
 *   account manager and projects where they are the delivery lead).
 *
 * Reads DATABASE_URL from .env.local (or the environment).
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.join(__dirname, "..", ".env.local");
  const m = fs.readFileSync(envPath, "utf8").match(/^DATABASE_URL=(.+)$/m);
  if (!m) throw new Error("DATABASE_URL not found");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const SQL = `
-- 1. Approval requests
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity VARCHAR(30) NOT NULL,             -- invoice | payment
  entity_id UUID NOT NULL,
  action VARCHAR(40) NOT NULL,             -- void_invoice | refund_invoice | refund_payment
  payload JSONB NOT NULL DEFAULT '{}',     -- e.g. { "amountKes": 1000 }
  reason TEXT,
  status VARCHAR(12) NOT NULL DEFAULT 'PENDING',  -- PENDING | APPROVED | DENIED | FAILED
  requested_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  decided_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  decision_note TEXT,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS approvals_pending_idx ON approvals(created_at) WHERE status = 'PENDING';
-- One open request per action on the same record
CREATE UNIQUE INDEX IF NOT EXISTS approvals_one_pending_idx ON approvals(entity, entity_id, action) WHERE status = 'PENDING';

-- 2. Billing gated on delivery
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS ready_to_bill BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS ready_to_bill_by_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL;

-- 3. Assigned-only access
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_scope VARCHAR(20) NOT NULL DEFAULT 'all';
CREATE INDEX IF NOT EXISTS organizations_account_manager_idx ON organizations(account_manager_id) WHERE account_manager_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS projects_delivery_lead_idx ON projects(delivery_lead_id) WHERE delivery_lead_id IS NOT NULL;
`;

(async () => {
  const pool = new Pool({ connectionString: databaseUrl(), ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(SQL);
    await client.query("COMMIT");
    const check = await client.query(
      `SELECT table_name, column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND (
         (table_name = 'approvals' AND column_name = 'status') OR
         (table_name = 'milestones' AND column_name = 'ready_to_bill') OR
         (table_name = 'invoices' AND column_name = 'milestone_id') OR
         (table_name = 'users' AND column_name = 'staff_scope'))
       ORDER BY table_name`
    );
    console.table(check.rows);
    console.log("Done.");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
