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
import { getSolutions, getSolution } from "@/data/solutions";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Cloud,
  Server,
  Layers,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react";

export async function generateStaticParams() {
  const all = await getSolutions();
  return all.filter((s) => s.published).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolution(slug);

  if (!solution || !solution.published) {
    return { title: "Solution Not Found" };
  }

  return {
    title: `${solution.title} | Software Solution | SiroTech Solutions`,
    description: solution.summary,
    openGraph: {
      title: `${solution.title} - ${solution.tagline} | SiroTech`,
      description: solution.summary,
      url: `https://sirotech.com/solutions/${solution.slug}`,
    },
  };
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = await getSolution(slug);

  if (!solution || !solution.published) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `https://sirotech.com/solutions/${solution.slug}#app`,
        name: solution.title,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Cloud / Web / Linux",
        description: solution.summary,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Custom project deployment and licensing quote",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `https://sirotech.com/solutions/${solution.slug}#faq`,
        mainEntity: solution.faqs.map((faq) => ({
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
            item: "https://sirotech.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Solutions",
            item: "https://sirotech.com/solutions",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: solution.title,
            item: `https://sirotech.com/solutions/${solution.slug}`,
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
                { label: "Solutions", href: "/solutions" },
                { label: solution.title, href: `/solutions/${solution.slug}` },
              ]}
            />
          </div>

          {/* Hero: What it is & Who it is for */}
          <header className="mb-20">
            <div className="max-w-3xl mb-10">
              <div className="flex items-center gap-3 mb-4">
                <PillTag variant="sage">Architecture Engine</PillTag>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Live Interactive Demo Available</span>
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-4">
                {solution.title}
              </h1>
              <p className="text-xl sm:text-2xl font-medium text-sage-800 mb-6">
                {solution.tagline}
              </p>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                {solution.summary}
              </p>
            </div>

            {/* Target Audience & Purpose Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-surface rounded-[28px] p-8 border border-rule">
                <span className="text-xs font-bold uppercase tracking-widest text-muted block mb-2">
                  What It Is
                </span>
                <p className="text-body text-sm sm:text-base leading-relaxed">
                  {solution.whatItIs}
                </p>
              </div>

              <div className="bg-surface rounded-[28px] p-8 border border-rule">
                <span className="text-xs font-bold uppercase tracking-widest text-muted block mb-2">
                  Who It Is For
                </span>
                <p className="text-body text-sm sm:text-base leading-relaxed">
                  {solution.whoItIsFor}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-rule">
              <Link
                href={`/contact?need=demo&solution=${solution.slug}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors shadow-sm"
              >
                <span>Request a Guided Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider border border-rule hover:bg-sage-50 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book 30-Min Walkthrough</span>
              </Link>
            </div>
          </header>

          {/* 1. Modules Grid */}
          <section className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                System Composition
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink">
                Modular Architecture Components
              </h2>
              <p className="text-body text-sm mt-3">
                Pre-tested functional building blocks assembled into your tailored operational platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {solution.modules.map((mod, idx) => (
                <div
                  key={idx}
                  className="bg-surface rounded-[28px] p-8 border border-rule hover:border-ink/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-sage-300 text-sage-800 flex items-center justify-center font-bold text-xs mb-6">
                      0{idx + 1}
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-3 leading-snug">
                      {mod.title}
                    </h3>
                    <p className="text-body text-sm leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Key Features Spotlight */}
          <section className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                Engineering Highlights
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink">
                Built for High Concurrency &amp; Reliability
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {solution.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-surface rounded-[28px] p-8 border border-rule flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center shrink-0 mt-1">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-body text-sm leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Deployment Options (Hosted vs Self-Hosted) */}
          <section className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                Infrastructure Flexibility
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink">
                Deployment &amp; Hosting Options
              </h2>
              <p className="text-body text-sm mt-3">
                Choose the infrastructure model that fits your organization&apos;s data compliance rules.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Option A: Managed Cloud */}
              <div className="bg-surface rounded-[32px] p-8 sm:p-10 border border-rule flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-sage-300 text-sage-800 flex items-center justify-center">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                        Option A
                      </span>
                      <h3 className="text-2xl font-bold text-ink">
                        {solution.deploymentOptions.cloud.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-body text-sm leading-relaxed mb-8">
                    {solution.deploymentOptions.cloud.description}
                  </p>

                  <div className="space-y-3 pt-6 border-t border-rule/60 mb-8">
                    {solution.deploymentOptions.cloud.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-ink">
                        <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-rule/60">
                  <span className="text-xs text-muted block">
                    Recommended for fast launches with minimal internal DevOps overhead.
                  </span>
                </div>
              </div>

              {/* Option B: Self-Hosted / On-Premise */}
              <div className="bg-surface rounded-[32px] p-8 sm:p-10 border border-rule flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                        Option B
                      </span>
                      <h3 className="text-2xl font-bold text-ink">
                        {solution.deploymentOptions.selfHosted.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-body text-sm leading-relaxed mb-8">
                    {solution.deploymentOptions.selfHosted.description}
                  </p>

                  <div className="space-y-3 pt-6 border-t border-rule/60 mb-8">
                    {solution.deploymentOptions.selfHosted.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-ink">
                        <CheckCircle2 className="w-4 h-4 text-ink shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-rule/60">
                  <span className="text-xs text-muted block">
                    Ideal for banks, healthcare providers, and firms with on-premise data residency mandates.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Interface Screenshots */}
          {solution.screenshots && solution.screenshots.length > 0 && (
            <section className="mb-24">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                  System Previews
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-ink">
                  Interface &amp; Console Walkthrough
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {solution.screenshots.map((s, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-[28px] bg-surface border border-rule shadow-sm"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-sage-100">
                      <img
                        src={s.url}
                        alt={s.caption}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-sm font-bold text-ink">{s.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Request a Demo CTA Box */}
          <section className="mb-24">
            <div className="bg-sage-700 rounded-[32px] p-10 sm:p-16 text-center text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl mx-auto relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-sage-200 block mb-3">
                  Inspect the Live System
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Schedule a Live Demo of {solution.title}
                </h2>
                <p className="text-sage-100 text-base sm:text-lg mb-8 leading-relaxed">
                  Join our technical architects for a live 30-minute demonstration. We&apos;ll walk you through the codebase, database design, and tailoring options for your workflows.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={`/contact?need=demo&solution=${solution.slug}`}
                    className="px-8 py-4 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-100 transition-colors inline-flex items-center gap-2"
                  >
                    <span>Request Live Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/book"
                    className="px-8 py-4 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <span>Direct Calendar Booking</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 6. FAQ Accordion */}
          {solution.faqs && solution.faqs.length > 0 && (
            <section className="mb-24 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
                  Frequently Asked Questions
                </span>
                <h2 className="text-3xl font-bold text-ink">
                  Everything You Need to Know About {solution.title}
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {solution.faqs.map((faq, idx) => (
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
          )}

          {/* 7. Bottom CtaBand */}
          <CtaBand
            headline={`Ready to deploy ${solution.title}?`}
            description="Accelerate your operational roadmap with a production-ready codebase engineered for scale."
            primaryAction={{
              label: "Request Scoping Call",
              href: `/contact?need=demo&solution=${solution.slug}`,
            }}
            secondaryAction={{
              label: "All Solutions",
              href: "/solutions",
            }}
          />
        </Container>
      </main>
    </>
  );
}
