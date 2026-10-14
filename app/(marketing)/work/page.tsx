import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PillTag } from "@/components/ui/PillTag";
import { CtaBand } from "@/components/ui/CtaBand";
import { ReadMore } from "@/components/shared/read-more";
import { getCaseStudies } from "@/data/work";
import {
  ShieldCheck,
  Zap,
  Award,
  Layers,
  ArrowUpRight,
  Sparkles,
  RotateCcw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies & Client Work | SiroTech Solutions Nairobi",
  description:
    "Explore production software, AI credit models, mobile applications, and smart contract protocols engineered by SiroTech Solutions for Kenya and global clients.",
  openGraph: {
    title: "Case Studies & Engineering Work | SiroTech Solutions",
    description:
      "Production systems and hackathon-winning prototypes built with modern TypeScript, Python, and cloud infrastructure.",
    url: "https://sirotech.vercel.app/work",
  },
};

interface WorkPageProps {
  searchParams: Promise<{
    industry?: string;
    service?: string;
  }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const { industry: activeIndustry, service: activeService } = await searchParams;
  const allProjects = await getCaseStudies();

  // Distinct industries and services for server filter pills
  const industryList = [
    { label: "All Sectors", value: undefined },
    { label: "Automotive / Security", value: "automotive" },
    { label: "FinTech", value: "financial" },
    { label: "HR Tech", value: "education" },
    { label: "Web3 / Decentralized", value: "web3" },
  ];

  const serviceList = [
    { label: "All Capabilities", value: undefined },
    { label: "Mobile Apps", value: "mobile-apps" },
    { label: "AI & Automation", value: "ai-automation" },
    { label: "Custom Software", value: "custom-software" },
  ];

  // Server-side filtering
  const filteredProjects = allProjects.filter((project) => {
    const matchIndustry =
      !activeIndustry ||
      project.industrySlug.toLowerCase() === activeIndustry.toLowerCase() ||
      project.industry.toLowerCase().includes(activeIndustry.toLowerCase());

    const matchService =
      !activeService ||
      project.serviceSlug.toLowerCase() === activeService.toLowerCase();

    return matchIndustry && matchService;
  });

