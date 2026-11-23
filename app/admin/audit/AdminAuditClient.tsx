"use client";

import React, { useState } from "react";
import { Download, Filter, Eye, X, Terminal, Search, CheckCircle2 } from "lucide-react";

interface AuditLogRecord {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  action: string;
  entity: string;
  entity_id?: string;
  before?: any;
  after?: any;
  metadata?: any;
  ip_address?: string;
  created_at: string;
}

export function AdminAuditClient({ initialLogs = [] }: { initialLogs: AuditLogRecord[] }) {
  const [logs] = useState<AuditLogRecord[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [inspectLog, setInspectLog] = useState<AuditLogRecord | null>(null);

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== "ALL" && !log.action.includes(actionFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (log.user_name && log.user_name.toLowerCase().includes(q)) ||
        (log.user_email && log.user_email.toLowerCase().includes(q)) ||
        log.action.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        (log.ip_address && log.ip_address.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Actor Name", "Actor Email", "Action", "Entity", "Entity ID", "IP Address", "Metadata"];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.created_at).toISOString()}"`,
      `"${l.user_name || "System"}"`,
      `"${l.user_email || ""}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.entity_id || ""}"`,
      `"${l.ip_address || ""}"`,
      `"${JSON.stringify(l.metadata || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sirotech-audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const actionCategories = [
    { id: "ALL", label: "All Actions" },
    { id: "SITE_SETTINGS", label: "Settings" },
    { id: "FEATURE_FLAG", label: "Flags" },
    { id: "STAFF", label: "Staff & Auth" },
    { id: "INVOICE", label: "Billing" },
    { id: "CONTENT", label: "Content Store" },
    { id: "PRIVACY", label: "Privacy / ODPC" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter & Export Bar */}
      <div className="bg-white rounded-3xl border border-rule/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search actor, action, IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3.5 py-1.5 rounded-full bg-surface border border-rule text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {actionCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActionFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  actionFilter === cat.id
                    ? "bg-[#1B2E24] text-white"
                    : "bg-surface text-muted hover:text-ink border border-rule/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Actor</th>
                <th className="py-3 px-6">Action</th>
                <th className="py-3 px-6">Entity</th>
                <th className="py-3 px-6">Client IP</th>
                <th className="py-3 px-6">Payload</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-muted text-[11px]">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-ink">
                      {log.user_name || "System Actor"}
                      {log.user_email && <span className="block text-[10px] text-muted font-normal">{log.user_email}</span>}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface border border-rule text-ink">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-muted text-[11px]">{log.entity}</td>
                    <td className="py-3.5 px-6 font-mono text-muted text-[11px]">{log.ip_address || "127.0.0.1"}</td>
                    <td className="py-3.5 px-6">
                      <span className="text-[11px] font-mono text-muted truncate max-w-xs block">
                        {JSON.stringify(log.metadata || log.after || {})}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectLog(log)}
                        className="p-1.5 rounded-lg bg-surface hover:bg-stone-200 text-muted hover:text-ink transition-colors cursor-pointer"
                        title="Inspect diff payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted">
                    No operational audit logs match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log Diff Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-rule animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rule/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Audit Entry: {inspectLog.action}</h3>
                <span className="text-xs font-mono text-muted">
                  Recorded: {new Date(inspectLog.created_at).toLocaleString()} by {inspectLog.user_name || "System"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="p-1.5 rounded-full hover:bg-surface text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl bg-surface/60 border border-rule/60 font-mono text-[11px]">
                <div>
                  <span className="text-muted block font-sans">Entity Target</span>
                  <span className="font-semibold text-ink">{inspectLog.entity}</span>
                </div>
                <div>
                  <span className="text-muted block font-sans">Entity ID</span>
                  <span className="font-semibold text-ink">{inspectLog.entity_id || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted block font-sans">Origin IP</span>
                  <span className="font-semibold text-ink">{inspectLog.ip_address || "Internal"}</span>
                </div>
                <div>
                  <span className="text-muted block font-sans">Log ID</span>
                  <span className="font-semibold text-ink">{inspectLog.id}</span>
                </div>
              </div>

              {inspectLog.before && (
                <div>
                  <h4 className="font-bold text-ink mb-1">State Before Mutation</h4>
                  <pre className="p-3 rounded-xl bg-stone-900 text-rose-300 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(inspectLog.before, null, 2)}
                  </pre>
                </div>
              )}

              {inspectLog.after && (
                <div>
                  <h4 className="font-bold text-ink mb-1">State After Mutation</h4>
                  <pre className="p-3 rounded-xl bg-stone-900 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(inspectLog.after, null, 2)}
                  </pre>
                </div>
              )}

              {inspectLog.metadata && !inspectLog.after && (
                <div>
                  <h4 className="font-bold text-ink mb-1">Audit Metadata</h4>
                  <pre className="p-3 rounded-xl bg-stone-900 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-48">
                    {JSON.stringify(inspectLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-rule/60">
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] text-white cursor-pointer"
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
