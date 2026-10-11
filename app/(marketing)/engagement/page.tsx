import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { engagementModels, engagementFaqs } from "@/data/engagement";
import { CheckCircle2, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Engagement Models — Fixed Scope, Sprints & Retainers | SiroTech Solutions",
  description:
    "Choose the right collaboration model for your software project: Fixed Scope, Time & Materials Agile Sprints, or Monthly Engineering Retainers.",
};

export default function EngagementPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Header */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Engagement Models" },
            ]}
            className="text-sage-100 justify-center mb-6 [&_span]:text-white [&_a]:text-sage-100"
          />
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Flexible Collaboration Terms
          </span>
          <h1 className="text-display text-white mb-6 max-w-4xl mx-auto leading-tight">
            How We Partner With You
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            We adapt our engagement structures to match your funding stage, team velocity, and technical certainty. Zero rigid contracts.
          </p>
        </div>
      </div>

      <div className="max-w-[1248px] mx-auto px-6 lg:px-10 space-y-24 py-20">
        {/* Three Comparison Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {engagementModels.map((model) => (
            <div
              key={model.id}
              className={`bg-surface rounded-[28px] p-8 sm:p-10 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                model.isPopular
                  ? "border-sage-700 shadow-2xl ring-2 ring-sage-500/20"
                  : "border-rule hover:border-rule/80 hover:shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full ${
                      model.isPopular
                        ? "bg-sage-700 text-white"
                        : "bg-sage-100 text-sage-700"
                    }`}
                  >
                    {model.isPopular && <Sparkles className="w-3 h-3" />}
                    {model.badge}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-ink mb-2">{model.name}</h2>
                <p className="text-body text-xs sm:text-sm leading-relaxed mb-6">
                  {model.tagline}
                </p>

                {/* Typical Range */}
                <div className="mb-6 p-4 rounded-2xl bg-bg border border-rule/70">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Typical Investment Range
                  </div>
                  <div className="text-base font-bold text-ink">
                    {model.typicalRange.KES}
                  </div>
                  <div className="text-xs text-muted font-medium">
                    {model.typicalRange.USD}
                  </div>
                </div>

                {/* Best For */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    Best For:
                  </h3>
                  <p className="text-xs text-body leading-relaxed">{model.bestFor}</p>
                </div>

                {/* How Billing Works */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                    How Billing Works:
                  </h3>
                  <p className="text-xs text-body leading-relaxed">
                    {model.howBillingWorks}
                  </p>
                </div>

                {/* What is Included */}
                <div className="mb-8 pt-6 border-t border-rule">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
                    What is Included:
                  </h3>
                  <ul className="space-y-2.5">
                    {model.whatIsIncluded.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-ink font-medium">
                        <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={model.ctaHref}
                className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all ${
                  model.isPopular
                    ? "bg-sage-700 text-white hover:bg-sage-500 shadow-sm"
                    : "bg-ink text-white hover:bg-ink/85 shadow-sm"
                }`}
              >
                {model.ctaText}
              </Link>
            </div>
          ))}
        </section>

        {/* How We Decide Guidance Text */}
        <section className="bg-surface rounded-[32px] p-8 sm:p-14 border border-rule">
          <div className="max-w-3xl">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
              Decision Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-6">
              How We Help You Choose the Right Model
            </h2>
            <div className="space-y-4 text-body text-sm sm:text-base leading-relaxed">
              <p>
                During our initial discovery conversation, we analyze your technical certainty, internal team capacity, and funding milestones to recommend the lowest-risk engagement structure.
              </p>
              <p>
                If your project has clear visual wireframes and a well-defined backend schema, we always advocate for a <strong>Fixed Scope</strong> agreement because it shields your budget from timeline variance.
              </p>
              <p>
                If you are iterating based on live user feedback or integrating third-party APIs with unpredictable behavior, <strong>Agile Sprints</strong> prevent artificial change-order friction and let us deploy real features every two weeks.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
              Engagement Terms
            </span>
            <h2 className="text-h2 text-ink">Frequently Asked Questions</h2>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="border-t border-rule"
          >
            {engagementFaqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA Band */}
        <section className="pt-6">
          <CtaBand
            headline="Ready to discuss your project scope?"
            description="Our senior engineers are ready to walk you through recommendations and draft a tailored proposal."
            primaryAction={{ label: "Start Discovery", href: "/contact" }}
            secondaryAction={{ label: "Book a Consultation", href: "/book" }}
          />
        </section>
      </div>
    </main>
  );
}
