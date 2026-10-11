import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PillTag } from "@/components/ui/PillTag";
import { CtaBand } from "@/components/ui/CtaBand";
import { WorkGallery } from "@/components/work/WorkGallery";
import { getCaseStudies, getCaseStudy } from "@/data/work";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Quote,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from "lucide-react";

export async function generateStaticParams() {
  const all = await getCaseStudies();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getCaseStudy(slug);

  if (!project) {
    return { title: "Case Study Not Found" };
  }

  return {
    title: `${project.title} (${project.buildType}) | Case Study | SiroTech Solutions`,
    description: project.summary,
    openGraph: {
      title: `${project.title} - ${project.tagline} | SiroTech Solutions`,
      description: project.summary,
      url: `https://sirotech.com/work/${project.slug}`,
      type: "article",
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getCaseStudy(slug);

  if (!project) {
    notFound();
  }

  const allProjects = await getCaseStudies();
  const nextProject =
    allProjects.find((p) => p.slug === project.nextProjectSlug) ||
    allProjects.find((p) => p.slug !== project.slug) ||
    allProjects[0];

  const prevProject =
    allProjects.find((p) => p.slug === project.prevProjectSlug) ||
    allProjects.find((p) => p.slug !== project.slug && p.slug !== nextProject.slug) ||
    allProjects[allProjects.length - 1];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `https://sirotech.com/work/${project.slug}#article`,
        headline: `${project.title}: ${project.tagline}`,
        description: project.summary,
        url: `https://sirotech.com/work/${project.slug}`,
        author: {
          "@type": "Organization",
          name: "SiroTech Solutions",
          url: "https://sirotech.com",
        },
        publisher: {
          "@type": "Organization",
          name: "SiroTech Solutions",
          url: "https://sirotech.com",
        },
        about: {
          "@type": "CreativeWork",
          name: project.title,
          genre: project.industry,
          award: project.metrics[0]?.value,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://sirotech.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work",
            item: "https://sirotech.com/work",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: `https://sirotech.com/work/${project.slug}`,
          },
        ],
      },
    ],
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
                { label: "Work", href: "/work" },
                { label: project.title, href: `/work/${project.slug}` },
              ]}
            />
          </div>

          {/* Project Header Hero */}
          <header className="mb-14">
            {/* Metadata Tags Row with Build Type Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <PillTag variant="sage">{project.industry}</PillTag>
              <PillTag variant="outline">{project.serviceTitle}</PillTag>

              {/* Build status badge: Production vs Demo vs Concept */}
              <span
                className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  project.buildType === "Production"
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : project.buildType === "Demo"
                    ? "bg-amber-100 text-amber-950 border-amber-300"
                    : "bg-purple-100 text-purple-950 border-purple-300"
                }`}
              >
                {project.buildType} Build
              </span>

              <span className="text-xs font-semibold text-muted uppercase tracking-wider px-3 py-1 bg-white rounded-full border border-rule">
                Timeline: {project.duration}
              </span>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider px-3 py-1 bg-white rounded-full border border-rule">
                Year: {project.year}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-6">
                  {project.title}
                </h1>
                <p className="text-xl sm:text-2xl font-medium text-sage-800 mb-6">
                  {project.tagline}
                </p>
                <p className="text-body text-base sm:text-lg leading-relaxed max-w-3xl">
                  {project.summary}
                </p>
              </div>

              {/* Action Buttons Box */}
              <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
                <Link
                  href={`/contact?service=${project.serviceSlug}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors shadow-sm"
                >
                  <span>Discuss Similar Build</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider border border-rule hover:bg-sage-50 transition-colors"
                  >
                    <span>Launch Live System</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <span className="text-xs text-muted mt-2">
                  Client / Partner: <strong className="text-ink">{project.client}</strong>
                </span>
              </div>
            </div>
          </header>

          {/* Hero Visual Mockup Card */}
          <section className="mb-20">
            <div
              className={`w-full rounded-[36px] ${project.heroBgColor} border border-rule/70 p-6 sm:p-12 shadow-sm overflow-hidden relative`}
            >
              {/* Browser / Application Top Bar */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white p-4 sm:p-6 shadow-md max-w-4xl mx-auto">
                <div className="flex items-center justify-between border-b border-rule/60 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-muted ml-3 hidden sm:inline">
                      https://secure.{project.slug}.com/console
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{project.buildType} Verified</span>
                  </div>
                </div>

                {/* Simulated UI Interior Viewport */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-bg border border-rule">
                    <div>
                      <div className="text-xs uppercase font-bold tracking-widest text-muted">
                        Primary System Objective
                      </div>
                      <div className="text-lg font-bold text-ink mt-0.5">
                        {project.tagline}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sage-200 text-sage-800">
                        <Zap className="w-3.5 h-3.5" />
                        Live SLA Active
                      </span>
                    </div>
                  </div>

                  {/* UI Wireframe Graphic Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-rule/80">
                      <div className="text-xs text-muted font-medium mb-1">Architecture State</div>
                      <div className="text-sm font-bold text-ink">Distributed Edge / Microservices</div>
                      <div className="w-full bg-sage-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-sage-600 h-full w-[94%]" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-rule/80">
                      <div className="text-xs text-muted font-medium mb-1">Security Audit</div>
                      <div className="text-sm font-bold text-ink">OWASP Compliant & Encrypted</div>
                      <div className="w-full bg-sage-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-sage-600 h-full w-[100%]" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-rule/80">
                      <div className="text-xs text-muted font-medium mb-1">Deployment Status</div>
                      <div className="text-sm font-bold text-ink">High Availability Multi-AZ</div>
                      <div className="w-full bg-sage-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-sage-600 h-full w-[99%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Metrics & Performance Strip (Results) */}
          <section className="mb-24">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-1">
                Verified Outcomes
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink">
                Measurable System Benchmarks
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 sm:p-10 rounded-[32px] bg-surface border border-rule shadow-xs">
              {project.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-4 border-l sm:border-l-0 sm:border-t-0 first:border-none border-rule/80"
                >
                  <div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tabular-nums tracking-tight mb-2">
                      {m.value}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-ink uppercase tracking-wider mb-2">
                      {m.label}
                    </div>
                  </div>
                  {m.detail && (
                    <p className="text-xs text-muted leading-relaxed mt-2">
                      {m.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Deep-Dive Narrative (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start mb-24">
            {/* Left Narrative Column */}
            <div className="lg:col-span-8 space-y-16">
              {/* 1. The Challenge */}
              <section className="bg-surface rounded-[32px] p-8 sm:p-12 border border-rule">
                <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                  01 / Problem Context & Constraints
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-6">
                  {project.challenge.headline}
                </h2>
                <p className="text-body text-base sm:text-lg leading-relaxed mb-8">
                  {project.challenge.description}
                </p>

                <div className="space-y-4 pt-6 border-t border-rule/60">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink block mb-2">
                    Key Technical Obstacles:
                  </span>
                  {project.challenge.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium text-ink leading-relaxed">
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. The Architecture & Engineering Approach */}
              <section className="bg-surface rounded-[32px] p-8 sm:p-12 border border-rule">
                <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                  02 / Architecture & Engineering Decisions
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-6">
                  {project.approach.headline}
                </h2>
                <p className="text-body text-base sm:text-lg leading-relaxed mb-8">
                  {project.approach.description}
                </p>

                {/* Architecture Callout */}
                <div className="p-6 rounded-2xl bg-bg border border-rule mb-8">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-sage-800">
                    <Layers className="w-4 h-4" />
                    <span>System Architecture Overview</span>
                  </div>
                  <p className="text-sm text-body leading-relaxed font-mono">
                    {project.solution.architectureOverview}
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-rule/60">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink block mb-2">
                    Implementation Strategy:
                  </span>
                  {project.approach.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <div className="w-5 h-5 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-ink leading-relaxed">
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. The Solution, Key Features & Gallery */}
              <section className="bg-surface rounded-[32px] p-8 sm:p-12 border border-rule space-y-10">
                <div>
                  <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                    03 / Delivered Capabilities
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-6">
                    {project.solution.headline}
                  </h2>
                  <p className="text-body text-base sm:text-lg leading-relaxed">
                    {project.solution.description}
                  </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {project.solution.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-white border border-rule/80 shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-sage-200 text-sage-800 text-xs font-bold flex items-center justify-center mb-4">
                        0{idx + 1}
                      </div>
                      <h3 className="text-base font-bold text-ink mb-2">
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-body leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Solution Gallery with Lightbox */}
                {project.gallery && project.gallery.length > 0 && (
                  <div className="pt-6 border-t border-rule/60">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted">
                        Visual Artifacts & Architecture Views
                      </span>
                      <span className="text-xs text-muted">Click any preview to enlarge</span>
                    </div>
                    <WorkGallery items={project.gallery} />
                  </div>
                )}
              </section>
            </div>

            {/* Right Sticky Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Deliverables Checklist */}
              <div className="bg-surface rounded-[28px] p-8 border border-rule shadow-xs">
                <span className="text-xs font-bold uppercase tracking-widest text-muted block mb-4">
                  Handed Over Deliverables
                </span>
                <div className="space-y-3.5">
                  {project.deliverables.map((deliv, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-medium text-ink leading-snug">
                        {deliv}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div className="bg-surface rounded-[28px] p-8 border border-rule shadow-xs">
                <span className="text-xs font-bold uppercase tracking-widest text-muted block mb-4">
                  Technologies Deployed
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3.5 py-1.5 rounded-full bg-white text-ink text-xs font-semibold border border-rule"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Client Testimonial */}
              {project.testimonial && (
                <div className="bg-sage-100 rounded-[28px] p-8 border border-sage-300/60 shadow-xs relative">
                  <Quote className="w-8 h-8 text-sage-400 mb-4" />
                  <blockquote className="text-sm font-medium text-ink leading-relaxed mb-6 italic">
                    &ldquo;{project.testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="border-t border-sage-300/60 pt-4">
                    <div className="font-bold text-ink text-sm">
                      {project.testimonial.author}
                    </div>
                    <div className="text-xs text-sage-800">
                      {project.testimonial.role}, {project.testimonial.company}
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Booking / Consultation Box */}
              <div className="bg-ink rounded-[28px] p-8 text-white shadow-md">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">
                  Need Similar Results?
                </span>
                <h3 className="text-xl font-bold mb-3">
                  Let&apos;s engineer your solution.
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
                  Schedule a discovery session with our senior engineering team to scope your roadmap, architecture, and timeline.
                </p>
                <div className="space-y-3">
                  <Link
                    href={`/contact?service=${project.serviceSlug}`}
                    className="flex items-center justify-between w-full px-5 py-3 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-100 transition-colors"
                  >
                    <span>Request Scoping Call</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/book"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book 30-Min Demo</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bidirectional Next / Previous Case Study Navigation Strip */}
          <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previous Project */}
              <Link
                href={`/work/${prevProject.slug}`}
                className="bg-surface rounded-[28px] p-8 border border-rule hover:border-ink/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-rule flex items-center justify-center text-muted group-hover:text-ink group-hover:border-ink transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted block mb-0.5">
                      Previous Project
                    </span>
                    <h4 className="text-lg font-bold text-ink group-hover:text-sage-800 transition-colors">
                      {prevProject.title}
                    </h4>
                  </div>
                </div>
                <span className="text-xs text-muted hidden sm:inline">
                  {prevProject.industry}
                </span>
              </Link>

              {/* Next Project */}
              <Link
                href={`/work/${nextProject.slug}`}
                className="bg-surface rounded-[28px] p-8 border border-rule hover:border-ink/30 transition-all flex items-center justify-between group text-right"
              >
                <span className="text-xs text-muted hidden sm:inline">
                  {nextProject.industry}
                </span>
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-white border border-rule flex items-center justify-center text-muted group-hover:text-ink group-hover:border-ink transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted block mb-0.5">
                      Next Project
                    </span>
                    <h4 className="text-lg font-bold text-ink group-hover:text-sage-800 transition-colors">
                      {nextProject.title}
                    </h4>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Ready to build your company's next competitive advantage?"
            description="From MVPs to high-availability multi-tenant cloud platforms, our Nairobi engineering studio is ready to deploy."
            primaryAction={{
              label: "Discuss Your Project",
              href: `/contact?service=${project.serviceSlug}`,
            }}
            secondaryAction={{
              label: "All Case Studies",
              href: "/work",
            }}
          />
        </Container>
      </main>
    </>
  );
}
