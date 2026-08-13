import { ConsoleEmailProvider } from "./console";
import { ResendEmailProvider } from "./resend";
import type { EmailProvider } from "./types";

export type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

export class EmailProviderConfigError extends Error {}

/**
 * Reads EMAIL_PROVIDER at call time (never module scope — see
 * auth-server-primitives skill) and returns the right implementation.
 * Falls back to the console provider whenever no real provider is
 * configured, so the module works fully in development without credentials.
 */
export function getEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER || "console").toLowerCase();

  if (provider === "console") {
    return new ConsoleEmailProvider();
  }

  if (provider === "resend") {
    const apiKey = process.env.EMAIL_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      throw new EmailProviderConfigError(
        "EMAIL_PROVIDER=resend requires EMAIL_API_KEY and EMAIL_FROM to be set.",
      );
    }
    return new ResendEmailProvider(apiKey, from);
  }

  throw new EmailProviderConfigError(
    `Unknown EMAIL_PROVIDER "${provider}". Use "resend" or "console".`,
  );
}
