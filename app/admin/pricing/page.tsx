import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { projectPricingTiers } from "@/data/pricing";
import { DollarSign, Check, ArrowRight } from "lucide-react";

export default async function AdminPricingPage() {
  await requireStaffUser("content:read");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Pricing Tiers &amp; Multi-Currency Scopes"
        subtitle="Manage fixed-scope deliverables and currency rates across KES, USD, and CAD."
        breadcrumbs={[{ label: "Content" }, { label: "Pricing" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projectPricingTiers.map((tier) => (
          <div
            key={tier.name}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  {tier.scope}
                </span>
                <h3 className="text-xl font-bold text-ink mt-1">{tier.name}</h3>
                <p className="text-xs text-body mt-1 leading-relaxed">{tier.description}</p>
              </div>

              {/* Multi-currency pricing cards */}
              <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted">KES:</span>
                  <span className="font-bold text-ink">{tier.prices.KES.display}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted">USD:</span>
                  <span className="font-bold text-ink">{tier.prices.USD.display}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted">CAD:</span>
                  <span className="font-bold text-ink">{tier.prices.CAD.display}</span>
                </div>
              </div>

              {/* Deliverables list */}
              <div className="space-y-2 pt-2 border-t border-rule/60">
                <span className="text-xs font-bold text-ink block">Included Scope:</span>
                <ul className="space-y-1.5 text-xs text-body">
                  {tier.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-full text-xs font-semibold bg-white border border-rule hover:bg-surface text-ink transition-colors cursor-pointer"
            >
              Edit Pricing Tier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
