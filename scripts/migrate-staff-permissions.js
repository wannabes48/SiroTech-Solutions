/**
 * Staff permissions migration (additive, safe to re-run).
 *
 *   node scripts/migrate-staff-permissions.js
 *
 * - users: staff_preset (admin | client_manager | delivery_lead | ...) and
 *   staff_permissions (per-person overrides: "perm" allows, "!perm" denies).
 *   Existing accounts are backfilled from the legacy staff_role column:
 *   ADMIN -> admin, MANAGER -> client_manager, FINANCE -> finance, EDITOR -> editor, SUPPORT -> support.
 * - organizations: account_notes (client manager's private notes), account_manager_id
 * - projects: REQUESTED status, brief, budget_kes, requested_by_id (hand-off from the
 *   client manager), delivery_notes (delivery's private notes), delivery_lead_id
 * - payments: recorded_manually, recorded_by_id (payments marked received by hand)
 * - support_tickets: assignee_id (default routing by category)
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

// Enum values can't be added and used in the same transaction, so this runs first, on its own.
const ENUM_SQL = `ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'REQUESTED' BEFORE 'PLANNING';`;

const SQL = `
-- 1. Staff presets and per-person overrides
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_preset VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_permissions TEXT[] NOT NULL DEFAULT '{}';

UPDATE users SET staff_preset = CASE
    WHEN staff_role = 'ADMIN' THEN 'admin'
    WHEN staff_role = 'MANAGER' THEN 'client_manager'
    WHEN staff_role = 'FINANCE' THEN 'finance'
    WHEN staff_role = 'EDITOR' THEN 'editor'
    WHEN staff_role = 'SUPPORT' THEN 'support'
    WHEN role = 'ADMIN' THEN 'admin'
    ELSE 'support'
  END
  WHERE role IN ('ADMIN', 'STAFF') AND staff_preset IS NULL;

-- Staff must use two-step verification (enforced in requireStaffUser for non-owners)
UPDATE users SET totp_required = true WHERE role IN ('ADMIN', 'STAFF') AND staff_preset <> 'admin';

-- 2. Private notes and owners on each side
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS account_notes TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS delivery_lead_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 3. Project requests (client manager -> delivery)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS brief TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget_kes BIGINT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS requested_by_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS projects_requested_idx ON projects(created_at) WHERE status = 'REQUESTED';

-- 4. Money safeguards: payments marked received by hand
ALTER TABLE payments ADD COLUMN IF NOT EXISTS recorded_manually BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS recorded_by_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 5. Ticket routing
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL;
`;

(async () => {
  const pool = new Pool({ connectionString: databaseUrl(), ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query(ENUM_SQL);
    await client.query("BEGIN");
    await client.query(SQL);
    await client.query("COMMIT");

    const staff = await client.query(
      `SELECT name, email, role, staff_role, staff_preset, COALESCE(array_length(staff_permissions, 1), 0) AS overrides, totp_enabled
       FROM users WHERE role IN ('ADMIN', 'STAFF') ORDER BY staff_preset, name`
    );
    console.log("Staff accounts after migration:");
    console.table(staff.rows);
    const owners = staff.rows.filter((r) => r.staff_preset === "admin");
    if (owners.length === 0) {
      console.warn("WARNING: no account has the admin (owner) preset. Set yours with:");
      console.warn("  UPDATE users SET staff_preset = 'admin', staff_role = 'ADMIN' WHERE email = '<your email>';");
    }
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
