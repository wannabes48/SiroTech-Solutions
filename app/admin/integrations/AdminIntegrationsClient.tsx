"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Eye,
  Sparkles,
  Send,
  ShieldCheck,
  Lock,
  Radio,
  Zap,
  Globe,
  Database,
  Calendar,
  CreditCard,
  Bot,
  Activity,
  Layers,
  X,
  Settings,
  KeyRound,
  Copy,
  Check,
  EyeOff,
  Loader2,
} from "lucide-react";
import {
  testIntegrationAction,
  replayWebhookAction,
  getPaystackConfigAction,
  savePaystackConfigAction,
  testPaystackConnectionAction,
} from "@/app/admin/actions";

interface IntegrationItem {
  id: string;
  name: string;
  provider: string;
  isConfigured: boolean;
  mode?: string;
  shortcode?: string;
  domainStatus?: string;
  lastDispatch?: string;
  lastWebhook?: string;
  lastCallback?: string;
  keyPresent?: boolean;
  modelName?: string;
  lastSuccessfulCall?: string;
  bucketName?: string;
  permissionScope?: string;
  environment?: string;
  tracesSampleRate?: string;
  latencyStatus?: string;
  rateLimitPolicy?: string;
  guardScope?: string;
  details: string;
}

interface WebhookEventRow {
  id: string;
  provider: string;
  type: string;
  status: string;
  attempts: number;
  payload: any;
  error?: string;
  received_at: string;
  processed_at?: string;
}

