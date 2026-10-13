import { services } from "@/data/services";
import { projectPricingTiers } from "@/data/pricing";
import { FAQ_GROUPS } from "@/data/faq";

export async function getServices() {
  return services.map((s) => ({
    title: s.title,
    slug: s.slug,
    summary: s.summary || s.intro,
  }));
}

export async function getPlans() {
  return projectPricingTiers.map((p) => ({
    name: p.name,
    tagline: p.scope,
    prices: {
      KES: p.prices.KES.display,
      USD: p.prices.USD.display,
    },
    features: p.deliverables,
  }));
}

export async function getFaqs() {
  return FAQ_GROUPS.flatMap((g) => g.items).map((item) => ({
    q: item.q,
    a: item.a,
  }));
}

export async function getProcess() {
  return [
    {
      step: "01. Architecture & Discovery",
      summary: "System design, schema modeling, and interactive wireframes (1–2 weeks).",
    },
    {
      step: "02. Sprint Prototyping",
      summary: "Bi-weekly sprint milestones with staging previews and continuous client demos.",
    },
    {
      step: "03. Production Hardening",
      summary: "Automated test coverage, OWASP security audits, and load testing.",
    },
    {
      step: "04. Deployment & Hypercare",
      summary: "Zero-downtime deployment, infrastructure monitoring, and a 30-day warranty.",
    },
  ];
}

export async function getSiteInfo() {
  return {
    about:
      "SiroTech Solutions is an independent software and IT engineering studio based in Westlands, Nairobi, building modern web platforms, offline-first mobile apps, and enterprise systems.",
    hours: "Monday to Friday, 8:30 AM – 6:00 PM EAT",
    email: "hello@sirotech.com",
    whatsapp: "+254 (0) 745 131 817",
  };
}
