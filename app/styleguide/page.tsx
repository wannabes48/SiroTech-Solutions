import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { ReadMore } from "@/components/shared/read-more";
import { PillTag } from "@/components/ui/PillTag";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { ServiceCard } from "@/components/ui/ServiceCard";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { StatBlock } from "@/components/ui/StatBlock";
import { Carousel } from "@/components/ui/Carousel";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import {
  Code2,
  BrainCircuit,
  Boxes,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Layers,
  Palette,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Design System & Styleguide | SiroTech Solutions",
  description: "Internal unlisted visual regression page showcasing all shared UI components.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StyleguidePage() {
  return (
    <main className="min-h-screen bg-bg text-ink pb-32">
      {/* Top Banner Notice */}
      <div className="bg-ink text-white py-3 px-6 text-center text-xs font-medium tracking-wide">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Internal Visual Regression Test Suite — /styleguide (Unlisted, noindex)
        </span>
      </div>

      {/* Solid Inner-Page Navbar Preview */}
      <div className="border-b border-rule pb-6 bg-surface/50">
        <Navbar />
      </div>

      <Container className="pt-16 space-y-28">
        {/* Intro Hero */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sage-700 bg-sage-100 px-3.5 py-1.5 rounded-full mb-4">
            <Palette className="w-3.5 h-3.5" /> Design System Tokens
          </div>
          <h1 className="text-display text-ink mb-4">
            Shared Component Styleguide
          </h1>
          <p className="text-body text-lg max-w-3xl leading-relaxed">
            This visual regression page isolates and renders every design token and shared atomic component
            across all interactive states (default, hover, active, disabled, reduced motion).
          </p>
        </div>

        {/* 1. Color Palette Tokens */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">1. Design Tokens &amp; Color Swatches</h2>
            <p className="text-sm text-muted">Truvista sage green agency palette and neutral scale.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: "Sage 700", value: "#6f7f60", token: "--color-sage-700", bg: "bg-sage-700", text: "text-white" },
              { name: "Sage 500", value: "#8fa07e", token: "--color-sage-500", bg: "bg-sage-500", text: "text-white" },
              { name: "Sage 300", value: "#c9dbb2", token: "--color-sage-300", bg: "bg-sage-300", text: "text-ink" },
              { name: "Sage 100", value: "#e8f0dc", token: "--color-sage-100", bg: "bg-sage-100", text: "text-ink" },
              { name: "Ink", value: "#111311", token: "--color-ink", bg: "bg-ink", text: "text-white" },
              { name: "Body", value: "#5f645c", token: "--color-body", bg: "bg-body", text: "text-white" },
              { name: "Muted", value: "#8d928a", token: "--color-muted", bg: "bg-muted", text: "text-white" },
              { name: "Surface", value: "#f7f7f5", token: "--color-surface", bg: "bg-surface border border-rule", text: "text-ink" },
              { name: "Background", value: "#fbfbf9", token: "--color-bg", bg: "bg-bg border border-rule", text: "text-ink" },
              { name: "Rule", value: "#e4e6e1", token: "--color-rule", bg: "bg-rule", text: "text-ink" },
            ].map((swatch) => (
              <div key={swatch.name} className="rounded-2xl overflow-hidden border border-rule shadow-2xs">
                <div className={`h-20 ${swatch.bg} p-3 flex flex-col justify-end ${swatch.text}`}>
                  <span className="text-xs font-bold">{swatch.value}</span>
                </div>
                <div className="p-3 bg-white">
                  <div className="text-xs font-bold text-ink">{swatch.name}</div>
                  <div className="text-[10px] text-muted font-mono">{swatch.token}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Typography Hierarchy */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">2. Typography (Plus Jakarta Sans)</h2>
            <p className="text-sm text-muted">Fluid clamp typography with tight tracking.</p>
          </div>
          <div className="space-y-8 bg-surface p-8 rounded-[24px] border border-rule">
            <div>
              <span className="text-xs font-mono text-muted block mb-1">.text-display (clamp(2.5rem, 6vw, 4.5rem))</span>
              <div className="text-display text-ink">Scalable, Smart IT Solutions</div>
            </div>
            <div>
              <span className="text-xs font-mono text-muted block mb-1">.text-h2 (clamp(2rem, 4vw, 3rem))</span>
              <div className="text-h2 text-ink">Built on Trust, Driven by Results</div>
            </div>
            <div>
              <span className="text-xs font-mono text-muted block mb-1">h3 (2xl font-bold)</span>
              <h3 className="text-2xl font-bold text-ink">Full-Stack Web Application Development</h3>
            </div>
            <div>
              <span className="text-xs font-mono text-muted block mb-1">Body text (text-base text-body leading-relaxed)</span>
              <p className="text-body text-base max-w-2xl leading-relaxed">
                From custom software to cloud integration, our expert team delivers reliable IT services that
                evolve with your business needs. High performance, accessible, and resilient under real user load.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Button Component States & asChild */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">3. Buttons (All Variants &amp; asChild)</h2>
            <p className="text-sm text-muted">Primary, ghost, ghostDark, dark variants with size options and link delegation.</p>
          </div>
          <div className="bg-surface p-8 rounded-[24px] border border-rule space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="dark">Dark Button</Button>
              <Button variant="ghostDark">Ghost Dark Button</Button>
              <div className="bg-sage-700 p-3 rounded-full inline-flex">
                <Button variant="ghost">Ghost on Sage</Button>
              </div>
            </div>

            <div className="pt-4 border-t border-rule">
              <span className="text-xs font-mono text-muted block mb-3">Sizes: sm, default, lg</span>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">Small Button</Button>
                <Button variant="primary" size="default">Default Button</Button>
                <Button variant="primary" size="lg">Large CTA Button</Button>
              </div>
            </div>

            <div className="pt-4 border-t border-rule">
              <span className="text-xs font-mono text-muted block mb-3">asChild Link Support:</span>
              <Button asChild variant="dark">
                <Link href="/contact" className="inline-flex items-center gap-2">
                  <span>Rendered as Next.js Link via asChild</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 4. SectionHeader & Container */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">4. Container, Section &amp; SectionHeader</h2>
            <p className="text-sm text-muted">Small muted label inline with heading on desktop, stacked on mobile.</p>
          </div>
          <div className="space-y-8 bg-surface p-8 rounded-[24px] border border-rule">
            <div>
              <span className="text-xs font-mono text-muted block mb-4">Inline Alignment (Default):</span>
              <SectionHeader
                label="Service"
                heading="Solutions Built to Accelerate Your Growth"
                description="With years of hands-on experience, we architect production-ready systems that scale seamlessly."
                action={
                  <Button variant="primary" size="sm">
                    View Catalog
                  </Button>
                }
              />
            </div>

            <div className="pt-6 border-t border-rule">
              <span className="text-xs font-mono text-muted block mb-4">Centered Alignment:</span>
              <SectionHeader
                align="center"
                label="Why Choose Us"
                heading="Transparent Scoping &amp; Engineering Rigor"
                description="We don't cut corners on architecture. Every solution is tailored to your business challenges."
              />
            </div>
          </div>
        </section>

        {/* 5. ReadMore & PillTag & AvatarStack */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">5. ReadMore, PillTag &amp; AvatarStack</h2>
            <p className="text-sm text-muted">Hover micro-interactions and status badges.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ReadMore */}
            <div className="bg-surface p-8 rounded-[24px] border border-rule flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-ink mb-2">ReadMore Micro-Interaction</h3>
                <p className="text-xs text-muted mb-6">40px black circle with white plus, rotates 90° on hover.</p>
              </div>
              <div className="space-y-4">
                <ReadMore href="/services" label="Read More Link" />
                <div>
                  <ReadMore label="Button Trigger (No Href)" />
                </div>
              </div>
            </div>

            {/* PillTag */}
            <div className="bg-surface p-8 rounded-[24px] border border-rule">
              <h3 className="font-bold text-ink mb-2">PillTag Badges</h3>
              <p className="text-xs text-muted mb-6">Design-system pill tags in 4 color variants.</p>
              <div className="flex flex-wrap gap-2.5">
                <PillTag variant="sage" icon={<Sparkles className="w-3 h-3" />}>Most Popular</PillTag>
                <PillTag variant="dark">Enterprise</PillTag>
                <PillTag variant="outline">Verified</PillTag>
                <PillTag variant="white">Active SLA</PillTag>
              </div>
            </div>

            {/* AvatarStack */}
            <div className="bg-surface p-8 rounded-[24px] border border-rule">
              <h3 className="font-bold text-ink mb-2">AvatarStack</h3>
              <p className="text-xs text-muted mb-6">Overlapping cluster used in hero and rating cards.</p>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-muted block mb-1">Small (Rating card)</span>
                  <AvatarStack size="sm" />
                </div>
                <div>
                  <span className="text-[10px] text-muted block mb-1">Medium (Hero Display)</span>
                  <AvatarStack size="md" />
                </div>
                <div>
                  <span className="text-[10px] text-muted block mb-1">Large</span>
                  <AvatarStack size="lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ServiceCard Component */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">6. ServiceCard</h2>
            <p className="text-sm text-muted">Surface card with sage icon, 3-line clamp, ReadMore, and hover lift effect.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard
              icon={Code2}
              title="Full-Stack Web Development"
              description="High-performance apps built with Next.js, TypeScript, and Supabase. Responsive, SEO-optimized, and resilient under real-world traffic."
              href="/services/web-application-development"
            />
            <ServiceCard
              icon={BrainCircuit}
              title="AI &amp; Automation Pipelines"
              description="Embed intelligent features powered by Gemini API, LangChain, and vector embeddings directly into your existing business operational workflows."
              href="/services/ai-automation"
              isHovered={true}
            />
            <ServiceCard
              icon={Boxes}
              title="Web3 &amp; Smart Contracts"
              description="Decentralized applications and Soroban smart contracts on the Stellar network for trustless cross-border settlements."
              href="/services/custom-software"
            />
          </div>
        </section>

        {/* 7. Radix Accordion */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">7. Accordion (Radix UI)</h2>
            <p className="text-sm text-muted">Accessible single-open accordion with animated height and hairline borders.</p>
          </div>
          <div className="bg-surface p-8 rounded-[24px] border border-rule max-w-3xl">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Tailored Software Architectures</AccordionTrigger>
                <AccordionContent>
                  We don't believe in one-size-fits-all frameworks. Every solution is customized to your exact
                  business goals, user personas, and technical compliance requirements.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Scalable &amp; Future-Ready Tech Stack</AccordionTrigger>
                <AccordionContent>
                  Technologies chosen for your project are actively maintained, industry-standard, and architected
                  to scale from day one to your 100,000th active customer without rewrites.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Security &amp; Performance First</AccordionTrigger>
                <AccordionContent>
                  Every line of code is written with OWASP security best practices, encrypted transmission,
                  and sub-second load times tested across mobile networks in Africa and North America.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* 8. StatBlock Component */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">8. StatBlock (Count-Up on Enter)</h2>
            <p className="text-sm text-muted">Tabular numbers, single count-up animation on viewport entrance, reduced motion fallback.</p>
          </div>
          <div className="bg-surface p-8 rounded-[24px] border border-rule">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-rule">
              <StatBlock
                value={100}
                suffix="%"
                label="Project Delivery Rate on Time"
                className="md:pr-10"
              />
              <StatBlock
                value={4}
                suffix="+"
                label="Flagship AI &amp; Web3 Production Builds"
                className="md:px-10"
              />
              <StatBlock
                value={10000}
                suffix="+"
                label="Lines of Clean Production Code"
                className="md:pl-10"
              />
            </div>
          </div>
        </section>

        {/* 9. Carousel Component */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">9. Carousel (CSS Scroll-Snap)</h2>
            <p className="text-sm text-muted">Pure CSS snap with keyboard arrow listener and prev/next controllers without external libraries.</p>
          </div>
          <div className="bg-surface p-8 rounded-[24px] border border-rule">
            <Carousel itemWidth={360}>
              {[
                { title: "Foresafe QR Notifications", tag: "Automotive Tech", bg: "bg-sage-300" },
                { title: "RapidRecruit AI Screener", tag: "HR Technology", bg: "bg-sage-100" },
                { title: "TrustFlow Credit Scoring", tag: "FinTech & Banking", bg: "bg-surface" },
                { title: "AgriSupply Chain Portal", tag: "AgriTech Kenya", bg: "bg-sage-300" },
                { title: "MedLink Patient Care", tag: "HealthTech HIPAA", bg: "bg-sage-100" },
              ].map((slide, idx) => (
                <div
                  key={idx}
                  className="w-[300px] sm:w-[360px] bg-bg rounded-2xl p-6 border border-rule flex flex-col justify-between h-[280px]"
                >
                  <div className={`w-full h-32 rounded-xl ${slide.bg} flex items-center justify-center font-bold text-ink/70 text-sm`}>
                    [Mockup Slide {idx + 1}]
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{slide.tag}</span>
                    <h4 className="text-base font-bold text-ink">{slide.title}</h4>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* 10. Breadcrumbs with JSON-LD */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">10. Breadcrumbs (with Schema.org JSON-LD)</h2>
            <p className="text-sm text-muted">Emits BreadcrumbList microdata for SEO spiders alongside accessible breadcrumb trails.</p>
          </div>
          <div className="bg-surface p-8 rounded-[24px] border border-rule space-y-4">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: "Web Application Development" },
              ]}
            />
            <div className="text-xs font-mono text-muted pt-2 border-t border-rule">
              &lt;script type="application/ld+json"&gt; BreadcrumbList schema generated into DOM.
            </div>
          </div>
        </section>

        {/* 11. CtaBand Component */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">11. CtaBand (Sage Panel)</h2>
            <p className="text-sm text-muted">Full-width sage-700 container with background noise and dual action buttons.</p>
          </div>
          <CtaBand
            headline="Tell us what you're trying to build."
            description="Whether you need a custom web platform, a mobile application, or a scalable AI integration, our engineering team is ready to deliver."
            primaryAction={{ label: "Start a Project", href: "/contact" }}
            secondaryAction={{ label: "Book a Consultation", href: "/book" }}
          />
        </section>

        {/* 12. Reveal Animation Wrapper */}
        <section className="space-y-6">
          <div className="border-b border-rule pb-3">
            <h2 className="text-2xl font-bold text-ink">12. Reveal (Fade-Up on Scroll)</h2>
            <p className="text-sm text-muted">Framer-motion scroll-trigger with reduced-motion consideration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0.1}>
              <div className="p-6 rounded-2xl bg-surface border border-rule text-center">
                <div className="text-sm font-bold text-ink mb-1">Delay 0.1s</div>
                <p className="text-xs text-muted">Fades in smoothly as it enters the viewport.</p>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="p-6 rounded-2xl bg-surface border border-rule text-center">
                <div className="text-sm font-bold text-ink mb-1">Delay 0.25s</div>
                <p className="text-xs text-muted">Staggered entry for multiple cards.</p>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="p-6 rounded-2xl bg-surface border border-rule text-center">
                <div className="text-sm font-bold text-ink mb-1">Delay 0.4s</div>
                <p className="text-xs text-muted">Respects prefers-reduced-motion settings.</p>
              </div>
            </Reveal>
          </div>
        </section>
      </Container>
    </main>
  );
}
