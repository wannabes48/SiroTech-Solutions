"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  createCannedReplyAction,
  updateCannedReplyAction,
  deleteCannedReplyAction,
  replyContactInquiryAction,
  updateContactInquiryStatusAction
} from "@/app/admin/actions";
import {
  LifeBuoy,
  ArrowRight,
  Clock,
  AlertTriangle,
  Search,
  Star,
  CheckCircle2,
  Filter,
  Mail,
  MessageSquare,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Send,
  Building,
  User,
  Phone,
  Calendar,
  X,
  Copy,
  Tag,
  RefreshCw
} from "lucide-react";

export function AdminSupportClient({
  initialTickets,
  initialCannedReplies,
  initialContactInquiries
}: {
  initialTickets: any[];
  initialCannedReplies: any[];
  initialContactInquiries: any[];
}) {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<"TICKETS" | "CONTACT_MESSAGES" | "CANNED_REPLIES">("TICKETS");
  const [isPending, startTransition] = useTransition();

  // Tickets Filter State
  const [ticketSearch, setTicketSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [slaBreachingOnly, setSlaBreachingOnly] = useState(false);

  // Contact Inquiries Filter State
  const [inquiries, setInquiries] = useState(initialContactInquiries);
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("ALL");
  const [replyingInquiry, setReplyingInquiry] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Canned Replies State
  const [cannedReplies, setCannedReplies] = useState(initialCannedReplies);
  const [cannedSearch, setCannedSearch] = useState("");
  const [cannedCategoryFilter, setCannedCategoryFilter] = useState("ALL");
  const [editingCanned, setEditingCanned] = useState<any | null>(null);
  const [showCreateCanned, setShowCreateCanned] = useState(false);
  const [newCannedTitle, setNewCannedTitle] = useState("");
  const [newCannedCategory, setNewCannedCategory] = useState("GENERAL");
  const [newCannedBody, setNewCannedBody] = useState("");

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state with incoming server props on revalidation
  useEffect(() => {
    setInquiries(initialContactInquiries);
  }, [initialContactInquiries]);

  useEffect(() => {
    setCannedReplies(initialCannedReplies);
  }, [initialCannedReplies]);

  // Polling auto-refresh (every 10 seconds) so public inquiries and tickets arrive in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(timer);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Support queue and inquiries updated.");
    }, 800);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const now = new Date();

  // Filter Tickets
  const filteredTickets = initialTickets.filter((t) => {
    const term = ticketSearch.toLowerCase();
    const matchesSearch =
      t.subject.toLowerCase().includes(term) ||
      (t.org_name && t.org_name.toLowerCase().includes(term)) ||
      String(t.ticket_number).includes(term);

    if (!matchesSearch) return false;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    if (slaBreachingOnly) {
      if (!t.sla_due_at || t.status === "RESOLVED" || t.status === "CLOSED") return false;
      const isBreaching = new Date(t.sla_due_at).getTime() < now.getTime();
      if (!isBreaching) return false;
    }
    return true;
  });

  // Filter Contact Inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const term = inquirySearch.toLowerCase();
    const matchesSearch =
      inq.name.toLowerCase().includes(term) ||
      (inq.company && inq.company.toLowerCase().includes(term)) ||
      inq.email.toLowerCase().includes(term) ||
      (inq.service && inq.service.toLowerCase().includes(term)) ||
      (inq.message && inq.message.toLowerCase().includes(term));

    if (!matchesSearch) return false;
    if (inquiryStatusFilter !== "ALL" && inq.status !== inquiryStatusFilter) return false;
    return true;
  });

  // Filter Canned Replies
  const filteredCanned = cannedReplies.filter((c) => {
    const term = cannedSearch.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(term) ||
      (c.category && c.category.toLowerCase().includes(term)) ||
      c.body.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (cannedCategoryFilter !== "ALL" && c.category !== cannedCategoryFilter) return false;
    return true;
  });

  // Unique categories for canned replies
  const categories = ["ALL", ...Array.from(new Set(cannedReplies.map((c) => c.category || "GENERAL")))];

  // Helper to interpolate template variables
  const interpolateVariables = (template: string, data: { client_name?: string; company?: string; service?: string; ticket_number?: string }) => {
    const clientName = data.client_name || "Client";
    const company = data.company || "your organization";
    const service = data.service || "your project";
    const ticketNumber = data.ticket_number || "ST-001";
    const staffName = "SiroTech Support";

    return template
      .replace(/\{\{client_name\}\}/gi, clientName)
      .replace(/\{\{company\}\}/gi, company)
      .replace(/\{\{service\}\}/gi, service)
      .replace(/\{\{ticket_number\}\}/gi, ticketNumber)
      .replace(/\{\{staff_name\}\}/gi, staffName);
  };

  // Handle Contact Inquiry Reply
  const handleOpenReplyModal = (inq: any) => {
    setReplyingInquiry(inq);
    // Preload default greeting
    setReplyMessage(
      `Hello ${inq.name},\n\nThank you for reaching out to SiroTech Solutions regarding ${inq.service || "your project"}.\n\n`
    );
  };

  const handleApplyCannedToInquiry = (templateBody: string) => {
    if (!replyingInquiry) return;
    const interpolated = interpolateVariables(templateBody, {
      client_name: replyingInquiry.name,
      company: replyingInquiry.company || "your company",
      service: replyingInquiry.service || "custom software development"
    });
    setReplyMessage(interpolated);
  };

  const handleSendInquiryReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingInquiry || !replyMessage.trim()) return;

    startTransition(async () => {
      const res = await replyContactInquiryAction({
        inquiryId: replyingInquiry.id,
        clientEmail: replyingInquiry.email,
        clientName: replyingInquiry.name,
        replyMessage: replyMessage.trim(),
        newStatus: "CONTACTED"
      });

      if (res.success) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === replyingInquiry.id ? { ...i, status: "CONTACTED" } : i))
        );
        showToast(`Reply sent and logged for ${replyingInquiry.name}.`);
        setReplyingInquiry(null);
        setReplyMessage("");
        router.refresh();
      } else {
        alert("Failed to send reply.");
      }
    });
  };

  // Canned Replies CRUD handlers
  const handleCreateCanned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCannedTitle.trim() || !newCannedBody.trim()) return;

    startTransition(async () => {
      const res = await createCannedReplyAction({
        title: newCannedTitle.trim(),
        category: newCannedCategory.toUpperCase(),
        body: newCannedBody.trim()
      });

      if (res.success) {
        setCannedReplies((prev) => [
          ...prev,
          {
            id: res.id || `temp-${Date.now()}`,
            title: newCannedTitle.trim(),
            category: newCannedCategory.toUpperCase(),
            body: newCannedBody.trim(),
            created_at: new Date().toISOString()
          }
        ]);
        setShowCreateCanned(false);
        setNewCannedTitle("");
        setNewCannedBody("");
        showToast("Canned response created successfully.");
        router.refresh();
      }
    });
  };

  const handleUpdateCanned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCanned) return;

    startTransition(async () => {
      const res = await updateCannedReplyAction({
        id: editingCanned.id,
        title: editingCanned.title,
        category: editingCanned.category.toUpperCase(),
        body: editingCanned.body
      });

      if (res.success) {
        setCannedReplies((prev) =>
          prev.map((c) => (c.id === editingCanned.id ? { ...c, ...editingCanned } : c))
        );
        setEditingCanned(null);
        showToast("Canned response updated.");
        router.refresh();
      }
    });
  };

  const handleDeleteCanned = (id: string) => {
    if (!confirm("Are you sure you want to delete this canned response?")) return;
    startTransition(async () => {
      await deleteCannedReplyAction(id);
      setCannedReplies((prev) => prev.filter((c) => c.id !== id));
      showToast("Canned response deleted.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#1B2E24] text-white font-medium text-xs flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="text-muted hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Top View Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-rule/60 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setMainTab("TICKETS")}
            className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 ${
              mainTab === "TICKETS"
                ? "bg-[#1B2E24] text-white shadow-xs"
                : "bg-white border border-rule text-muted hover:text-ink"
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support Tickets ({initialTickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("CONTACT_MESSAGES")}
            className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 ${
              mainTab === "CONTACT_MESSAGES"
                ? "bg-[#1B2E24] text-white shadow-xs"
                : "bg-white border border-rule text-muted hover:text-ink"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Public Contact Inquiries ({inquiries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("CANNED_REPLIES")}
            className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 ${
              mainTab === "CANNED_REPLIES"
                ? "bg-[#1B2E24] text-white shadow-xs"
                : "bg-white border border-rule text-muted hover:text-ink"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Canned Responses ({cannedReplies.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            title="Refresh support queue and inquiries"
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-full bg-white border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-60 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: SUPPORT TICKETS & SLA QUEUE                       */}
      {/* ========================================================= */}
      {mainTab === "TICKETS" && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "OPEN", "WAITING_ON_CLIENT", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === st ? "bg-[#1B2E24] text-white" : "bg-white border border-rule text-muted hover:text-ink"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSlaBreachingOnly(!slaBreachingOnly)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                  slaBreachingOnly
                    ? "bg-rose-50 border-rose-300 text-rose-800"
                    : "bg-white border-rule text-muted hover:text-ink"
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${slaBreachingOnly ? "text-rose-600" : "text-muted"}`} />
                <span>SLA Breaching</span>
              </button>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  placeholder="Search tickets, client..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-6">Ticket #</th>
                    <th className="py-3 px-6">Subject &amp; Client</th>
                    <th className="py-3 px-6">Priority</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Assigned Engineer</th>
                    <th className="py-3 px-6">Last Updated</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-ink">{t.ticket_number}</td>
                        <td className="py-4 px-6">
                          <Link href={adminPath(`/support/${t.id}`)} className="font-bold text-ink hover:underline text-sm block">
                            {t.subject}
                          </Link>
                          <span className="text-[11px] text-muted">{t.org_name || "General Client"}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === "URGENT"
                                ? "bg-red-100 text-red-900 border border-red-200"
                                : t.priority === "HIGH"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-surface border border-rule text-ink"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <AdminStatusPill status={t.status} />
                        </td>
                        <td className="py-4 px-6 text-ink font-medium">{t.assignee_name || "Unassigned"}</td>
                        <td className="py-4 px-6 text-muted">
                          {new Date(t.updated_at || t.created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={adminPath(`/support/${t.id}`)}
                            className="inline-flex items-center gap-1 text-emerald-800 font-semibold hover:underline"
                          >
                            <span>Respond</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-muted">
                        No support tickets found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: PUBLIC SITE CONTACT FORM INQUIRIES                */}
      {/* ========================================================= */}
      {mainTab === "CONTACT_MESSAGES" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["ALL", "NEW", "CONTACTED", "QUALIFIED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setInquiryStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    inquiryStatusFilter === st
                      ? "bg-[#1B2E24] text-white"
                      : "bg-white border border-rule text-muted hover:text-ink"
                  }`}
                >
                  {st === "ALL" ? `All Inquiries (${inquiries.length})` : st}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder="Search visitor, email, message..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-ink text-base flex items-center gap-2">
                          <span>{inq.name}</span>
                          {inq.status === "NEW" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                              NEW INQUIRY
                            </span>
                          )}
                          {inq.status === "CONTACTED" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              CONTACTED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                          {inq.company && (
                            <span className="font-semibold text-ink flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-muted" />
                              {inq.company}
                            </span>
                          )}
                          <span>&bull;</span>
                          <span className="font-mono text-muted">{inq.email}</span>
                          {inq.phone && (
                            <>
                              <span>&bull;</span>
                              <span>{inq.phone}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className="text-[11px] text-muted whitespace-nowrap">
                        {new Date(inq.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface/70 border border-rule/60 text-xs text-ink leading-relaxed">
                      <p className="font-medium">{inq.message}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {inq.service && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-rule text-ink font-medium">
                          Need: <strong>{inq.service}</strong>
                        </span>
                      )}
                      {inq.budget && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-rule text-ink font-mono font-medium">
                          Budget: {inq.budget}
                        </span>
                      )}
                      {inq.timeline && (
                        <span className="px-2.5 py-1 rounded-lg bg-surface border border-rule text-muted">
                          Timeline: {inq.timeline}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-rule/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted">Source: Public Website Contact Form</span>

                    <button
                      type="button"
                      onClick={() => handleOpenReplyModal(inq)}
                      className="px-4 py-1.5 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply to Client</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-16 text-center text-muted bg-white rounded-3xl border border-rule">
                No contact form submissions found matching your filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: CANNED RESPONSES MANAGER                          */}
      {/* ========================================================= */}
      {mainTab === "CANNED_REPLIES" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCannedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    cannedCategoryFilter === cat
                      ? "bg-[#1B2E24] text-white"
                      : "bg-white border border-rule text-muted hover:text-ink"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cannedSearch}
                  onChange={(e) => setCannedSearch(e.target.value)}
                  placeholder="Search canned replies..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowCreateCanned(true)}
                className="py-1.5 px-4 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Canned Response</span>
              </button>
            </div>
          </div>

          {/* Variables Reference Guide Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Dynamic Variable Support:</strong> Canned responses support variables that automatically
                resolve to client details:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 font-bold">
                {"{{client_name}}"}
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 font-bold">
                {"{{company}}"}
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 font-bold">
                {"{{ticket_number}}"}
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 font-bold">
                {"{{service}}"}
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 font-bold">
                {"{{staff_name}}"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCanned.length > 0 ? (
              filteredCanned.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-3xl bg-white border border-rule/80 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink text-sm">{c.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-rule text-ink uppercase">
                        {c.category || "GENERAL"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface/60 border border-rule/60 text-xs text-body leading-relaxed whitespace-pre-wrap font-sans">
                      {c.body}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rule/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted">
                      Scope: <strong className="uppercase">{c.scope || "TICKET"}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingCanned({ ...c })}
                        className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-ink transition-colors cursor-pointer"
                        title="Edit Canned Response"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCanned(c.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-muted hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Canned Response"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-16 text-center text-muted bg-white rounded-3xl border border-rule">
                No canned responses match your filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REPLY TO PUBLIC CONTACT FORM INQUIRY               */}
      {/* ========================================================= */}
      {replyingInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>Reply to Contact Inquiry</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Sending response to <strong className="text-ink">{replyingInquiry.name}</strong> ({replyingInquiry.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingInquiry(null)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original message quote */}
            <div className="p-3 rounded-2xl bg-surface/80 border border-rule/70 text-xs">
              <span className="font-semibold text-muted block mb-1">Original Inquiry Message:</span>
              <p className="text-ink italic">&quot;{replyingInquiry.message}&quot;</p>
            </div>

            <form onSubmit={handleSendInquiryReply} className="space-y-4 text-xs">
              {/* Insert Canned Reply Dropdown */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Your Engineering Reply *</span>

                {cannedReplies.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleApplyCannedToInquiry(e.target.value);
                        e.target.value = "";
                      }}
                      className="px-2 py-1 rounded-lg bg-surface border border-rule text-xs text-ink cursor-pointer"
                    >
                      <option value="">Insert Canned Response Template...</option>
                      {cannedReplies.map((c) => (
                        <option key={c.id} value={c.body}>
                          [{c.category}] {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <textarea
                required
                rows={6}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Compose your personalized response..."
                className="w-full p-3.5 rounded-2xl bg-surface border border-rule text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30 leading-relaxed"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingInquiry(null)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply to Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE CANNED RESPONSE                             */}
      {/* ========================================================= */}
      {showCreateCanned && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">New Canned Response</h3>
              <button
                type="button"
                onClick={() => setShowCreateCanned(false)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCanned} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Response Title *</label>
                <input
                  type="text"
                  required
                  value={newCannedTitle}
                  onChange={(e) => setNewCannedTitle(e.target.value)}
                  placeholder="e.g. Milestone Acceptance Request"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Category *</label>
                <select
                  value={newCannedCategory}
                  onChange={(e) => setNewCannedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-ink font-medium"
                >
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical &amp; Bugs</option>
                  <option value="BILLING">Billing &amp; Payments</option>
                  <option value="DELIVERY">Delivery &amp; Milestones</option>
                  <option value="INQUIRIES">Public Inquiries</option>
                  <option value="CRITICAL">Critical &amp; Escalations</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-ink">Body with Dynamic Variables *</label>
                  <span className="text-[11px] text-muted">Click variable to insert</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    "{{client_name}}",
                    "{{company}}",
                    "{{ticket_number}}",
                    "{{service}}",
                    "{{staff_name}}"
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNewCannedBody((prev) => `${prev} ${v} `)}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold cursor-pointer hover:bg-emerald-100"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={5}
                  value={newCannedBody}
                  onChange={(e) => setNewCannedBody(e.target.value)}
                  placeholder="Hello {{client_name}}, we are actively working on ticket #{{ticket_number}} for {{company}}..."
                  className="w-full p-3 rounded-xl bg-surface border border-rule text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCanned(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer shadow-xs"
                >
                  Create Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT CANNED RESPONSE                               */}
      {/* ========================================================= */}
      {editingCanned && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Edit Canned Response</h3>
              <button
                type="button"
                onClick={() => setEditingCanned(null)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCanned} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Response Title</label>
                <input
                  type="text"
                  required
                  value={editingCanned.title}
                  onChange={(e) => setEditingCanned({ ...editingCanned, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Category</label>
                <select
                  value={editingCanned.category}
                  onChange={(e) => setEditingCanned({ ...editingCanned, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-ink font-medium"
                >
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical &amp; Bugs</option>
                  <option value="BILLING">Billing &amp; Payments</option>
                  <option value="DELIVERY">Delivery &amp; Milestones</option>
                  <option value="INQUIRIES">Public Inquiries</option>
                  <option value="CRITICAL">Critical &amp; Escalations</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-ink">Body with Dynamic Variables</label>
                  <span className="text-[11px] text-muted">Click to append variable</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    "{{client_name}}",
                    "{{company}}",
                    "{{ticket_number}}",
                    "{{service}}",
                    "{{staff_name}}"
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setEditingCanned({
                          ...editingCanned,
                          body: `${editingCanned.body} ${v} `
                        })
                      }
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold cursor-pointer hover:bg-emerald-100"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={5}
                  value={editingCanned.body}
                  onChange={(e) => setEditingCanned({ ...editingCanned, body: e.target.value })}
                  className="w-full p-3 rounded-xl bg-surface border border-rule text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCanned(null)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
