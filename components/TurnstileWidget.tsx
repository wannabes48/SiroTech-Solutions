"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";

export interface TurnstileWidgetRef {
  reset: () => void;
}

interface TurnstileWidgetProps {
  siteKey?: string;
  action?: string;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          action?: string;
          cdata?: string;
          theme?: "auto" | "light" | "dark";
          size?: "normal" | "flexible" | "compact";
          callback?: (token: string) => void;
          "error-callback"?: (errorCode: any) => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
    __turnstileCallbacks?: (() => void)[];
  }
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  (
    {
      siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFX3BNw6jU9raPz4",
      action = "contact",
      theme = "auto",
      size = "normal",
      onVerify,
      onExpire,
      onError,
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [, setIsLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            console.warn("Failed to reset Turnstile widget:", e);
          }
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      const initWidget = () => {
        if (!isMounted || !containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) return;

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme,
            size,
            callback: (token: string) => {
              if (isMounted) onVerify(token);
            },
            "expired-callback": () => {
              if (isMounted) onExpire?.();
            },
            "error-callback": (err: any) => {
              if (isMounted) onError?.(err);
            },
          });
          widgetIdRef.current = id;
          setIsLoaded(true);
        } catch (err) {
          console.error("Turnstile render error:", err);
        }
      };

      if (typeof window !== "undefined") {
        if (window.turnstile) {
          initWidget();
        } else {
          const existingScript = document.querySelector(
            'script[src*="challenges.cloudflare.com/turnstile"]'
          );

          if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            script.async = true;
            script.defer = true;
            script.onload = () => {
              if (window.__turnstileCallbacks) {
                window.__turnstileCallbacks.forEach((cb) => cb());
                window.__turnstileCallbacks = [];
              }
              initWidget();
            };
            document.head.appendChild(script);
          } else {
            window.__turnstileCallbacks = window.__turnstileCallbacks || [];
            window.__turnstileCallbacks.push(initWidget);
          }
        }
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch (e) {}
        }
      };
    }, [siteKey, action, theme, size, onVerify, onExpire, onError]);

    return (
      <div className={`turnstile-container flex items-center justify-start ${className}`}>
        <div ref={containerRef} className="min-h-[65px]" />
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";
