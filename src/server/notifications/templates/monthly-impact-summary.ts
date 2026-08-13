import { emailLayout, plainTextFooter } from "./layout";
import { escapeHtml, renderTemplateString, type TemplateVariables } from "./render";

export const TEMPLATE_KEY = "monthly_impact_summary";

export interface MonthlyImpactSummaryData {
  donorName: string;
  monthLabel: string;
  hasMonthlyActivity: boolean;
  monthlyTotalFormatted: string;
  monthlyDonationCount: number;
  lifetimeTotalFormatted: string;
  lifetimeDonationCount: number;
  impactUrl: string;
}

const SUBJECT_ACTIVE = "Your Impact So Far — {{monthLabel}}";
const SUBJECT_INACTIVE = "Your impact this month — {{monthLabel}}";

const EMAIL_BODY = `
  <p style="margin:0 0 14px;">Dear {{donorName}},</p>
  <p style="margin:0 0 14px;">{{summaryLine}}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6B7280;">Lifetime contribution</p>
  <p style="margin:0 0 14px;font-size:20px;font-weight:700;color:#0F172A;">{{lifetimeTotalFormatted}}</p>
  <p style="margin:0;">Thank you for being part of a community that believes every star on earth deserves to shine.</p>
`;

const TEXT_BODY = `Dear {{donorName}},

{{summaryLine}}

Lifetime contribution: {{lifetimeTotalFormatted}} across {{lifetimeDonationCount}} donation(s).

Thank you for being part of a community that believes every star on earth deserves to shine.

View your impact: {{impactUrl}}`;

const WHATSAPP_TEXT = `{{monthLabel}} impact update: {{summaryLine}} Lifetime: {{lifetimeTotalFormatted}} across {{lifetimeDonationCount}} donation(s). View more: {{impactUrl}}`;

function buildSummaryLine(data: MonthlyImpactSummaryData, escape: boolean): string {
  const name = escape ? escapeHtml(data.monthLabel) : data.monthLabel;
  if (data.hasMonthlyActivity) {
    return `In ${name}, you contributed ${data.monthlyTotalFormatted} across ${data.monthlyDonationCount} donation${data.monthlyDonationCount === 1 ? "" : "s"}.`;
  }
  return `You didn't make a new contribution in ${name} — but your past support continues to make a difference. Whenever you're ready to give again, we'll be here.`;
}

export function renderMonthlyImpactSummaryEmail(data: MonthlyImpactSummaryData) {
  const summaryLineHtml = buildSummaryLine(data, true);
  const htmlVars: TemplateVariables = {
    donorName: escapeHtml(data.donorName),
    summaryLine: summaryLineHtml,
    lifetimeTotalFormatted: data.lifetimeTotalFormatted,
  };
  const bodyHtml = renderTemplateString(TEMPLATE_KEY, EMAIL_BODY, htmlVars);
  const html = emailLayout({
    previewText: summaryLineHtml,
    heading: `Your Impact So Far — ${data.monthLabel}`,
    bodyHtml,
    ctaLabel: "View your impact",
    ctaUrl: data.impactUrl,
  });

  const subjectTemplate = data.hasMonthlyActivity ? SUBJECT_ACTIVE : SUBJECT_INACTIVE;
  const subject = renderTemplateString(TEMPLATE_KEY, subjectTemplate, {
    monthLabel: data.monthLabel,
  });

  const textVars: TemplateVariables = {
    donorName: data.donorName,
    summaryLine: buildSummaryLine(data, false),
    lifetimeTotalFormatted: data.lifetimeTotalFormatted,
    lifetimeDonationCount: data.lifetimeDonationCount,
    impactUrl: data.impactUrl,
  };
  const text = renderTemplateString(TEMPLATE_KEY, TEXT_BODY, textVars) + plainTextFooter();

  return { subject, html, text };
}

export function renderMonthlyImpactSummaryWhatsApp(data: MonthlyImpactSummaryData) {
  const vars: TemplateVariables = {
    monthLabel: data.monthLabel,
    summaryLine: buildSummaryLine(data, false),
    lifetimeTotalFormatted: data.lifetimeTotalFormatted,
    lifetimeDonationCount: data.lifetimeDonationCount,
    impactUrl: data.impactUrl,
  };
  return { text: renderTemplateString(TEMPLATE_KEY, WHATSAPP_TEXT, vars) };
}
