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
  console.log("Connected to Supabase PostgreSQL database for Admin schema migration.");

  try {
    await client.query("BEGIN");

    // 1. Alter Users Table
    console.log("Updating users table...");
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_role VARCHAR(20) DEFAULT 'ADMIN';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_required BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

      -- Update Daniel Siro to have staff_role = 'ADMIN'
      UPDATE users SET staff_role = 'ADMIN', role = 'STAFF' WHERE email = 'daniel@sirotech.com';
    `);

    // 2. Leads & Consultations
    console.log("Creating leads and consultations tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        company VARCHAR(255),
        service VARCHAR(100),
        budget VARCHAR(50),
        timeline VARCHAR(50),
        message TEXT,
        status VARCHAR(50) DEFAULT 'NEW',
        assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        tags TEXT[] DEFAULT '{}',
        value BIGINT DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'KES',
        lost_reason TEXT,
        utm JSONB DEFAULT '{}',
        converted_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        spam BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lead_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        author_name VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        due_at TIMESTAMPTZ,
        assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        assignee_name VARCHAR(255),
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        priority VARCHAR(20) DEFAULT 'MEDIUM',
        done_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS consultations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        company VARCHAR(255),
        scheduled_at TIMESTAMPTZ NOT NULL,
        status VARCHAR(50) DEFAULT 'SCHEDULED',
        notes TEXT,
        cal_booking_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Content Store & Revisions
    console.log("Creating content_items, pages, and revisions tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        content JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
        publish_at TIMESTAMPTZ,
        order_num INT DEFAULT 0,
        seo_title VARCHAR(255),
        seo_desc TEXT,
        og_image VARCHAR(500),
        noindex BOOLEAN DEFAULT false,
        canonical VARCHAR(500),
        created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
        updated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        CONSTRAINT uq_content_type_slug UNIQUE(type, slug)
      );

      CREATE INDEX IF NOT EXISTS idx_content_type_status ON content_items(type, status);

      CREATE TABLE IF NOT EXISTS revisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity VARCHAR(100) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        note TEXT,
        created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_by_name VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_revisions_entity_id ON revisions(entity, entity_id, created_at DESC);
    `);

    // 4. Redirects, 404 Logs & Media
    console.log("Creating redirects, not_found_logs, and media tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS redirects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_path VARCHAR(500) UNIQUE NOT NULL,
        to_path VARCHAR(500) NOT NULL,
        code INT DEFAULT 301,
        hits INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS not_found_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        path VARCHAR(500) UNIQUE NOT NULL,
        count INT DEFAULT 1,
        referer TEXT,
        last_seen TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(255) UNIQUE NOT NULL,
        url VARCHAR(500) NOT NULL,
        mime VARCHAR(100) NOT NULL,
        size INT NOT NULL DEFAULT 0,
        width INT,
        height INT,
        alt TEXT NOT NULL,
        title VARCHAR(255),
        folder VARCHAR(100) DEFAULT 'general',
        uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);

    // 5. Site Controls: Menus, Feature Flags, Site Settings
    console.log("Creating menus, feature flags, and site settings tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS menus (
        key VARCHAR(100) PRIMARY KEY,
        items JSONB NOT NULL DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS feature_flags (
        key VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT false,
        note TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS email_templates (
        key VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        updated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS email_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        to_email VARCHAR(255) NOT NULL,
        template VARCHAR(100) NOT NULL,
        subject VARCHAR(255),
        status VARCHAR(50) DEFAULT 'SENT',
        provider_id VARCHAR(255),
        error TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'PROCESSED',
        attempts INT DEFAULT 1,
        error TEXT,
        received_at TIMESTAMPTZ DEFAULT NOW(),
        processed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS canned_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        scope VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS privacy_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        email VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'OPEN',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS assistant_stats (
        day DATE NOT NULL,
        kind VARCHAR(50) NOT NULL,
        count INT DEFAULT 0,
        PRIMARY KEY (day, kind)
      );

      CREATE TABLE IF NOT EXISTS assistant_evals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt TEXT NOT NULL,
        expected TEXT NOT NULL,
        last_result JSONB,
        last_run_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS job_postings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        location VARCHAR(100),
        type VARCHAR(50),
        experience VARCHAR(50),
        salary_range VARCHAR(100),
        summary TEXT,
        responsibilities TEXT[] DEFAULT '{}',
        requirements TEXT[] DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'PUBLISHED',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
        job_title VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        resume_url VARCHAR(500),
        portfolio_url VARCHAR(500),
        cover_letter TEXT,
        status VARCHAR(50) DEFAULT 'NEW',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Alter support tickets and invoices
    console.log("Updating support_tickets and invoices tables...");
    await client.query(`
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ;
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ;
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS internal_notes TEXT;
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS unmatched_reference VARCHAR(255);
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS void_reason TEXT;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS refunded_amount_kes BIGINT DEFAULT 0;
    `);

    // 7. Seed Initial Feature Flags, Settings, Canned Replies, and Sample Leads
    console.log("Seeding settings and default admin data...");

    // Default Site Settings
    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES 
        ('general', '{"companyName": "SiroTech Solutions Ltd", "tagline": "Software & Systems Engineering Studio", "contactEmail": "hello@sirotech.com", "phone": "+254 745 131 817", "location": "Nairobi, Kenya", "maintenanceMode": false}'::jsonb),
        ('tax', '{"vatRate": 16, "withholdingTaxRate": 5, "currency": "KES", "vatNumber": "P051982344A"}'::jsonb),
        ('retention', '{"invoiceRetentionYears": 7, "auditLogRetentionDays": 365, "transcriptRetentionDays": 90}'::jsonb),
        ('assistant', '{"killSwitch": false, "dailyTokenCap": 250000, "tokensUsedToday": 18450, "model": "claude-3-5-sonnet", "temperature": 0.3}'::jsonb)
      ON CONFLICT (key) DO NOTHING;
    `);

    // Default Feature Flags
    await client.query(`
      INSERT INTO feature_flags (key, name, enabled, note)
      VALUES
        ('new_pricing_tiers', 'KES / USD Multi-Currency Billing', true, 'Allows clients to toggle between currencies on invoices'),
        ('client_impersonation', 'View As Client Banner & Session', true, 'Staff can securely view read-only portal view as a client'),
        ('assistant_kb_sync', 'Live Assistant Knowledge Base Sync', true, 'Assistant reads latest published database content'),
        ('auto_invoice_reminders', 'Automated Overdue Reminders', true, 'Dispatches email notifications 3 days before due date')
      ON CONFLICT (key) DO NOTHING;
    `);

    // Default Canned Replies
    await client.query(`
      INSERT INTO canned_replies (title, body, scope)
      VALUES
        ('Investigating Issue', 'Thank you for bringing this to our attention. Our engineering team has replicated the behavior and is actively preparing a patch. We will update this thread within 2 hours.', 'ticket'),
        ('Milestone Ready for Sign-Off', 'Sprint deliverables are deployed to your staging environment. Please review the acceptance checklist in the portal and authorize sign-off to proceed to production deployment.', 'message'),
        ('Payment Confirmation', 'We have received your payment via M-Pesa / Stripe. Your official VAT receipt has been generated and is available for download under Invoices.', 'ticket'),
        ('Introductory Consultation Request', 'Thank you for reaching out to SiroTech Solutions. We have received your project details and would love to schedule a 30-minute discovery session with our technical director.', 'lead')
      ON CONFLICT DO NOTHING;
    `);

    // Default Email Templates
    await client.query(`
      INSERT INTO email_templates (key, title, subject, body)
      VALUES
        ('welcome_staff', 'Staff Account Invitation', 'Your SiroTech Staff Account is Ready', 'Hello {{name}},\n\nYou have been granted staff access to the SiroTech Control Room as {{role}}.\nPlease sign in and configure your two-step authenticator app.'::text),
        ('invoice_issued', 'New Invoice Issued', 'Invoice {{invoice_number}} from SiroTech Solutions', 'Hello {{client_name}},\n\nA new invoice ({{invoice_number}}) for {{project_title}} has been issued for {{amount}}.'::text),
        ('ticket_reply', 'Support Ticket Update', 'Update on Ticket #{{ticket_number}}: {{subject}}', 'Hello {{client_name}},\n\nOur engineering team has posted a new update on ticket #{{ticket_number}}.'::text)
      ON CONFLICT (key) DO NOTHING;
    `);

    // Default Seed Leads if empty
    const leadCountRes = await client.query("SELECT COUNT(*) FROM leads");
    if (parseInt(leadCountRes.rows[0].count) === 0) {
      console.log("Seeding sample leads pipeline...");
      await client.query(`
        INSERT INTO leads (name, email, phone, company, service, budget, timeline, message, status, value, currency, tags)
        VALUES
          ('Grace Mutua', 'grace@savannahexports.com', '+254 722 111 222', 'Savannah Fresh Horticultural Ltd', 'Custom Web Application', 'KES 1,500,000 - 3,000,000', '1 - 3 months', 'We need a cold chain telemetry portal with automated M-Pesa farmer disbursements and export compliance tracking.', 'QUALIFIED', 2200000, 'KES', ARRAY['AgriTech', 'Cold Chain', 'High Priority']),
          ('Kevin Omondi', 'kevin@apexlogistics.co.ke', '+254 733 444 555', 'Apex Fleet & Logistics East Africa', 'Enterprise ERP & Operations', 'KES 3,000,000+', '3 - 6 months', 'Replacing legacy desktop fleet software with real-time GPS tracking and Daraja B2B automated settlement.', 'PROPOSAL', 4500000, 'KES', ARRAY['Fleet', 'FinTech', 'Enterprise']),
          ('Sarah Al-Mansoor', 'sarah@safetrail.ae', '+971 50 123 4567', 'SafeTrail Transport Solutions', 'Mobile App Development', '$15,000 - $30,000', '2 - 4 months', 'iOS & Android rider booking application with geofenced asset dispatching across Nairobi and Dubai.', 'NEW', 2500000, 'USD', ARRAY['Mobile', 'Cross-Border']),
          ('Patrick Njoroge', 'pnjoroge@eldoretmills.com', '+254 711 777 888', 'Rift Grain Milling Ltd', 'Custom ERP', 'KES 800,000 - 1,500,000', '1 month', 'We need inventory batch tracking and barcode scanning for warehouse dispatch.', 'CONTACTED', 1200000, 'KES', ARRAY['Manufacturing', 'ERP']);
      `);
    }

    // Default Redirects if empty
    const redirectCountRes = await client.query("SELECT COUNT(*) FROM redirects");
    if (parseInt(redirectCountRes.rows[0].count) === 0) {
      console.log("Seeding sample redirects...");
      await client.query(`
        INSERT INTO redirects (from_path, to_path, code, hits, active)
        VALUES
          ('/services/web-development', '/services/web-application-development', 301, 142, true),
          ('/portfolio', '/work', 301, 98, true),
          ('/contact-us', '/contact', 301, 312, true),
          ('/about-us', '/about', 301, 65, true)
        ON CONFLICT DO NOTHING;
      `);
    }

    // Default Media items if empty
    const mediaCountRes = await client.query("SELECT COUNT(*) FROM media");
    if (parseInt(mediaCountRes.rows[0].count) === 0) {
      console.log("Seeding media library...");
      await client.query(`
        INSERT INTO media (key, url, mime, size, width, height, alt, title, folder)
        VALUES
          ('brand-logo-dark', '/images/sirotech-dark.svg', 'image/svg+xml', 14200, 480, 120, 'SiroTech Solutions primary dark logo mark and wordmark', 'SiroTech Dark Logo', 'brand'),
          ('brand-logo-light', '/images/sirotech-light.svg', 'image/svg+xml', 14200, 480, 120, 'SiroTech Solutions primary light logo mark and wordmark', 'SiroTech Light Logo', 'brand'),
          ('hero-architecture', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200', 'image/jpeg', 245000, 1200, 800, 'High-density enterprise server racks with illuminated fiber cables', 'Cloud Infrastructure Diagram', 'architecture'),
          ('team-engineering', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200', 'image/jpeg', 312000, 1200, 800, 'SiroTech engineering leadership collaborating in Nairobi studio', 'Engineering Team Collaboration', 'team')
        ON CONFLICT DO NOTHING;
      `);
    }

    await client.query("COMMIT");
    console.log("Admin Portal schema migration completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
