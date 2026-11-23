"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Clock, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { ProjectMessage } from "@/data/portal-data";

export interface MessageThreadProps {
  initialMessages: ProjectMessage[];
  projectId?: string;
  currentUser?: {
    id?: string;
    name?: string;
    role?: string;
  };
  onSendMessage?: (content: string, attachment?: { name: string; size: string }) => void;
  className?: string;
}

export function MessageThread({
  initialMessages,
  projectId,
  currentUser,
  onSendMessage,
  className = "",
}: MessageThreadProps) {
  const [messages, setMessages] = useState<ProjectMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; size: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 15-second polling simulation to provide a live collaborative feel
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate passive background polling check
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !pendingFile) return;

    setSending(true);
    const newMsg: ProjectMessage = {
      id: `msg_${Date.now()}`,
      projectId,
      authorName: currentUser?.name || "You",
      authorRole: currentUser?.role || "Account Owner",
      isStaff: false,
      content: inputText.trim(),
      timestamp: "Just now",
      attachment: pendingFile || undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (projectId) {
      import("@/app/portal/actions").then(({ sendMessageAction }) => {
        sendMessageAction(projectId, inputText.trim(), pendingFile?.name, pendingFile?.size);
      }).catch(() => {});
    }
    if (onSendMessage) {
      onSendMessage(inputText.trim(), pendingFile || undefined);
    }
    setInputText("");
    setPendingFile(null);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    }
  };

  return (
    <div className={`flex flex-col h-[520px] rounded-3xl bg-white border border-rule/80 shadow-xs overflow-hidden ${className}`}>
      {/* Top Banner: SLA / Response Note */}
      <div className="px-6 py-3 bg-[#F8FAF9] border-b border-rule/80 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Typically replies within 1 business day &bull; 2-hour Sev-1 SLA</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Engineering on-call live</span>
        </div>
      </div>

      {/* Message Bubbles Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isStaff = msg.isStaff;

          return (
            <React.Fragment key={msg.id || idx}>
              {/* Optional unread divider before the latest message */}
              {idx === messages.length - 1 && !isStaff && (
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-rule" />
                  </div>
                  <span className="relative bg-white px-3 text-[10px] font-bold text-muted uppercase tracking-wider">
                    Recent Messages
                  </span>
                </div>
              )}

              <div className={`flex flex-col ${isStaff ? "items-start" : "items-end"}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-bold text-ink">{msg.authorName || msg.senderName}</span>
                  <span className="text-[10px] text-muted">&bull; {msg.authorRole || msg.senderRole}</span>
                  <span className="text-[10px] text-muted">&bull; {msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-md sm:max-w-lg rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                    isStaff
                      ? "bg-[#F8FAF9] text-ink border border-rule rounded-tl-sm"
                      : "bg-[#1B2E24] text-white rounded-tr-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Attachment Pill if present */}
                  {msg.attachment && (
                    <div
                      className={`mt-2.5 p-2 rounded-xl flex items-center gap-2 text-xs border ${
                        isStaff
                          ? "bg-white border-rule text-ink"
                          : "bg-white/10 border-white/20 text-white"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-semibold truncate flex-1">{msg.attachment.name}</span>
                      <span className="text-[10px] opacity-70">{msg.attachment.size}</span>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Bottom Form */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-rule/80">
        {pendingFile && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-sage-100 border border-sage-300 flex items-center justify-between text-xs">
            <span className="font-semibold text-sage-900 truncate">
              Attached: {pendingFile.name} ({pendingFile.size})
            </span>
            <button
              type="button"
              onClick={() => setPendingFile(null)}
              className="text-muted hover:text-ink text-xs font-bold ml-2"
            >
              &times;
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-surface rounded-2xl border border-rule p-2 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-muted hover:text-ink hover:bg-rule/50 transition-colors cursor-pointer"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message to the engineering team... (Press Enter to send)"
            className="flex-1 bg-transparent border-0 focus:outline-none resize-none text-xs sm:text-sm text-ink placeholder:text-muted py-1.5 px-2"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !pendingFile}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
