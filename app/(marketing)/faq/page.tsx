import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { getAllFaqGroups, getAllFaqItems } from "@/data/faq";
import {
  HelpCircle,
  CreditCard,
  GitBranch,
  Cpu,
  Headphones,
  ArrowRight,
  MessageSquare,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | SiroTech Solutions Nairobi",
  description:
    "Everything you need to know about partnering with SiroTech Solutions: pricing, sprint workflows, technical stacks, SLAs, and data security.",
  openGraph: {
    title: "FAQ & Engineering Guidelines | SiroTech Solutions",
    description:
      "Clear, transparent answers on project pricing, sprint delivery, technical capabilities, and production maintenance.",
    url: "https://sirotech.com/faq",
  },
};

const groupIcons: Record<string, any> = {
  general: HelpCircle,
  pricing: CreditCard,
  process: GitBranch,
  technical: Cpu,
  support: Headphones,
};

export default function FaqPage() {
  const groups = getAllFaqGroups();
  const allItems = getAllFaqItems();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
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
            <Breadcrumbs items={[{ label: "FAQ", href: "/faq" }]} />
          </div>

          {/* Hero Section */}
          <section className="mb-14">
            <div className="max-w-3xl mb-8">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                Clear Answers &amp; Guidance
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.08] mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                Everything you need to know about engaging our engineering studio: transparent milestone billing, sprint cadence, tech stack expertise, SLAs, and security standards.
              </p>
            </div>

            {/* Anchor navigation jump chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider mr-2 hidden sm:inline-block">
                Jump To:
              </span>
              {groups.map((group) => {
                const Icon = groupIcons[group.id] || HelpCircle;
                return (
                  <a
                    key={group.id}
                    href={`#${group.id}`}
                    className="px-4 py-2 rounded-full bg-white border border-rule text-xs font-bold text-ink hover:bg-sage-50 hover:border-ink/30 transition-all inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-sage-700" />
                    <span>{group.name}</span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* 5 Grouped FAQ Sections */}
          <div className="space-y-16 mb-24">
            {groups.map((group) => {
              const Icon = groupIcons[group.id] || HelpCircle;
              return (
                <section
                  key={group.id}
                  id={group.id}
                  className="scroll-mt-28 bg-surface rounded-[32px] border border-rule p-8 sm:p-12 hover:border-ink/20 transition-all"
                >
                  {/* Group Header */}
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rule">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sage-200 text-sage-900 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
                          {group.name}
                        </h2>
                        <p className="text-body text-xs sm:text-sm mt-0.5">
                          {group.description}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`#${group.id}`}
                      className="text-xs font-bold text-muted hover:text-ink transition-colors uppercase tracking-wider"
                    >
                      #{group.id}
                    </a>
                  </div>

                  {/* Accordion List */}
                  <Accordion type="single" collapsible className="space-y-4">
                    {group.items.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="bg-white rounded-2xl border border-rule/80 px-6 overflow-hidden transition-all data-[state=open]:border-ink/30 data-[state=open]:shadow-sm"
                      >
                        <AccordionTrigger className="text-left font-bold text-ink text-base sm:text-lg py-5 hover:no-underline hover:text-sage-800 cursor-pointer">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-body text-sm sm:text-base leading-relaxed pb-6 pt-1">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              );
            })}
          </div>

          {/* Quick Help Box */}
          <section className="mb-24 bg-white rounded-[32px] border border-rule p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-ink mb-3">
              Didn&apos;t find the answer you were looking for?
            </h3>
            <p className="text-body text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
              Speak directly with an engineering lead. We are available for technical discovery calls and quick WhatsApp chats.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-6 py-3.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors shadow-md inline-flex items-center gap-2"
              >
                <span>Send Us a Message</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/254700000000?text=Hi%20SiroTech%20team,%20I%20have%20a%20question%20about%20your%20engineering%20services"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-sage-100 text-sage-900 text-xs font-bold uppercase tracking-wider hover:bg-sage-200 transition-colors inline-flex items-center gap-2"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </section>

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Ready to kick off your project with an agile, high-ownership team?"
            description="Book an architectural discovery consultation to explore your technical requirements and receive a formal estimate."
            primaryAction={{
              label: "Schedule Consultation",
              href: "/contact",
            }}
            secondaryAction={{
              label: "Review Engagement Models",
              href: "/engagement",
            }}
          />
        </Container>
      </main>
    </>
  );
}
