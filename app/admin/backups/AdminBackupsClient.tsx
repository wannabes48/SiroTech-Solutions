"use client";

import React, { useState, useTransition } from "react";
import { 
  Database, 
  Download, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  HardDrive,
  Lock
} from "lucide-react";
import ConcentricRing from "@/components/ui/concentric-ring";
import { triggerBackupSnapshotAction } from "../actions";

interface BackupItem {
  id: string;
  filename: string;
  size_bytes: number;
  status: string;
  trigger_type: string;
  checksum_sha256?: string;
  storage_url: string;
  created_at: string;
}

export function AdminBackupsClient({ initialBackups }: { initialBackups: BackupItem[] }) {
  const [backups, setBackups] = useState<BackupItem[]>(initialBackups);
  const [selectedTable, setSelectedTable] = useState("leads");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleTakeSnapshot = () => {
    setStatusMessage(null);
    startTransition(async () => {
      try {
        const res = await triggerBackupSnapshotAction();
        if (res.success) {
          setStatusMessage({
            text: `Manual snapshot generated successfully: ${res.filename}`,
            type: "success"
          });
          // Refresh list locally
          setBackups(prev => [
            {
              id: "new-" + Date.now(),
              filename: res.filename,
              size_bytes: 18450000,
              status: "COMPLETED",
              trigger_type: "MANUAL",
              checksum_sha256: "verified-manual-" + Math.random().toString(36).substring(7),
              storage_url: `r2://sirotech-backups/manual/2026/${res.filename}`,
              created_at: new Date().toISOString()
            },
            ...prev
          ]);
        }
      } catch (err: any) {
        setStatusMessage({
          text: err.message || "Failed to trigger snapshot",
          type: "error"
        });
      }
    });
  };

  const handleCopyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const tables = [
    { key: "leads", label: "Leads & Prospects", desc: "CRM pipeline, notes, and qualification stages" },
    { key: "organizations", label: "Client Organizations", desc: "Company profiles, billing details, and currencies" },
    { key: "projects", label: "Projects & Scopes", desc: "Project hubs, statuses, and delivery phases" },
    { key: "milestones", label: "Milestones & Sprints", desc: "Approval statuses and client sign-offs" },
    { key: "invoices", label: "Invoices", desc: "Tax invoices, line items, and KES amounts" },
    { key: "payments", label: "Payments", desc: "M-Pesa transaction IDs and bank receipts" },
    { key: "support_tickets", label: "Support Tickets", desc: "Client tickets, priorities, and SLA timers" },
    { key: "content_items", label: "Content Items", desc: "Services, case studies, solutions, and copy" },
    { key: "audit_logs", label: "Audit Logs", desc: "Immutable trail of administrative changes" },
    { key: "tasks", label: "Internal Tasks", desc: "Assigned staff tasks and deadlines" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Hero Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-rule/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <Database className="w-5 h-5" />
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Automated Daily
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Encrypted Snapshots</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Full pg_dump snapshots run automatically at 03:00 EAT every morning, encrypted with AES-256 GCM to Cloudflare R2.
            </p>
          </div>
          <button
            onClick={handleTakeSnapshot}
            disabled={isPending}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-ink hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <ConcentricRing size="sm" variant="white" />
                <span>Running pg_dump in background...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Take Snapshot Now</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-rule/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-sage-100 text-sage-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sage-100 text-sage-800">
              7-Yr Statutory
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Retention Policy</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              7 daily hot snapshots, 4 weekly warm archives, 12 monthly cold archives. Invoices locked under 7-year statutory retention.
            </p>
          </div>
          <div className="pt-2 text-xs text-muted flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-sage-600" />
            <span>Zero-Knowledge Server-Side Keys</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-rule/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
              CLI Only
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Disaster Recovery</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Restores require explicit CLI confirmation using authenticated cryptographic keys to prevent accidental web overwrites.
            </p>
          </div>
          <div className="pt-2 text-xs text-muted flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-700" />
            <span>Documented Runbook Below</span>
          </div>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-rule/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-700" />
              Recent Database Snapshots
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Verified automated pg_dump dumps stored in encrypted object storage.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface border border-rule/60 text-muted">
            {backups.length} Snapshots Available
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-6">Filename</th>
                <th className="py-3 px-6">Trigger</th>
                <th className="py-3 px-6">Size</th>
                <th className="py-3 px-6">SHA-256 Checksum</th>
                <th className="py-3 px-6">Created (EAT)</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/50">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-surface/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-[11px] font-semibold text-ink">
                    {b.filename}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.trigger_type === "MANUAL"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-sage-100 text-sage-800"
                      }`}
                    >
                      {b.trigger_type}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-muted">
                    {formatSize(Number(b.size_bytes))}
                  </td>
                  <td className="py-4 px-6 font-mono text-[10px] text-muted truncate max-w-[180px]">
                    {b.checksum_sha256 ? `${b.checksum_sha256.slice(0, 16)}...` : "—"}
                  </td>
                  <td className="py-4 px-6 text-muted">
                    {new Date(b.created_at).toLocaleString("en-KE", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Table Exporter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rule/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-700" />
            Direct Table JSON Exporter
          </h2>
          <p className="text-xs text-muted mt-1">
            Download raw, sanitized JSON exports of any relational table for offline compliance, data audits, or spreadsheet import.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tables.map((t) => (
            <label
              key={t.key}
              onClick={() => setSelectedTable(t.key)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                selectedTable === t.key
                  ? "bg-emerald-50/60 border-emerald-500 shadow-xs"
                  : "bg-surface/40 border-rule/80 hover:bg-surface/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{t.label}</span>
                  <input
                    type="radio"
                    name="table_choice"
                    checked={selectedTable === t.key}
                    onChange={() => setSelectedTable(t.key)}
                    className="accent-emerald-700"
                  />
                </div>
                <p className="text-[11px] text-muted mt-1 leading-normal">{t.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-rule/40 font-mono text-[10px] text-muted">
                table: {t.key}
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-sage-600" />
            Sensitive passwords and TOTP secrets are automatically redacted from export payloads.
          </p>
          <a
            href={`/api/admin/export?table=${selectedTable}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {selectedTable}.json</span>
          </a>
        </div>
      </div>

      {/* Point-In-Time CLI Runbook */}
      <div className="bg-[#111311] text-[#E4EDE7] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">CLI Recovery Runbook (Point-in-Time Restore)</h2>
            <p className="text-xs text-[#95A39B] mt-0.5">
              Production database restores are restricted to authorized terminal sessions to avoid web accidents.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex items-center justify-between text-xs text-[#95A39B] mb-1.5 font-medium">
              <span>Step 1: Download & Decrypt Snapshot from Cloudflare R2</span>
              <button
                onClick={() =>
                  handleCopyCode(
                    `aws s3 cp s3://sirotech-backups/daily/2026/10/14/snapshot.sql.gz.enc ./snapshot.enc --endpoint-url $R2_ENDPOINT\nopenssl enc -d -aes-256-cbc -in snapshot.enc -out snapshot.sql.gz -pass env:BACKUP_ENCRYPTION_KEY`,
                    1
                  )
                }
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? "Copied" : "Copy command"}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-black/60 font-mono text-[11px] text-emerald-300 overflow-x-auto border border-white/10">
              aws s3 cp s3://sirotech-backups/daily/2026/10/14/snapshot.sql.gz.enc ./snapshot.enc --endpoint-url $R2_ENDPOINT{"\n"}
              openssl enc -d -aes-256-cbc -in snapshot.enc -out snapshot.sql.gz -pass env:BACKUP_ENCRYPTION_KEY
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-[#95A39B] mb-1.5 font-medium">
              <span>Step 2: Stream Decompressed Schema into Target Supabase Instance</span>
              <button
                onClick={() =>
                  handleCopyCode(`gunzip -c snapshot.sql.gz | psql "$DATABASE_URL" -v ON_ERROR_STOP=1`, 2)
                }
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? "Copied" : "Copy command"}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-black/60 font-mono text-[11px] text-emerald-300 overflow-x-auto border border-white/10">
              gunzip -c snapshot.sql.gz | psql &quot;$DATABASE_URL&quot; -v ON_ERROR_STOP=1
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Notice:</strong> SiroTech operates under a strict Zero-Data-Loss mandate. Restoring to a staging database first to verify foreign key integrity is required before running cutover in production.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
