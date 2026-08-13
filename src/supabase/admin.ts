import { createClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createClient> | undefined;

/**
 * Service-role client. Bypasses RLS entirely — only for trusted,
 * system-initiated operations (writing donation/receipt/notification
 * records, sending notifications, admin log queries). Never derive
 * donor-facing responses from this client without an explicit ownership
 * check in application code first.
 */
export function getSupabaseAdmin() {
  if (!adminClient) {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. See .env.example.");
    }
    adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}
