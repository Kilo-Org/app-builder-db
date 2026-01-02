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
   * Base URL for the database API
   * Defaults to process.env.DB_URL
   */
  url?: string;

  /**
   * Application ID for the database
   * Defaults to process.env.DB_APP_ID
   */
  appId?: string;

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
