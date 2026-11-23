import React from "react";
import { Metadata } from "next";
import { requireUser } from "@/lib/auth-server";
import { query } from "@/lib/db";
import { getPortalNotificationPreferences, getPortalOrganization } from "@/lib/portal-db";
import { PortalWelcomeClient } from "./PortalWelcomeClient";

export const metadata: Metadata = {
  title: "Welcome to SiroTech Client Portal",
  description:
    "Complete your first-login checklist, configure your workspace notifications, and take a tour of your engineering hub.",
};

export default async function PortalWelcomePage() {
  const user = await requireUser();

  const [userRes, organization, notifPrefs] = await Promise.all([
    query<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      timezone: string | null;
      role: string;
      welcome_completed: boolean;
    }>(
      "SELECT id, name, email, phone, timezone, role, welcome_completed FROM users WHERE id = $1",
      [user.id]
    ),
    getPortalOrganization(user.orgId),
    getPortalNotificationPreferences(user.id),
  ]);

  const profile = userRes.rows[0] || {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "+254 712 345 678",
    timezone: user.timezone || "Africa/Nairobi",
    role: user.role,
    welcome_completed: false,
  };

  return (
    <PortalWelcomeClient
      user={{
        id: profile.id,
        name: profile.name || user.name || "",
        email: profile.email || user.email || "",
        phone: profile.phone || user.phone || "",
        timezone: profile.timezone || user.timezone || "Africa/Nairobi",
        welcomeCompleted: Boolean(profile.welcome_completed),
      }}
      organization={{
        id: user.orgId,
        name: organization?.name || user.orgName || "Your Organization",
      }}
      initialPrefs={notifPrefs}
    />
  );
}
