const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const dbUrl = match[1].trim();

async function run() {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  console.log("Connected to database.");

  try {
    await client.query("ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'VIEWED';");
    await client.query("ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'VOID';");
    await client.query("ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'REFUNDED';");
    console.log("Successfully added VIEWED, VOID, REFUNDED to invoice_status enum.");

    const res = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'invoice_status'
      ORDER BY enumsortorder;
    `);
    console.log("INVOICE_STATUS ENUMS:", res.rows.map(r => r.enumlabel));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
