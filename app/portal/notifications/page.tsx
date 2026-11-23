import React from "react";
import { requireUser } from "@/lib/auth-server";
import { getPortalNotifications } from "@/lib/portal-db";
import { NotificationsClient } from "@/components/portal/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const user = await requireUser();
  const dbNotifications = await getPortalNotifications(user.orgId, user.id);

  return (
    <NotificationsClient
      initialNotifications={dbNotifications}
      orgName={user.orgName}
    />
  );
}
