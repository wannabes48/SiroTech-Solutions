"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  Users,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { Card } from "@/components/portal/shared/Card";
import { defaultPortalUser, PortalUser, portalProjects } from "@/data/portal-data";

export default function PortalBookPage() {
  const [user, setUser] = useState<PortalUser>(defaultPortalUser);
  const [selectedEventType, setSelectedEventType] = useState<"discovery" | "scoping">("discovery");
  const [calLoaded, setCalLoaded] = useState(false);
  const [bookedNotice, setBookedNotice] = useState(false);

  useEffect(() => {
    fetch("/api/portal/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            company: data.user.orgName,
            role: data.user.role,
            orgId: data.user.orgId,
            orgRole: data.user.orgRole || "OWNER",
            timezone: data.user.timezone || "Africa/Nairobi",
          });
        }
      })
      .catch(() => {});
  }, []);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleBookingRecorded = async (data: any) => {
    try {
      setIsSyncing(true);
      const booking = data?.booking || data?.payload || data || {};
      const attendee = booking?.attendees?.[0] || booking?.attendee || {};
      const responses = data?.responses || booking?.responses || {};

      const attendeeName =
        attendee?.name ||
        booking?.name ||
        responses?.name?.value ||
        responses?.name ||
        user.name ||
        "Client";

      const attendeeEmail =
        attendee?.email ||
        booking?.email ||
        responses?.email?.value ||
        responses?.email ||
        user.email ||
        "";

      const phone =
        attendee?.phone ||
        attendee?.phoneNumber ||
        responses?.phone?.value ||
        responses?.phone ||
        null;

      const startTime =
        booking?.startTime ||
        booking?.startsAt ||
        data?.startTime ||
        new Date().toISOString();

      const notes =
        responses?.notes?.value ||
        responses?.notes ||
        booking?.description ||
        booking?.title ||
        `Portal Booking (${selectedEventType}) by ${user.company}`;

      const calBookingId = String(
        booking?.uid ||
        booking?.id ||
        data?.uid ||
        data?.bookingId ||
        `cal_${Date.now()}`
      );

      if (!attendeeEmail) return;

      await fetch("/api/cal/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: attendeeName,
          email: attendeeEmail,
          phone,
          company: user.company,
          scheduledAt: startTime,
          notes,
          calBookingId,
          eventType: selectedEventType,
        }),
      });

      setBookedNotice(true);
    } catch (err) {
      console.error("[Portal Cal.com sync error]", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleWindowMessage = (e: MessageEvent) => {
        try {
          let msgData = e.data;
          if (typeof msgData === "string" && (msgData.includes("cal:") || msgData.includes("bookingSuccessful"))) {
            try {
              msgData = JSON.parse(msgData);
            } catch {}
          }

          if (
            msgData?.type === "cal:bookingSuccessful" ||
            msgData?.action === "bookingSuccessful" ||
            msgData?.event === "bookingSuccessful"
          ) {
            handleBookingRecorded(msgData.data || msgData.payload || msgData);
          }
        } catch (err) {
          console.warn("[portal handleWindowMessage error]", err);
        }
      };

      window.addEventListener("message", handleWindowMessage);
      return () => {
        window.removeEventListener("message", handleWindowMessage);
      };
    }
  }, [user, selectedEventType]);

  const calLink =
    selectedEventType === "discovery"
      ? `https://cal.com/sirotech/30min?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`
      : `https://cal.com/sirotech/60min?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Book Engineering Call"
        subtitle="Schedule a direct video consultation with Daniel Siro and senior technical leadership without leaving your portal."
        badge="Sprint Leadership Access"
      />

      {/* Booking Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setSelectedEventType("discovery")}
          className={`p-6 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-4 ${
            selectedEventType === "discovery"
              ? "bg-sage-100/60 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs"
              : "bg-white border-rule/80 hover:border-rule shadow-xs"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Weekly Standup &bull; 30 Mins
              </span>
              <Clock className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="text-base font-bold text-ink">Sprint Review &amp; Milestone Sign-off</h3>
            <p className="text-xs text-muted leading-relaxed">
              Review current staging telemetry, unblock milestone approvals, or discuss immediate sprint deliverables.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
            <span>Select 30-min slot</span>
            <span>&rarr;</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEventType("scoping")}
          className={`p-6 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-4 ${
            selectedEventType === "scoping"
              ? "bg-sage-100/60 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs"
              : "bg-white border-rule/80 hover:border-rule shadow-xs"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface text-ink border border-rule">
                Deep Dive &bull; 60 Mins
              </span>
              <Video className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="text-base font-bold text-ink">Technical Architecture &amp; New Phase Scope</h3>
            <p className="text-xs text-muted leading-relaxed">
              In-depth technical architecture blueprinting, database schema reviews, and new module Statement of Work.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
            <span>Select 60-min slot</span>
            <span>&rarr;</span>
          </div>
        </button>
      </div>

      {/* Pre-filled Workspace Context Strip */}
      <div className="p-4 rounded-2xl bg-surface border border-rule/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-muted">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Meeting will be pre-populated for <strong className="text-ink">{user.name}</strong> ({user.company}).
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Target Project:</span>
          <span className="font-semibold text-ink">{portalProjects[0].title}</span>
        </div>
      </div>

      {/* Embedded Calendar Card */}
      <Card padding="none" className="overflow-hidden shadow-md border-rule/80 bg-white min-h-[620px] flex flex-col">
        <div className="px-6 py-4 bg-[#F8FAF9] border-b border-rule/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-ink">
              {selectedEventType === "discovery" ? "30-Minute Sprint Consultation" : "60-Minute Scoping Deep-Dive"}
            </span>
          </div>
          <a
            href={calLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
          >
            <span>Open in Cal.com window</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex-1 w-full bg-white relative">
          <iframe
            src={calLink}
            title="SiroTech Engineering Scheduling Calendar"
            className="w-full h-[600px] border-0"
            allow="camera; microphone; autoplay; fullscreen"
          />
        </div>
      </Card>
    </div>
  );
}
