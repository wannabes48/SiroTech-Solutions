"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface PortalAutoSyncProps {
  /** Polling interval in milliseconds. Defaults to 20,000 (20s). */
  intervalMs?: number;
}

/**
 * Background auto-sync monitor for the Client Portal.
 * Periodically refreshes server component data (sprint updates, milestone approvals,
 * support replies, messages, invoice status) and refreshes on tab refocus.
 */
export function PortalAutoSync({ intervalMs = 20000 }: PortalAutoSyncProps) {
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
      // Do not refresh if tab is in the background or user is actively typing in a form
      if (document.visibilityState !== "visible") return;
      if (isUserInteracting()) return;

      routerRef.current.refresh();
    };

    // 1. Periodic background polling timer
    const timer = setInterval(triggerRefresh, intervalMs);

    // 2. Immediate refresh when client returns to the browser tab
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
