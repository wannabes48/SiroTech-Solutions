import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminTasks } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTasksClient } from "./AdminTasksClient";

export default async function AdminTasksPage() {
  await requireStaffUser();
  const tasks = await getAdminTasks();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Tasks &amp; Operational To-Dos"
        subtitle="Track engineering sprints, lead follow-ups, and milestone deliveries across the organization."
        breadcrumbs={[{ label: "Tasks" }]}
      />

      <AdminTasksClient initialTasks={tasks} />
    </div>
  );
}
