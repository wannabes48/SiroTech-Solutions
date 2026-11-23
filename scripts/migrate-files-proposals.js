const { Pool } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/DATABASE_URL=(.+)/)[1].trim();
const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function run() {
  console.log("Altering proposals and files...");
  await pool.query(`
    -- 1. Ensure files has uploaded_at
    ALTER TABLE files ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();
    UPDATE files SET uploaded_at = created_at WHERE uploaded_at IS NULL;

    -- 2. Ensure proposals has project_id, amount_kes, accepted_ip
    ALTER TABLE proposals ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    ALTER TABLE proposals ADD COLUMN IF NOT EXISTS amount_kes BIGINT DEFAULT 0;
    ALTER TABLE proposals ADD COLUMN IF NOT EXISTS accepted_ip VARCHAR(100);
  `);
  console.log("Successfully altered proposals and files!");
  await pool.end();
}

run().catch(console.error);
