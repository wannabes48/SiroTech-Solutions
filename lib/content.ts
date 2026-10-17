import { services } from "@/data/services";
import { projectPricingTiers } from "@/data/pricing";
import { FAQ_GROUPS } from "@/data/faq";
import { query } from "@/lib/db";

export async function getServices() {
  if (process.env.CONTENT_SOURCE === "db") {
    try {
      const res = await query(
        `SELECT slug, title, summary, content FROM content_items WHERE type = 'service' AND status = 'PUBLISHED'`
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          title: row.title,
          slug: row.slug,
          summary: row.summary,
        }));
      }
    } catch (err) {
      console.warn("Falling back to static services content:", err);
    }
  }

  return services.map((s) => ({
    title: s.title,
    slug: s.slug,
    summary: s.summary || s.intro,
  }));
}

export async function getPlans() {
  if (process.env.CONTENT_SOURCE === "db") {
    try {
      const res = await query(
        `SELECT slug, title, summary, content FROM content_items WHERE type = 'pricing' AND status = 'PUBLISHED'`
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => {
          const content = typeof row.content === "string" ? JSON.parse(row.content) : (row.content || {});
          return {
            name: row.title,
            tagline: row.summary,
            prices: content.prices || { KES: "Contact for pricing", USD: "Contact for pricing" },
            features: content.features || content.deliverables || [],
          };
        });
      }
    } catch (err) {
      console.warn("Falling back to static pricing content:", err);
    }
  }

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
  if (process.env.CONTENT_SOURCE === "db") {
    try {
      const res = await query(
        `SELECT slug, title, summary, content FROM content_items WHERE type = 'faq' AND status = 'PUBLISHED'`
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => {
          const content = typeof row.content === "string" ? JSON.parse(row.content) : (row.content || {});
          return {
            q: row.title,
            a: row.summary || content.answer || "",
          };
        });
      }
    } catch (err) {
      console.warn("Falling back to static FAQ content:", err);
    }
  }

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
  if (process.env.CONTENT_SOURCE === "db") {
    try {
      const res = await query(
        `SELECT value FROM site_settings WHERE key = 'site_info'`
      );
      if (res.rows.length > 0 && res.rows[0].value) {
        return res.rows[0].value;
      }
    } catch (err) {
      console.warn("Falling back to static site info:", err);
    }
  }

  return {
    about:
      "SiroTech Solutions is an independent software and IT engineering studio based in Westlands, Nairobi, building modern web platforms, offline-first mobile apps, and enterprise systems.",
    hours: "Monday to Friday, 8:30 AM – 6:00 PM EAT",
    email: "hello@sirotech.com",
    whatsapp: "+254 (0) 745 131 817",
  };
}
