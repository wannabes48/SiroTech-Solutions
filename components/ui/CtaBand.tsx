import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand({
  headline = "Tell us what you're trying to build.",
  description = "Whether you need a full-stack web application, a secure client portal, or an AI workflow, we engineer systems that scale effortlessly.",
  primaryAction = {
    label: "Start a Project",
    href: "/contact",
  },
  secondaryAction = {
    label: "Book a Consultation",
    href: "/book",
  },
  className = "",
}: {
  headline?: string;
  description?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="bg-sage-700 rounded-[32px] p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden shadow-xl">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none mix-blend-overlay" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-display text-white mb-6 leading-tight">
            {headline}
          </h2>
          {description && (
            <p className="text-sage-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {primaryAction && (
              <Button asChild variant="primary" size="lg">
                <Link href={primaryAction.href} className="inline-flex items-center gap-2">
                  {primaryAction.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
            {secondaryAction && (
              <Button asChild variant="ghost" size="lg">
                <Link href={secondaryAction.href}>
                  {secondaryAction.label}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
