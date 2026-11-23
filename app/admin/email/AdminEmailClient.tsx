"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { 
  updateEmailTemplateAction, 
  resetEmailTemplateAction,
  sendTestEmailAction, 
  previewEmailAction,
  retryEmailLogAction 
} from "@/app/admin/actions";
import { validateTemplateVariables, extractVariables, interpolate } from "@/lib/email-templates/interpolator";
import { 
  Mail, Send, CheckCircle2, AlertCircle, RefreshCw, 
  Edit3, Eye, Loader2, Sparkles, Filter, X, Check, ArrowRight,
  RotateCcw, Monitor, Smartphone, Copy, Shield, FileText, ChevronRight,
  Code, Info, ExternalLink, Inbox
} from "lucide-react";

interface AllowedVariable {
  token: string;
  label: string;
  description: string;
  example: string;
}

interface EmailTemplate {
  key: string;
  title: string;
  description?: string;
  category: "auth" | "billing" | "project" | "support" | "marketing";
  subject: string;
  body: string;
  defaultSubject: string;
  defaultBody: string;
  allowedVariables: AllowedVariable[];
  sampleData: Record<string, any>;
  updated_at?: string | null;
}

interface EmailLog {
  id: string;
  to_email: string;
  template: string;
  subject?: string;
  status: string;
  provider_id?: string;
  error?: string;
  created_at: string;
}

