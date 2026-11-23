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

const pool = new Pool({
  connectionString: match[1].trim(),
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Adding enhanced columns to staff_sessions...");
    await client.query(`
      ALTER TABLE staff_sessions ADD COLUMN IF NOT EXISTS browser VARCHAR(100);
      ALTER TABLE staff_sessions ADD COLUMN IF NOT EXISTS os VARCHAR(100);
      ALTER TABLE staff_sessions ADD COLUMN IF NOT EXISTS device_type VARCHAR(50) DEFAULT 'desktop';
      ALTER TABLE staff_sessions ADD COLUMN IF NOT EXISTS location VARCHAR(150);
      ALTER TABLE staff_sessions ADD COLUMN IF NOT EXISTS isp VARCHAR(150);
    `);

    // Fetch all staff users
    const staffRes = await client.query(`
      SELECT id, name, email FROM users
      WHERE role = 'STAFF' OR staff_role IS NOT NULL OR email = 'daniel@sirotech.com'
    `);

    console.log(`Found ${staffRes.rows.length} staff users to ensure realistic sessions.`);

    for (const user of staffRes.rows) {
      // Clear old placeholder sessions for this user
      await client.query(`DELETE FROM staff_sessions WHERE user_id = $1`, [user.id]);

      // Seed 3 realistic sessions
      await client.query(`
        INSERT INTO staff_sessions (
          user_id,
          device_info,
          browser,
          os,
          device_type,
          ip_address,
          location,
          isp,
          is_current,
          last_active,
          created_at
        ) VALUES 
        (
          $1,
          'Chrome 134 • Windows 11 Pro Workstation',
          'Google Chrome 134.0',
          'Windows 11 Pro 64-bit',
          'desktop',
          '197.232.88.42',
          'Nairobi, Kenya (Kilimani)',
          'Safaricom Home Fibre (Gigabit)',
          true,
          NOW(),
          NOW() - INTERVAL '14 days'
        ),
        (
          $1,
          'Safari 18.3 • MacBook Pro 16" (M3 Max)',
          'Apple Safari 18.3',
          'macOS Sequoia 15.3.1',
          'laptop',
          '102.219.208.15',
          'Nairobi, Kenya (Westlands Tech Hub)',
          'Liquid Intelligent Technologies',
          false,
          NOW() - INTERVAL '3 hours 15 minutes',
          NOW() - INTERVAL '8 days'
        ),
        (
          $1,
          'Mobile Safari • iPhone 16 Pro Max',
          'Mobile Safari 18.2',
          'iOS 18.2',
          'mobile',
          '197.237.142.89',
          'Nairobi, Kenya (Karen)',
          'Safaricom 5G Mobile',
          false,
          NOW() - INTERVAL '1 day 4 hours',
          NOW() - INTERVAL '5 days'
        );
      `, [user.id]);

      console.log(`Seeded 3 realistic active sessions for ${user.name} (${user.email})`);
    }

    await client.query("COMMIT");
    console.log("Migration and seeding of realistic staff sessions completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
