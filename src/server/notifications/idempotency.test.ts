import { describe, expect, it } from "vitest";
import { buildIdempotencyKey } from "./idempotency";

describe("buildIdempotencyKey", () => {
  it("combines type, channel and entity key deterministically", () => {
    expect(buildIdempotencyKey("DONATION_CONFIRMED", "email", "donation-123")).toBe(
      "DONATION_CONFIRMED:email:donation-123",
    );
  });

  it("produces different keys for different channels of the same event", () => {
    const email = buildIdempotencyKey("DONATION_CONFIRMED", "email", "donation-123");
    const whatsapp = buildIdempotencyKey("DONATION_CONFIRMED", "whatsapp", "donation-123");
    expect(email).not.toBe(whatsapp);
  });

  it("produces the same key for the same event on retry (the idempotency guarantee)", () => {
    const first = buildIdempotencyKey("DONATION_CONFIRMED", "email", "donation-123");
    const retry = buildIdempotencyKey("DONATION_CONFIRMED", "email", "donation-123");
    expect(first).toBe(retry);
  });
});