export function AdminEmailClient({
  initialTemplates,
  initialLogs,
  currentUserEmail
}: {
  initialTemplates: EmailTemplate[];
  initialLogs: EmailLog[];
  currentUserEmail?: string;
}) {
  const [activeMainTab, setActiveMainTab] = useState<"TEMPLATES" | "LOGS">("TEMPLATES");
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(initialTemplates[0]?.key || "verify");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor State
  const selectedTemplate = templates.find(t => t.key === selectedTemplateKey) || templates[0];
  const [editSubject, setEditSubject] = useState(selectedTemplate?.subject || "");
  const [editBody, setEditBody] = useState(selectedTemplate?.body || "");

  // Preview State
  const [previewTab, setPreviewTab] = useState<"HTML" | "TEXT">("HTML");
  const [previewDevice, setPreviewDevice] = useState<"DESKTOP" | "MOBILE">("DESKTOP");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Test Send State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState(currentUserEmail || "admin@sirotech.co.ke");

  // Reset Confirmation State
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Delivery Logs State
  const [logs, setLogs] = useState<EmailLog[]>(initialLogs);
  const [logFilter, setLogFilter] = useState("ALL");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [selectedLogPayload, setSelectedLogPayload] = useState<EmailLog | null>(null);

  // Notifications & Transitions
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state when selected template changes
  useEffect(() => {
    if (selectedTemplate) {
      setEditSubject(selectedTemplate.subject);
      setEditBody(selectedTemplate.body);
    }
  }, [selectedTemplateKey]);

  // Allowed variables validation
  const allowedTokens = selectedTemplate?.allowedVariables.map(v => v.token) || [];
  const subjectValidation = validateTemplateVariables(editSubject, allowedTokens);
  const bodyValidation = validateTemplateVariables(editBody, allowedTokens);
  const isSubjectValid = subjectValidation.isValid;
  const isBodyValid = bodyValidation.isValid;
  const allVariablesValid = isSubjectValid && isBodyValid;

  // Refresh live preview whenever subject or body changes
  useEffect(() => {
    let isCurrent = true;
    const fetchPreview = async () => {
      if (!selectedTemplate) return;
      setIsPreviewLoading(true);
      try {
        const res = await previewEmailAction({
          templateKey: selectedTemplate.key,
          customSubject: editSubject,
          customBody: editBody,
          sampleData: selectedTemplate.sampleData
        });
        if (isCurrent && res.success && res.html && res.text) {
          setPreviewHtml(res.html);
          setPreviewText(res.text);
          setPreviewSubject(res.subject || "");
        }
      } catch (err) {
        console.warn("Preview generation error:", err);
      } finally {
        if (isCurrent) setIsPreviewLoading(false);
      }
    };

    const timer = setTimeout(fetchPreview, 250);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [selectedTemplateKey, editSubject, editBody]);

  // Insert variable into active cursor position or end of body
  const handleInsertVariable = (token: string) => {
    const tokenTag = `{{${token}}}`;
    const textarea = bodyTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = editBody.substring(0, start) + tokenTag + editBody.substring(end);
      setEditBody(newBody);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tokenTag.length, start + tokenTag.length);
      }, 50);
    } else {
      setEditBody(prev => `${prev} ${tokenTag}`);
    }
  };

  // Save changes to database
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    if (!allVariablesValid) {
      const allErrors = [
        ...subjectValidation.invalidTokens.map(t => `Subject: {{${t}}}`),
        ...bodyValidation.invalidTokens.map(t => `Body: {{${t}}}`)
      ];
      alert(`Cannot save template. Unrecognized variable(s) found:\n${allErrors.join("\n")}\n\nPlease use only allowed variables listed below.`);
      return;
    }

    startTransition(async () => {
      const res = await updateEmailTemplateAction({
        key: selectedTemplate.key,
        title: selectedTemplate.title,
        subject: editSubject,
        body: editBody
      });

      if (res.success) {
        setTemplates(prev =>
          prev.map(t =>
            t.key === selectedTemplate.key
              ? { ...t, subject: editSubject, body: editBody, updated_at: new Date().toISOString() }
              : t
          )
        );
        showToast(`Template "${selectedTemplate.title}" saved successfully.`);
      } else {
        alert(res.error || "Failed to save template.");
      }
    });
  };

  // Reset to canonical system default
  const handleResetToDefault = () => {
    if (!selectedTemplate) return;

    startTransition(async () => {
      const res = await resetEmailTemplateAction(selectedTemplate.key);
      if (res.success && res.subject && res.body) {
        setEditSubject(res.subject);
        setEditBody(res.body);
        setTemplates(prev =>
          prev.map(t =>
            t.key === selectedTemplate.key
              ? { ...t, subject: res.subject!, body: res.body!, updated_at: new Date().toISOString() }
              : t
          )
        );
        setShowResetConfirm(false);
        showToast(`Reset "${selectedTemplate.title}" to default template.`);
      } else {
        alert(res.error || "Failed to reset template.");
      }
    });
  };

  // Send test email to self
  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !testEmail) return;

    startTransition(async () => {
      const res = await sendTestEmailAction({
        templateKey: selectedTemplate.key,
        recipientEmail: testEmail,
        customSubject: editSubject,
        customBody: editBody
      });

      if (res.success) {
        setShowTestModal(false);
        showToast(`Test email successfully sent to ${testEmail}`);
        // Optimistically record in logs
        const newLog: EmailLog = {
          id: `log_${Date.now()}`,
          to_email: testEmail,
          template: selectedTemplate.key,
          subject: previewSubject || `[TEST] ${editSubject}`,
          status: "DELIVERED",
          provider_id: res.messageId,
          created_at: new Date().toISOString()
        };
        setLogs(prev => [newLog, ...prev]);
      } else {
        alert(res.error || "Failed to send test email.");
      }
    });
  };

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    if (categoryFilter !== "ALL" && t.category.toUpperCase() !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (logFilter !== "ALL" && log.status !== logFilter) return false;
    if (logSearchQuery) {
      const q = logSearchQuery.toLowerCase();
      return (
        log.to_email.toLowerCase().includes(q) ||
        log.template.toLowerCase().includes(q) ||
        (log.subject && log.subject.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const categoryLabels: Record<string, string> = {
    auth: "Auth & Security",
    billing: "Billing & Invoices",
    project: "Project Delivery",
    support: "Support Tickets",
    marketing: "Public Inquiries"
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#1B2E24] text-white text-xs font-semibold shadow-2xl border border-emerald-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Mode Toggle: Email Templates vs Delivery Logs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule/70 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMainTab("TEMPLATES")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === "TEMPLATES"
                ? "bg-[#1B2E24] text-white shadow-xs"
                : "bg-white border border-rule text-muted hover:text-ink"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>System Templates ({templates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("LOGS")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === "LOGS"
                ? "bg-[#1B2E24] text-white shadow-xs"
                : "bg-white border border-rule text-muted hover:text-ink"
            }`}
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Delivery Logs ({logs.length})</span>
          </button>
        </div>

        <div className="text-xs text-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Brand Styled &bull; Universal Client Compat &bull; Plain-Text Footers</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: EMAIL TEMPLATES WORKSPACE (List + Editor + Live Preview)      */}
      {/* ===================================================================== */}
      {activeMainTab === "TEMPLATES" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Templates List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-rule/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink">System Emails</h3>
                <p className="text-[11px] text-muted">Select an email to customize &amp; preview</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-ink">
                {templates.length} Active
              </span>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, variables..."
              className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {["ALL", "AUTH", "BILLING", "PROJECT", "SUPPORT", "MARKETING"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    categoryFilter === cat
                      ? "bg-[#1B2E24] text-white"
                      : "bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Template Items List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredTemplates.map(tpl => {
                const isSelected = tpl.key === selectedTemplateKey;
                return (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => setSelectedTemplateKey(tpl.key)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[#1B2E24] text-white border-[#1B2E24] shadow-sm"
                        : "bg-surface/50 hover:bg-surface border-rule/70 hover:border-rule text-ink"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs truncate">{tpl.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isSelected ? "bg-white/20 text-white" : "bg-white text-muted border border-rule/60"
                      }`}>
                        {tpl.category}
                      </span>
                    </div>

                    <div className={`font-mono text-[10px] truncate ${isSelected ? "text-emerald-200" : "text-muted"}`}>
                      key: {tpl.key}
                    </div>

                    <div className={`text-[11px] truncate ${isSelected ? "text-stone-300" : "text-muted"}`}>
                      {tpl.subject}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Editor & Live Preview Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Workspace Header Bar */}
            <div className="bg-white rounded-3xl border border-rule/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-ink">{selectedTemplate?.title}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sage-100 text-ink">
                    {selectedTemplate?.key}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {categoryLabels[selectedTemplate?.category] || selectedTemplate?.category}
                  </span>
                </div>
                <p className="text-xs text-body mt-0.5">{selectedTemplate?.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  title="Reset to default template"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-rule hover:bg-surface text-ink transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted" />
                  <span>Reset to Default</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTestModal(true)}
                  title="Send test email to your inbox"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Send Test</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={isPending || !allVariablesValid}
                  title="Save template changes"
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#1B2E24] text-white hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* Template Editor Section */}
            <div className="bg-white rounded-3xl border border-rule/80 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-rule/60 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-sm text-ink">Template Content &amp; Subject</span>
                </div>

                {/* Real-time variable validation status badge */}
                {allVariablesValid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Variables Validated</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    <span>Invalid Variables Detected</span>
                  </span>
                )}
              </div>

              {/* Subject Line Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Email Subject Line
                  </label>
                  <span className="text-[11px] text-muted">
                    Supports: {allowedTokens.map(t => `{{${t}}}`).join(", ")}
                  </span>
                </div>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="Enter email subject line..."
                  className={`w-full px-4 py-2.5 rounded-2xl bg-surface border text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 ${
                    isSubjectValid
                      ? "border-rule focus:ring-emerald-700/20"
                      : "border-rose-400 focus:ring-rose-500/20 bg-rose-50/30"
                  }`}
                />
                {!isSubjectValid && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>
                      Unauthorized variable in subject: {subjectValidation.invalidTokens.map(t => `{{${t}}}`).join(", ")}
                    </span>
                  </p>
                )}
              </div>

              {/* Allowed Variables Panel (Clickable Chips) */}
              <div className="p-4 rounded-2xl bg-surface/70 border border-rule/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <Code className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Allowed Variables (Click to insert):</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">
                    {"Allowed only: {{name}}, {{invoice.number}}..."}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTemplate?.allowedVariables.map((v) => (
                    <button
                      key={v.token}
                      type="button"
                      onClick={() => handleInsertVariable(v.token)}
                      title={`${v.description} (e.g. ${v.example})`}
                      className="px-2.5 py-1 rounded-xl bg-white border border-rule hover:border-emerald-600 hover:bg-emerald-50/50 text-[11px] font-mono text-emerald-900 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <span className="font-bold">{`{{${v.token}}}`}</span>
                      <span className="text-[10px] text-muted font-sans font-normal">&bull; {v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Template Body Content
                  </label>
                  <span className="text-[11px] text-muted">
                    {editBody.length} characters
                  </span>
                </div>
                <textarea
                  ref={bodyTextareaRef}
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Draft your email message body..."
                  className={`w-full p-4 rounded-2xl bg-surface border font-sans text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 leading-relaxed resize-y ${
                    isBodyValid
                      ? "border-rule focus:ring-emerald-700/20"
                      : "border-rose-400 focus:ring-rose-500/20 bg-rose-50/30"
                  }`}
                />
                {!isBodyValid && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>
                      Unauthorized variable in body: {bodyValidation.invalidTokens.map(t => `{{${t}}}`).join(", ")}. Please use only the allowed variables listed above.
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Live Dual Preview Section (HTML Email + Plain-Text with Mandatory Footer) */}
            <div className="bg-white rounded-3xl border border-rule/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule/60 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-sm text-ink">Live Client Preview</span>
                  {isPreviewLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted" />}
                </div>

                <div className="flex items-center gap-2">
                  {/* HTML vs Plain Text Toggle */}
                  <div className="bg-surface rounded-full p-0.5 border border-rule text-xs font-semibold flex items-center">
                    <button
                      type="button"
                      onClick={() => setPreviewTab("HTML")}
                      className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        previewTab === "HTML" ? "bg-[#1B2E24] text-white" : "text-muted hover:text-ink"
                      }`}
                    >
                      HTML Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("TEXT")}
                      className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        previewTab === "TEXT" ? "bg-[#1B2E24] text-white" : "text-muted hover:text-ink"
                      }`}
                    >
                      Plain-Text Version
                    </button>
                  </div>

                  {/* Device toggle (HTML only) */}
                  {previewTab === "HTML" && (
                    <div className="bg-surface rounded-full p-0.5 border border-rule flex items-center text-muted">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("DESKTOP")}
                        title="Desktop view (580px)"
                        className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                          previewDevice === "DESKTOP" ? "bg-white text-ink shadow-2xs" : "hover:text-ink"
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("MOBILE")}
                        title="Mobile view (380px)"
                        className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                          previewDevice === "MOBILE" ? "bg-white text-ink shadow-2xs" : "hover:text-ink"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulated Mail Client Header Envelope */}
              <div className="p-3.5 rounded-2xl bg-surface/80 border border-rule/70 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted w-14">From:</span>
                  <span className="text-ink font-medium">SiroTech Solutions &lt;notifications@sirotech.co.ke&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted w-14">Subject:</span>
                  <span className="text-ink font-bold">{previewSubject || editSubject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted w-14">To:</span>
                  <span className="text-ink font-mono">{selectedTemplate?.sampleData?.email || currentUserEmail || "client@company.com"}</span>
                </div>
              </div>

              {/* Tab 1: Rendered HTML Email Preview */}
              {previewTab === "HTML" && (
                <div className="flex justify-center bg-[#EAEEEC] p-4 sm:p-6 rounded-2xl border border-rule/80 overflow-x-auto min-h-[460px]">
                  <div
                    style={{
                      width: previewDevice === "MOBILE" ? "380px" : "100%",
                      maxWidth: "600px",
                      transition: "width 0.2s ease",
                    }}
                    className="shadow-xl rounded-2xl overflow-hidden bg-white"
                  >
                    <iframe
                      title="HTML Email Preview"
                      srcDoc={previewHtml}
                      className="w-full h-[540px] border-none bg-white"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Plain-Text Version Preview */}
              {previewTab === "TEXT" && (
                <div className="space-y-3">
                  <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Plain-text version generated automatically for terminal clients, spam filters, and accessibility readers. Includes mandatory portal account footer.
                    </span>
                  </div>

                  <pre className="p-5 rounded-2xl bg-[#0F1D15] text-[#D8E6DC] font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-[500px]">
                    {previewText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: AUDITED DELIVERY LOGS                                         */}
      {/* ===================================================================== */}
      {activeMainTab === "LOGS" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule/60 pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">Outbound Dispatch &amp; Delivery Log</h2>
              <p className="text-xs text-muted">Audited receipt confirmations from mail delivery transport.</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search recipient, template..."
                className="px-3.5 py-1.5 rounded-full bg-surface border border-rule text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />

              <div className="flex items-center gap-1.5 text-xs">
                {["ALL", "DELIVERED", "FAILED"].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setLogFilter(status)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      logFilter === status
                        ? "bg-[#1B2E24] text-white"
                        : "bg-surface text-muted hover:text-ink border border-rule/60"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-rule/80 text-[10px] font-bold text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Provider ID</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-muted font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-ink">{log.to_email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sage-100 text-ink">
                          {log.template}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink font-medium max-w-[220px] truncate" title={log.subject}>
                        {log.subject || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : "bg-rose-100 text-rose-900 border border-rose-200"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-muted truncate max-w-[140px]">
                        {log.provider_id || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLogPayload(log)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface hover:bg-stone-200 text-ink border border-rule transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted">
                      No delivery logs match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: SEND TEST EMAIL MODAL                                        */}
      {/* ===================================================================== */}
      {showTestModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rule p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rule/60 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-ink">Send Test to Yourself</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="p-1 rounded-full text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-body leading-relaxed">
              We will render <strong>{selectedTemplate.title}</strong> with sample data and dispatch both the brand-styled HTML version and plain-text version to your inbox.
            </p>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-surface border border-rule text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface/70 border border-rule/70 text-[11px] text-muted space-y-1">
                <div><strong>Subject:</strong> {previewSubject || editSubject}</div>
                <div><strong>Template Key:</strong> <code className="text-ink">{selectedTemplate.key}</code></div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-rule hover:bg-surface text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] text-white hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Test...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Test</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: RESET TO DEFAULT CONFIRMATION                                */}
      {/* ===================================================================== */}
      {showResetConfirm && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rule p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-700">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm text-ink">Reset to Canonical Default?</h3>
            </div>

            <p className="text-xs text-body leading-relaxed">
              This will overwrite any customized subject line and body text for <strong>{selectedTemplate.title}</strong> with SiroTech's canonical brand default.
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <div><strong>Default Subject:</strong> {selectedTemplate.defaultSubject}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-rule hover:bg-surface text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isPending}
                className="px-5 py-2 rounded-full text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: LOG DETAIL INSPECTOR                                         */}
      {/* ===================================================================== */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rule p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rule/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-ink">Delivery Event Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogPayload(null)}
                className="p-1 rounded-full text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Event ID:</span>
                <span className="font-mono text-ink">{selectedLogPayload.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Recipient:</span>
                <span className="font-mono font-bold text-ink">{selectedLogPayload.to_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Template:</span>
                <span className="font-mono text-ink">{selectedLogPayload.template}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Subject:</span>
                <span className="font-medium text-ink">{selectedLogPayload.subject || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Status:</span>
                <span className="font-bold text-emerald-700">{selectedLogPayload.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Transport ID:</span>
                <span className="font-mono text-muted">{selectedLogPayload.provider_id || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Timestamp:</span>
                <span className="text-ink">{new Date(selectedLogPayload.created_at).toLocaleString()}</span>
              </div>
            </div>

            {selectedLogPayload.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <strong>Error:</strong> {selectedLogPayload.error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLogPayload(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-surface hover:bg-stone-200 text-ink cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
