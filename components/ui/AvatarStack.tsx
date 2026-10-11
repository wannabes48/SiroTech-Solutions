import React from "react";
import { Plus } from "lucide-react";
import { teamMembers } from "@/data/team";

export interface AvatarItem {
  photo?: string;
  name?: string;
  initials?: string;
}

export function AvatarStack({
  avatars,
  size = "md",
  showPlus = true,
  className = "",
}: {
  avatars?: (string | AvatarItem)[];
  size?: "sm" | "md" | "lg";
  showPlus?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-12 h-12 text-sm",
  };

  // Default to real team members from data/team.ts
  const items: AvatarItem[] = (
    avatars ||
    teamMembers.map((m) => ({
      photo: m.photo,
      name: m.name,
      initials: m.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase(),
    }))
  ).map((a) => (typeof a === "string" ? { photo: a } : a));

  return (
    <div className={`flex items-center -space-x-3 ${className}`.trim()}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`${sizeClasses[size]} rounded-full border-2 border-white dark:border-ink overflow-hidden bg-sage-300 relative shadow-xs shrink-0 flex items-center justify-center font-bold text-sage-900 select-none`}
          title={item.name || `Team Member ${idx + 1}`}
        >
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.name || `Avatar ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <span>{item.initials || "ST"}</span>
          )}
        </div>
      ))}
      {showPlus && (
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-white bg-ink text-white flex items-center justify-center font-bold relative z-10 shrink-0 shadow-xs`}
          title="Senior Engineering Team"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      )}
    </div>
  );
}
