import { portalPath } from "@/lib/hosts";
import React from "react";
import { Calendar } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getPortalProjects, getPortalMessages } from "@/lib/portal-db";
import { PageHeader } from "@/components/portal/shared/PageHeader";
import { MessageThread } from "@/components/portal/shared/MessageThread";

export default async function PortalMessagesPage() {
  const user = await requireUser();
  const projects = await getPortalProjects(user.orgId);
  const primaryProject = projects[0];
  const dbMessages = await getPortalMessages(user.orgId, primaryProject?.id);

  const initialMessages = dbMessages.map((m: any) => ({
    id: m.id,
    projectId: m.project_id,
    authorName: m.author_name,
    authorRole: m.author_role || (m.is_staff ? "Lead Architect" : "Client Operations"),
    isStaff: m.is_staff,
    content: m.content,
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    attachment: m.attachment_name
      ? { name: m.attachment_name, size: m.attachment_size || "" }
      : undefined,
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <PageHeader
        title="Team Messages"
        subtitle="Direct communication line with Daniel Siro, Kevin Mutua, and technical architecture leads."
        badge={user.orgName}
        primaryAction={{
          label: "Schedule a sync",
          href: portalPath("/book"),
          icon: "calendar",
        }}
      />

      <MessageThread
        initialMessages={initialMessages}
        projectId={primaryProject?.id}
        currentUser={{
          id: user.id,
          name: user.name,
          role: user.orgRole === "OWNER" ? "Account Owner" : "Team Member",
        }}
      />
    </div>
  );
}
