import { z } from "zod";

export const baseContact = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
  company: z.string().trim().max(160, "Company name is too long").optional(),
  email: z.string().trim().max(254).email("Please enter a valid work email address"),
  phone: z.string().trim().max(40, "Phone number is too long").optional(),
  need: z.string().trim().max(120).optional().default("General question"),
  budget: z.string().trim().max(60).optional().default("Not specified"),
  message: z.string().trim().min(3, "Please provide at least a brief message").max(5000, "Message is too long (5,000 characters max)"),
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
