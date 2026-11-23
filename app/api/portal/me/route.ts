import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import {
  getPortalNotifications,
  getPortalOrganization,
  getPortalTeamMembers,
  getPortalNotificationPreferences,
} from "@/lib/portal-db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null, notifications: [] }, { status: 401 });
  }

  try {
    const [notifications, organization, teamMembers, notificationPreferences] = await Promise.all([
      getPortalNotifications(user.orgId, user.id),
      getPortalOrganization(user.orgId),
      getPortalTeamMembers(user.orgId),
      getPortalNotificationPreferences(user.id),
    ]);

    return NextResponse.json({
      user,
      organization,
      teamMembers,
      notificationPreferences,
      notifications,
    });
  } catch (err) {
    console.error("[Portal ME Error]", err);
    return NextResponse.json({ user, notifications: [] });
  }
}

