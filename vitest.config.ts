import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Explicitly load .env/.env.local into the test process env — Vitest's
// worker pool does not reliably inherit dotenv-style files the way `bun run
// <file>` does, so the integration suite (service.integration.test.ts)
// needs this to see DATABASE_URL / SUPABASE_SERVICE_ROLE_KEY.
export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: loadEnv(mode, process.cwd(), ""),
  },
}));
