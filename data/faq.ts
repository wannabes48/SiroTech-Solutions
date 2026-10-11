export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface FaqGroup {
  id: string; // anchor id e.g. "general", "pricing", "process", "technical", "support"
  name: string;
  description: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "general",
    name: "General",
    description: "Fundamental details about our engineering studio, team structure, and who we serve.",
    items: [
      {
        id: "gen-1",
        q: "What kinds of companies does SiroTech Solutions work with?",
        a: "We partner primarily with growth-stage technology ventures, commercial enterprises, financial institutions, and agricultural cooperatives across East Africa, Europe, and North America. Whether you are building a greenfield platform from scratch or scaling an existing system to millions of users, we provide high-caliber senior engineering teams.",
      },
      {
        id: "gen-2",
        q: "Where is SiroTech based, and do you work with international clients outside Kenya?",
        a: "Our core engineering studio is located in Kilimani, Nairobi, Kenya. Over 40% of our active projects are for international clients in the US, UK, and Europe. Our teams are structured to overlap cleanly with US East Coast and European working hours, operating with asynchronous transparency and clear sprint cadences.",
      },
      {
        id: "gen-3",
        q: "How does SiroTech compare to hiring a traditional agency or internal engineering team?",
        a: "Traditional agencies often employ junior developers overseen by non-technical account managers, leading to communication lag and fragile code. Recruiting internal engineers takes months and carries heavy hiring overhead. SiroTech operates as an elite, high-velocity engineering squad: you work directly with practicing principal architects and senior engineers from day one.",
      },
      {
        id: "gen-4",
        q: "Can you take over and refactor an existing legacy codebase, or do you only build from scratch?",
        a: "We frequently step into existing codebases. We begin with a rigorous 1-to-2 week Architectural Audit where we benchmark security vulnerabilities, database bottlenecks, test coverage, and tech debt. From there, we formulate a modular modernization roadmap without halting your live business operations.",
      },
    ],
  },
  {
    id: "pricing",
    name: "Pricing & Payments",
    description: "Transparent billing models, currency options, milestone structures, and contract terms.",
    items: [
      {
        id: "price-1",
        q: "How do your project pricing models and billing structures work?",
        a: "We offer two transparent models: Fixed-Price Milestone Contracts (ideal for well-scoped MVP builds and turnkey solutions where scope is strictly defined) and Monthly Engineering Retainers (ideal for continuous product development, dedicated sprint squads, and evolving platforms). We provide upfront cost breakdowns with zero surprise fees.",
      },
      {
        id: "price-2",
        q: "What payment methods and currencies do you support?",
        a: "We accept payments in KES and USD. For East African transactions, we accept bank wire transfers (RTGS/EFT) and corporate M-Pesa Till/Paybill numbers. For international clients, we invoice via international wire (SWIFT), ACH transfer, or credit cards through Stripe.",
      },
      {
        id: "price-3",
        q: "How do you handle scope changes or feature additions during a project?",
        a: "We embrace agile iteration. If new requirements emerge during development, our lead architect evaluates the impact on timelines and budget. For fixed contracts, we document change requests with clear estimates before proceeding. For retainer squads, new features are simply reprioritized into the upcoming sprint backlog.",
      },
      {
        id: "price-4",
        q: "Do you offer milestone-based payment schedules?",
        a: "Yes. For fixed-scope projects, payments are tied directly to demonstrable milestones (e.g., 20% kickoff & architecture, 30% alpha prototype, 30% staging user acceptance testing, 20% production sign-off and code handover). You verify functioning software before releasing milestone funds.",
      },
    ],
  },
  {
    id: "process",
    name: "Process & Delivery",
    description: "How we move from technical discovery to production deployment and handoff.",
    items: [
      {
        id: "proc-1",
        q: "What does a typical project workflow look like from kickoff to launch?",
        a: "Every project moves through four structured phases: (1) Discovery & Architectural Blueprint (1–2 weeks), (2) Core Sprint Iterations (2-week sprints with staging demos), (3) Security Hardening & UAT (load testing, QA, compliance audits), and (4) Production Go-Live with 30-day hypercare warranty.",
      },
      {
        id: "proc-2",
        q: "How frequently will we communicate and see working software during development?",
        a: "We deploy working builds to preview URLs on every git merge. You receive weekly progress walkthroughs, bi-weekly live sprint demos, and direct Slack/Discord channels with your lead engineers. You never have to wonder what is happening with your code.",
      },
      {
        id: "proc-3",
        q: "Who will be my primary point of contact during the engagement?",
        a: "You will interface directly with a Lead Systems Architect who acts as your Technical Product Manager. Because our leads write code and architect databases daily, discussions are deeply technical, pragmatic, and free of middle-management friction.",
      },
      {
        id: "proc-4",
        q: "What happens on the day of production deployment and handoff?",
        a: "We execute zero-downtime blue/green deployments accompanied by database rollback scripts, DNS cutovers, and real-time observability telemetry. Following go-live, our engineers remain on active monitoring standby for immediate incident triage.",
      },
    ],
  },
  {
    id: "technical",
    name: "Technical & Architecture",
    description: "Engineering frameworks, security certifications, data privacy, and IP ownership.",
    items: [
      {
        id: "tech-1",
        q: "What technology stacks does your engineering studio specialize in?",
        a: "Our core stack comprises TypeScript, Next.js (App Router), React 19, Node.js, Python (FastAPI/Django), and PostgreSQL/Redis for web and cloud backends. For mobile, we build in React Native and Flutter with SQLite. For cloud infrastructure, we leverage AWS (ECS, RDS, S3), Docker, Terraform, and OpenTelemetry.",
      },
      {
        id: "tech-2",
        q: "How do you ensure bank-grade security and data privacy (such as GDPR and Kenya DPA)?",
        a: "We enforce security by design: AES-256 encryption at rest, TLS 1.3 in transit, strict RBAC permissions, encrypted environment variables, automated container vulnerability scans, and OWASP Top 10 compliance audits. We build systems compliant with the Kenya Data Protection Act 2019 and GDPR.",
      },
      {
        id: "tech-3",
        q: "How do you engineer applications for low-bandwidth or offline environments?",
        a: "We architect mobile and web apps with an offline-first paradigm. By embedding local SQLite databases, delta-synchronization engines, and optimistic UI mutations, field workers can log data seamlessly in remote rural areas and synchronize when cellular connectivity returns.",
      },
      {
        id: "tech-4",
        q: "Who owns the intellectual property (IP) and source code upon completion?",
        a: "You do. 100%. Upon payment of milestones, all source code, database schemas, deployment scripts, design assets, and documentation are transferred entirely to your organization with full commercial rights and zero vendor lock-in.",
      },
    ],
  },
  {
    id: "support",
    name: "Support & Maintenance",
    description: "Post-launch hypercare, SLAs, continuous monitoring, and infrastructure management.",
    items: [
      {
        id: "supp-1",
        q: "What kind of post-launch maintenance and support do you provide?",
        a: "Every project includes a 30-day complimentary Hypercare Warranty covering any bug fixes, edge-case remediation, and telemetry calibration. Thereafter, clients transition to our Managed Infrastructure & Support Retainers for 24/7 uptime monitoring, security patches, and OS upgrades.",
      },
      {
        id: "supp-2",
        q: "What are your service level agreements (SLAs) for critical production incidents?",
        a: "For clients on our Production Support retainers, we provide a guaranteed 15-minute response SLA for Severity-1 outages (complete service downtime) and a 1-hour response SLA for Severity-2 issues. Our on-call engineers are equipped with automated PagerDuty escalation policies.",
      },
      {
        id: "supp-3",
        q: "Can SiroTech provide ongoing engineering retainers or staff augmentation?",
        a: "Yes. Many enterprise partners maintain a dedicated squad of 2 to 6 SiroTech engineers on a rolling monthly retainer. This provides elastic velocity for continuous feature releases without the long-term overhead of recruiting full-time headcount.",
      },
      {
        id: "supp-4",
        q: "How do you handle database backups, security patches, and cloud monitoring?",
        a: "We implement automated point-in-time recovery (PITR) backups on PostgreSQL, cross-region replication for critical object storage, automated weekly dependency vulnerability patching, and real-time metric dashboards on Grafana and AWS CloudWatch.",
      },
    ],
  },
];

export function getAllFaqGroups(): FaqGroup[] {
  return FAQ_GROUPS;
}

export function getAllFaqItems(): FaqItem[] {
  return FAQ_GROUPS.flatMap((g) => g.items);
}
