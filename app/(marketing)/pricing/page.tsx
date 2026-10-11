"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Check, ArrowRight, Sparkles, HelpCircle, ShieldCheck, CreditCard, ChevronDown } from "lucide-react";
import Link from "next/link";
import { projectPricingTiers, carePlans, pricingFaqs } from "@/data/pricing";

export default function PricingPage() {
  const [currency, setCurrency] = useState<"KES" | "USD" | "CAD">("KES");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Header */}
      <div className="bg-sage-700">
        <Navbar />
        <section className="max-w-[1200px] mx-auto px-6 lg:px-10 py-20 lg:py-28 text-center">
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
            Transparent Pricing Structure
          </span>
          <h1 className="text-display text-white mb-6 max-w-4xl mx-auto">
            Flat, Value-Focused Project Pricing
          </h1>
          <p className="text-white/85 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            We focus on the tangible business outcome and architectural quality delivered, not unpredictable hourly meters.
          </p>

          {/* Currency Switcher */}
          <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-full p-1.5 border border-white/20">
            {(["KES", "USD", "CAD"] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  currency === curr
                    ? "bg-white text-ink shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {curr === "KES" ? "KES (KSh)" : curr === "USD" ? "USD ($)" : "CAD (C$)"}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Main Project Tiers */}
      <section className="max-w-[1248px] mx-auto px-6 lg:px-10 py-20 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {projectPricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-surface rounded-[24px] p-7 border flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                tier.isPopular
                  ? "border-sage-700 shadow-2xl ring-2 ring-sage-500/30"
                  : "border-rule hover:border-rule/80 hover:shadow-lg"
              }`}
            >
              {tier.badge && (
                <div
                  className={`inline-flex items-center gap-1 self-start text-[11px] font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-4 ${
                    tier.isPopular
                      ? "bg-sage-700 text-white"
                      : "bg-sage-100 text-sage-700"
                  }`}
                >
                  {tier.isPopular && <Sparkles className="w-3 h-3" />}
                  {tier.badge}
                </div>
              )}

              <h2 className="text-xl font-bold text-ink mb-2">{tier.name}</h2>
              <p className="text-body text-xs leading-relaxed mb-6 min-h-[48px]">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-rule">
                <div className="text-2xl font-extrabold text-ink tracking-tight">
                  {tier.prices[currency].display}
                </div>
                <div className="text-muted text-xs mt-1 font-medium">
                  Estimated timeline: <span className="text-ink font-semibold">{tier.timeline}</span>
                </div>
              </div>

              {/* Scope highlight */}
              <div className="bg-bg/80 rounded-xl p-3 border border-rule/60 mb-6 text-xs text-body leading-relaxed">
                <span className="font-semibold text-ink">Scope: </span>
                {tier.scope}
              </div>

              {/* Deliverables */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                    <span className="text-ink text-xs font-medium leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all ${
                  tier.isPopular
                    ? "bg-sage-700 text-white hover:bg-sage-500 shadow-sm"
                    : "bg-ink text-white hover:bg-ink/85 shadow-sm"
                }`}
              >
                {tier.ctaText}
              </Link>
            </div>
          ))}
        </div>

        {/* Payment Assurance Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 p-8 rounded-[24px] bg-surface border border-rule">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sage-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink mb-1">50/50 Milestone Model</h4>
              <p className="text-xs text-body leading-relaxed">
                50% deposit to commence architecture, 50% only upon full acceptance and deployment.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sage-300 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink mb-1">Local &amp; Global Payments</h4>
              <p className="text-xs text-body leading-relaxed">
                Pay seamlessly via M-Pesa (Till/Paybill), Kenyan bank transfers, or international cards.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sage-300 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink mb-1">100% Code Ownership</h4>
              <p className="text-xs text-body leading-relaxed">
                You retain full copyright and ownership of all repositories, databases, and assets.
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Maintenance Plans */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="text-muted text-xs font-bold uppercase tracking-wider mb-2 block">
              Ongoing Peace of Mind
            </span>
            <h2 className="text-h2 text-ink mb-4">Maintenance &amp; Support Retainers</h2>
            <p className="text-body text-sm max-w-xl mx-auto">
              Keep your software secure, monitored, updated, and continuously optimized with dedicated monthly hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {carePlans.map((plan) => (
              <div
                key={plan.name}
                className="bg-surface rounded-[24px] p-8 border border-rule flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-bold text-ink mb-2">{plan.name}</h3>
                  <p className="text-body text-sm mb-6">{plan.description}</p>
                  <div className="text-3xl font-extrabold text-ink mb-8">
                    {plan.price[currency]}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                        <span className="text-ink text-sm font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/contact?interest=maintenance"
                  className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-center bg-bg border border-rule text-ink hover:bg-ink hover:text-white transition-colors"
                >
                  Subscribe to Plan
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-ink mb-3">Frequently Asked Questions</h2>
            <p className="text-body text-sm">
              Everything you need to know about billing, timelines, and deliverables.
            </p>
          </div>

          <div className="divide-y divide-rule border-y border-rule">
            {pricingFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <span className="text-base font-semibold text-ink group-hover:text-sage-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-ink transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-3 pr-6 text-sm text-body leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Consultation Banner */}
        <div className="bg-sage-100 rounded-[32px] p-10 sm:p-14 border border-sage-300 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
              Need a tailored project estimate?
            </h3>
            <p className="text-body text-sm sm:text-base leading-relaxed">
              Every system is unique. Share your project requirements and we will send you a transparent, itemized proposal within 24 hours.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 flex-wrap justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ink text-white font-semibold text-sm hover:bg-ink/85 transition-colors shadow-sm"
            >
              Request Custom Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center px-7 py-3.5 rounded-full bg-white text-ink border border-rule font-semibold text-sm hover:bg-surface transition-colors"
            >
              Book a Call
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
