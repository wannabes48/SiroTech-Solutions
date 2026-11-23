"use client";

import React, { useState, useTransition } from "react";
import {
  Globe,
  RefreshCw,
  Eye,
  Users,
  Clock,
  Activity,
  AlertCircle,
  MapPin,
  TrendingUp,
  Settings,
  ShieldCheck,
  CheckCircle2,
  X
} from "lucide-react";
import { getGoogleAnalyticsReportAction, saveGoogleAnalyticsConfigAction } from "@/app/admin/actions";
import { GoogleAnalyticsReportData } from "@/lib/analytics/google-analytics";

export function AnalyticsWebTrafficCard({
  initialData
}: {
  initialData: GoogleAnalyticsReportData | null;
}) {
  const [report, setReport] = useState<GoogleAnalyticsReportData | null>(initialData);
  const [isRefreshing, startRefresh] = useTransition();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const [propertyId, setPropertyId] = useState(report?.propertyId || "");
  const [jsonKey, setJsonKey] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  const handleRefresh = () => {
    startRefresh(async () => {
      const res = await getGoogleAnalyticsReportAction(true);
      if (res?.success && res.data) {
        setReport(res.data);
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
        } else if (res?.success && res.data) {
          setConfigSuccess(res.message || "Connected successfully!");
          setReport(res.data);
          setTimeout(() => setShowConfigModal(false), 1500);
        }
      } catch (err: any) {
        setConfigError(err.message || "Failed to save configuration.");
      }
    });
  };

  const isConnected = Boolean(report?.isConfigured && !report?.error);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">
                Web Traffic &amp; Acquisition (Google Analytics 4)
              </h2>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync
                  {report?.realtimeActiveUsers ? ` • ${report.realtimeActiveUsers} active now` : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  <AlertCircle className="w-3 h-3 text-amber-700" />
                  Setup Required
                </span>
              )}
            </div>
            <p className="text-xs text-muted">
              Live telemetry: active visitors, page views, session durations, and geographic reach.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3 py-1.5 rounded-xl border border-rule/80 text-xs font-semibold text-ink hover:bg-surface transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-muted" />
            <span>{isConnected ? "Configure GA4" : "Connect Service Account"}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-rule/80 text-muted hover:text-ink hover:bg-surface transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Live GA4 Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : ""}`} />
          </button>
        </div>
      </div>

      {/* Unconfigured Banner */}
      {!isConnected && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
          <div className="font-bold text-amber-900">
            {report?.error || "Google Analytics 4 Service Account credentials not yet configured."}
          </div>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            To display real-time traffic telemetry and geographic demographics, provide your numeric GA4 Property ID and Service Account JSON key.
          </p>
          <button
            onClick={() => setShowConfigModal(true)}
            className="text-[11px] font-bold text-white bg-amber-900 hover:bg-black px-3.5 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 mt-1"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Connect Service Account Now</span>
          </button>
        </div>
      )}

      {/* 4 Metric Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 space-y-1">
          <span className="text-muted block text-[11px] flex items-center gap-1">
            <Eye className="w-3 h-3" /> Pageviews (30d)
          </span>
          <div className="text-xl font-bold text-ink">
            {isConnected ? report?.current.pageViews.toLocaleString() : "—"}
          </div>
          {isConnected && report?.growth && (
            <span className={`text-[10px] font-semibold block ${report.growth.pageViewsPercent >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {report.growth.pageViewsPercent >= 0 ? "+" : ""}{report.growth.pageViewsPercent}% vs previous 30d
            </span>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 space-y-1">
          <span className="text-muted block text-[11px] flex items-center gap-1">
            <Users className="w-3 h-3" /> Active Users (30d)
          </span>
          <div className="text-xl font-bold text-ink">
            {isConnected ? report?.current.activeUsers.toLocaleString() : "—"}
          </div>
          {isConnected && report?.growth && (
            <span className={`text-[10px] font-semibold block ${report.growth.activeUsersPercent >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {report.growth.activeUsersPercent >= 0 ? "+" : ""}{report.growth.activeUsersPercent}% vs previous 30d
            </span>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 space-y-1">
          <span className="text-muted block text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3" /> Avg Session Duration
          </span>
          <div className="text-xl font-bold text-ink">
            {isConnected ? report?.formattedSessionDuration : "—"}
          </div>
          <span className="text-muted text-[10px] block">
            {isConnected ? `Bounce Rate: ${report?.current.bounceRate}%` : "Engagement rate"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/60 border border-rule/60 space-y-1">
          <span className="text-muted block text-[11px] flex items-center gap-1">
            <Activity className="w-3 h-3" /> Total Sessions
          </span>
          <div className="text-xl font-bold text-ink">
            {isConnected ? report?.current.sessions.toLocaleString() : "—"}
          </div>
          <span className="text-muted text-[10px] block font-mono">
            {isConnected && report?.lastFetchedAt ? `Synced ${new Date(report.lastFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Telemetry live"}
          </span>
        </div>
      </div>

      {/* Two Columns: Top Visited Pages & Geographic Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {/* Top Visited Pages */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Top Visited Pages (Last 30 Days)
          </h3>
          <div className="space-y-1.5 text-xs">
            {isConnected && report?.topPages && report.topPages.length > 0 ? (
              report.topPages.slice(0, 7).map((pg) => (
                <div
                  key={pg.path}
                  className="p-2.5 rounded-xl bg-surface/50 border border-rule/60 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-ink truncate max-w-[240px]" title={pg.path}>
                    {pg.path}
                  </span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-bold text-ink font-mono">{pg.views.toLocaleString()}</span>
                    <span className="text-muted text-[11px]">views</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-xs py-4 text-center">
                {isConnected ? "No page views recorded in the last 30 days." : "Connect GA4 to view top pages."}
              </p>
            )}
          </div>
        </div>

        {/* Geographic Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Geographic Demographics (Top Countries)
          </h3>
          <div className="space-y-2 text-xs">
            {isConnected && report?.topCountries && report.topCountries.length > 0 ? (
              report.topCountries.slice(0, 7).map((c) => (
                <div key={c.country} className="p-2.5 rounded-xl bg-surface/50 border border-rule/60 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-700" />
                      {c.country}
                    </span>
                    <span className="font-mono text-muted font-semibold">
                      {c.activeUsers} users ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(5, c.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-xs py-4 text-center">
                {isConnected ? "No geographic data recorded." : "Connect GA4 to view visitor countries."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Credentials Modal */}
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
                  <p className="text-xs text-muted">Configure Service Account</p>
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
                  Do not enter the Measurement ID (<code className="text-ink font-mono font-bold">G-GZM0QEVRFM</code>).
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
