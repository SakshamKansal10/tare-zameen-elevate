import { describe, expect, it } from "vitest";
import { isTransactional, NOTIFICATION_TYPE_IDS, NOTIFICATION_TYPES } from "./notification-types";

describe("NOTIFICATION_TYPES registry", () => {
  it("has a metadata entry for every declared notification type id", () => {
    for (const id of NOTIFICATION_TYPE_IDS) {
      expect(NOTIFICATION_TYPES[id]).toBeDefined();
      expect(NOTIFICATION_TYPES[id].id).toBe(id);
    }
  });

  it("declares a defaultEnabled value for every channel each type supports", () => {
    for (const id of NOTIFICATION_TYPE_IDS) {
      const meta = NOTIFICATION_TYPES[id];
      for (const channel of meta.channels) {
        expect(typeof meta.defaultEnabled[channel]).toBe("boolean");
      }
    }
  });

  it("classifies the three essential notifications as transactional", () => {
    expect(isTransactional("DONATION_CONFIRMED")).toBe(true);
    expect(isTransactional("RECEIPT_READY")).toBe(true);
    expect(isTransactional("RECURRING_DONATION_CHARGED")).toBe(true);
  });

  it("classifies reminders and the monthly summary as optional", () => {
    expect(isTransactional("RECURRING_DONATION_REMINDER")).toBe(false);
    expect(isTransactional("MONTHLY_IMPACT_SUMMARY")).toBe(false);
  });
});
