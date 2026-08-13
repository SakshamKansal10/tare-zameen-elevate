import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

let sqlClient: postgres.Sql | undefined;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;

/**
 * Lazily-initialized singleton. Reads `process.env.DATABASE_URL` inside the
 * function body (not at module scope) so this stays safe on request-scoped
 * runtimes; the connection itself is still pooled/reused across calls.
 */
export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example to .env and fill in your Supabase Postgres connection string.",
      );
    }
    sqlClient = postgres(connectionString, { prepare: false });
    dbInstance = drizzle(sqlClient, { schema });
  }
  return dbInstance;
}
