import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { getOpenRoles, getRoleBySlug } from "@/data/careers";
import { JobApplicationForm } from "@/components/careers/JobApplicationForm";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";

export const dynamic = "force-static";

interface CareerDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const roles = getOpenRoles();
  return roles.map((role) => ({
    slug: role.slug,
  }));
}

export async function generateMetadata({
  params,
}: CareerDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = getRoleBySlug(slug);

  if (!role) {
    return {
      title: "Role Not Found | SiroTech Careers",
    };
  }

  const canonicalUrl = `https://sirotech.com/careers/${role.slug}`;

  return {
    title: `${role.title} | Careers at SiroTech Solutions Nairobi`,
    description: role.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${role.title} | SiroTech Solutions`,
      description: role.summary,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function CareerDetailPage({ params }: CareerDetailPageProps) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);

  if (!role) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: `${role.summary}\n\nResponsibilities:\n${role.responsibilities.join(
      "\n"
    )}\n\nRequirements:\n${role.requirements.join("\n")}`,
    datePosted: role.datePosted,
    validThrough: role.validThrough,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "SiroTech Solutions",
      sameAs: "https://sirotech.com",
      logo: "https://sirotech.com/icon.svg",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressRegion: "Nairobi County",
        addressCountry: "KE",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "KES",
      value: {
        "@type": "QuantitativeValue",
        value: role.salary,
        unitText: "MONTH",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="min-h-screen bg-bg pt-32 pb-24">
        <Container>
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Careers", href: "/careers" },
                { label: role.title, href: `/careers/${role.slug}` },
              ]}
            />
          </div>

          {/* Job Header */}
          <section className="mb-14">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="px-3.5 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-bold uppercase tracking-wider">
                  {role.department}
                </span>
                <span className="px-3.5 py-1 rounded-full bg-white border border-rule text-ink text-xs font-semibold">
                  {role.experience}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.08] mb-6">
                {role.title}
              </h1>

              {/* Meta details strip */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-body py-4 border-y border-rule mb-8">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted" />
                  <span className="font-semibold text-ink">{role.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted" />
                  <span>{role.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted" />
                  <span className="font-semibold text-ink">{role.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted" />
                  <span className="text-xs text-muted">Posted {role.datePosted}</span>
                </div>
              </div>

              <p className="text-body text-base sm:text-lg leading-relaxed mb-6">
                {role.summary}
              </p>

              <div className="flex items-center gap-4">
                <a
                  href="#apply-form"
                  className="px-6 py-3.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors shadow-md inline-flex items-center gap-2"
                >
                  <span>Apply For This Position</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/careers"
                  className="px-6 py-3.5 rounded-full bg-white border border-rule text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-50 transition-colors"
                >
                  All Open Roles
                </Link>
              </div>
            </div>
          </section>

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
            {/* Left 7 Columns: Responsibilities, Requirements, Stack */}
            <div className="lg:col-span-7 space-y-12">
              {/* Responsibilities */}
              <section className="bg-surface rounded-[32px] border border-rule p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2.5">
                  <Layers className="w-6 h-6 text-sage-800" />
                  <span>What You Will Do</span>
                </h2>
                <ul className="space-y-4">
                  {role.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3.5">
                      <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
                      <span className="text-body text-sm sm:text-base leading-relaxed">
                        {resp}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Requirements */}
              <section className="bg-surface rounded-[32px] border border-rule p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2.5">
                  <Shield className="w-6 h-6 text-sage-800" />
                  <span>Qualifications &amp; Experience</span>
                </h2>
                <ul className="space-y-4">
                  {role.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3.5">
                      <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
                      <span className="text-body text-sm sm:text-base leading-relaxed">
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Nice to have */}
              {role.niceToHave && role.niceToHave.length > 0 && (
                <section className="bg-white rounded-[32px] border border-rule p-8 sm:p-10">
                  <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-sage-800" />
                    <span>Nice to Have (Bonus)</span>
                  </h2>
                  <ul className="space-y-3">
                    {role.niceToHave.map((bonus, i) => (
                      <li key={i} className="flex items-start gap-3 text-body text-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-sage-500 shrink-0 mt-2" />
                        <span>{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Technologies */}
              <section className="bg-surface rounded-[32px] border border-rule p-8 sm:p-10">
                <h2 className="text-xl font-bold text-ink mb-4">
                  Primary Technology Stack
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {role.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-4 py-2 rounded-full bg-white border border-rule text-xs font-semibold text-ink shadow-2xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Right 5 Columns: Interactive Application Form */}
            <div className="lg:col-span-5" id="apply-form">
              <div className="sticky top-28">
                <JobApplicationForm
                  roleSlug={role.slug}
                  roleTitle={role.title}
                  heading={`Apply for ${role.title}`}
                  subheading="Submit your profile. We do not use automated keyword filters—every application is reviewed directly by an engineering partner."
                />
              </div>
            </div>
          </div>

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Have questions about life or engineering at SiroTech?"
            description="Speak directly with our team leads or email careers@sirotech.com with questions before applying."
            primaryAction={{
              label: "Email Careers Lead",
              href: "mailto:careers@sirotech.com",
            }}
            secondaryAction={{
              label: "Explore Studio About Page",
              href: "/about",
            }}
          />
        </Container>
      </main>
    </>
  );
}
