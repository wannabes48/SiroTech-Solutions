"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Lock,
  Building,
  FolderGit2,
  Paperclip,
  Check,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { postProjectMessageAction, toggleMessageHandledAction } from "@/app/admin/actions";

interface MessageItem {
  id: string;
  project_id: string;
  project_title: string;
  org_name: string;
  author_id?: string;
  author_name: string;
  author_role: string;
  is_staff: boolean;
  is_internal?: boolean;
  is_handled?: boolean;
  content: string;
  attachment_name?: string;
  attachment_url?: string;
  created_at: string;
}

interface ProjectOption {
  id: string;
  title: string;
  org_name: string;
}

interface AdminMessagesClientProps {
  initialMessages: MessageItem[];
  projects: ProjectOption[];
}

export function AdminMessagesClient({ initialMessages, projects }: AdminMessagesClientProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNHANDLED" | "CLIENT" | "INTERNAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");

  // Quick Reply Composer State
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyProjectId, setReplyProjectId] = useState<string>(projects[0]?.id || "");
  const [replyContent, setReplyContent] = useState("");
  const [replyIsInternal, setReplyIsInternal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered messages
  const filteredMessages = messages.filter((m) => {
    // Project filter
    if (selectedProjectId !== "ALL" && m.project_id !== selectedProjectId) {
      return false;
    }

    // Tab filter
    if (activeTab === "UNHANDLED" && (m.is_staff || m.is_handled)) {
      return false;
    }
    if (activeTab === "CLIENT" && m.is_staff) {
      return false;
    }
    if (activeTab === "INTERNAL" && !m.is_internal) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (m.content || "").toLowerCase().includes(q);
      const matchAuthor = (m.author_name || "").toLowerCase().includes(q);
      const matchOrg = (m.org_name || "").toLowerCase().includes(q);
      const matchProj = (m.project_title || "").toLowerCase().includes(q);
      return matchText || matchAuthor || matchOrg || matchProj;
    }

    return true;
  });

  const unhandledCount = messages.filter((m) => !m.is_staff && !m.is_handled).length;
  const clientCount = messages.filter((m) => !m.is_staff).length;
  const internalCount = messages.filter((m) => m.is_internal).length;

  const handleToggleHandled = (msgId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    startTransition(async () => {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, is_handled: newVal } : m))
      );
      const res = await toggleMessageHandledAction(msgId, newVal);
      if (res?.error) {
        showToast(`Failed: ${res.error}`);
        // Revert
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, is_handled: currentVal } : m))
        );
      } else {
        showToast(newVal ? "Message marked as handled" : "Message marked as requiring attention");
      }
    });
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyProjectId) return;

    startTransition(async () => {
      const res = await postProjectMessageAction(replyProjectId, replyContent, replyIsInternal);
      if (res?.error) {
        showToast(`Error sending message: ${res.error}`);
      } else {
        showToast(replyIsInternal ? "Internal staff note recorded" : "Client reply sent successfully");
        setReplyContent("");
        setReplyOpen(false);
      }
    });
  };

  const openReplyForMessage = (m: MessageItem) => {
    setReplyProjectId(m.project_id);
    setReplyIsInternal(false);
    setReplyOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar: Filters, Search, and Compose Action */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === "ALL"
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-white border border-rule text-body hover:bg-surface/50"
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("UNHANDLED")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "UNHANDLED"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white border border-rule text-body hover:bg-surface/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Needs Action ({unhandledCount})</span>
          </button>
          <button
            onClick={() => setActiveTab("CLIENT")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === "CLIENT"
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-white border border-rule text-body hover:bg-surface/50"
            }`}
          >
            Client Inbound ({clientCount})
          </button>
          <button
            onClick={() => setActiveTab("INTERNAL")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "INTERNAL"
                ? "bg-amber-700 text-white shadow-xs"
                : "bg-white border border-rule text-body hover:bg-surface/50"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Internal Notes ({internalCount})</span>
          </button>
        </div>

        {/* Action Button: Quick Reply */}
        <button
          onClick={() => {
            setReplyOpen(true);
            setReplyIsInternal(false);
          }}
          className="px-5 py-2.5 rounded-full bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-xs flex items-center justify-center gap-2 self-start lg:self-auto shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch New Message</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-rule/80 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search communications by keywords, client name, staff, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-surface/50 border border-rule/80 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Project:</span>
          </div>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full md:w-60 px-3 py-2 rounded-xl text-xs bg-surface/50 border border-rule/80 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-body font-medium"
          >
            <option value="ALL">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.org_name} &bull; {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs divide-y divide-rule/60 overflow-hidden">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((m) => {
            const isUnhandledClient = !m.is_staff && !m.is_handled;
            return (
              <div
                key={m.id}
                className={`p-5 flex flex-col sm:flex-row items-start justify-between gap-4 transition-colors ${
                  m.is_internal
                    ? "bg-amber-50/40 hover:bg-amber-50/60"
                    : isUnhandledClient
                    ? "bg-emerald-50/20 hover:bg-emerald-50/40"
                    : "hover:bg-surface/30"
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Metadata Header */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-ink">{m.author_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        m.is_staff
                          ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                          : "bg-surface border-rule text-muted"
                      }`}
                    >
                      {m.author_role || (m.is_staff ? "Staff Specialist" : "Client")}
                    </span>

                    {m.is_internal && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Staff Internal Note
                      </span>
                    )}

                    {!m.is_staff && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          m.is_handled
                            ? "bg-gray-100 text-gray-700 border-gray-200"
                            : "bg-amber-100 text-amber-900 border-amber-200 animate-pulse"
                        }`}
                      >
                        {m.is_handled ? "Handled" : "Needs Attention"}
                      </span>
                    )}

                    <span className="text-muted">&bull;</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1">
                      <Building className="w-3 h-3 text-muted" />
                      {m.org_name}
                    </span>
                    <span className="text-muted">({m.project_title})</span>
                  </div>

                  {/* Body Content */}
                  <p className="text-xs text-body leading-relaxed whitespace-pre-wrap font-normal">
                    {m.content}
                  </p>

                  {/* Attachments if any */}
                  {m.attachment_name && (
                    <div className="pt-1">
                      <a
                        href={m.attachment_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-rule text-xs font-semibold text-ink hover:text-emerald-800 hover:border-emerald-700/50 transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-muted" />
                        <span>{m.attachment_name}</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Side: Timestamp and Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-rule/50">
                  <span className="text-[11px] text-muted">
                    {new Date(m.created_at).toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short"
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Mark Handled Toggle (for client messages) */}
                    {!m.is_staff && (
                      <button
                        onClick={() => handleToggleHandled(m.id, Boolean(m.is_handled))}
                        disabled={isPending}
                        title={m.is_handled ? "Mark as needing attention" : "Mark as handled"}
                        className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                          m.is_handled
                            ? "border-rule bg-white text-muted hover:text-ink hover:border-gray-400"
                            : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        {m.is_handled ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Quick Reply Button */}
                    <button
                      onClick={() => openReplyForMessage(m)}
                      className="px-2.5 py-1 rounded-lg border border-rule bg-white hover:bg-surface text-xs font-semibold text-body hover:text-ink transition"
                    >
                      Reply
                    </button>

                    {/* Link to Project Hub */}
                    <Link
                      href={adminPath(`/projects/${m.project_id}`)}
                      className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Project Hub</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-muted mx-auto" />
            <p className="text-xs text-muted">No messages matching current criteria.</p>
          </div>
        )}
      </div>

      {/* Quick Reply Drawer / Modal */}
      {replyOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-rule shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-ink">Dispatch Message</h3>
                <p className="text-xs text-muted">
                  Post a message directly into the client project communication feed.
                </p>
              </div>
              <button
                onClick={() => setReplyOpen(false)}
                className="text-muted hover:text-ink text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Target Project</label>
                <select
                  value={replyProjectId}
                  onChange={(e) => setReplyProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-surface border border-rule font-medium focus:ring-1 focus:ring-emerald-700 outline-none"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.org_name} &bull; {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-ink">Message Body</label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={replyIsInternal}
                      onChange={(e) => setReplyIsInternal(e.target.checked)}
                      className="rounded border-rule text-amber-600 focus:ring-amber-500"
                    />
                    <span
                      className={`font-semibold ${
                        replyIsInternal ? "text-amber-800" : "text-muted"
                      }`}
                    >
                      Confidential Staff Note (Internal Only)
                    </span>
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={
                    replyIsInternal
                      ? "Write confidential notes regarding sprints, technical hurdles, or handoffs visible only to SiroTech staff..."
                      : "Type your client update or response..."
                  }
                  className={`w-full p-3.5 rounded-2xl text-xs border outline-none focus:ring-1 ${
                    replyIsInternal
                      ? "bg-amber-50/50 border-amber-300 focus:ring-amber-500 text-amber-950 placeholder:text-amber-600/60"
                      : "bg-surface border-rule focus:ring-emerald-700 text-body"
                  }`}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-muted">
                  {replyIsInternal
                    ? "Clients will never see this message in their portal."
                    : "The client will be notified in their portal communication feed."}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyOpen(false)}
                    className="px-4 py-2 rounded-full border border-rule text-xs font-semibold text-body hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !replyContent.trim()}
                    className={`px-5 py-2 rounded-full text-xs font-semibold text-white shadow-xs transition flex items-center gap-1.5 ${
                      replyIsInternal
                        ? "bg-amber-700 hover:bg-amber-600"
                        : "bg-emerald-800 hover:bg-emerald-700"
                    } disabled:opacity-50`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPending ? "Sending..." : "Send Now"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
