import { randomUUID } from "node:crypto";
import type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

/**
 * Dev-safe stand-in used automatically when EMAIL_PROVIDER is unset. It does
 * not call any external service — it prints the fully-rendered message to
 * the server console so a developer can inspect exactly what would have
 * been sent. Notification logs always record provider="console" for these
 * sends, so they are never mistaken for a real external delivery.
 */
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    console.log(
      [
        "\n──────── [console email provider] ────────",
        `To:      ${input.to}`,
        `Subject: ${input.subject}`,
        "--- text ---",
        input.text,
        "────────────────────────────────────────────\n",
      ].join("\n"),
    );
    return { success: true, providerMessageId: `console-${randomUUID()}` };
  }
}
