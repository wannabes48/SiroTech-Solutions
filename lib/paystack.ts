import { portalUrl } from "@/lib/hosts";
import { query } from "@/lib/db";
import crypto from "crypto";

export interface PaystackConfig {
  secretKey: string;
  publicKey: string;
  webhookSecret?: string;
  isLive: boolean;
  isConfigured: boolean;
}

let cachedConfig: { config: PaystackConfig; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

/**
 * Resolves Paystack credentials with fallback order:
 * 1. PostgreSQL site_settings (key = 'paystack')
 * 2. Environment variables: PAYSTACK_SECRET_KEY, NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, PAYSTACK_WEBHOOK_SECRET
 */
export async function getPaystackConfig(forceFresh = false): Promise<PaystackConfig> {
  const now = Date.now();
  if (!forceFresh && cachedConfig && now - cachedConfig.timestamp < CACHE_TTL_MS) {
    return cachedConfig.config;
  }

  let dbSecretKey = "";
  let dbPublicKey = "";
  let dbWebhookSecret = "";

  try {
    const res = await query("SELECT value FROM site_settings WHERE key = 'paystack' LIMIT 1");
    if (res.rows.length > 0 && res.rows[0].value) {
      const val = typeof res.rows[0].value === "string" ? JSON.parse(res.rows[0].value) : res.rows[0].value;
      dbSecretKey = (val.secretKey || "").trim();
      dbPublicKey = (val.publicKey || "").trim();
      dbWebhookSecret = (val.webhookSecret || "").trim();
    }
  } catch (err) {
    console.warn("[getPaystackConfig] Could not read from site_settings:", err);
  }

  const secretKey = dbSecretKey || (process.env.PAYSTACK_SECRET_KEY || "").trim();
  const publicKey = dbPublicKey || (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "").trim();
  const webhookSecret = dbWebhookSecret || (process.env.PAYSTACK_WEBHOOK_SECRET || secretKey || "").trim();

  const isLive = secretKey.startsWith("sk_live");
  const isConfigured = Boolean(secretKey && secretKey.length > 8);

  const config: PaystackConfig = {
    secretKey,
    publicKey,
    webhookSecret,
    isLive,
    isConfigured,
  };

  cachedConfig = { config, timestamp: now };
  return config;
}

export function clearPaystackConfigCache() {
  cachedConfig = null;
}

export interface InitializeTransactionParams {
  email: string;
  amountKes: number;
  amountUsd?: number;
  currency?: "KES" | "USD";
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

export interface InitializeTransactionResult {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  error?: string;
  isMock?: boolean;
}

/**
 * Initializes a Paystack transaction.
 * Converts amount into subunits (KES * 100 for cents).
 */
export async function initializePaystackTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
  const config = await getPaystackConfig();

  const currency = params.currency || "KES";
  const amountToCharge =
    currency === "USD" && params.amountUsd
      ? Math.round(Number(params.amountUsd) * 100)
      : Math.round(Number(params.amountKes) * 100);

  const reference = params.reference || `PSTK-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  // If Paystack is not yet configured with a valid secret key, provide a graceful development simulation
  if (!config.isConfigured) {
    console.warn("[Paystack] Secret key not configured. Generating test simulated transaction reference:", reference);
    return {
      success: true,
      authorizationUrl: `${params.callbackUrl || portalUrl("/invoices")}?paystack_ref=${reference}&simulated=true`,
      accessCode: `sim_pstk_${Date.now()}`,
      reference,
      isMock: true,
    };
  }

  try {
    const payload = {
      email: params.email,
      amount: amountToCharge,
      currency,
      reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata || {},
      channels: params.channels || ["card", "mobile_money", "bank"],
    };

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      console.error("[Paystack Initialize Error]", data);
      return {
        success: false,
        reference,
        error: data.message || `Paystack initialization failed (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference || reference,
    };
  } catch (err: any) {
    console.error("[initializePaystackTransaction Exception]", err);
    return {
      success: false,
      reference,
      error: err.message || "Network error connecting to Paystack API",
    };
  }
}

export interface VerifyTransactionResult {
  success: boolean;
  status: "success" | "failed" | "abandoned" | "pending" | "not_found";
  amount?: number; // In base units (e.g. KES)
  currency?: string;
  reference: string;
  gatewayResponse?: string;
  channel?: string;
  paidAt?: string;
  customer?: {
    email?: string;
    customerCode?: string;
    name?: string;
    phone?: string;
  };
  authorization?: {
    authorizationCode?: string;
    cardType?: string;
    last4?: string;
    expMonth?: string;
    expYear?: string;
    bank?: string;
    brand?: string;
    reusable?: boolean;
  };
  metadata?: Record<string, any>;
  rawResponse?: any;
  error?: string;
}

