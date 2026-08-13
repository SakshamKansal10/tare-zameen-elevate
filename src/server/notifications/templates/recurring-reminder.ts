import { emailLayout, plainTextFooter } from "./layout";
import { escapeHtml, renderTemplateString, type TemplateVariables } from "./render";

export const TEMPLATE_KEY = "recurring_donation_reminder";

export interface RecurringReminderData {
  donorName: string;
  amountFormatted: string;
  scheduledDateFormatted: string;
  campaignName?: string;
  manageUrl: string;
}

const SUBJECT = "Your recurring donation is coming up — Tare Zameen Foundation";

const EMAIL_BODY = `
  <p style="margin:0 0 14px;">Dear {{donorName}},</p>
  <p style="margin:0 0 14px;">
    Just a heads-up — your recurring donation of <strong>{{amountFormatted}}</strong>{{campaignLine}}
    is scheduled to be charged on <strong>{{scheduledDateFormatted}}</strong>.
  </p>
  <p style="margin:0;">No action is needed. You can review or manage this recurring donation any time from your dashboard.</p>
`;

const TEXT_BODY = `Dear {{donorName}},

Just a heads-up — your recurring donation of {{amountFormatted}}{{campaignLine}} is scheduled to be charged on {{scheduledDateFormatted}}.

No action is needed. You can review or manage this recurring donation any time.

Manage your recurring donation: {{manageUrl}}`;

const WHATSAPP_TEXT = `Reminder: your recurring donation of {{amountFormatted}}{{campaignLine}} to Tare Zameen Foundation will be charged on {{scheduledDateFormatted}}. Manage it here: {{manageUrl}}`;

function campaignLine(campaignName: string | undefined, escape: boolean): string {
  if (!campaignName) return "";
  return ` for ${escape ? escapeHtml(campaignName) : campaignName}`;
}

export function renderRecurringReminderEmail(data: RecurringReminderData) {
  const htmlVars: TemplateVariables = {
    donorName: escapeHtml(data.donorName),
    amountFormatted: data.amountFormatted,
    scheduledDateFormatted: data.scheduledDateFormatted,
    campaignLine: campaignLine(data.campaignName, true),
  };
  const bodyHtml = renderTemplateString(TEMPLATE_KEY, EMAIL_BODY, htmlVars);
  const html = emailLayout({
    previewText: `Your ${data.amountFormatted} recurring donation charges on ${data.scheduledDateFormatted}.`,
    heading: "Upcoming recurring donation",
    bodyHtml,
    ctaLabel: "Manage recurring donation",
    ctaUrl: data.manageUrl,
  });

  const textVars: TemplateVariables = {
    donorName: data.donorName,
    amountFormatted: data.amountFormatted,
    scheduledDateFormatted: data.scheduledDateFormatted,
    campaignLine: campaignLine(data.campaignName, false),
    manageUrl: data.manageUrl,
  };
  const text = renderTemplateString(TEMPLATE_KEY, TEXT_BODY, textVars) + plainTextFooter();

  return { subject: SUBJECT, html, text };
}

export function renderRecurringReminderWhatsApp(data: RecurringReminderData) {
  const vars: TemplateVariables = {
    amountFormatted: data.amountFormatted,
    scheduledDateFormatted: data.scheduledDateFormatted,
    campaignLine: campaignLine(data.campaignName, false),
    manageUrl: data.manageUrl,
  };
  return { text: renderTemplateString(TEMPLATE_KEY, WHATSAPP_TEXT, vars) };
}
