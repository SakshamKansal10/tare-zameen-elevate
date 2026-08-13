import { emailLayout, plainTextFooter } from "./layout";
import { escapeHtml, renderTemplateString, type TemplateVariables } from "./render";

export const TEMPLATE_KEY = "recurring_donation_charged";

export interface RecurringChargedData {
  donorName: string;
  amountFormatted: string;
  dateFormatted: string;
  referenceId: string;
  campaignName?: string;
  dashboardUrl: string;
}

const SUBJECT = "Your recurring donation was successful — Tare Zameen Foundation";

const EMAIL_BODY = `
  <p style="margin:0 0 14px;">Dear {{donorName}},</p>
  <p style="margin:0 0 14px;">
    Your recurring donation of <strong>{{amountFormatted}}</strong>{{campaignLine}} was successfully charged on {{dateFormatted}}.
    Thank you for your continued support.
  </p>
  <p style="margin:0 0 4px;font-size:13px;color:#6B7280;">Reference ID</p>
  <p style="margin:0;font-family:monospace,monospace;font-size:14px;">{{referenceId}}</p>
`;

const TEXT_BODY = `Dear {{donorName}},

Your recurring donation of {{amountFormatted}}{{campaignLine}} was successfully charged on {{dateFormatted}}. Thank you for your continued support.

Reference ID: {{referenceId}}

View your dashboard: {{dashboardUrl}}`;

const WHATSAPP_TEXT = `Your recurring donation of {{amountFormatted}}{{campaignLine}} to Tare Zameen Foundation was charged successfully (Ref: {{referenceId}}). Thank you for your continued support!\n\n{{dashboardUrl}}`;

function campaignLine(campaignName: string | undefined, escape: boolean): string {
  if (!campaignName) return "";
  return ` towards ${escape ? escapeHtml(campaignName) : campaignName}`;
}

export function renderRecurringChargedEmail(data: RecurringChargedData) {
  const htmlVars: TemplateVariables = {
    donorName: escapeHtml(data.donorName),
    amountFormatted: data.amountFormatted,
    dateFormatted: data.dateFormatted,
    referenceId: data.referenceId,
    campaignLine: campaignLine(data.campaignName, true),
  };
  const bodyHtml = renderTemplateString(TEMPLATE_KEY, EMAIL_BODY, htmlVars);
  const html = emailLayout({
    previewText: `Your ${data.amountFormatted} recurring donation was charged successfully.`,
    heading: "Recurring donation successful",
    bodyHtml,
    ctaLabel: "View your dashboard",
    ctaUrl: data.dashboardUrl,
  });

  const textVars: TemplateVariables = {
    donorName: data.donorName,
    amountFormatted: data.amountFormatted,
    dateFormatted: data.dateFormatted,
    referenceId: data.referenceId,
    campaignLine: campaignLine(data.campaignName, false),
    dashboardUrl: data.dashboardUrl,
  };
  const text = renderTemplateString(TEMPLATE_KEY, TEXT_BODY, textVars) + plainTextFooter();

  return { subject: SUBJECT, html, text };
}

export function renderRecurringChargedWhatsApp(data: RecurringChargedData) {
  const vars: TemplateVariables = {
    amountFormatted: data.amountFormatted,
    referenceId: data.referenceId,
    campaignLine: campaignLine(data.campaignName, false),
    dashboardUrl: data.dashboardUrl,
  };
  return { text: renderTemplateString(TEMPLATE_KEY, WHATSAPP_TEXT, vars) };
}
