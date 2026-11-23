"use client";

import React, { useState, useTransition } from "react";
import { toggleFeatureFlagAction, updateSiteSettingsAction } from "@/app/admin/actions";
import { 
  Building2, Globe2, GitFork, ShieldCheck, Flag, 
  Power, Check, Loader2, Save, CreditCard, Clock, AlertTriangle 
} from "lucide-react";

export function SettingsClient({
  initialSettings = {},
  initialFlags = []
}: {
  initialSettings: any;
  initialFlags: any[];
}) {
  const [activeTab, setActiveTab] = useState<"company" | "localisation" | "routing" | "limits" | "flags" | "maintenance">("company");
  const [flags, setFlags] = useState(initialFlags);

  // Settings sub-objects
  const [company, setCompany] = useState(initialSettings.company || {
    name: "SiroTech Solutions Ltd",
    legalName: "SiroTech Solutions Limited",
    regNumber: "PVT-9XU298A",
    kraPin: "P051982344A",
    address: "Westlands Commercial Center, Ring Road Parklands, Nairobi, Kenya",
    phone: "+254 745 131 817",
    email: "hello@sirotech.co.ke",
    vatRegistered: true,
    vatRate: 16,
    withholdingTaxRate: 5,
    bankName: "Standard Chartered Bank Kenya",
    bankBranch: "Westlands Branch",
    bankAccountName: "SiroTech Solutions Ltd",
    bankAccountNumber: "0108049281700",
    bankSwift: "SCBLKENX",
    bankIban: "KE56SCBL0108049281700",
    mpesaPaybill: "522522",
    mpesaAccount: "1298450",
    copyright: "© 2026 SiroTech Solutions Ltd. All rights reserved."
  });

  const [localisation, setLocalisation] = useState(initialSettings.localisation || {
    defaultCurrency: "KES",
    allowedCurrencies: ["KES", "USD", "CAD"],
    exchangeRateUsdKes: 129.50,
    exchangeRateCadKes: 94.20,
    timezone: "Africa/Nairobi (EAT, UTC+3)",
    dateFormat: "DD/MM/YYYY"
  });

  const [routing, setRouting] = useState(initialSettings.routing || {
    notificationEmails: "leads@sirotech.co.ke, directors@sirotech.co.ke",
    webAssignee: "Technical Director",
    mobileAssignee: "Mobile Lead",
    cloudAssignee: "DevOps & Cloud Lead",
    autoAssignEnabled: true
  });

  const [limits, setLimits] = useState(initialSettings.limits || {
    clientUploadMaxMB: 50,
    staffUploadMaxMB: 500,
    sessionTimeoutMinutes: 60,
    apiRateLimitPerMin: 120,
    invoiceRetentionYears: 7,
    auditLogRetentionDays: 365
  });

  const [maintenance, setMaintenance] = useState(initialSettings.maintenance || {
    enabled: false,
    message: "We are currently conducting scheduled infrastructure upgrades. Normal service will resume shortly.",
    bypassSecret: "sirotech-staff-edge-bypass-2026"
  });

  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleFlag = (key: string, currentEnabled: boolean) => {
    const newEnabled = !currentEnabled;
    setFlags(prev => prev.map(f => (f.key === key ? { ...f, enabled: newEnabled } : f)));

    startTransition(async () => {
      await toggleFeatureFlagAction(key, newEnabled);
    });
  };

  const handleSaveSection = (key: string, data: any) => {
    setSavedSection(null);
    startTransition(async () => {
      const res = await updateSiteSettingsAction(key, data);
      if (res?.success) {
        setSavedSection(key);
        setTimeout(() => setSavedSection(null), 2500);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-rule/60 pb-3 text-xs">
        {[
          { id: "company", label: "Company & Bank", icon: Building2 },
          { id: "localisation", label: "Localisation & Money", icon: Globe2 },
          { id: "routing", label: "Lead Routing", icon: GitFork },
          { id: "limits", label: "Limits & Retention", icon: Clock },
          { id: "flags", label: "Feature Flags", icon: Flag },
          { id: "maintenance", label: "Maintenance Mode", icon: Power }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#1B2E24] text-white shadow-xs"
                  : "bg-surface hover:bg-stone-200/80 text-muted hover:text-ink"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Company Profile & Banking */}
      {activeTab === "company" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Company Profile &amp; Banking Details</h2>
              <p className="text-xs text-muted">Statutory registration and payment remittance accounts displayed on tax invoices.</p>
            </div>
            {savedSection === "company" ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSaveSection("company", company)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Company Profile</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Company Trade Name</label>
              <input
                type="text"
                value={company.name}
                onChange={e => setCompany({ ...company, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Legal Entity Name</label>
              <input
                type="text"
                value={company.legalName}
                onChange={e => setCompany({ ...company, legalName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Business Registration No.</label>
              <input
                type="text"
                value={company.regNumber}
                onChange={e => setCompany({ ...company, regNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">KRA PIN Number</label>
              <input
                type="text"
                value={company.kraPin}
                onChange={e => setCompany({ ...company, kraPin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-ink mb-1">Physical Address</label>
              <input
                type="text"
                value={company.address}
                onChange={e => setCompany({ ...company, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Primary Phone</label>
              <input
                type="text"
                value={company.phone}
                onChange={e => setCompany({ ...company, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Billing Email</label>
              <input
                type="email"
                value={company.email}
                onChange={e => setCompany({ ...company, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>
          </div>

          {/* Bank & M-Pesa Remittance */}
          <div className="pt-4 border-t border-rule/60 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Remittance Accounts (Wire &amp; M-Pesa)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-ink mb-1">Bank Name</label>
                <input
                  type="text"
                  value={company.bankName}
                  onChange={e => setCompany({ ...company, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Account Number</label>
                <input
                  type="text"
                  value={company.bankAccountNumber}
                  onChange={e => setCompany({ ...company, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">SWIFT / BIC</label>
                <input
                  type="text"
                  value={company.bankSwift}
                  onChange={e => setCompany({ ...company, bankSwift: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">M-Pesa Paybill / Till</label>
                <input
                  type="text"
                  value={company.mpesaPaybill}
                  onChange={e => setCompany({ ...company, mpesaPaybill: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">M-Pesa Account Ref</label>
                <input
                  type="text"
                  value={company.mpesaAccount}
                  onChange={e => setCompany({ ...company, mpesaAccount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Copyright Footer</label>
                <input
                  type="text"
                  value={company.copyright}
                  onChange={e => setCompany({ ...company, copyright: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Localisation & Money */}
      {activeTab === "localisation" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Localisation, Currencies &amp; Exchange Rates</h2>
              <p className="text-xs text-muted">Baseline currency configurations and exchange rate multipliers.</p>
            </div>
            {savedSection === "localisation" ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSaveSection("localisation", localisation)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Localisation</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Default Base Currency</label>
              <select
                value={localisation.defaultCurrency}
                onChange={e => setLocalisation({ ...localisation, defaultCurrency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - United States Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">System Timezone</label>
              <input
                type="text"
                value={localisation.timezone}
                onChange={e => setLocalisation({ ...localisation, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">USD to KES Baseline Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={localisation.exchangeRateUsdKes}
                onChange={e => setLocalisation({ ...localisation, exchangeRateUsdKes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
              <span className="text-[11px] text-muted mt-1 block">1 USD = {localisation.exchangeRateUsdKes} KES</span>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">CAD to KES Baseline Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={localisation.exchangeRateCadKes}
                onChange={e => setLocalisation({ ...localisation, exchangeRateCadKes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
              <span className="text-[11px] text-muted mt-1 block">1 CAD = {localisation.exchangeRateCadKes} KES</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Lead Routing & Notifications */}
      {activeTab === "routing" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Inbound Lead Routing &amp; Alerts</h2>
              <p className="text-xs text-muted">Assign incoming customer inquiries based on category and notify staff.</p>
            </div>
            {savedSection === "routing" ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSaveSection("routing", routing)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Routing Rules</span>
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Notification Recipients (Comma separated)</label>
              <input
                type="text"
                value={routing.notificationEmails}
                onChange={e => setRouting({ ...routing, notificationEmails: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
              <span className="text-[11px] text-muted mt-1 block">Dispatches instant alert emails whenever a new lead or consultation is filed.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-ink mb-1">Web Applications Assignee</label>
                <input
                  type="text"
                  value={routing.webAssignee}
                  onChange={e => setRouting({ ...routing, webAssignee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Mobile Development Assignee</label>
                <input
                  type="text"
                  value={routing.mobileAssignee}
                  onChange={e => setRouting({ ...routing, mobileAssignee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Cloud / ERP Assignee</label>
                <input
                  type="text"
                  value={routing.cloudAssignee}
                  onChange={e => setRouting({ ...routing, cloudAssignee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Limits & Statutory Retention */}
      {activeTab === "limits" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Upload Limits, Session Timeouts &amp; Data Retention</h2>
              <p className="text-xs text-muted">Statutory retention policies and platform operational boundaries.</p>
            </div>
            {savedSection === "limits" ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSaveSection("limits", limits)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Limits &amp; Policies</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Max Client Upload Size (MB)</label>
              <input
                type="number"
                value={limits.clientUploadMaxMB}
                onChange={e => setLimits({ ...limits, clientUploadMaxMB: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Max Staff Upload Size (MB)</label>
              <input
                type="number"
                value={limits.staffUploadMaxMB}
                onChange={e => setLimits({ ...limits, staffUploadMaxMB: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Staff Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                value={limits.sessionTimeoutMinutes}
                onChange={e => setLimits({ ...limits, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">API Rate Limit (Requests / minute)</label>
              <input
                type="number"
                value={limits.apiRateLimitPerMin}
                onChange={e => setLimits({ ...limits, apiRateLimitPerMin: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Invoice Retention Period (Years)</label>
              <input
                type="number"
                value={limits.invoiceRetentionYears}
                onChange={e => setLimits({ ...limits, invoiceRetentionYears: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
              <span className="text-[11px] text-muted mt-1 block">Kenya Tax Procedures Act requires minimum 7 years.</span>
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Audit Log Retention (Days)</label>
              <input
                type="number"
                value={limits.auditLogRetentionDays}
                onChange={e => setLimits({ ...limits, auditLogRetentionDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Feature Flags */}
      {activeTab === "flags" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Feature Flags &amp; Live Switches</h2>
              <p className="text-xs text-muted">Dynamically toggle platform capabilities without triggering code deployments.</p>
            </div>
            <Flag className="w-5 h-5 text-emerald-700" />
          </div>

          <div className="space-y-3.5">
            {flags.map(flag => (
              <div
                key={flag.key}
                className="p-4 rounded-2xl bg-surface/50 border border-rule/60 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-ink block">{flag.name}</span>
                  <span className="text-muted text-xs mt-0.5 block">{flag.note}</span>
                  <span className="font-mono text-[10px] text-muted block mt-1">flag: {flag.key}</span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={flag.enabled}
                  onClick={() => handleToggleFlag(flag.key, flag.enabled)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                    flag.enabled ? "bg-[#1B2E24] justify-end" : "bg-rule justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Maintenance Mode */}
      {activeTab === "maintenance" && (
        <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Platform Maintenance Mode &amp; Public Banner</h2>
              <p className="text-xs text-muted">When enabled, visitors see a scheduled maintenance notice with bypass access for staff.</p>
            </div>
            {savedSection === "maintenance" ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSaveSection("maintenance", maintenance)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Maintenance Config</span>
              </button>
            )}
          </div>

          <div className={`p-5 rounded-2xl border transition-colors flex items-center justify-between ${
            maintenance.enabled ? "bg-amber-50 border-amber-300" : "bg-surface/50 border-rule/60"
          }`}>
            <div>
              <span className="font-bold text-sm text-ink block">Maintenance Mode Switch</span>
              <span className="text-xs text-muted">
                {maintenance.enabled
                  ? "Maintenance mode is ACTIVE. Public routes return the maintenance screen."
                  : "Normal operation. All public routes and portal endpoints are live."}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={maintenance.enabled}
              onClick={() => setMaintenance({ ...maintenance, enabled: !maintenance.enabled })}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                maintenance.enabled ? "bg-amber-600 justify-end" : "bg-rule justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Public Maintenance Notice Message</label>
              <textarea
                rows={3}
                value={maintenance.message}
                onChange={e => setMaintenance({ ...maintenance, message: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Staff Edge Bypass Secret</label>
              <input
                type="text"
                value={maintenance.bypassSecret}
                onChange={e => setMaintenance({ ...maintenance, bypassSecret: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono"
              />
              <span className="text-[11px] text-muted mt-1 block">Staff can pass this secret via cookie `sirotech_bypass` or URL param `?bypass=` to access the site during maintenance.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
