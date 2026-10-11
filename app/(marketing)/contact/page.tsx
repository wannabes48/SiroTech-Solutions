import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ContactForm } from "@/components/contact/ContactForm";
import { Mail, Phone, MapPin, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Our Engineering Studio | SiroTech Solutions",
  description:
    "Submit your project brief to SiroTech Solutions. We reply within 1 business day with actionable architectural recommendations and estimates.",
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://sirotech.com/contact/#webpage",
      url: "https://sirotech.com/contact",
      name: "Contact SiroTech Solutions",
      description: "Submit a project brief or schedule an engineering consultation.",
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://sirotech.com/#organization",
      name: "SiroTech Solutions",
      url: "https://sirotech.com",
      email: "hello@sirotech.com",
      telephone: "+254700000000",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "The Mirage, Chiromo Road, Westlands",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
      ],
    },
  ],
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      {/* Hero Header */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
            Direct Engineering Access
          </span>
          <h1 className="text-display text-white mb-6 max-w-3xl mx-auto leading-tight">
            Tell us what you're trying to build.
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Every breakthrough platform starts with an honest technical conversation. We reply within 1 business day with actionable architectural scoping.
          </p>
        </div>
      </div>

      {/* Two-Column Contact Layout */}
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10 py-20 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Contacts & Promise */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100 text-sage-700 border border-sage-300 text-xs font-bold uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-700" />
                <span>Our Response Promise</span>
              </div>
              <h2 className="text-3xl font-bold text-ink mb-4 leading-snug">
                We reply within 1 business day.
              </h2>
              <p className="text-body text-sm sm:text-base leading-relaxed">
                You will speak directly with senior software architects who will evaluate your technical feasibility, recommend database architectures, and deliver an itemized project estimate.
              </p>
            </div>

            {/* Direct Contact Channels */}
            <div className="bg-surface rounded-[24px] p-7 border border-rule space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-sage-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 text-sage-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Direct Email
                  </h3>
                  <a
                    href="mailto:hello@sirotech.com"
                    className="text-base font-bold text-ink hover:text-sage-700 transition-colors"
                  >
                    hello@sirotech.com
                  </a>
                  <p className="text-xs text-muted mt-0.5">Encrypted inbox checked hourly</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-5 border-t border-rule">
                <div className="w-10 h-10 rounded-full bg-sage-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 text-sage-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Phone &amp; WhatsApp
                  </h3>
                  <a
                    href="https://wa.me/254700000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-ink hover:text-sage-700 transition-colors"
                  >
                    +254 (0) 700 000 000
                  </a>
                  <p className="text-xs text-muted mt-0.5">Available for WhatsApp messages &amp; calls</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-5 border-t border-rule">
                <div className="w-10 h-10 rounded-full bg-sage-300 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-sage-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Nairobi Studio
                  </h3>
                  <p className="text-sm font-semibold text-ink leading-snug">
                    The Mirage, Chiromo Road, Westlands
                  </p>
                  <p className="text-xs text-muted mt-0.5">Nairobi, Kenya</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-5 border-t border-rule">
                <div className="w-10 h-10 rounded-full bg-sage-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 text-sage-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Operating Hours
                  </h3>
                  <p className="text-sm font-semibold text-ink">
                    Monday – Friday: 8:00 AM – 6:00 PM EAT
                  </p>
                  <p className="text-xs text-muted mt-0.5">Accommodating US &amp; Canada timezones</p>
                </div>
              </div>
            </div>

            {/* Quality Guarantees */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-body font-medium">
                <ShieldCheck className="w-4 h-4 text-sage-700 shrink-0" />
                <span>Mutual Non-Disclosure Agreement (NDA) supported upon request</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-body font-medium">
                <ShieldCheck className="w-4 h-4 text-sage-700 shrink-0" />
                <span>Zero sales pressure or lock-in; transparent architectural advice</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Brief Form */}
          <div className="lg:col-span-7">
            <Suspense
              fallback={
                <div className="bg-surface rounded-[28px] p-12 border border-rule text-center text-muted text-sm">
                  Loading project brief form...
                </div>
              }
            >
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
