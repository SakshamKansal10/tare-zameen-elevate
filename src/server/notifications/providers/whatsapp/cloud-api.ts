import type { SendWhatsAppInput, SendWhatsAppResult, WhatsAppProvider } from "./types";

/**
 * WhatsApp via Meta's WhatsApp Business Cloud API — plain `fetch`, no SDK.
 * Alternative to TwilioWhatsAppProvider; swap via WHATSAPP_PROVIDER=cloud_api.
 */
export class CloudApiWhatsAppProvider implements WhatsAppProvider {
  readonly name = "whatsapp_cloud_api";

  constructor(
    private readonly accessToken: string,
    private readonly phoneNumberId: string,
  ) {}

  async sendWhatsApp(input: SendWhatsAppInput): Promise<SendWhatsAppResult> {
    const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: input.to.replace(/^\+/, ""),
          type: "text",
          text: { body: input.text },
        }),
      });

      const json = (await response.json().catch(() => null)) as {
        messages?: Array<{ id: string }>;
        error?: { message?: string };
      } | null;

      if (!response.ok) {
        return {
          success: false,
          errorCode: `HTTP_${response.status}`,
          errorMessage: json?.error?.message ?? `WhatsApp Cloud API responded ${response.status}`,
        };
      }

      return { success: true, providerMessageId: json?.messages?.[0]?.id };
    } catch (error) {
      return {
        success: false,
        errorCode: "NETWORK_ERROR",
        errorMessage: error instanceof Error ? error.message : "Unknown network error",
      };
    }
  }
}
