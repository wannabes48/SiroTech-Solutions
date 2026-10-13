/**
 * Rate Limiter and Daily Budget Guardrails for SiroTech Assistant.
 * Enforces:
 * - 20 messages per 10 minutes per IP
 * - 60 messages per day per IP
 * - Daily token budget in Redis / memory via ASSISTANT_DAILY_TOKENS
 */

interface IpRateRecord {
  count10m: number;
  reset10m: number;
  countDay: number;
  resetDay: number;
}

const ipMap = new Map<string, IpRateRecord>();
const WINDOW_10M_MS = 10 * 60 * 1000; // 10 minutes
const WINDOW_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours

const MAX_10M = 20; // 20 messages per 10 minutes
const MAX_DAY = 60; // 60 messages per day

// In-memory token fallback
let memoryUsage = {
  date: new Date().toISOString().split("T")[0],
  tokens: 0,
};

function getDailyTokenBudget(): number {
  const envVal = process.env.ASSISTANT_DAILY_TOKENS;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 300_000; // Default daily token limit
}

export const ratelimit = {
  async limit(ip: string): Promise<{ success: boolean; reason?: "10m" | "day" }> {
    const cleanIp = ip?.trim() || "anon";
    const now = Date.now();

    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      try {
        const key10m = `assistant:rate:10m:${cleanIp}`;
        const keyDay = `assistant:rate:day:${cleanIp}`;

        // 10 minute check
        const res10m = await fetch(`${upstashUrl}/incr/${key10m}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
        const d10m = await res10m.json();
        const cur10m = Number(d10m.result);
        if (cur10m === 1) {
          await fetch(`${upstashUrl}/expire/${key10m}/600`, {
            headers: { Authorization: `Bearer ${upstashToken}` },
          });
        }
        if (cur10m > MAX_10M) {
          return { success: false, reason: "10m" };
        }

        // Daily check
        const resDay = await fetch(`${upstashUrl}/incr/${keyDay}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
        const dDay = await resDay.json();
        const curDay = Number(dDay.result);
        if (curDay === 1) {
          await fetch(`${upstashUrl}/expire/${keyDay}/86400`, {
            headers: { Authorization: `Bearer ${upstashToken}` },
          });
        }
        if (curDay > MAX_DAY) {
          return { success: false, reason: "day" };
        }

        return { success: true };
      } catch (err) {
        console.warn("[RateLimit] Upstash error, falling back to memory:", err);
      }
    }

    // In-memory sliding window
    let record = ipMap.get(cleanIp);
    if (!record) {
      record = {
        count10m: 1,
        reset10m: now + WINDOW_10M_MS,
        countDay: 1,
        resetDay: now + WINDOW_DAY_MS,
      };
      ipMap.set(cleanIp, record);
      return { success: true };
    }

    // Reset 10m if expired
    if (now > record.reset10m) {
      record.count10m = 1;
      record.reset10m = now + WINDOW_10M_MS;
    } else {
      if (record.count10m >= MAX_10M) {
        return { success: false, reason: "10m" };
      }
      record.count10m += 1;
    }

    // Reset day if expired
    if (now > record.resetDay) {
      record.countDay = 1;
      record.resetDay = now + WINDOW_DAY_MS;
    } else {
      if (record.countDay >= MAX_DAY) {
        return { success: false, reason: "day" };
      }
      record.countDay += 1;
    }

    return { success: true };
  },
};

export async function budgetOk(): Promise<boolean> {
  const budget = getDailyTokenBudget();
  const today = new Date().toISOString().split("T")[0];

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const key = `assistant:tokens:${today}`;
      const res = await fetch(`${upstashUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
      const data = await res.json();
      const currentTokens = Number(data.result) || 0;
      return currentTokens < budget;
    } catch (err) {
      console.warn("[Budget] Upstash error checking tokens:", err);
    }
  }

  // Memory fallback
  if (memoryUsage.date !== today) {
    memoryUsage = { date: today, tokens: 0 };
  }
  return memoryUsage.tokens < budget;
}

export async function recordUsage(usage?: { input_tokens?: number; output_tokens?: number } | null) {
  const today = new Date().toISOString().split("T")[0];
  const tokens = (usage?.input_tokens ?? 150) + (usage?.output_tokens ?? 100);

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const key = `assistant:tokens:${today}`;
      const res = await fetch(`${upstashUrl}/incrby/${key}/${tokens}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
      const data = await res.json();
      if (Number(data.result) === tokens) {
        await fetch(`${upstashUrl}/expire/${key}/90000`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
      }
      return;
    } catch (err) {
      console.warn("[Budget] Upstash error recording tokens:", err);
    }
  }

  // Memory fallback
  if (memoryUsage.date !== today) {
    memoryUsage = { date: today, tokens: 0 };
  }
  memoryUsage.tokens += tokens;
}
