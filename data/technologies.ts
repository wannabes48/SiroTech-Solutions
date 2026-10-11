export interface TechItem {
  name: string;
  whyWeUseIt: string;
  badge?: string;
}

export interface TechCategory {
  id: string;
  title: string;
  description: string;
  tools: TechItem[];
}

export const technologiesData: TechCategory[] = [
  {
    id: "frontend",
    title: "Frontend & UI Architecture",
    description: "Modern, type-safe, and server-rendered user interfaces optimized for sub-second Core Web Vitals.",
    tools: [
      { name: "Next.js", whyWeUseIt: "Server-side rendering, App Router streaming, and instant edge deployments." },
      { name: "React", whyWeUseIt: "Declarative component ecosystem with high performance and massive community support." },
      { name: "TypeScript", whyWeUseIt: "Eliminates entire classes of runtime errors through compile-time type safety." },
      { name: "Tailwind CSS v4", whyWeUseIt: "Zero-runtime CSS engine ensuring ultra-light bundles and fluid design tokens." },
      { name: "Framer Motion", whyWeUseIt: "60fps hardware-accelerated micro-interactions and layout transitions." },
      { name: "Radix UI", whyWeUseIt: "Unstyled, fully accessible (WAI-ARIA) atomic primitives with keyboard support." },
    ],
  },
  {
    id: "backend",
    title: "Backend & Systems Engineering",
    description: "High-throughput APIs, idempotent transactional processing, and resilient relational database models.",
    tools: [
      { name: "Node.js", whyWeUseIt: "Asynchronous non-blocking I/O ideal for real-time APIs and high event throughput." },
      { name: "Python / FastAPI", whyWeUseIt: "Lightning-fast Python framework used for high-performance AI and data processing." },
      { name: "PostgreSQL", whyWeUseIt: "The gold standard ACID-compliant relational database with rock-solid consistency." },
      { name: "Prisma ORM", whyWeUseIt: "Type-safe database querying, automated migrations, and schema validation." },
      { name: "Redis", whyWeUseIt: "Sub-millisecond in-memory caching, rate-limiting, and distributed session storage." },
      { name: "Supabase", whyWeUseIt: "Postgres-native backend with instant real-time row-level security (RLS)." },
    ],
  },
  {
    id: "mobile",
    title: "Cross-Platform Mobile Engineering",
    description: "Universal native applications for iOS and Android with unified business logic and offline capabilities.",
    tools: [
      { name: "React Native", whyWeUseIt: "Native compilation to iOS and Android components with 60fps responsiveness." },
      { name: "Expo", whyWeUseIt: "Enterprise native toolchain for instant OTA updates and App Store deployments." },
      { name: "SQLite", whyWeUseIt: "Local, secure device database for resilient offline-first data persistence." },
      { name: "OneSignal", whyWeUseIt: "Reliable push notification delivery with segmentation and analytics." },
    ],
  },
  {
    id: "data-ai",
    title: "Data Intelligence & AI Workflows",
    description: "Domain-specific AI integrations, retrieval-augmented generation (RAG), and document extraction.",
    tools: [
      { name: "Google Gemini API", whyWeUseIt: "Ultra-fast, cost-effective multimodal LLMs with massive context windows." },
      { name: "LangChain", whyWeUseIt: "Framework for chaining prompts, memory buffers, and structured outputs." },
      { name: "pgvector", whyWeUseIt: "Enables vector similarity search directly inside our existing PostgreSQL database." },
      { name: "Pandas & NumPy", whyWeUseIt: "High-speed numerical processing and tabular data cleaning." },
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud Infrastructure & DevOps",
    description: "Containerized, auto-scaling hosting environments backed by automated testing and 99.99% uptime.",
    tools: [
      { name: "AWS", whyWeUseIt: "Global cloud infrastructure with enterprise compliance, S3 storage, and RDS." },
      { name: "Docker", whyWeUseIt: "Hermetic containerization ensuring parity across local dev, staging, and production." },
      { name: "Terraform", whyWeUseIt: "Declarative Infrastructure as Code (IaC) enabling reproducible environments." },
      { name: "Cloudflare", whyWeUseIt: "Global edge CDN, DDoS mitigation, web application firewall (WAF), and SSL." },
      { name: "GitHub Actions", whyWeUseIt: "Automated continuous integration and deployment with branch protection." },
    ],
  },
  {
    id: "testing",
    title: "QA, Testing & Security Auditing",
    description: "Automated regression testing, OWASP vulnerability scanning, and API load testing.",
    tools: [
      { name: "Playwright", whyWeUseIt: "Reliable, headless end-to-end browser testing across Chromium, Firefox, and WebKit." },
      { name: "Jest", whyWeUseIt: "Fast unit and snapshot testing for business logic and data transformers." },
      { name: "k6 Load Testing", whyWeUseIt: "Developer-centric load testing simulating thousands of concurrent API requests." },
      { name: "OWASP ZAP", whyWeUseIt: "Automated security scanner identifying SQLi, XSS, and broken access controls." },
    ],
  },
];
