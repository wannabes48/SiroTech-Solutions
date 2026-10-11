import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { getTestimonials } from "@/data/testimonials";
import {
  Star,
  Quote,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Client Testimonials & Reviews | SiroTech Solutions Nairobi",
  description:
    "Read verified reviews and feedback from founders, CTOs, and product directors who build scalable digital systems with SiroTech Solutions in Kenya and internationally.",
  openGraph: {
    title: "Client Testimonials & Partner Reviews | SiroTech Solutions",
    description:
      "Verified feedback from founders, product directors, and engineering leaders.",
    url: "https://sirotech.com/testimonials",
  },
};

export default async function TestimonialsPage() {
  const reviews = await getTestimonials();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": "https://sirotech.com/testimonials#list",
        name: "Client Testimonials for SiroTech Solutions",
        description:
          "Independent verified feedback from business leaders and founders.",
        itemListElement: reviews.map((rev, idx) => ({
          "@type": "Review",
          position: idx + 1,
          author: {
            "@type": "Person",
            name: rev.author,
            jobTitle: rev.role,
          },
          reviewBody: rev.quote,
          reviewRating: {
            "@type": "Rating",
            ratingValue: rev.rating || 5,
            bestRating: "5",
          },
          publisher: {
            "@type": "Organization",
            name: rev.source.name,
          },
        })),
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
            name: "Testimonials",
            item: "https://sirotech.com/testimonials",
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
            <Breadcrumbs items={[{ label: "Testimonials", href: "/testimonials" }]} />
          </div>

          {/* Hero */}
          <section className="mb-16">
            <div className="max-w-3xl">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                Client Proof & Trust
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-6">
                Endorsed by Founders & Engineering Leaders
              </h1>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                We measure our success by the production reliability, commercial growth, and operational leverage we deliver to our partners across East Africa and North America.
              </p>
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-10 border-t border-rule">
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">5.0 / 5.0</div>
                <div className="text-xs text-muted font-medium mt-1">Average Client Rating</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">100%</div>
                <div className="text-xs text-muted font-medium mt-1">On-Time Sprint Delivery</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">Nairobi &amp; US</div>
                <div className="text-xs text-muted font-medium mt-1">Global Coverage Zones</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">100%</div>
                <div className="text-xs text-muted font-medium mt-1">Verified Authenticity</div>
              </div>
            </div>
          </section>

          {/* Masonry Wall of Quote Cards */}
          <section className="mb-24">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="break-inside-avoid bg-surface rounded-[28px] p-8 border border-rule hover:border-ink/20 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Meta: Stars & Source */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating || 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted bg-white px-2.5 py-1 rounded-full border border-rule">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{review.source.name}</span>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-ink text-sm sm:text-base leading-relaxed mb-6 font-medium">
                      &ldquo;{review.quote}&rdquo;
                    </blockquote>
                  </div>

                  <div className="pt-5 border-t border-rule/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-ink text-sm">
                          {review.author}
                        </div>
                        <div className="text-xs text-body">
                          {review.role}, <span className="font-semibold text-ink">{review.company}</span>
                        </div>
                        <div className="text-[11px] text-muted mt-0.5">
                          {review.country} • {review.year}
                        </div>
                      </div>

                      {/* External Review Link if Available */}
                      {review.source.url && (
                        <a
                          href={review.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full bg-white border border-rule flex items-center justify-center text-muted hover:text-ink hover:border-ink transition-colors"
                          aria-label={`View verified review on ${review.source.name}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Linked Case Study Button */}
                    {review.projectSlug && (
                      <div className="mt-4 pt-3 border-t border-rule/40">
                        <Link
                          href={`/work/${review.projectSlug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-800 hover:text-ink transition-colors"
                        >
                          <span>Explore Related Case Study</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Ready to build a digital platform worth recommending?"
            description="Our senior engineers are ready to scope your requirements and construct a predictable roadmap."
            primaryAction={{
              label: "Schedule Technical Consultation",
              href: "/contact",
            }}
            secondaryAction={{
              label: "View All Case Studies",
              href: "/work",
            }}
          />
        </Container>
      </main>
    </>
  );
}
