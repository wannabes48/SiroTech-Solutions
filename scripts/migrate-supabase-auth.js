/**
 * Supabase Auth + enquiry email migration (additive, safe to re-run).
 *
 *   node scripts/migrate-supabase-auth.js
 *
 * - users: profile columns for Supabase Auth (auth_id already exists), active flag,
 *   invite tracking and the resend cooldown timestamp
 * - auth_email_logs: every invite / sign-in link / reset request and its outcome
 * - leads: per-email delivery state for the team notification and visitor auto-reply
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
-- 1. Profiles (users) for Supabase Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_access_email_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_key ON users(auth_id) WHERE auth_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

-- People who have signed in before count as accepted
UPDATE users SET accepted_at = last_login_at WHERE accepted_at IS NULL AND last_login_at IS NOT NULL;

-- 2. Invite / sign-in link / reset request log (shown in Admin > Emails)
CREATE TABLE IF NOT EXISTS auth_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(30) NOT NULL,            -- invite | signin_link | recovery | signup | revoke
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  area VARCHAR(10),                     -- portal | admin
  status VARCHAR(20) NOT NULL,          -- SENT | FAILED | SKIPPED
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_email_logs_created_idx ON auth_email_logs(created_at DESC);

-- 3. Enquiry emails: save the lead first, track each email, retry failures
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notify_status VARCHAR(10) NOT NULL DEFAULT 'PENDING';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS autoreply_status VARCHAR(10) NOT NULL DEFAULT 'PENDING';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_last_error TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_next_retry_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS leads_email_retry_idx ON leads(email_next_retry_at)
  WHERE notify_status = 'FAILED' OR autoreply_status = 'FAILED';

-- Leads from before this change never had real emails sent; don't retry them.
UPDATE leads SET notify_status = 'SKIPPED', autoreply_status = 'SKIPPED'
  WHERE notify_status = 'PENDING' AND autoreply_status = 'PENDING' AND email_attempts = 0
    AND created_at < NOW() - INTERVAL '1 minute';

-- Resend webhook looks up logs by provider id
CREATE INDEX IF NOT EXISTS email_logs_provider_id_idx ON email_logs(provider_id);
`;

(async () => {
  const pool = new Pool({ connectionString: databaseUrl(), ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(SQL);
    await client.query("COMMIT");
    const cols = await client.query(
      `SELECT table_name, column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND (
         (table_name = 'users' AND column_name IN ('active','invited_at','accepted_at','invited_by_id','last_access_email_at')) OR
         (table_name = 'leads' AND column_name IN ('notify_status','autoreply_status','email_attempts','email_last_error','email_next_retry_at')) OR
         table_name = 'auth_email_logs')
       ORDER BY table_name, column_name`
    );
    console.log("Migration complete. Columns present:");
    for (const r of cols.rows) console.log(`  ${r.table_name}.${r.column_name}`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Migration failed, rolled back:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
