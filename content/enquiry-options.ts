/**
 * Standardized project enquiry options used across the assistant and enquiry forms.
 */

export const SERVICE_TITLES = [
  "Custom Software",
  "Web Application Development",
  "Mobile App Development",
  "AI & Automation",
  "Cloud & DevOps",
  "Product & UI/UX Design",
  "API Integrations & M-Pesa",
  "Database Architecture",
  "E-Commerce Solutions",
  "Cybersecurity & Audits",
  "Legacy Migration",
] as const;

export const BUDGETS = [
  "KSh 15K – 30K ($120 – $250)",
  "KSh 45K – 100K ($350 – $800)",
  "KSh 120K – 300K ($1,000 – $2,500)",
  "KSh 300K+ ($2,500+ Enterprise)",
  "Not sure / Need estimate",
] as const;

export const TIMELINES = [
  "ASAP (1 to 2 weeks)",
  "1 to 3 months",
  "3 to 6 months",
  "Flexible planning",
] as const;
