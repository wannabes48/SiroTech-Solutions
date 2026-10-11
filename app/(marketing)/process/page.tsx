import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProcessStages } from "@/components/process/ProcessStages";
import { CtaBand } from "@/components/ui/CtaBand";

export const metadata: Metadata = {
  title: "Our Engineering Process & Delivery Cadence | SiroTech Solutions",
  description:
    "Learn how SiroTech delivers mission-critical software across 4 structured stages: Plan, Design, Build, and Test & Launch.",
};

export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Header */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Our Process" },
            ]}
            className="text-sage-100 justify-center mb-6 [&_span]:text-white [&_a]:text-sage-100"
          />
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Engineering Methodology
          </span>
          <h1 className="text-display text-white mb-6 max-w-4xl mx-auto leading-tight">
            How We Build Software That Endures.
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A transparent, milestone-driven delivery cadence. Zero black boxes, regular staging demos, and predictable sprint outcomes from Day 1 to Production.
          </p>
        </div>
      </div>

      <div className="max-w-[1248px] mx-auto px-6 lg:px-10 space-y-28 py-20">
        {/* Four Stages with Sticky Progress Rail */}
        <section>
          <ProcessStages />
        </section>

        {/* Typical Project Timeline Chart (CSS Gantt Bars) */}
        <section className="bg-surface rounded-[32px] p-8 sm:p-14 border border-rule">
          <div className="max-w-2xl mb-12">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-2">
              Sample 8-Week MVP Schedule
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              Typical Project Sprint Timeline
            </h2>
            <p className="text-body text-sm mt-3">
              How engineering phases overlap efficiently across an 8-week production launch window.
            </p>
          </div>

          <div className="space-y-6">
            {/* Week Headers */}
            <div className="grid grid-cols-8 text-center text-xs font-bold uppercase tracking-wider text-muted pb-3 border-b border-rule">
              <div>W1</div>
              <div>W2</div>
              <div>W3</div>
              <div>W4</div>
              <div>W5</div>
              <div>W6</div>
              <div>W7</div>
              <div>W8</div>
            </div>

            {/* Track 1: Architecture */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>Architecture &amp; Schema</span>
                <span className="text-muted">Weeks 1–2</span>
              </div>
              <div className="w-full bg-bg h-4 rounded-full overflow-hidden flex">
                <div className="w-2/8 bg-sage-700 h-full rounded-full" />
              </div>
            </div>

            {/* Track 2: UI/UX Design */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>UI/UX Figma Design &amp; Prototype</span>
                <span className="text-muted">Weeks 2–3</span>
              </div>
              <div className="w-full bg-bg h-4 rounded-full overflow-hidden flex">
                <div className="w-1/8" />
                <div className="w-2/8 bg-sage-500 h-full rounded-full" />
              </div>
            </div>

            {/* Track 3: Full-Stack Development */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>Core Full-Stack Build &amp; APIs</span>
                <span className="text-muted">Weeks 3–6</span>
              </div>
              <div className="w-full bg-bg h-4 rounded-full overflow-hidden flex">
                <div className="w-2/8" />
                <div className="w-4/8 bg-ink h-full rounded-full" />
              </div>
            </div>

            {/* Track 4: QA & Security */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>QA, E2E Testing &amp; Vulnerability Audit</span>
                <span className="text-muted">Weeks 6–7</span>
              </div>
              <div className="w-full bg-bg h-4 rounded-full overflow-hidden flex">
                <div className="w-5/8" />
                <div className="w-2/8 bg-sage-300 h-full rounded-full" />
              </div>
            </div>

            {/* Track 5: Deployment & UAT */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>UAT Sign-off &amp; Production Cutover</span>
                <span className="text-muted">Weeks 7–8</span>
              </div>
              <div className="w-full bg-bg h-4 rounded-full overflow-hidden flex">
                <div className="w-6/8" />
                <div className="w-2/8 bg-emerald-600 h-full rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="pt-6">
          <CtaBand
            headline="Ready to launch Phase 1?"
            description="Book an architectural discovery session and receive a detailed Statement of Work within 24 hours."
            primaryAction={{ label: "Start Discovery", href: "/contact" }}
            secondaryAction={{ label: "Book a Consultation", href: "/book" }}
          />
        </section>
      </div>
    </main>
  );
}
