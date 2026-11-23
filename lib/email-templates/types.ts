export type EmailCategory = "auth" | "billing" | "project" | "support" | "marketing";

export interface AllowedVariable {
  token: string;
  label: string;
  description: string;
  example: string;
}

export interface EmailTemplateDefinition {
  key: string;
  title: string;
  description: string;
  category: EmailCategory;
  defaultSubject: string;
  defaultBody: string;
  allowedVariables: AllowedVariable[];
  sampleData: Record<string, any>;
  renderHtml: (data: Record<string, any>, customSubject?: string, customBody?: string) => string;
  renderText: (data: Record<string, any>, customSubject?: string, customBody?: string) => string;
}

export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}
