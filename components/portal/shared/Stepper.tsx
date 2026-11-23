import React from "react";
import { Check } from "lucide-react";

export type ProjectPhase = "PLANNING" | "DESIGN" | "BUILD" | "TESTING" | "LIVE";

export interface StepperProps {
  currentPhase: ProjectPhase;
  className?: string;
}

const PHASES: { key: ProjectPhase; label: string; description: string }[] = [
  { key: "PLANNING", label: "Planning", description: "Architecture & Scope" },
  { key: "DESIGN", label: "Design", description: "UI/UX & Schemas" },
  { key: "BUILD", label: "Build", description: "Sprint Execution" },
  { key: "TESTING", label: "Testing", description: "Staging & QA" },
  { key: "LIVE", label: "Live", description: "Production & SLA" },
];

export function Stepper({ currentPhase, className = "" }: StepperProps) {
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase);
  const activeIndex = currentIndex === -1 ? 2 : currentIndex;

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-5 gap-2 relative">
        {PHASES.map((phase, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={phase.key} className="flex flex-col items-center text-center relative group">
              {/* Connector line behind */}
              {idx < PHASES.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                    idx < activeIndex ? "bg-emerald-600" : "bg-rule"
                  }`}
                />
              )}

              {/* Circle node */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-sage-100 text-ink border-2 border-emerald-600 ring-4 ring-emerald-600/15"
                    : "bg-surface text-muted border border-rule"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <span>{idx + 1}</span>}
              </div>

              {/* Phase name & description */}
              <div className="mt-2 space-y-0.5">
                <div
                  className={`text-xs font-bold ${
                    isCurrent ? "text-emerald-800" : isCompleted ? "text-ink" : "text-muted"
                  }`}
                >
                  {phase.label}
                </div>
                <div className="text-[10px] text-muted hidden md:block">
                  {phase.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
