export interface NavItem {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
    description?: string;
  }[];
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about",
    children: [
      {
        label: "Technologies We Use",
        href: "/technologies",
        description: "Overview of the technologies we use to build our solutions.",
      },
      {
        label: "Engagement Models",
        href: "/engagement",
        description: "Overview of our collaboration approaches and project delivery methods.",
      },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "Web Application Development",
        href: "/services/web-application-development",
        description: "Fast, resilient web platforms using Next.js & modern architectures.",
      },
      {
        label: "Custom Software Engineering",
        href: "/services/custom-software",
        description: "Bespoke digital systems and automated operational tools.",
      },
      {
        label: "Mobile App Development",
        href: "/services/mobile-apps",
        description: "Cross-platform iOS and Android apps with React Native / Expo.",
      },
      {
        label: "AI & ML Integrations",
        href: "/services/ai-automation",
        description: "Intelligent features, NLP pipelines, and generative workflows.",
      },
      {
        label: "Cloud Architecture & DevOps",
        href: "/services/cloud-devops",
        description: "Scalable CI/CD pipelines, serverless deployments, and uptime SLAs.",
      },
      {
        label: "Explore All 11 Services →",
        href: "/services",
        description: "Comprehensive engineering capabilities catalog.",
      },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      {
        label: "ERP & Operations",
        href: "/solutions/erp",
        description: "Streamline workflows, inventory, and cross-team processes.",
      },
      {
        label: "CRM & Client Portals",
        href: "/solutions/crm",
        description: "High-trust client login areas, messaging, and ticket management.",
      },
      {
        label: "FinTech & M-Pesa Systems",
        href: "/solutions/fintech",
        description: "Regulatory-compliant payments, wallets, and automated reconciliation.",
      },
      {
        label: "AgriTech & Field Data",
        href: "/solutions/agritech",
        description: "Offline-first data collection and supply chain visibility.",
      },
      {
        label: "Explore All Solutions →",
        href: "/solutions",
        description: "Pre-architected, productised system frameworks.",
      },
    ],
  },
  { label: "Industries", href: "/industries" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const navConfig = {
  quoteCta: {
    label: "Get a quote",
    href: "/contact",
  },
  signInCta: {
    label: "Sign in",
    href: "/sign-in",
  },
  // Feature flags: keep Sign in hidden until Part 1 Phase 7 authentication is wired up
  features: {
    showSignIn: false,
  },
};
