import { drizzle } from "drizzle-orm/sqlite-proxy";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import type { DatabaseConfig, QueryMethod, QueryResult } from "./types";

/**
 * Creates an execute query function for the given database configuration
 */
export function createExecuteQuery(config: DatabaseConfig = {}) {
  const url = config.url ?? process.env.DB_URL;
  const appId = config.appId ?? process.env.DB_APP_ID;
  const token = config.token ?? process.env.DB_TOKEN;

  if (!url || !appId || !token) {
    throw new Error(
      "Missing database configuration. Provide url, appId, and token in config or set DB_URL, DB_APP_ID, and DB_TOKEN environment variables."
    );
  }

  return async function executeQuery(
    sql: string,
    params: unknown[],
    method: QueryMethod
  ): Promise<QueryResult> {
    const response = await fetch(`${url}/api/${appId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params, method }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as {
        error?: { message?: string };
      };
      throw new Error(errorData.error?.message || "Query failed");
    }

    return response.json() as Promise<QueryResult>;
  };
}

/**
 * Creates a Drizzle database client
 *
 * @param schema - Your Drizzle schema object
 * @param config - Optional database configuration (defaults to environment variables)
 * @returns Drizzle database instance
 *
 * @example
 * ```typescript
 * import { createDatabase } from '@kilocode/app-builder-db';
 * import * as schema from './schema';
 *
 * export const db = createDatabase(schema);
 * ```
 */
export function createDatabase<TSchema extends Record<string, unknown>>(
  schema: TSchema,
  config: DatabaseConfig = {}
): SqliteRemoteDatabase<TSchema> {
  const executeQuery = createExecuteQuery(config);

  return drizzle(
    async (sql, params, method) => {
      const result = await executeQuery(sql, params, method as QueryMethod);
      return { rows: result.rows };
    },
    { schema }
  );
}

/**
 * Creates a Drizzle database client without schema (for basic queries)
 *
 * @param config - Optional database configuration (defaults to environment variables)
 * @returns Drizzle database instance
 *
 * @example
 * ```typescript
 * import { createDatabaseWithoutSchema } from '@kilocode/app-builder-db';
 *
 * const db = createDatabaseWithoutSchema();
 * ```
 */
export function createDatabaseWithoutSchema(
  config: DatabaseConfig = {}
): SqliteRemoteDatabase {
  const executeQuery = createExecuteQuery(config);

  return drizzle(async (sql, params, method) => {
    const result = await executeQuery(sql, params, method as QueryMethod);
    return { rows: result.rows };
  });
}