  // Helper to construct query link URLs
  const createFilterHref = (newIndustry?: string, newService?: string) => {
    const params = new URLSearchParams();
    if (newIndustry) params.set("industry", newIndustry);
    if (newService) params.set("service", newService);
    const qs = params.toString();
    return qs ? `/work?${qs}` : "/work";
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://sirotech.vercel.app/work#page",
        name: "Case Studies & Engineering Portfolio | SiroTech Solutions",
        description:
          "Production systems and software engineering architectures delivered by SiroTech Solutions.",
        url: "https://sirotech.vercel.app/work",
        isPartOf: {
          "@type": "WebSite",
          name: "SiroTech Solutions",
          url: "https://sirotech.vercel.app",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://sirotech.vercel.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work",
            item: "https://sirotech.vercel.app/work",
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
            <Breadcrumbs items={[{ label: "Work", href: "/work" }]} />
          </div>

          {/* Page Hero */}
          <section className="mb-14">
            <div className="max-w-3xl">
              <span className="text-muted text-xs font-bold uppercase tracking-widest block mb-3">
                Selected Engineering Work
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-6">
                Real-World Systems. Measurable Impact.
              </h1>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                A showcase of production software, privacy-first mobile networks, AI financial modeling engines, and decentralized protocols. Every build represents clean architecture, rigorous testing, and clear commercial value.
              </p>
            </div>

            {/* Quick Proof Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-10 border-t border-rule">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-ink">Award Winning</div>
                  <div className="text-xs text-muted">Buildathon finalists</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-ink">100% Privacy</div>
                  <div className="text-xs text-muted">Zero unencrypted PII</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-ink">&lt;2s Latency</div>
                  <div className="text-xs text-muted">Optimized SLAs</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-ink">Full Ownership</div>
                  <div className="text-xs text-muted">100% IP handover</div>
                </div>
              </div>
            </div>
          </section>

          {/* Server-Rendered Filter Bar */}
          <section className="mb-12">
            <div className="bg-surface rounded-[28px] p-6 sm:p-8 border border-rule shadow-xs space-y-6">
              {/* Industry Filter Row */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">
                    Filter By Industry
                  </span>
                  {(activeIndustry || activeService) && (
                    <Link
                      href="/work"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-800 hover:text-ink transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All Filters</span>
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {industryList.map((ind) => {
                    const isActive =
                      (!activeIndustry && ind.value === undefined) ||
                      activeIndustry?.toLowerCase() === ind.value?.toLowerCase();

                    return (
                      <Link
                        key={ind.label}
                        href={createFilterHref(ind.value, activeService)}
                        scroll={false}
                        className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                          isActive
                            ? "bg-ink text-white shadow-xs"
                            : "bg-white text-ink border border-rule hover:border-ink/30 hover:bg-sage-50"
                        }`}
                      >
                        {ind.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Service Filter Row */}
              <div className="pt-2 border-t border-rule/60">
                <span className="text-xs font-bold uppercase tracking-widest text-muted block mb-3">
                  Filter By Service
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {serviceList.map((srv) => {
                    const isActive =
                      (!activeService && srv.value === undefined) ||
                      activeService?.toLowerCase() === srv.value?.toLowerCase();

                    return (
                      <Link
                        key={srv.label}
                        href={createFilterHref(activeIndustry, srv.value)}
                        scroll={false}
                        className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                          isActive
                            ? "bg-sage-700 text-white shadow-xs"
                            : "bg-white text-ink border border-rule hover:border-ink/30 hover:bg-sage-50"
                        }`}
                      >
                        {srv.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Counter */}
              <div className="flex items-center justify-between text-xs font-medium text-muted pt-2 border-t border-rule/40">
                <span>
                  Showing <strong className="text-ink">{filteredProjects.length}</strong> of{" "}
                  {allProjects.length} case studies
                </span>
                {(activeIndustry || activeService) && (
                  <span className="italic">
                    Active filter: {activeIndustry && `[Industry: ${activeIndustry}] `}
                    {activeService && `[Service: ${activeService}]`}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Case Studies Grid */}
          <section className="mb-24">
            {filteredProjects.length === 0 ? (
              <div className="bg-surface rounded-[32px] p-16 text-center border border-rule">
                <div className="w-14 h-14 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  No matching case studies found
                </h3>
                <p className="text-body text-sm max-w-md mx-auto mb-6">
                  We don&apos;t have a published project matching this specific filter combination yet, but we frequently engineer tailored systems in this domain.
                </p>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink text-white text-xs font-bold tracking-wider uppercase hover:bg-sage-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredProjects.map((project) => (
                  <article
                    key={project.slug}
                    className="group bg-surface rounded-[32px] p-8 sm:p-10 border border-rule hover:border-ink/20 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Visual Interface Preview Card */}
                      <div
                        className={`w-full aspect-[16/10] rounded-[24px] ${project.heroBgColor} border border-rule/60 p-6 flex flex-col justify-between mb-8 relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.01]`}
                      >
                        <div className="flex items-center justify-between z-10">
                          <div className="flex items-center gap-2">
                            <PillTag variant="white" className="border border-rule">
                              {project.industry}
                            </PillTag>
                            {/* Concept or Demo badge */}
                            <span
                              className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                project.buildType === "Production"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : project.buildType === "Demo"
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-purple-100 text-purple-900 border-purple-300"
                              }`}
                            >
                              {project.buildType}
                            </span>
                          </div>

                          <span className="text-xs font-bold uppercase tracking-wider text-muted bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-rule/50">
                            {project.duration}
                          </span>
                        </div>

                        {/* Mockup UI Window Preview */}
                        <div className="w-full bg-white/90 backdrop-blur-md rounded-xl p-5 border border-white shadow-xs">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            </div>
                            <span className="text-[11px] font-mono text-muted uppercase">
                              {project.slug}.sirotech.internal
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-bold text-ink truncate">
                              {project.tagline}
                            </div>
                            <div className="h-2 bg-sage-200/70 rounded-full w-3/4" />
                            <div className="h-2 bg-sage-100 rounded-full w-1/2" />
                          </div>
                        </div>
                      </div>

                      {/* Meta Category & Title */}
                      <div className="mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted block mb-1">
                          {project.serviceTitle}
                        </span>
                        <Link href={`/work/${project.slug}`}>
                          <h2 className="text-2xl sm:text-3xl font-bold text-ink group-hover:text-sage-800 transition-colors leading-tight">
                            {project.title}
                          </h2>
                        </Link>
                      </div>

                      {/* Summary */}
                      <p className="text-body text-sm leading-relaxed mb-8 line-clamp-3">
                        {project.summary}
                      </p>

                      {/* Key Metrics Banner */}
                      <div className="grid grid-cols-2 gap-4 p-5 rounded-[20px] bg-bg border border-rule mb-8">
                        {project.metrics.slice(0, 2).map((m, idx) => (
                          <div key={idx}>
                            <div className="text-2xl sm:text-3xl font-extrabold text-ink tabular-nums">
                              {m.value}
                            </div>
                            <div className="text-xs font-medium text-muted uppercase tracking-wider mt-0.5">
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tech Chips */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 rounded-full bg-white text-ink text-xs font-medium border border-rule"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="px-2.5 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold">
                            +{project.technologies.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Link Footer */}
                    <div className="pt-6 border-t border-rule/60 flex items-center justify-between">
                      <ReadMore href={`/work/${project.slug}`} label="Explore Case Study" />
                      <Link
                        href={`/work/${project.slug}`}
                        className="w-10 h-10 rounded-full border border-rule flex items-center justify-center text-muted group-hover:text-ink group-hover:border-ink transition-colors"
                        aria-label={`View ${project.title}`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Bottom CtaBand */}
          <CtaBand
            headline="Have a complex technical project with rigorous requirements?"
            description="Let's review your architecture requirements, estimate timelines, and construct a detailed engineering proposal."
            primaryAction={{
              label: "Schedule Technical Consultation",
              href: "/contact",
            }}
            secondaryAction={{
              label: "Explore Our 11 Services",
              href: "/services",
            }}
          />
        </Container>
      </main>
    </>
  );
}
