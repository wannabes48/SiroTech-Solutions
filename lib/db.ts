import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  return new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 25000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });
}

export const pool = globalThis.__dbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.__dbPool = pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  isRetry = false
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development" && duration > 1000) {
      console.warn(`[DB Slow Query] ${duration}ms: ${text.slice(0, 100)}`);
    }
    return res;
  } catch (error: any) {
    // Retry once if error was a transient pool connection acquisition timeout or connection reset
    const msg = String(error?.message || "");
    const isTransientConnectionError =
      msg.includes("timeout exceeded when trying to connect") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      error?.code === "57P01";

    if (!isRetry && isTransientConnectionError) {
      console.warn(`[DB Query Retry] Retrying query after transient connection issue: ${msg}`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return query<T>(text, params, true);
    }

    console.error("[DB Query Error]", {
      text,
      message: error?.message,
      code: error?.code,
      detail: error?.detail
    });
    throw error;
  }
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
