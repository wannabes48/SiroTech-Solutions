/**
 * Assistant Analytics Tracking Helper (S12)
 * Dispatches anonymous product telemetry events.
 * Crucially: zero message text or customer details are ever captured.
 */

export type AssistantAnalyticsEvent =
  | { name: "assistant_open" }
  | { name: "assistant_close" }
  | { name: "assistant_message"; count: number }
  | { name: "assistant_nav_click"; path: string }
  | { name: "assistant_form_shown"; kind: "contact" | "project" | "human" }
  | { name: "assistant_form_submitted"; kind: "contact" | "project" }
  | { name: "assistant_degraded"; reason?: string }
  | { name: "assistant_thumbs"; rating: "up" | "down"; messageId: string };

export function trackAssistantEvent(event: AssistantAnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    // Vercel Analytics custom event
    (window as any).va?.("event", event);

    // Google Analytics 4 event
    if (typeof (window as any).gtag === "function") {
      const { name, ...params } = event;
      (window as any).gtag("event", name, params);
    }
  } catch (err) {
    // Analytics failure should never block UI
    console.debug("[Assistant Analytics]", err);
  }
}
