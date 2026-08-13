import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";

/**
 * Request-scoped Supabase client backed by the session cookie. Reads/writes
 * cookies via TanStack Start's h3-backed helpers, so this MUST be
 * constructed inside a server function `.handler()` (or middleware
 * `.server()`), never at module scope — see auth-server-primitives skill.
 *
 * Uses the anon key only; access is governed entirely by the caller's own
 * session + Postgres RLS policies. Never use this client for
 * system-initiated writes (donation records, notification sends) — use
 * `getSupabaseAdmin()` for those.
 */
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY are not set. See .env.example.");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        const cookies = getCookies();
        return Object.entries(cookies).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options);
        }
      },
    },
  });
}

/** Returns the authenticated Supabase user for the current request, or null. */
export async function getAuthedUser() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
