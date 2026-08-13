import type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Real transactional email via the Resend HTTP API — no SDK dependency, just
 * `fetch`, so this stays portable to edge/Workers runtimes. A send is only
 * ever reported as SENT when Resend's API actually accepted it (2xx with a
 * message id); any non-2xx or network failure is reported as a failure, not
 * papered over.
 */
export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });

      if (!response.ok) {
        // Resend error bodies are JSON like { message, name }. Surface the
        // message but never the API key/headers.
        let errorMessage = `Resend API responded ${response.status}`;
        try {
          const body = (await response.json()) as { message?: string };
          if (body?.message) errorMessage = body.message;
        } catch {
          // ignore body parse failure, keep the generic message
        }
        return { success: false, errorCode: `HTTP_${response.status}`, errorMessage };
      }

      const body = (await response.json()) as { id?: string };
      return { success: true, providerMessageId: body.id };
    } catch (error) {
      return {
        success: false,
        errorCode: "NETWORK_ERROR",
        errorMessage: error instanceof Error ? error.message : "Unknown network error",
      };
    }
  }
}
