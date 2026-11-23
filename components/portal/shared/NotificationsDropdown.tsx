import { portalPath } from "@/lib/hosts";
import React, { useState, useRef, useEffect, useCallback } from "react";
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
  ArrowRight,
} from "lucide-react";
import {
  PortalNotification,
  NotificationType,
} from "@/data/portal-data";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/portal/actions";

export interface NotificationsDropdownProps {
  className?: string;
}

export function NotificationsDropdown({ className = "" }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(() => {
    fetch("/api/portal/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.notifications && Array.isArray(data.notifications)) {
          const mapped: PortalNotification[] = data.notifications.map((n: any) => ({
            id: n.id,
            type: (n.type || "UPDATE").toLowerCase() as NotificationType,
            title: n.title,
            description: n.description,
            timestamp: new Date(n.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: Boolean(n.is_read),
            targetHref: portalPath(n.target_href || "/"),
          }));
          setNotifications(mapped);
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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsReadAction();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleNotificationClick = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setIsOpen(false);
    try {
      await markNotificationReadAction(id);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "milestone":
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case "invoice":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "ticket":
        return <LifeBuoy className="w-4 h-4 text-emerald-600" />;
      case "update":
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case "file":
        return <FileText className="w-4 h-4 text-purple-600" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "invite":
        return <UserPlus className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-muted" />;
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
        className="p-2 rounded-xl border border-rule hover:bg-surface text-ink relative transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4 text-ink" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white ring-1 ring-emerald-600/20 animate-pulse" />
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
                  When sprint updates or deliverables are issued, notifications will appear here.
                </p>
              </div>
            ) : (
              notifications.slice(0, 8).map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.targetHref}
                  onClick={() => handleNotificationClick(notif.id)}
                  className={`flex items-start gap-3 p-4 transition-colors block text-left ${
                    notif.read ? "hover:bg-surface" : "bg-emerald-50/30 hover:bg-emerald-50/60"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-rule flex items-center justify-center shrink-0 mt-0.5">
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
                      {notif.timestamp}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-3 bg-[#F8FAF9] border-t border-rule/80 text-center">
            <Link
              href={portalPath("/notifications")}
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
