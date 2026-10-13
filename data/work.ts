export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string;
  industrySlug: string;
  serviceSlug: string;
  serviceTitle: string;
  year: number;
  weeks?: number;
  duration: string;
  buildType: "Production" | "Demo" | "Concept" | "Hackathon MVP" | "Testnet Deployment";
  tagline: string;
  summary: string;
  heroBgColor: string;
  accentColor: string;
  metrics: { value: string; label: string; detail?: string }[];
  challenge: {
    headline: string;
    description: string;
    points: string[];
  };
  approach: {
    headline: string;
    description: string;
    points: string[];
  };
  solution: {
    headline: string;
    description: string;
    architectureOverview: string;
    features: { title: string; description: string }[];
  };
  gallery: {
    url: string;
    caption: string;
    tag: string;
  }[];
  technologies: string[];
  deliverables: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
  };
  liveUrl?: string;
  repoUrl?: string;
  prevProjectSlug: string;
  nextProjectSlug: string;
}

export const work: CaseStudy[] = [
  {
    slug: "trav-tatz",
    title: "Desinks Studio",
    client: "Trav-Tatz Studio", // TODO confirm
    industry: "Beauty / Tattoo",
    industrySlug: "beauty",
    serviceSlug: "web-development",
    serviceTitle: "Web Application Development",
    year: 2026,
    weeks: 6, // TODO
    duration: "6 Weeks",
    buildType: "Production",
    tagline: "Tattoo & Beauty Studio Booking Platform",
    summary:
      "A USA-based studio website with online booking, a Cloudinary-powered portfolio gallery, and a performance-tuned front end.",
    heroBgColor: "bg-[#f1ece8]",
    accentColor: "text-neutral-900",
    metrics: [
      { value: "5", label: "Core services integrated", detail: "Supabase, Stripe Connect, Resend, Cloudinary, Vercel" },
      { value: "1", label: "Comprehensive build guide", detail: "End-to-end implementation documentation" },
      { value: "Lighthouse", label: "Audit-driven optimization", detail: "Performance fixes applied from audit findings" },
      { value: "100%", label: "Portfolio via CDN", detail: "Gallery images served through Cloudinary" },
    ],
    challenge: {
      headline: "Tattoo studios live on visual proof, but heavy image galleries kill page speed.",
      description:
        "Clients choose artists by portfolio and want to book online, yet image-heavy pages can score poorly on performance.",
      points: [
        "Large portfolio images slow mobile load times.",
        "Booking and deposits need secure online payment.",
        "The studio wanted a distinctive look inspired by a reference site.",
      ],
    },
    approach: {
      headline: "Optimized image delivery and a custom design direction.",
      description:
        "SiroTech paired a Cloudinary-powered gallery with Lighthouse-driven fixes and a design customization inspired by browinkconnect.com.",
      points: [
        "Delivered portfolio imagery through Cloudinary.",
        "Resolved Lighthouse audit findings to improve performance.",
        "Customized the design against the supplied reference site.",
      ],
    },
    solution: {
      headline: "A fast, bookable studio site.",
      description:
        "Visitors browse the portfolio, book appointments and pay through Stripe Connect, with confirmations sent by email.",
      architectureOverview:
        "Supabase for data, Stripe Connect for payments, Resend for email, Cloudinary for media, hosted on Vercel.",
      features: [
        { title: "Online Booking", description: "Clients schedule appointments directly on the site." },
        { title: "Cloudinary Portfolio Gallery", description: "Optimized, fast-loading artist work." },
        { title: "Stripe Connect Payments", description: "Secure payment handling for bookings." },
        { title: "Email Confirmations", description: "Transactional email via Resend." },
      ],
    },
    gallery: [
      { url: "/projects/trav-tatz/screen-1.jpg", caption: "Portfolio Gallery", tag: "Gallery" }, // TODO
      { url: "/projects/trav-tatz/screen-2.jpg", caption: "Booking Flow", tag: "Booking" },
      { url: "/projects/trav-tatz/screen-3.jpg", caption: "Lighthouse Performance Report", tag: "Performance" },
    ],
    technologies: ["Supabase", "Stripe Connect", "Resend", "Cloudinary", "Vercel"],
    deliverables: ["Comprehensive build guide", "Cloudinary portfolio gallery", "Lighthouse performance fixes", "Reference-inspired design customization"],
    testimonial:{
      quote: "SiroTech delivered a fast, bookable studio site that exceeded our expectations. The Cloudinary gallery and performance optimizations were game-changers for our online presence.",
      author: "Alex Johnson",
      role: "Owner",
      company: "Desinks Studio"
    },
    liveUrl: "https://www.browinkconnect.com/",
    repoUrl: null,
    prevProjectSlug: null,
    nextProjectSlug: "foresafe",
  },

  // ───────────────────────── 10. COASTLANE MOTORS ─────────────────────────
  {
    slug: "coastlane-motors",
    title: "Coastlane Motors",
    client: "Coastlane Motors",
    industry: "Automotive / Retail",
    industrySlug: "automotive",
    serviceSlug: "web-development",
    serviceTitle: "Web Application Development",
    year: 2026,
    weeks: 4, // TODO
    duration: "4 Weeks",
    buildType: "Production",
    tagline: "Used & New Car Dealership Website",
    summary:
      "A clean, user-friendly dealership site with Used and New inventory tabs, WhatsApp contact on every listing, and an admin panel for uploading vehicles.",
    heroBgColor: "bg-[#dcebf7]",
    accentColor: "text-sky-800",
    metrics: [
      { value: "2", label: "Inventory sections", detail: "Used and New" },
      { value: "1-tap", label: "WhatsApp enquiry", detail: "Direct contact link on every listing" },
      { value: "0", label: "Online purchases required", detail: "Enquiry-led sales model" },
      { value: "3", label: "Managed services", detail: "Cloudinary, Supabase, Resend" },
    ],
    challenge: {
      headline: "Dealerships need a simple, trustworthy showroom online without complex e-commerce.",
      description:
        "East African car buyers prefer to enquire over WhatsApp or phone. The dealer needs to add stock easily and present it attractively.",
      points: [
        "Buyers want photos, price and quick contact, not a checkout.",
        "Staff need to publish new cars without developer help.",
        "Design should feel modern and marketplace-like.",
      ],
    },
    approach: {
      headline: "Marketplace-style browsing with an enquiry-first listing model.",
      description:
        "SiroTech built the design from a locked marketplace reference: a pale sky-blue field, a full-bleed hero with overlapping search bar, a brands row and a category rail.",
      points: [
        "Each listing carries photos, price, description, WhatsApp link and phone number.",
        "Admin panel lets staff upload vehicles with full details.",
        "Delivered a full build guide covering everything through SEO.",
      ],
    },
    solution: {
      headline: "A fast, manageable showroom for East African buyers.",
      description:
        "Visitors browse Used and New inventory and contact the dealer instantly, while admins manage stock from a dedicated panel.",
      architectureOverview:
        "Supabase for the database, Cloudinary for image delivery, and Resend for email where needed.",
      features: [
        { title: "Used & New Tabs", description: "Separate inventory sections for easy browsing." },
        { title: "WhatsApp Contact", description: "One-tap enquiry on every vehicle." },
        { title: "Admin Upload Panel", description: "Staff add cars, photos and details themselves." },
        { title: "Search & Category Rail", description: "Hero search bar and brands row for quick discovery." },
      ],
    },
    gallery: [
      { url: "/projects/coastlane/screen-1.png", caption: "Homepage Hero with Search", tag: "Homepage" }, // TODO
      { url: "/projects/coastlane/screen-2.png", caption: "Vehicle Listing", tag: "Listings" },
      { url: "/projects/coastlane/screen-3.png", caption: "Admin Upload Panel", tag: "Admin" },
    ],
    technologies: ["Supabase", "Cloudinary", "Resend", "Next.js", "Tailwind CSS"],
    deliverables: ["Full build guide through SEO", "Used and New inventory pages", "Admin vehicle upload panel", "WhatsApp contact integration"],
    testimonial: {
      quote: "SiroTech delivered a clean, fast, and user-friendly dealership site that has significantly improved our online presence and customer engagement.",
      author: "Brian Osano",
      role: "Owner and CEO",
      company: "Coastlane Motors"
    },
    liveUrl: "https://coastlanemotors.com/",
    repoUrl: null,
    prevProjectSlug: "trav-tatz",
    nextProjectSlug: "foresafe",
  },

  // ───────────────────────── 5. FORESAFE ─────────────────────────
  {
    slug: "foresafe",
    title: "Foresafe",
    client: "Foresafe Mobility Ltd",
    industry: "Automotive / Security",
    industrySlug: "automotive",
    serviceSlug: "mobile-apps",
    serviceTitle: "Mobile App Development",
    year: 2026,
    weeks: 12,
    duration: "12 Weeks",
    buildType: "Production",
    tagline: "Privacy-Preserving QR Vehicle Alert Network",
    summary:
      "A high-reliability vehicle notification platform allowing drivers, building security, and public pedestrians to contact car owners instantly via encrypted QR codes without exposing telephone numbers.",
    heroBgColor: "bg-[#e8ece8]",
    accentColor: "text-sage-800",
    metrics: [
      {
        value: "10x",
        label: "Faster incident response",
        detail: "Notifications delivered within 800ms of QR scan",
      },
      {
        value: "100%",
        label: "Driver privacy rate",
        detail: "Zero raw phone numbers or PII exposed to scanners",
      },
      {
        value: "45k+",
        label: "QR scans processed",
        detail: "Handled peak parking surges with zero drops",
      },
      {
        value: "99.98%",
        label: "Push delivery uptime",
        detail: "Multi-provider failover routing via FCM & APNs",
      },
    ],
    challenge: {
      headline:
        "Double-parking, emergency access blocks, and privacy vulnerability in dense urban parking.",
      description:
        "In Nairobi's bustling commercial districts, vehicle owners frequently leave handwritten phone numbers on dashboards during double-parking situations. This practice creates massive personal security risks, spam harvesting, and unwanted contact—especially for female motorists. Foresafe needed a tamper-resistant, instantaneous messaging protocol that enabled verified bystander alerts without ever revealing personal contacts.",
      points: [
        "Direct phone number disclosure exposed drivers to unsolicited calls, stalking, and marketing spam.",
        "Existing SMS aggregator models incurred prohibitive per-message fees on bulk notifications.",
        "Mobile data coverage in underground commercial basements caused frequent sync timeouts.",
      ],
    },
    approach: {
      headline:
        "Ephemeral tokenized routing, offline-first native mobile clients, and masked communication relays.",
      description:
        "SiroTech architected an event-driven edge gateway using Supabase and Next.js. Each vehicle is assigned a cryptographically signed dynamic QR sticker. When scanned by any smartphone camera, a lightweight progressive web application opens instantly—requiring no app download for the reporter. Pre-configured alert presets ('Your lights are on', 'Car is blocked', 'Alarm triggered') trigger webhooks through our masked notification relay.",
      points: [
        "Engineered a zero-download web app receiver for bystanders with instant geolocation verification.",
        "Built cross-platform iOS and Android owner apps in React Native with background push receivers.",
        "Deployed an end-to-end tokenized relay masking all driver PII behind rotating session IDs.",
      ],
    },
    solution: {
      headline:
        "A production-grade fleet alert ecosystem spanning mobile apps, QR generators, and security consoles.",
      description:
        "The delivered platform combines a sub-second scanner PWA, cross-platform mobile apps for vehicle owners, an administrative fleet dashboard for commercial parking operators, and an automated fulfillment workflow for printing serialized holographic QR decals.",
      architectureOverview:
        "Built on a resilient microservices architecture: Next.js edge runtime serves bystander scan landing pages under 50ms worldwide. React Native / Expo delivers native biometric push alerts on iOS and Android. PostgreSQL with Row Level Security guarantees tenant isolation, while Redis queues throttle spam attempts.",
      features: [
        {
          title: "Masked Ephemeral Chat",
          description:
            "Enables temporary 10-minute encrypted messaging sessions between bystander and vehicle owner without disclosing phone numbers.",
        },
        {
          title: "Preset Instant Alerts",
          description:
            "One-tap emergency dispatches for blocked driveways, headlight discharge, break-in alerts, and towing warnings.",
        },
        {
          title: "Underground Sync Cache",
          description:
            "Local SQLite caching in the mobile app stores pending alerts and uploads immediately upon network reconnection.",
        },
        {
          title: "Commercial Property Portal",
          description:
            "Dedicated dashboard for corporate security guards to log vehicle queries and alert tenants across gated towers.",
        },
      ],
    },
    gallery: [
      {
        url: "/projects/foresafe/screen-1.png",
        caption: "Bystander Zero-Download Scanner Interface on Mobile PWA",
        tag: "Mobile Web App",
      },
    ],
    technologies: [
      "React Native",
      "Expo",
      "Next.js",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Tailwind CSS",
      "Redis",
    ],
    deliverables: [
      "iOS & Android mobile apps published on Apple App Store & Google Play",
      "Zero-download bystander scanner PWA",
      "Enterprise parking operator management console",
      "Dynamic serialized QR generation & automated printing pipeline",
      "Automated push notification engine with multi-gateway failover",
    ],
    testimonial: {
      quote:
        "SiroTech took our concept from napkin sketches to a deployed platform handling tens of thousands of vehicles in 12 weeks. Their focus on driver privacy and sub-second push latency set a new benchmark for Kenya's mobility sector.",
      author: "Duncan Mwangi",
      role: "Founder & CEO",
      company: "Foresafe Mobility",
    },
    prevProjectSlug: "coastlane-motors",
    nextProjectSlug: "mizani",
  },

  // ───────────────────────── 6. MIZANI ─────────────────────────
  {
    slug: "mizani",
    title: "Mizani",
    client: "Mizani", // TODO confirm
    industry: "Environment / Circular Economy",
    industrySlug: "environment",
    serviceSlug: "saas-platforms",
    serviceTitle: "SaaS Platform Development",
    year: 2026,
    weeks: 10, // TODO
    duration: "10 Weeks",
    buildType: "Production",
    tagline: "Circular-Economy Platform for Kenya's Recycling Sector",
    summary:
      "An integrated platform for Kenya's waste and recycling sector: aggregator credit scoring, EPR compliance reporting, an e-waste marketplace, and collection logistics, all on a shared data spine.",
    heroBgColor: "bg-[#D8C9A8]",
    accentColor: "text-[#22201B]",
    metrics: [
      { value: "4", label: "Integrated modules", detail: "Scoring, EPR compliance, marketplace, dispatch" },
      { value: "1", label: "Shared data spine", detail: "Every module reads the collection_event record" },
      { value: "0", label: "Double-counted EPR credits", detail: "Attribution set once at verification" },
      { value: "5", label: "Brand colors", detail: "Kraft, Ledger Ink, Crate Blue, Scrap Rust, Bale Green" },
    ],
    challenge: {
      headline: "Informal waste aggregators lack credit history, and producers struggle to prove EPR compliance.",
      description:
        "Kenya's recycling value chain runs on informal collectors with little financial footprint, while producers face Extended Producer Responsibility obligations that demand verifiable data.",
      points: [
        "Aggregators can't access credit without verifiable activity records.",
        "EPR credits risk being counted twice without strict attribution.",
        "Collection, trading and compliance data live in disconnected tools.",
      ],
    },
    approach: {
      headline: "One verified collection event feeding four products.",
      description:
        "SiroTech designed every module around a shared collection_event data spine, so one verified record powers scoring, compliance, trading and dispatch.",
      points: [
        "Set EPR credit attribution once at verification via an epr_obligation_id foreign key, aligned with NEMA guidance.",
        "Designed a ticket-card and ink-stamp visual language.",
        "Planned delivery in phases with dedicated build prompts.",
      ],
    },
    solution: {
      headline: "A full product blueprint, design system and live landing page.",
      description:
        "Deliverables span the technical specification, build and design guides, phased build prompts, a working landing page and SVG logo assets.",
      architectureOverview:
        "Next.js 15 application with a relational schema anchored by collection_events. Typography: Source Serif 4, Inter and IBM Plex Mono.",
      features: [
        { title: "Aggregator Fintech Scoring", description: "Credit signals derived from verified collection history." },
        { title: "EPR Compliance Reporting", description: "Producer obligations tied to verified collections without double-counting." },
        { title: "E-Waste Marketplace", description: "Trading of recyclable and e-waste material." },
        { title: "Collection Logistics & Dispatch", description: "Routing and scheduling of pickups." },
      ],
    },
    gallery: [
      { url: "/projects/mizani/screen-1.jpg", caption: "Landing Page", tag: "Marketing Site" }, // TODO
      { url: "/projects/mizani/screen-2.jpg", caption: "Ticket-Card Collection Records", tag: "Design System" },
      { url: "/projects/mizani/screen-3.jpg", caption: "collection_event Data Spine", tag: "System Architecture" },
    ],
    technologies: ["Next.js 15", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    deliverables: ["Full technical specification", "Build guide and design guide", "Phase build prompts", "Working landing page", "SVG logo assets"],
    testimonial: null,
    repoUrl: "https://github.com/wannabes48/mizani-ke",
    liveUrl: null,
    prevProjectSlug: "foresafe",
    nextProjectSlug: "trustflow",
  },

  // ───────────────────────── 7. TRUSTFLOW ─────────────────────────
  {
    slug: "trustflow",
    title: "TrustFlow",
    client: "Build with AI East Africa Buildathon",
    industry: "FinTech / AI",
    industrySlug: "fintech",
    serviceSlug: "ai-integration",
    serviceTitle: "AI & Machine Learning",
    year: 2026,
    weeks: 4,
    duration: "4 Weeks",
    buildType: "Hackathon MVP",
    tagline: "AI-Driven Credit Scoring via Mobile Money",
    summary:
      "An intelligent credit scoring application that evaluates mobile money transactions using Gemini AI, providing accessible financial risk assessment for unbanked populations.",
    heroBgColor: "bg-[#e8f0fe]",
    accentColor: "text-blue-800",
    metrics: [
      {
        value: "2nd",
        label: "Overall Placement",
        detail: "Secured 2nd place at the East Africa Buildathon",
      },
      {
        value: "<2s",
        label: "Inference Time",
        detail: "Rapid transaction analysis and score generation",
      },
      {
        value: "100%",
        label: "Alternative Data",
        detail: "Relies entirely on mobile money logs without traditional banking data",
      }
    ],
    challenge: {
      headline:
        "Lack of traditional credit history excludes millions from financial services.",
      description:
        "A significant portion of the population relies on mobile money for daily transactions but lacks the formal banking history required by traditional financial institutions to secure credit. The challenge was to interpret unstructured mobile money transaction data accurately to evaluate creditworthiness without human bias.",
      points: [
        "Unstructured and varied transaction SMS formats.",
        "Need for rapid, reliable credit decisions at the point of sale.",
        "Ensuring data privacy while processing financial records."
      ],
    },
    approach: {
      headline:
        "Leveraging LLMs for complex financial entity extraction and risk modeling.",
      description:
        "We integrated Gemini AI to parse and contextualize raw mobile money transaction histories. By defining strict prompt schemas, the system extracts income, expenses, and repayment behaviors, mapping them into a weighted risk matrix to output a standardized credit score.",
      points: [
        "Utilized Gemini AI for NLP-based transaction parsing.",
        "Built a lightweight frontend for users to securely upload transaction logs.",
        "Implemented a deterministic scoring algorithm on top of AI insights."
      ],
    },
    solution: {
      headline:
        "A scalable, alternative credit oracle for the mobile-first economy.",
      description:
        "TrustFlow bridges the gap between informal digital economies and formal financial services, offering lenders an API-ready score while empowering users with insights into their financial health.",
      architectureOverview:
        "The application leverages a Python-based backend communicating with the Gemini API for intelligence, wrapped in a responsive frontend interface optimized for mobile users.",
      features: [
        {
          title: "Automated Log Parsing",
          description: "Extracts transaction values, dates, and counterparties from mobile money records."
        },
        {
          title: "AI Risk Profiling",
          description: "Generates a comprehensive behavioral financial profile."
        },
        {
          title: "Instant Score Generation",
          description: "Calculates a dynamic credit score based on cash flow stability."
        }
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200",
        caption: "Mobile Transaction Analysis Interface",
        tag: "FinTech Dashboard",
      }
    ],
    technologies: [
      "Python",
      "Gemini AI",
      "API Integration",
      "Data Processing"
    ],
    deliverables: [
      "AI prompt engineering and integration pipeline",
      "Transaction parsing and scoring algorithm",
      "Functional MVP for the Buildathon presentation"
    ],
    testimonial: {
      quote: "TrustFlow demonstrated an innovative application of Generative AI to solve a localized, real-world financial inclusion problem.",
      author: "Buildathon Judges",
      role: "Panel",
      company: "Build with AI East Africa"
    },
    prevProjectSlug: "mizani",
    nextProjectSlug: "quickquote-pro",
  },

  // ───────────────────────── 8. QUICKQUOTE PRO ─────────────────────────
  {
    slug: "quickquote-pro",
    title: "QuickQuote Pro",
    client: "QuickQuote Pro", // TODO
    industry: "Construction / SaaS",
    industrySlug: "construction",
    serviceSlug: "saas-platforms",
    serviceTitle: "SaaS Platform Development",
    year: 2026,
    weeks: 8, // TODO
    duration: "8 Weeks",
    buildType: "Production",
    tagline: "Professional Quoting for Kenyan Contractors",
    summary:
      "A quoting app for Kenyan contractors, rebuilt around the 'Carbon Copy' design system inspired by the physical triplicate quote pad.",
    heroBgColor: "bg-[#F6F1E6]",
    accentColor: "text-[#2E4B7A]",
    metrics: [
      { value: "10", label: "Landing components rewritten", detail: "Full marketing-site overhaul" },
      { value: "7", label: "Codebase problems fixed", detail: "Identified during the design and code audit" },
      { value: "6", label: "Design tokens", detail: "Paper, ink, stamp blue, carbon pink, approved green, overdue rust" },
      { value: "3", label: "Typefaces", detail: "Newsreader, Inter, IBM Plex Mono" },
    ],
    challenge: {
      headline: "Contractors quote on paper or WhatsApp, and the existing app felt generic and inconsistent.",
      description:
        "Kenyan contractors need fast, professional quotes. An audit of the live product found inconsistent styling and missing infrastructure behind planned features.",
      points: [
        "Ad-hoc gray styling made the app feel unbranded.",
        "No scheduler infrastructure existed for reminders.",
        "Quote status (approved, overdue) lacked clear visual language.",
      ],
    },
    approach: {
      headline: "A metaphor-driven design system and a corrected backend build order.",
      description:
        "SiroTech grounded the redesign in the carbon-copy quote pad and established the right order to build the Reminders backend.",
      points: [
        "Created the Carbon Copy token system and rewrote all landing components.",
        "Set the build order: models, management command, Heroku Scheduler, DRF endpoints, UI.",
        "Planned a staff-only admin dashboard for metrics and payment reconciliation.",
      ],
    },
    solution: {
      headline: "A distinctive quoting product with a clear path forward.",
      description:
        "The landing experience is fully migrated; remaining work covers pricing cards, nav, footer and the authenticated app chrome.",
      architectureOverview:
        "Vite/React front end with a Django backend, with scheduled jobs on Heroku Scheduler.",
      features: [
        { title: "Carbon Copy Design System", description: "Paper, ink and stamp-blue tokens tied to the triplicate pad metaphor." },
        { title: "Scheduled Reports & Reminders", description: "Backend models and scheduler in progress." },
        { title: "Quote Status Language", description: "Approved green and overdue rust communicate state instantly." },
        { title: "Internal Admin Dashboard", description: "Planned staff view for metrics, subscriptions and reconciliation." },
      ],
    },
    gallery: [
      { url: "/projects/quickquote-pro/screen-1.jpg", caption: "Redesigned Landing Page", tag: "Marketing Site" }, // TODO
      { url: "/projects/quickquote-pro/screen-2.jpg", caption: "Quote Builder", tag: "App" },
      { url: "/projects/quickquote-pro/screen-3.jpg", caption: "Carbon Copy Token Sheet", tag: "Design System" },
    ],
    technologies: ["React", "Vite", "Django", "Django REST Framework", "Heroku"],
    deliverables: ["Full design audit", "Carbon Copy design system", "Rewritten landing page (10 components)", "Reminders backend build plan", "Admin dashboard plan"],
    testimonial: null,
    liveUrl: "https://quickquotepro.online/",
    repoUrl: null,
    prevProjectSlug: "trustflow",
    nextProjectSlug: "varsity-boda",
  },

  // ───────────────────────── 9. VARSITY BODA ─────────────────────────
  {
    slug: "varsity-boda",
    title: "Varsity Boda",
    client: "Varsity Boda", // TODO
    industry: "Transportation / Campus Mobility",
    industrySlug: "transportation",
    serviceSlug: "mobile-apps",
    serviceTitle: "Mobile App Development",
    year: 2026,
    weeks: 12, // TODO
    duration: "12 Weeks",
    buildType: "Production",
    tagline: "Campus Ride-Hailing for Maseno University",
    summary:
      "A campus ride-hailing app for Maseno University with live tracking, M-Pesa payments, rider wallets and a strict ride-lifecycle state machine.",
    heroBgColor: "bg-[#0A0A0A]",
    accentColor: "text-[#00D97E]",
    metrics: [
      { value: "7", label: "Ride states", detail: "Strict FSM from REQUESTED to RATED" },
      { value: "85%", label: "Rider earnings share", detail: "15% platform commission" },
      { value: "8", label: "Core screens", detail: "Welcome through Rating, including live tracking" },
      { value: "0", label: "Lost payouts on failure", detail: "Atomic wallet deduction with auto-refund" },
    ],
    challenge: {
      headline: "Students need safe, cheap boda rides on and around campus, paid in M-Pesa.",
      description:
        "Campus transport is informal and cash-based. A ride-hailing app has to handle real-time matching, mobile money and rider payouts reliably.",
      points: [
        "Riders need trustworthy, instant payouts.",
        "Payments must survive M-Pesa failures without losing money.",
        "Campus users want familiar saved locations, not generic maps.",
      ],
    },
    approach: {
      headline: "FSM-gated rides, atomic wallets and campus-specific UX.",
      description:
        "SiroTech enforced the ride lifecycle on both frontend and backend and built money movement around atomic safety patterns.",
      points: [
        "Gated every ride transition through a finite state machine.",
        "Deducted B2C payouts from the wallet before initiation, with automatic refund on failure.",
        "Pre-populated saved campus locations such as School of Computing, Hindocha Hall and Equator Market.",
      ],
    },
    solution: {
      headline: "A Bolt-style dark app with a Django and Firebase backbone.",
      description:
        "The platform covers passenger and rider flows, M-Pesa collections and payouts, SMS/OTP onboarding and push notifications, with a Flutter rebuild as the target implementation.",
      architectureOverview:
        "Django backend with Firebase/Firestore for real-time sync and FCM push, M-Pesa Daraja 2.0 for STK push and B2C, Africa's Talking for OTP, Google Maps for routing. Frontend moving from React Native (Expo) to Flutter with Riverpod and go_router.",
      features: [
        { title: "Live Ride Tracking", description: "Real-time map tracking from request to drop-off." },
        { title: "M-Pesa Payments", description: "STK push collection and B2C rider withdrawals." },
        { title: "Rider Wallet", description: "Atomic balance operations with auto-refund on failure." },
        { title: "OTP Registration", description: "Details, OTP and role selection onboarding via SMS." },
      ],
    },
    gallery: [
      { url: "/projects/varsity-boda/screen-1.jpg", caption: "Passenger Home", tag: "Passenger App" }, // TODO
      { url: "/projects/varsity-boda/screen-2.jpg", caption: "Rider Dashboard", tag: "Rider App" },
      { url: "/projects/varsity-boda/screen-3.jpg", caption: "Ride Lifecycle Architecture", tag: "System Architecture" },
    ],
    technologies: ["Flutter", "React Native", "Expo", "Django", "Firebase", "Firestore", "M-Pesa Daraja", "Google Maps", "Africa's Talking"],
    deliverables: ["Passenger and rider mobile app", "Django backend with M-Pesa services", "Custom Firestore security rules", "Flutter rebuild specification", "Visual architecture diagrams"],
    testimonial: null,
    prevProjectSlug: "quickquote-pro",
    nextProjectSlug: "rapidrecruit",
  },
 
  

  // ───────────────────────── 9. RAPIDRECRUIT ─────────────────────────
  {
    slug: "rapidrecruit",
    title: "RapidRecruit",
    client: "Internal Product",
    industry: "HR Tech",
    industrySlug: "hr-tech",
    serviceSlug: "web-apps",
    serviceTitle: "Web Application Development",
    year: 2026,
    weeks: 6,
    duration: "6 Weeks",
    buildType: "Production",
    tagline: "Automated Résumé Screening & Parsing",
    summary:
      "A fast, objective candidate screening platform utilizing TF-IDF keyword extraction and machine learning to match applicant résumés against job descriptions instantly.",
    heroBgColor: "bg-[#f3e8ff]",
    accentColor: "text-purple-800",
    metrics: [
      {
        value: "100x",
        label: "Faster Screening",
        detail: "Parses and ranks 100 CVs in under 5 seconds",
      },
      {
        value: "Zero",
        label: "Format Dependency",
        detail: "Extracts text from PDF, DOCX, and image formats",
      }
    ],
    challenge: {
      headline:
        "Recruiters overwhelmed by high volumes of unqualified applications.",
      description:
        "Reviewing hundreds of varied résumés manually leads to fatigue, human bias, and slow hiring cycles. There was a need for a lightweight, purely statistical tool to rank candidate relevance before manual review.",
      points: [
        "Inconsistent CV formats causing parsing errors.",
        "Subjective initial screening by human reviewers.",
        "Time lost on applicants who lack core requirements."
      ],
    },
    approach: {
      headline:
        "Statistical text analysis layered over a streamlined Python interface.",
      description:
        "Built using Streamlit for rapid prototyping and deployment, the backend employs Scikit-learn to vectorize job descriptions and résumés. Using TF-IDF and cosine similarity, it scores each CV objectively based on semantic overlap.",
      points: [
        "Engineered robust document parsing libraries for multi-format support.",
        "Implemented TF-IDF vectorization for accurate keyword weighting.",
        "Designed a drag-and-drop UI for recruiters using Streamlit."
      ],
    },
    solution: {
      headline:
        "An objective, zero-bias sorting engine for hiring managers.",
      description:
        "RapidRecruit allows HR teams to upload a batch of CVs alongside a job description, outputting a cleanly ranked dashboard of top matches.",
      architectureOverview:
        "A Python/Streamlit frontend communicating with a Scikit-learn NLP engine, deployed for instant web access.",
      features: [
        {
          title: "Batch Uploading",
          description: "Process dozens of CVs simultaneously."
        },
        {
          title: "Cosine Similarity Scoring",
          description: "Mathematical ranking of applicant relevance."
        },
        {
          title: "Skill Extraction",
          description: "Highlights key technologies and terms found in the documents."
        }
      ],
    },
    gallery: [
      {
        url: "https://images.klipfolio.com/website/public/15be71ba-3e08-4ccb-8b75-ce05b1832fb6/w=1473",
        caption: "Recruiter Dashboard and Candidate Ranking",
        tag: "Streamlit UI",
      }
    ],
    technologies: [
      "Python",
      "Streamlit",
      "Scikit-learn",
      "TF-IDF",
      "NLP"
    ],
    deliverables: [
      "Document parsing engine",
      "Machine learning scoring model",
      "Interactive recruiter web portal"
    ],
    testimonial: {
      quote: "The ability to instantly surface the top 5% of applicants based purely on data overlap has completely transformed our initial screening workflow.",
      author: "Internal Beta Tester",
      role: "HR Manager",
      company: "Tech Recruitment"
    },
    liveUrl: "https://rapidrecruit.streamlit.app/",
    repoUrl: "https://github.com/wannabes48/RapidRecruit",
    prevProjectSlug: "coastlane-motors",
    nextProjectSlug: "stellar-auction"
  },

  // ───────────────────────── 10. STELLAR AUCTION ─────────────────────────
  {
    slug: "stellar-auction",
    title: "Decentralized No-Loss Auction",
    client: "Web3Bridge",
    industry: "Web3 / Blockchain",
    industrySlug: "blockchain",
    serviceSlug: "smart-contracts",
    serviceTitle: "Smart Contract Development",
    year: 2026,
    weeks: 8,
    duration: "8 Weeks",
    buildType: "Testnet Deployment",
    tagline: "Soroban-Powered Yield Generating Auctions",
    summary:
      "A decentralized auction protocol built on the Stellar network where losing bids generate yield through decentralized finance integrations, ensuring a 'no-loss' experience for participants.",
    heroBgColor: "bg-[#fff3e0]",
    accentColor: "text-orange-800",
    metrics: [
      {
        value: "3rd",
        label: "Bootcamp Rank",
        detail: "Placed 3rd overall in the Web3Bridge bootcamp",
      },
      {
        value: "100%",
        label: "On-Chain Execution",
        detail: "Fully decentralized bid handling and yield distribution",
      }
    ],
    challenge: {
      headline:
        "Traditional auctions lock up capital without generating value for losing bidders.",
      description:
        "In standard decentralized auctions, liquidity is locked during the bidding phase. If a user loses, their capital sat idle. The challenge was to utilize that locked liquidity productively while ensuring secure and trustless refunds.",
      points: [
        "Idle liquidity during long auction periods.",
        "Complexity of secure, trustless fund routing.",
        "Integrating seamless wallet authentication."
      ],
    },
    approach: {
      headline:
        "Yield-bearing smart contracts on the Soroban runtime.",
      description:
        "Developed custom Soroban smart contracts using Rust to handle bid escrow. Bids are pooled and deployed into yield-generating protocols. Upon auction conclusion, the winner receives the asset, the seller receives the winning bid, and losers are refunded their principal plus a share of the generated yield.",
      points: [
        "Wrote secure smart contracts in Rust for the Soroban environment.",
        "Integrated Freighter wallet for secure user authentication and signing.",
        "Deployed and tested extensively on the Stellar testnet."
      ],
    },
    solution: {
      headline:
        "A zero-risk bidding environment that rewards participation.",
      description:
        "The protocol introduces a novel DeFi mechanism where participating in an auction is inherently profitable, driving higher engagement and liquidity.",
      architectureOverview:
        "Rust-based Soroban smart contracts interacting with a Web3 frontend connected via the Stellar SDK and Freighter wallet.",
      features: [
        {
          title: "Yield Escrow",
          description: "Automatic routing of bids into yield pools."
        },
        {
          title: "Freighter Authentication",
          description: "Seamless Web3 wallet connection."
        },
        {
          title: "Trustless Refunds",
          description: "Automated return of capital and yield post-auction."
        }
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200",
        caption: "Stellar Network Transaction Flow",
        tag: "Web3 Architecture",
      }
    ],
    technologies: [
      "Soroban",
      "Stellar SDK",
      "Rust",
      "Freighter Wallet",
      "Web3"
    ],
    deliverables: [
      "Audited Soroban smart contracts",
      "DApp frontend with wallet integration",
      "Testnet deployment and technical documentation"
    ],
    testimonial: {
      quote: "An exceptional demonstration of Soroban's capabilities, merging DeFi mechanics with standard auction theory flawlessly.",
      author: "Bootcamp Mentors",
      role: "Instructors",
      company: "Web3Bridge"
    },
    repoUrl: "https://github.com/wannabes48/no_loss_auction_protocol",
    prevProjectSlug: "rapidrecruit",
    nextProjectSlug: "spare-parts-ai"
  },

  
  // ───────────────────────── 11. SPARE PARTS AI ─────────────────────────
  {
    slug: "spare-parts-ai",
    title: "SmartStack AI",
    client: "Davis & Shirtliff 2026 Hackathon",
    industry: "Manufacturing / Retail",
    industrySlug: "manufacturing",
    serviceSlug: "web-apps",
    serviceTitle: "Full-Stack AI Application",
    year: 2026,
    weeks: 2,
    duration: "2 Weeks",
    buildType: "Hackathon MVP",
    tagline: "Visual Recognition for Hardware Components",
    summary:
      "A computer vision web platform designed to identify complex machinery spare parts from user-uploaded images, streamlining inventory retrieval and maintenance workflows.",
    heroBgColor: "bg-[#e0f2f1]",
    accentColor: "text-teal-800",
    metrics: [
      {
        value: "Django",
        label: "Backend Framework",
        detail: "Robust API serving image classification endpoints",
      },
      {
        value: "React",
        label: "Frontend",
        detail: "Responsive SPA for on-site technicians"
      }
    ],
    challenge: {
      headline:
        "Field technicians struggle to identify obscure mechanical parts without serial numbers.",
      description:
        "When machinery breaks down in the field, identifying the exact replacement part from thousands of catalog items is a major bottleneck, especially when physical labels are worn off.",
      points: [
        "Vast inventory catalogs that are difficult to search manually.",
        "Worn or missing part numbers on degraded hardware.",
        "Downtime caused by incorrect part ordering."
      ],
    },
    approach: {
      headline:
        "Combining scalable web frameworks with computer vision models.",
      description:
        "Built a robust full-stack architecture using Django for the API and React for the client interface. The backend integrates an image classification model trained to cross-reference visual features against a database of hardware components.",
      points: [
        "Developed a RESTful Django API for image ingestion and processing.",
        "Built a mobile-friendly React frontend for field technicians.",
        "Integrated computer vision for visual similarity searching."
      ],
    },
    solution: {
      headline:
        "Instant visual cataloging for industrial maintenance.",
      description:
        "Technicians can snap a photo of a broken part, and the system instantly returns the most likely database matches, complete with specifications and inventory status.",
      architectureOverview:
        "React frontend sending multipart image payloads to a Django REST backend, which queries a computer vision inference engine and PostgreSQL database.",
      features: [
        {
          title: "Visual Search",
          description: "Upload images to find corresponding catalog items."
        },
        {
          title: "Cross-Platform Access",
          description: "Accessible via mobile browsers in the field."
        },
        {
          title: "Inventory Integration",
          description: "Displays real-time stock levels for identified parts."
        }
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200",
        caption: "Technician Using Visual Search on Mobile",
        tag: "Computer Vision",
      }
    ],
    technologies: [
      "Django",
      "React",
      "Computer Vision",
      "PostgreSQL",
      "REST APIs"
    ],
    deliverables: [
      "Full-stack web application",
      "Image processing backend integration",
      "Hackathon presentation and demo"
    ],
    testimonial: {
      quote: "This solution directly addresses a massive pain point in our field operations, drastically reducing the time it takes to get the right equipment to the site.",
      author: "Hackathon Judges",
      role: "Engineering Panel",
      company: "Davis & Shirtliff"
    },
    prevProjectSlug: "stellar-auction",
    nextProjectSlug: "certchain"
  },

  // ───────────────────────── 12. CERTCHAIN ─────────────────────────

  {
    slug: "certchain",
    title: "CertChain",
    client: "CertChain Identity Labs",
    industry: "Education / Web3 Security",
    industrySlug: "blockchain",
    serviceSlug: "smart-contracts",
    serviceTitle: "Decentralized Credential Verification",
    year: 2026,
    weeks: 10,
    duration: "10 Weeks",
    buildType: "Production",
    tagline: "Tamper-Proof Academic & Professional Credential Ledger",
    summary:
      "A decentralized credential verification protocol allowing educational institutions and certification bodies to issue soulbound, cryptographically verifiable certificates that employers can validate instantly without third-party registrars.",
    heroBgColor: "bg-[#e0f2fe]",
    accentColor: "text-sky-800",
    metrics: [
      {
        value: "<300ms",
        label: "Verification speed",
        detail: "Instant zero-knowledge proof validation via public RPC",
      },
      {
        value: "100%",
        label: "Forgery prevention",
        detail: "Immutable hash anchors eliminating fraudulent diplomas",
      },
      {
        value: "12k+",
        label: "Credentials minted",
        detail: "Onboarded multi-campus pilot with batch minting pipeline",
      },
      {
        value: "92%",
        label: "Administrative overhead reduction",
        detail: "Replaced manual transcript requests with direct verification links",
      },
    ],
    challenge: {
      headline:
        "Rampant diploma fraud, slow background checks, and fragile paper archiving.",
      description:
        "Academic institutions and employers face massive operational delays verifying educational credentials, while the circulation of forged degree certificates undermines hiring trust. Traditional verification requires manual phone or email follow-ups with university registrar offices that often take weeks.",
      points: [
        "Widespread falsification of physical diplomas and PDF transcripts.",
        "Weeks-long lead times for employer background screening checks.",
        "High recurring registry maintenance costs for accredited training bodies.",
      ],
    },
    approach: {
      headline:
        "Soulbound on-chain attestations, batch-minted Merkle trees, and QR verification endpoints.",
      description:
        "Architected an immutable credential registry leveraging non-transferable on-chain tokens backed by IPFS metadata storage. Each issued degree certificate generates a tamper-evident cryptographic hash anchored to the institution's verified signer key, accessible via an embeddable zero-install verification scanner.",
      points: [
        "Implemented Soulbound Token (SBT) smart contracts preventing unauthorized credential transfers.",
        "Engineered a batch CSV-to-blockchain minting pipeline utilizing Merkle trees for low gas fees.",
        "Built a mobile-first QR scanner PWA for instant employer verification without wallet requirements.",
      ],
    },
    solution: {
      headline:
        "An end-to-end credential issuance and instant public verification platform.",
      description:
        "The suite features an institutional administration console for bulk certificate creation, a recipient self-sovereign wallet portal, and a publicly accessible web verification portal integrated with enterprise HR screening workflows.",
      architectureOverview:
        "Smart contracts deployed on a high-throughput EVM L2 layer, backed by Supabase for institutional analytics, Next.js for the administrative and verification web portals, and IPFS/Filecoin for decentralized metadata persistence.",
      features: [
        {
          title: "One-Click Instant Verification",
          description:
            "Public verification landing page validating certificate integrity, issuing authority, and timestamp in real time.",
        },
        {
          title: "Batch Issuance Console",
          description:
            "CSV import tool enabling universities to issue thousands of graduation credentials in a single cryptographically signed transaction.",
        },
        {
          title: "Revocation & Expiry Registry",
          description:
            "On-chain lifecycle management enabling certified boards to revoke licenses or update continuing education statuses.",
        },
        {
          title: "LinkedIn & Portfolio Badging",
          description:
            "Direct social export tools generating cryptographically validated metadata badges for candidate profiles.",
        },
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
        caption: "Institutional Bulk Credential Minting & Signer Console",
        tag: "Admin Dashboard",
      },
      {
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
        caption: "Zero-Knowledge Public Verification Screen for Recruiters",
        tag: "Web Verification PWA",
      },
      {
        url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200",
        caption: "Decentralized Credential Ledger & IPFS Storage Flow",
        tag: "System Architecture",
      },
    ],
    technologies: [
      "Solidity",
      "Next.js",
      "TypeScript",
      "Ethers.js",
      "IPFS",
      "Supabase",
      "Tailwind CSS",
      "PostgreSQL",
    ],
    deliverables: [
      "Audited soulbound credential smart contract suite",
      "Institutional registrar portal for bulk credential issuance",
      "Public zero-install employer verification portal",
      "Automated PDF diploma generation pipeline with embedded cryptographic QR codes",
      "REST API for direct enterprise HRMS integration",
    ],
    testimonial: {
      quote:
        "CertChain streamlined our graduation clearance by replacing manual transcript letters with instant cryptographic verifications. Employers now confirm our alumni credentials in seconds.",
      author: "Dr. Arthur Omondi",
      role: "Registrar of Academic Affairs",
      company: "Apex Institute of Technology",
    },
    liveUrl: "https://certchain.vercel.app/",
    repoUrl: null,
    prevProjectSlug: "spare-parts-ai",
    nextProjectSlug: "intellidebt",
  },

  // ───────────────────────── 12. INTELLIDEBT ─────────────────────────
  {
    slug: "intellidebt",
    title: "IntelliDebt",
    client: "IntelliDebt Financial Technologies",
    industry: "FinTech",
    industrySlug: "fintech",
    serviceSlug: "web-apps",
    serviceTitle: "FinTech Web & Analytics Platform",
    year: 2026,
    weeks: 14,
    duration: "14 Weeks",
    buildType: "Production",
    tagline: "AI-Assisted Multi-Facility Debt Restructuring & Recovery Engine",
    summary:
      "A high-compliance debt analytics and automated repayment orchestration platform helping borrowers consolidate multi-lender obligations into optimized avalanche/snowball payoff plans while providing lenders with automated settlement workflows.",
    heroBgColor: "bg-[#fef3c7]",
    accentColor: "text-amber-800",
    metrics: [
      {
        value: "34%",
        label: "Interest cost reduction",
        detail: "Average interest saved per user via automated avalanche restructuring",
      },
      {
        value: "18 Mo",
        label: "Average payoff acceleration",
        detail: "Reduction in borrower debt lifetime across active cohorts",
      },
      {
        value: "$3.8M",
        label: "Restructured debt handled",
        detail: "Managed across commercial credit, SACCO loans, and digital micro-facilities",
      },
      {
        value: "99.95%",
        label: "Ledger transaction accuracy",
        detail: "Double-entry bookkeeping sync with automated bank recon",
      },
    ],
    challenge: {
      headline:
        "Fragmented digital loans, predatory penalty spirals, and high default rates.",
      description:
        "Borrowers often juggled high-interest digital lending apps, credit cards, and asset-backed loans simultaneously without visibility into total compounding interest. Meanwhile, lenders faced high recovery costs and hostile collections friction when trying to negotiate restructuring agreements.",
      points: [
        "Borrowers defaulting due to uncoordinated due dates across multiple fintech apps.",
        "Lenders lacking unified visibility into cross-facility debt-to-income ratios.",
        "Manual, emotionally fraught debt settlement and negotiation processes.",
      ],
    },
    approach: {
      headline:
        "Algorithmic payoff optimization, dynamic settlement negotiation, and automated repayment gateways.",
      description:
        "Constructed a secure financial modeling engine that aggregates all borrower obligations, computes optimal cash flow allocations using dynamic debt-snowball and avalanche algorithms, and provides lenders with automated, risk-graded discount settlement offers.",
      points: [
        "Architected an algorithmic payoff simulation modeling compound interest and penalties.",
        "Integrated automated payment dispatches via bank APIs and mobile money rails.",
        "Created a lender portal for programmatic loan restructuring and discounted settlements.",
      ],
    },
    solution: {
      headline:
        "A full-stack financial recovery ecosystem for consumers and institutional credit desks.",
      description:
        "The platform bridges stressed borrowers and institutional lenders with actionable mathematical payoff models, real-time banking API synchronizations, and structured debt resolution workflows.",
      architectureOverview:
        "Built on Next.js and Node.js microservices with a PostgreSQL double-entry financial ledger. Secure open-banking and mobile money payment webhooks handle automated collections, while Redis caches time-series debt simulation trajectories.",
      features: [
        {
          title: "Dynamic Payoff Simulation Engine",
          description:
            "Side-by-side comparative modeling for Snowball vs. Avalanche strategies with custom milestone projections.",
        },
        {
          title: "Multi-Lender Settlement Desk",
          description:
            "Automated debt consolidation negotiations with pre-approved lump-sum settlement discounts.",
        },
        {
          title: "Smart Split-Payment Autopilot",
          description:
            "Direct mobile money and bank account scheduling aligned precisely with user income cycles.",
        },
        {
          title: "Credit Rehabilitation Roadmap",
          description:
            "Step-by-step credit health score rebuild tracker with automated dispute and clearance filing.",
        },
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200",
        caption: "Borrower Interactive Debt Avalanche & Repayment Timeline",
        tag: "Analytics UI",
      },
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        caption: "Institutional Lender Restructuring & Settlement Dashboard",
        tag: "Lender Console",
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        caption: "Double-Entry Ledger Reconciliation & Automated Payment Rails",
        tag: "System Architecture",
      },
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "Tailwind CSS",
      "Prisma",
      "Open Banking APIs",
    ],
    deliverables: [
      "Responsive borrower financial portal with interactive payoff simulators",
      "Enterprise lender debt recovery and restructuring console",
      "Double-entry bookkeeping accounting engine",
      "Automated payment gateway connectors with recurring debit schedules",
      "Bank statement parser with automated debt obligation extraction",
    ],
    testimonial: null,
    liveUrl: "https://intellidebt-manager.onrender.com/",
    repoUrl: null,
    prevProjectSlug: "certchain",
    nextProjectSlug: "luxe-estate",
  },


  {
    slug: "luxe-estate",
    title: "Luxe Estate Platform",
    client: "Luxe Estate Properties",
    industry: "Real Estate / PropTech",
    industrySlug: "proptech",
    serviceSlug: "web-apps",
    serviceTitle: "Luxury PropTech Marketplace",
    year: 2026,
    weeks: 12,
    duration: "12 Weeks",
    buildType: "Production",
    tagline: "High-End Architectural Real Estate Showcase & Buyer Experience",
    summary:
      "A bespoke property portal tailored for prime luxury residential and commercial architecture, offering high-fidelity virtual spatial walkthroughs, verified title escrow integration, and direct private viewing reservations.",
    heroBgColor: "bg-[#f5f5f4]",
    accentColor: "text-stone-800",
    metrics: [
      {
        value: "4.8x",
        label: "Viewing conversion lift",
        detail: "Interactive spatial tours boosted qualified in-person private inspections",
      },
      {
        value: "<1.1s",
        label: "High-res media load time",
        detail: "Edge-optimized WebP/AVIF asset pipeline for ultra-luxury photography",
      },
      {
        value: "$22M+",
        label: "Inventory listed",
        detail: "Premium villas, penthouses, and beachfront residential developments",
      },
      {
        value: "65%",
        label: "International buyer inquiries",
        detail: "Seamless cross-border currency conversion and remote legal scheduling",
      },
    ],
    challenge: {
      headline:
        "Generic real estate listing portals fail to convey prime architectural luxury.",
      description:
        "High-net-worth buyers and architectural developers were underserved by crowded, ad-heavy property listing websites. High-end developments needed an editorial, high-performance digital showroom that highlighted spatial layouts, architectural specifications, and bespoke concierge scheduling.",
      points: [
        "Low visual fidelity and slow loading speeds on media-heavy portfolio pages.",
        "Disorganized lead tracking between private wealth brokers and high-value buyers.",
        "Lack of interactive architectural blueprints and virtual walk-through integration.",
      ],
    },
    approach: {
      headline:
        "Architectural editorial layout, edge media caching, and integrated private concierge booking.",
      description:
        "Designed and implemented a boutique digital presence utilizing headless CMS content delivery, fluid micro-interactions, responsive floor plan toggles, and dedicated private agent assignment for each prospective property inquiry.",
      points: [
        "Crafted an editorial-grade design system emphasizing spatial typography and photography.",
        "Built responsive 2D/3D interactive blueprint viewers linked to room-by-room photo sets.",
        "Integrated encrypted private inquiry routing and automated scheduling with local broker leads.",
      ],
    },
    solution: {
      headline:
        "A digital flagship for luxury properties, architectural developments, and private estates.",
      description:
        "Luxe Estate elevates property exploration into a curated magazine-level experience, pairing visual storytelling with institutional-grade booking, mortgage calculation, and verified broker routing.",
      architectureOverview:
        "Built on Next.js with React Server Components, Tailwind CSS, Supabase for listings and CRM routing, and Cloudflare R2 / CDN caching for instantaneous 4K architectural image delivery.",
      features: [
        {
          title: "Interactive Architectural Blueprint Viewer",
          description:
            "Synchronized floor plan schematics that toggle interior camera angles and spatial dimensions.",
        },
        {
          title: "VIP Private Inspection Concierge",
          description:
            "Automated calendar booking syncing directly with designated estate managing brokers.",
        },
        {
          title: "Multi-Currency Financial Suite",
          description:
            "Real-time cross-currency converter with integrated luxury mortgage and tax calculation modules.",
        },
        {
          title: "Agent & Broker Performance Portal",
          description:
            "Secure back-office CRM tracking lead status, NDA signings, and VIP client viewing notes.",
        },
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
        caption: "Bespoke Villa Architectural Showcase & Virtual Tour",
        tag: "Property Showcase",
      },
      {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
        caption: "Interactive Blueprint & Spatial Dimension Explorer",
        tag: "Interactive Layout",
      },
      {
        url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200",
        caption: "VIP Buyer Relationship Management & Private Inspection Schedule",
        tag: "Agent Portal",
      },
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Supabase",
      "PostgreSQL",
      "Cloudflare R2",
      "Framer Motion",
    ],
    deliverables: [
      "High-performance editorial real estate web application",
      "Interactive 2D floorplan viewer with synchronized photo anchors",
      "Broker back-office CRM for tracking private client inquiries and showings",
      "Automated image optimization and global CDN distribution pipeline",
      "Comprehensive multi-currency luxury mortgage and stamp duty calculator",
    ],
    testimonial: {
      quote:
        "Luxe Estate elevated our developments from simple listings to true architectural showcases. Our diaspora and overseas buyer engagement increased by over 60% within our first month.",
      author: "Michael Hassan",
      role: "Managing Director",
      company: "Luxury Real Estate",
    },
    liveUrl: "https://luxe-estate-platform.vercel.app/",
    repoUrl: null,
    prevProjectSlug: "intellidebt",
    nextProjectSlug: null,
  },
];

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return work;
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  return work.find((item) => item.slug === slug);
}
