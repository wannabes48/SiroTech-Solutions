import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PillTag } from "@/components/ui/PillTag";
import { CtaBand } from "@/components/ui/CtaBand";
import {
  getOpenRoles,
  getBenefits,
  getCulturePillars,
} from "@/data/careers";
import { JobApplicationForm } from "@/components/careers/JobApplicationForm";
import {
  Laptop,
  Compass,
  ShieldCheck,
  BookOpen,
  HeartPulse,
  TrendingUp,
  MapPin,
  Briefcase,
  ArrowRight,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Careers & Engineering Culture | SiroTech Solutions Nairobi",
  description:
    "Join our high-ownership software engineering studio in Nairobi. We build high-throughput payment rails, offline-first mobile apps, and enterprise cloud architectures.",
  openGraph: {
    title: "Careers at SiroTech Solutions | Software Engineering Studio",
    description:
      "High autonomy, competitive compensation, top-tier hardware, and zero corporate fluff. Explore open engineering roles.",
    url: "https://sirotech.com/careers",
  },
};

const iconMap: Record<string, any> = {
  Laptop,
  Compass,
  ShieldCheck,
  BookOpen,
  HeartPulse,
  TrendingUp,
};

export default function CareersIndexPage() {
  const roles = getOpenRoles();
  const benefits = getBenefits();
  const culture = getCulturePillars();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://sirotech.com/careers#webpage",
        name: "Careers at SiroTech Solutions",
        description:
          "Open engineering positions, culture, and benefits at SiroTech Solutions in Nairobi, Kenya.",
        url: "https://sirotech.com/careers",
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
            name: "Careers",
            item: "https://sirotech.com/careers",
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
            <Breadcrumbs items={[{ label: "Careers", href: "/careers" }]} />
          </div>

          {/* Hero Section */}
          <section className="mb-20">
            <div className="max-w-4xl">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                Careers at SiroTech
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.08] mb-6">
                Build Mission-Critical Software With Nairobi&apos;s Top Engineering Talent.
              </h1>
              <p className="text-body text-base sm:text-lg leading-relaxed max-w-3xl mb-8">
                We are an independent engineering studio solving hard technical problems: resilient payment switches, offline-first sync engines, and distributed cloud backends. We operate with high ownership, zero corporate theatre, and deep respect for the craft.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#open-roles"
                  className="px-6 py-3.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors shadow-md inline-flex items-center gap-2"
                >
                  <span>Explore Open Roles ({roles.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#culture"
                  className="px-6 py-3.5 rounded-full bg-white border border-rule text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-50 transition-colors"
                >
                  Our Culture &amp; Values
                </a>
              </div>
            </div>
          </section>

          {/* Culture Block (3 Points) */}
          <section id="culture" className="mb-24 scroll-mt-28">
            <div className="mb-12">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                Engineering Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">
                How We Build &amp; Work
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {culture.map((pillar) => (
                <div
                  key={pillar.number}
                  className="bg-surface rounded-[32px] border border-rule p-8 sm:p-10 flex flex-col justify-between hover:border-ink/20 hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-sage-200 text-sage-900 font-extrabold text-sm flex items-center justify-center mb-6">
                      {pillar.number}
                    </div>
                    <h3 className="text-2xl font-bold text-ink mb-2">
                      {pillar.title}
                    </h3>
                    <div className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-4">
                      {pillar.subtitle}
                    </div>
                    <p className="text-body text-sm leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits Grid */}
          <section className="mb-24">
            <div className="mb-12">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                Studio Compensation &amp; Perks
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">
                Engineered for Long-Term Fulfillment
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => {
                const IconComponent = iconMap[b.icon] || Sparkles;
                return (
                  <div
                    key={b.title}
                    className="bg-white rounded-[28px] border border-rule p-8 hover:border-ink/20 hover:shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-800 mb-6">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-ink mb-2">
                      {b.title}
                    </h3>
                    <p className="text-body text-xs sm:text-sm leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Open Roles Section */}
          <section id="open-roles" className="mb-24 scroll-mt-28">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                  Current Openings
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">
                  Join Our Engineering Team
                </h2>
              </div>
              <div className="text-xs font-bold text-sage-800 uppercase tracking-wider">
                {roles.length} Positions Available
              </div>
            </div>

            {roles.length > 0 ? (
              <div className="space-y-6">
                {roles.map((role) => (
                  <div
                    key={role.slug}
                    className="group bg-surface rounded-[32px] border border-rule p-8 sm:p-10 hover:border-ink/30 hover:shadow-lg transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                  >
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs font-semibold text-muted">
                        <span className="px-3 py-1 rounded-full bg-sage-100 text-sage-800 font-bold uppercase tracking-wider">
                          {role.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {role.type}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {role.location}
                        </span>
                      </div>

                      <Link href={`/careers/${role.slug}`}>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-ink group-hover:text-sage-800 transition-colors mb-3">
                          {role.title}
                        </h3>
                      </Link>

                      <p className="text-body text-sm sm:text-base leading-relaxed mb-6">
                        {role.summary}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {role.technologies.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 rounded-full bg-white border border-rule text-xs font-medium text-ink"
                          >
                            {tech}
                          </span>
                        ))}
                        {role.technologies.length > 5 && (
                          <span className="px-3 py-1 rounded-full bg-transparent text-xs font-medium text-muted">
                            +{role.technologies.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
                      <div className="text-left lg:text-right">
                        <div className="text-[11px] font-bold text-muted uppercase tracking-wider">
                          Compensation
                        </div>
                        <div className="text-sm font-bold text-ink">
                          {role.salary}
                        </div>
                      </div>

                      <Link
                        href={`/careers/${role.slug}`}
                        className="px-6 py-3 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors inline-flex items-center gap-2 shadow-xs"
                      >
                        <span>View Role &amp; Apply</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-[32px] border border-rule p-12 text-center max-w-xl mx-auto">
                <Users className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold text-ink mb-2">No Active Openings Right Now</h3>
                <p className="text-body text-sm mb-6">
                  We are not actively advertising specific roles, but we always welcome conversations with exceptional systems engineers. Submit a general inquiry below.
                </p>
              </div>
            )}
          </section>

          {/* General Application Fallback Form */}
          <section className="mb-24">
            <div className="max-w-3xl mx-auto">
              <JobApplicationForm
                heading="Spontaneous Application / General Talent Inquiry"
                subheading="Don't see a position that matches your exact profile? Send us your portfolio, GitHub, or background. We keep high-caliber engineering leads on file for immediate outreach."
              />
            </div>
          </section>

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Looking to hire our studio for your technical project instead?"
            description="Our engineers architect high-throughput web apps, mobile systems, and enterprise portals."
            primaryAction={{
              label: "Discuss Your Project",
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
