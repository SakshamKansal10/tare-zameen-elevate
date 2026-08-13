import { describe, expect, it } from "vitest";
import {
  TransactionalPreferenceError,
  UnknownNotificationTypeError,
  updateDonorPreference,
} from "./preferences";

// These checks run synchronously, before any database access, so they can
// be tested without a Postgres connection. Full CRUD behavior (defaults,
// upsert, actually persisting a toggle) is covered by the integration
// tests in service.integration.test.ts, gated on DATABASE_URL being set —
// see docs/MODULE1_NOTIFICATIONS.md "Testing".

describe("updateDonorPreference — business rules enforced before any DB write", () => {
  it("rejects disabling a transactional notification type", async () => {
    await expect(
      updateDonorPreference("00000000-0000-0000-0000-000000000000", {
        notificationType: "DONATION_CONFIRMED",
        channel: "email",
        enabled: false,
      }),
    ).rejects.toThrow(TransactionalPreferenceError);
  });

  it("rejects disabling RECEIPT_READY and RECURRING_DONATION_CHARGED the same way", async () => {
    await expect(
      updateDonorPreference("00000000-0000-0000-0000-000000000000", {
        notificationType: "RECEIPT_READY",
        channel: "whatsapp",
        enabled: false,
      }),
    ).rejects.toThrow(TransactionalPreferenceError);

    await expect(
      updateDonorPreference("00000000-0000-0000-0000-000000000000", {
        notificationType: "RECURRING_DONATION_CHARGED",
        channel: "email",
        enabled: false,
      }),
    ).rejects.toThrow(TransactionalPreferenceError);
  });

  it("rejects an unknown notification type before touching the database", async () => {
    await expect(
      updateDonorPreference("00000000-0000-0000-0000-000000000000", {
        // @ts-expect-error intentionally invalid for the test
        notificationType: "NOT_A_REAL_TYPE",
        channel: "email",
        enabled: false,
      }),
    ).rejects.toThrow(UnknownNotificationTypeError);
  });

  it("does NOT apply the transactional guard when enabling (re-enabling)", async () => {
    // enabled: true never hits the transactional guard, so this call
    // proceeds to getDb() — which throws its own clear "DATABASE_URL is
    // not set" error in this unconfigured test environment. Asserting the
    // error is NOT TransactionalPreferenceError proves the guard only
    // blocks disabling, not enabling.
    let caught: unknown;
    try {
      await updateDonorPreference("00000000-0000-0000-0000-000000000000", {
        notificationType: "DONATION_CONFIRMED",
        channel: "email",
        enabled: true,
      });
    } catch (error) {
      caught = error;
    }
    expect(caught).not.toBeInstanceOf(TransactionalPreferenceError);
  });
});
