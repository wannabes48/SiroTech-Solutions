"use client";

import { portalPath } from "@/lib/hosts";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Sparkles,
  MessageSquare,
  FileText,
  CreditCard,
  LifeBuoy,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { Card } from "@/components/portal/shared/Card";
import { EmptyState } from "@/components/portal/shared/EmptyState";
import { Toast } from "@/components/portal/shared/Toast";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/portal/actions";

interface NotificationsClientProps {
  initialNotifications: any[];
  orgName: string;
}

export function NotificationsClient({ initialNotifications, orgName }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchLatest = useCallback(() => {
    fetch("/api/portal/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-refresh monitoring every 15s + tab focus
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    }, 15000);

    const handleFocus = () => fetchLatest();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchLatest]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setToastMessage("All notifications marked as read.");
    try {
      await markAllNotificationsReadAction();
    } catch (err) {
      console.error("Failed to persist mark all read:", err);
    }
  };

  const handleItemClick = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationReadAction(id);
    } catch (err) {
      console.error("Failed to persist mark read:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "MILESTONE":
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case "MESSAGE":
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case "INVOICE":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "TICKET":
        return <LifeBuoy className="w-4 h-4 text-emerald-600" />;
      case "FILE":
        return <FileText className="w-4 h-4 text-purple-600" />;
      case "INVITE":
        return <UserPlus className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      <PageHeader
        title="Notifications"
        subtitle="Real-time alerts on milestone approvals, team messages, invoices, and sprint telemetry."
        badge={unreadCount > 0 ? `${unreadCount} Unread` : "All Caught Up"}
        primaryAction={
          unreadCount > 0
            ? {
                label: "Mark all read",
                onClick: handleMarkAllRead,
                icon: CheckCheck,
              }
            : undefined
        }
      />

      <div className="flex items-center gap-2 p-1 bg-surface rounded-2xl border border-rule/80 w-fit">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === "ALL" ? "bg-white text-ink shadow-2xs font-bold" : "text-muted hover:text-ink"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("UNREAD")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === "UNREAD" ? "bg-white text-ink shadow-2xs font-bold" : "text-muted hover:text-ink"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            sentence="You are all caught up! When deliverables or invoices are issued, alerts will appear here."
          />
        ) : (
          filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition-all ${
                notif.is_read ? "bg-white border-rule/80" : "bg-emerald-50/20 border-emerald-300 shadow-2xs"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-rule flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-xs ${notif.is_read ? "font-semibold text-ink" : "font-bold text-ink"}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-muted">
                      {new Date(notif.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{notif.description}</p>
                </div>

                {notif.target_href && (
                  <Link
                    href={portalPath(notif.target_href)}
                    onClick={() => handleItemClick(notif.id)}
                    className="px-3 py-1.5 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold shrink-0 transition-colors"
                  >
                    View
                  </Link>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
