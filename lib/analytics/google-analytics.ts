import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { query } from "@/lib/db";

export interface GoogleAnalyticsMetricRow {
  activeUsers: number;
  pageViews: number;
  averageSessionDuration: number; // in seconds
  sessions: number;
  bounceRate: number; // percentage (0 - 100)
}

export interface GoogleAnalyticsPageItem {
  path: string;
  views: number;
  activeUsers: number;
}

export interface GoogleAnalyticsGeoItem {
  country: string;
  activeUsers: number;
  pageViews: number;
  percentage: number;
}

export interface GoogleAnalyticsReportData {
  isConfigured: boolean;
  configuredVia: "env" | "database" | "none";
  propertyId?: string;
  clientEmail?: string;
  current: GoogleAnalyticsMetricRow;
  previous?: GoogleAnalyticsMetricRow;
  growth: {
    pageViewsPercent: number; // e.g. +14.2%
    activeUsersPercent: number;
  };
  formattedSessionDuration: string; // e.g. "2m 35s"
  realtimeActiveUsers: number;
  topPages: GoogleAnalyticsPageItem[];
  topCountries: GoogleAnalyticsGeoItem[];
  lastFetchedAt: string;
  error?: string;
}

// In-memory cache to prevent hitting GA4 quota limits
let cachedReport: {
  data: GoogleAnalyticsReportData;
  expiresAt: number;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function clearAnalyticsCache() {
  cachedReport = null;
}

/**
 * Resolves credentials from process.env or the database site_settings table.
 */
export async function getGoogleAnalyticsCredentials() {
  // 1. Check environment variables
  const envPropertyId =
    process.env.GA_PROPERTY_ID || process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  const envKey = process.env.GA_SERVICE_ACCOUNT_KEY;
  const envClientEmail = process.env.GA_CLIENT_EMAIL;
  const envPrivateKey = process.env.GA_PRIVATE_KEY;
  const envFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (envPropertyId && (envKey || (envClientEmail && envPrivateKey) || envFile)) {
    return {
      source: "env" as const,
      propertyId: envPropertyId.trim(),
      serviceAccountKey: envKey?.trim(),
      clientEmail: envClientEmail?.trim(),
      privateKey: envPrivateKey?.replace(/\\n/g, "\n"),
      credentialsFile: envFile?.trim(),
    };
  }

  // 2. Check site_settings database table
  try {
    const res = await query<{ value: any }>(
      "SELECT value FROM site_settings WHERE key = 'google_analytics' LIMIT 1"
    );
    if (res.rows.length > 0 && res.rows[0].value) {
      const val =
        typeof res.rows[0].value === "string"
          ? JSON.parse(res.rows[0].value)
          : res.rows[0].value;

      if (val?.propertyId && (val?.serviceAccountKey || (val?.clientEmail && val?.privateKey))) {
        return {
          source: "database" as const,
          propertyId: String(val.propertyId).trim(),
          serviceAccountKey: val.serviceAccountKey,
          clientEmail: val.clientEmail,
          privateKey: val.privateKey ? String(val.privateKey).replace(/\\n/g, "\n") : undefined,
        };
      }
    }
  } catch (err) {
    console.error("[getGoogleAnalyticsCredentials db check error]", err);
  }

  return null;
}

/**
 * Instantiates the official Google Analytics Data API client
 */
function createAnalyticsClient(
  creds: NonNullable<Awaited<ReturnType<typeof getGoogleAnalyticsCredentials>>>
) {
  if (creds.serviceAccountKey) {
    const keyObj =
      typeof creds.serviceAccountKey === "string"
        ? JSON.parse(creds.serviceAccountKey)
        : creds.serviceAccountKey;

    return {
      client: new BetaAnalyticsDataClient({
        credentials: {
          client_email: keyObj.client_email,
          private_key: (keyObj.private_key || "").replace(/\\n/g, "\n"),
        },
        projectId: keyObj.project_id,
      }),
      clientEmail: keyObj.client_email as string | undefined,
    };
  }

  if (creds.clientEmail && creds.privateKey) {
    return {
      client: new BetaAnalyticsDataClient({
        credentials: {
          client_email: creds.clientEmail,
          private_key: creds.privateKey.replace(/\\n/g, "\n"),
        },
      }),
      clientEmail: creds.clientEmail,
    };
  }

  if (creds.credentialsFile) {
    return {
      client: new BetaAnalyticsDataClient({
        keyFilename: creds.credentialsFile,
      }),
      clientEmail: undefined,
    };
  }

  throw new Error("No valid Google Analytics credentials available.");
}

/**
 * Queries Google Analytics 4 for traffic metrics:
 * active users, page views, session duration, top pages, and geographic distribution.
 */
export async function getGoogleAnalyticsReport(
  forceRefresh: boolean = false
): Promise<GoogleAnalyticsReportData> {
  const now = Date.now();

  if (!forceRefresh && cachedReport && cachedReport.expiresAt > now) {
    return cachedReport.data;
  }

  const creds = await getGoogleAnalyticsCredentials();

  if (!creds) {
    return {
      isConfigured: false,
      configuredVia: "none",
      current: {
        activeUsers: 0,
        pageViews: 0,
        averageSessionDuration: 0,
        sessions: 0,
        bounceRate: 0,
      },
      growth: {
        pageViewsPercent: 0,
        activeUsersPercent: 0,
      },
      formattedSessionDuration: "0s",
      realtimeActiveUsers: 0,
      topPages: [],
      topCountries: [],
      lastFetchedAt: new Date().toISOString(),
      error:
        "Google Analytics credentials not configured. Please supply GA_PROPERTY_ID and GA_SERVICE_ACCOUNT_KEY in .env.local or via Admin Settings.",
    };
  }

  // Check if user accidentally entered a measurement ID (G-XXXX) instead of the numeric Property ID
  if (creds.propertyId.toUpperCase().startsWith("G-")) {
    return {
      isConfigured: false,
      configuredVia: creds.source,
      propertyId: creds.propertyId,
      current: {
        activeUsers: 0,
        pageViews: 0,
        averageSessionDuration: 0,
        sessions: 0,
        bounceRate: 0,
      },
      growth: {
        pageViewsPercent: 0,
        activeUsersPercent: 0,
      },
      formattedSessionDuration: "0s",
      realtimeActiveUsers: 0,
      topPages: [],
      topCountries: [],
      lastFetchedAt: new Date().toISOString(),
      error: `"${creds.propertyId}" appears to be a Measurement ID. Google Analytics Data API requires your numeric Property ID (found in GA4 Admin > Property Settings, e.g. 123456789).`,
    };
  }

  try {
    const { client, clientEmail } = createAnalyticsClient(creds);
    const property = `properties/${creds.propertyId.replace(/^properties\//, "")}`;

    // Run parallel reports: 30-day overview, prior 30-day for growth comparison, top pages, geographic data, and realtime
    const [overviewReport, prevReport, topPagesReport, geoReport, realtimeReport] =
      await Promise.allSettled([
        // 1. Current 30-day overview
        client.runReport({
          property,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          metrics: [
            { name: "activeUsers" },
            { name: "screenPageViews" },
            { name: "averageSessionDuration" },
            { name: "sessions" },
            { name: "bounceRate" },
          ],
        }),

        // 2. Previous 30-day overview for growth comparisons
        client.runReport({
          property,
          dateRanges: [{ startDate: "60daysAgo", endDate: "31daysAgo" }],
          metrics: [
            { name: "activeUsers" },
            { name: "screenPageViews" },
          ],
        }),

        // 3. Top visited pages
        client.runReport({
          property,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        }),

        // 4. Geographic breakdown by country
        client.runReport({
          property,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "country" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 8,
        }),

        // 5. Realtime active users (last 30 minutes)
        client.runRealtimeReport({
          property,
          metrics: [{ name: "activeUsers" }],
        }),
      ]);

    // Handle primary overview failure
    if (overviewReport.status === "rejected") {
      throw overviewReport.reason;
    }

    const [overviewRes] = overviewReport.value;
    const curValues = overviewRes?.rows?.[0]?.metricValues || [];
    const activeUsers = parseInt(curValues[0]?.value || "0", 10);
    const pageViews = parseInt(curValues[1]?.value || "0", 10);
    const averageSessionDuration = parseFloat(curValues[2]?.value || "0");
    const sessions = parseInt(curValues[3]?.value || "0", 10);
    const bounceRate = Math.round(parseFloat(curValues[4]?.value || "0") * 1000) / 10;

    // Handle previous range for growth calculations
    let prevActiveUsers = 0;
    let prevPageViews = 0;
    if (prevReport.status === "fulfilled") {
      const [prevRes] = prevReport.value;
      const prevVals = prevRes?.rows?.[0]?.metricValues || [];
      prevActiveUsers = parseInt(prevVals[0]?.value || "0", 10);
      prevPageViews = parseInt(prevVals[1]?.value || "0", 10);
    }

    const pageViewsGrowth =
      prevPageViews > 0
        ? Math.round(((pageViews - prevPageViews) / prevPageViews) * 1000) / 10
        : pageViews > 0
        ? 100
        : 0;

    const activeUsersGrowth =
      prevActiveUsers > 0
        ? Math.round(((activeUsers - prevActiveUsers) / prevActiveUsers) * 1000) / 10
        : activeUsers > 0
        ? 100
        : 0;

    // Top pages list
    let topPages: GoogleAnalyticsPageItem[] = [];
    if (topPagesReport.status === "fulfilled") {
      const [pRes] = topPagesReport.value;
      topPages = (pRes?.rows || []).map((row) => ({
        path: row.dimensionValues?.[0]?.value || "/",
        views: parseInt(row.metricValues?.[0]?.value || "0", 10),
        activeUsers: parseInt(row.metricValues?.[1]?.value || "0", 10),
      }));
    }

    // Top countries list
    let topCountries: GoogleAnalyticsGeoItem[] = [];
    if (geoReport.status === "fulfilled") {
      const [gRes] = geoReport.value;
      const totalGeoUsers = (gRes?.rows || []).reduce(
        (acc, r) => acc + parseInt(r.metricValues?.[0]?.value || "0", 10),
        0
      );

      topCountries = (gRes?.rows || []).map((row) => {
        const users = parseInt(row.metricValues?.[0]?.value || "0", 10);
        const views = parseInt(row.metricValues?.[1]?.value || "0", 10);
        return {
          country: row.dimensionValues?.[0]?.value || "Unknown",
          activeUsers: users,
          pageViews: views,
          percentage: totalGeoUsers > 0 ? Math.round((users / totalGeoUsers) * 100) : 0,
        };
      });
    }

    // Realtime active users
    let realtimeActive = 0;
    if (realtimeReport.status === "fulfilled") {
      const [rtRes] = realtimeReport.value;
      realtimeActive = parseInt(rtRes?.rows?.[0]?.metricValues?.[0]?.value || "0", 10);
    }

    const reportData: GoogleAnalyticsReportData = {
      isConfigured: true,
      configuredVia: creds.source,
      propertyId: creds.propertyId,
      clientEmail,
      current: {
        activeUsers,
        pageViews,
        averageSessionDuration,
        sessions,
        bounceRate,
      },
      previous: {
        activeUsers: prevActiveUsers,
        pageViews: prevPageViews,
        averageSessionDuration: 0,
        sessions: 0,
        bounceRate: 0,
      },
      growth: {
        pageViewsPercent: pageViewsGrowth,
        activeUsersPercent: activeUsersGrowth,
      },
      formattedSessionDuration: formatDuration(averageSessionDuration),
      realtimeActiveUsers: realtimeActive,
      topPages,
      topCountries,
      lastFetchedAt: new Date().toISOString(),
    };

    // Cache the successful report
    cachedReport = {
      data: reportData,
      expiresAt: now + CACHE_TTL_MS,
    };

    return reportData;
  } catch (err: any) {
    console.error("[getGoogleAnalyticsReport error]", err);
    return {
      isConfigured: true,
      configuredVia: creds.source,
      propertyId: creds.propertyId,
      current: {
        activeUsers: 0,
        pageViews: 0,
        averageSessionDuration: 0,
        sessions: 0,
        bounceRate: 0,
      },
      growth: {
        pageViewsPercent: 0,
        activeUsersPercent: 0,
      },
      formattedSessionDuration: "0s",
      realtimeActiveUsers: 0,
      topPages: [],
      topCountries: [],
      lastFetchedAt: new Date().toISOString(),
      error:
        err.message ||
        "Failed to query Google Analytics Data API. Verify your Service Account permissions (Viewer or Analyst role on GA4 Property).",
    };
  }
}
