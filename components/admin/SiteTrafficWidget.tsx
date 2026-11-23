"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Settings,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  MapPin,
  FileText
} from "lucide-react";
import {
  getGoogleAnalyticsReportAction,
  saveGoogleAnalyticsConfigAction
} from "@/app/admin/actions";

interface SiteTrafficProps {
  initialSite?: {
    isGaConnected?: boolean;
    gaError?: string | null;
    propertyId?: string | null;
    clientEmail?: string | null;
    monthlyVisits?: number;
    activeUsers?: number;
    averageSessionDuration?: string;
    realtimeActiveUsers?: number;
    sessions?: number;
    bounceRate?: string;
    visitsGrowth?: string;
    publishQueue?: number;
    topPages?: Array<{ path: string; views: number; activeUsers?: number }>;
    topCountries?: Array<{ country: string; activeUsers: number; pageViews: number; percentage: number }>;
    lastFetchedAt?: string;
  };
}

export function SiteTrafficWidget({ initialSite }: SiteTrafficProps) {
  const [site, setSite] = useState({
    isGaConnected: Boolean(initialSite?.isGaConnected),
    gaError: initialSite?.gaError || null,
    propertyId: initialSite?.propertyId || null,
    clientEmail: initialSite?.clientEmail || null,
    monthlyVisits: initialSite?.monthlyVisits ?? 0,
    activeUsers: initialSite?.activeUsers ?? 0,
    averageSessionDuration: initialSite?.averageSessionDuration || "0s",
    realtimeActiveUsers: initialSite?.realtimeActiveUsers ?? 0,
    sessions: initialSite?.sessions ?? 0,
    bounceRate: initialSite?.bounceRate || "0%",
    visitsGrowth: initialSite?.visitsGrowth || "N/A",
    publishQueue: initialSite?.publishQueue ?? 0,
    topPages: initialSite?.topPages || [],
    topCountries: initialSite?.topCountries || [],
    lastFetchedAt: initialSite?.lastFetchedAt,
  });
  const [activeTab, setActiveTab] = useState<"pages" | "geo" | "overview">("overview");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const [isSaving, startSaving] = useTransition();

  // Configuration Modal State
  const [propertyId, setPropertyId] = useState(site.propertyId || "");
  const [jsonKey, setJsonKey] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  const handleRefresh = () => {
    startRefresh(async () => {
      const res = await getGoogleAnalyticsReportAction(true);
      if (res?.success && res.data) {
        const d = res.data;
        const isConnected = d.isConfigured && !d.error;
        setSite((prev) => ({
          ...prev,
          isGaConnected: isConnected,
          gaError: d.error || null,
          propertyId: d.propertyId || prev.propertyId,
          clientEmail: d.clientEmail || prev.clientEmail,
          monthlyVisits: isConnected ? d.current.pageViews : 0,
          activeUsers: isConnected ? d.current.activeUsers : 0,
          averageSessionDuration: isConnected ? d.formattedSessionDuration : "0s",
          realtimeActiveUsers: isConnected ? d.realtimeActiveUsers : 0,
          sessions: isConnected ? d.current.sessions : 0,
          bounceRate: isConnected ? `${d.current.bounceRate}%` : "0%",
          visitsGrowth: isConnected
            ? `${d.growth.pageViewsPercent >= 0 ? "+" : ""}${d.growth.pageViewsPercent}%`
            : "N/A",
          topPages: isConnected && d.topPages.length > 0 ? d.topPages : prev.topPages,
          topCountries: isConnected ? d.topCountries : prev.topCountries,
          lastFetchedAt: d.lastFetchedAt,
        }));
      }
    });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);
    setConfigSuccess(null);

    startSaving(async () => {
      try {
        const res = await saveGoogleAnalyticsConfigAction({
          propertyId,
          serviceAccountKeyJson: jsonKey || undefined,
        });

        if (res?.error) {
          setConfigError(res.error);
        } else if (res?.success) {
          setConfigSuccess(res.message || "Connected successfully!");
          if (res.data) {
            const d = res.data;
            const isConnected = d.isConfigured && !d.error;
            setSite((prev) => ({
              ...prev,
              isGaConnected: isConnected,
              gaError: d.error || null,
              propertyId: d.propertyId || propertyId,
              clientEmail: d.clientEmail || prev.clientEmail,
              monthlyVisits: isConnected ? d.current.pageViews : 0,
              activeUsers: isConnected ? d.current.activeUsers : 0,
              averageSessionDuration: isConnected ? d.formattedSessionDuration : "0s",
              realtimeActiveUsers: isConnected ? d.realtimeActiveUsers : 0,
              sessions: isConnected ? d.current.sessions : 0,
              bounceRate: isConnected ? `${d.current.bounceRate}%` : "0%",
              visitsGrowth: isConnected
                ? `${d.growth.pageViewsPercent >= 0 ? "+" : ""}${d.growth.pageViewsPercent}%`
                : "N/A",
              topPages: isConnected && d.topPages.length > 0 ? d.topPages : prev.topPages,
              topCountries: isConnected ? d.topCountries : prev.topCountries,
              lastFetchedAt: d.lastFetchedAt,
            }));
          }
          setTimeout(() => {
            setShowConfigModal(false);
          }, 1500);
        }
      } catch (err: any) {
        setConfigError(err.message || "Failed to save configuration.");
      }
    });
  };

  const isGrowthPositive = site.visitsGrowth.startsWith("+");

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-6 shadow-xs space-y-4">
      {/* 1. Header with Connection State */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-ink">Site &amp; Traffic</h3>
        </div>

        <div className="flex items-center gap-2">
          {site.isGaConnected ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>GA4 Live</span>
              {site.realtimeActiveUsers > 0 && (
                <span className="font-semibold text-emerald-950">
                  &bull; {site.realtimeActiveUsers} active
                </span>
              )}
            </span>
          ) : (
            <button
              onClick={() => setShowConfigModal(true)}
              className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3 text-amber-700" />
              <span>Connect GA4</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Sync latest Google Analytics data"
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 2. Unconfigured Alert Notice */}
      {!site.isGaConnected && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 block text-[11px]">
                Google Analytics 4 Connection Required
              </span>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {site.gaError ||
                  "Connect your Service Account to populate real-time web telemetry, active users, session durations, and country analytics."}
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={() => setShowConfigModal(true)}
              className="text-[11px] font-bold text-white bg-amber-900 hover:bg-black px-3 py-1 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Configure Credentials</span>
            </button>
            <span className="text-[10px] text-amber-700 font-mono">
              Tag: G-GZM0QEVRFM
            </span>
          </div>
        </div>
      )}

      {/* 3. Core Telemetry Grid (Real Metrics) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-2xl bg-surface/60 border border-rule/60 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[11px] flex items-center gap-1">
              <Eye className="w-3 h-3" /> Pageviews (30d)
            </span>
            {site.isGaConnected && site.visitsGrowth !== "N/A" && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  isGrowthPositive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-red-700 bg-red-50"
                }`}
              >
                {site.visitsGrowth}
              </span>
            )}
          </div>
          <div className="text-lg font-bold text-ink">
            {site.isGaConnected ? site.monthlyVisits.toLocaleString() : "—"}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface/60 border border-rule/60 space-y-0.5">
          <span className="text-muted text-[11px] flex items-center gap-1">
            <Users className="w-3 h-3" /> Active Users
          </span>
          <div className="text-lg font-bold text-ink">
            {site.isGaConnected ? site.activeUsers.toLocaleString() : "—"}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface/60 border border-rule/60 space-y-0.5">
          <span className="text-muted text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3" /> Avg Duration
          </span>
          <div className="text-sm font-bold text-ink">
            {site.isGaConnected ? site.averageSessionDuration : "—"}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface/60 border border-rule/60 space-y-0.5">
          <span className="text-muted text-[11px] flex items-center gap-1">
            <FileText className="w-3 h-3" /> Publish Queue
          </span>
          <div className="text-sm font-bold text-emerald-800">
            <Link href={adminPath("/pages")} className="hover:underline">
              {site.publishQueue} items &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Tab Selector (Top Pages vs Countries) */}
      <div className="pt-2 border-t border-rule/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 bg-surface p-0.5 rounded-xl border border-rule/60 text-[11px]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white text-ink shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Top Pages
            </button>
            <button
              onClick={() => setActiveTab("geo")}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === "geo"
                  ? "bg-white text-ink shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Geographic
            </button>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="text-[11px] text-muted hover:text-ink inline-flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3 h-3" />
            <span>Settings</span>
          </button>
        </div>

        {/* Tab 1: Top Visited Pages */}
        {activeTab === "overview" && (
          <div className="space-y-1.5 text-xs">
            {site.topPages && site.topPages.length > 0 ? (
              site.topPages.slice(0, 5).map((pg) => (
                <div
                  key={pg.path}
                  className="flex items-center justify-between text-[11px] p-1.5 rounded-lg hover:bg-surface/60 transition-colors"
                >
                  <span className="text-ink truncate font-mono max-w-[180px] sm:max-w-[200px]" title={pg.path}>
                    {pg.path}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-ink font-semibold font-mono">
                      {pg.views.toLocaleString()}
                    </span>
                    <span className="text-muted text-[10px]">views</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-muted text-[11px]">
                {site.isGaConnected ? "No page views recorded in this period." : "Connect GA4 to view live pages."}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Geographic Distribution */}
        {activeTab === "geo" && (
          <div className="space-y-2 text-xs">
            {site.topCountries && site.topCountries.length > 0 ? (
              site.topCountries.slice(0, 5).map((c) => (
                <div key={c.country} className="space-y-1 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-ink font-semibold flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-emerald-700" />
                      {c.country}
                    </span>
                    <span className="text-muted font-mono font-semibold">
                      {c.activeUsers} users ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(5, c.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-muted text-[11px]">
                {site.isGaConnected
                  ? "No geographic sessions recorded in the last 30 days."
                  : "Connect GA4 to view real visitor country distribution."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Google Analytics Credentials Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-rule space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-rule/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-800">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Google Analytics 4 Connection</h3>
                  <p className="text-xs text-muted">Service Account API integration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-muted hover:text-ink cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {configError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
                {configError}
              </div>
            )}

            {configSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{configSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">
                  GA4 Numeric Property ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 478123456"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
                />
                <p className="text-[11px] text-muted mt-1 leading-normal">
                  Found in <strong>Google Analytics &rarr; Admin &rarr; Property Settings</strong> (a 9-digit number).
                  Note: Do not enter your Data Stream Measurement ID (<code className="text-ink font-mono font-bold">G-GZM0QEVRFM</code>).
                </p>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">
                  Service Account JSON Key
                </label>
                <textarea
                  rows={6}
                  placeholder={`Paste the downloaded Service Account JSON content here:
{
  "type": "service_account",
  "project_id": "sirotech-analytics",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",
  "client_email": "ga-reader@sirotech-analytics.iam.gserviceaccount.com",
  ...
}`}
                  value={jsonKey}
                  onChange={(e) => setJsonKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono"
                />
                <p className="text-[11px] text-muted mt-1 leading-normal">
                  Stored securely in the PostgreSQL <code className="text-ink">site_settings</code> table.
                  You can also configure this via <code className="text-ink font-mono font-semibold">GA_SERVICE_ACCOUNT_KEY</code> in <code className="text-ink font-mono">.env.local</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/80 border border-rule/60 space-y-1.5 text-[11px] text-muted">
                <span className="font-bold text-ink block">Quick Setup Checklist:</span>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>In Google Cloud Console, enable the <strong>Google Analytics Data API</strong>.</li>
                  <li>Create a <strong>Service Account</strong> and download a JSON key.</li>
                  <li>In Google Analytics Admin &rarr; <strong>Property Access Management</strong>, add the service account email with the <strong>Viewer</strong> role.</li>
                </ol>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-rule/60">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Test &amp; Save Connection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
