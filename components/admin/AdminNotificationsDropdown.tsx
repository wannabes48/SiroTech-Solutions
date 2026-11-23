"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Sparkles,
  MessageSquare,
  CreditCard,
  LifeBuoy,
  UserPlus,
  Calendar,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export interface AdminNotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  targetHref: string;
  read: boolean;
  timestamp: string;
  isOperational?: boolean;
}

export interface AdminNotificationsDropdownProps {
  className?: string;
}

export function AdminNotificationsDropdown({ className = "" }: AdminNotificationsDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(() => {
    fetch("/api/admin/notifications")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (data?.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});
  }, []);

  // Initial fetch and auto-refresh polling interval every 15s + on focus
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 15000);

    const handleFocus = () => {
      fetchNotifications();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read", ids: unreadIds }),
      });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleNotificationClick = async (notif: AdminNotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsOpen(false);

    try {
      fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id: notif.id }),
      }).catch(() => {});
    } catch {}

    router.push(notif.targetHref);
  };

  const getNotificationIcon = (type: string) => {
    const lower = type.toLowerCase();
    switch (lower) {
      case "ticket":
        return <LifeBuoy className="w-4 h-4 text-emerald-600" />;
      case "consultation":
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case "payment":
      case "invoice":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "lead":
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case "milestone":
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case "audit":
      case "security":
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-muted" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${unreadCount} unread notifications`}
        aria-expanded={isOpen}
        className="w-8 h-8 rounded-full border border-rule/70 flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-colors relative cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-rule/80 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-rule/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-rule/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-muted/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-ink">All caught up</p>
                <p className="text-[11px] text-muted mt-0.5">
                  When new leads, tickets, consultations, or milestone signoffs occur, alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full flex items-start gap-3 p-4 transition-colors text-left cursor-pointer ${
                    notif.read
                      ? "hover:bg-surface/80"
                      : "bg-emerald-50/30 hover:bg-emerald-50/60"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-rule flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs truncate ${
                          notif.read ? "font-semibold text-ink" : "font-bold text-ink"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.description}
                    </p>
                    <span className="text-[10px] text-muted mt-1 block font-medium">
                      {formatTimestamp(notif.timestamp)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-3 bg-[#F8FAF9] border-t border-rule/80 text-center">
            <Link
              href={adminPath("/audit")}
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View audit &amp; activity stream</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
