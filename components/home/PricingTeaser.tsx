"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { projectPricingTiers } from "@/data/pricing";
import { useCurrency, type Currency } from "@/hooks/useCurrency";

export default function PricingTeaser() {
  const { currency, setCurrency } = useCurrency("KES");
  // Select top 3 featured plans for the homepage
  const featuredPlans = projectPricingTiers.slice(0, 3);

  return (
    <section className="py-24 bg-surface border-t border-rule">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="text-muted text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Project-Based Pricing
          </span>
          <h2 className="text-h2 text-ink mb-4">
            Transparent Investment, Focused on Value
          </h2>
          <p className="text-body text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Flat, value-based project pricing based on measurable commercial deliverables rather than ambiguous hourly rates.
          </p>

          {/* Cookie-Persisted Currency Toggle */}
          <div className="inline-flex items-center gap-1 bg-bg rounded-full p-1.5 border border-rule shadow-xs">
            {(["KES", "USD", "CAD"] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  currency === curr
                    ? "bg-ink text-white shadow-sm"
                    : "text-muted hover:text-ink hover:bg-surface"
                }`}
              >
                {curr === "KES" ? "KES (KSh)" : curr === "USD" ? "USD ($)" : "CAD (C$)"}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Featured Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {featuredPlans.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-bg rounded-[24px] p-8 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                tier.isPopular
                  ? "border-sage-700 shadow-2xl ring-2 ring-sage-500/20"
                  : "border-rule hover:border-rule/80 hover:shadow-lg"
              }`}
            >
              <div>
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

                <h3 className="text-2xl font-bold text-ink mb-2">{tier.name}</h3>
                <p className="text-body text-xs sm:text-sm leading-relaxed mb-6 min-h-[40px]">
                  {tier.scope}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-rule">
                  <div className="text-3xl font-extrabold text-ink tracking-tight">
                    {tier.prices[currency].display}
                  </div>
                  <div className="text-muted text-xs mt-1 font-medium">
                    Estimated delivery: <span className="text-ink font-semibold">{tier.timeline}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {tier.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                      <span className="text-ink text-xs sm:text-sm font-medium leading-snug">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={tier.ctaHref}
                className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all ${
                  tier.isPopular
                    ? "bg-sage-700 text-white hover:bg-sage-500 shadow-sm"
                    : "bg-surface text-ink border border-rule hover:bg-ink hover:text-white"
                }`}
              >
                {tier.ctaText}
              </Link>
            </div>
          ))}
        </div>

        {/* View All Pricing & Maintenance Plans */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-ink font-semibold hover:text-sage-700 transition-colors text-sm"
          >
            <span>Compare all 4 project tiers, retainer maintenance plans &amp; FAQs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
