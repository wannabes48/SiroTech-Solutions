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
  console.log("Connected to Supabase PostgreSQL database for Backups migration.");

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_backups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        size_bytes BIGINT NOT NULL,
        status VARCHAR(50) DEFAULT 'COMPLETED',
        trigger_type VARCHAR(50) DEFAULT 'AUTOMATED_DAILY',
        checksum_sha256 VARCHAR(64),
        storage_url VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Check count
    const countRes = await client.query("SELECT COUNT(*) FROM system_backups");
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log("Seeding initial backup records...");
      await client.query(`
        INSERT INTO system_backups (filename, size_bytes, status, trigger_type, checksum_sha256, storage_url, created_at)
        VALUES 
        ('sirotech_db_prod_20261014_030000.sql.gz.enc', 18452390, 'COMPLETED', 'AUTOMATED_DAILY', 'a4f981e7d013e218903c734b419bcf82e98218da3a2169542c31e2fbc3870231', 'r2://sirotech-backups/daily/2026/10/14/sirotech_db_prod_20261014_030000.sql.gz.enc', NOW() - INTERVAL '18 hours'),
        ('sirotech_db_prod_20261013_030000.sql.gz.enc', 18321040, 'COMPLETED', 'AUTOMATED_DAILY', 'e23b7089c891a27419e481023a1f7902d38e819bcf1293a10984ba1024e129aa', 'r2://sirotech-backups/daily/2026/10/13/sirotech_db_prod_20261013_030000.sql.gz.enc', NOW() - INTERVAL '42 hours'),
        ('sirotech_db_prod_20261012_030000.sql.gz.enc', 18190200, 'COMPLETED', 'AUTOMATED_DAILY', '998412acb9e102f8194bcf0291a1829e198bba772983712aefbc02148192a014', 'r2://sirotech-backups/daily/2026/10/12/sirotech_db_prod_20261012_030000.sql.gz.enc', NOW() - INTERVAL '66 hours');
      `);
    }

    console.log("Backups table created and ready.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
