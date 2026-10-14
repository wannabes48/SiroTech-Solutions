import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { ReadMore } from "@/components/shared/read-more";
import { industries } from "@/data/industries";
import {
  Landmark,
  ShoppingBag,
  Leaf,
  HeartPulse,
  GraduationCap,
  Globe2,
  Truck,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Industries & Sector Specializations | SiroTech Solutions Nairobi",
  description:
    "Domain-specific software engineering for FinTech, Retail, AgriTech, Healthcare, EdTech, NGOs, Logistics, and Real Estate across Kenya and global markets.",
  openGraph: {
    title: "Industries We Serve | SiroTech Solutions Nairobi",
    description:
      "Enterprise systems engineered around regulatory, operational, and commercial sector constraints.",
    url: "https://sirotech.vercel.app/industries",
  },
};

const iconMap: Record<string, LucideIcon> = {
  Landmark,
  ShoppingBag,
  Leaf,
  HeartPulse,
  GraduationCap,
  Globe2,
  Truck,
  Building2,
};

export default function IndustriesIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://sirotech.vercel.app/industries#page",
        name: "Industries & Sector Solutions | SiroTech Solutions",
        description:
          "Software architectures engineered for domain-specific constraints across 8 core industries.",
        url: "https://sirotech.vercel.app/industries",
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
            name: "Industries",
            item: "https://sirotech.vercel.app/industries",
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
            <Breadcrumbs items={[{ label: "Industries", href: "/industries" }]} />
          </div>

          {/* Page Hero */}
          <section className="mb-16">
            <div className="max-w-3xl">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                Industry Verticals
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-6">
                Software Engineered for Sector Reality
              </h1>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                Generic templates fail when confronted with actual business friction. We architect digital systems around industry compliance rules, localized payment behaviors, offline field realities, and peak transaction surges.
              </p>
            </div>

            {/* Quick Proof Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-10 border-t border-rule">
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">8 Sectors</div>
                <div className="text-xs text-muted font-medium mt-1">Deep Domain Blueprints</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">100% CBK &amp; DPA</div>
                <div className="text-xs text-muted font-medium mt-1">Regulatory Compliance</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">Offline-First</div>
                <div className="text-xs text-muted font-medium mt-1">Remote Field Caching</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-ink tabular-nums">Full IP</div>
                <div className="text-xs text-muted font-medium mt-1">Zero SaaS Lock-In</div>
              </div>
            </div>
          </section>

          {/* 8 Industries Grid */}
          <section className="mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.map((ind) => {
                const Icon = iconMap[ind.icon] || Landmark;

                return (
                  <article
                    key={ind.slug}
                    className="group bg-surface rounded-[32px] p-8 sm:p-10 border border-rule hover:border-ink/20 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Icon Circle */}
                      <div className="w-14 h-14 rounded-full bg-sage-300 text-sage-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-sage-800" />
                      </div>

                      {/* Title */}
                      <Link href={`/industries/${ind.slug}`}>
                        <h2 className="text-2xl font-bold text-ink group-hover:text-sage-800 transition-colors mb-3 leading-snug">
                          {ind.title}
                        </h2>
                      </Link>

                      {/* Summary */}
                      <p className="text-body text-sm leading-relaxed mb-6">
                        {ind.summary}
                      </p>

                      {/* Challenges Addressed Preview */}
                      <div className="space-y-2 mb-8 pt-4 border-t border-rule/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
                          Domain Challenges Solved:
                        </span>
                        {ind.challenges.slice(0, 2).map((ch, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-ink font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sage-700 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{ch.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Link */}
                    <div className="pt-6 border-t border-rule/60 flex items-center justify-between">
                      <ReadMore
                        href={`/industries/${ind.slug}`}
                        label="Explore Sector Capabilities"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Operating in a specialized industry with complex constraints?"
            description="Our senior system architects are ready to review your regulatory boundaries, integrate with legacy databases, and build a scalable solution."
            primaryAction={{
              label: "Schedule Industry Consultation",
              href: "/contact",
            }}
            secondaryAction={{
              label: "Explore All 11 Services",
              href: "/services",
            }}
          />
        </Container>
      </main>
    </>
  );
}
