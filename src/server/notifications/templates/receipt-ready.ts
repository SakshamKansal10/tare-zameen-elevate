import { emailLayout, plainTextFooter } from "./layout";
import { escapeHtml, renderTemplateString, type TemplateVariables } from "./render";

export const TEMPLATE_KEY = "receipt_ready";

export interface ReceiptReadyData {
  donorName: string;
  amountFormatted: string;
  dateFormatted: string;
  receiptNumber: string;
  receiptUrl: string;
}

const SUBJECT = "Your donation receipt is ready — Tare Zameen Foundation";

const EMAIL_BODY = `
  <p style="margin:0 0 14px;">Dear {{donorName}},</p>
  <p style="margin:0 0 14px;">
    Your tax-exemption receipt for the donation of <strong>{{amountFormatted}}</strong> made on {{dateFormatted}} is now ready.
  </p>
  <p style="margin:0 0 4px;font-size:13px;color:#6B7280;">Receipt number</p>
  <p style="margin:0 0 14px;font-family:monospace,monospace;font-size:14px;">{{receiptNumber}}</p>
  <p style="margin:0;">You can view or download it from your donor dashboard at any time.</p>
`;

const TEXT_BODY = `Dear {{donorName}},

Your tax-exemption receipt for the donation of {{amountFormatted}} made on {{dateFormatted}} is now ready.

Receipt number: {{receiptNumber}}

View your receipt: {{receiptUrl}}`;

const WHATSAPP_TEXT = `Hi {{donorName}}, your receipt for {{amountFormatted}} (Receipt No. {{receiptNumber}}) is ready. View/download it securely here: {{receiptUrl}}`;

export function renderReceiptReadyEmail(data: ReceiptReadyData) {
  const htmlVars: TemplateVariables = {
    donorName: escapeHtml(data.donorName),
    amountFormatted: data.amountFormatted,
    dateFormatted: data.dateFormatted,
    receiptNumber: data.receiptNumber,
  };
  const bodyHtml = renderTemplateString(TEMPLATE_KEY, EMAIL_BODY, htmlVars);
  const html = emailLayout({
    previewText: `Your receipt for ${data.amountFormatted} is ready.`,
    heading: "Receipt ready",
    bodyHtml,
    ctaLabel: "View receipt",
    ctaUrl: data.receiptUrl,
  });

  const textVars: TemplateVariables = {
    donorName: data.donorName,
    amountFormatted: data.amountFormatted,
    dateFormatted: data.dateFormatted,
    receiptNumber: data.receiptNumber,
    receiptUrl: data.receiptUrl,
  };
  const text = renderTemplateString(TEMPLATE_KEY, TEXT_BODY, textVars) + plainTextFooter();

  return { subject: SUBJECT, html, text };
}

export function renderReceiptReadyWhatsApp(data: ReceiptReadyData) {
  const vars: TemplateVariables = {
    donorName: data.donorName,
    amountFormatted: data.amountFormatted,
    receiptNumber: data.receiptNumber,
    receiptUrl: data.receiptUrl,
  };
  return { text: renderTemplateString(TEMPLATE_KEY, WHATSAPP_TEXT, vars) };
}
