import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { donors } from "@/db/schema";
import { getAuthedUser, getSupabaseServerClient } from "@/supabase/server";
import { requireDonorMiddleware } from "@/auth/require-donor";

/** E.164: a leading +, then 8–15 digits, first digit 1–9. e.g. +919876543210 */
const E164_PHONE = /^\+[1-9]\d{7,14}$/;
const phoneSchema = z
  .string()
  .trim()
  .regex(E164_PHONE, "Enter a valid phone number in international format, e.g. +919876543210.");

export const signUp = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().trim().email(),
      password: z.string().min(8, "Password must be at least 8 characters."),
      fullName: z.string().trim().min(1, "Please enter your name.").max(120),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });
    if (error) throw new Error(error.message);

    // If the Supabase project requires email confirmation, no session is
    // issued yet — donors.* row is still created by the handle_new_user
    // trigger, but the donor can't sign in until they confirm.
    return { ok: true, needsEmailConfirmation: !signUpData.session };
  });

/**
 * Lets a donor set/update/clear the WhatsApp number on their own account.
 * Validated server-side regardless of what the client sends. Pass an empty
 * string to clear the number (disables WhatsApp delivery — sendOneChannel
 * in service.ts already skips channels with no contact info on file).
 */
export const updateMyPhone = createServerFn({ method: "POST" })
  .middleware([requireDonorMiddleware])
  .validator(z.object({ phone: z.union([phoneSchema, z.literal("")]) }))
  .handler(async ({ context, data }) => {
    const db = getDb();
    const phone = data.phone || null;
    await db
      .update(donors)
      .set({ phone, updatedAt: new Date() })
      .where(eq(donors.id, context.donor.id));
    return { phone };
  });

export const signIn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().trim().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw new Error("Invalid email or password.");
    return { ok: true };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  return { ok: true };
});

export const getCurrentDonor = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getAuthedUser();
  if (!user) return null;
  const db = getDb();
  const [donor] = await db.select().from(donors).where(eq(donors.id, user.id)).limit(1);
  return donor ?? null;
});
