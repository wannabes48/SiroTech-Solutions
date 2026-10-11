import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { ReadMore } from "@/components/shared/read-more";
import {
  getAllPosts,
  getAllCategories,
  getPostsByCategory,
} from "@/lib/blog";
import {
  Search,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

export const dynamic = "force-static";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = getAllCategories();
  const category = categories.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!category) {
    return {
      title: "Category Not Found | SiroTech Blog",
    };
  }

  const canonicalUrl = `https://sirotech.com/blog/category/${category.slug}`;

  return {
    title: `${category.label} Engineering Guides & Insights | SiroTech Solutions`,
    description: `Browse technical articles, architecture deep-dives, and production guides in ${category.label} from SiroTech Solutions in Nairobi.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${category.label} Engineering Articles | SiroTech Solutions`,
      description: `Technical guides and production insights for ${category.label}.`,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.label} | SiroTech Blog`,
      description: `Technical insights and architectural best practices in ${category.label}.`,
    },
  };
}

const POSTS_PER_PAGE = 9;

export default async function BlogCategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const currentPage = Math.max(1, parseInt(rawPage || "1", 10));

  const categories = getAllCategories();
  const category = categories.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!category) {
    notFound();
  }

  const posts = getPostsByCategory(slug);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const displayedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://sirotech.com/blog/category/${slug}#collection`,
        name: `${category.label} Articles`,
        description: `Technical archive of engineering guides in ${category.label}.`,
        url: `https://sirotech.com/blog/category/${slug}`,
        publisher: {
          "@type": "Organization",
          name: "SiroTech Solutions",
          url: "https://sirotech.com",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://sirotech.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://sirotech.com/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.label,
            item: `https://sirotech.com/blog/category/${slug}`,
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
            <Breadcrumbs
              items={[
                { label: "Blog", href: "/blog" },
                { label: category.label, href: `/blog/category/${slug}` },
              ]}
            />
          </div>

          {/* Hero Section */}
          <section className="mb-12">
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 text-sage-800 text-xs font-bold uppercase tracking-widest mb-4">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Topic Archive</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-6">
                {category.label}
              </h1>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                Technical patterns, case breakdowns, and implementation tutorials focused on {category.label.toLowerCase()}.
              </p>
            </div>

            {/* Search Box Trigger */}
            <div className="max-w-md">
              <form action="/search" method="GET" className="relative">
                <input
                  type="text"
                  name="q"
                  placeholder="Search articles in this topic..."
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
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-ink border border-rule hover:bg-sage-50 transition-all"
              >
                All Topics ({getAllPosts().length})
              </Link>
              {categories.map((cat) => {
                const isActive = cat.slug.toLowerCase() === slug.toLowerCase();
                return (
                  <Link
                    key={cat.slug}
                    href={`/blog/category/${cat.slug}`}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-ink text-white shadow-xs"
                        : "bg-white text-ink border border-rule hover:bg-sage-50 hover:border-ink/30"
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Articles Grid */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-ink">
                {category.label} Articles ({posts.length})
              </h2>
              {posts.length > 0 && (
                <span className="text-xs text-muted font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            {displayedPosts.length > 0 ? (
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
            ) : (
              <div className="bg-surface rounded-[32px] border border-rule p-12 text-center max-w-xl mx-auto">
                <FolderOpen className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold text-ink mb-2">No articles in this topic yet</h3>
                <p className="text-body text-sm mb-6">
                  We are regularly documenting engineering insights. Check back soon or browse all topics.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex px-6 py-3 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors"
                >
                  View All Articles
                </Link>
              </div>
            )}
          </section>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <section className="mb-24 flex items-center justify-center gap-3">
              {currentPage > 1 ? (
                <Link
                  href={`/blog/category/${slug}?page=${currentPage - 1}`}
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
                      href={`/blog/category/${slug}?page=${pNum}`}
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
                  href={`/blog/category/${slug}?page=${currentPage + 1}`}
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
            headline="Need specialized engineering execution for your platform?"
            description="Our senior engineers architect resilient architectures for African and international enterprises."
            primaryAction={{
              label: "Schedule Technical Consultation",
              href: "/contact",
            }}
            secondaryAction={{
              label: "Explore Work & Case Studies",
              href: "/work",
            }}
          />
        </Container>
      </main>
    </>
  );
}
