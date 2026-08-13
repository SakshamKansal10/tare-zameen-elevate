import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { notificationPreferences } from "@/db/schema";
import { getSupabaseAdmin } from "@/supabase/admin";
import { sendNotification } from "./service";

/**
 * End-to-end tests against a REAL Supabase project — not run by default.
 * Requires DATABASE_URL, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be
 * set (see .env.example). Run once you've connected a Supabase project:
 *
 *   bun run test
 *
 * These exercise the actual NotificationService: real DB writes, real
 * idempotency enforcement, real preference checks. Whichever EMAIL_PROVIDER
 * is configured actually gets called (defaults to the safe console
 * provider, which never contacts a real service — see .env.example).
 */
const RUN_INTEGRATION = Boolean(process.env.DATABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

describe.skipIf(!RUN_INTEGRATION)("NotificationService — integration", () => {
  let donorId: string;
  const testEmail = `module1-test-${Date.now()}@example.com`;

  beforeAll(async () => {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: "Test1234!Integration",
      email_confirm: true,
      user_metadata: { full_name: "Integration Test Donor" },
    });
    if (error || !data.user) {
      throw new Error(`Failed to create test auth user: ${error?.message}`);
    }
    donorId = data.user.id;
    // give the handle_new_user trigger (supabase/migrations/*.sql) a moment to create the donors row
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  afterAll(async () => {
    if (donorId) {
      await getSupabaseAdmin().auth.admin.deleteUser(donorId);
    }
  });

  it("sends a DONATION_CONFIRMED notification and logs a real outcome (never a fake SENT)", async () => {
    const outcomes = await sendNotification({
      type: "DONATION_CONFIRMED",
      donorId,
      entityKey: `test-donation-${Date.now()}`,
      data: {
        donorName: "Integration Test Donor",
        amountFormatted: "₹1,000",
        dateFormatted: "13 August 2026",
        referenceId: "TZF-2026-TEST01",
        dashboardUrl: "https://example.org/dashboard",
      },
    });

    const email = outcomes.find((o) => o.channel === "email");
    expect(email).toBeDefined();
    expect(["SENT", "SKIPPED", "FAILED"]).toContain(email!.status);
    expect(email!.logId).not.toBeNull();
  });

  it("suppresses a duplicate send for the same event (idempotency)", async () => {
    const entityKey = `test-donation-dup-${Date.now()}`;
    const input = {
      type: "DONATION_CONFIRMED" as const,
      donorId,
      entityKey,
      data: {
        donorName: "Integration Test Donor",
        amountFormatted: "₹1,000",
        dateFormatted: "13 August 2026",
        referenceId: "TZF-2026-TEST02",
        dashboardUrl: "https://example.org/dashboard",
      },
    };

    await sendNotification(input);
    const second = await sendNotification(input);

    const email = second.find((o) => o.channel === "email");
    expect(email?.status).toBe("SKIPPED");
    expect(email?.reason).toContain("Duplicate");
  });

  it("skips an optional notification the donor disabled, and logs why", async () => {
    const db = getDb();
    await db
      .insert(notificationPreferences)
      .values({
        donorId,
        notificationType: "MONTHLY_IMPACT_SUMMARY",
        emailEnabled: false,
        whatsappEnabled: false,
      })
      .onConflictDoUpdate({
        target: [notificationPreferences.donorId, notificationPreferences.notificationType],
        set: { emailEnabled: false, whatsappEnabled: false },
      });

    const outcomes = await sendNotification({
      type: "MONTHLY_IMPACT_SUMMARY",
      donorId,
      entityKey: `${donorId}:test-month-${Date.now()}`,
      data: {
        donorName: "Integration Test Donor",
        monthLabel: "August 2026",
        hasMonthlyActivity: false,
        monthlyTotalFormatted: "₹0",
        monthlyDonationCount: 0,
        lifetimeTotalFormatted: "₹0",
        lifetimeDonationCount: 0,
        impactUrl: "https://example.org/dashboard",
      },
    });

    const email = outcomes.find((o) => o.channel === "email");
    expect(email?.status).toBe("SKIPPED");
    expect(email?.reason).toContain("Disabled by donor preference");
  });

  it("cannot disable a transactional notification type via the preferences API", async () => {
    const { TransactionalPreferenceError, updateDonorPreference } = await import("./preferences");
    await expect(
      updateDonorPreference(donorId, {
        notificationType: "DONATION_CONFIRMED",
        channel: "email",
        enabled: false,
      }),
    ).rejects.toThrow(TransactionalPreferenceError);
  });
});
