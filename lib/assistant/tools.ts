import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ROUTES } from "./routes";
import { SERVICE_TITLES, BUDGETS, TIMELINES } from "@/content/enquiry-options";

export const tools: Anthropic.Tool[] = [
  {
    name: "navigate_to",
    description:
      "Show a button that takes the visitor to a page on this site. Use when they ask where something is, or when pointing them to a page helps.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", enum: ROUTES as unknown as string[] },
        label: { type: "string", description: "Button text, at most 4 words" },
      },
      required: ["path", "label"],
    },
  },
  {
    name: "show_contact_form",
    description:
      "Show a short contact form (name, email, message). Use for questions you cannot answer from the knowledge base or when the visitor wants to be contacted.",
    input_schema: {
      type: "object",
      properties: {
        message_hint: { type: "string", maxLength: 300 },
      },
    },
  },
  {
    name: "show_project_form",
    description:
      "Show the project enquiry form. Use when the visitor wants a quote, wants to start a project, or begins describing what they want built. Prefill only what they have already said.",
    input_schema: {
      type: "object",
      properties: {
        need: { type: "string", enum: SERVICE_TITLES as unknown as string[] },
        budget: { type: "string", enum: BUDGETS as unknown as string[] },
        timeline: { type: "string", enum: TIMELINES as unknown as string[] },
        summary: { type: "string", maxLength: 500 },
      },
    },
  },
  {
    name: "show_human_contact",
    description:
      "Show phone, WhatsApp, email, business hours and the booking link. Use when the visitor asks for a person.",
    input_schema: { type: "object", properties: {} },
  },
];

export type Ui =
  | { kind: "nav"; path: string; label: string }
  | { kind: "contact"; hint?: string }
  | { kind: "project"; prefill: { need?: string; budget?: string; timeline?: string; summary?: string } }
  | { kind: "human" };

const nav = z.object({
  path: z.enum(ROUTES as unknown as [string, ...string[]]),
  label: z.string().max(40),
});

const project = z.object({
  need: z.enum(SERVICE_TITLES as unknown as [string, ...string[]]).optional(),
  budget: z.enum(BUDGETS as unknown as [string, ...string[]]).optional(),
  timeline: z.enum(TIMELINES as unknown as [string, ...string[]]).optional(),
  summary: z.string().max(500).optional(),
});

export function resolveTool(name: string, input: unknown): Ui | null {
  switch (name) {
    case "navigate_to": {
      const r = nav.safeParse(input);
      return r.success ? { kind: "nav", ...r.data } : null;
    }
    case "show_contact_form": {
      return { kind: "contact", hint: (input as any)?.message_hint?.slice(0, 300) };
    }
    case "show_project_form": {
      const r = project.safeParse(input);
      return r.success ? { kind: "project", prefill: r.data } : null;
    }
    case "show_human_contact": {
      return { kind: "human" };
    }
    default:
      return null;
  }
}
