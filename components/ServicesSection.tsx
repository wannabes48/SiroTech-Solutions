import Link from "next/link";
import { Code2, BrainCircuit, Smartphone, ArrowRight } from "lucide-react";
import { ServiceCard } from "./ui/ServiceCard";
import { SectionHeader } from "./ui/SectionHeader";

const featuredServices = [
  {
    icon: Code2,
    title: "Web Application Development",
    description: "Fast, resilient web platforms built with Next.js and modern API architectures. Designed to stay responsive under real user concurrency.",
    href: "/services/web-application-development",
    isHovered: false,
  },
  {
    icon: BrainCircuit,
    title: "AI & Automation Workflows",
    description: "Intelligent features, domain NLP pipelines, and automated vector search embedded directly into your core operational stack.",
    href: "/services/ai-automation",
    isHovered: true, // Shows active/lifted state as per template
  },
  {
    icon: Smartphone,
    title: "Cross-Platform Mobile Apps",
    description: "High-performance iOS and Android applications built with React Native and Expo, providing native performance without duplicating codebases.",
    href: "/services/mobile-apps",
    isHovered: false,
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-bg border-t border-rule">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        {/* Section Header: Left label/heading, right intro paragraph */}
        <SectionHeader
          label="Service"
          heading={
            <>
              Solutions Built to <br className="hidden sm:block" />
              Accelerate Your Growth
            </>
          }
          description="With years of hands-on experience across full-stack web, AI, and cloud ecosystems, we engineer production-ready systems that scale seamlessly in competitive markets."
        />

        {/* 3 Featured ServiceCards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-14">
          {featuredServices.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              href={service.href}
              isHovered={service.isHovered}
            />
          ))}
        </div>

        {/* View all pill → /services */}
        <div className="flex justify-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-sage-300 text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-100 transition-colors shadow-xs"
          >
            <span>View All 11 Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
