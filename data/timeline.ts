export interface TimelineMilestone {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  achievements: string[];
}

export const studioTimeline: TimelineMilestone[] = [
  {
    year: "2020",
    title: "Founding the Studio in Nairobi",
    subtitle: "Applying architectural rigor to software engineering",
    description: "SiroTech was established in Nairobi as an independent engineering practice, rejecting bloated agency models in favor of lean, senior-led product teams delivering bespoke web systems.",
    achievements: [
      "Shipped first 5 production client portals",
      "Established core TypeScript & PostgreSQL standards",
    ],
  },
  {
    year: "2022",
    title: "FinTech & Real-Time Sync Expansion",
    subtitle: "High-concurrency payment routing across East Africa",
    description: "Expanded our backend capabilities into automated Safaricom Daraja M-Pesa B2B/C2B payment engines, offline-first field synchronization, and PCI-compliant architectures.",
    achievements: [
      "Over 500,000 monthly transactions processed across client apps",
      "99.98% uptime SLA recorded across all managed services",
    ],
  },
  {
    year: "2024",
    title: "Cross-Border Delivery & Global Reach",
    subtitle: "Serving growing startups in Kenya, East Africa, and the rest of the world",
    description: "Partnered with founders across North America who demanded engineering precision, time-zone adaptability, and cost-effective product execution without sacrificing senior expertise.",
    achievements: [
      "Launched 12 enterprise web and mobile applications",
      "Adopted Next.js App Router, Supabase, and Tailwind v4 architecture",
    ],
  },
  {
    year: "2026",
    title: "AI Workflows & Productised Platforms",
    subtitle: "Bespoke automation, LLM pipelines, and modern client portal",
    description: "Pioneering intelligent automation, Gemini API integrations, and productised ERP/CRM frameworks that accelerate client time-to-market by 60%.",
    achievements: [
      "Over 24 production systems actively deployed",
      "Launch of SiroTech Client Portal & automated ticketing back-office",
    ],
  },
];
