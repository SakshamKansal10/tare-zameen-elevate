import { emailLayout, plainTextFooter } from "./layout";
import { escapeHtml, renderTemplateString, type TemplateVariables } from "./render";

export const TEMPLATE_KEY = "donation_confirmation";

export interface DonationConfirmedData {
  donorName: string;
  amountFormatted: string;
  dateFormatted: string;
  referenceId: string;
  campaignName?: string;
  dashboardUrl: string;
}

const SUBJECT = "Donation confirmed — thank you for supporting Tare Zameen Foundation";

const EMAIL_BODY = `
  <p style="margin:0 0 14px;">Dear {{donorName}},</p>
  <p style="margin:0 0 14px;">
    Thank you for your generous contribution of <strong>{{amountFormatted}}</strong>{{campaignLine}} on {{dateFormatted}}.
    Your donation has been recorded and will go directly toward verified community drives.
  </p>
  <p style="margin:0 0 4px;font-size:13px;color:#6B7280;">Reference ID</p>
  <p style="margin:0 0 14px;font-family:monospace,monospace;font-size:14px;">{{referenceId}}</p>
  <p style="margin:0;">Your tax-exemption receipt will follow separately once it's ready.</p>
`;

const TEXT_BODY = `Dear {{donorName}},

Thank you for your generous contribution of {{amountFormatted}}{{campaignLine}} on {{dateFormatted}}.
Your donation has been recorded and will go directly toward verified community drives.

Reference ID: {{referenceId}}

Your tax-exemption receipt will follow separately once it's ready.

View your dashboard: {{dashboardUrl}}`;

const WHATSAPP_TEXT = `Hi {{donorName}}! Your donation of {{amountFormatted}}{{campaignLine}} to Tare Zameen Foundation is confirmed (Ref: {{referenceId}}). Thank you for helping a star shine.\n\nView details: {{dashboardUrl}}`;

function campaignLine(campaignName: string | undefined, escape: boolean): string {
  if (!campaignName) return "";
  return ` towards ${escape ? escapeHtml(campaignName) : campaignName}`;
}

export function renderDonationConfirmedEmail(data: DonationConfirmedData) {
  const htmlVars: TemplateVariables = {
    donorName: escapeHtml(data.donorName),
    amountFormatted: data.amountFormatted,
    dateFormatted: data.dateFormatted,
    referenceId: data.referenceId,
    campaignLine: campaignLine(data.campaignName, true),
  };
  const bodyHtml = renderTemplateString(TEMPLATE_KEY, EMAIL_BODY, htmlVars);
  const html = emailLayout({
    previewText: `Your ${data.amountFormatted} donation is confirmed.`,
    heading: "Donation confirmed",
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

export function renderDonationConfirmedWhatsApp(data: DonationConfirmedData) {
  const vars: TemplateVariables = {
    donorName: data.donorName,
    amountFormatted: data.amountFormatted,
    referenceId: data.referenceId,
    campaignLine: campaignLine(data.campaignName, false),
    dashboardUrl: data.dashboardUrl,
  };
  return { text: renderTemplateString(TEMPLATE_KEY, WHATSAPP_TEXT, vars) };
}
