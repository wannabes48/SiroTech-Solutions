"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Ui } from "@/lib/assistant/tools";
import { trackAssistantEvent } from "@/lib/assistant/analytics";

export type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ui: Ui[];
  local?: boolean;
};

const KEY = "sirotech-chat-v1";
const WELCOME: Msg = {
  id: "w",
  role: "assistant",
  local: true,
  ui: [],
  text: "Hi, I'm the SiroTech assistant. I can answer questions, point you to the right page, or help you send us your project details.",
};

export function transcriptFrom(msgs: Msg[]) {
  return msgs
    .filter((m) => !m.local && m.text)
    .map((m) => ({ role: m.role, text: m.text }))
    .slice(-30);
}

export type DegradedShortcut =
  | "services"
  | "pricing"
  | "faq"
  | "project"
  | "contact"
  | "human";

export function useAssistant() {
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [busy, setBusy] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const abort = useRef<AbortController | null>(null);

  // Restore session
  useEffect(() => {
    try {
      const s = sessionStorage.getItem(KEY);
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMsgs(parsed);
        }
      }
    } catch {}
  }, []);

  // Persist session
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-30)));
    } catch {}
  }, [msgs]);

  // Offline detection (S11)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!navigator.onLine) {
      setDegraded(true);
      trackAssistantEvent({ name: "assistant_degraded", reason: "offline" });
    }

    const handleOffline = () => {
      setDegraded(true);
      trackAssistantEvent({ name: "assistant_degraded", reason: "offline" });
    };

    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  // Degraded mode shortcuts (S11: chips become direct shortcuts)
  const triggerShortcut = useCallback((shortcut: DegradedShortcut) => {
    let userLabel = "";
    let text = "";
    let ui: Ui[] = [];

    switch (shortcut) {
      case "services":
        userLabel = "Services";
        text = "Here is our full software engineering services overview:";
        ui = [{ kind: "nav", path: "/services", label: "Explore All Services" }];
        break;
      case "pricing":
        userLabel = "Pricing";
        text = "Here are our transparent fixed-scope plans and starter packages:";
        ui = [{ kind: "nav", path: "/pricing", label: "View Pricing Plans" }];
        break;
      case "faq":
        userLabel = "FAQ";
        text = "Here is our knowledge base and frequently asked questions:";
        ui = [{ kind: "nav", path: "/faq", label: "Read Studio FAQs" }];
        break;
      case "project":
        userLabel = "Start a project";
        text = "Provide your project requirements below to receive a scoping review:";
        ui = [{ kind: "project", prefill: {} }];
        trackAssistantEvent({ name: "assistant_form_shown", kind: "project" });
        break;
      case "contact":
        userLabel = "Contact us";
        text = "Send a direct message to our technical team in Nairobi:";
        ui = [{ kind: "contact", hint: "" }];
        trackAssistantEvent({ name: "assistant_form_shown", kind: "contact" });
        break;
      case "human":
        userLabel = "Talk to a human";
        text = "Reach our engineering leadership directly via WhatsApp, phone, or calendar:";
        ui = [{ kind: "human" }];
        trackAssistantEvent({ name: "assistant_form_shown", kind: "human" });
        break;
    }

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: userLabel, ui: [] };
    const assistantMsg: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text,
      ui,
      local: true,
    };

    setMsgs((cur) => [...cur, userMsg, assistantMsg]);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      const user: Msg = { id: crypto.randomUUID(), role: "user", text: trimmed, ui: [] };
      const draft: Msg = { id: crypto.randomUUID(), role: "assistant", text: "", ui: [] };
      const base = [...msgs, user];
      setMsgs([...base, draft]);
      setBusy(true);

      // Track message count event (S12: no text, count only)
      const userMessageCount = base.filter((m) => m.role === "user").length;
      trackAssistantEvent({ name: "assistant_message", count: userMessageCount });

      // Local welcome is never sent; UI cards are described to the model as a short note.
      const history = base
        .filter((m) => !m.local && (m.text || m.ui.length))
        .map((m) => ({
          role: m.role,
          content: (
            m.text +
            (m.ui.length ? `\n[shown to visitor: ${m.ui.map((u) => u.kind).join(", ")}]` : "")
          ).trim(),
        }))
        .slice(-12);

      abort.current = new AbortController();
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          signal: abort.current.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: location.pathname, messages: history }),
        });

        // S11: Rate-limit (429) shows warning instead of switching mode
        if (res.status === 429) {
          setMsgs((cur) =>
            cur.map((m) =>
              m.id === draft.id
                ? {
                    ...m,
                    text: "You're sending messages quickly. Please wait a minute.",
                  }
                : m
            )
          );
          return;
        }

        // S11: Daily cap (503) switches to degraded mode
        if (res.status === 503) {
          setDegraded(true);
          trackAssistantEvent({ name: "assistant_degraded", reason: "capped_503" });
          setMsgs((cur) =>
            cur.map((m) =>
              m.id === draft.id
                ? {
                    ...m,
                    text: "The assistant is unavailable right now. These shortcuts still work.",
                  }
                : m
            )
          );
          return;
        }

        if (!res.ok || !res.body) {
          throw new Error(String(res.status));
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        const patch = (fn: (m: Msg) => Msg) =>
          setMsgs((cur) => cur.map((m) => (m.id === draft.id ? fn(m) : m)));

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop()!;
          for (const p of parts) {
            const line = p.trim();
            if (!line.startsWith("data: ")) continue;
            try {
              const ev = JSON.parse(line.replace(/^data: /, ""));
              if (ev.type === "text") patch((m) => ({ ...m, text: m.text + ev.t }));
              if (ev.type === "ui") patch((m) => ({ ...m, ui: [...m.ui, ev.ui] }));
              if (ev.type === "error") throw new Error("stream");
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message === "stream") throw parseErr;
            }
          }
        }
      } catch (e: any) {
        if (e.name === "AbortError") return;
        setDegraded(true); // S11 degraded fallback
        trackAssistantEvent({ name: "assistant_degraded", reason: "error" });
        setMsgs((cur) =>
          cur.map((m) =>
            m.id === draft.id && !m.text
              ? {
                  ...m,
                  text: "The assistant is unavailable. These shortcuts still work.",
                }
              : m
          )
        );
      } finally {
        setBusy(false);
      }
    },
    [msgs, busy]
  );

  const reset = useCallback(() => {
    abort.current?.abort();
    setMsgs([WELCOME]);
    setDegraded(false);
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
  }, []);

  const addLocalMsg = useCallback((msg: Omit<Msg, "id">) => {
    setMsgs((cur) => [...cur, { id: crypto.randomUUID(), ...msg, local: true }]);
  }, []);

  return { msgs, busy, degraded, send, reset, addLocalMsg, setMsgs, triggerShortcut };
}
