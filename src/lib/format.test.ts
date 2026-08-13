import { describe, expect, it } from "vitest";
import { formatINR, formatIndianDate, formatIndianMonthYear } from "./format";

describe("formatINR", () => {
  it("formats a number with the ₹ symbol and Indian digit grouping", () => {
    expect(formatINR(2500)).toBe("₹2,500");
    expect(formatINR(100000)).toBe("₹1,00,000");
  });

  it("accepts numeric strings (as returned by Postgres numeric columns)", () => {
    expect(formatINR("5000.00")).toBe("₹5,000");
  });

  it("formats zero without throwing", () => {
    expect(formatINR(0)).toBe("₹0");
  });
});

describe("formatIndianDate", () => {
  it("formats an ISO date string as 'D Month YYYY'", () => {
    expect(formatIndianDate("2026-08-13T00:00:00.000Z")).toBe("13 August 2026");
  });
});

describe("formatIndianMonthYear", () => {
  it("formats as 'Month YYYY'", () => {
    expect(formatIndianMonthYear("2026-08-01T00:00:00.000Z")).toBe("August 2026");
  });
});
