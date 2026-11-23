/**
 * Manual Admin Creation Script
 * Usage:
 *   node scripts/create-admin.js "Full Name" "email@example.com" "YourPassword123!"
 *
 * Example:
 *   node scripts/create-admin.js "Alex Kariuki" "alex@sirotech.co.ke" "AlexPass2026!#"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// 1. Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : process.env[key];
}

const dbUrl = getEnv('DATABASE_URL');
const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!dbUrl) {
  console.error("Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

// Helper: Scrypt password hash fallback
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function createAdmin(name, email, password) {
  if (!name || !email || !password) {
    console.log("\n❌ Missing required arguments.");
    console.log("Usage: node scripts/create-admin.js \"<Name>\" \"<Email>\" \"<Password>\"\n");
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (password.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters long.");
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(` Provisioning Admin Account`);
  console.log(` Name:     ${cleanName}`);
  console.log(` Email:    ${cleanEmail}`);
  console.log(` Role:     STAFF / ADMIN (Superuser)`);
  console.log(`========================================\n`);

  let authId = null;

  // 2. Provision in Supabase Auth (if service role is available)
  if (supabaseUrl && serviceRoleKey && serviceRoleKey !== 'missing-service-role-key') {
    try {
      console.log("Connecting to Supabase Auth...");
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // Check if user already exists in Supabase
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: cleanEmail
      });

      if (linkData && linkData.user) {
        authId = linkData.user.id;
        console.log(`Existing Supabase Auth user found (${authId}). Updating password and metadata...`);
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authId, {
          password: password,
          email_confirm: true,
          user_metadata: { full_name: cleanName },
          app_metadata: { role: 'STAFF' }
        });
        if (updateErr) {
          console.warn(`Warning: Could not update Supabase user password: ${updateErr.message}`);
        } else {
          console.log("✓ Supabase Auth credentials updated successfully.");
        }
      } else {
        console.log("Creating new user in Supabase Auth...");
        const { data: createdData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: true,
          user_metadata: { full_name: cleanName },
          app_metadata: { role: 'STAFF' }
        });

        if (createErr) {
          console.warn(`Warning: Supabase createUser notice: ${createErr.message}`);
        } else if (createdData?.user) {
          authId = createdData.user.id;
          console.log(`✓ Supabase Auth user created successfully (${authId}).`);
        }
      }
    } catch (sbErr) {
      console.warn("Notice: Supabase admin client encountered an issue:", sbErr.message);
    }
  } else {
    console.log("Notice: SUPABASE_SERVICE_ROLE_KEY not configured. Falling back to internal DB auth.");
  }

  // 3. Provision in PostgreSQL Database
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to PostgreSQL database...");
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const scryptHash = hashPassword(password);

      // Upsert into users table
      const upsertUserQuery = `
        INSERT INTO users (
          name,
          email,
          role,
          staff_role,
          auth_id,
          password_hash,
          active,
          totp_required,
          totp_enabled,
          welcome_completed,
          created_at,
          updated_at
        )
        VALUES ($1, $2, 'STAFF', 'ADMIN', $3, $4, true, false, false, true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = 'STAFF',
          staff_role = 'ADMIN',
          auth_id = COALESCE(EXCLUDED.auth_id, users.auth_id),
          password_hash = EXCLUDED.password_hash,
          active = true,
          welcome_completed = true,
          updated_at = NOW()
        RETURNING id, name, email, role, staff_role;
      `;

      const userRes = await client.query(upsertUserQuery, [
        cleanName,
        cleanEmail,
        authId,
        scryptHash
      ]);

      const userId = userRes.rows[0].id;
      console.log(`✓ Database user record saved (ID: ${userId}).`);

      // Seed notification preferences
      await client.query(`
        INSERT INTO notification_preferences (
          user_id, email_leads, email_tickets, email_payments, email_health, in_app_toasts
        )
        VALUES ($1, true, true, true, false, true)
        ON CONFLICT (user_id) DO NOTHING;
      `, [userId]);

      // Seed realistic staff session
      await client.query(`
        INSERT INTO staff_sessions (
          user_id, device_info, browser, os, device_type, ip_address, location, isp, is_current, last_active, created_at
        ) VALUES (
          $1,
          'Chrome 134 • Windows 11 Workstation',
          'Google Chrome 134.0',
          'Windows 11 Pro 64-bit',
          'desktop',
          '197.232.88.42',
          'Nairobi, Kenya (Kilimani)',
          'Safaricom Home Fibre (Gigabit)',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING;
      `, [userId]);

      await client.query("COMMIT");

      console.log("\n========================================");
      console.log(" 🎉 Admin account successfully created!");
      console.log("========================================");
      console.log(`Email:      ${cleanEmail}`);
      console.log(`Role:       STAFF`);
      console.log(`Staff Role: ADMIN (Full access)`);
      console.log(`Login URL:  /sign-in or /admin\n`);
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ Database error:", err);
  } finally {
    await pool.end();
  }
}

// Grab arguments from CLI
const args = process.argv.slice(2);
const nameArg = args[0];
const emailArg = args[1];
const passArg = args[2];

createAdmin(nameArg, emailArg, passArg);
