"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface AdminAutoSyncProps {
  /** Polling interval in milliseconds. Defaults to 25,000 (25s). */
  intervalMs?: number;
}

/**
 * Background auto-sync monitor for the Admin Control Room.
 * Periodically updates server component data to monitor for incoming client actions:
 * milestone change requests, milestone approvals, client messages, support tickets, and new leads.
 */
export function AdminAutoSync({ intervalMs = 25000 }: AdminAutoSyncProps) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const isUserInteracting = () => {
      const activeEl = document.activeElement;
      if (!activeEl) return false;
      const tag = activeEl.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      if (activeEl.getAttribute("contenteditable") === "true") return true;
      return false;
    };

    const triggerRefresh = () => {
      // Do not refresh if tab is in the background or staff is actively entering input
      if (document.visibilityState !== "visible") return;
      if (isUserInteracting()) return;

      routerRef.current.refresh();
    };

    // 1. Periodic background polling timer
    const timer = setInterval(triggerRefresh, intervalMs);

    // 2. Immediate refresh when staff tab regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    };

    const handleWindowFocus = () => {
      triggerRefresh();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [intervalMs]);

  return null;
}
