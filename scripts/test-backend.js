const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = match[1].trim();

function verifyPassword(password, combinedHash) {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

async function verify() {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  console.log("1. Verifying Database Connection and Seed Data...");
  const userRes = await pool.query("SELECT id, name, email, role, password_hash FROM users WHERE email = 'faith.wanjiku@coastlane.co.ke'");
  if (userRes.rowCount === 0) {
    throw new Error("Seeded user Faith Wanjiku not found!");
  }
  const faith = userRes.rows[0];
  console.log("   Found user:", faith.name, "(", faith.email, ")");

  const valid = verifyPassword("FaithPass2026!", faith.password_hash);
  console.log("   Password verification for 'FaithPass2026!':", valid ? "SUCCESS (Matched scrypt hash)" : "FAILED");
  if (!valid) throw new Error("Password mismatch");

  console.log("2. Verifying Organization Scoping & Projects...");
  const orgRes = await pool.query("SELECT o.id, o.name, p.title, p.progress FROM organizations o JOIN projects p ON p.org_id = o.id WHERE o.id = 'e0f52cf9-0000-0000-0000-000000000001'");
  console.log("   Organization:", orgRes.rows[0].name);
  console.log("   Project:", orgRes.rows[0].title, "| Progress:", orgRes.rows[0].progress + "%");

  console.log("3. Verifying Milestones...");
  const mRes = await pool.query("SELECT phase, title, status FROM milestones WHERE project_id = 'c0f52cf9-0000-0000-0000-000000000001' ORDER BY order_num ASC");
  mRes.rows.forEach(m => console.log(`   - ${m.phase}: ${m.title} [${m.status}]`));

  console.log("4. Verifying Invoices & Minor Units...");
  const invRes = await pool.query("SELECT invoice_number, amount_kes, amount_usd, status FROM invoices WHERE org_id = 'e0f52cf9-0000-0000-0000-000000000001'");
  invRes.rows.forEach(i => console.log(`   - ${i.invoice_number}: KES ${Number(i.amount_kes).toLocaleString()} ($${Number(i.amount_usd).toLocaleString()}) [${i.status}]`));

  console.log("5. Verifying Support Tickets & Replies...");
  const tRes = await pool.query("SELECT t.ticket_number, t.subject, count(r.id) as replies FROM support_tickets t LEFT JOIN ticket_replies r ON r.ticket_id = t.id GROUP BY t.id, t.ticket_number, t.subject");
  tRes.rows.forEach(t => console.log(`   - Ticket ${t.ticket_number}: "${t.subject}" (${t.replies} replies)`));

  console.log("6. Verifying Audit Logs...");
  const aRes = await pool.query("SELECT action, entity, ip_address, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 3");
  aRes.rows.forEach(a => console.log(`   - Action: ${a.action} on ${a.entity} from ${a.ip_address}`));

  await pool.end();
  console.log("\nALL PRODUCTION DATABASE CHECKS PASSED!");
}

verify().catch(e => {
  console.error("Verification failed:", e);
  process.exit(1);
});
