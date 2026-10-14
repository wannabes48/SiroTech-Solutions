import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PillTag } from "@/components/ui/PillTag";
import { CtaBand } from "@/components/ui/CtaBand";
import { ReadMore } from "@/components/shared/read-more";
import {
  getAllPosts,
  getFeaturedPost,
  getAllCategories,
  BlogPost,
} from "@/lib/blog";
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering Blog & Technical Insights | SiroTech Solutions Nairobi",
  description:
    "In-depth architectural analyses, M-Pesa integration patterns, offline-first mobile systems, and AI engineering practices from our senior engineering studio.",
  openGraph: {
    title: "SiroTech Engineering Blog & Architectural Guides",
    description:
      "Deep-dive technical articles written by practicing systems architects in Nairobi.",
    url: "https://sirotech.vercel.app/blog",
  },
};

const POSTS_PER_PAGE = 9;

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const { page: rawPage } = await searchParams;
  const currentPage = Math.max(1, parseInt(rawPage || "1", 10));

  const allPosts = getAllPosts();
  const featuredPost = getFeaturedPost() || allPosts[0];
  const categories = getAllCategories();

  // Exclude featured post from grid if on first page to avoid duplication
  const remainingPosts = allPosts.filter((p) => p.slug !== featuredPost?.slug);

  const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const displayedPosts = remainingPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": "https://sirotech.vercel.app/blog#blog",
        name: "SiroTech Solutions Engineering Blog",
        description:
          "Technical articles and systems engineering case guides for East African and global architectures.",
        url: "https://sirotech.vercel.app/blog",
        publisher: {
          "@type": "Organization",
          name: "SiroTech Solutions",
          url: "https://sirotech.vercel.app",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://sirotech.vercel.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://sirotech.vercel.app/blog",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="min-h-screen bg-bg pt-32 pb-24">
        <Container>
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "Blog", href: "/blog" }]} />
          </div>

          {/* Hero Section */}
          <section className="mb-14">
            <div className="max-w-3xl mb-8">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                Technical Publication
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-6">
                Engineering Notes &amp; Systems Insights
              </h1>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                Practical guides, production architecture post-mortems, and engineering patterns from our team in Nairobi. Written for CTOs, product engineers, and technical founders.
              </p>
            </div>

            {/* Search Box Trigger */}
            <div className="max-w-md">
              <form action="/search" method="GET" className="relative">
                <input
                  type="text"
                  name="q"
                  placeholder="Search articles, M-Pesa, SQLite, Next.js..."
                  className="w-full bg-white border border-rule rounded-full pl-12 pr-4 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors shadow-xs"
                />
                <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-ink text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </section>

          {/* Category Chips Bar */}
          <section className="mb-14">
            <div className="flex flex-wrap items-center gap-2.5 pb-2">
              <Link
                href="/blog"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-ink text-white shadow-xs"
              >
                All Topics ({allPosts.length})
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-ink border border-rule hover:bg-sage-50 hover:border-ink/30 transition-all"
                >
                  {cat.label} ({cat.count})
                </Link>
              ))}
            </div>
          </section>

          {/* Large Featured Post Banner */}
          {featuredPost && currentPage === 1 && (
            <section className="mb-20">
              <article className="group bg-surface rounded-[32px] border border-rule overflow-hidden hover:border-ink/20 hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Cover Image */}
                <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden bg-sage-100 relative">
                  <img
                    src={featuredPost.cover}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-3.5 py-1.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider shadow-md">
                      Featured Guide
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-muted">
                      <span className="text-sage-800 font-bold uppercase tracking-wider">
                        {featuredPost.categoryLabel}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredPost.readingTime}
                      </span>
                    </div>

                    <Link href={`/blog/${featuredPost.slug}`}>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-ink group-hover:text-sage-800 transition-colors mb-4 leading-tight">
                        {featuredPost.title}
                      </h2>
                    </Link>

                    <p className="text-body text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-rule/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sage-300 text-sage-800 font-bold text-xs flex items-center justify-center">
                        {featuredPost.authorAvatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink">
                          {featuredPost.author}
                        </div>
                        <div className="text-[11px] text-muted">
                          {featuredPost.authorRole}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ink group-hover:text-sage-800 transition-colors uppercase tracking-wider"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* 9-Post Grid */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-ink">All Published Articles</h2>
              <span className="text-xs text-muted font-medium">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="group bg-surface rounded-[28px] border border-rule overflow-hidden hover:border-ink/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="aspect-[16/10] overflow-hidden bg-sage-100 relative">
                      <img
                        src={post.cover}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-ink text-[11px] font-bold uppercase tracking-wider shadow-xs border border-rule">
                          {post.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <div className="p-7">
                      <div className="flex items-center gap-3 text-xs text-muted font-medium mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readingTime}
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-bold text-ink group-hover:text-sage-800 transition-colors mb-3 leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-body text-sm leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-7 pt-0 border-t border-rule/60 flex items-center justify-between">
                    <div className="text-xs font-bold text-ink">
                      By {post.author}
                    </div>
                    <ReadMore href={`/blog/${post.slug}`} label="Read" />
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <section className="mb-24 flex items-center justify-center gap-3">
              {currentPage > 1 ? (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="px-5 py-2.5 rounded-full bg-white border border-rule text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-50 inline-flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-5 py-2.5 rounded-full bg-surface border border-rule text-muted text-xs font-bold uppercase tracking-wider opacity-50 cursor-not-allowed inline-flex items-center gap-1.5">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </span>
              )}

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  const isCurrent = pNum === currentPage;
                  return (
                    <Link
                      key={pNum}
                      href={`/blog?page=${pNum}`}
                      className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                        isCurrent
                          ? "bg-ink text-white"
                          : "bg-white text-ink border border-rule hover:bg-sage-50"
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="px-5 py-2.5 rounded-full bg-white border border-rule text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-50 inline-flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="px-5 py-2.5 rounded-full bg-surface border border-rule text-muted text-xs font-bold uppercase tracking-wider opacity-50 cursor-not-allowed inline-flex items-center gap-1.5">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </section>
          )}

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Want us to engineer a scalable digital system for your business?"
            description="From payment gateways to offline-first field apps, our Nairobi engineering studio is ready to build."
            primaryAction={{
              label: "Schedule Technical Consultation",
              href: "/contact",
            }}
            secondaryAction={{
              label: "Explore Case Studies",
              href: "/work",
            }}
          />
        </Container>
      </main>
    </>
  );
}
