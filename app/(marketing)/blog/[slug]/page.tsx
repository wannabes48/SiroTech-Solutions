import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PillTag } from "@/components/ui/PillTag";
import { CtaBand } from "@/components/ui/CtaBand";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ShareButtons } from "@/components/blog/ShareButtons";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  BlogPost,
} from "@/lib/blog";
import {
  Calendar,
  Clock,
  ArrowRight,
  ArrowUpRight,
  List,
  Mail,
  CheckCircle2,
  Share2,
} from "lucide-react";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${post.title} | SiroTech Engineering Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://sirotech.vercel.app/blog/${post.slug}`,
      type: "article",
      images: [{ url: post.cover, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, post.tags);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `https://sirotech.vercel.app/blog/${post.slug}#article`,
        headline: post.title,
        description: post.excerpt,
        image: post.cover,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          "@type": "Person",
          name: post.author,
          jobTitle: post.authorRole,
        },
        publisher: {
          "@type": "Organization",
          name: "SiroTech Solutions",
          url: "https://sirotech.vercel.app",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://sirotech.vercel.app/blog/${post.slug}`,
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
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `https://sirotech.vercel.app/blog/${post.slug}`,
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
                { label: post.title, href: `/blog/${post.slug}` },
              ]}
            />
          </div>

          {/* Article Header */}
          <header className="max-w-4xl mb-12">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <PillTag variant="sage">{post.categoryLabel}</PillTag>
              <span className="text-xs font-semibold text-muted flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span className="text-muted">•</span>
              <span className="text-xs font-semibold text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-[1.15] mb-6">
              {post.title}
            </h1>

            <p className="text-body text-lg sm:text-xl leading-relaxed mb-8 font-normal">
              {post.excerpt}
            </p>

            {/* Author info & Share buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-rule">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-sage-300 text-sage-800 font-bold text-sm flex items-center justify-center">
                  {post.authorAvatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">
                    {post.author}
                  </div>
                  <div className="text-xs text-muted">
                    {post.authorRole}
                  </div>
                </div>
              </div>

              <ShareButtons title={post.title} slug={post.slug} />
            </div>
          </header>

          {/* Cover Media Image */}
          <section className="mb-16">
            <div className="w-full aspect-[21/9] rounded-[32px] overflow-hidden bg-sage-100 border border-rule shadow-sm">
              <img
                src={post.cover}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </section>

          {/* 2-Column Article Grid: Body + Sticky TOC */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start mb-24">
            {/* Left Main Article Column */}
            <article className="lg:col-span-8">
              <ArticleBody content={post.content} />

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-rule">
                <span className="text-xs font-bold uppercase tracking-wider text-muted self-center mr-2">
                  Tagged:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-full bg-white text-ink text-xs font-semibold border border-rule"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Author Bio Box */}
              <div className="bg-surface rounded-[28px] p-8 border border-rule mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-sage-300 text-sage-800 font-extrabold text-xl flex items-center justify-center shrink-0">
                  {post.authorAvatar}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
                    Written by
                  </span>
                  <h3 className="text-lg font-bold text-ink mb-1">
                    {post.author}
                  </h3>
                  <p className="text-xs text-sage-800 font-semibold mb-2">
                    {post.authorRole} at SiroTech Solutions
                  </p>
                  <p className="text-body text-xs sm:text-sm leading-relaxed">
                    Senior engineering practitioner specializing in high-concurrency systems, African digital infrastructure, and production software architectures.
                  </p>
                </div>
              </div>

              {/* Newsletter CTA Box */}
              <div className="bg-sage-700 rounded-[28px] p-8 sm:p-10 text-white mt-10 shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sage-200 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>Stay Informed</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Get Architecture Deep-Dives in Your Inbox
                </h3>
                <p className="text-sage-100 text-sm leading-relaxed mb-6">
                  We publish candid technical breakdowns on fintech rails, offline-first systems, and enterprise engineering once a month. No spam, ever.
                </p>
                <form
                  action="/api/newsletter"
                  method="POST"
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your work email address"
                    className="flex-1 px-5 py-3.5 rounded-full bg-white text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    Subscribe Free
                  </button>
                </form>
              </div>
            </article>

            {/* Right Sticky TOC Sidebar */}
            <aside className="lg:col-span-4 sticky top-28 space-y-8 hidden lg:block">
              {/* Table of Contents Box */}
              {post.toc && post.toc.length > 0 && (
                <div className="bg-surface rounded-[28px] p-7 border border-rule shadow-xs">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rule/60">
                    <List className="w-4 h-4 text-sage-700" />
                    <span className="text-xs font-bold uppercase tracking-widest text-ink">
                      Table of Contents
                    </span>
                  </div>

                  <nav className="space-y-2.5">
                    {post.toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-xs font-medium text-body hover:text-sage-800 transition-colors leading-snug ${
                          item.level === 3 ? "pl-3 text-muted" : ""
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Consultation Teaser Box */}
              <div className="bg-white rounded-[28px] p-7 border border-rule shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
                  Have a Similar Project?
                </span>
                <h4 className="text-base font-bold text-ink mb-2">
                  Engineer with SiroTech
                </h4>
                <p className="text-xs text-body leading-relaxed mb-5">
                  Discuss your technical constraints with our senior systems team in Nairobi.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-between w-full px-5 py-3 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors"
                >
                  <span>Request Consultation</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="mb-20 pt-16 border-t border-rule">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted block mb-1">
                    Further Reading
                  </span>
                  <h2 className="text-2xl font-bold text-ink">
                    Related Technical Articles
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:text-sage-800 transition-colors"
                >
                  <span>All Articles</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((rel) => (
                  <article
                    key={rel.slug}
                    className="group bg-surface rounded-[24px] border border-rule overflow-hidden hover:border-ink/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] overflow-hidden bg-sage-100">
                        <img
                          src={rel.cover}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-sage-800 block mb-2">
                          {rel.categoryLabel}
                        </span>
                        <Link href={`/blog/${rel.slug}`}>
                          <h3 className="text-base font-bold text-ink group-hover:text-sage-800 transition-colors mb-2 line-clamp-2 leading-snug">
                            {rel.title}
                          </h3>
                        </Link>
                        <p className="text-body text-xs leading-relaxed line-clamp-2">
                          {rel.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-rule/60 flex items-center justify-between text-xs">
                      <span className="text-muted">{rel.readingTime}</span>
                      <Link
                        href={`/blog/${rel.slug}`}
                        className="font-bold text-ink group-hover:text-sage-800 inline-flex items-center gap-1"
                      >
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Ready to build a resilient system with clean architecture?"
            description="Our senior engineers are ready to scope your roadmap, audit security boundaries, and deliver on time."
            primaryAction={{
              label: "Schedule Consultation",
              href: "/contact",
            }}
            secondaryAction={{
              label: "All Case Studies",
              href: "/work",
            }}
          />
        </Container>
      </main>
    </>
  );
}
