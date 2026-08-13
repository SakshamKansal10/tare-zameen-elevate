export interface SendWhatsAppInput {
  /** E.164 format, e.g. +919876543210 */
  to: string;
  text: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  /** True when the channel is disabled/unconfigured rather than a failed attempt. */
  skipped?: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

/** NotificationService depends only on this interface, never a specific vendor. */
export interface WhatsAppProvider {
  readonly name: string;
  sendWhatsApp(input: SendWhatsAppInput): Promise<SendWhatsAppResult>;
}
