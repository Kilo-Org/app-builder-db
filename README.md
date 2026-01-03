# @kilocode/app-builder-db

SQLite via HTTP API with Drizzle ORM.

## Installation

Install from GitHub:

```bash
bun add github:kilocode/app-builder-db drizzle-orm
bun add -D drizzle-kit
```

## Environment Variables

The package uses these environment variables

- `DB_URL` - Full URL for the database API query endpoint (e.g., `https://your-api.com/api/{appId}/query`)
- `DB_TOKEN` - Authentication token

## Quick Start

### 1. Create your schema (`src/db/schema.ts`)

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});
```

### 2. Create the database client (`src/db/index.ts`)

```typescript
import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

export const db = createDatabase(schema);
```

### 3. Configure Drizzle (`drizzle.config.ts`)

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
});
```

### 4. Create migration script (`src/db/migrate.ts`)

```typescript
import { createDatabase, runMigrations } from "@kilocode/app-builder-db";
import * as schema from "./schema";

const db = createDatabase(schema);

runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" })
  .then(() => console.log("Migrations completed successfully"))
  .catch(console.error);
```

### 5. Add scripts to `package.json`

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts"
  }
}
```

## Usage

### Basic Queries

```typescript
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Query all users
const allUsers = await db.select().from(users);

// Query by condition
const user = await db.select().from(users).where(eq(users.id, 1));

// Insert
await db.insert(users).values({ name: "John", email: "john@example.com" });

// Update
await db.update(users).set({ name: "Jane" }).where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));
```

### Custom Configuration

If you need to override the environment variables:

```typescript
import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

export const db = createDatabase(schema, {
  url: "https://custom-db-url.com/api/my-app-id/query",
  token: "my-token",
});
```

### Direct Query Execution

For advanced use cases, you can use `createExecuteQuery` directly:

```typescript
import { createExecuteQuery } from "@kilocode/app-builder-db";

const executeQuery = createExecuteQuery();

const result = await executeQuery(
  "SELECT * FROM users WHERE id = ?",
  [1],
  "get"
);
```

## API Reference

### `createDatabase(schema, config?)`

Creates a Drizzle database client with your schema.

- `schema` - Your Drizzle schema object
- `config` - Optional configuration object with `url` and `token`

### `createDatabaseWithoutSchema(config?)`

Creates a Drizzle database client without schema (for basic queries).

### `createExecuteQuery(config?)`

Creates a raw query execution function.

### `runMigrations(db, config?, options?)`

Runs database migrations.

- `db` - Drizzle database instance
- `config` - Database configuration
- `options.migrationsFolder` - Path to migrations folder (default: `./src/db/migrations`)

### `createMigrationRunner(db, config?)`

Creates a reusable migration runner function.

## Important Notes

- The database is accessed via HTTP API
- Use Server Components or Server Actions for database operations (never in client components)
- Schema changes require running `bun db:generate` to create migrations
- Apply migrations with `bun db:migrate`
