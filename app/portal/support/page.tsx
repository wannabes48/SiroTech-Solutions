import { portalPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Plus,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getPortalSupportTickets } from "@/lib/portal-db";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { StatusPill } from "@/components/portal/shared/StatusPill";
import { EmptyState } from "@/components/portal/shared/EmptyState";
import { Card } from "@/components/portal/shared/Card";

export default async function SupportListPage() {
  const user = await requireUser();
  const dbTickets = await getPortalSupportTickets(user.orgId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Support Hub"
        subtitle="Direct SLA-backed technical assistance with our senior solutions architects."
        badge={user.orgName}
        primaryAction={{
          label: "Open Support Ticket",
          href: portalPath("/support/new"),
          icon: "plus",
        }}
        secondaryAction={{
          label: "Book a call",
          href: portalPath("/book"),
          icon: "calendar",
        }}
      />

      {/* SLA & Escalation Hotline Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-rule/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink">SLA Guaranteed Response</div>
            <div className="text-[11px] text-muted">&lt; 2 hrs standard &bull; &lt; 30 mins urgent</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rule/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-900 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink">Urgent Production Hotline</div>
            <div className="text-[11px] text-muted">+254 700 000 000 (Lead Engineer)</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rule/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-surface text-ink flex items-center justify-center shrink-0 border border-rule">
            <MessageCircle className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink">Engineering Lead</div>
            <div className="text-[11px] text-muted">Daniel Siro &bull; Nairobi (EAT)</div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-ink">
            Support Tickets ({dbTickets.length})
          </h2>
          <span className="text-xs text-muted">Real-time status tracking</span>
        </div>

        {dbTickets.length === 0 ? (
          <EmptyState
            title="No support tickets opened"
            sentence="Have a question or change request? Create a ticket and an engineer will respond promptly."
            action={{
              label: "Create First Ticket",
              href: portalPath("/support/new"),
            }}
          />
        ) : (
          <div className="divide-y divide-rule/70 bg-white rounded-3xl border border-rule/80 overflow-hidden shadow-xs">
            {dbTickets.map((t: any) => (
              <div
                key={t.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {t.ticket_number}
                    </span>
                    <Link
                      href={portalPath(`/support/${t.id}`)}
                      className="text-sm font-bold text-ink hover:text-emerald-700 transition-colors"
                    >
                      {t.subject}
                    </Link>
                    <StatusPill
                      status={
                        t.status === "RESOLVED"
                          ? "Done"
                          : t.status === "WAITING_ON_CLIENT"
                          ? "Waiting for you"
                          : "In progress"
                      }
                      size="sm"
                    />
                  </div>
                  <div className="text-xs text-muted flex items-center gap-2">
                    <span>Category: {t.category}</span>
                    <span>•</span>
                    <span>Priority: {t.priority}</span>
                    <span>•</span>
                    <span>Assignee: {t.assignee_name || "Daniel Siro"}</span>
                    <span>•</span>
                    <span>{t.reply_count || 0} messages</span>
                  </div>
                </div>

                <Link
                  href={portalPath(`/support/${t.id}`)}
                  className="px-4 py-1.5 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold self-start sm:self-center transition-colors"
                >
                  View Thread →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
