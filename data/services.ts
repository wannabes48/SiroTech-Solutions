export interface Service {
  slug: string;
  title: string;
  category: "build" | "cloud" | "design" | "support";
  summary: string;
  intro: string;
  overview: string;
  deliverables: string[];
  process: { step: string; detail: string }[];
  technologies: string[];
  relatedCaseStudySlug?: string;
  faqs: { q: string; a: string }[];
  seoTitle?: string;
  seoDesc?: string;
}

export const services: Service[] = [
  {
    slug: "custom-software",
    title: "Custom Software Engineering",
    category: "build",
    summary: "Bespoke digital systems and automated operational tools engineered for high-concurrency workflows.",
    intro: "Eliminate operational bottlenecks with software tailored specifically to your company's proprietary workflows.",
    overview:
      "Off-the-shelf software inevitably forces your business into someone else's workflow constraints. At SiroTech, our custom software engineering practice translates your unique organizational processes into resilient, bespoke digital infrastructure. We architect database schemas, design fault-tolerant microservices, and build high-performance internal portals that give your team an unfair operational advantage. Every line of code is structured for maintainability, audited against OWASP security benchmarks, and handed over with complete intellectual property ownership.",
    deliverables: [
      "Custom multi-tenant web portals & dashboards",
      "Role-based access control (RBAC) & audit logging",
      "Automated operational data pipelines & workflows",
      "Custom REST / GraphQL API endpoints with OpenAPI specs",
      "Complete source code repository & deployment documentation",
    ],
    process: [
      { step: "01. Architecture & Blueprint", detail: "Domain modeling, ERD schema design, and technical constraint mapping." },
      { step: "02. Core Backend Engineering", detail: "Database schema migration, secure authentication, and API endpoints." },
      { step: "03. Frontend & Portal Build", detail: "Intuitive Next.js interfaces with sub-second page transitions." },
      { step: "04. UAT & Deployment", detail: "End-to-end user testing, staging signoff, and zero-downtime release." },
    ],
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Docker"],
    relatedCaseStudySlug: "foresafe",
    faqs: [
      { q: "How long does a typical custom software project take?", a: "Standard MVP scopes deliver in 4 to 8 weeks, while large enterprise systems run across 8 to 12 weeks with weekly sprint deployments." },
      { q: "Who owns the intellectual property and code?", a: "You own 100% of all repositories, databases, and assets unconditionally upon milestone settlement." },
      { q: "Can custom software integrate with our existing legacy tools?", a: "Yes. We build custom API connectors to synchronize with legacy ERPs, local banks, CRM databases, or accounting systems." },
      { q: "What happens after launch?", a: "We provide a 30-day bug warranty alongside optional monthly retainer care plans for continuous improvements." },
    ],
    seoTitle: "Custom Software Development Studio Nairobi | SiroTech Solutions",
    seoDesc: "Bespoke custom software engineering in Kenya, the US, and Canada. High-load resilience, full IP ownership, and zero legacy lock-in.",
  },
  {
    slug: "web-application-development",
    title: "Web Application Development",
    category: "build",
    summary: "Fast, accessible web platforms that hold up under real load with sub-second responsiveness.",
    intro: "Modern web platforms built with Next.js, React, and robust APIs designed to convert visitors and scale seamlessly.",
    overview:
      "Modern web applications must balance instant load speeds, fluid client-side interactivity, strict SEO discoverability, and rock-solid reliability under fluctuating network conditions. We engineer web applications leveraging Next.js App Router, edge caching, and scalable PostgreSQL backends. Whether you are launching a complex multi-vendor marketplace, a SaaS product, or a corporate customer dashboard, our applications are optimized for Core Web Vitals and engineered to withstand peak-hour traffic spikes across African and global markets.",
    deliverables: [
      "Full-stack Next.js web application with App Router",
      "Responsive, mobile-first interfaces adhering to WCAG 2.1 AA",
      "Server-side rendering (SSR) & Edge API caching",
      "Automated transactional email & SMS triggers",
      "Comprehensive analytics & conversion event telemetry",
    ],
    process: [
      { step: "01. Discovery & Wireframing", detail: "User personas, information architecture, and core screen wireframes." },
      { step: "02. UI/UX Design in Figma", detail: "Design token specification, interactive prototyping, and design signoff." },
      { step: "03. Full-Stack Development", detail: "Component development, database modeling, and state management." },
      { step: "04. Performance Tuning & Launch", detail: "Lighthouse 95+ optimization, security hardening, and DNS cutover." },
    ],
    technologies: ["Next.js", "React", "Tailwind CSS", "TypeScript", "Supabase", "Vercel"],
    relatedCaseStudySlug: "rapidrecruit",
    faqs: [
      { q: "Why do you use Next.js for web applications?", a: "Next.js offers optimal SEO indexing, instant server rendering, automatic image optimization, and edge hosting on Vercel." },
      { q: "How do you guarantee performance on slow mobile networks?", a: "We bundle-split code, serve optimized webp/avif images, minimize runtime JS, and implement resilient client-side caching." },
      { q: "Do your web apps support user authentication?", a: "Yes, we integrate secure authentication including email magic links, Google OAuth, and two-factor authentication." },
      { q: "Can we migrate our existing WordPress site to a Next.js web app?", a: "Absolutely. We specialize in migrating slow WordPress or legacy PHP sites into fast, modern Next.js architectures." },
    ],
    seoTitle: "Web Application Development in Kenya & North America | SiroTech",
    seoDesc: "Fast, accessible Next.js web applications engineered for scale. Built in Nairobi, serving Kenya, US, and Canada.",
  },
  {
    slug: "mobile-apps",
    title: "Mobile App Development",
    category: "build",
    summary: "Cross-platform iOS and Android apps with React Native and Expo delivering 60fps native performance.",
    intro: "Deliver native-grade mobile experiences to iOS and Android users from a unified, maintainable codebase.",
    overview:
      "Building separate native apps for iOS and Android doubles development expenses, delays time-to-market, and introduces feature discrepancies. We build high-performance mobile applications utilizing React Native and Expo. Our apps provide genuine 60fps animations, native camera/biometric access, push notification routing, and robust offline-first synchronization engineered specifically for varying connectivity environments across Africa and overseas.",
    deliverables: [
      "Universal iOS & Android mobile application codebase",
      "Offline-first data sync with SQLite or WatermelonDB",
      "Push notification integration (OneSignal / Firebase FCM)",
      "Biometric authentication (FaceID & Fingerprint)",
      "App Store & Google Play submission and approval support",
    ],
    process: [
      { step: "01. Mobile UX Flows", detail: "Mobile-first ergonomic screen layouts and touch gesture planning." },
      { step: "02. Core Native Integration", detail: "Hardware permissions, device camera, storage, and push notifications." },
      { step: "03. Offline Engine Build", detail: "Local caching and background sync reconciliation queues." },
      { step: "04. App Store Deployment", detail: "TestFlight beta testing, store asset generation, and review approval." },
    ],
    technologies: ["React Native", "Expo", "TypeScript", "SQLite", "Firebase", "App Store Connect"],
    relatedCaseStudySlug: "foresafe",
    faqs: [
      { q: "Can React Native apps match native iOS and Android performance?", a: "Yes. With the modern React Native Architecture, Hermes engine, and native compilation, performance is indistinguishable from Swift or Kotlin." },
      { q: "How does offline-first mode work for mobile users?", a: "Users can complete actions offline; all changes are queued in local SQLite storage and automatically synchronized when connectivity restores." },
      { q: "Do you handle the App Store and Google Play approval process?", a: "Yes. We manage certificates, provisioning profiles, store listing metadata, privacy declarations, and review submissions." },
      { q: "How are app updates pushed after launch?", a: "With Expo OTA (Over-The-Air) updates, bug fixes and UI updates can be deployed directly to users without waiting for App Store review." },
    ],
    seoTitle: "Cross-Platform Mobile App Development | SiroTech Solutions",
    seoDesc: "iOS and Android apps engineered with React Native and Expo. Fast offline sync, push notifications, and App Store approval.",
  },
  {
    slug: "website-design-and-development",
    title: "Website Design and Development",
    category: "design",
    summary: "High-converting corporate websites combining bespoke UI design with lightning-fast engineering.",
    intro: "Establish undeniable market authority with a corporate website designed to convert qualified inbound leads.",
    overview:
      "Your website is the front door of your enterprise. Outdated templates and sluggish page builders erode client trust. SiroTech designs and develops bespoke corporate websites that combine architectural aesthetic discipline with modern JAMstack performance. We focus on clean typography, persuasive messaging hierarchies, interactive calculators, and seamless lead capture forms that immediately position your company at the top of your market.",
    deliverables: [
      "Custom responsive design system & component library",
      "Headless CMS integration (Sanity / Strapi / MDX)",
      "Full on-page SEO optimization & JSON-LD schema tags",
      "Interactive lead capture forms with instant WhatsApp/Email alerts",
      "Global CDN deployment with 99.99% uptime guarantee",
    ],
    process: [
      { step: "01. Brand & Messaging Strategy", detail: "Positioning review, competitor analysis, and value proposition framing." },
      { step: "02. Custom Figma Design", detail: "Desktop and mobile mockups with bespoke iconography and layout." },
      { step: "03. Next.js Static Generation", detail: "Clean, zero-bloat code generation with Tailwind CSS styling." },
      { step: "04. Indexing & Launch", detail: "Google Search Console registration, sitemap generation, and live release." },
    ],
    technologies: ["Next.js", "Tailwind CSS", "Figma", "MDX", "Cloudflare", "Vercel"],
    relatedCaseStudySlug: "rapidrecruit",
    faqs: [
      { q: "How easily can our team update website text and blogs?", a: "We integrate a user-friendly CMS where non-technical staff can edit copy, publish blog posts, and upload case studies effortlessly." },
      { q: "Is on-page SEO included in the build?", a: "Yes. OpenGraph tags, semantic HTML, mobile speed optimization, and schema markup are standard in every delivery." },
      { q: "Do you use WordPress or page builders?", a: "No. We build custom Next.js static sites that load 5x faster, have zero security vulnerabilities, and never break from plugin updates." },
      { q: "Can we connect our CRM to the website?", a: "Yes, we integrate with HubSpot, Zoho, Google Sheets, or custom webhook endpoints to route inquiries directly to your team." },
    ],
    seoTitle: "Bespoke Corporate Website Design & Development | SiroTech",
    seoDesc: "High-converting corporate websites built with Next.js and Tailwind. Zero plugin bloat, maximum speed and lead capture.",
  },
  {
    slug: "e-commerce",
    title: "E-Commerce Platforms",
    category: "build",
    summary: "Transactional storefronts and custom checkout flows with integrated M-Pesa STK and international cards.",
    intro: "Sell physical goods or digital services with frictionless checkout, inventory tracking, and multi-currency payments.",
    overview:
      "Standard e-commerce platforms struggle with African payment realities like M-Pesa STK push timeouts or international currency conversion. We architect custom e-commerce engines and headless commerce stores that streamline transactions. From multi-currency pricing (KES, USD, CAD) to automated stock reconciliation, customer order accounts, and receipt generation, we build transactional architectures that maximize conversion rates.",
    deliverables: [
      "Custom storefront with instant search & filter indexing",
      "M-Pesa Express STK push + Stripe international credit cards",
      "Real-time inventory management & order dispatch notifications",
      "Customer portal with order tracking & downloadable PDF invoices",
      "Admin sales dashboard with revenue reporting & e-TIMS tax support",
    ],
    process: [
      { step: "01. Catalog & Checkout Modeling", detail: "Product hierarchy, shipping rules, and payment gateway selection." },
      { step: "02. Storefront UX Build", detail: "Frictionless cart, instant search, and mobile-optimized checkout." },
      { step: "03. Payment & Webhook Integration", detail: "Safaricom Daraja API and Stripe webhook reconciliation." },
      { step: "04. Production Audit", detail: "Transaction stress testing, fraud prevention, and live checkout testing." },
    ],
    technologies: ["Next.js", "PostgreSQL", "M-Pesa Daraja", "Stripe", "Prisma", "Redis"],
    relatedCaseStudySlug: "foresafe",
    faqs: [
      { q: "How does the M-Pesa STK push integration work?", a: "When the customer enters their phone number at checkout, an instant prompt appears on their phone requesting their M-Pesa PIN, confirming the order in seconds." },
      { q: "Can we accept payments from customers in the US and Canada?", a: "Yes. We integrate Stripe so international buyers can pay securely via Visa, Mastercard, or Apple Pay." },
      { q: "How are inventory levels updated?", a: "Inventory is updated atomically on successful payment callbacks, preventing double-selling during flash sales." },
      { q: "Is customer data safe during checkout?", a: "Yes. Payment card data is processed directly via PCI-DSS compliant providers, ensuring no sensitive financial data touches your servers." },
    ],
    seoTitle: "E-Commerce Development with M-Pesa & Stripe | SiroTech",
    seoDesc: "Custom e-commerce platforms with automated M-Pesa STK push and Stripe cards. Built for Kenya and global trade.",
  },
  {
    slug: "ai-automation",
    title: "AI & Intelligent Automation",
    category: "cloud",
    summary: "Embed domain-specific AI, Gemini NLP pipelines, and document intelligence directly into operations.",
    intro: "Automate repetitive manual operations and extract deep business insights using generative AI and custom pipelines.",
    overview:
      "Artificial intelligence is only valuable when tied to concrete operational workflows. SiroTech engineers domain-specific AI integrations using Google Gemini API, LangChain, vector embeddings, and retrieval-augmented generation (RAG). We help companies automate unstructured document processing, build intelligent customer support co-pilots, and deploy predictive scoring algorithms that reduce operating costs and accelerate team productivity.",
    deliverables: [
      "Custom RAG pipelines connected to company knowledge bases",
      "Automated document parsing & entity extraction (PDFs, invoices)",
      "Intelligent conversational assistants & WhatsApp customer bots",
      "Vector database indexing with pgvector or Pinecone",
      "Fine-tuned prompting frameworks with latency & cost safeguards",
    ],
    process: [
      { step: "01. AI Feasibility & ROI Audit", detail: "Identify highest-value operational workflows for automation." },
      { step: "02. Data Cleansing & Embeddings", detail: "Document tokenization, chunking, and vector database ingestion." },
      { step: "03. Pipeline & Guardrail Setup", detail: "Prompt engineering, hallucination suppression, and API integration." },
      { step: "04. Production Deployment", detail: "Cost tracking, latency monitoring, and human-in-the-loop review." },
    ],
    technologies: ["Gemini API", "Python", "pgvector", "LangChain", "Next.js", "FastAPI"],
    relatedCaseStudySlug: "rapidrecruit",
    faqs: [
      { q: "How do you prevent the AI from generating inaccurate answers (hallucinations)?", a: "We use strict Retrieval-Augmented Generation (RAG) that restricts the AI to citing verified company documents, returning explicit fallbacks when data is absent." },
      { q: "Is our proprietary company data used to train public models?", a: "No. Enterprise API agreements with providers like Google Gemini guarantee that your data is never used for model training." },
      { q: "Can AI connect to WhatsApp for automated customer inquiries?", a: "Yes, we integrate intelligent AI agents directly into the official WhatsApp Business Cloud API." },
      { q: "What are the ongoing operational costs for AI APIs?", a: "Modern models like Gemini Flash are exceptionally cost-effective, typically costing fractions of a cent per conversation." },
    ],
    seoTitle: "AI & Automation Engineering Studio | SiroTech Solutions",
    seoDesc: "Custom AI pipelines, document intelligence, and Gemini integrations for businesses across Kenya and North America.",
  },
  {
    slug: "cloud-devops",
    title: "Cloud Architecture & DevOps",
    category: "cloud",
    summary: "Scalable cloud hosting, zero-downtime CI/CD pipelines, and high-availability database replication.",
    intro: "Modernize your infrastructure with containerized, auto-scaling cloud architectures that ensure 99.99% uptime.",
    overview:
      "Downtime, failed production deployments, and uncontrolled cloud bills slow growing companies down. SiroTech architects cloud infrastructure across AWS, Cloudflare, and Docker ecosystems. We configure automated CI/CD testing pipelines, multi-region database failovers, container orchestration, and real-time observability telemetry, allowing your engineering teams to deploy multiple times a day with complete confidence.",
    deliverables: [
      "Infrastructure as Code (IaC) with Terraform / Docker",
      "Automated GitHub Actions CI/CD pipelines with test gates",
      "High-availability PostgreSQL replication & automated backups",
      "Cloudflare CDN caching, DDoS protection, and WAF setup",
      "Centralized logging, error alerting, and uptime monitoring",
    ],
    process: [
      { step: "01. Infrastructure Audit", detail: "Review current hosting topology, security gaps, and cloud spend." },
      { step: "02. Architecture Design", detail: "Design containerized, auto-scaling topology with isolated environments." },
      { step: "03. CI/CD & Security Setup", detail: "Automate build, lint, and deployment pipelines with secret management." },
      { step: "04. Cutover & Monitoring", detail: "Execute zero-downtime DNS cutover and configure uptime alarms." },
    ],
    technologies: ["AWS", "Docker", "Terraform", "GitHub Actions", "Cloudflare", "PostgreSQL"],
    relatedCaseStudySlug: "foresafe",
    faqs: [
      { q: "How do automated CI/CD pipelines benefit our team?", a: "Every code change is automatically tested, formatted, and deployed without manual server SSH access, eliminating human error." },
      { q: "Can you help optimize our high AWS or cloud hosting bills?", a: "Yes. We frequently reduce client cloud infrastructure costs by 30% to 50% through right-sizing resources, serverless models, and edge caching." },
      { q: "How do you handle disaster recovery and backups?", a: "We configure automated daily encrypted snapshots stored in separate cloud availability zones with verified point-in-time recovery." },
      { q: "Do we maintain full ownership of our cloud accounts?", a: "Always. All cloud infrastructure is provisioned directly inside accounts registered in your company's name." },
    ],
    seoTitle: "Cloud Architecture & DevOps Engineering | SiroTech",
    seoDesc: "Automated CI/CD pipelines, containerized AWS infrastructure, and high-availability cloud architecture in Nairobi.",
  },
  {
    slug: "api-development-and-integration",
    title: "API Development & Integration",
    category: "build",
    summary: "Robust REST & GraphQL APIs connecting disparate third-party services, banking, and ERP systems.",
    intro: "Bridge fragmented systems with clean, documented, and secure APIs built for high throughput.",
    overview:
      "Modern businesses rely on dozens of software tools that often refuse to communicate with one another. SiroTech designs, builds, and documents enterprise-grade APIs that connect banking engines, CRMs, logistics trackers, and mobile frontends. We focus on idempotent transaction handling, strict JWT authentication, rate limiting, and comprehensive OpenAPI documentation that makes partner onboarding seamless.",
    deliverables: [
      "Custom REST / GraphQL API architecture with TypeScript",
      "Safaricom M-Pesa, Stripe, and banking gateway integrations",
      "Interactive Swagger / OpenAPI documentation",
      "Webhook delivery infrastructure with automatic retries",
      "JWT and API Key authentication with fine-grained rate limits",
    ],
    process: [
      { step: "01. Contract Specification", detail: "Define API schemas, endpoints, response codes, and error payloads." },
      { step: "02. Core Endpoint Build", detail: "Implement controllers, business logic, and transactional database locks." },
      { step: "03. Security & Rate Limiting", detail: "Configure token verification, CORS policies, and rate throttles." },
      { step: "04. Documentation & SDK", detail: "Publish interactive OpenAPI sandbox and integration test suites." },
    ],
    technologies: ["Node.js", "Express", "Next.js", "TypeScript", "Postman", "OpenAPI"],
    relatedCaseStudySlug: "foresafe",
    faqs: [
      { q: "What is an idempotent API?", a: "Idempotency ensures that if a network failure causes an API request (such as a payment) to be retried multiple times, the transaction is processed only once." },
      { q: "Do you provide API documentation for third-party developers?", a: "Yes, we ship interactive OpenAPI / Swagger documentation where developers can inspect schemas and test endpoints directly." },
      { q: "Can you connect our custom portal to our accounting software?", a: "Yes, we build bi-directional sync pipelines for QuickBooks, Xero, SAP, or proprietary internal ledgers." },
      { q: "How do you protect APIs from abuse and DDoS?", a: "We enforce IP rate limits, API key quotas, Cloudflare WAF protection, and payload size limitations." },
    ],
    seoTitle: "API Engineering & Systems Integration | SiroTech Solutions",
    seoDesc: "Secure REST and GraphQL API engineering. M-Pesa, payment gateways, and enterprise integrations built in Nairobi.",
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design & Prototyping",
    category: "design",
    summary: "User-tested wireframes, accessible design systems, and clickable high-fidelity Figma prototypes.",
    intro: "Turn complex, confusing software ideas into elegant, intuitive digital interfaces your users love.",
    overview:
      "A software system is only as good as its usability. Cluttered interfaces result in customer drop-off and expensive support tickets. Our UI/UX design studio combines deep behavioral research with aesthetic discipline. We design clean, accessible interfaces that guide users smoothly toward their objectives. Every design is built directly in Figma using production-aligned design tokens that translate effortlessly into code.",
    deliverables: [
      "User research findings, journey maps, and empathy diagrams",
      "Comprehensive wireframes and information architecture",
      "High-fidelity clickable Figma prototype",
      "Reusable design system tokens (colors, typography, radii, components)",
      "Developer handoff documentation with responsive guidelines",
    ],
    process: [
      { step: "01. User Research", detail: "Conduct stakeholder interviews, competitor audits, and user personas." },
      { step: "02. Wireframes & UX Flows", detail: "Low-fidelity wireframing to validate user journeys before visual styling." },
      { step: "03. Visual System Design", detail: "Apply Truvista design tokens, typography scales, and visual hierarchy." },
      { step: "04. Interactive Prototype", detail: "Build clickable Figma prototype for user testing and engineering handoff." },
    ],
    technologies: ["Figma", "Design Systems", "Prototyping", "User Testing", "WCAG 2.1 AA"],
    relatedCaseStudySlug: "rapidrecruit",
    faqs: [
      { q: "Do we get to test the design before code is written?", a: "Yes, you receive a clickable interactive Figma prototype that behaves like a real app to validate user flows before coding begins." },
      { q: "Are your designs accessible for users with disabilities?", a: "All our designs meet WCAG 2.1 Level AA standards for color contrast, readable font scales, and accessible click targets." },
      { q: "Can your design team work with our in-house developers?", a: "Yes. We deliver organized Figma component libraries with exact design token variables and CSS specifications for your engineers." },
      { q: "How many design revisions are included?", a: "We work iteratively in weekly feedback loops with collaborative milestones until you sign off on the design." },
    ],
    seoTitle: "UI/UX Product Design & Figma Prototyping | SiroTech",
    seoDesc: "Clean, accessible product design systems and Figma prototypes. Designed for startups in Africa and North America.",
  },
  {
    slug: "qa-and-security-testing",
    title: "QA & Security Auditing",
    category: "support",
    summary: "Automated end-to-end testing, OWASP security audits, and penetration testing for mission-critical code.",
    intro: "Identify bugs, security vulnerabilities, and performance bottlenecks before your customers do.",
    overview:
      "Deploying untested code to production leads to data breaches, reputational damage, and lost revenue. SiroTech conducts rigorous Quality Assurance (QA) and security testing across web and mobile applications. We implement automated Playwright test suites, perform vulnerability scans, verify role permissions, and test API stress limits to guarantee that your software withstands real-world threats and heavy user loads.",
    deliverables: [
      "Automated end-to-end (E2E) test suites with Playwright / Cypress",
      "OWASP Top 10 web vulnerability audit report",
      "Database injection & authorization bypass security testing",
      "API load & stress testing reports with concurrency metrics",
      "Remediation roadmap with step-by-step code fixes",
    ],
    process: [
      { step: "01. Threat Modeling", detail: "Analyze application architecture, trust boundaries, and attack vectors." },
      { step: "02. Automated Test Setup", detail: "Script automated browser journeys for critical signup and checkout flows." },
      { step: "03. Penetration & Vulnerability Audit", detail: "Test input sanitization, CSRF protections, and session management." },
      { step: "04. Certification & Report", detail: "Deliver prioritized vulnerability scorecard with verified code patches." },
    ],
    technologies: ["Playwright", "Cypress", "OWASP ZAP", "k6 Load Testing", "Jest"],
    relatedCaseStudySlug: "foresafe",
    faqs: [
      { q: "What does an OWASP security audit cover?", a: "We test against the OWASP Top 10 vulnerabilities including SQL injection, cross-site scripting (XSS), broken access control, and insecure direct object references." },
      { q: "Can automated tests be added to our deployment pipeline?", a: "Yes, we integrate tests into GitHub Actions so that any code introducing a regression is automatically blocked from production." },
      { q: "Do you perform load and stress testing?", a: "Yes. We simulate thousands of concurrent users hitting your APIs to identify database query bottlenecks and server crash points." },
      { q: "How long does a full security and QA audit take?", a: "Most comprehensive application audits are completed within 5 to 10 business days." },
    ],
    seoTitle: "QA & Cybersecurity Testing Services | SiroTech Solutions",
    seoDesc: "Automated Playwright testing, OWASP vulnerability assessments, and API load testing for high-trust software platforms.",
  },
  {
    slug: "maintenance-and-support",
    title: "Maintenance & SLA Support",
    category: "support",
    summary: "Proactive uptime monitoring, security patching, database backups, and dedicated monthly developer retainers.",
    intro: "Keep your software fast, secure, and continuously improved with proactive engineering retainers.",
    overview:
      "Software does not stop evolving once deployed. Framework versions update, dependencies deprecate, third-party APIs change, and security exploits emerge. SiroTech provides continuous maintenance retainers and SLA-backed support. We monitor your servers 24/7, deploy routine security patches, optimize slow database queries, and allocate dedicated developer hours each month for continuous feature enhancements.",
    deliverables: [
      "24/7 automated uptime and server health monitoring",
      "Monthly dependency, framework, and security vulnerability patching",
      "Automated encrypted daily database snapshots & disaster recovery drills",
      "Dedicated developer hours monthly for bug fixes and UI updates",
      "Priority WhatsApp & ticketing SLA response channel",
    ],
    process: [
      { step: "01. Onboarding & Health Audit", detail: "Review codebase, configure monitoring agents, and inspect error logs." },
      { step: "02. Baseline Hardening", detail: "Upgrade deprecated packages and optimize slow database queries." },
      { step: "03. Continuous Monitoring", detail: "Automated telemetry tracking memory, response times, and exceptions." },
      { step: "04. Monthly Retainer Sprint", detail: "Execute requested feature updates, bug fixes, and deliver monthly reports." },
    ],
    technologies: ["Sentry", "Uptime Kuma", "GitHub", "Supabase", "AWS CloudWatch"],
    relatedCaseStudySlug: "foresafe",
    faqs: [
      { q: "What is included in the dedicated monthly developer hours?", a: "You can allocate your hours toward new feature development, design tweaks, third-party integrations, or code refactoring." },
      { q: "What is your emergency incident response SLA?", a: "Our Growth Retainer guarantees an engineer investigating critical downtime within 1 hour." },
      { q: "Can we cancel or upgrade our maintenance plan?", a: "Yes. Retainers are billed monthly with no lock-in contracts; you can modify or pause with 14 days notice." },
      { q: "Do you monitor our systems outside of business hours?", a: "Yes. Automated synthetic monitors check your site every 60 seconds around the clock, alerting on-call engineers instantly if issues arise." },
    ],
    seoTitle: "Software Maintenance & SLA Support Retainers | SiroTech",
    seoDesc: "24/7 uptime monitoring, security patching, and dedicated developer hours. Reliable software support in Nairobi.",
  },
];

export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getService(slug: string): Promise<Service | undefined> {
  return services.find((s) => s.slug === slug);
}
