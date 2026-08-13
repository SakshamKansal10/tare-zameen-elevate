export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  success: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * NotificationService depends only on this interface, never on a specific
 * vendor — swap ResendEmailProvider for Postmark/SendGrid by writing one
 * more file that implements sendEmail() and pointing the factory at it.
 */
export interface EmailProvider {
  readonly name: string;
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
}
