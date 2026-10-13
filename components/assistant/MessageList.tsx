"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Msg } from "./useAssistant";
import { NavCard } from "./cards/NavCard";
import { ContactCard } from "./cards/ContactCard";
import { ProjectEnquiryCard } from "./cards/ProjectEnquiryCard";
import { HumanCard } from "./cards/HumanCard";
import { Logo } from "@/components/brand/Logo";
import { trackAssistantEvent } from "@/lib/assistant/analytics";

export interface MessageListProps {
  msgs: Msg[];
  busy: boolean;
  onSend: (text: string) => void;
  onNavigate?: () => void;
}

export function MessageList({ msgs, busy, onSend, onNavigate }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const handleThumb = (messageId: string, rating: "up" | "down") => {
    setFeedback((cur) => ({ ...cur, [messageId]: rating }));
    trackAssistantEvent({ name: "assistant_thumbs", rating, messageId });
  };

  // Compute live announce text for screen readers (announces completed assistant message)
  const lastCompletedMessage = [...msgs]
    .reverse()
    .find((m) => m.role === "assistant" && m.text.length > 0)?.text;

  return (
    <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs sm:text-sm">
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {!busy && lastCompletedMessage ? `Assistant says: ${lastCompletedMessage}` : ""}
      </div>

      {msgs.map((msg, index) => {
        const isUser = msg.role === "user";
        const isLast = index === msgs.length - 1;

        // Skip completely empty assistant drafts that haven't received text or ui yet and aren't busy
        if (!isUser && !msg.text && msg.ui.length === 0 && (!isLast || !busy)) {
          return null;
        }

        const canShowFeedback =
          !isUser &&
          !msg.local &&
          msg.text.length > 0 &&
          (!isLast || !busy);

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div className={`flex gap-2 max-w-[90%] sm:max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-[#1B2E24] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Logo variant="mark-dark" className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div className="flex flex-col gap-1.5 w-full">
                {(msg.text || (isLast && busy && !msg.text)) && (
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed break-words shadow-2xs ${
                      isUser
                        ? "bg-[#1B2E24] text-white rounded-br-xs ml-auto"
                        : "bg-[#f7f7f5] text-ink border border-rule/70 rounded-bl-xs"
                    }`}
                  >
                    {msg.text ? (
                      <div className="prose prose-xs max-w-none text-current leading-relaxed">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => (
                              <strong className="font-bold text-current">{children}</strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 mb-2 space-y-1 last:mb-0">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-4 mb-2 space-y-1 last:mb-0">{children}</ol>
                            ),
                            li: ({ children }) => <li>{children}</li>,
                            a: ({ href, children }) => {
                              const safe =
                                href &&
                                (href.startsWith("/") ||
                                  href.startsWith("mailto:") ||
                                  href.startsWith("https://wa.me/"));
                              if (!safe) return <span>{children}</span>;
                              return (
                                <a
                                  href={href}
                                  target={href.startsWith("/") ? undefined : "_blank"}
                                  rel="noopener noreferrer"
                                  className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                                >
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>

                        {/* Feedback Thumbs (S12) */}
                        {canShowFeedback && (
                          <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-rule/40 text-[10px] text-muted">
                            <span className="text-[10px] text-muted/80">Helpful?</span>
                            <button
                              type="button"
                              onClick={() => handleThumb(msg.id, "up")}
                              aria-label="Thumbs up"
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                feedback[msg.id] === "up"
                                  ? "text-emerald-600 bg-emerald-50"
                                  : "text-muted hover:text-ink hover:bg-black/5"
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleThumb(msg.id, "down")}
                              aria-label="Thumbs down"
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                feedback[msg.id] === "down"
                                  ? "text-red-600 bg-red-50"
                                  : "text-muted hover:text-ink hover:bg-black/5"
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : isLast && busy ? (
                      /* Typing indicator */
                      <div className="flex items-center gap-1.5 py-1 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Attached UI Cards */}
                {msg.ui && msg.ui.length > 0 && (
                  <div className="space-y-2 w-full">
                    {msg.ui.map((u, i) => {
                      if (u.kind === "nav") {
                        return (
                          <NavCard
                            key={i}
                            path={u.path}
                            label={u.label}
                            onNavigate={onNavigate}
                          />
                        );
                      }
                      if (u.kind === "contact") {
                        return (
                          <ContactCard
                            key={i}
                            hint={u.hint}
                            onSuccess={(info) => {
                              // Card collapses internally; local confirmation line already shown
                            }}
                          />
                        );
                      }
                      if (u.kind === "project") {
                        return (
                          <ProjectEnquiryCard
                            key={i}
                            prefill={u.prefill}
                            msgs={msgs}
                            onSuccess={onNavigate}
                          />
                        );
                      }
                      if (u.kind === "human") {
                        return <HumanCard key={i} onNavigate={onNavigate} />;
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
