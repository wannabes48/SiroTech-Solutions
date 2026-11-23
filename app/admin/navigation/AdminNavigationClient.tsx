"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Save, MoveUp, MoveDown, Check, ExternalLink, Sparkles } from "lucide-react";
import { saveMenuAction } from "@/app/admin/actions";

interface MenuItem {
  label: string;
  href: string;
  isExternal?: boolean;
  highlight?: boolean;
}

export function AdminNavigationClient({
  initialHeaderItems,
  initialFooterItems
}: {
  initialHeaderItems: MenuItem[];
  initialFooterItems: any[];
}) {
  const [headerItems, setHeaderItems] = useState<MenuItem[]>(initialHeaderItems);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [newIsExternal, setNewIsExternal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddHeaderItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newHref.trim()) return;

    const newItem: MenuItem = {
      label: newLabel.trim(),
      href: newHref.trim(),
      isExternal: newIsExternal
    };

    setHeaderItems([...headerItems, newItem]);
    setNewLabel("");
    setNewHref("");
    setNewIsExternal(false);
  };

  const handleRemoveHeaderItem = (idx: number) => {
    setHeaderItems(headerItems.filter((_, i) => i !== idx));
  };

  const handleMove = (idx: number, direction: "up" | "down") => {
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === headerItems.length - 1)) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const copy = [...headerItems];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setHeaderItems(copy);
  };

  const handleSaveHeaderMenu = () => {
    startTransition(async () => {
      const res = await saveMenuAction("header", headerItems);
      if (res?.error) {
        showToast(`Save failed: ${res.error}`);
      } else {
        showToast("Primary Header Menu saved and published globally!");
      }
    });
  };

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Header Menu Editor (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-rule/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Primary Header Menu</h2>
              <p className="text-xs text-muted">Desktop top bar and mobile navigation drawer items.</p>
            </div>
            <button
              type="button"
              onClick={handleSaveHeaderMenu}
              disabled={isPending}
              className="px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPending ? "Publishing..." : "Publish Menu Changes"}</span>
            </button>
          </div>

          {/* List of items */}
          <div className="space-y-2.5 text-xs">
            {headerItems.map((item, idx) => (
              <div
                key={`${item.href}-${idx}`}
                className="p-3.5 rounded-2xl bg-surface/60 border border-rule/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="p-0.5 hover:text-emerald-800 disabled:opacity-20 cursor-pointer"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === headerItems.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="p-0.5 hover:text-emerald-800 disabled:opacity-20 cursor-pointer"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-mono text-muted text-[11px] w-4">{idx + 1}.</span>
                  <span className="font-bold text-ink">{item.label}</span>
                  <span className="font-mono text-muted text-[11px] truncate">{item.href}</span>
                  {item.isExternal && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-800 font-semibold">
                      External
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveHeaderItem(idx)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-700 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Header Item */}
          <form onSubmit={handleAddHeaderItem} className="p-4 rounded-2xl bg-surface/30 border border-rule/80 space-y-3">
            <span className="font-semibold text-xs text-ink block">Add Menu Item</span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="Label (e.g. Case Studies)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rule outline-none text-xs"
                  required
                />
              </div>
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="Route / URL (e.g. /work)"
                  value={newHref}
                  onChange={(e) => setNewHref(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rule outline-none font-mono text-xs"
                  required
                />
              </div>
              <div className="sm:col-span-2 flex items-center">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs select-none pt-1">
              <input
                type="checkbox"
                checked={newIsExternal}
                onChange={(e) => setNewIsExternal(e.target.checked)}
                className="rounded border-rule text-emerald-700"
              />
              <span className="text-muted">Opens in external new tab</span>
            </label>
          </form>
        </div>

        {/* Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-ink">Navigation Live Preview</h2>
          <p className="text-xs text-muted">Simulated rendering of the primary site navigation bar:</p>

          <div className="p-4 rounded-2xl bg-surface border border-rule/70 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rule/50">
              <span className="font-bold text-xs text-emerald-900">SiroTech Solutions</span>
              <span className="text-[10px] text-muted font-mono">desktop navbar</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {headerItems.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-white border border-rule/80 font-medium text-body text-[11px]"
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-muted leading-relaxed">
            All modifications update the layout cache on Next.js edge nodes immediately upon publishing.
          </div>
        </div>
      </div>
    </div>
  );
}
