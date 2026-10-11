export interface JobRole {
  slug: string;
  title: string;
  department: string;
  type: string; // "Full-Time", "Contract"
  location: string;
  experience: string;
  salary: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  technologies: string[];
  datePosted: string;
  validThrough: string;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface CulturePillar {
  number: string;
  title: string;
  subtitle: string;
  description: string;
}

export const CULTURE_PILLARS: CulturePillar[] = [
  {
    number: "01",
    title: "Zero-Fluff Engineering",
    subtitle: "Working software over bureaucracy",
    description:
      "We measure success in production uptime, clean modular architectures, and measured telemetry. We don't do endless status meetings, buzzword theater, or vanity deliverables.",
  },
  {
    number: "02",
    title: "High-Ownership Autonomy",
    subtitle: "Engineers interface directly with problems",
    description:
      "You own systems from architecture to deployment. We trust our senior engineers to make pragmatic technology decisions, design database schemas, and talk directly with technical stakeholders.",
  },
  {
    number: "03",
    title: "Continuous Technical Mastery",
    subtitle: "Deep craftsmanship & learning",
    description:
      "We actively encourage deep experimentation with bleeding-edge tools—compilers, distributed databases, vector search, and edge runtimes. We invest in books, labs, and conference attendance.",
  },
];

export const STUDIO_BENEFITS: Benefit[] = [
  {
    icon: "Laptop",
    title: "Top-Tier Workstation",
    description:
      "Choose a brand-new MacBook Pro (M3/M4 Max) or high-performance Linux developer workstation, plus a 4K dual monitor setup.",
  },
  {
    icon: "Compass",
    title: "Flexible Hybrid Model",
    description:
      "Enjoy our vibrant Kilimani studio in Nairobi with barista-grade coffee, or work remotely anywhere within UTC-1 to UTC+4 time zones.",
  },
  {
    icon: "ShieldCheck",
    title: "Comprehensive Healthcare",
    description:
      "Full private medical, dental, and optical insurance for you and your dependents, with zero out-of-pocket hospital co-pays.",
  },
  {
    icon: "BookOpen",
    title: "$1,500 Annual Learning Budget",
    description:
      "Stipends for specialized certifications (AWS, CKA), technical O'Reilly libraries, and international developer conference tickets.",
  },
  {
    icon: "HeartPulse",
    title: "Wellness & Ergonomics",
    description:
      "Monthly gym/sports allowance, Herman Miller ergonomic chairs, standing desks, and mental health consultation stipends.",
  },
  {
    icon: "TrendingUp",
    title: "Quarterly Performance Bonus",
    description:
      "Transparent revenue and delivery milestone profit-sharing bonuses distributed directly to the engineering team.",
  },
];

export const OPEN_ROLES: JobRole[] = [
  {
    slug: "senior-fullstack-engineer",
    title: "Senior Full-Stack Engineer",
    department: "Software Engineering",
    type: "Full-Time",
    location: "Nairobi, Kenya (Hybrid / Remote)",
    experience: "5+ years",
    salary: "KES 350,000 – KES 480,000 / month",
    summary:
      "Lead technical design and implementation for mission-critical client platforms, distributed web backends, and responsive React applications across East Africa and North America.",
    responsibilities: [
      "Architect and build resilient web applications using Next.js 16 (App Router), TypeScript, and Node.js.",
      "Design normalized PostgreSQL and relational database schemas with Prisma/Drizzle ORM and write optimized SQL queries.",
      "Integrate complex third-party APIs including M-Pesa Daraja, Stripe, SMS gateways, and cloud storage providers.",
      "Conduct thorough code reviews, champion automated test suites (Jest, Playwright), and mentor intermediate engineers.",
      "Collaborate with studio product designers to translate Figma design systems into pixel-perfect, accessible UI components.",
    ],
    requirements: [
      "5+ years of production experience in web application engineering with TypeScript, React, and Node.js.",
      "Deep understanding of modern React patterns (Server Components, streaming, suspense, state machines).",
      "Proven track record designing scalable REST and GraphQL APIs with robust error handling and rate limiting.",
      "Proficiency with relational databases (PostgreSQL), indexing strategies, and connection pooling in cloud environments.",
      "Experience deploying containerized applications with Docker, CI/CD pipelines (GitHub Actions), and AWS/Vercel.",
    ],
    niceToHave: [
      "Hands-on experience with mobile engineering (React Native or Flutter).",
      "Prior experience with local Kenyan payment rails (Daraja STK push, C2B, B2C).",
      "Open-source contributions or technical articles.",
    ],
    technologies: [
      "TypeScript",
      "Next.js 16",
      "React 19",
      "Node.js",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
      "Docker",
      "AWS",
    ],
    datePosted: "2026-09-15",
    validThrough: "2026-12-31",
  },
  {
    slug: "mobile-systems-engineer",
    title: "Mobile Systems Engineer (Offline-First)",
    department: "Mobile Engineering",
    type: "Full-Time",
    location: "Nairobi, Kenya (Hybrid / Remote)",
    experience: "4+ years",
    salary: "KES 320,000 – KES 450,000 / month",
    summary:
      "Architect resilient offline-first mobile applications, local SQLite synchronization engines, and field-worker tools for agritech, logistics, and retail enterprises operating in low-bandwidth regions.",
    responsibilities: [
      "Develop cross-platform mobile apps using React Native or Flutter with 60fps fluid UI performance.",
      "Implement robust offline-first synchronization architectures with embedded SQLite/WatermelonDB and conflict resolution logic.",
      "Integrate hardware peripherals (Bluetooth barcode scanners, thermal receipt printers, GPS geo-fencing).",
      "Manage app store deployment pipelines (Google Play Console, Apple App Store, Fastlane).",
      "Optimize memory consumption, battery usage, and network payload caching for low-end Android smartphones.",
    ],
    requirements: [
      "4+ years of dedicated production mobile development experience (React Native or Flutter/Dart).",
      "Strong background in offline-first data synchronization, local database design (SQLite, Realm), and delta replication.",
      "Experience writing native bridge modules in Kotlin/Java (Android) or Swift/Obj-C (iOS) when necessary.",
      "Familiarity with push notification services (FCM), background geolocation tasks, and secure keychain storage.",
      "Solid portfolio of published apps in the Google Play Store or Apple App Store.",
    ],
    niceToHave: [
      "Experience with Bluetooth Low Energy (BLE) peripheral protocols.",
      "Knowledge of Mapbox or OpenStreetMap for customized offline GIS routing.",
    ],
    technologies: [
      "React Native",
      "Flutter",
      "TypeScript",
      "SQLite",
      "WatermelonDB",
      "Kotlin",
      "Swift",
      "Fastlane",
      "FCM",
    ],
    datePosted: "2026-09-20",
    validThrough: "2026-12-31",
  },
  {
    slug: "cloud-devops-engineer",
    title: "Cloud & DevOps Engineer",
    department: "Infrastructure & SRE",
    type: "Full-Time",
    location: "Nairobi, Kenya (Hybrid / Remote)",
    experience: "4+ years",
    salary: "KES 340,000 – KES 460,000 / month",
    summary:
      "Build and automate enterprise cloud infrastructure, high-availability Kubernetes/ECS clusters, automated CI/CD delivery pipelines, and comprehensive telemetry for client production environments.",
    responsibilities: [
      "Provision and manage Infrastructure as Code (IaC) using Terraform / OpenTofu across AWS and regional data centers.",
      "Design zero-downtime blue/green and canary deployment pipelines with GitHub Actions.",
      "Configure centralized telemetry, log aggregation, and real-time incident alerting using Prometheus, Grafana, and OpenTelemetry.",
      "Harden cloud security postures (IAM policies, VPC network peering, WAF rules, automated CVE container scans).",
      "Maintain automated backup routines, disaster recovery playbooks, and database read replica failovers.",
    ],
    requirements: [
      "4+ years of professional cloud engineering / DevOps experience managing production Linux environments on AWS.",
      "Expertise in Infrastructure as Code using Terraform or CloudFormation.",
      "Deep understanding of container orchestration (Docker, AWS ECS / Fargate, or Kubernetes).",
      "Proven experience building secure CI/CD pipelines with GitHub Actions or GitLab CI.",
      "Strong grasp of networking fundamentals: DNS, TLS certificates, load balancing, reverse proxies (Nginx/Traefik).",
    ],
    niceToHave: [
      "AWS Certified Solutions Architect or DevOps Engineer certification.",
      "Experience managing Kafka or RabbitMQ distributed message queues.",
    ],
    technologies: [
      "AWS (ECS, RDS, S3, CloudFront)",
      "Terraform",
      "Docker",
      "Kubernetes",
      "GitHub Actions",
      "Linux",
      "Prometheus",
      "Grafana",
      "Nginx",
    ],
    datePosted: "2026-10-01",
    validThrough: "2026-12-31",
  },
];

export function getOpenRoles(): JobRole[] {
  return OPEN_ROLES;
}

export function getRoleBySlug(slug: string): JobRole | undefined {
  return OPEN_ROLES.find((r) => r.slug.toLowerCase() === slug.toLowerCase());
}

export function getBenefits(): Benefit[] {
  return STUDIO_BENEFITS;
}

export function getCulturePillars(): CulturePillar[] {
  return CULTURE_PILLARS;
}
