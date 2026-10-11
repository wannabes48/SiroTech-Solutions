"use client";

import { useState, useEffect } from "react";

export type Currency = "KES" | "USD" | "CAD";

const COOKIE_NAME = "sirotech_currency";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function useCurrency(defaultCurrency: Currency = "KES") {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const saved = getCookie(COOKIE_NAME) as Currency | null;
    if (saved && ["KES", "USD", "CAD"].includes(saved)) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setCookie(COOKIE_NAME, newCurrency);
  };

  return {
    currency,
    setCurrency,
  };
}
