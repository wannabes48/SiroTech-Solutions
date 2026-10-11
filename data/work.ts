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
  buildType: "Production" | "Demo" | "Concept";
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
        url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200",
        caption: "Bystander Zero-Download Scanner Interface on Mobile PWA",
        tag: "Mobile Web App",
      },
      {
        url: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1200",
        caption: "Commercial Parking Facility Operator Monitoring Console",
        tag: "Operator Dashboard",
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        caption: "Tokenized Edge Notification Routing Architecture",
        tag: "System Architecture",
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
    prevProjectSlug: "stellar-auction",
    nextProjectSlug: "trustflow",
  },
  {
    slug: "trustflow",
    title: "TrustFlow",
    client: "TrustFlow Financial Labs",
    industry: "FinTech",
    industrySlug: "financial",
    serviceSlug: "ai-automation",
    serviceTitle: "AI & ML Integrations",
    year: 2026,
    weeks: 4,
    duration: "4 Weeks",
    buildType: "Demo",
    tagline: "Alternative Credit Scoring for Mobile Money Economies",
    summary:
      "An AI-powered risk assessment engine that evaluates unbanked borrowers using raw mobile money statement heuristics and LLM narrative extraction, securing 2nd place in the East Africa AI Buildathon.",
    heroBgColor: "bg-[#eaf1fa]",
    accentColor: "text-blue-900",
    metrics: [
      {
        value: "2nd",
        label: "Place EA Buildathon",
        detail: "Selected out of 140+ competing fintech and AI engineering teams",
      },
      {
        value: "<1.8s",
        label: "Credit score latency",
        detail: "Full document parsing and risk vector calculation latency",
      },
      {
        value: "87%",
        label: "Gini predictive accuracy",
        detail: "Outperformed traditional bureau defaults on thin-file MSMEs",
      },
      {
        value: "100%",
        label: "Local data privacy",
        detail: "Zero raw transactional PII passed into external training sets",
      },
    ],
    challenge: {
      headline:
        "Over 60% of East Africa's informal traders lack credit histories despite moving millions on mobile money.",
      description:
        "Traditional credit bureaus rely on legacy commercial bank accounts and tax returns. Consequently, vibrant micro-enterprises and freelancers conducting high-volume commerce across M-Pesa remain categorized as 'thin-file unbankables'. Lenders either reject them or charge exorbitant payday rates. TrustFlow wanted to prove that structured statement vectorization and LLM semantic analysis could generate institutional-grade creditworthiness scores in seconds.",
      points: [
        "M-Pesa PDF statements lack uniform formatting across consumer and business till variants.",
        "Manual credit officer reviews took 48–72 hours per loan application, driving up underwriting costs.",
        "Legacy rule engines failed to detect informal cash flow seasonality or peer lending rings.",
      ],
    },
    approach: {
      headline:
        "Multi-modal document vectorization, tabular transaction extraction, and deterministic risk modeling.",
      description:
        "SiroTech engineered a multi-stage analysis pipeline. When an applicant uploads an encrypted statement PDF, the ingestion engine uses computer vision and PDF stream parsers to normalize transactions into structured ledger entries. Google Gemini models then extract behavioral sentiment, recurring utility bill compliance, supplier purchase frequency, and overdraft habits to calculate a transparent 300–850 TrustFlow score.",
      points: [
        "Constructed custom regex and OCR extractors capable of parsing corrupted or password-protected M-Pesa PDFs.",
        "Implemented an isolated zero-retention data sandbox ensuring applicant financial records are wiped immediately after scoring.",
        "Tuned deterministic scoring heuristics with explainable breakdown cards for credit officers.",
      ],
    },
    solution: {
      headline:
        "Real-time loan origination cockpit with sub-2s scoring and explainable underwriting vectors.",
      description:
        "TrustFlow delivers a frictionless web experience for loan applicants coupled with an enterprise risk desk for microfinance lenders. Credit officers receive a real-time risk dashboard breaking down Debt-to-Turnover ratios, monthly recurring revenue stability, and fraud indicators.",
      architectureOverview:
        "FastAPI / Python analytical backend communicates with a Next.js 16 reactive frontend. Ingestion services parse raw PDFs in-memory without persistent disk writes. Gemini 1.5 Pro performs semantic anomaly detection, while a rule-based credit engine verifies financial thresholds.",
      features: [
        {
          title: "Instant Statement Parsing",
          description:
            "Extracts up to 24 months of mobile money transactions in under 600ms, categorizing inflows, outflows, and merchant fees.",
        },
        {
          title: "Explainable Risk Vectors",
          description:
            "Generates clear factor score cards (e.g., 'Consistent Utility Payments +45 pts', 'High Overdraft Reliance -30 pts') for regulatory audits.",
        },
        {
          title: "Fraud & Tamper Detection",
          description:
            "Analyzes font metrics, digital metadata, and chronological balance reconciliations to catch doctored PDF statements.",
        },
        {
          title: "Underwriter REST API",
          description:
            "Pluggable API integration allowing third-party microfinance loan apps to query credit scores programmatically.",
        },
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
        caption: "Real-Time Underwriting Scoring Cockpit with Factor Breakdown",
        tag: "Risk Cockpit",
      },
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        caption: "Mobile Money Statement Ingestion & Ledger Normalization",
        tag: "Data Ingestion",
      },
      {
        url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
        caption: "Sub-2-Second Deterministic Scoring Pipeline Architecture",
        tag: "Inference Engine",
      },
    ],
    technologies: [
      "Python",
      "FastAPI",
      "Gemini AI API",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "PostgreSQL",
      "Docker",
    ],
    deliverables: [
      "Sub-2-second M-Pesa statement parsing pipeline",
      "AI credit risk evaluation model with explainable audit trails",
      "Credit officer risk dashboard & applicant portal",
      "Secure document sandbox with automated zero-retention cryptographic wiping",
      "SDK & OpenAPI specs for lender core-banking integrations",
    ],
    testimonial: {
      quote:
        "SiroTech's architectural maturity allowed us to deliver a winning AI fintech prototype in under a month. Their understanding of East African mobile money mechanics and enterprise data security is second to none.",
      author: "Kiptoo Korir",
      role: "Co-Founder & Head of Product",
      company: "TrustFlow",
    },
    prevProjectSlug: "foresafe",
    nextProjectSlug: "rapidrecruit",
  },
  {
    slug: "rapidrecruit",
    title: "RapidRecruit",
    client: "RapidRecruit Talent Systems",
    industry: "HR Tech",
    industrySlug: "education",
    serviceSlug: "custom-software",
    serviceTitle: "Custom Software Engineering",
    year: 2026,
    weeks: 8,
    duration: "8 Weeks",
    buildType: "Demo",
    tagline: "Automated CV Parsing & Semantic Candidate Screening",
    summary:
      "An intelligent applicant processing engine utilizing NLP and TF-IDF semantic vectorization to ingest hundreds of job applications and surface top-quartile talent without hiring bias.",
    heroBgColor: "bg-[#eaf5ed]",
    accentColor: "text-emerald-900",
    metrics: [
      {
        value: "80%",
        label: "Time saved screening",
        detail: "Cut initial application triage from 15 minutes to 3 minutes",
      },
      {
        value: "95%",
        label: "Keyword accuracy",
        detail: "Eliminated false negatives from arbitrary keyword-stuffed CVs",
      },
      {
        value: "500+",
        label: "CVs parsed in under 60s",
        detail: "Parallelized multi-threaded worker pipeline handling bulk PDFs",
      },
      {
        value: "0%",
        label: "Demographic bias",
        detail: "Anonymized candidate evaluation mode hiding gender, age, and photos",
      },
    ],
    challenge: {
      headline:
        "Talent acquisition teams overwhelmed by thousands of mismatched applications per job posting.",
      description:
        "In high-supply employment markets across Kenya and remote distributed teams, a single open junior or mid-level engineering role attracts 800+ applications within 48 hours. HR teams relied on rudimentary word-matching tools that unfairly penalized candidates who didn't keyword-stuff their CVs, while letting low-quality submissions slip through. RapidRecruit needed a smart screening tool that evaluated true semantic skill relevance, work tenure, and educational pedigree.",
      points: [
        "Human recruiters spent 75% of their working day manually opening and skimming PDF and DOCX attachments.",
        "Legacy ATS tools missed qualified candidates whose resumes used alternative terminology for required skills.",
        "Unconscious bias in early triage rounds skewed applicant diversity before interviews even began.",
      ],
    },
    approach: {
      headline:
        "Natural language entity extraction, TF-IDF cosine similarity, and blind candidate evaluation.",
      description:
        "SiroTech engineered an automated document classification pipeline. Resumes are parsed into distinct structured facets: Core Competencies, Years of Experience, Project Evidence, and Education. Instead of brittle exact-string matching, we implemented TF-IDF vectorization with domain-specific synonym taxonomies (e.g., mapping 'PostgreSQL', 'relational schemas', and 'SQL' into equivalent relational competence).",
      points: [
        "Constructed resilient parsers handling Word, PDF, LaTeX, and plaintext resume formats.",
        "Built an anonymization pipeline that masks candidate names, addresses, and graduation years during screening.",
        "Delivered a lightweight, lightning-fast recruiter interface with instant filter sliders.",
      ],
    },
    solution: {
      headline:
        "An intelligent talent triage platform with semantic match rankings and side-by-side comparisons.",
      description:
        "The finished platform allows hiring managers to drag-and-drop a folder of 500 resumes alongside a job description. In under a minute, the system outputs ranked candidate leaderboards with visual skill-match radars and automated interview question prompts tailored to each candidate's gaps.",
      architectureOverview:
        "Streamlit and Python core processing engine integrated with custom spaCy and scikit-learn NLP models. Celery worker pools distribute CPU-intensive document rendering across asynchronous nodes.",
      features: [
        {
          title: "Multi-Format Resume Ingestion",
          description:
            "Extracts contact information, work history timelines, and skill lists from complex multi-column PDFs with 99% layout fidelity.",
        },
        {
          title: "Semantic Skill Radar",
          description:
            "Visualizes applicant proficiency against job requirements using cosine distance calculations rather than brittle keywords.",
        },
        {
          title: "Bias-Free Evaluation Mode",
          description:
            "One-click toggle to strip names, photos, gender signifiers, and schools, ensuring merit-based progression to phone interviews.",
        },
        {
          title: "Automated Interview Prompts",
          description:
            "Generates role-specific behavioral questions targeting unexplained gaps or novel projects found in the candidate's history.",
        },
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
        caption: "Candidate Ranking & Blind Review Triage Board",
        tag: "Recruiter Interface",
      },
      {
        url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
        caption: "TF-IDF Semantic Skill Radar & Match Distribution",
        tag: "Skill Vectorization",
      },
    ],
    technologies: [
      "Python",
      "Streamlit",
      "spaCy",
      "scikit-learn",
      "NLP",
      "Pandas",
      "PostgreSQL",
      "Docker",
    ],
    deliverables: [
      "High-throughput resume extraction engine",
      "Semantic similarity matching algorithm with custom tech ontology",
      "Interactive recruiter screening dashboard with instant export",
      "Candidate anonymization and bias-mitigation pipeline",
      "Automated candidate assessment reporting engine",
    ],
    testimonial: {
      quote:
        "RapidRecruit slashed our recruiting cycle from three weeks to four days. We're hiring better talent faster, and our candidate diversity metrics improved substantially in the very first quarter.",
      author: "Wanjiru Kamau",
      role: "Head of People & Operations",
      company: "Apex Talent Partners",
    },
    prevProjectSlug: "trustflow",
    nextProjectSlug: "stellar-auction",
  },
  {
    slug: "stellar-auction",
    title: "Decentralized Auction Protocol",
    client: "Aura Labs / Web3Bridge",
    industry: "Web3 / Decentralized",
    industrySlug: "financial",
    serviceSlug: "custom-software",
    serviceTitle: "Custom Software Engineering",
    year: 2026,
    weeks: 6,
    duration: "6 Weeks",
    buildType: "Demo",
    tagline: "Non-Custodial No-Loss Auction Engine on Soroban",
    summary:
      "A high-security smart contract auction protocol deployed on Stellar Soroban that enables zero-slippage, non-custodial asset bids with automatic yield rewards for losing participants, placing 3rd in the Web3Bridge Cohort.",
    heroBgColor: "bg-[#f3edf8]",
    accentColor: "text-purple-950",
    metrics: [
      {
        value: "3rd",
        label: "Place Web3Bridge Cohort",
        detail: "Awarded top protocol honors among 60+ global decentralized projects",
      },
      {
        value: "0%",
        label: "Loss for non-winners",
        detail: "100% of losing bids automatically returned with accrued liquidity yield",
      },
      {
        value: "0.0001",
        label: "XLM average fee",
        detail: "Near-zero transaction overhead compared to Ethereum mainnet auctions",
      },
      {
        value: "100%",
        label: "Audited contract safety",
        detail: "Zero re-entrancy vulnerabilities with strict Rust contract verification",
      },
    ],
    challenge: {
      headline:
        "Traditional web3 auctions penalize losers with gas fees and locked capital without rewards.",
      description:
        "In standard English auctions on EVM networks, bidders must lock up substantial capital and incur high network fees with zero guarantee of winning. If outbid, their capital sits idle and depreciates until unlocked. Web3Bridge challenged teams to architect a game-theoretically sound 'no-loss' auction mechanism where participant bid capital is pooled into decentralized lending vaults during the auction window, with generated yield distributed to losing bidders as participation incentives.",
      points: [
        "High gas fees on layer-1 networks discourage retail participation in digital asset auctions.",
        "Smart contracts face severe exploit risks including front-running, sandwich attacks, and re-entrancy.",
        "Complex wallet signing friction prevents non-crypto natives from entering decentralized auctions.",
      ],
    },
    approach: {
      headline:
        "WASM-based Soroban smart contracts, Freighter wallet integration, and audited state machines.",
      description:
        "SiroTech engineered the protocol natively on Stellar's new Soroban smart contract environment in Rust. The contract enforces state transitions through an immutable state machine: Bidding -> Settlement -> Yield Distribution -> Asset Transfer. To provide seamless onboarding, we built a sleek React frontend integrating Freighter wallet SDK with instant feedback and transaction preview simulation.",
      points: [
        "Implemented Soroban Rust contracts utilizing deterministic arithmetic and re-entrancy prevention.",
        "Integrated decentralized oracle price feeds to establish asset valuation floors.",
        "Designed a gas-optimized batch settlement routine executing in a single Stellar ledger close.",
      ],
    },
    solution: {
      headline:
        "A trustless, community-friendly auction protocol pairing institutional security with low fees.",
      description:
        "The protocol features a clean, responsive dApp where users connect Freighter or Albedo wallets, browse verified asset auctions, place bids in USDC or XLM, and monitor live timer countdowns. Upon conclusion, contracts atomically route the asset to the highest bidder while instantly releasing funds and reward tokens to all other participants.",
      architectureOverview:
        "Stellar Testnet / Soroban smart contracts written in Rust and compiled to WebAssembly. Frontend built with React, Vite, and Tailwind CSS. Decentralized state indexing powered by Stellar Horizon and Soroban RPC nodes.",
      features: [
        {
          title: "No-Loss Yield Mechanism",
          description:
            "Pooled bid collateral accrues interest during active bidding; yield is distributed pro-rata to non-winning wallets.",
        },
        {
          title: "Atomic Settlement Logic",
          description:
            "Zero counterparty risk: asset title and escrowed funds exchange hands in a single atomic smart contract invocation.",
        },
        {
          title: "Anti-Sniping Countdown",
          description:
            "Bids placed within the final 3 minutes automatically extend the auction clock by 5 minutes, preventing bot sniping.",
        },
        {
          title: "Freighter Wallet Integration",
          description:
            "Frictionless transaction signing with clear human-readable permission prompts and instant testnet faucet links.",
        },
      ],
    },
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200",
        caption: "Soroban Smart Contract State Machine & Batch Settlement",
        tag: "Smart Contracts",
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        caption: "Non-Custodial Bidding dApp with Freighter Wallet Integration",
        tag: "Web3 dApp",
      },
    ],
    technologies: [
      "Rust",
      "Soroban",
      "Stellar SDK",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Freighter",
      "WebAssembly",
    ],
    deliverables: [
      "Production-ready Soroban smart contracts written in Rust",
      "Interactive web3 dApp with wallet authentication",
      "Comprehensive smart contract test suite with 98% branch coverage",
      "Automated deployment and contract migration scripts",
      "Formal protocol architecture documentation and security analysis",
    ],
    testimonial: {
      quote:
        "SiroTech demonstrated extraordinary systems engineering on Soroban. Delivering a complete no-loss auction engine with flawless Rust contracts and an intuitive dApp within six weeks was a standout achievement.",
      author: "Ayodeji Awosika",
      role: "Program Director",
      company: "Web3Bridge",
    },
    prevProjectSlug: "rapidrecruit",
    nextProjectSlug: "foresafe",
  },
];

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return work;
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  return work.find((item) => item.slug === slug);
}
