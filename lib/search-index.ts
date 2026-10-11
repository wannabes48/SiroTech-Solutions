import { services } from "@/data/services";
import { solutions } from "@/data/solutions";
import { industries } from "@/data/industries";
import { work } from "@/data/work";
import { getAllPosts } from "@/lib/blog";

export type SearchItemType = "service" | "solution" | "industry" | "work" | "blog";

export interface SearchItem {
  id: string;
  type: SearchItemType;
  typeLabel: string;
  title: string;
  summary: string;
  url: string;
  keywords: string[];
  badge?: string;
}

export interface SearchResult extends SearchItem {
  score: number;
}

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // 1. Services (11)
  for (const s of services) {
    items.push({
      id: `service-${s.slug}`,
      type: "service",
      typeLabel: "Service",
      title: s.title,
      summary: s.summary || s.intro,
      url: `/services/${s.slug}`,
      keywords: [
        s.category,
        ...(s.technologies || []),
        ...(s.deliverables || []).map((d) => d.split(" ")[0]),
      ],
      badge: s.category.toUpperCase(),
    });
  }

  // 2. Solutions (10)
  for (const sol of solutions) {
    items.push({
      id: `solution-${sol.slug}`,
      type: "solution",
      typeLabel: "Solution",
      title: sol.title,
      summary: sol.summary || sol.tagline,
      url: `/solutions/${sol.slug}`,
      keywords: [
        sol.category,
        sol.tagline,
        ...(sol.modules || []).map((m) => m.title),
        ...(sol.keyFeatures || []).map((f) => f.title),
      ],
      badge: sol.demoAvailable ? "Interactive Demo" : "Framework",
    });
  }

  // 3. Industries (8)
  for (const ind of industries) {
    items.push({
      id: `industry-${ind.slug}`,
      type: "industry",
      typeLabel: "Industry",
      title: ind.title,
      summary: ind.summary || ind.heroDescription,
      url: `/industries/${ind.slug}`,
      keywords: [
        ind.title,
        ...(ind.challenges || []).map((c) => c.title),
        ...(ind.howWeHelp || []).map((h) => h.serviceTitle),
      ],
      badge: "Industry",
    });
  }

  // 4. Case Studies / Work (4)
  for (const cs of work) {
    items.push({
      id: `work-${cs.slug}`,
      type: "work",
      typeLabel: "Case Study",
      title: `${cs.title} – ${cs.client}`,
      summary: cs.summary || cs.tagline,
      url: `/work/${cs.slug}`,
      keywords: [
        cs.client,
        cs.industry,
        cs.buildType,
        ...(cs.technologies || []),
        ...(cs.deliverables || []),
      ],
      badge: cs.buildType,
    });
  }

  // 5. Blog Posts (4)
  const posts = getAllPosts();
  for (const p of posts) {
    items.push({
      id: `blog-${p.slug}`,
      type: "blog",
      typeLabel: "Article",
      title: p.title,
      summary: p.excerpt,
      url: `/blog/${p.slug}`,
      keywords: [p.categoryLabel, p.author, ...(p.tags || [])],
      badge: p.categoryLabel,
    });
  }

  return items;
}

export function searchIndex(query: string): SearchResult[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 1);
  const items = buildSearchIndex();
  const scoredResults: SearchResult[] = [];

  for (const item of items) {
    const titleLower = item.title.toLowerCase();
    const summaryLower = item.summary.toLowerCase();
    const keywordsText = item.keywords.join(" ").toLowerCase();

    let score = 0;

    // Exact Title Match (highest weight)
    if (titleLower === cleanQuery) {
      score += 150;
    } else if (titleLower.includes(cleanQuery)) {
      score += 60;
    }

    // Token Title Matches (weight 15 each)
    for (const token of tokens) {
      if (titleLower.includes(token)) {
        score += 20;
      }
    }

    // Exact Summary Match
    if (summaryLower.includes(cleanQuery)) {
      score += 30;
    }

    // Token Summary Matches (weight 5 each)
    for (const token of tokens) {
      if (summaryLower.includes(token)) {
        score += 6;
      }
    }

    // Keyword Matches (weight 8 each)
    for (const token of tokens) {
      if (keywordsText.includes(token)) {
        score += 10;
      }
    }

    if (score > 0) {
      scoredResults.push({
        ...item,
        score,
      });
    }
  }

  return scoredResults.sort((a, b) => b.score - a.score);
}

export function getPopularSuggestions(): string[] {
  return [
    "M-Pesa Daraja",
    "Next.js",
    "Offline-First",
    "ERP",
    "PostgreSQL",
    "FinTech",
    "Mobile Apps",
    "Cloud Architecture",
    "Agriculture",
    "Security",
  ];
}
