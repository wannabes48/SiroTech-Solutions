import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { ReadMore } from "@/components/shared/read-more";
import {
  searchIndex,
  getPopularSuggestions,
  SearchResult,
  SearchItemType,
} from "@/lib/search-index";
import {
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  BookOpen,
  Briefcase,
  Building2,
  FolderSearch,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Search Results | SiroTech Solutions",
  description: "Universal search across services, solutions, case studies, industries, and engineering guides.",
  robots: {
    index: false,
    follow: false,
  },
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

const typeIconMap: Record<SearchItemType, any> = {
  service: Layers,
  solution: Sparkles,
  industry: Building2,
  work: Briefcase,
  blog: BookOpen,
};

const typeSectionTitles: Record<SearchItemType, string> = {
  service: "Engineering Services",
  solution: "Turnkey Solutions & Platforms",
  industry: "Industry Expertise",
  work: "Client Case Studies",
  blog: "Engineering Articles & Guides",
};

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) return <>{text}</>;

  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (tokens.length === 0) return <>{text}</>;

  const regex = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        tokens.some((token) => new RegExp(`^${token}$`, "i").test(part)) ? (
          <mark
            key={i}
            className="bg-sage-200 text-ink px-1 py-0.5 rounded-xs font-semibold"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: rawQ, type: selectedType } = await searchParams;
  const query = (rawQ || "").trim();

  const allResults = query ? searchIndex(query) : [];
  const popularSuggestions = getPopularSuggestions();

  // Filter by type if specified
  const filteredResults =
    selectedType && selectedType !== "all"
      ? allResults.filter((r) => r.type === selectedType)
      : allResults;

  // Group by type for organized display
  const groupedResults: Partial<Record<SearchItemType, SearchResult[]>> = {};
  for (const item of filteredResults) {
    if (!groupedResults[item.type]) {
      groupedResults[item.type] = [];
    }
    groupedResults[item.type]!.push(item);
  }

  const typeOrder: SearchItemType[] = [
    "service",
    "solution",
    "industry",
    "work",
    "blog",
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg pt-32 pb-24">
        <Container>
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "Search", href: "/search" }]} />
          </div>

          {/* Search Header & Input Box */}
          <section className="mb-14">
            <div className="max-w-3xl mb-8">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                Studio Knowledge Index
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">
                Universal Search
              </h1>
              <p className="text-body text-base sm:text-lg">
                Explore services, case studies, open framework modules, and technical guides across our entire site.
              </p>
            </div>

            {/* Live Search Form */}
            <div className="max-w-2xl">
              <form action="/search" method="GET" className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by technology, industry, service, or topic..."
                  className="w-full bg-white border border-rule rounded-full pl-13 pr-32 py-4 text-base text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors shadow-sm"
                  autoFocus
                />
                <Search className="w-5 h-5 text-muted absolute left-5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-ink text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors shadow-xs"
                >
                  Search
                </button>
              </form>
            </div>
          </section>

          {/* Type Filter Chips (if query active) */}
          {query && allResults.length > 0 && (
            <section className="mb-10">
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    !selectedType || selectedType === "all"
                      ? "bg-ink text-white shadow-xs"
                      : "bg-white text-ink border border-rule hover:bg-sage-50"
                  }`}
                >
                  All Matches ({allResults.length})
                </Link>

                {typeOrder.map((t) => {
                  const count = allResults.filter((r) => r.type === t).length;
                  if (count === 0) return null;
                  const isCurrent = selectedType === t;
                  return (
                    <Link
                      key={t}
                      href={`/search?q=${encodeURIComponent(query)}&type=${t}`}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        isCurrent
                          ? "bg-ink text-white shadow-xs"
                          : "bg-white text-ink border border-rule hover:bg-sage-50"
                      }`}
                    >
                      {typeSectionTitles[t]} ({count})
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Results State */}
          {query ? (
            filteredResults.length > 0 ? (
              <div className="space-y-16 mb-24">
                {typeOrder.map((typeKey) => {
                  const items = groupedResults[typeKey];
                  if (!items || items.length === 0) return null;

                  const Icon = typeIconMap[typeKey] || Sparkles;

                  return (
                    <section key={typeKey} className="scroll-mt-28">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-sage-200 text-sage-900 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-ink">
                          {typeSectionTitles[typeKey]} ({items.length})
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((result) => (
                          <div
                            key={result.id}
                            className="group bg-surface rounded-[28px] border border-rule p-7 hover:border-ink/20 hover:shadow-lg transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="text-[11px] font-bold text-sage-800 uppercase tracking-wider">
                                  {result.typeLabel}
                                </span>
                                {result.badge && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-rule text-[10px] font-semibold text-muted">
                                    {result.badge}
                                  </span>
                                )}
                              </div>

                              <Link href={result.url}>
                                <h3 className="text-lg font-bold text-ink group-hover:text-sage-800 transition-colors mb-2 leading-snug line-clamp-2">
                                  <HighlightText text={result.title} query={query} />
                                </h3>
                              </Link>

                              <p className="text-body text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6">
                                <HighlightText text={result.summary} query={query} />
                              </p>
                            </div>

                            <div className="pt-4 border-t border-rule/60 flex items-center justify-between">
                              <span className="text-[11px] text-muted font-medium">
                                Relevance: {result.score} pts
                              </span>
                              <ReadMore href={result.url} label="Open" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              /* No Results State */
              <section className="mb-24 bg-surface rounded-[32px] border border-rule p-12 text-center max-w-2xl mx-auto">
                <FolderSearch className="w-14 h-14 text-muted mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-ink mb-3">
                  No matches found for &ldquo;{query}&rdquo;
                </h2>
                <p className="text-body text-sm sm:text-base mb-8 max-w-md mx-auto">
                  We could not find anything matching your exact query. Try searching for one of the popular topics below:
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  {popularSuggestions.map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/search?q=${encodeURIComponent(suggestion)}`}
                      className="px-4 py-2 rounded-full bg-white border border-rule text-xs font-semibold text-ink hover:bg-sage-50 hover:border-ink/30 transition-all"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/services"
                  className="inline-flex px-6 py-3 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors"
                >
                  Browse All Services
                </Link>
              </section>
            )
          ) : (
            /* Blank Query State: Suggestions */
            <section className="mb-24 bg-surface rounded-[32px] border border-rule p-10 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sage-800" />
                <span>Suggested Searches</span>
              </h2>
              <p className="text-body text-sm mb-6">
                Click any of the topics below to instantly explore relevant services, case studies, and engineering guides:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {popularSuggestions.map((suggestion) => (
                  <Link
                    key={suggestion}
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="px-4 py-2 rounded-full bg-white border border-rule text-xs font-bold text-ink hover:bg-sage-50 hover:border-ink/30 transition-all shadow-2xs"
                  >
                    {suggestion}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Looking for tailored technical architecture?"
            description="Our engineering team builds scalable web platforms, offline-first mobile systems, and payment rails."
            primaryAction={{
              label: "Schedule Consultation",
              href: "/contact",
            }}
            secondaryAction={{
              label: "Explore Work Portfolio",
              href: "/work",
            }}
          />
        </Container>
      </main>
    </>
  );
}
