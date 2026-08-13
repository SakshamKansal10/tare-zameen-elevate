import { CloudApiWhatsAppProvider } from "./cloud-api";
import { DisabledWhatsAppProvider } from "./disabled";
import { TwilioWhatsAppProvider } from "./twilio";
import type { WhatsAppProvider } from "./types";

export type { SendWhatsAppInput, SendWhatsAppResult, WhatsAppProvider } from "./types";

export class WhatsAppProviderConfigError extends Error {}

/**
 * Reads WHATSAPP_PROVIDER at call time. Defaults to the disabled provider so
 * the module works completely for email-only setups; add credentials and
 * flip WHATSAPP_PROVIDER to activate real sending without touching any
 * business logic.
 */
export function getWhatsAppProvider(): WhatsAppProvider {
  const provider = (process.env.WHATSAPP_PROVIDER || "disabled").toLowerCase();

  if (provider === "disabled") {
    return new DisabledWhatsAppProvider();
  }

  if (provider === "twilio") {
    const sid = process.env.WHATSAPP_TWILIO_ACCOUNT_SID;
    const token = process.env.WHATSAPP_TWILIO_AUTH_TOKEN;
    const from = process.env.WHATSAPP_TWILIO_FROM;
    if (!sid || !token || !from) {
      throw new WhatsAppProviderConfigError(
        "WHATSAPP_PROVIDER=twilio requires WHATSAPP_TWILIO_ACCOUNT_SID, WHATSAPP_TWILIO_AUTH_TOKEN and WHATSAPP_TWILIO_FROM.",
      );
    }
    return new TwilioWhatsAppProvider(
      sid,
      token,
      from,
      process.env.WHATSAPP_TWILIO_CONTENT_SID || undefined,
    );
  }

  if (provider === "cloud_api") {
    const accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
    if (!accessToken || !phoneNumberId) {
      throw new WhatsAppProviderConfigError(
        "WHATSAPP_PROVIDER=cloud_api requires WHATSAPP_CLOUD_ACCESS_TOKEN and WHATSAPP_CLOUD_PHONE_NUMBER_ID.",
      );
    }
    return new CloudApiWhatsAppProvider(accessToken, phoneNumberId);
  }

  throw new WhatsAppProviderConfigError(
    `Unknown WHATSAPP_PROVIDER "${provider}". Use "twilio", "cloud_api" or "disabled".`,
  );
}
