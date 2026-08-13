import type { SendWhatsAppInput, SendWhatsAppResult, WhatsAppProvider } from "./types";

/**
 * Used whenever WHATSAPP_PROVIDER is unset. Never calls anything and never
 * claims a message was sent — every attempt is reported as `skipped` so
 * NotificationService logs it as SKIPPED with a clear "not configured"
 * reason instead of a fake success.
 */
export class DisabledWhatsAppProvider implements WhatsAppProvider {
  readonly name = "disabled";

  async sendWhatsApp(_input: SendWhatsAppInput): Promise<SendWhatsAppResult> {
    return {
      success: false,
      skipped: true,
      errorCode: "PROVIDER_NOT_CONFIGURED",
      errorMessage: "WhatsApp provider is not configured (WHATSAPP_PROVIDER is unset).",
    };
  }
}
