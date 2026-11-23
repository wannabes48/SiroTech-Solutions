"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { PortalUser, defaultPortalUser } from "@/data/portal-data";

const AUTH_STORAGE_KEY = "sirotech_portal_user_v1";

export interface AuthContextType {
  user: PortalUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginDemo: (role?: "CLIENT" | "ADMIN") => void;
  signup: (data: { name: string; email: string; company?: string }) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  loginDemo: () => {},
  signup: async () => false,
  logout: () => {},
});

export function getInitialUser(): PortalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function useAuth() {
  return useContext(AuthContext);
}
