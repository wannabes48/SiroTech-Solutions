export interface SolutionModule {
  title: string;
  description: string;
  icon?: string;
}

export interface SolutionDeployment {
  title: string;
  description: string;
  highlights: string[];
}

export interface Solution {
  slug: string;
  title: string;
  category: "operations" | "financial" | "mobility" | "talent" | "enterprise" | "data";
  tagline: string;
  summary: string;
  whatItIs: string;
  whoItIsFor: string;
  published: boolean;
  demoAvailable: boolean;
  modules: SolutionModule[];
  keyFeatures: { title: string; description: string }[];
  deploymentOptions: {
    cloud: SolutionDeployment;
    selfHosted: SolutionDeployment;
  };
  screenshots: { url: string; caption: string }[];
  faqs: { q: string; a: string }[];
}

export const solutions: Solution[] = [
  {
    slug: "erp",
    title: "ERP & Operations Engine",
    category: "operations",
    tagline: "Unified Multi-Branch Workflow, Procurement & Inventory Backbone",
    summary:
      "A modular enterprise resource planning system eliminating fragmented spreadsheets across procurement, multi-warehouse stock, and double-entry general ledger accounting.",
    whatItIs:
      "Our ERP & Operations Engine is an event-driven business management architecture that unifies real-time stock balances across warehouses, purchase orders, vendor invoices, and employee departmental approvals into an auditable database.",
    whoItIsFor:
      "Mid-sized manufacturing companies, multi-branch wholesale distributors, FMCG brands, and high-volume logistics suppliers seeking to eliminate stock loss and manual ledger reconciliation.",
    published: true,
    demoAvailable: true,
    modules: [
      {
        title: "Multi-Warehouse Inventory",
        description: "Real-time stock balance tracking with automated low-threshold reorder triggers and barcode SKU scanning.",
      },
      {
        title: "Procurement & Vendor RFQs",
        description: "Automated vendor price quote comparisons, digital Purchase Order generation, and goods-received note matching.",
      },
      {
        title: "Double-Entry Accounting Ledger",
        description: "ACID-compliant general ledger, accounts payable, accounts receivable, and automated VAT / withholding tax calculation.",
      },
      {
        title: "Role-Based Multi-Tier Approvals",
        description: "Configurable departmental approval thresholds for capital expenditures with SMS and email notifications.",
      },
      {
        title: "HR & Automated Payroll",
        description: "Statutory payroll engine with Kenya PAYE, NHIF, NSSF, and housing levy deductions with direct bank file generation.",
      },
      {
        title: "Executive Analytics Cockpit",
        description: "Live gross margin, cash runway, and inventory turnover dashboards with scheduled PDF reporting.",
      },
    ],
    keyFeatures: [
      {
        title: "Idempotent Ledger Posting",
        description: "Guarantees zero double-counting across high-volume transactions even during network dropouts.",
      },
      {
        title: "Audit-Proof Modification Trails",
        description: "Append-only database logs recording user identity, IP address, and previous values for every record update.",
      },
      {
        title: "Multi-Currency & Tax Engine",
        description: "Automated foreign exchange rate ingestion supporting KES, USD, EUR, and GBP with KRA-compliant tax invoicing.",
      },
      {
        title: "Sub-Second Barcode Processing",
        description: "Optimized barcode and QR scanning interface allowing warehouse workers to process 100+ items per minute.",
      },
    ],
    deploymentOptions: {
      cloud: {
        title: "Managed Cloud Deployment",
        description: "Hosted in secure isolated VPC on AWS / GCP with automated hourly backups, 99.95% uptime SLA, and managed security patches.",
        highlights: [
          "Zero server maintenance overhead",
          "Automated daily encrypted offsite backups",
          "Dedicated 99.95% availability guarantee",
          "Multi-AZ failover and auto-scaling",
        ],
      },
      selfHosted: {
        title: "Self-Hosted / On-Premise",
        description: "Delivered as containerized Docker / Kubernetes packages deployable to your private data centre or local virtualized servers.",
        highlights: [
          "Complete data sovereignty and on-premise control",
          "Air-gapped network compatibility",
          "Direct integration with internal legacy SQL servers",
          "Full source code and Kubernetes Helm charts provided",
        ],
      },
    },
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        caption: "Central Financial General Ledger & Cash Flow Monitor",
      },
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        caption: "Multi-Warehouse Inventory Stock Balancing Grid",
      },
    ],
    faqs: [
      {
        q: "Can this ERP integrate with our existing KRA TIMS / eTIMS fiscal devices?",
        a: "Yes. We have built integrations with eTIMS APIs and physical Virtual Sales Control Units (VSCU) for automated cryptographic invoice transmission to KRA.",
      },
      {
        q: "How long does a standard deployment and data migration take?",
        a: "A typical deployment takes 4 to 8 weeks, including initial master data sanitization (products, customers, suppliers), staff training, and parallel run verification.",
      },
      {
        q: "Can we customize internal approval workflows?",
        a: "Yes. Our workflow builder supports arbitrary multi-level approval hierarchies based on spend categories, department limits, and project codes.",
      },
      {
        q: "What training and handover documentation is provided?",
        a: "We provide comprehensive recorded video walkthroughs, role-based PDF quick-reference manuals, and two weeks of dedicated on-site staff shadowing in Nairobi.",
      },
    ],
  },
  {
    slug: "crm",
    title: "CRM & Client Portal",
    category: "operations",
    tagline: "High-Trust Client Workspace, Secure File Vault & Messaging Hub",
    summary:
      "A branded, multi-tenant client portal with role-based access, end-to-end encrypted document sharing, invoice payments, and real-time support ticketing.",
    whatItIs:
      "A white-labeled digital client gateway that replaces chaotic email attachments and unencrypted WhatsApp threads with a centralized, professional customer relationship environment.",
    whoItIsFor:
      "Professional service studios, law firms, wealth managers, accounting practices, and digital agencies managing sensitive customer documents and recurring deliverables.",
    published: true,
    demoAvailable: true,
    modules: [
      {
        title: "Multi-Tenant Client Workspaces",
        description: "Isolated company workspaces with individual user permissions and custom domain white-labeling.",
      },
      {
        title: "Encrypted Document Vault",
        description: "AES-256 encrypted file storage with version control, watermarking, and digital signing capabilities.",
      },
      {
        title: "Project Milestone Tracker",
        description: "Visual roadmap timelines allowing clients to track deliverable progress, review revisions, and sign off on phases.",
      },
      {
        title: "Integrated Invoice Settlement",
        description: "One-click invoice payment via M-Pesa STK push and international credit cards with automated receipt issuance.",
      },
      {
        title: "Structured Support Desk",
        description: "SLA-tracked ticketing system with category routing, email-to-ticket conversion, and internal agent notes.",
      },
    ],
    keyFeatures: [
      {
        title: "Granular Access Permissions",
        description: "Strict tenant isolation ensuring clients can never view files or details from other accounts.",
      },
      {
        title: "White-Label Brand Customization",
        description: "Configurable logos, typography tokens, custom domain URLs, and transactional email templates.",
      },
      {
        title: "Real-Time Activity Audit Log",
        description: "Instant notifications whenever a client views a proposal, downloads a contract, or settles an invoice.",
      },
      {
        title: "Encrypted Direct Chat",
        description: "WebSocket messaging channel keeping project communications organized in a single searchable thread.",
      },
    ],
    deploymentOptions: {
      cloud: {
        title: "Fully Managed Cloud SaaS",
        description: "Dedicated isolated tenant instance on managed edge cloud infrastructure with zero server maintenance.",
        highlights: [
          "Instant setup with custom domain SSL",
          "Automated monthly performance updates",
          "Encrypted cloud document storage on Cloudflare R2 / AWS S3",
          "99.9% uptime service level agreement",
        ],
      },
      selfHosted: {
        title: "Enterprise Private Hosting",
        description: "Full Docker package deployable into your own AWS, Azure, or private server cluster for complete compliance.",
        highlights: [
          "Host files on your company's own storage buckets",
          "Integrate directly with Active Directory / Okta SSO",
          "Complete source code ownership",
        ],
      },
    },
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
        caption: "Client Interactive Workspace & Milestone Tracking View",
      },
      {
        url: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1200",
        caption: "Encrypted Document Sharing & Activity Audit Log",
      },
    ],
    faqs: [
      {
        q: "Can clients log in with their own company email addresses?",
        a: "Yes. The platform supports passwordless magic links, standard secure password auth with 2FA, and Google / Microsoft Single Sign-On.",
      },
      {
        q: "Can we use our own custom domain (e.g. portal.ourfirm.com)?",
        a: "Yes. The system automatically provisions and renews SSL certificates for your custom domain at no extra charge.",
      },
      {
        q: "Is there a limit to how many files or clients we can manage?",
        a: "No. The architecture uses scalable object storage with zero artificial tenant or document limits.",
      },
    ],
  },
  {
    slug: "fintech",
    title: "FinTech & M-Pesa Core",
    category: "financial",
    tagline: "Automated Mobile Money Rails, Payout Queues & Reconciliation",
    summary:
      "A high-throughput financial orchestration engine handling M-Pesa STK push, C2B validation, bulk B2C payouts, and double-entry reconciliation.",
    whatItIs:
      "A battle-tested financial middleware architecture that bridges your applications with Safaricom Daraja, bank payment APIs, and mobile wallet networks with zero dropped callbacks and automatic reconciliation.",
    whoItIsFor:
      "Fintech startups, lending institutions, SACCOs, microfinance banks, and high-volume billing platforms needing rock-solid mobile payment processing.",
    published: true,
    demoAvailable: true,
    modules: [
      {
        title: "M-Pesa STK Push Express",
        description: "Sub-second prompt triggering on customer phones with real-time WebSocket payment status updates.",
      },
      {
        title: "High-Throughput Callback Queue",
        description: "Redis and RabbitMQ asynchronous workers processing thousands of Daraja IPN notifications without dropped requests.",
      },
      {
        title: "Automated B2C Bulk Payouts",
        description: "Batch mobile money disbursements for loans, affiliate commissions, and contractor wages with dual-signatory approvals.",
      },
      {
        title: "Real-Time Ledger Reconciliation",
        description: "Instant matching of Paybill balances against internal customer accounts with automatic anomaly flagging.",
      },
      {
        title: "Dispute & Reversal Engine",
        description: "Automated workflow for logging, tracking, and resolving M-Pesa payment reversal requests.",
      },
    ],
    keyFeatures: [
      {
        title: "Idempotent Webhook Processing",
        description: "Eliminates duplicate ledger credits caused by Daraja API network retries and timeout duplicates.",
      },
      {
        title: "Sub-Second In-Session Feedback",
        description: "Users receive immediate UI confirmation the millisecond Safaricom processes the PIN transaction.",
      },
      {
        title: "Dual-Control Maker-Checker",
        description: "Ensures large financial disbursements require verification by one officer and sign-off by another.",
      },
      {
        title: "Cryptographic Audit Ledger",
        description: "Every balance change is cryptographically hashed to establish an unalterable financial paper trail.",
      },
    ],
    deploymentOptions: {
      cloud: {
        title: "Managed Cloud Financial VPC",
        description: "Deployed in a dedicated, isolated AWS VPC with hardware security modules (HSM) and strict IP whitelisting.",
        highlights: [
          "Pre-configured Safaricom Daraja IP whitelisting",
          "Automated failover across multi-AZ worker nodes",
          "24/7 financial transaction monitoring & SMS alerts",
        ],
      },
      selfHosted: {
        title: "Private Core-Banking Integration",
        description: "Installed on-premise inside your bank or SACCO infrastructure connecting directly to your core-banking database.",
        highlights: [
          "Zero customer financial data leaves your internal network",
          "Compliant with Central Bank of Kenya on-premise storage mandates",
        ],
      },
    },
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
        caption: "Live Financial Settlement Queue & Callback Stream",
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        caption: "Maker-Checker Bulk Disbursement Approval Desk",
      },
    ],
    faqs: [
      {
        q: "How does the system prevent double-crediting if Safaricom sends duplicate callbacks?",
        a: "We enforce strict database idempotency keys on every M-Pesa transaction ID (e.g. QKH71234AB). Duplicate callbacks are acknowledged instantly to Safaricom without executing second ledger mutations.",
      },
      {
        q: "What happens if our server is temporarily restarting during an M-Pesa callback?",
        a: "Our architecture utilizes an edge buffer queue (Cloudflare Workers / AWS API Gateway) that captures incoming callbacks and queues them in Redis, ensuring zero transactions are lost.",
      },
      {
        q: "Can this solution integrate with our SACCO core-banking software?",
        a: "Yes. We have built REST and SOAP connectors for popular core banking platforms including Bankers Realm, Finacle, and custom legacy systems.",
      },
    ],
  },
  {
    slug: "agritech",
    title: "AgriTech & Field Data Engine",
    category: "data",
    tagline: "Offline-First Mobile App, Cooperative Registry & Traceability",
    summary:
      "A resilient digital platform designed for rural field operations, smallholder farmer registries, produce weigh-in collection, and export traceability.",
    whatItIs:
      "An offline-first operational suite empowering agricultural cooperatives, outgrower managers, and agribusiness exporters to log farm data in remote areas without internet access.",
    whoItIsFor:
      "Coffee, tea, avocado, and dairy cooperatives, macadamia exporters, contract farming aggregators, and rural extension teams.",
    published: true,
    demoAvailable: true,
    modules: [
      {
        title: "Offline Produce Intake Mobile App",
        description: "Android app recording produce weigh-ins, crop grades, and moisture levels with local SQLite storage.",
      },
      {
        title: "Cooperative Farmer Registry",
        description: "Detailed database of smallholder members, farm GPS polygons, crop types, and bank / M-Pesa details.",
      },
      {
        title: "Bluetooth Weighbridge Sync",
        description: "Direct wireless integration with digital hanging and platform scales to capture tamper-proof weights.",
      },
      {
        title: "Automated Net Payout Engine",
        description: "Deducts seedling advances, fertilizer loans, and SACCO fees before initiating bulk M-Pesa harvest payments.",
      },
      {
        title: "Export Batch Traceability",
        description: "End-to-end QR batch tracking linking export shipping crates back to individual contributing smallholders.",
      },
    ],
    keyFeatures: [
      {
        title: "Zero-Data Offline Durability",
        description: "Field agents can work for weeks completely offline; data auto-syncs the moment cellular connection is re-established.",
      },
      {
        title: "Tamper-Proof Weight Logging",
        description: "Direct Bluetooth readouts prevent clerks from manually manipulating produce weights on digital records.",
      },
      {
        title: "Geospatial Acreage Mapping",
        description: "Records polygon GPS boundaries of smallholder farms to verify crop yield projections and EU deforestation compliance.",
      },
      {
        title: "Digital SMS Weight Receipts",
        description: "Farmers instantly receive an automated SMS receipt confirming kilograms delivered and running account balance.",
      },
    ],
    deploymentOptions: {
      cloud: {
        title: "Managed Cloud Agrisystem",
        description: "Cloud-hosted central database with mobile app distribution through private Google Play tracks.",
        highlights: [
          "Centralized headquarters dashboard accessible from any browser",
          "Automated multi-branch harvest aggregation",
        ],
      },
      selfHosted: {
        title: "On-Premise Cooperative Server",
        description: "Local mini-server installed at the main factory or milling plant with regional data synchronization.",
        highlights: [
          "Local LAN access for weighbridge computers without internet dependency",
        ],
      },
    },
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200",
        caption: "Field Agent Offline Produce Ingestion Interface",
      },
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        caption: "Harvest Yield & Smallholder Payout Analytics",
      },
    ],
    faqs: [
      {
        q: "What types of mobile phones do field extension officers need?",
        a: "Our app is optimized for affordable Android smartphones (Android 9.0+, 2GB RAM) and operates efficiently even on entry-level devices.",
      },
      {
        q: "How does the system comply with new EU Deforestation Regulation (EUDR)?",
        a: "The mobile app records GPS polygon coordinates of individual farm boundaries and embeds provenance timestamps in the export batch manifest.",
      },
      {
        q: "Can the system send SMS receipts in Swahili?",
        a: "Yes. The notification engine supports both English and Kiswahili SMS templates customized to your cooperative's branding.",
      },
    ],
  },
  {
    slug: "fleet",
    title: "Vehicle Alert & Fleet Dispatch",
    category: "mobility",
    tagline: "Tamper-Resistant QR Vehicle Alerts, Parking Consoles & Fleet Telematics",
    summary:
      "A privacy-preserving vehicle communication system pairing serialized holographic QR stickers with real-time driver messaging and parking security desks.",
    whatItIs:
      "A mobility platform that allows security teams and bystanders to contact vehicle owners in seconds without exposing private telephone numbers, coupled with commercial parking management.",
    whoItIsFor:
      "Commercial office towers, shopping malls, residential estates, gated communities, transport operators, and corporate fleet managers.",
    published: true,
    demoAvailable: true,
    modules: [
      {
        title: "Serialized QR Generation & Printing",
        description: "Automated pipeline for generating high-security encrypted QR codes for vehicle windshield decals.",
      },
      {
        title: "Zero-Download Bystander PWA",
        description: "Instant mobile web interface opening on any smartphone camera without app installation requirements.",
      },
      {
        title: "Masked Ephemeral Relay",
        description: "Temporary encrypted messaging and call relay that protects motorists from spam and harassment.",
      },
      {
        title: "Security Guard Station Console",
        description: "Desktop and tablet interface for security personnel to search vehicle registration plates and alert drivers.",
      },
      {
        title: "Commercial Parking Billing",
        description: "Optional parking duration tracking and M-Pesa fee collection for commercial facilities.",
      },
    ],
    keyFeatures: [
      {
        title: "100% Personal Phone Privacy",
        description: "Neither the reporter nor the vehicle owner ever sees the other party's actual telephone number.",
      },
      {
        title: "Sub-Second Push Notifications",
        description: "Alerts arrive on the driver's phone in under 800 milliseconds via redundant APNs and FCM relays.",
      },
      {
        title: "Spam & Harassment Prevention",
        description: "Rate-limiting and automated offensive language filters prevent malicious use of vehicle notification decals.",
      },
      {
        title: "Emergency Preset Dispatches",
        description: "One-tap buttons for 'Blocked Driveway', 'Lights On', 'Car Alarm Sounding', and 'Towing Alert'.",
      },
    ],
    deploymentOptions: {
      cloud: {
        title: "Managed Cloud Fleet Network",
        description: "Turnkey deployment with managed push notification infrastructure and QR printing supply chain.",
        highlights: [
          "Zero maintenance push notification servers",
          "Automated printer-ready PDF export for holographic decal factories",
        ],
      },
      selfHosted: {
        title: "Private Commercial Estate Network",
        description: "Deployed on private infrastructure for high-security corporate complexes and government installations.",
        highlights: [
          "Dedicated on-premise security desk tablets",
          "Integration with existing Automatic Number Plate Recognition (ANPR) cameras",
        ],
      },
    },
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1200",
        caption: "Bystander Instant Incident Dispatch Interface",
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        caption: "Corporate Parking Facility Security Desk",
      },
    ],
    faqs: [
      {
        q: "Does a person scanning the car sticker need to download an app?",
        a: "No. Any standard smartphone camera opens a progressive web app instantly in under a second.",
      },
      {
        q: "How does the car owner receive the notification?",
        a: "The owner receives an instant push alert on their native iOS / Android app, and optionally an automated WhatsApp message or fallback SMS.",
      },
      {
        q: "Can this system integrate with building boom barriers and ANPR cameras?",
        a: "Yes. Our webhook API connects with barrier gate controllers and ANPR cameras to log entry and exit events automatically.",
      },
    ],
  },
  {
    slug: "recruitment",
    title: "AI Talent Screening Hub",
    category: "talent",
    tagline: "Automated CV Ingestion, Semantic TF-IDF Matching & Blind Triage",
    summary:
      "An intelligent applicant processing platform that parses hundreds of resumes in seconds, vectors candidate competencies, and eliminates hiring bias.",
    whatItIs:
      "An automated talent acquisition platform that ingests bulk candidate CVs, extracts skills and tenure using NLP, and ranks applicants based on semantic match to the job description.",
    whoItIsFor:
      "Recruitment agencies, fast-growing tech startups, corporate HR departments, and remote organizations receiving hundreds of applications per open role.",
    published: true,
    demoAvailable: true,
    modules: [
      {
        title: "Multi-Format Resume Ingestion",
        description: "Parses PDF, DOCX, and TXT resumes with high layout accuracy across multi-column formats.",
      },
      {
        title: "TF-IDF Semantic Match Engine",
        description: "Evaluates contextual skill relevance rather than brittle, easily manipulated keyword strings.",
      },
      {
        title: "Blind Evaluation Mode",
        description: "One-click filter stripping candidate names, photos, gender signifiers, and schools to eliminate unconscious bias.",
      },
      {
        title: "Tailored Interview Generator",
        description: "Generates custom behavioral questions targeting specific gaps in the candidate's work history.",
      },
      {
        title: "Candidate Communication Portal",
        description: "Automated batch email and WhatsApp updates keeping applicants informed of their application status.",
      },
    ],
    keyFeatures: [
      {
        title: "Parse 500+ CVs in Under 60 Seconds",
        description: "Parallelized multi-threaded worker pipeline handles peak job posting surges with zero delays.",
      },
      {
        title: "Explainable Match Score Cards",
        description: "Provides recruiters with a transparent breakdown of why a candidate was ranked in the top quartile.",
      },
      {
        title: "Privacy & Data Sandboxing",
        description: "Applicant files are stored in an encrypted vault and automatically purged in compliance with privacy regulations.",
      },
      {
        title: "Instant Export to ATS",
        description: "Export candidate shortlists directly to Greenhouse, Lever, or CSV with clean structured fields.",
      },
    ],
    deploymentOptions: {
      cloud: {
        title: "Managed AI Screening Cloud",
        description: "Hosted on high-speed GPU / CPU inference infrastructure with automated scaling during active hiring drives.",
        highlights: [
          "Zero machine learning pipeline setup required",
          "Automated monthly vocabulary updates for tech taxonomies",
        ],
      },
      selfHosted: {
        title: "Private Enterprise Deployment",
        description: "Run the NLP inference pipeline inside your corporate VPC for complete candidate data confidentiality.",
        highlights: [
          "Strict data sovereignty ensuring CVs never leave internal servers",
        ],
      },
    },
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
        caption: "Candidate Ranking & Blind Review Triage Board",
      },
      {
        url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
        caption: "Semantic Skill Radar & Match Distribution View",
      },
    ],
    faqs: [
      {
        q: "Does the system reject candidates automatically?",
        a: "No. The system acts as a recruiter assistant—it ranks and highlights relevant competencies, but final decisions remain in human hands.",
      },
      {
        q: "How does the blind evaluation mode improve hiring diversity?",
        a: "By hiding demographic cues during the initial screening round, recruiters evaluate candidates strictly on evidence of skill and experience.",
      },
      {
        q: "Can the system parse resumes written in formats other than English?",
        a: "Yes. Our NLP models support multilingual document classification including English, French, and Swahili.",
      },
    ],
  },
  {
    slug: "hospital",
    title: "Healthcare EHR & Clinic Suite",
    category: "enterprise",
    tagline: "HIPAA-Compliant Electronic Health Records, Appointments & Lab Results",
    summary:
      "A secure clinical management platform with encrypted patient medical histories, digital prescriptions, and insurance billing workflows.",
    whatItIs:
      "An integrated clinical operations solution connecting reception triage, doctor consultations, lab orders, and pharmacy dispensaries into a unified patient record.",
    whoItIsFor:
      "Hospitals, specialist medical clinics, outpatient surgical centres, and diagnostic laboratories.",
    published: false,
    demoAvailable: false,
    modules: [
      { title: "Encrypted Patient Health Records", description: "Longitudinal patient chart with diagnosis, allergy, and medication logs." },
      { title: "Teleconsultation & Booking", description: "Encrypted video consultation and SMS appointment reminder engine." },
      { title: "Laboratory Integration", description: "Digital test request ordering with automated PDF patient result delivery." },
      { title: "Pharmacy Dispensing", description: "Barcode drug inventory management with dosage contraindication alerts." },
    ],
    keyFeatures: [
      { title: "HIPAA & DPA Compliance", description: "Military-grade AES-256 encryption at rest with field-level access control." },
      { title: "Insurance Claim Processing", description: "Automated billing reconciliation with local medical insurance providers." },
    ],
    deploymentOptions: {
      cloud: { title: "HIPAA Cloud", description: "Compliant cloud cluster.", highlights: ["Automated audit trails"] },
      selfHosted: { title: "Hospital On-Premise", description: "Local hospital server.", highlights: ["LAN access during outages"] },
    },
    screenshots: [],
    faqs: [],
  },
  {
    slug: "procurement",
    title: "B2B Wholesale & Vendor Hub",
    category: "enterprise",
    tagline: "Automated Supplier Purchase Orders, RFQ Tendering & Catalog Portals",
    summary:
      "A collaborative supply chain portal for enterprise buyers and commercial vendors to negotiate terms, issue purchase orders, and track deliveries.",
    whatItIs:
      "A dedicated procurement exchange replacing endless email bids with structured digital RFQs, three-way matching, and early payment discounts.",
    whoItIsFor:
      "Wholesale distributors, hotel chains, construction contractors, and enterprise procurement divisions.",
    published: false,
    demoAvailable: false,
    modules: [
      { title: "Digital RFQ Tendering", description: "Vendor bid comparison matrix with price benchmarking." },
      { title: "Three-Way Invoice Matching", description: "Automatic matching between Purchase Order, Goods Receipt, and Invoice." },
    ],
    keyFeatures: [
      { title: "Fraud Prevention Controls", description: "Segregation of duties with dual authorization on supplier bank changes." },
    ],
    deploymentOptions: {
      cloud: { title: "Hosted Supplier Hub", description: "Multi-tenant cloud.", highlights: ["Rapid onboarding"] },
      selfHosted: { title: "Private ERP Integration", description: "On-premise integration.", highlights: ["Direct SAP / Oracle sync"] },
    },
    screenshots: [],
    faqs: [],
  },
  {
    slug: "edtech",
    title: "Learning Engine & Credential Vault",
    category: "enterprise",
    tagline: "Interactive Course Delivery, Exam Timers & Verifiable Diplomas",
    summary:
      "A scalable online learning management system featuring adaptive video streaming, anti-cheat assessment timers, and cryptographically signed digital certificates.",
    whatItIs:
      "An educational portal engineered for low-bandwidth video playback, interactive quizzes, and student fee reconciliation.",
    whoItIsFor:
      "Universities, corporate training academies, vocational colleges, and professional certification bodies.",
    published: false,
    demoAvailable: false,
    modules: [
      { title: "Adaptive Bitrate Video Player", description: "Smooth streaming on slow 3G connections with offline caching." },
      { title: "Auto-Saving Exam Engine", description: "Zero data loss during unexpected power or browser restarts." },
    ],
    keyFeatures: [
      { title: "Cryptographic Certificates", description: "QR-verifiable credentials that cannot be forged." },
    ],
    deploymentOptions: {
      cloud: { title: "Global CDN LMS", description: "Edge-hosted worldwide.", highlights: ["Sub-second video delivery"] },
      selfHosted: { title: "Campus Intranet LMS", description: "Local campus server.", highlights: ["Zero mobile data cost on campus WiFi"] },
    },
    screenshots: [],
    faqs: [],
  },
  {
    slug: "real-estate-portal",
    title: "PropTech Tenancy & Property Hub",
    category: "enterprise",
    tagline: "Automated Rent Reconciliation, Lease Signing & Maintenance Desk",
    summary:
      "A property management platform automating monthly M-Pesa rent collections, unit vacancy tracking, and digital maintenance work orders.",
    whatItIs:
      "A comprehensive landlord and tenant portal that eliminates spreadsheet rent tracking and streamlines tenant repair requests.",
    whoItIsFor:
      "Real estate asset managers, residential property agencies, commercial landlords, and facility managers.",
    published: false,
    demoAvailable: false,
    modules: [
      { title: "M-Pesa Rent Auto-Settlement", description: "Automatic tenant ledger updates upon Paybill receipt." },
      { title: "Maintenance Work Orders", description: "Photo ticketing system routing repairs directly to caretakers." },
    ],
    keyFeatures: [
      { title: "Occupancy & Yield Analytics", description: "Real-time landlord dashboard tracking rental yields and arrears." },
    ],
    deploymentOptions: {
      cloud: { title: "Multi-Property Cloud", description: "Cloud managed.", highlights: ["Instant tenant SMS alerts"] },
      selfHosted: { title: "Private Estate Server", description: "Private server.", highlights: ["Local data ownership"] },
    },
    screenshots: [],
    faqs: [],
  },
];

export async function getSolutions(): Promise<Solution[]> {
  return solutions;
}

export async function getSolution(slug: string): Promise<Solution | undefined> {
  return solutions.find((s) => s.slug === slug);
}
