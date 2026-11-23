const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = match[1].trim();

function hash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

async function main() {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  console.log("Connected to database.");

  // Update Brian Osano
  await pool.query(
    "UPDATE users SET password_hash = $1 WHERE email = 'ongeribrian35@gmail.com'",
    [hash('BrianPass2026!')]
  );
  console.log("Updated Brian Osano password (BrianPass2026!)");

  // Insert or update Faith Wanjiku
  await pool.query(`
    INSERT INTO users (id, name, email, password_hash, role, phone, timezone)
    VALUES ('b0f52cf9-0000-0000-0000-000000000010', 'Faith Wanjiku', 'faith.wanjiku@coastlane.co.ke', $1, 'CLIENT', '+254 712 345 678', 'Africa/Nairobi')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
  `, [hash('FaithPass2026!')]);
  console.log("Upserted Faith Wanjiku (FaithPass2026!)");

  // Add membership for Faith
  await pool.query(`
    INSERT INTO memberships (org_id, user_id, role)
    SELECT 'e0f52cf9-0000-0000-0000-000000000001', id, 'OWNER'
    FROM users WHERE email = 'faith.wanjiku@coastlane.co.ke'
    ON CONFLICT DO NOTHING;
  `);

  // Ensure notification preferences exist
  await pool.query(`
    INSERT INTO notification_preferences (user_id)
    SELECT id FROM users WHERE email = 'faith.wanjiku@coastlane.co.ke'
    ON CONFLICT DO NOTHING;
  `);

  console.log("Users and memberships successfully updated.");
  await pool.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
