import type { SendWhatsAppInput, SendWhatsAppResult, WhatsAppProvider } from "./types";

/**
 * WhatsApp via the Twilio WhatsApp API — plain `fetch` against Twilio's
 * REST API (no `twilio` SDK dependency, keeps this portable to edge/Workers
 * runtimes). A send is only ever reported as SENT when Twilio's API
 * actually accepted it.
 *
 * WhatsApp Business Platform policy (enforced by Twilio) requires an
 * approved Content Template — not free-form `Body` text — for any
 * business-initiated message, i.e. whenever there's no open 24-hour
 * customer-service session with the recipient. If WHATSAPP_TWILIO_CONTENT_SID
 * is configured, every send uses that template via `ContentSid` +
 * `ContentVariables` (single variable `{{1}}` = the rendered message text);
 * otherwise falls back to free-form `Body`, which only works within an
 * active session and will surface Twilio's real "ContentSid Required"
 * rejection otherwise — never faked as sent.
 */
export class TwilioWhatsAppProvider implements WhatsAppProvider {
  readonly name = "twilio";

  private readonly from: string;

  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    /** E.164, with or without the `whatsapp:` prefix — normalized below either way. */
    from: string,
    private readonly contentSid?: string,
  ) {
    this.from = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
  }

  async sendWhatsApp(input: SendWhatsAppInput): Promise<SendWhatsAppResult> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const params: Record<string, string> = {
      From: this.from,
      To: input.to.startsWith("whatsapp:") ? input.to : `whatsapp:${input.to}`,
    };
    if (this.contentSid) {
      params.ContentSid = this.contentSid;
      params.ContentVariables = JSON.stringify({ "1": input.text });
    } else {
      params.Body = input.text;
    }
    const body = new URLSearchParams(params);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const json = (await response.json().catch(() => null)) as {
        sid?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        return {
          success: false,
          errorCode: `HTTP_${response.status}`,
          errorMessage: json?.message ?? `Twilio API responded ${response.status}`,
        };
      }

      return { success: true, providerMessageId: json?.sid };
    } catch (error) {
      return {
        success: false,
        errorCode: "NETWORK_ERROR",
        errorMessage: error instanceof Error ? error.message : "Unknown network error",
      };
    }
  }
}
