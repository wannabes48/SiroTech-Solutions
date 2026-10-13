import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatBlock } from "@/components/shared/stat-block";
import { siteStats } from "@/data/site-stats";
import { studioValues } from "@/data/values";
import { studioTimeline } from "@/data/timeline";
import WhyChooseUs from "@/components/WhyChooseUs";
import { CtaBand } from "@/components/ui/CtaBand";
import {
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Globe,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Engineering Philosophy & Leadership | SiroTech Solutions",
  description:
    "Learn about SiroTech Solutions, our founder's transition from physical architecture to computer science, our Nairobi studio, and our values.",
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://sirotech.com/about/#webpage",
      url: "https://sirotech.com/about",
      name: "About SiroTech Solutions",
      description: "Our mission, architectural heritage, and senior engineering leadership.",
    },
    {
      "@type": "Organization",
      "@id": "https://sirotech.com/#organization",
      name: "SiroTech Solutions",
      url: "https://sirotech.com",
      founder: {
        "@type": "Person",
        name: "Daniel Siro",
        jobTitle: "Founder & Principal Solutions Architect",
        description: "Architect and computer scientist pioneering resilient software systems.",
      },
      foundingDate: "2020",
      foundingLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressCountry: "KE",
        },
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      {/* 1. Hero with Mission Line */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "About Studio" },
            ]}
            className="text-sage-100 justify-center mb-6 [&_span]:text-white [&_a]:text-sage-100"
          />
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Our Mission &amp; Architectural Heritage
          </span>
          <h1 className="text-display text-white mb-6 max-w-4xl mx-auto leading-tight">
            Structural Thinking Applied to Digital Architecture.
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We bridge physical engineering discipline with computer science—building software that stands resilient under real commercial load, eliminates technical debt, and accelerates business growth.
          </p>
        </div>
      </div>

      <div className="max-w-[1248px] mx-auto px-6 lg:px-10 space-y-28 py-20">
        {/* 2. Story: Two Columns + Founder Portrait */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-muted text-xs font-bold uppercase tracking-widest block">
              The Studio Origin
            </span>
            <h2 className="text-h2 text-ink leading-tight">
              From Physical Blueprints to Resilient Software Codebases.
            </h2>
            <div className="space-y-4 text-body text-sm sm:text-base leading-relaxed">
              <p>
                SiroTech was founded in Nairobi on a fundamental premise: modern software is often built like temporary scaffolding rather than permanent, load-bearing infrastructure.
              </p>
              
              <p>
                SiroTech operates as an independent studio serving startups and enterprises across East Africa and the rest of the world. We partner directly with technical leaders and non-technical founders to architect high-concurrency web applications, offline-first mobile tools, and intelligent AI workflows.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink bg-surface px-4 py-2 rounded-full border border-rule">
                <Building2 className="w-4 h-4 text-sage-700" />
                <span>Nairobi Headquarters</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-ink bg-surface px-4 py-2 rounded-full border border-rule">
                <ShieldCheck className="w-4 h-4 text-sage-700" />
                <span>Zero Outsourced Developers</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden bg-sage-100 border border-rule shadow-xl">
              <img
                src="https://danielsiroportfolio.vercel.app/assets/profile-portrait-148fb244.webp"
                alt="Portrait of Daniel Siro, Founder and Principal Solutions Architect"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                <div className="text-lg font-bold">Daniel Siro</div>
                <div className="text-xs text-sage-300 font-medium">Founder &amp; Lead Developer </div>
              </div>
            </div>

            {/* External link to Daniel Siro's portfolio */}
            <a
              href="https://danielsiroportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-surface border border-rule hover:border-emerald-600/60 hover:bg-emerald-50/40 hover:shadow-sm transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-800 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-ink group-hover:text-emerald-800 transition-colors flex items-center gap-1.5 truncate">
                    <span>View Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-emerald-700 shrink-0" />
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 shrink-0 ml-3">
                <span>Visit</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
          </div>
        </section>

        {/* 3. Values: 4 Cards */}
        <section>
          <SectionHeader
            label="Core Values"
            heading="Engineering Discipline That Sets Us Apart"
            description="Our values guide every line of code we ship, every database migration we execute, and every customer relationship we nurture."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studioValues.map((val) => (
              <div
                key={val.id}
                className="bg-surface rounded-[24px] p-7 border border-rule flex flex-col justify-between hover:border-sage-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700 bg-sage-100 px-3 py-1 rounded-full inline-block mb-5">
                    {val.badge}
                  </span>
                  <h3 className="text-xl font-bold text-ink mb-2">{val.title}</h3>
                  <div className="text-xs font-semibold text-sage-700 mb-4">{val.tagline}</div>
                  <p className="text-body text-xs sm:text-sm leading-relaxed">{val.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Stats Row */}
        <section className="bg-surface rounded-[32px] p-8 sm:p-14 border border-rule">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-rule">
            {siteStats.map((item, idx) => (
              <div
                key={item.label}
                className={`py-6 md:py-0 ${
                  idx === 0
                    ? "md:pr-10"
                    : idx === 1
                    ? "md:px-10"
                    : "md:pl-10"
                }`}
              >
                <StatBlock value={item.value} suffix={item.suffix} label={item.label} />
              </div>
            ))}
          </div>
        </section>

        {/* 5. Timeline: Vertical, Alternating on Desktop */}
        <section>
          <SectionHeader
            align="center"
            label="Studio Milestones"
            heading="Our Journey from 2020 to Present"
            description="A timeline of consistent growth, architectural innovation, and expanding cross-border impact."
          />

          <div className="relative border-l-2 border-rule md:border-none max-w-4xl mx-auto ml-4 md:ml-auto">
            {studioTimeline.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={item.year}
                  className={`mb-12 relative flex flex-col md:flex-row items-start ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Timeline dot / year on desktop */}
                  <div className="absolute -left-[17px] md:left-1/2 md:-translate-x-1/2 top-1.5 w-8 h-8 rounded-full bg-sage-300 border-4 border-bg flex items-center justify-center text-[10px] font-bold text-ink z-10 shadow-sm">
                    {item.year}
                  </div>

                  {/* Card Content */}
                  <div className={`w-full md:w-[46%] ${isEven ? "md:text-right" : "md:text-left"} pl-6 md:pl-0`}>
                    <div className="bg-surface rounded-[24px] p-6 sm:p-8 border border-rule shadow-xs hover:border-sage-500/40 transition-colors">
                      <span className="text-xs font-bold uppercase tracking-wider text-sage-700 mb-1 inline-block">
                        {item.year} — {item.subtitle}
                      </span>
                      <h3 className="text-xl font-bold text-ink mb-3">{item.title}</h3>
                      <p className="text-body text-xs sm:text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <ul className={`space-y-2 text-xs font-medium text-ink ${isEven ? "md:items-end" : ""}`}>
                        {item.achievements.map((ach, aIdx) => (
                          <li
                            key={aIdx}
                            className={`flex items-start gap-2 ${
                              isEven ? "md:flex-row-reverse md:text-right" : ""
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-sage-700 shrink-0 mt-0.5" />
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Team Grid with Bio Dialogs */}
        {/*<section>
          <SectionHeader
            label="Senior Leadership"
            heading="The Engineers Behind Your Architecture"
            description="We are a senior-led product engineering collective. Click on any team member to view their technical background and skill matrix."
          />
        </section> */}

        {/* 7. Why Choose Us Reused Accordion */}
        <section className="-mx-6 lg:-mx-10">
          <WhyChooseUs />
        </section>

        {/* 8. CTA Band */}
        <section className="pt-8">
          <CtaBand
            headline="Ready to architect something remarkable?"
            description="Connect directly with our engineering leadership to scope your system requirements."
            primaryAction={{ label: "Start a Project", href: "/contact" }}
            secondaryAction={{ label: "Book a Consultation", href: "/book" }}
          />
        </section>
      </div>
    </main>
  );
}
