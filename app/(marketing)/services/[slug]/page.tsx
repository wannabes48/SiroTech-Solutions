import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { CtaBand } from "@/components/ui/CtaBand";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { getServices, getService } from "@/data/services";
import { work } from "@/data/work";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Code2,
  Globe,
  Smartphone,
  Layout,
  ShoppingCart,
  BrainCircuit,
  Cloud,
  Network,
  Palette,
  ShieldAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "custom-software": Code2,
  "web-application-development": Globe,
  "mobile-apps": Smartphone,
  "website-design-and-development": Layout,
  "e-commerce": ShoppingCart,
  "ai-automation": BrainCircuit,
  "cloud-devops": Cloud,
  "api-development-and-integration": Network,
  "ui-ux-design": Palette,
  "qa-and-security-testing": ShieldAlert,
  "maintenance-and-support": Wrench,
};

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return { title: "Service Not Found" };

  return {
    title: `${s.seoTitle ?? s.title} | SiroTech Solutions`,
    description: s.seoDesc ?? s.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  // Find related case study
  const relatedCaseStudy =
    work.find((w) => w.slug === service.relatedCaseStudySlug) || work[0];

  // Get 3 other services (excluding current)
  const allServices = await getServices();
  const otherServices = allServices
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  // Schema.org JSON-LD (Service + FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `https://sirotech.com/services/${service.slug}#service`,
        name: service.title,
        description: service.summary,
        provider: {
          "@type": "Organization",
          name: "SiroTech Solutions",
          url: "https://sirotech.com",
        },
        areaServed: [
          { "@type": "Country", name: "Kenya" },
          { "@type": "Country", name: "East Africa" },
          { "@type": "Country", name: "US" },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `https://sirotech.com/services/${service.slug}#faq`,
        mainEntity: service.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-bg">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.title },
            ]}
            className="text-sage-100 justify-center mb-6 [&_span]:text-white [&_a]:text-sage-100"
          />
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Engineering Practice
          </span>
          <h1 className="text-display text-white mb-6 max-w-4xl mx-auto leading-tight">
            {service.title}
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            {service.intro}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/contact?service=${service.slug}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-sage-300 text-ink font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Scope This Service</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/book"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/30 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              Book Discovery Call
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1248px] mx-auto px-6 lg:px-10 space-y-28 py-20">
        {/* 2. Overview Narrative & Technology Chips */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-8 space-y-6">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block">
              Architectural Overview
            </span>
            <h2 className="text-h2 text-ink leading-tight">
              Why Strategic Engineering Matters Here.
            </h2>
            <p className="text-body text-base sm:text-lg leading-relaxed">
              {service.overview}
            </p>

            {/* Technologies Chips */}
            <div className="pt-6 border-t border-rule">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Core Technologies &amp; Standards
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {service.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface border border-rule text-xs font-semibold text-ink"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-700" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Scope Card (Right Sidebar) */}
          <div className="lg:col-span-4 bg-surface rounded-[28px] p-8 border border-rule space-y-6 shadow-xs sticky top-28">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-700 bg-sage-100 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Direct Engagement
            </div>
            <h3 className="text-xl font-bold text-ink">Ready to start?</h3>
            <p className="text-xs sm:text-sm text-body leading-relaxed">
              Every {service.title.toLowerCase()} engagement starts with a clear Statement of Work, guaranteed milestone delivery, and full IP ownership.
            </p>
            <div className="space-y-3 pt-2">
              <Link
                href={`/contact?service=${service.slug}`}
                className="w-full py-3.5 rounded-full bg-ink text-white font-bold text-xs uppercase tracking-wider hover:bg-sage-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Request Project Brief</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="w-full py-3 rounded-full bg-bg text-ink border border-rule font-semibold text-xs text-center block hover:bg-rule transition-colors"
              >
                View Pricing Baselines
              </Link>
            </div>
          </div>
        </section>

        {/* 3. What You Get (Deliverables Checklist) */}
        <section className="bg-surface rounded-[32px] p-8 sm:p-14 border border-rule">
          <div className="max-w-2xl mb-12">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
              Tangible Outcomes
            </span>
            <h2 className="text-h2 text-ink">What You Receive in Every Delivery</h2>
            <p className="text-body text-sm mt-3">
              Clear deliverables with zero ambiguity. Everything you need to operate, maintain, and scale your system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {service.deliverables.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-5 rounded-2xl bg-bg border border-rule/70"
              >
                <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
                <span className="text-ink text-sm font-semibold leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. How We Deliver (4-Step Strip) */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
              Execution Lifecycle
            </span>
            <h2 className="text-h2 text-ink">How We Deliver Your Project</h2>
            <p className="text-body text-sm mt-3">
              A structured 4-phase engineering cadence ensuring predictability and zero surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((p, idx) => (
              <div
                key={p.step}
                className="bg-surface rounded-[24px] p-7 border border-rule flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-full bg-sage-300 text-sage-800 text-xs font-bold flex items-center justify-center mb-6">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-ink mb-2">{p.step}</h3>
                  <p className="text-body text-xs sm:text-sm leading-relaxed">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Related Case Study Card */}
        {relatedCaseStudy && (
          <section className="bg-bg rounded-[32px] p-8 sm:p-12 border border-rule">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-muted text-xs font-bold uppercase tracking-widest block">
                  Related Case Study
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink">
                  {relatedCaseStudy.title}
                </h2>
                <p className="text-body text-sm leading-relaxed">
                  {relatedCaseStudy.summary}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/work/${relatedCaseStudy.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors"
                  >
                    <span>Read Full Case Study</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-surface border border-rule">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                    alt={relatedCaseStudy.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 6. FAQ Accordion */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
              Common Questions
            </span>
            <h2 className="text-h2 text-ink">Frequently Asked Questions</h2>
            <p className="text-body text-sm mt-2">
              Answers regarding our {service.title.toLowerCase()} process, pricing, and timelines.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="border-t border-rule"
          >
            {service.faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* 7. Other Services (3 Cards, Excluding Self) */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
              Complementary Capabilities
            </span>
            <h2 className="text-h2 text-ink">Other Engineering Services</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {otherServices.map((other) => {
              const Icon = iconMap[other.slug] || Code2;
              return (
                <ServiceCard
                  key={other.slug}
                  icon={Icon}
                  title={other.title}
                  description={other.summary}
                  href={`/services/${other.slug}`}
                />
              );
            })}
          </div>
        </section>

        {/* 8. CTA Band */}
        <section className="pt-6">
          <CtaBand
            headline={`Let's build your ${service.title.toLowerCase()}.`}
            description="Our senior engineers are ready to evaluate your requirements and deliver a transparent architectural proposal."
            primaryAction={{
              label: "Start a Project",
              href: `/contact?service=${service.slug}`,
            }}
            secondaryAction={{ label: "Book a Consultation", href: "/book" }}
          />
        </section>
      </div>
    </main>
  );
}
