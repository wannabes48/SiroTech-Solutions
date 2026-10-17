import { z } from "zod";

export const baseContact = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  email: z.string().email("Please enter a valid work email address"),
  phone: z.string().optional(),
  need: z.string().optional().default("General question"),
  budget: z.string().optional().default("Not specified"),
  message: z.string().min(3, "Please provide at least a brief message"),
  consent: z.boolean().optional().default(true),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
  "cf-turnstile-response": z.string().optional(),
});

export const contactSchema = baseContact.extend({
  timeline: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  source: z.enum(["contact", "assistant", "service", "pricing", "contact_form"]).default("contact"),
  transcript: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(1500),
      })
    )
    .max(30)
    .optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
