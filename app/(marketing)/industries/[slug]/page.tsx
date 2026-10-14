import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PillTag } from "@/components/ui/PillTag";
import { CtaBand } from "@/components/ui/CtaBand";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { getIndustries, getIndustry } from "@/data/industries";
import { getCaseStudies } from "@/data/work";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

export async function generateStaticParams() {
  const list = await getIndustries();
  return list.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustry(slug);

  if (!industry) {
    return { title: "Industry Not Found" };
  }

  return {
    title: `${industry.title} Software Engineering | SiroTech Solutions`,
    description: industry.summary,
    openGraph: {
      title: `${industry.title} Software Solutions | SiroTech`,
      description: industry.summary,
      url: `https://sirotech.vercel.app/industries/${industry.slug}`,
    },
  };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustry(slug);

  if (!industry) {
    notFound();
  }

  // Fetch linked case studies
  const allProjects = await getCaseStudies();
  const linkedProjects = allProjects.filter((p) =>
    industry.relevantCaseStudySlugs.includes(p.slug)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `https://sirotech.vercel.app/industries/${industry.slug}#service`,
        name: `${industry.title} Engineering Solutions`,
        description: industry.summary,
        provider: {
          "@type": "Organization",
          name: "SiroTech Solutions",
          url: "https://sirotech.vercel.app",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `https://sirotech.vercel.app/industries/${industry.slug}#faq`,
        mainEntity: industry.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
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
            item: "https://sirotech.vercel.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Industries",
            item: "https://sirotech.vercel.app/industries",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: industry.title,
            item: `https://sirotech.vercel.app/industries/${industry.slug}`,
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
                { label: "Industries", href: "/industries" },
                { label: industry.title, href: `/industries/${industry.slug}` },
              ]}
            />
          </div>

          {/* Hero */}
          <header className="mb-20">
            <div className="max-w-3xl mb-8">
              <PillTag variant="sage" className="mb-4">
                Sector Blueprint
              </PillTag>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-6">
                {industry.title}
              </h1>
              <p className="text-xl sm:text-2xl font-medium text-sage-800 mb-6">
                {industry.summary}
              </p>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                {industry.heroDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-rule">
              <Link
                href={`/contact?need=industry&industry=${industry.slug}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors shadow-sm"
              >
                <span>Schedule Sector Scoping Call</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider border border-rule hover:bg-sage-50 transition-colors"
              >
                <span>Explore Supporting Capabilities</span>
              </Link>
            </div>
          </header>

          {/* 1. Core Industry Challenges */}
          <section className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                Operational Friction
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink">
                Sector Challenges We Overcome
              </h2>
              <p className="text-body text-sm mt-3">
                Key technical, compliance, and logistical obstacles native to this operating domain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {industry.challenges.map((ch, idx) => (
                <div
                  key={idx}
                  className="bg-surface rounded-[28px] p-8 border border-rule hover:border-ink/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        Obstacle 0{idx + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-3 leading-snug">
                      {ch.title}
                    </h3>
                    <p className="text-body text-sm leading-relaxed">
                      {ch.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. How We Help (Mapped to Services) */}
          <section className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                Engineered Solutions
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink">
                How We Deliver Sector Advantage
              </h2>
              <p className="text-body text-sm mt-3">
                Tailored applications of our core engineering disciplines to eliminate your operational hurdles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {industry.howWeHelp.map((mapping, idx) => (
                <div
                  key={idx}
                  className="group bg-surface rounded-[32px] p-8 border border-rule hover:border-ink/20 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-sage-300 text-sage-800 flex items-center justify-center mb-6 font-bold text-xs">
                      0{idx + 1}
                    </div>

                    <Link href={`/services/${mapping.serviceSlug}`}>
                      <h3 className="text-xl font-bold text-ink group-hover:text-sage-800 transition-colors mb-3 leading-snug">
                        {mapping.serviceTitle}
                      </h3>
                    </Link>

                    <p className="text-body text-sm leading-relaxed mb-6">
                      {mapping.description}
                    </p>

                    <div className="space-y-2 mb-8 pt-4 border-t border-rule/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
                        Delivered Artifacts:
                      </span>
                      {mapping.deliverables.map((d, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs text-ink font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sage-700 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-rule/60">
                    <Link
                      href={`/services/${mapping.serviceSlug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-ink group-hover:text-sage-700 transition-colors"
                    >
                      <span>Explore Service Specs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Relevant Case Studies */}
          {linkedProjects.length > 0 && (
            <section className="mb-24">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                  Verified Deployments
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-ink">
                  Related Sector Case Studies
                </h2>
                <p className="text-body text-sm mt-3">
                  Production systems and winning prototypes deployed in or adjacent to this industry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {linkedProjects.map((project) => (
                  <article
                    key={project.slug}
                    className="bg-surface rounded-[32px] p-8 sm:p-10 border border-rule hover:border-ink/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <PillTag variant="sage">{project.industry}</PillTag>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">
                          {project.buildType} Build
                        </span>
                      </div>

                      <Link href={`/work/${project.slug}`}>
                        <h3 className="text-2xl font-bold text-ink hover:text-sage-800 transition-colors mb-2">
                          {project.title}
                        </h3>
                      </Link>

                      <p className="text-body text-sm leading-relaxed mb-6">
                        {project.summary}
                      </p>

                      <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-bg border border-rule mb-6">
                        {project.metrics.slice(0, 2).map((m, mIdx) => (
                          <div key={mIdx}>
                            <div className="text-2xl font-extrabold text-ink tabular-nums">
                              {m.value}
                            </div>
                            <div className="text-[11px] font-medium text-muted uppercase tracking-wider">
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-rule/60 flex items-center justify-between">
                      <Link
                        href={`/work/${project.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink hover:text-sage-800 transition-colors"
                      >
                        <span>Read Case Study</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* 4. Domain FAQ Accordion */}
          <section className="mb-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl font-bold text-ink">
                Common Inquiries for {industry.title}
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {industry.faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="bg-surface rounded-[24px] px-8 py-2 border border-rule"
                >
                  <AccordionTrigger className="text-left font-bold text-ink text-base py-6 hover:no-underline hover:text-sage-800">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-body text-sm leading-relaxed pb-6 pt-1">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* 5. Bottom CtaBand */}
          <CtaBand
            headline={`Ready to build a competitive edge in ${industry.title}?`}
            description="Our senior engineers are ready to scope your regulatory requirements, draft technical specifications, and establish a predictable delivery roadmap."
            primaryAction={{
              label: "Schedule Consultation",
              href: `/contact?need=industry&industry=${industry.slug}`,
            }}
            secondaryAction={{
              label: "Explore All Industries",
              href: "/industries",
            }}
          />
        </Container>
      </main>
    </>
  );
}
