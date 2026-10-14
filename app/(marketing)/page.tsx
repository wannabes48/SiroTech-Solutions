import Hero from "@/components/Hero";
import TechMarquee from "@/components/TechMarquee";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import WorkShowcase from "@/components/WorkShowcase";
import PricingTeaser from "@/components/home/PricingTeaser";
import Testimonials from "@/components/home/Testimonials";
import BlogTeaser from "@/components/home/BlogTeaser";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata = {
  title: "SiroTech Solutions | Scalable Software & IT Services in Nairobi",
  description:
    "Independent software development studio based in Nairobi specializing in robust web apps, mobile engineering, and AI integrations for Africa and North America.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sirotech.vercel.app/#organization",
      name: "SiroTech Solutions",
      url: "https://sirotech.vercel.app",
      logo: "https://sirotech.vercel.app/logo.svg",
      description:
        "Independent software and IT services studio specializing in custom web applications, cloud infrastructure, and AI integrations.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales and engineering",
        email: "hello@sirotech.vercel.app",
        availableLanguage: ["English", "Swahili"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://sirotech.vercel.app/#website",
      url: "https://sirotech.vercel.app",
      name: "SiroTech Solutions",
      publisher: {
        "@id": "https://sirotech.vercel.app/#organization",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-ink antialiased">
      {/* Schema.org Organization & WebSite JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero (only H1 on page, nav pill, headline with avatar stack, scroll cue) */}
      <Hero />

      {/* 2. Trust strip (#trust: Technologies we build with) */}
      <TechMarquee />

      <main>
        {/* 3. About teaser (portrait, 4 rotated chips, Nairobi/Serving card) */}
        <AboutSection />

        {/* 4. Stats row (3 StatBlocks sourced from site-stats.ts) */}
        <StatsSection />

        {/* 5. Services (3 featured cards with hover lift, view all pill) */}
        <ServicesSection />

        {/* 6. Why choose us (team photo, About Us pill, Radix accordion) */}
        <WhyChooseUs />

        {/* 7. Case studies (centred header, Carousel of WorkCards, view all) */}
        <WorkShowcase />

        {/* 8. Pricing teaser (3 plan cards, cookie-persisted useCurrency, link to /pricing) */}
        <PricingTeaser />

        {/* 9. Testimonials (Carousel of quotes, hidden if < 3) */}
        <Testimonials />

        {/* 10. Blog teaser (3 latest posts with images & tags) */}
        <BlogTeaser />

        {/* 11. Final CTA band (sage panel with primary/secondary actions) */}
        <FinalCTA />
      </main>
    </div>
  );
}
