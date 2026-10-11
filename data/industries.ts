export interface IndustryServiceMapping {
  serviceSlug: string;
  serviceTitle: string;
  description: string;
  deliverables: string[];
}

export interface IndustryChallenge {
  title: string;
  description: string;
}

export interface Industry {
  slug: string;
  title: string;
  summary: string;
  heroDescription: string;
  challenges: IndustryChallenge[];
  howWeHelp: IndustryServiceMapping[];
  relevantCaseStudySlugs: string[];
  faqs: { q: string; a: string }[];
  icon: string;
}

export const industries: Industry[] = [
  {
    slug: "financial",
    title: "Financial Services & FinTech",
    summary:
      "Bank-grade payment rails, M-Pesa automated ledgers, alternative credit modeling, and regulatory-compliant cloud architectures.",
    heroDescription:
      "From high-velocity micro-lending algorithms to automated multi-currency treasury reconciliation, we engineer resilient financial software compliant with Central Bank of Kenya (CBK) guidelines and global security standards.",
    icon: "Landmark",
    challenges: [
      {
        title: "Strict Regulatory Compliance & Auditing",
        description:
          "Meeting Data Protection Act 2019 and CBK requirements requires immutable audit logs, deterministic transactions, and end-to-end data encryption at rest and in transit.",
      },
      {
        title: "Real-Time Mobile Money Settlement",
        description:
          "High transaction volumes across M-Pesa STK push and C2B/B2C endpoints cause callback queue bottlenecks, requiring idempotent worker queues and sub-second reconciliation.",
      },
      {
        title: "Thin-File Borrower Evaluation",
        description:
          "Over 60% of informal MSME traders lack traditional commercial credit histories, demanding alternative ML risk scoring using statement vectorization and transaction heuristics.",
      },
      {
        title: "Zero-Downtime High Availability",
        description:
          "Financial applications cannot afford downtime during month-end payment windows, requiring multi-region failover and active-active database replication.",
      },
    ],
    howWeHelp: [
      {
        serviceSlug: "ai-automation",
        serviceTitle: "AI & ML Integrations",
        description:
          "Deploy alternative credit risk scoring engines and automated fraud detection pipelines that parse mobile money statements in under two seconds.",
        deliverables: [
          "M-Pesa transaction vectorizer",
          "Explainable credit risk scoring cards",
          "Automated loan default risk indicators",
        ],
      },
      {
        serviceSlug: "custom-software",
        serviceTitle: "Custom Software Engineering",
        description:
          "Architect bespoke double-entry accounting ledgers, multi-tenant loan servicing engines, and institutional treasury dashboards.",
        deliverables: [
          "Double-entry bookkeeping engines",
          "Automated ledger reconciliation bots",
          "Role-based compliance & audit logs",
        ],
      },
      {
        serviceSlug: "cloud-devops",
        serviceTitle: "Cloud Architecture & DevOps",
        description:
          "Configure zero-trust VPC networks, PCI-DSS compliant infrastructure, and automated disaster recovery failover on AWS / GCP.",
        deliverables: [
          "Encrypted database clusters with automated backups",
          "Isolated staging and production VPCs",
          "Real-time latency and error alert monitors",
        ],
      },
    ],
    relevantCaseStudySlugs: ["trustflow", "stellar-auction"],
    faqs: [
      {
        q: "How do you ensure compliance with Kenya's Data Protection Act and financial regulations?",
        a: "We implement data residency configurations where required, enforce TLS 1.3 in transit and AES-256 at rest, build granular role-based access controls (RBAC), and maintain append-only audit tables for all state changes.",
      },
      {
        q: "Can you integrate directly with Safaricom Daraja M-Pesa APIs?",
        a: "Yes. We have built production systems handling STK Push (Lipa na M-Pesa Online), C2B validation/confirmation callbacks, B2C payouts, and automated reversal tracking with idempotent webhook listeners.",
      },
      {
        q: "What database architectures do you recommend for financial ledgers?",
        a: "We utilize ACID-compliant relational databases (PostgreSQL) paired with append-only ledger designs and optimistic locking to prevent double-spending and ledger drift under high concurrency.",
      },
    ],
  },
  {
    slug: "retail",
    title: "Retail & E-commerce",
    summary:
      "Headless storefronts, omnichannel inventory synchronization, high-concurrency flash sale architectures, and local payment gateways.",
    heroDescription:
      "We replace bloated, slow monolithic stores with headless e-commerce platforms engineered for sub-second page loads, automated inventory sync across warehouses, and native M-Pesa checkout.",
    icon: "ShoppingBag",
    challenges: [
      {
        title: "Traffic Spikes During Campaigns",
        description:
          "Black Friday and flash sale promotions overwhelm traditional WordPress or Magento databases, leading to server crashes and abandoned carts.",
      },
      {
        title: "Fragmented Multi-Branch Inventory",
        description:
          "Stock levels across physical retail stores and digital storefronts fall out of sync without sub-second bidirectional inventory webhooks.",
      },
      {
        title: "Slow Mobile Checkout Latency",
        description:
          "Shoppers on spotty 3G/4G connections drop off if cart pages take over 3 seconds to load or require multi-step account registration.",
      },
    ],
    howWeHelp: [
      {
        serviceSlug: "web-application-development",
        serviceTitle: "Web Application Development",
        description:
          "Build headless Next.js e-commerce storefronts cached at edge CDN nodes for sub-second mobile performance.",
        deliverables: [
          "Edge-cached product catalog pages",
          "One-tap M-Pesa Express checkout",
          "Instant Algolia / Meilisearch product discovery",
        ],
      },
      {
        serviceSlug: "api-development-and-integration",
        serviceTitle: "API Development & Integration",
        description:
          "Connect ERPs, point-of-sale (POS) systems, and logistics courier APIs into a unified inventory and order fulfillment pipeline.",
        deliverables: [
          "Real-time bidirectional inventory sync webhooks",
          "Courier dispatch automation (Sendy, Fargo, G4S)",
          "Centralized omnichannel order dashboard",
        ],
      },
      {
        serviceSlug: "maintenance-and-support",
        serviceTitle: "Maintenance & SLA Support",
        description:
          "Provide 24/7 server monitoring, proactive load testing before peak shopping events, and uptime guarantees.",
        deliverables: [
          "Pre-campaign stress & load testing",
          "Automated auto-scaling group policies",
          "Dedicated on-call engineer during flash sales",
        ],
      },
    ],
    relevantCaseStudySlugs: ["foresafe"],
    faqs: [
      {
        q: "Why should an e-commerce brand switch to a headless architecture?",
        a: "Headless decouples the front-facing user experience from the back-office database. Your storefront loads in under 500ms on mobile, SEO scores reach 98+, and traffic spikes cannot crash your checkout flow.",
      },
      {
        q: "How does your M-Pesa checkout experience differ from standard plugins?",
        a: "Our checkout triggers the M-Pesa STK push directly within the browser session, listens for the callback over WebSockets, and transitions to the order confirmation screen without page refreshes.",
      },
      {
        q: "Can you synchronize stock with our physical POS systems in Nairobi?",
        a: "Yes. We engineer event-driven sync microservices that update web inventory instantly whenever a barcode is scanned at your physical checkout counters.",
      },
    ],
  },
  {
    slug: "agriculture",
    title: "Agriculture (AgriTech)",
    summary:
      "Offline-first field worker apps, farmer cooperative registries, supply chain traceability, and IoT telematics for agribusiness.",
    heroDescription:
      "We build resilient digital infrastructure for farming cooperatives, outgrower schemes, and agribusiness exporters, engineered specifically for intermittent connectivity and field operations.",
    icon: "Leaf",
    challenges: [
      {
        title: "Intermittent Rural Cellular Reception",
        description:
          "Agronomists and cooperative extension officers collect produce records in deep rural acreage where network connectivity drops constantly.",
      },
      {
        title: "Complex Farm-to-Export Traceability",
        description:
          "Global export markets (EU, UK) enforce strict residue tracking and provenance certifications that require granular batch history.",
      },
      {
        title: "Disorganized Smallholder Payouts",
        description:
          "Disbursing crop earnings to thousands of smallholder farmers across manual spreadsheets causes delays, payment fraud, and ledger errors.",
      },
    ],
    howWeHelp: [
      {
        serviceSlug: "mobile-apps",
        serviceTitle: "Mobile App Development",
        description:
          "Deliver offline-first React Native apps utilizing SQLite caching that record produce weigh-ins and synchronize automatically upon network restore.",
        deliverables: [
          "Offline weighbridge & produce grading app",
          "Bluetooth digital scale integration",
          "Automatic background sync reconciliation",
        ],
      },
      {
        serviceSlug: "custom-software",
        serviceTitle: "Custom Software Engineering",
        description:
          "Develop enterprise cooperative management software tracking smallholder member loans, input advances, and bulk harvest volumes.",
        deliverables: [
          "Cooperative member & plot mapping registry",
          "Automated deduction and net payout calculation engine",
          "Bulk M-Pesa B2C harvest payout gateway",
        ],
      },
      {
        serviceSlug: "cloud-devops",
        serviceTitle: "Cloud Architecture & DevOps",
        description:
          "Deploy high-durability geospatial data warehouses storing farm polygon boundaries, weather telemetry, and satellite vegetation indices.",
        deliverables: [
          "PostGIS geospatial boundary database",
          "Automated weather forecast ingestion pipeline",
          "Audit-ready traceability report exports",
        ],
      },
    ],
    relevantCaseStudySlugs: ["foresafe", "trustflow"],
    faqs: [
      {
        q: "How do your mobile apps work when there is zero internet connection on the farm?",
        a: "We utilize an offline-first architecture where all produce records, photos, and digital signatures are stored in an encrypted local SQLite database. The app queues outbox messages and syncs with cloud endpoints the instant data connectivity returns.",
      },
      {
        q: "Can the platform disburse bulk harvest payouts directly to farmers' M-Pesa accounts?",
        a: "Yes. Our systems integrate with Safaricom B2C bulk payment APIs, enabling cooperative finance managers to review batch produce totals and disburse verified mobile payments with dual-signatory approval.",
      },
      {
        q: "Do you support hardware integrations with digital scales or barcode scanners?",
        a: "Yes. We build Bluetooth Low Energy (BLE) drivers within our mobile apps to capture weight data directly from digital scales, eliminating human data-entry errors.",
      },
    ],
  },
  {
    slug: "healthcare",
    title: "Healthcare & HealthTech",
    summary:
      "HIPAA-compliant telemedicine platforms, electronic health records (EHR), clinic queue dispatching, and lab result portals.",
    heroDescription:
      "We architect high-security digital health platforms prioritizing patient confidentiality, rapid medical appointment triage, and seamless interoperability between hospitals, labs, and patients.",
    icon: "HeartPulse",
    challenges: [
      {
        title: "Rigorous Patient Data Privacy (HIPAA/GDPR)",
        description:
          "Medical records require strict data encryption, tamper-proof access audit trails, and strict separation of clinical notes from identifying demographics.",
      },
      {
        title: "Inflexible Legacy Hospital Information Systems",
        description:
          "Integrating patient apps with archaic on-premise hospital databases requires resilient HL7 / FHIR data translation layers.",
      },
      {
        title: "Clinic Bottlenecks & Long Patient Queues",
        description:
          "Lack of automated appointment booking and remote consultation leads to crowded waiting rooms and doctor scheduling burnout.",
      },
    ],
    howWeHelp: [
      {
        serviceSlug: "custom-software",
        serviceTitle: "Custom Software Engineering",
        description:
          "Build custom clinic practice management platforms with appointment triage, digital prescription issuing, and billing integrations.",
        deliverables: [
          "Role-based doctor, nurse, and admin consoles",
          "Encrypted electronic health record (EHR) viewer",
          "Integrated insurance claim & cash billing tracking",
        ],
      },
      {
        serviceSlug: "mobile-apps",
        serviceTitle: "Mobile App Development",
        description:
          "Deliver secure patient companion apps for scheduling doctor consultations, reviewing lab test results, and receiving medication reminders.",
        deliverables: [
          "Biometric patient login (Face ID / Fingerprint)",
          "Encrypted PDF lab results vault",
          "In-app teleconsultation scheduling",
        ],
      },
      {
        serviceSlug: "qa-and-security-testing",
        serviceTitle: "QA & Security Testing",
        description:
          "Conduct extensive vulnerability scanning, HIPAA compliance auditing, and penetration tests against patient data endpoints.",
        deliverables: [
          "OWASP Top 10 penetration testing report",
          "Data privacy compliance checklist",
          "Cryptographic audit of data at rest & in transit",
        ],
      },
    ],
    relevantCaseStudySlugs: ["foresafe"],
    faqs: [
      {
        q: "How do you protect sensitive patient records and medical histories?",
        a: "We implement field-level database encryption, zero-retention session states, automated token expiration, and complete immutable audit logs tracking every single record access event.",
      },
      {
        q: "Can patients pay for consultation fees using M-Pesa or credit cards inside the app?",
        a: "Yes. We support embedded mobile money checkout and international card payments with automatic digital receipt generation sent via SMS or email.",
      },
      {
        q: "Do you build video consultation features for remote doctor appointments?",
        a: "Yes. We integrate WebRTC-based encrypted video calling SDKs (such as Twilio Video or LiveKit) featuring end-to-end encryption and low bandwidth optimization.",
      },
    ],
  },
  {
    slug: "education",
    title: "Education (EdTech)",
    summary:
      "Interactive learning management systems (LMS), student credential registries, assessment engines, and parent engagement portals.",
    heroDescription:
      "We design interactive learning applications and administrative school management software that empower institutions, universities, and corporate training programs.",
    icon: "GraduationCap",
    challenges: [
      {
        title: "Concurrency Surges During Virtual Exams",
        description:
          "Thousands of students submitting online assessments simultaneously causes server crashes and lost answer sheets.",
      },
      {
        title: "High Bandwidth Costs for Video Lessons",
        description:
          "Video streaming consumes expensive mobile data for students in emerging markets unless optimized with adaptive bitrate streaming.",
      },
      {
        title: "Disjointed Tuition Fee Tracking",
        description:
          "Manual tracking of school fees, bank slips, and mobile money payments creates massive accounting overhead and reconciliation delays.",
      },
    ],
    howWeHelp: [
      {
        serviceSlug: "web-application-development",
        serviceTitle: "Web Application Development",
        description:
          "Engineer fast, modular learning portals with video lesson playback, quiz timers, and interactive discussion boards.",
        deliverables: [
          "Adaptive bitrate video player integration",
          "Auto-saving student assessment engine",
          "Progress dashboards and course completion analytics",
        ],
      },
      {
        serviceSlug: "custom-software",
        serviceTitle: "Custom Software Engineering",
        description:
          "Build unified school administrative software automating fee billing, student enrollment, and report card generation.",
        deliverables: [
          "Student information system (SIS) database",
          "Automated M-Pesa fee reconciliation module",
          "Digital report card PDF generator",
        ],
      },
      {
        serviceSlug: "ai-automation",
        serviceTitle: "AI & ML Integrations",
        description:
          "Deploy intelligent assessment grading assistants and semantic plagiarism detection tools.",
        deliverables: [
          "Automated short-answer scoring assistant",
          "Semantic text similarity checking",
          "Personalized study recommendation prompts",
        ],
      },
    ],
    relevantCaseStudySlugs: ["rapidrecruit"],
    faqs: [
      {
        q: "How do your platforms optimize video courses for students with limited internet bundles?",
        a: "We implement HLS (HTTP Live Streaming) with adaptive bitrate compression, allowing video players to downscale seamlessly to 360p on slow 3G connections and allowing offline lesson downloads in mobile apps.",
      },
      {
        q: "Can parents pay school fees via M-Pesa Paybill with instant verification?",
        a: "Yes. When a parent enters their child's admission number on M-Pesa, our webhook automatically reconciles the payment against the student's fee ledger and sends an instant confirmation SMS.",
      },
      {
        q: "Are the exam systems resilient against unexpected power cuts or browser crashes?",
        a: "Yes. Our exam engines auto-save answers locally every 5 seconds. If a student's device restarts, they resume precisely where they left off with zero data loss.",
      },
    ],
  },
  {
    slug: "ngos",
    title: "NGOs & Non-Profits",
    summary:
      "Donor management systems, field project monitoring & evaluation (M&E) tools, transparent grant reporting, and public survey platforms.",
    heroDescription:
      "We partner with international development agencies, humanitarian charities, and social enterprises to build cost-effective, auditable digital platforms that track real-world impact.",
    icon: "Globe2",
    challenges: [
      {
        title: "Stringent Donor Accountability & Auditing",
        description:
          "Institutional donors (USAID, EU, FCDO) require verifiable, timestamped proof of programmatic spending and beneficiary reach.",
      },
      {
        title: "Dispersed Multi-Country Field Teams",
        description:
          "Collecting survey metrics across multiple East African countries results in siloed, non-standardized Excel spreadsheets.",
      },
      {
        title: "Tight Operational IT Budgets",
        description:
          "High recurring enterprise SaaS licensing fees deplete funding that should otherwise go directly to frontline humanitarian interventions.",
      },
    ],
    howWeHelp: [
      {
        serviceSlug: "custom-software",
        serviceTitle: "Custom Software Engineering",
        description:
          "Build centralized Monitoring & Evaluation (M&E) indicator portals tracking programmatic project milestones in real time.",
        deliverables: [
          "Results framework indicator tracker",
          "Beneficiary registry with biometric deduplication",
          "One-click donor compliance PDF exports",
        ],
      },
      {
        serviceSlug: "mobile-apps",
        serviceTitle: "Mobile App Development",
        description:
          "Deploy custom survey and beneficiary registration apps equipped with GPS geotagging and offline validation rules.",
        deliverables: [
          "Offline GPS field assessment forms",
          "Multi-language survey UI (English, Swahili, Somali)",
          "Encrypted beneficiary photo capture",
        ],
      },
      {
        serviceSlug: "cloud-devops",
        serviceTitle: "Cloud Architecture & DevOps",
        description:
          "Design cost-optimized serverless architectures that scale to zero during non-survey months, reducing cloud infrastructure bills by up to 70%.",
        deliverables: [
          "Serverless AWS / Supabase deployment",
          "Automated monthly cost containment limits",
          "Daily encrypted database backups to S3",
        ],
      },
    ],
    relevantCaseStudySlugs: ["rapidrecruit", "foresafe"],
    faqs: [
      {
        q: "Why should an NGO build custom M&E software instead of using off-the-shelf SaaS?",
        a: "Off-the-shelf tools charge hefty per-seat licensing fees and force your logframes into generic structures. Custom software gives you 100% intellectual property ownership, zero recurring user fees, and tailored donor reporting.",
      },
      {
        q: "Do your field survey tools prevent duplicate registrations of beneficiaries?",
        a: "Yes. We incorporate automated deduplication algorithms matching national ID numbers, phonetics, and photo hashing to ensure fair resource allocation.",
      },
      {
        q: "Can the platform export data directly into donor-specified Excel and PDF formats?",
        a: "Yes. We build automated reporting engines that populate pre-formatted USAID, UN, and EU indicator tables with a single click.",
      },
    ],
  },
  {
    slug: "logistics",
    title: "Logistics & Supply Chain",
    summary:
      "Fleet tracking dashboards, driver dispatch mobile apps, QR package sorting, and automated proof-of-delivery (POD) workflows.",
    heroDescription:
      "We build high-concurrency fleet telematics consoles, last-mile delivery dispatch apps, and warehouse inventory tracking systems for transportation and logistics operators.",
    icon: "Truck",
    challenges: [
      {
        title: "Driver Location Blindspots",
        description:
          "Dispatchers lack real-time visibility into vehicle locations, route deviations, and cargo security across interstate transit corridors.",
      },
      {
        title: "Lost Proof-of-Delivery Documents",
        description:
          "Paper delivery slips frequently get lost, damaged, or delayed, stalling invoicing cycles and causing customer payment disputes.",
      },
      {
        title: "Inefficient Route Planning & Fuel Waste",
        description:
          "Suboptimal routing and uncoordinated cargo drops increase fuel consumption and prolong delivery transit windows.",
      },
    ],
    howWeHelp: [
      {
        serviceSlug: "mobile-apps",
        serviceTitle: "Mobile App Development",
        description:
          "Build native driver apps with turn-by-turn route optimization, barcode scanning, and instant digital Proof-of-Delivery.",
        deliverables: [
          "Barcode & QR package scanning",
          "Digital signature & photo capture for POD",
          "Low-battery GPS background location telemetry",
        ],
      },
      {
        serviceSlug: "custom-software",
        serviceTitle: "Custom Software Engineering",
        description:
          "Develop enterprise fleet management consoles with real-time WebSocket map tracking, vehicle maintenance logs, and billing.",
        deliverables: [
          "Live interactive fleet map console",
          "Automated trip invoicing & driver settlement",
          "Preventative maintenance scheduling triggers",
        ],
      },
      {
        serviceSlug: "api-development-and-integration",
        serviceTitle: "API Development & Integration",
        description:
          "Integrate third-party GPS hardware tracker webhooks (Teltonika, Ruptela) and e-commerce merchant order endpoints.",
        deliverables: [
          "IoT telematics hardware ingestion API",
          "Merchant order webhook listener",
          "Customer SMS & WhatsApp tracking update alerts",
        ],
      },
    ],
    relevantCaseStudySlugs: ["foresafe"],
    faqs: [
      {
        q: "How does the digital Proof-of-Delivery (POD) workflow accelerate client billing?",
        a: "As soon as a recipient signs on the driver's smartphone and a delivery photo is captured, the system automatically generates a PDF delivery certificate and emails it alongside the invoice, reducing payment cycles from weeks to minutes.",
      },
      {
        q: "Can your system ingest telemetry data from our existing GPS hardware trackers?",
        a: "Yes. We build high-throughput TCP / UDP and HTTP ingestion gateways that parse binary and JSON telemetry streams from hardware vendors like Teltonika, Tramigo, and Ruptela.",
      },
      {
        q: "Does the driver app work in areas with weak GPS and cellular signals?",
        a: "Yes. Waypoints and delivery confirmations are recorded locally with precise hardware timestamps and synchronized once connectivity resumes.",
      },
    ],
  },
  {
    slug: "real-estate",
    title: "Real Estate & PropTech",
    summary:
      "Property management portals, automated tenant rent collection, maintenance ticketing, and interactive listing directories.",
    heroDescription:
      "We develop modern PropTech platforms that streamline tenancy agreements, automate monthly M-Pesa rent reconciliation, and empower property managers with live occupancy analytics.",
    icon: "Building2",
    challenges: [
      {
        title: "Time-Consuming Manual Rent Reconciliation",
        description:
          "Matching hundreds of individual M-Pesa and bank transactions to unit tenants each month consumes days of manual property manager labour.",
      },
      {
        title: "Disorganized Maintenance Complaints",
        description:
          "Tenant maintenance requests sent via WhatsApp get lost, leading to delayed repairs, frustrated tenants, and property depreciation.",
      },
      {
        title: "Low Conversion on Property Listing Sites",
        description:
          "Slow image loading and poor search filtering lead prospective buyers and renters to abandon property portals.",
      },
    ],
    howWeHelp: [
      {
        serviceSlug: "custom-software",
        serviceTitle: "Custom Software Engineering",
        description:
          "Engineer multi-tenant property management back-offices with automated rent invoicing, lease agreement tracking, and expense ledgers.",
        deliverables: [
          "Automated monthly rent invoice generator",
          "M-Pesa Paybill / Bank statement reconciler",
          "Property owner dividend payout ledger",
        ],
      },
      {
        serviceSlug: "web-application-development",
        serviceTitle: "Web Application Development",
        description:
          "Deliver lightning-fast property portal storefronts featuring optimized media delivery, interactive map search, and virtual tour embeds.",
        deliverables: [
          "Cloudinary CDN media optimization for 4K property photos",
          "Interactive map-based neighborhood search",
          "Tenant portal for rent payment and repair ticketing",
        ],
      },
      {
        serviceSlug: "ui-ux-design",
        serviceTitle: "UI/UX Design",
        description:
          "Design intuitive tenant onboarding flows and clean landlord dashboards with clear yield and occupancy visualizations.",
        deliverables: [
          "Tenant mobile-first payment interface",
          "Landlord cash flow & occupancy charts",
          "Standardized design token library",
        ],
      },
    ],
    relevantCaseStudySlugs: ["foresafe"],
    faqs: [
      {
        q: "How does automated rent reconciliation work with M-Pesa Paybill?",
        a: "Each tenant is assigned their house number or account ID. When they pay via Paybill, Safaricom's webhook hits our system, which validates the tenant account, marks the rent invoice as settled, and sends an SMS receipt immediately.",
      },
      {
        q: "Can tenants submit photo evidence of maintenance issues?",
        a: "Yes. The tenant portal allows residents to snap photos of plumbing, electrical, or structural issues, categorizes the urgency, and routes it directly to the designated caretaker.",
      },
      {
        q: "Do you support multi-property management for commercial real estate firms?",
        a: "Yes. Our architecture supports unlimited property hierarchies: from residential apartment blocks and gated communities to multi-floor commercial office towers.",
      },
    ],
  },
];

export async function getIndustries(): Promise<Industry[]> {
  return industries;
}

export async function getIndustry(slug: string): Promise<Industry | undefined> {
  return industries.find((i) => i.slug === slug);
}