export function AdminIntegrationsClient({
  integrations,
  initialWebhooks
}: {
  integrations: IntegrationItem[];
  initialWebhooks: WebhookEventRow[];
}) {
  const [items, setItems] = useState<IntegrationItem[]>(integrations);
  const [webhooks, setWebhooks] = useState<WebhookEventRow[]>(initialWebhooks);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Paystack Configuration State
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackWebhookSecret, setPaystackWebhookSecret] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [paystackTesting, setPaystackTesting] = useState(false);
  const [paystackSaving, setPaystackSaving] = useState(false);
  const [paystackFeedback, setPaystackFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const handleOpenPaystackModal = async () => {
    setPaystackFeedback(null);
    setPaystackModalOpen(true);
    try {
      const res = await getPaystackConfigAction();
      if (res.publicKey) setPaystackPublicKey(res.publicKey);
      if (res.maskedSecret) setPaystackSecretKey(res.maskedSecret);
    } catch (e) {
      console.warn("Could not load Paystack settings:", e);
    }
  };

  const handleTestPaystack = async () => {
    setPaystackTesting(true);
    setPaystackFeedback(null);
    try {
      const res = await testPaystackConnectionAction(
        paystackSecretKey.includes("••••") ? undefined : paystackSecretKey
      );
      if (res.success) {
        setPaystackFeedback({ type: "success", message: res.message });
      } else {
        setPaystackFeedback({ type: "error", message: res.message });
      }
    } catch (e: any) {
      setPaystackFeedback({ type: "error", message: e.message || "Failed to contact Paystack." });
    } finally {
      setPaystackTesting(false);
    }
  };

  const handleSavePaystack = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaystackSaving(true);
    setPaystackFeedback(null);

    try {
      const res = await savePaystackConfigAction({
        secretKey: paystackSecretKey,
        publicKey: paystackPublicKey,
        webhookSecret: paystackWebhookSecret,
      });

      if (res.success) {
        setPaystackFeedback({ type: "success", message: res.message || "Paystack credentials saved successfully!" });
        showToast("Paystack Africa integration updated.");
        // Update local items state
        setItems((prev) =>
          prev.map((it) =>
            it.id === "paystack"
              ? { ...it, isConfigured: true, mode: res.isLive ? "Live Mode" : "Test Sandbox" }
              : it
          )
        );
        setTimeout(() => setPaystackModalOpen(false), 1800);
      } else {
        setPaystackFeedback({ type: "error", message: res.error || "Failed to save Paystack settings." });
      }
    } catch (e: any) {
      setPaystackFeedback({ type: "error", message: e.message || "Unexpected exception saving Paystack configuration." });
    } finally {
      setPaystackSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sirotech.co.ke";
    const webhookUrl = `${origin}/api/paystack/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendTest = (item: IntegrationItem) => {
    setTestingId(item.id);
    startTransition(async () => {
      try {
        const res = await testIntegrationAction(item.id);
        if (res.success) {
          showToast(`Test signal verified for ${item.name} at ${res.timestamp}.`);
          // Add synthetic test event to table
          setWebhooks((prev) => [
            {
              id: `test-${Date.now()}`,
              provider: item.id.toUpperCase(),
              type: `test.${item.id}.ping`,
              status: "PROCESSED",
              attempts: 1,
              payload: { test: true, triggered_by: "Admin Control Room", message: res.message },
              received_at: new Date().toISOString()
            },
            ...prev
          ]);
        }
      } catch (err: any) {
        showToast(`Test error: ${err?.message || "Failed to trigger test"}`);
      } finally {
        setTestingId(null);
      }
    });
  };

  const handleReplay = (id: string, provider: string) => {
    startTransition(async () => {
      const res = await replayWebhookAction(id);
      if (res?.error) {
        showToast(`Replay error: ${res.error}`);
      } else {
        showToast(`Webhook event for ${provider} replayed successfully.`);
        setWebhooks((prev) =>
          prev.map((w) =>
            w.id === id ? { ...w, status: "PROCESSED", attempts: w.attempts + 1, error: undefined } : w
          )
        );
      }
    });
  };

  const getProviderIcon = (id: string) => {
    switch (id) {
      case "paystack":
        return <CreditCard className="w-5 h-5 text-emerald-700" />;
      case "resend":
        return <Send className="w-5 h-5 text-cyan-600" />;
      case "cal":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "turnstile":
        return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      case "upstash":
        return <Database className="w-5 h-5 text-rose-600" />;
      case "r2":
        return <Layers className="w-5 h-5 text-orange-600" />;
      case "anthropic":
        return <Bot className="w-5 h-5 text-amber-700" />;
      case "sentry":
        return <Activity className="w-5 h-5 text-purple-600" />;
      default:
        return <Radio className="w-5 h-5 text-muted" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B2E24] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-rule/70 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-700" />
          <span>
            <strong>Zero-Knowledge Secret Architecture:</strong> Secret keys, passkeys, and API tokens are
            read strictly from protected environment variables and are never rendered in client HTML.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[11px] text-ink font-semibold">
          {items.length} External Gateways Active
        </span>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isTesting = testingId === item.id && isPending;

          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-rule transition-colors"
            >
              <div className="space-y-3">
                {/* Header: Icon, Name, and Configured Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-surface border border-rule/60">
                      {getProviderIcon(item.id)}
                    </div>
                    <div>
                      <h3 className="font-bold text-ink text-sm leading-tight">{item.name}</h3>
                      <span className="text-[11px] text-muted">{item.provider}</span>
                    </div>
                  </div>

                  {item.isConfigured ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      CONFIGURED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      NOT CONFIGURED
                    </span>
                  )}
                </div>

                {/* Specific Meta Attributes */}
                <div className="p-3 rounded-2xl bg-surface/60 border border-rule/60 space-y-1.5 text-xs">
                  {/* Paystack specific */}
                  {item.id === "paystack" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">Environment Mode:</span>
                        <span className={`font-bold ${item.mode === "Live Mode" ? "text-emerald-900" : "text-amber-900"}`}>
                          {item.mode || "Test Sandbox"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Last Inbound Webhook:</span>
                        <span className="font-medium text-ink">
                          {item.lastWebhook && item.lastWebhook !== "None received yet"
                            ? new Date(item.lastWebhook).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "None received yet"}
                        </span>
                      </div>
                    </>
                  )}


                  {/* Resend specific */}
                  {item.id === "resend" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">Domain Status:</span>
                        <span className="font-semibold text-emerald-800">{item.domainStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Outbound Delivery:</span>
                        <span className="font-medium text-ink">{item.lastDispatch}</span>
                      </div>
                    </>
                  )}

                  {/* Cal.com specific */}
                  {item.id === "cal" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">Last Booking Webhook:</span>
                        <span className="font-medium text-ink">
                          {item.lastWebhook
                            ? new Date(item.lastWebhook).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "None"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Booking Endpoint:</span>
                        <span className="font-semibold text-blue-900">cal.com/sirotech</span>
                      </div>
                    </>
                  )}

                  {/* Turnstile specific */}
                  {item.id === "turnstile" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">Protection Mode:</span>
                        <span className="font-semibold text-amber-900">{item.mode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Guarded Routes:</span>
                        <span className="font-medium text-ink truncate max-w-[170px]">{item.guardScope}</span>
                      </div>
                    </>
                  )}

                  {/* Upstash specific */}
                  {item.id === "upstash" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">Cluster Health:</span>
                        <span className="font-semibold text-rose-900">{item.latencyStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Rate Limiting:</span>
                        <span className="font-medium text-ink">{item.rateLimitPolicy}</span>
                      </div>
                    </>
                  )}

                  {/* R2 specific */}
                  {item.id === "r2" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">S3 Bucket Name:</span>
                        <span className="font-mono font-bold text-orange-950">{item.bucketName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Permissions:</span>
                        <span className="font-medium text-ink">{item.permissionScope}</span>
                      </div>
                    </>
                  )}

                  {/* Anthropic specific */}
                  {item.id === "anthropic" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">Key Present:</span>
                        <span className="font-semibold text-emerald-800">{item.keyPresent ? "Yes (Protected)" : "Missing"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Last Successful Call:</span>
                        <span className="font-medium text-ink">
                          {item.lastSuccessfulCall
                            ? new Date(item.lastSuccessfulCall).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "Recently Active"}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Sentry specific */}
                  {item.id === "sentry" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">Environment:</span>
                        <span className="font-mono font-semibold text-purple-900">{item.environment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Traces Sample Rate:</span>
                        <span className="font-medium text-ink">{item.tracesSampleRate}</span>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-xs text-body leading-relaxed">{item.details}</p>
              </div>

              {/* Action: Send Test Button & Configure */}
              <div className="pt-3 border-t border-rule/50 flex items-center justify-between">
                <span className="text-[10px] text-muted">Never shows secret token</span>

                <div className="flex items-center gap-2">
                  {item.id === "paystack" && (
                    <button
                      type="button"
                      onClick={handleOpenPaystackModal}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Settings className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Configure</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSendTest(item)}
                    disabled={isTesting}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-rule hover:bg-surface text-ink text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Send className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-emerald-600" : "text-muted"}`} />
                    <span>{isTesting ? "Testing..." : "Send Test"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Webhook Events Monitor */}
      <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-rule/60 pb-3">
          <div>
            <h2 className="text-base font-bold text-ink">Inbound Webhook Events ({webhooks.length})</h2>
            <p className="text-xs text-muted mt-0.5">
              Live audit trail of external HTTP callbacks received from Paystack, Cal.com, and system test signals.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-muted bg-surface px-3 py-1 rounded-full border border-rule">
            Auto-Retention: 30 Days
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Provider</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Attempts</th>
                <th className="py-2.5 px-4">Received At</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {webhooks.length > 0 ? (
                webhooks.map((w) => (
                  <tr key={w.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-ink uppercase">{w.provider}</td>
                    <td className="py-3 px-4 font-mono text-muted">{w.type}</td>
                    <td className="py-3 px-4">
                      {w.status === "PROCESSED" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          PROCESSED
                        </span>
                      )}
                      {w.status === "FAILED" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <XCircle className="w-3 h-3 text-red-700" />
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">{w.attempts}</td>
                    <td className="py-3 px-4 text-muted">
                      {new Date(w.received_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPayload(w.payload)}
                        className="py-1 px-2.5 rounded-lg border border-rule hover:bg-surface text-ink text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-muted" />
                        <span>Payload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReplay(w.id, w.provider)}
                        className="py-1 px-2.5 rounded-lg border border-rule hover:bg-surface text-ink text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-muted" />
                        <span>Replay</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    No webhook events recorded yet. Click &quot;Send Test&quot; above to simulate an ingestion cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Viewer Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rule/60 pb-3">
              <h3 className="text-base font-bold text-ink">Webhook Payload Inspector</h3>
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-surface border border-rule/70 font-mono text-xs overflow-auto max-h-96 text-ink">
              {JSON.stringify(selectedPayload, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] text-white text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Paystack Gateway Configuration Modal */}
      {paystackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 border border-rule">
            <div className="flex items-center justify-between border-b border-rule/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Paystack Gateway Configuration</h3>
                  <p className="text-xs text-muted">Manage API keys, webhooks, and live transaction processing.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaystackModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paystackFeedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  paystackFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {paystackFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{paystackFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSavePaystack} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center justify-between">
                  <span>Paystack Secret Key (sk_test_... or sk_live_...) *</span>
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="text-[11px] text-muted hover:text-ink font-normal flex items-center gap-1 cursor-pointer"
                  >
                    {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSecretKey ? "Hide" : "Reveal"}</span>
                  </button>
                </label>
                <input
                  type={showSecretKey ? "text" : "password"}
                  required
                  placeholder="sk_test_..."
                  value={paystackSecretKey}
                  onChange={(e) => setPaystackSecretKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Paystack Public Key (pk_test_... or pk_live_...)
                </label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={paystackPublicKey}
                  onChange={(e) => setPaystackPublicKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center justify-between">
                  <span>Paystack Webhook URL</span>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Auto-Dispatched
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : "https://sirotech.co.ke"}/api/paystack/webhook`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface/70 border border-rule text-xs font-mono text-muted select-all"
                  />
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="px-3 py-2.5 rounded-xl border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                    <span>{copiedWebhook ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Add this URL in your Paystack Dashboard &gt; Settings &gt; Preferences &gt; Webhook URL.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Webhook Secret (Optional, defaults to Secret Key)
                </label>
                <input
                  type="password"
                  placeholder="Optional custom webhook secret"
                  value={paystackWebhookSecret}
                  onChange={(e) => setPaystackWebhookSecret(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs font-mono text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-rule/60">
                <button
                  type="button"
                  disabled={paystackTesting || paystackSaving || !paystackSecretKey}
                  onClick={handleTestPaystack}
                  className="px-4 py-2 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {paystackTesting && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />}
                  <span>{paystackTesting ? "Pinging Paystack..." : "Test Connection"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaystackModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paystackSaving || paystackTesting || !paystackSecretKey}
                    className="px-5 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                  >
                    {paystackSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{paystackSaving ? "Saving & Testing..." : "Save & Activate"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
