export interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  isPopular?: boolean;
  description: string;
  scope: string;
  prices: {
    KES: { display: string; starting: number; range: string };
    USD: { display: string; starting: number; range: string };
    CAD: { display: string; starting: number; range: string };
  };
  timeline: string;
  deliverables: string[];
  ctaText: string;
  ctaHref: string;
}

export interface CarePlan {
  name: string;
  description: string;
  price: {
    KES: string;
    USD: string;
    CAD: string;
  };
  features: string[];
}

export const projectPricingTiers: PricingTier[] = [
  {
    id: "landing-page",
    name: "Simple Landing Page",
    badge: "Quick Launch",
    description: "Ideal for a promotional campaign, event launch, product waitlist, or modern personal portfolio.",
    scope: "1–3 responsive pages, basic contact form, and standard SEO.",
    prices: {
      KES: { display: "KSh 15K – 30K", starting: 15000, range: "KSh 15,000 – 30,000" },
      USD: { display: "$120 – $250", starting: 120, range: "$120 – $250" },
      CAD: { display: "C$160 – C$340", starting: 160, range: "C$160 – C$340" },
    },
    timeline: "3–5 days",
    deliverables: [
      "1–3 custom responsive sections/pages",
      "Lead capture & contact form integration",
      "Standard on-page SEO & OpenGraph tags",
      "Speed & Core Web Vitals optimization",
      "Custom domain & SSL setup",
    ],
    ctaText: "Get Started",
    ctaHref: "/contact?package=landing-page",
  },
  {
    id: "business-website",
    name: "Small Business Website",
    badge: "Most Popular",
    isPopular: true,
    description: "Best for established businesses needing credibility, client trust, and multi-page information architecture.",
    scope: "Several interconnected pages (About, Services, Contact, Blog), social integrations, and content management setup.",
    prices: {
      KES: { display: "KSh 30K – 60K", starting: 30000, range: "KSh 30,000 – 60,000" },
      USD: { display: "$250 – $500", starting: 250, range: "$250 – $500" },
      CAD: { display: "C$340 – C$680", starting: 340, range: "C$340 – C$680" },
    },
    timeline: "1–2 weeks",
    deliverables: [
      "5–8 structured pages (Home, About, Services, Work, Contact)",
      "Headless CMS integration for easy content editing",
      "Interactive inquiry forms & email notifications",
      "Social media feeds & WhatsApp quick-chat widget",
      "Google Analytics & Search Console indexing",
    ],
    ctaText: "Choose Package",
    ctaHref: "/contact?package=business-website",
  },
  {
    id: "web-app-ecommerce",
    name: "Custom Web App / eCommerce",
    badge: "High Growth",
    description: "For startups and scaling brands requiring custom logic, transactional checkout, user dashboards, and APIs.",
    scope: "Full-stack Next.js/React architecture, custom backend APIs, authentication, and secure payment integrations (M-Pesa / Stripe).",
    prices: {
      KES: { display: "KSh 70K – 150K+", starting: 70000, range: "KSh 70,000 – 150,000+" },
      USD: { display: "$550 – $1,200+", starting: 550, range: "$550 – $1,200+" },
      CAD: { display: "C$750 – C$1,600+", starting: 750, range: "C$750 – C$1,600+" },
    },
    timeline: "3–6 weeks",
    deliverables: [
      "Custom full-stack Next.js application & database schema",
      "M-Pesa Express STK push + Stripe card checkout",
      "User authentication, role-based access & client portal",
      "Admin back-office dashboard & automated reports",
      "Custom REST / GraphQL APIs & third-party integrations",
    ],
    ctaText: "Build Your App",
    ctaHref: "/contact?package=web-app-ecommerce",
  },
  {
    id: "enterprise-site",
    name: "Large Corporate / Enterprise",
    badge: "Bespoke",
    description: "Mission-critical software platforms with high compliance, multi-tier permissions, and custom system architectures.",
    scope: "Custom layouts, advanced security protocols, multiple user roles, deep third-party API integrations, and comprehensive testing.",
    prices: {
      KES: { display: "KSh 150K – 300K+", starting: 150000, range: "KSh 150,000 – 300,000+" },
      USD: { display: "$1,200 – $2,500+", starting: 1200, range: "$1,200 – $2,500+" },
      CAD: { display: "C$1,650 – C$3,400+", starting: 1650, range: "C$1,650 – C$3,400+" },
    },
    timeline: "6–12 weeks",
    deliverables: [
      "Enterprise microservices / scalable distributed architecture",
      "Multi-tenant security, audit logging & data encryption",
      "Custom AI integrations, LLM workflows or automated pipelines",
      "Legacy ERP, banking or CRM system synchronization",
      "Rigorous automated testing, security audit & SLA guarantee",
    ],
    ctaText: "Book Discovery Call",
    ctaHref: "/book",
  },
];

export const carePlans: CarePlan[] = [
  {
    name: "Essential Care",
    description: "Ongoing peace of mind for simple sites and landing pages.",
    price: {
      KES: "KSh 5,000 / mo",
      USD: "$40 / mo",
      CAD: "$55 / mo",
    },
    features: [
      "Monthly security & dependency updates",
      "Automated cloud backups (weekly)",
      "99.9% uptime monitoring",
      "1 hour of content/design updates per month",
      "Email support within 24 hours",
    ],
  },
  {
    name: "Growth Retainer",
    description: "Continuous development and optimizations for active web apps.",
    price: {
      KES: "KSh 18,000 / mo",
      USD: "$140 / mo",
      CAD: "$190 / mo",
    },
    features: [
      "Daily database & asset backups",
      "Performance & SEO monthly health audits",
      "Bug fixes & framework patch releases",
      "5 hours dedicated developer time monthly",
      "Priority WhatsApp & phone SLA",
    ],
  },
];

export const pricingFaqs = [
  {
    q: "How are project payments structured?",
    a: "We work on a milestone-based flat fee model. Typically, projects start with a 50% deposit to commence architecture and design, with the remaining 50% due upon staging approval before production launch.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We support M-Pesa (Buy Goods / Till & Paybill), direct Kenyan bank transfers (KRA compliant e-TIMS invoices available), and international debit/credit cards via Stripe.",
  },
  {
    q: "Are there any hidden recurring fees?",
    a: "None. All project quotes cover complete design, development, testing, and deployment. We help you setup your domain and cloud hosting (e.g. Vercel, Supabase, Cloudflare) directly under your ownership so you maintain full control.",
  },
  {
    q: "Can I upgrade my project later as my business grows?",
    a: "Absolutely. Every codebase we architect uses modular, clean patterns (Next.js, TypeScript, Tailwind) that make future enhancements effortless without having to rebuild from scratch.",
  },
];
