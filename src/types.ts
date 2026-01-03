/**
 * Query method types for SQLite operations
 */
export type QueryMethod = "get" | "all" | "run" | "values";

/**
 * Result of a query execution
 */
export interface QueryResult {
  rows: unknown[] | unknown[][];
}

/**
 * Configuration for the database client
 */
export interface DatabaseConfig {
  /**
   * Full URL for the database API
   * Defaults to process.env.DB_URL
   */
  url?: string;

  /**
   * Authentication token for the database API
   * Defaults to process.env.DB_TOKEN
   */
  token?: string;
}

/**
 * Options for running migrations
 */
export interface MigrationOptions {
  /**
   * Path to the migrations folder
   * @default "./src/db/migrations"
   */
  migrationsFolder?: string;
}
