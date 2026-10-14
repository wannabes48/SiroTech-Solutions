import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PillTag } from "@/components/ui/PillTag";
import { CtaBand } from "@/components/ui/CtaBand";
import { ReadMore } from "@/components/shared/read-more";
import { getSolutions } from "@/data/solutions";
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Productised Solutions & Frameworks | SiroTech Solutions Nairobi",
  description:
    "Pre-architected, production-tested software frameworks for ERP, CRM client portals, FinTech M-Pesa rails, AgriTech field suites, and fleet logistics.",
  openGraph: {
    title: "Productised Solutions & Architecture Engines | SiroTech",
    description:
      "Accelerate your deployment timeline by 60% with pre-engineered enterprise software cores.",
    url: "https://sirotech.vercel.app/solutions",
  },
};

export default async function SolutionsIndexPage() {
  const allSolutions = await getSolutions();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://sirotech.vercel.app/solutions#page",
        name: "Productised Software Solutions | SiroTech Solutions",
        description:
          "Pre-architected digital engines delivering rapid time-to-market without compromising code quality.",
        url: "https://sirotech.vercel.app/solutions",
        isPartOf: {
          "@type": "WebSite",
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
            name: "Solutions",
            item: "https://sirotech.vercel.app/solutions",
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
            <Breadcrumbs items={[{ label: "Solutions", href: "/solutions" }]} />
          </div>

          {/* Page Hero */}
          <section className="mb-16">
            <div className="max-w-3xl">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                Pre-Architected Platforms
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-6">
                Proven Software Engines. Deployed in Weeks.
              </h1>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                Why start from a blank canvas? Our solution frameworks give your enterprise battle-tested database schemas, security hardening, and integration plumbing—allowing us to customize and launch your proprietary system in half the time.
              </p>
            </div>

            {/* Quick Proof Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-10 border-t border-rule">
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">60% Faster</div>
                <div className="text-xs text-muted font-medium mt-1">Accelerated Time-to-Market</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">100% Owned</div>
                <div className="text-xs text-muted font-medium mt-1">Full IP Source Code Handover</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">Zero Lock-In</div>
                <div className="text-xs text-muted font-medium mt-1">Deploy Cloud or On-Premise</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">Live Demos</div>
                <div className="text-xs text-muted font-medium mt-1">Inspect Working Systems</div>
              </div>
            </div>
          </section>

          {/* Solutions 10-Card Grid */}
          <section className="mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allSolutions.map((sol) => (
                <article
                  key={sol.slug}
                  className="group bg-surface rounded-[32px] p-8 sm:p-10 border border-rule hover:border-ink/20 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Status Badge Row */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        {sol.category}
                      </span>
                      {sol.published ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Demo Ready</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Private Beta</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Tagline */}
                    {sol.published ? (
                      <Link href={`/solutions/${sol.slug}`}>
                        <h2 className="text-2xl font-bold text-ink group-hover:text-sage-800 transition-colors mb-2 leading-snug">
                          {sol.title}
                        </h2>
                      </Link>
                    ) : (
                      <h2 className="text-2xl font-bold text-ink mb-2 leading-snug">
                        {sol.title}
                      </h2>
                    )}

                    <p className="text-xs font-semibold text-sage-800 mb-4 line-clamp-1">
                      {sol.tagline}
                    </p>

                    <p className="text-body text-sm leading-relaxed mb-6 line-clamp-3">
                      {sol.summary}
                    </p>

                    {/* Modules Checklist Preview */}
                    <div className="space-y-2 mb-8 pt-4 border-t border-rule/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
                        Included Core Modules:
                      </span>
                      {sol.modules.slice(0, 3).map((mod, mIdx) => (
                        <div key={mIdx} className="flex items-start gap-2 text-xs text-ink font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sage-700 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{mod.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-6 border-t border-rule/60 flex items-center justify-between">
                    {sol.published ? (
                      <ReadMore
                        href={`/solutions/${sol.slug}`}
                        label="View Architecture & Demo"
                      />
                    ) : (
                      <Link
                        href={`/contact?need=solution_access&solution=${sol.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-purple-900 hover:text-ink transition-colors"
                      >
                        <span>Inquire Early Access</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Need a custom configuration of our solution frameworks?"
            description="We regularly tailor and combine our systems to build bespoke operational platforms for enterprise clients across East Africa."
            primaryAction={{
              label: "Schedule Technical Demo",
              href: "/contact?need=demo",
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
