import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { CtaBand } from "@/components/ui/CtaBand";
import { services } from "@/data/services";
import {
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

export const metadata: Metadata = {
  title: "Engineering Services Catalog — All 11 Capabilities | SiroTech Solutions",
  description:
    "Explore SiroTech's 11 engineering services: Custom Software, Web Apps, Mobile, E-Commerce, AI, Cloud DevOps, APIs, UI/UX, Security, and Maintenance.",
};

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

const filterAnchors = [
  { label: "All 11 Services", href: "#services-catalog" },
  { label: "Build & Full-Stack", href: "#build" },
  { label: "Cloud, AI & DevOps", href: "#cloud" },
  { label: "UI/UX & Web Design", href: "#design" },
  { label: "Security & Support", href: "#support" },
];

export default function ServicesIndexPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Header */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Engineering Services" },
            ]}
            className="text-sage-100 justify-center mb-6 [&_span]:text-white [&_a]:text-sage-100"
          />
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Full-Spectrum Digital Engineering
          </span>
          <h1 className="text-display text-white mb-6 max-w-4xl mx-auto leading-tight">
            Solutions Built to Accelerate Your Growth
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            From bespoke software to cloud architecture and intelligent AI workflows, explore our 11 battle-tested engineering capabilities.
          </p>

          {/* Anchor Filter Chips (Static links, not JS state) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {filterAnchors.map((chip) => (
              <a
                key={chip.label}
                href={chip.href}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
              >
                {chip.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Services Grid */}
      <div id="services-catalog" className="max-w-[1248px] mx-auto px-6 lg:px-10 py-20 scroll-mt-24">
        {/* 3 Columns Desktop, 2 Tablet, 1 Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-24">
          {services.map((service) => {
            const Icon = iconMap[service.slug] || Code2;
            return (
              <div key={service.slug} id={service.category} className="scroll-mt-32">
                <ServiceCard
                  icon={Icon}
                  title={service.title}
                  description={service.summary}
                  href={`/services/${service.slug}`}
                  className="h-full"
                />
              </div>
            );
          })}
        </div>

        {/* Not Sure What You Need? CTA Band */}
        <div className="pt-6">
          <CtaBand
            headline="Not sure which service fits your roadmap?"
            description="Share your business challenge with us. Our senior architects will assess your requirements and recommend the ideal delivery scope."
            primaryAction={{ label: "Request Free Scoping Call", href: "/contact" }}
            secondaryAction={{ label: "Schedule 30-Min Discovery", href: "/book" }}
          />
        </div>
      </div>
    </main>
  );
}
