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

async function main() {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Adding last_login_at column to users table...");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;");
    console.log("Column added or verified successfully.");

    const check = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'last_login_at'
    `);
    console.log("Verified column in public.users:", check.rows);

    // Initialize last_login_at from staff_sessions or created_at for users where it's null
    const updated = await pool.query(`
      UPDATE users u
      SET last_login_at = COALESCE(
        (SELECT MAX(last_active) FROM staff_sessions WHERE user_id = u.id),
        u.created_at,
        NOW()
      )
      WHERE u.last_login_at IS NULL;
    `);
    console.log("Initialized last_login_at for existing users. Rows affected:", updated.rowCount);

    const testStaffQuery = await pool.query(`
      SELECT id, name, email, role, staff_role, totp_enabled, last_login_at, created_at
      FROM users
      WHERE role = 'STAFF' OR role = 'ADMIN'
      ORDER BY name ASC
    `);
    console.log("getAdminStaffUsers query test successful! Rows:", testStaffQuery.rows);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
