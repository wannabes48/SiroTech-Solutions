"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CaseStudy } from "@/data/work";
import { PillTag } from "@/components/ui/PillTag";
import { ReadMore } from "@/components/shared/read-more";
import { 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  Cpu, 
  Car, 
  Coins, 
  Users, 
  Blocks,
  X
} from "lucide-react";

interface WorkFilterProps {
  initialCaseStudies: CaseStudy[];
}

export function WorkFilter({ initialCaseStudies }: WorkFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedIndustry = searchParams.get("industry") || "all";
  const selectedService = searchParams.get("service") || "all";

  // Derive available unique industries and services
  const industries = useMemo(() => {
    const list = Array.from(new Set(initialCaseStudies.map((c) => c.industry)));
    return ["all", ...list];
  }, [initialCaseStudies]);

  const services = useMemo(() => {
    const list = Array.from(new Set(initialCaseStudies.map((c) => c.serviceTitle)));
    return ["all", ...list];
  }, [initialCaseStudies]);

  // Update query params without full page reload
  const updateFilter = (type: "industry" | "service", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(type);
    } else {
      params.set(type, value);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  // Filtered case studies
  const filteredProjects = useMemo(() => {
    return initialCaseStudies.filter((project) => {
      const matchIndustry =
        selectedIndustry === "all" ||
        project.industry.toLowerCase() === selectedIndustry.toLowerCase() ||
        project.industrySlug.toLowerCase() === selectedIndustry.toLowerCase();

      const matchService =
        selectedService === "all" ||
        project.serviceTitle.toLowerCase() === selectedService.toLowerCase() ||
        project.serviceSlug.toLowerCase() === selectedService.toLowerCase();

      return matchIndustry && matchService;
    });
  }, [initialCaseStudies, selectedIndustry, selectedService]);

  const hasActiveFilters = selectedIndustry !== "all" || selectedService !== "all";

  const getIndustryIcon = (ind: string) => {
    const lower = ind.toLowerCase();
    if (lower.includes("auto")) return <Car className="w-3.5 h-3.5" />;
    if (lower.includes("fintech") || lower.includes("credit")) return <Coins className="w-3.5 h-3.5" />;
    if (lower.includes("hr") || lower.includes("talent")) return <Users className="w-3.5 h-3.5" />;
    if (lower.includes("web3") || lower.includes("auction")) return <Blocks className="w-3.5 h-3.5" />;
    return <Layers className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-12">
      {/* Filter Control Bar */}
      <div className="bg-surface rounded-[28px] p-6 sm:p-8 border border-rule shadow-xs space-y-6">
        {/* Industry Filter Chips */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              Filter By Domain
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-800 hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {industries.map((ind) => {
              const isActive =
                (ind === "all" && selectedIndustry === "all") ||
                ind.toLowerCase() === selectedIndustry.toLowerCase();

              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => updateFilter("industry", ind)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-ink text-white shadow-xs"
                      : "bg-white text-ink border border-rule hover:border-ink/30 hover:bg-sage-50"
                  }`}
                >
                  {ind !== "all" && getIndustryIcon(ind)}
                  <span>{ind === "all" ? "All Domains" : ind}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Service / Capability Filter Chips */}
        <div className="pt-2 border-t border-rule/60">
          <span className="text-xs font-bold uppercase tracking-widest text-muted block mb-3">
            Filter By Capability
          </span>
          <div className="flex flex-wrap gap-2.5">
            {services.map((srv) => {
              const isActive =
                (srv === "all" && selectedService === "all") ||
                srv.toLowerCase() === selectedService.toLowerCase();

              return (
                <button
                  key={srv}
                  type="button"
                  onClick={() => updateFilter("service", srv)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-sage-700 text-white shadow-xs"
                      : "bg-white text-ink border border-rule hover:border-ink/30 hover:bg-sage-50"
                  }`}
                >
                  {srv !== "all" && <Cpu className="w-3.5 h-3.5" />}
                  <span>{srv === "all" ? "All Capabilities" : srv}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs font-medium text-muted pt-2 border-t border-rule/40">
          <span>
            Showing <strong className="text-ink">{filteredProjects.length}</strong> of{" "}
            {initialCaseStudies.length} case studies
          </span>
          {(selectedIndustry !== "all" || selectedService !== "all") && (
            <span className="italic">
              Active filters: {selectedIndustry !== "all" && `[${selectedIndustry}] `}
              {selectedService !== "all" && `[${selectedService}]`}
            </span>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-surface rounded-[32px] p-16 text-center border border-rule">
          <div className="w-14 h-14 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">No matching case studies</h3>
          <p className="text-body text-sm max-w-md mx-auto mb-6">
            We haven&apos;t listed a case study matching this specific combination yet, but our studio frequently delivers custom architectures in this space.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-6 py-2.5 rounded-full bg-ink text-white text-xs font-bold tracking-wider uppercase hover:bg-sage-700 transition-colors cursor-pointer"
          >
            Clear Active Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <article
              key={project.slug}
              className="group bg-surface rounded-[32px] p-8 sm:p-10 border border-rule hover:border-ink/20 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Interface Preview */}
                <div
                  className={`w-full aspect-[16/10] rounded-[24px] ${project.heroBgColor} border border-rule/60 p-6 flex flex-col justify-between mb-8 relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between z-10">
                    <PillTag variant="white" className="border border-rule">
                      {project.industry}
                    </PillTag>
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
    </div>
  );
}
