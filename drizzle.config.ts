import { defineConfig } from "drizzle-kit";

// The initial schema lives in supabase/migrations/*.sql (hand-authored, so
// it can include the auth.users FK, RLS policies, and the handle_new_user
// trigger). This config lets the NGO team use `drizzle-kit studio` to
// browse data, and `drizzle-kit generate` for FUTURE schema changes on top
// of that baseline — see docs/MODULE1_NOTIFICATIONS.md "Database".
export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
