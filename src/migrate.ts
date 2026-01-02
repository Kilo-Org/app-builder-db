import { migrate as drizzleMigrate } from "drizzle-orm/sqlite-proxy/migrator";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { createExecuteQuery } from "./client";
import type { DatabaseConfig, MigrationOptions } from "./types";

/**
 * Runs database migrations using the Drizzle migrator
 *
 * @param db - Drizzle database instance
 * @param config - Database configuration for executing migration queries
 * @param options - Migration options
 *
 * @example
 * ```typescript
 * import { createDatabase, runMigrations } from '@kilocode/app-builder-db';
 * import * as schema from './schema';
 *
 * const db = createDatabase(schema);
 *
 * async function main() {
 *   await runMigrations(db, {}, {
 *     migrationsFolder: './src/db/migrations'
 *   });
 *   console.log('Migrations completed successfully');
 * }
 *
 * main().catch(console.error);
 * ```
 */
export async function runMigrations<TSchema extends Record<string, unknown>>(
  db: SqliteRemoteDatabase<TSchema>,
  config: DatabaseConfig = {},
  options: MigrationOptions = {}
): Promise<void> {
  const executeQuery = createExecuteQuery(config);
  const migrationsFolder = options.migrationsFolder ?? "./src/db/migrations";

  await drizzleMigrate(
    db,
    async (queries) => {
      for (const query of queries) {
        await executeQuery(query, [], "run");
      }
    },
    {
      migrationsFolder,
    }
  );
}

/**
 * Creates a migration runner function for use in migration scripts
 *
 * @param db - Drizzle database instance
 * @param config - Database configuration
 * @returns A function that runs migrations when called
 *
 * @example
 * ```typescript
 * // src/db/migrate.ts
 * import { createDatabase, createMigrationRunner } from '@kilocode/app-builder-db';
 * import * as schema from './schema';
 *
 * const db = createDatabase(schema);
 * const migrate = createMigrationRunner(db);
 *
 * migrate('./src/db/migrations')
 *   .then(() => console.log('Migrations completed'))
 *   .catch(console.error);
 * ```
 */
export function createMigrationRunner<TSchema extends Record<string, unknown>>(
  db: SqliteRemoteDatabase<TSchema>,
  config: DatabaseConfig = {}
): (migrationsFolder?: string) => Promise<void> {
  return async (migrationsFolder = "./src/db/migrations") => {
    await runMigrations(db, config, { migrationsFolder });
  };
}
