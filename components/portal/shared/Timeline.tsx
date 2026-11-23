import React from "react";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import { StatusPill } from "./StatusPill";
import { PlainStatus } from "@/data/portal-data";

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  status?: PlainStatus;
  description?: string;
  isCompleted?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = "" }: TimelineProps) {
  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-rule/80 ${className}`}>
      {items.map((item, idx) => {
        return (
          <div key={item.id || idx} className="relative group">
            {/* Dot marker */}
            <div className="absolute -left-6 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center">
              <div className={`w-1.5 h-1.5 rounded-full ${item.isCompleted ? "bg-emerald-600" : "bg-muted"}`} />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-ink">{item.title}</h4>
                  {item.status && <StatusPill status={item.status} size="sm" />}
                </div>
                <span className="text-[11px] font-semibold text-muted">{item.date}</span>
              </div>

              {item.subtitle && <p className="text-xs text-muted font-medium">{item.subtitle}</p>}
              {item.description && <p className="text-xs text-body leading-relaxed">{item.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
