import React from "react";
import {
  Sparkles,
  FileText,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  GitCommit,
} from "lucide-react";
import { PortalActivity } from "@/data/portal-data";

export interface ActivityItemProps {
  activity: PortalActivity;
  className?: string;
}

export function ActivityItem({ activity, className = "" }: ActivityItemProps) {
  const getIcon = (type: PortalActivity["type"]) => {
    switch (type) {
      case "update":
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case "file":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "milestone":
        return <CheckCircle2 className="w-4 h-4 text-amber-600" />;
      default:
        return <GitCommit className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-rule/70 hover:border-rule shadow-2xs transition-colors ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-surface border border-rule/80 flex items-center justify-center shrink-0 mt-0.5">
        {getIcon(activity.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-ink truncate">{activity.title}</h4>
          <span className="text-[10px] text-muted shrink-0">{activity.timestamp}</span>
        </div>
        <p className="text-xs text-muted line-clamp-2 mt-0.5 leading-relaxed">{activity.description}</p>
        <div className="text-[10px] text-muted font-medium mt-1">
          {activity.actorName} &bull; <span className="opacity-75">{activity.projectTitle}</span>
        </div>
      </div>
    </div>
  );
}
