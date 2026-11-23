const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const dbUrl = match[1].trim();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function run() {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  console.log("Connected to Supabase PostgreSQL database successfully.");

  try {
    await client.query("BEGIN");

    // 1. Schema Alterations
    console.log("Applying column alterations...");
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE milestones ADD COLUMN IF NOT EXISTS approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE milestones ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100);
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
      ALTER TABLE files ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) DEFAULT 'application/octet-stream';
      ALTER TABLE files ADD COLUMN IF NOT EXISTS size_bytes BIGINT DEFAULT 0;
    `);

    // 2. Organization
    console.log("Upserting organization...");
    const orgId = 'e0f52cf9-0000-0000-0000-000000000001';
    await client.query(`
      INSERT INTO organizations (id, name, billing_email, tax_pin, address, country, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        billing_email = EXCLUDED.billing_email,
        tax_pin = EXCLUDED.tax_pin,
        address = EXCLUDED.address,
        country = EXCLUDED.country,
        currency = EXCLUDED.currency;
    `, [
      orgId,
      'CoastLane Logistics & Motors Ltd',
      'finance@coastlane.co.ke',
      'P051982344A',
      'Port Cargo Terminal, Moi Avenue, Mombasa',
      'Kenya',
      'KES'
    ]);

    // 3. Users with secure password hashes
    console.log("Upserting users...");
    const faithId = 'b0f52cf9-0000-0000-0000-000000000001';
    const kariukiId = 'b0f52cf9-0000-0000-0000-000000000002';
    const danielId = 'b0f52cf9-0000-0000-0000-000000000003';

    const faithHash = hashPassword('FaithPass2026!');
    const kariukiHash = hashPassword('KariukiPass2026!');
    const danielHash = hashPassword('DanielPass2026!');

    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role, phone, timezone)
      VALUES 
        ($1, 'Faith Wanjiku', 'faith.wanjiku@coastlane.co.ke', $4, 'CLIENT', '+254 712 345 678', 'Africa/Nairobi'),
        ($2, 'Kariuki Mwangi', 'kariuki.m@coastlane.co.ke', $5, 'CLIENT', '+254 722 987 654', 'Africa/Nairobi'),
        ($3, 'Daniel Siro', 'daniel@sirotech.com', $6, 'STAFF', '+254 700 000 000', 'Africa/Nairobi')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        phone = EXCLUDED.phone;
    `, [faithId, kariukiId, danielId, faithHash, kariukiHash, danielHash]);

    // 4. Memberships
    console.log("Upserting memberships...");
    await client.query(`
      INSERT INTO memberships (org_id, user_id, role)
      VALUES 
        ($1, $2, 'OWNER'),
        ($1, $3, 'MEMBER')
      ON CONFLICT (org_id, user_id) DO UPDATE SET role = EXCLUDED.role;
    `, [orgId, faithId, kariukiId]);

    // 5. Projects
    console.log("Upserting project...");
    const projectId = 'c0f52cf9-0000-0000-0000-000000000001';
    await client.query(`
      INSERT INTO projects (id, slug, org_id, title, summary, status, progress, start_date, target_launch, staging_url, repo_url, tech_stack, next_step_summary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        staging_url = EXCLUDED.staging_url,
        repo_url = EXCLUDED.repo_url,
        tech_stack = EXCLUDED.tech_stack,
        next_step_summary = EXCLUDED.next_step_summary;
    `, [
      projectId,
      'coastlane-core-v2',
      orgId,
      'CoastLane Fleet & Logistics Platform',
      'High-concurrency fleet management platform, driver offline-first mobile app, and automated M-Pesa B2B fuel disbursement pipeline.',
      'BUILD',
      75,
      '2026-08-01',
      '2026-11-15',
      'https://staging.coastlane.co.ke',
      'https://github.com/sirotech-studios/coastlane-core',
      ['Next.js 16', 'PostgreSQL', 'React Native', 'M-Pesa Daraja', 'Docker', 'AWS'],
      'We are currently testing Phase 3 driver GPS telemetry and M-Pesa automated retry backoffs.'
    ]);

    // 6. Milestones
    console.log("Upserting milestones...");
    const m1Id = 'a0f52cf9-0000-0000-0000-000000000001';
    const m2Id = 'a0f52cf9-0000-0000-0000-000000000002';
    const m3Id = 'a0f52cf9-0000-0000-0000-000000000003';
    const m4Id = 'a0f52cf9-0000-0000-0000-000000000004';

    await client.query(`
      INSERT INTO milestones (id, project_id, phase, title, order_num, status, due_date, completed_date, deliverables, feedback, approved_by_id, approved_at)
      VALUES 
        ($1, $5, 'Phase 1', 'Database Architecture & Multi-Tenant Schema', 1, 'APPROVED', '2026-08-20', '2026-08-18', ARRAY['PostgreSQL schema with Row-Level Security', 'Automated DB migration scripts'], null, $6, '2026-08-18 14:00:00+03'),
        ($2, $5, 'Phase 2', 'Driver Mobile App & Offline SQLite Sync', 2, 'AWAITING_APPROVAL', '2026-09-25', '2026-09-24', ARRAY['React Native driver app', 'Local SQLite sync engine with automatic conflict resolution', 'Digital signature upload'], 'Awaiting client sign-off on offline driver test suite.', null, null),
        ($3, $5, 'Phase 3', 'Real-Time Telemetry & M-Pesa Fuel Disbursement', 3, 'IN_PROGRESS', '2026-10-28', null, ARRAY['M-Pesa B2B automated fuel disbursement pipeline', 'Real-time GPS vehicle tracking dashboard with WebSockets'], null, null, null),
        ($4, $5, 'Phase 4', 'Production Hardening, Uptime SLA & Go-Live', 4, 'UPCOMING', '2026-11-15', null, ARRAY['Load testing under 10,000 concurrent check-ins', 'Multi-AZ AWS failover configuration', '30-day Hypercare warranty'], null, null, null)
      ON CONFLICT (id) DO UPDATE SET
        phase = EXCLUDED.phase,
        title = EXCLUDED.title,
        order_num = EXCLUDED.order_num,
        status = EXCLUDED.status,
        due_date = EXCLUDED.due_date,
        deliverables = EXCLUDED.deliverables,
        feedback = EXCLUDED.feedback;
    `, [m1Id, m2Id, m3Id, m4Id, projectId, faithId]);

    // 7. Project Updates
    console.log("Upserting project updates...");
    await client.query("DELETE FROM project_updates WHERE project_id = $1;", [projectId]);
    await client.query(`
      INSERT INTO project_updates (project_id, author_name, title, body, is_pinned, created_at)
      VALUES
        ($1, 'Daniel Siro', 'Phase 2 Mobile Offline Engine Completed', 'The React Native offline SQLite sync engine with automatic conflict resolution has passed internal QA and is deployed to TestFlight & Google Play Internal track.', true, NOW() - INTERVAL '2 days'),
        ($1, 'Kevin Mutua', 'M-Pesa B2B Staging Sandbox Configured', 'Daraja B2B credentials provisioned for automated driver wallet disbursements. Re-query cron active on 30s intervals.', false, NOW() - INTERVAL '5 days'),
        ($1, 'Daniel Siro', 'Sprint 4 Architecture Checkpoint', 'Database indexes tuned for vehicle GPS telemetry timestamps. Query latency reduced by 64% on 2.4M test records.', false, NOW() - INTERVAL '10 days');
    `, [projectId]);

    // 8. Files
    console.log("Upserting files...");
    const f1Id = 'f1f52cf9-0000-0000-0000-000000000001';
    const f2Id = 'f1f52cf9-0000-0000-0000-000000000002';
    const f3Id = 'f1f52cf9-0000-0000-0000-000000000003';
    await client.query(`
      INSERT INTO files (id, org_id, project_id, name, size, kind, storage_path, uploaded_by, mime_type, size_bytes)
      VALUES 
        ($1, $4, $5, 'CoastLane_System_Architecture_v2.pdf', '3.4 MB', 'DOCUMENT', 'org/e0f52cf9/project/c0f52cf9/arch-v2.pdf', 'Daniel Siro', 'application/pdf', 3565158),
        ($2, $4, $5, 'Driver_Mobile_App_Build_v1.0.4.apk', '24.1 MB', 'DELIVERABLE', 'org/e0f52cf9/project/c0f52cf9/driver-app.apk', 'Kevin Mutua', 'application/vnd.android.package-archive', 25270681),
        ($3, $4, $5, 'API_Specification_OpenAPI_v3.json', '180 KB', 'DELIVERABLE', 'org/e0f52cf9/project/c0f52cf9/openapi.json', 'Daniel Siro', 'application/json', 184320)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        size = EXCLUDED.size,
        kind = EXCLUDED.kind;
    `, [f1Id, f2Id, f3Id, orgId, projectId]);

    // 9. Invoices
    console.log("Upserting invoices...");
    const inv1Id = 'd0f52cf9-0000-0000-0000-000000000001';
    const inv2Id = 'd0f52cf9-0000-0000-0000-000000000002';
    await client.query(`
      INSERT INTO invoices (id, invoice_number, org_id, project_id, project_title, issue_date, due_date, amount_kes, amount_usd, status, paid_at)
      VALUES 
        ($1, 'INV-2026-089', $3, $4, 'CoastLane Fleet & Logistics Platform', '2026-10-10', '2026-10-30', 285000.00, 2200.00, 'SENT', null),
        ($2, 'INV-2026-074', $3, $4, 'CoastLane Fleet & Logistics Platform', '2026-09-15', '2026-09-25', 350000.00, 2700.00, 'PAID', '2026-09-20 11:30:00+03')
      ON CONFLICT (id) DO UPDATE SET
        invoice_number = EXCLUDED.invoice_number,
        amount_kes = EXCLUDED.amount_kes,
        amount_usd = EXCLUDED.amount_usd,
        status = EXCLUDED.status,
        paid_at = EXCLUDED.paid_at;
    `, [inv1Id, inv2Id, orgId, projectId]);

    // 10. Invoice Items
    console.log("Upserting invoice items...");
    await client.query("DELETE FROM invoice_items WHERE invoice_id IN ($1, $2);", [inv1Id, inv2Id]);
    await client.query(`
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price_kes, unit_price_usd)
      VALUES 
        ($1, 'Phase 3: Real-Time Telemetry & M-Pesa Fuel Disbursement API Integration', 1, 285000.00, 2200.00),
        ($2, 'Phase 2: React Native Driver Mobile App & SQLite Offline Sync Engine', 1, 350000.00, 2700.00);
    `, [inv1Id, inv2Id]);

    // 11. Support Tickets & Replies
    console.log("Upserting support tickets...");
    const ticketId = 'f0f52cf9-0000-0000-0000-000000000001';
    await client.query(`
      INSERT INTO support_tickets (id, ticket_number, org_id, project_id, project_title, subject, category, priority, status, assignee_name)
      VALUES ($1, 'ST-104', $2, $3, 'CoastLane Fleet & Logistics Platform', 'M-Pesa callback retry handling in staging', 'BUG', 'URGENT', 'WAITING_ON_CLIENT', 'Daniel Siro')
      ON CONFLICT (id) DO UPDATE SET
        subject = EXCLUDED.subject,
        status = EXCLUDED.status;
    `, [ticketId, orgId, projectId]);

    await client.query("DELETE FROM ticket_replies WHERE ticket_id = $1;", [ticketId]);
    await client.query(`
      INSERT INTO ticket_replies (ticket_id, author_id, author_name, is_staff, content, created_at)
      VALUES 
        ($1, $2, 'Faith Wanjiku', false, 'Hi team, when testing driver fuel disbursements with network timeouts in staging, does the callback listener retry automatically or wait for our cron job?', NOW() - INTERVAL '1 day'),
        ($1, $3, 'Daniel Siro', true, 'Hello Faith! We have implemented an exponential backoff queue via Redis (BullMQ) retrying at 30s, 2m, and 10m before manual fallback. Does this retry interval meet your operations team SLA?', NOW() - INTERVAL '18 hours');
    `, [ticketId, faithId, danielId]);

    // 12. Messages
    console.log("Upserting messages...");
    await client.query("DELETE FROM messages WHERE project_id = $1;", [projectId]);
    await client.query(`
      INSERT INTO messages (project_id, author_id, author_name, author_role, is_staff, content, created_at)
      VALUES 
        ($1, $2, 'Faith Wanjiku', 'Operations Director', false, 'Hello Daniel! Our logistics field team tested the offline signature capture on tablet. Syncing worked flawlessly even in low signal zones.', NOW() - INTERVAL '3 days'),
        ($1, $3, 'Daniel Siro', 'Lead Solutions Architect', true, 'Glad to hear that, Faith! We have Phase 2 flagged for formal client approval so we can release the production build keys.', NOW() - INTERVAL '2 days'),
        ($1, $2, 'Faith Wanjiku', 'Operations Director', false, 'Reviewing the deliverables now. We will sign off this afternoon.', NOW() - INTERVAL '1 day');
    `, [projectId, faithId, danielId]);

    // 13. Proposals
    console.log("Upserting proposals...");
    const propId = 'e1f52cf9-0000-0000-0000-000000000001';
    await client.query(`
      INSERT INTO proposals (id, org_id, title, version, summary, file_url, is_accepted, accepted_at)
      VALUES ($1, $2, 'CoastLane SLA & 24/7 Production Maintenance Agreement', 'v2.1', 'Guarantees 99.95% API uptime SLA, 15-minute emergency response time for driver settlement failures, and dedicated DevOps support.', '/legal/sla-agreement.pdf', false, null)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        version = EXCLUDED.version;
    `, [propId, orgId]);

    // 14. Notifications
    console.log("Upserting notifications...");
    await client.query("DELETE FROM notifications WHERE org_id = $1;", [orgId]);
    await client.query(`
      INSERT INTO notifications (org_id, user_id, type, title, description, target_href, is_read, created_at)
      VALUES 
        ($1, $2, 'MILESTONE', 'Phase 2 Ready for Sign-Off', 'Driver Mobile App & Offline SQLite Sync is awaiting your milestone review.', '/portal/projects/coastlane-core-v2', false, NOW() - INTERVAL '1 day'),
        ($1, $2, 'INVOICE', 'Invoice INV-2026-089 Issued', 'Invoice for Phase 3 Telemetry (KES 285,000) due on Oct 30, 2026.', '/portal/invoices', false, NOW() - INTERVAL '2 days'),
        ($1, $2, 'TICKET', 'Reply on Ticket ST-104', 'Daniel Siro responded to M-Pesa callback retry handling.', '/portal/support', false, NOW() - INTERVAL '18 hours');
    `, [orgId, faithId]);

    // 15. Notification Preferences
    console.log("Upserting notification preferences...");
    await client.query(`
      INSERT INTO notification_preferences (user_id, email_messages, email_updates, email_invoices, email_tickets)
      VALUES ($1, true, true, true, true)
      ON CONFLICT (user_id) DO NOTHING;
    `, [faithId]);

    // 16. Audit Log Initial Entry
    console.log("Adding audit log entry...");
    await client.query(`
      INSERT INTO audit_logs (org_id, user_id, action, entity, entity_id, metadata, ip_address, user_agent)
      VALUES ($1, $2, 'SEED_INITIALIZE', 'SYSTEM', $3, '{"status": "production_ready"}', '127.0.0.1', 'SiroTech Migration Engine');
    `, [orgId, faithId, projectId]);

    await client.query("COMMIT");
    console.log("Database migration & seeding completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
