"use client";

import React, { useState } from "react";
import { teamMembers, type TeamMember } from "@/data/team";
import { X, Sparkles, CheckCircle2 } from "lucide-react";

export function TeamGrid() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="group bg-surface rounded-[24px] p-5 border border-rule hover:border-sage-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Image Container with 20px radius */}
              <div className="w-full aspect-[4/5] rounded-[20px] overflow-hidden mb-5 bg-sage-100 relative">
                <img
                  src={member.photo}
                  alt={member.alt}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                    View Full Bio →
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-ink group-hover:text-sage-700 transition-colors leading-snug">
                {member.name}
              </h3>
              <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                {member.role}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-rule/60 flex items-center justify-between text-[11px] text-muted">
              <span>{member.skills[0]} • {member.skills[1]}</span>
              <span className="font-bold text-ink group-hover:translate-x-1 transition-transform">
                +
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bio Modal Dialog */}
      {selectedMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedMember(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-bg rounded-[28px] max-w-xl w-full p-6 sm:p-8 border border-rule shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              aria-label="Close bio modal"
              className="absolute top-5 right-5 p-2 rounded-full bg-surface text-ink hover:bg-rule transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Portrait */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-sage-100 border border-rule">
                <img
                  src={selectedMember.photo}
                  alt={selectedMember.alt}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sage-700 bg-sage-100 px-3 py-1 rounded-full mb-2">
                  <Sparkles className="w-3 h-3" /> Senior Leadership
                </span>
                <h3 id="member-modal-title" className="text-2xl font-bold text-ink">
                  {selectedMember.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
                  {selectedMember.role}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-rule">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Professional Background
              </h4>
              <p className="text-body text-sm leading-relaxed">
                {selectedMember.bio}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-rule">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
                Core Engineering Capabilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedMember.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-rule text-xs font-medium text-ink"
                  >
                    <CheckCircle2 className="w-3 h-3 text-sage-700" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
