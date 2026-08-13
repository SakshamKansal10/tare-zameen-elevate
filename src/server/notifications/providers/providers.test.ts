import { afterEach, describe, expect, it, vi } from "vitest";
import { EmailProviderConfigError, getEmailProvider } from "./email";
import { getWhatsAppProvider, WhatsAppProviderConfigError } from "./whatsapp";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("email provider factory", () => {
  it("defaults to the console provider when EMAIL_PROVIDER is unset (dev-safe default)", () => {
    vi.stubEnv("EMAIL_PROVIDER", "");
    const provider = getEmailProvider();
    expect(provider.name).toBe("console");
  });

  it("the console provider never claims an external delivery — providerMessageId is clearly local", async () => {
    vi.stubEnv("EMAIL_PROVIDER", "");
    const provider = getEmailProvider();
    const result = await provider.sendEmail({
      to: "donor@example.com",
      subject: "Test",
      html: "<p>hi</p>",
      text: "hi",
    });
    expect(result.success).toBe(true);
    expect(result.providerMessageId).toMatch(/^console-/);
  });

  it("throws a clear config error for EMAIL_PROVIDER=resend without credentials, rather than faking success", () => {
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("EMAIL_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    expect(() => getEmailProvider()).toThrow(EmailProviderConfigError);
  });

  it("resolves the real Resend provider once credentials are present", () => {
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("EMAIL_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "Tare Zameen Foundation <donations@example.org>");
    const provider = getEmailProvider();
    expect(provider.name).toBe("resend");
  });

  it("rejects an unrecognized EMAIL_PROVIDER value", () => {
    vi.stubEnv("EMAIL_PROVIDER", "some-other-vendor");
    expect(() => getEmailProvider()).toThrow(EmailProviderConfigError);
  });
});

describe("whatsapp provider factory", () => {
  it("defaults to the disabled provider when WHATSAPP_PROVIDER is unset", () => {
    vi.stubEnv("WHATSAPP_PROVIDER", "");
    const provider = getWhatsAppProvider();
    expect(provider.name).toBe("disabled");
  });

  it("the disabled provider reports skipped rather than faking a delivered WhatsApp message", async () => {
    vi.stubEnv("WHATSAPP_PROVIDER", "");
    const provider = getWhatsAppProvider();
    const result = await provider.sendWhatsApp({ to: "+919876543210", text: "hi" });
    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.providerMessageId).toBeUndefined();
  });

  it("throws a clear config error for WHATSAPP_PROVIDER=twilio without credentials", () => {
    vi.stubEnv("WHATSAPP_PROVIDER", "twilio");
    vi.stubEnv("WHATSAPP_TWILIO_ACCOUNT_SID", "");
    vi.stubEnv("WHATSAPP_TWILIO_AUTH_TOKEN", "");
    vi.stubEnv("WHATSAPP_TWILIO_FROM", "");
    expect(() => getWhatsAppProvider()).toThrow(WhatsAppProviderConfigError);
  });

  it("resolves the real Twilio provider once credentials are present", () => {
    vi.stubEnv("WHATSAPP_PROVIDER", "twilio");
    vi.stubEnv("WHATSAPP_TWILIO_ACCOUNT_SID", "ACxxxx");
    vi.stubEnv("WHATSAPP_TWILIO_AUTH_TOKEN", "token");
    vi.stubEnv("WHATSAPP_TWILIO_FROM", "whatsapp:+14155238886");
    const provider = getWhatsAppProvider();
    expect(provider.name).toBe("twilio");
  });
});
