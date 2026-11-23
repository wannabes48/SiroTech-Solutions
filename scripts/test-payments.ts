import { pool } from "../lib/db";

async function main() {
  console.log("Adding missing values to invoice_status enum...");
  try {
    await pool.query("ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'VIEWED';");
    await pool.query("ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'VOID';");
    await pool.query("ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'REFUNDED';");
    console.log("Successfully added VIEWED, VOID, REFUNDED to invoice_status enum.");
  } catch (err: any) {
    console.error("Error adding values to invoice_status:", err);
  }

  const res = await pool.query(`
    SELECT enumlabel 
    FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE pg_type.typname = 'invoice_status'
    ORDER BY enumsortorder;
  `);
  console.log("UPDATED INVOICE_STATUS ENUM VALUES:", res.rows.map(r => r.enumlabel));
  await pool.end();
}

main().catch(console.error);