/**
 * Verifies transaction with Paystack API.
 */
export async function verifyPaystackTransaction(reference: string): Promise<VerifyTransactionResult> {
  const config = await getPaystackConfig();

  // If in unconfigured sandbox simulation mode
  if (!config.isConfigured) {
    return {
      success: true,
      status: "success",
      amount: 0,
      currency: "KES",
      reference,
      gatewayResponse: "Simulated Test Payment Successful",
      channel: "card",
      paidAt: new Date().toISOString(),
      rawResponse: { simulated: true },
    };
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return {
        success: false,
        status: "not_found",
        reference,
        error: data.message || `Verification failed with HTTP ${res.status}`,
        rawResponse: data,
      };
    }

    const tx = data.data;
    const isSuccess = tx.status === "success";

    return {
      success: isSuccess,
      status: tx.status,
      amount: tx.amount ? tx.amount / 100 : 0, // convert subunits back to main unit
      currency: tx.currency,
      reference: tx.reference || reference,
      gatewayResponse: tx.gateway_response,
      channel: tx.channel,
      paidAt: tx.paid_at,
      customer: {
        email: tx.customer?.email,
        customerCode: tx.customer?.customer_code,
        name: [tx.customer?.first_name, tx.customer?.last_name].filter(Boolean).join(" ") || undefined,
        phone: tx.customer?.phone,
      },
      authorization: tx.authorization
        ? {
            authorizationCode: tx.authorization.authorization_code,
            cardType: tx.authorization.card_type,
            last4: tx.authorization.last4,
            expMonth: tx.authorization.exp_month,
            expYear: tx.authorization.exp_year,
            bank: tx.authorization.bank,
            brand: tx.authorization.brand,
            reusable: tx.authorization.reusable,
          }
        : undefined,
      metadata: tx.metadata || {},
      rawResponse: tx,
    };
  } catch (err: any) {
    console.error("[verifyPaystackTransaction Exception]", err);
    return {
      success: false,
      status: "failed",
      reference,
      error: err.message || "Failed to contact Paystack verification endpoint",
    };
  }
}

/**
 * Executes a refund on Paystack.
 */
export async function refundPaystackTransaction(params: {
  referenceOrTxId: string;
  amountKes?: number;
  reason?: string;
  merchantNote?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const config = await getPaystackConfig();

  if (!config.isConfigured) {
    return {
      success: true,
      data: {
        simulated: true,
        reference: params.referenceOrTxId,
        refundedAt: new Date().toISOString(),
      },
    };
  }

  try {
    const payload: Record<string, any> = {
      transaction: params.referenceOrTxId,
      merchant_note: params.merchantNote || params.reason || "Authorized by SiroTech Administrator",
      customer_note: params.reason || "Payment reversal initiated by merchant.",
    };

    if (params.amountKes && params.amountKes > 0) {
      payload.amount = Math.round(params.amountKes * 100);
      payload.currency = "KES";
    }

    const res = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return {
        success: false,
        error: data.message || `Paystack refund failed with HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (err: any) {
    console.error("[refundPaystackTransaction Exception]", err);
    return {
      success: false,
      error: err.message || "Network exception during refund call",
    };
  }
}

/**
 * Validates Paystack Webhook HMAC-SHA512 Signature.
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null, secretKey: string): boolean {
  if (!signature || !secretKey) return false;
  try {
    const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "utf-8"), Buffer.from(signature, "utf-8"));
  } catch {
    return false;
  }
}

/**
 * Tests Paystack API keys by performing an authenticated request.
 */
export async function testPaystackConnection(secretKeyOverride?: string): Promise<{
  success: boolean;
  message: string;
  isLive?: boolean;
}> {
  const config = await getPaystackConfig();
  const secretKey = secretKeyOverride?.trim() || config.secretKey;

  if (!secretKey) {
    return {
      success: false,
      message: "No Paystack Secret Key provided.",
    };
  }

  try {
    const res = await fetch("https://api.paystack.co/integration/payment_session_timeout", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (res.ok && data.status) {
      const isLive = secretKey.startsWith("sk_live");
      return {
        success: true,
        isLive,
        message: `Connected successfully to Paystack (${isLive ? "Live Mode" : "Test Sandbox"}). API verified.`,
      };
    }

    return {
      success: false,
      message: data.message || `Paystack responded with HTTP ${res.status}: Invalid Secret Key.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to reach Paystack: ${err.message}`,
    };
  }
}
