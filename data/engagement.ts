export interface EngagementModel {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  bestFor: string;
  howBillingWorks: string;
  whatIsIncluded: string[];
  typicalRange: {
    KES: string;
    USD: string;
  };
  ctaText: string;
  ctaHref: string;
  isPopular?: boolean;
}

export const engagementModels: EngagementModel[] = [
  {
    id: "fixed-scope",
    name: "Fixed Scope & Milestone",
    badge: "Most Predictable",
    tagline: "Clear deliverables, locked budget, and zero budget overruns.",
    bestFor: "MVPs, well-defined web applications, e-commerce stores, and projects with clear user specifications.",
    howBillingWorks: "50% upfront deposit to commence system architecture; 50% only upon full acceptance on staging before production launch.",
    whatIsIncluded: [
      "Itemized Statement of Work (SOW) & delivery calendar",
      "Guaranteed milestone delivery dates",
      "30-day post-launch comprehensive bug warranty",
      "Full IP & source code repository ownership",
      "Zero hidden hourly invoices",
    ],
    typicalRange: {
      KES: "KSh 30,000 – 150,000+ per project",
      USD: "$250 – $1,200+ per project",
    },
    ctaText: "Choose Fixed Scope",
    ctaHref: "/contact?engagement=fixed-scope",
  },
  {
    id: "time-materials",
    name: "Time & Materials (Agile Sprints)",
    badge: "Maximum Agility",
    isPopular: true,
    tagline: "Flexible sprint velocity for evolving product roadmaps.",
    bestFor: "Fast-moving venture-backed startups, continuous R&D, product pivots, and systems with dynamic requirements.",
    howBillingWorks: "Invoiced bi-weekly based on completed 2-week engineering sprints and agreed developer capacity.",
    whatIsIncluded: [
      "Dedicated senior engineers integrated into your team",
      "Bi-weekly sprint planning & velocity retrospectives",
      "Direct Slack / WhatsApp channel communication",
      "Continuous CI/CD branch deployments to staging",
      "Ability to pivot features and priorities every 2 weeks",
    ],
    typicalRange: {
      KES: "KSh 60,000 – 180,000 per 2-week sprint",
      USD: "$500 – $1,500 per 2-week sprint",
    },
    ctaText: "Hire Agile Sprint Team",
    ctaHref: "/contact?engagement=time-materials",
  },
  {
    id: "monthly-retainer",
    name: "Monthly Engineering Retainer",
    badge: "Continuous Evolution",
    tagline: "Ongoing maintenance, proactive monitoring, and dedicated developer hours.",
    bestFor: "Live production platforms requiring 24/7 uptime monitoring, security updates, and monthly feature rollouts.",
    howBillingWorks: "Billed on the 1st of each month with a 14-day cancellation policy. No long-term lock-in contracts.",
    whatIsIncluded: [
      "24/7 automated synthetic uptime & performance monitoring",
      "Monthly dependency, framework, and security patch releases",
      "Daily automated encrypted database snapshots",
      "Dedicated monthly developer hours for feature requests",
      "Guaranteed 1-hour emergency incident response SLA",
    ],
    typicalRange: {
      KES: "KSh 5,000 – 25,000+ per month",
      USD: "$40 – $200+ per month",
    },
    ctaText: "Start Monthly Retainer",
    ctaHref: "/contact?engagement=monthly-retainer",
  },
];

export const engagementFaqs = [
  {
    q: "How do we choose between Fixed Scope and Agile Sprints?",
    a: "If your requirements, wireframes, and database fields are 100% defined, Fixed Scope provides complete cost certainty. If your product is evolving, undergoing user testing, or requires flexible priorities, Agile Sprints are significantly more efficient.",
  },
  {
    q: "Can we start with Fixed Scope and switch to a Monthly Retainer?",
    a: "Yes! Over 80% of our clients launch their initial system under a Fixed Scope project and seamlessly transition into a Monthly Retainer for ongoing care and feature enhancements.",
  },
  {
    q: "What payment currencies do you accept for international clients?",
    a: "We support both Kenya Shillings (via M-Pesa or bank transfer with KRA e-TIMS invoices) and international currencies (USD, CAD, EUR) processed securely via Stripe.",
  },
  {
    q: "What happens if a Fixed Scope project takes longer than expected?",
    a: "Under Fixed Scope, we absorb timeline delays caused by our engineering process. As long as the project scope has not been modified, your fee remains locked.",
  },
];
