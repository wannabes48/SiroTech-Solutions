const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}
const dbUrl = match[1].trim();

async function run() {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to PostgreSQL...");
    
    // 1. Add PAYSTACK to pay_method enum
    try {
      await pool.query(`ALTER TYPE pay_method ADD VALUE IF NOT EXISTS 'PAYSTACK';`);
      console.log("Added PAYSTACK to pay_method enum");
    } catch (e) {
      console.log("Notice on pay_method enum:", e.message);
    }

    // 2. Add columns to payments table if missing
    await pool.query(`
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100);
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason TEXT;
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_by VARCHAR(100);
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_response JSONB;
    `);
    console.log("Updated payments table columns");

    // 3. Create recurring_plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        plan_type VARCHAR(50) NOT NULL DEFAULT 'CARE_PLAN',
        schedule VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
        amount_kes NUMERIC(14, 2) NOT NULL DEFAULT 0,
        amount_usd NUMERIC(14, 2) DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        auto_send BOOLEAN DEFAULT true,
        next_run_date DATE NOT NULL,
        last_run_date DATE,
        failure_alert TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Created recurring_plans table");

    // 4. Seed initial recurring care plans and retainers if empty
    const existingPlans = await pool.query(`SELECT COUNT(*) FROM recurring_plans`);
    if (parseInt(existingPlans.rows[0].count, 10) === 0) {
      const orgRes = await pool.query(`SELECT id FROM organizations LIMIT 1`);
      const orgId = orgRes.rows[0]?.id;
      const projRes = await pool.query(`SELECT id FROM projects LIMIT 1`);
      const projId = projRes.rows[0]?.id;

      if (orgId) {
        await pool.query(`
          INSERT INTO recurring_plans (org_id, project_id, title, plan_type, schedule, amount_kes, amount_usd, status, auto_send, next_run_date, last_run_date, failure_alert)
          VALUES 
            ($1, $2, 'CoastLane Mission-Critical Production SLA & DevOps Retainer', 'RETAINER', 'MONTHLY', 185000, 1450, 'ACTIVE', true, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE - INTERVAL '18 days', NULL),
            ($1, $2, 'Driver Offline Mobile Engine Quarterly Bug-Bounty & Care Plan', 'CARE_PLAN', 'QUARTERLY', 320000, 2500, 'ACTIVE', true, CURRENT_DATE + INTERVAL '45 days', CURRENT_DATE - INTERVAL '45 days', NULL),
            ($1, $2, 'M-Pesa B2B Telemetry Infrastructure Annual Care & Audit Plan', 'CARE_PLAN', 'YEARLY', 850000, 6600, 'PAUSED', false, CURRENT_DATE + INTERVAL '110 days', CURRENT_DATE - INTERVAL '255 days', 'Warning: Automated debit webhook failed last cycle (404 timeout). Requires card re-authentication.')
        `, [orgId, projId]);
        console.log("Seeded initial recurring plans");
      }
    }

    // 5. Seed Paystack payment samples if none exist
    const paystackPayments = await pool.query(`SELECT COUNT(*) FROM payments WHERE method = 'PAYSTACK'`);
    if (parseInt(paystackPayments.rows[0].count, 10) === 0) {
      const invRes = await pool.query(`SELECT id, org_id FROM invoices LIMIT 2`);
      if (invRes.rows.length > 0) {
        const inv1 = invRes.rows[0];
        await pool.query(`
          INSERT INTO payments (invoice_id, amount_kes, amount_usd, method, provider_tx_id, status, org_id, reference, receipt_number, notes)
          VALUES 
            ($1, 145000.00, 1120.00, 'PAYSTACK', 'pstk_ch_829471934', 'SUCCESS', $2, 'PSTK-98234-KE', 'RCP-PSTK-001', 'Settled via Paystack Card Checkout'),
            ($1, 65000.00, 500.00, 'PAYSTACK', 'pstk_ch_102948123', 'SUCCESS', $2, 'PSTK-11029-KE', 'RCP-PSTK-002', 'Paystack Mobile Money deposit')
        `, [inv1.id, inv1.org_id]);
        console.log("Seeded Paystack payments");
      }
    }

    console.log("Migration finished successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await pool.end();
  }
}

run();
