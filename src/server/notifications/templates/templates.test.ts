import { describe, expect, it } from "vitest";
import {
  renderDonationConfirmedEmail,
  renderDonationConfirmedWhatsApp,
} from "./donation-confirmed";
import { renderReceiptReadyEmail, renderReceiptReadyWhatsApp } from "./receipt-ready";
import { renderRecurringReminderEmail } from "./recurring-reminder";
import { renderRecurringChargedEmail } from "./recurring-charged";
import { renderMonthlyImpactSummaryEmail } from "./monthly-impact-summary";
import { renderTemplate } from "./index";

const BROKEN_OUTPUT_PATTERNS = [
  /\bundefined\b/,
  /\bnull\b/,
  /\[object Object\]/,
  /\{\{[a-zA-Z0-9_]+\}\}/,
];

function assertNoBrokenPlaceholders(text: string) {
  for (const pattern of BROKEN_OUTPUT_PATTERNS) {
    expect(text).not.toMatch(pattern);
  }
}

describe("donation confirmation template", () => {
  const data = {
    donorName: "Priya Sharma",
    amountFormatted: "₹2,500",
    dateFormatted: "13 August 2026",
    referenceId: "TZF-2026-000123",
    campaignName: "Mid-Day Meal Support",
    dashboardUrl: "https://example.org/dashboard",
  };

  it("renders a complete email with donor name, amount, reference ID and no broken placeholders", () => {
    const email = renderDonationConfirmedEmail(data);
    expect(email.subject).toContain("Donation confirmed");
    expect(email.html).toContain("Priya Sharma");
    expect(email.html).toContain("₹2,500");
    expect(email.html).toContain("TZF-2026-000123");
    expect(email.html).toContain("Mid-Day Meal Support");
    assertNoBrokenPlaceholders(email.html);
    assertNoBrokenPlaceholders(email.text);
  });

  it("omits the campaign line entirely when no campaign is given, without leaving broken markup", () => {
    const email = renderDonationConfirmedEmail({ ...data, campaignName: undefined });
    expect(email.html).not.toContain("towards");
    assertNoBrokenPlaceholders(email.html);
  });

  it("HTML-escapes donor-supplied fields to prevent markup injection", () => {
    const email = renderDonationConfirmedEmail({
      ...data,
      donorName: `<img src=x onerror=alert(1)>`,
    });
    expect(email.html).not.toContain("<img src=x onerror=alert(1)>");
    expect(email.html).toContain("&lt;img");
  });

  it("renders a shorter WhatsApp version containing the same key facts", () => {
    const whatsapp = renderDonationConfirmedWhatsApp(data);
    expect(whatsapp.text).toContain("₹2,500");
    expect(whatsapp.text).toContain("TZF-2026-000123");
    assertNoBrokenPlaceholders(whatsapp.text);
  });
});

describe("receipt ready template", () => {
  const data = {
    donorName: "Priya Sharma",
    amountFormatted: "₹2,500",
    dateFormatted: "13 August 2026",
    receiptNumber: "RCPT-2026-00045678",
    receiptUrl: "https://example.org/dashboard/receipts/abc",
  };

  it("includes a working receipt link and receipt number", () => {
    const email = renderReceiptReadyEmail(data);
    expect(email.html).toContain(data.receiptUrl);
    expect(email.html).toContain(data.receiptNumber);
    assertNoBrokenPlaceholders(email.html);
  });

  it("WhatsApp version includes the secure receipt link", () => {
    const whatsapp = renderReceiptReadyWhatsApp(data);
    expect(whatsapp.text).toContain(data.receiptUrl);
    assertNoBrokenPlaceholders(whatsapp.text);
  });
});

describe("recurring donation reminder template", () => {
  it("mentions the scheduled amount and date", () => {
    const email = renderRecurringReminderEmail({
      donorName: "Priya Sharma",
      amountFormatted: "₹1,000",
      scheduledDateFormatted: "16 August 2026",
      campaignName: undefined,
      manageUrl: "https://example.org/dashboard",
    });
    expect(email.html).toContain("₹1,000");
    expect(email.html).toContain("16 August 2026");
    assertNoBrokenPlaceholders(email.html);
  });
});

describe("recurring donation charged template", () => {
  it("mentions the charge amount, date and reference", () => {
    const email = renderRecurringChargedEmail({
      donorName: "Priya Sharma",
      amountFormatted: "₹1,000",
      dateFormatted: "13 August 2026",
      referenceId: "TZF-2026-000124",
      campaignName: "Monthly Giving Circle",
      dashboardUrl: "https://example.org/dashboard",
    });
    expect(email.html).toContain("TZF-2026-000124");
    assertNoBrokenPlaceholders(email.html);
  });
});

describe("monthly impact summary template", () => {
  it("reports real monthly activity honestly when the donor gave that month", () => {
    const email = renderMonthlyImpactSummaryEmail({
      donorName: "Priya Sharma",
      monthLabel: "August 2026",
      hasMonthlyActivity: true,
      monthlyTotalFormatted: "₹3,500",
      monthlyDonationCount: 2,
      lifetimeTotalFormatted: "₹42,500",
      lifetimeDonationCount: 8,
      impactUrl: "https://example.org/dashboard",
    });
    expect(email.html).toContain("₹3,500");
    expect(email.html).toContain("2 donations");
    expect(email.html).toContain("₹42,500");
    assertNoBrokenPlaceholders(email.html);
  });

  it("never fabricates activity — shows an honest zero-activity message instead", () => {
    const email = renderMonthlyImpactSummaryEmail({
      donorName: "Priya Sharma",
      monthLabel: "August 2026",
      hasMonthlyActivity: false,
      monthlyTotalFormatted: "₹0",
      monthlyDonationCount: 0,
      lifetimeTotalFormatted: "₹42,500",
      lifetimeDonationCount: 8,
      impactUrl: "https://example.org/dashboard",
    });
    expect(email.html).toContain("didn't make a new contribution");
    expect(email.html).not.toContain("₹0 across 0"); // no fabricated "you contributed ₹0" framing
    assertNoBrokenPlaceholders(email.html);
  });
});

describe("renderTemplate registry", () => {
  it("marks development-mode sends clearly without corrupting the content", () => {
    const email = renderTemplate(
      "DONATION_CONFIRMED",
      "email",
      {
        donorName: "Priya Sharma",
        amountFormatted: "₹2,500",
        dateFormatted: "13 August 2026",
        referenceId: "TZF-2026-000123",
        dashboardUrl: "https://example.org/dashboard",
      },
      { testMode: true },
    );
    expect(email.subject.startsWith("[TEST]")).toBe(true);
    expect(email.html).toContain("TEST NOTIFICATION");
    assertNoBrokenPlaceholders(email.html);
  });
});
