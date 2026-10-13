"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, Mail, Phone, Clock, Calendar, ArrowRight } from "lucide-react";

export interface HumanCardProps {
  onNavigate?: () => void;
}

export function HumanCard({ onNavigate }: HumanCardProps) {
  const whatsapp = "https://wa.me/254745131817";
  const email = "hello@sirotech.com";
  const phone = "+254 (0) 745 131 817";
  const hours = "Mon–Fri, 8:30 AM – 6:00 PM EAT";
  const bookingUrl = "/book";

  return (
    <div className="my-2 rounded-2xl bg-white border border-rule/80 p-3.5 shadow-2xs text-xs">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-rule/60">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <h4 className="font-bold text-ink">Talk to a Human</h4>
      </div>

      <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
        Prefer direct conversation? Reach our technical leadership in Nairobi right away:
      </p>

      <div className="space-y-1.5">
        {/* WhatsApp */}
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 font-semibold hover:bg-emerald-100/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Chat on WhatsApp</span>
          </div>
          <ArrowRight className="w-3 h-3 text-emerald-700" />
        </a>

        {/* Book Call */}
        <Link
          href={bookingUrl}
          onClick={onNavigate}
          className="flex items-center justify-between p-2 rounded-xl bg-surface border border-rule text-ink font-semibold hover:bg-sage-100/70 hover:border-sage-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-sage-800 shrink-0" />
            <span>Book 30-min Technical Call</span>
          </div>
          <ArrowRight className="w-3 h-3 text-sage-800" />
        </Link>
      </div>

      {/* Details */}
      <div className="mt-2.5 pt-2 border-t border-rule/60 text-[10px] text-muted space-y-1">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-muted shrink-0" />
          <a href={`mailto:${email}`} className="hover:text-ink transition-colors font-medium">
            {email}
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="w-3 h-3 text-muted shrink-0" />
          <a href="tel:+254745131817" className="hover:text-ink transition-colors font-medium">
            {phone}
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted shrink-0" />
          <span>{hours}</span>
        </div>
      </div>
    </div>
  );
}

export default HumanCard;
