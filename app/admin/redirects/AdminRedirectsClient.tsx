"use client";

import React, { useState, useTransition } from "react";
import { CornerDownRight, AlertCircle, Plus, Trash2, CheckCircle2, Sparkles, ArrowRight, Search } from "lucide-react";
import { createRedirectAction, deleteRedirectAction } from "@/app/admin/actions";

interface RedirectItem {
  id: string;
  from_path: string;
  to_path: string;
  code: number;
  hits: number;
  active: boolean;
}

interface NotFoundLog {
  id: string;
  path: string;
  count: number;
  last_seen: string;
}

export function AdminRedirectsClient({
  initialRedirects,
  initialNotFoundLogs
}: {
  initialRedirects: RedirectItem[];
  initialNotFoundLogs: NotFoundLog[];
}) {
  const [redirects, setRedirects] = useState<RedirectItem[]>(initialRedirects);
  const [notFoundLogs, setNotFoundLogs] = useState<NotFoundLog[]>(initialNotFoundLogs);

  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [code, setCode] = useState<number>(301);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath.trim() || !toPath.trim()) return;

    startTransition(async () => {
      const res = await createRedirectAction({
        fromPath,
        toPath,
        code
      });

      if (res?.error) {
        showToast(`Error: ${res.error}`);
      } else {
        showToast(`Redirect rule active: ${fromPath} → ${toPath}`);
        setRedirects([
          {
            id: `red-${Date.now()}`,
            from_path: fromPath.trim(),
            to_path: toPath.trim(),
            code,
            hits: 0,
            active: true
          },
          ...redirects
        ]);
        setNotFoundLogs((prev) => prev.filter((l) => l.path !== fromPath.trim()));
        setFromPath("");
        setToPath("");
        setModalOpen(false);
      }
    });
  };

  const handleDelete = (id: string, path: string) => {
    if (!confirm(`Remove redirect rule for ${path}?`)) return;
    startTransition(async () => {
      const res = await deleteRedirectAction(id);
      if (res?.error) {
        showToast(`Delete failed: ${res.error}`);
      } else {
        showToast("Redirect rule removed.");
        setRedirects((prev) => prev.filter((r) => r.id !== id));
      }
    });
  };

  const openFor404 = (logPath: string) => {
    setFromPath(logPath);
    setToPath("/");
    setCode(301);
    setModalOpen(true);
  };

  const filtered = redirects.filter(
    (r) =>
      r.from_path.toLowerCase().includes(search.toLowerCase()) ||
      r.to_path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search redirect rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setFromPath("");
            setToPath("");
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Redirect Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Redirects (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Active Redirects ({filtered.length})</h2>
              <p className="text-xs text-muted">Executed by edge proxy before rendering.</p>
            </div>
            <CornerDownRight className="w-4 h-4 text-muted" />
          </div>

          <div className="divide-y divide-rule/60 text-xs">
            {filtered.length > 0 ? (
              filtered.map((r) => (
                <div key={r.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-ink font-semibold">{r.from_path}</span>
                      <span className="text-muted">&rarr;</span>
                      <span className="text-emerald-800 font-semibold">{r.to_path}</span>
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">
                      HTTP {r.code} &bull; {r.hits} total requests redirected
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.from_path)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-700 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-muted">No redirect rules match your search.</div>
            )}
          </div>
        </div>

        {/* 404 Monitor (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">404 Not Found Log ({notFoundLogs.length})</h2>
              <p className="text-xs text-muted">Visitor requests that returned missing page errors.</p>
            </div>
            <AlertCircle className="w-4 h-4 text-muted" />
          </div>

          <div className="divide-y divide-rule/60 text-xs">
            {notFoundLogs.length > 0 ? (
              notFoundLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-ink font-medium truncate block">{log.path}</span>
                    <span className="text-[10px] text-muted">{log.count} hits</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openFor404(log.path)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface hover:bg-emerald-50 hover:text-emerald-800 border border-rule text-body transition shrink-0 cursor-pointer"
                  >
                    Fix with Redirect
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-muted">
                No recent broken links or 404 exceptions recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Redirect Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-rule shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <h3 className="font-bold text-base text-ink">Configure URL Redirect</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Source Path (Old URL)</label>
                <input
                  type="text"
                  placeholder="/old-service-page"
                  value={fromPath}
                  onChange={(e) => setFromPath(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-mono outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Destination Path (Target URL)</label>
                <input
                  type="text"
                  placeholder="/services/custom-software"
                  value={toPath}
                  onChange={(e) => setToPath(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-mono outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">HTTP Status Code</label>
                <select
                  value={code}
                  onChange={(e) => setCode(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-medium outline-none"
                >
                  <option value={301}>301 - Permanent Redirect (SEO Link Equity Preserved)</option>
                  <option value={302}>302 - Temporary Redirect (Transient Migration)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-rule text-xs font-semibold text-body hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 transition shadow-xs"
                >
                  {isPending ? "Creating..." : "Save Redirect Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
