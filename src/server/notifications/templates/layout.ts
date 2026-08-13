/**
 * Shared branded HTML shell for every notification email. Table-based
 * layout with inline styles for broad email-client compatibility (Gmail,
 * Outlook, Apple Mail). Mirrors the site's brand tokens (see src/styles.css)
 * without depending on the app's Tailwind build — email HTML can't load
 * external stylesheets reliably.
 */

const BRAND = {
  navy: "#0F172A",
  green: "#15803D",
  greenSoft: "#22C55E",
  gold: "#C89B3C",
  bg: "#FAFAF8",
  card: "#FFFFFF",
  border: "#E5E7EB",
  muted: "#6B7280",
  text: "#1F2937",
};

export interface EmailLayoutOptions {
  previewText: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

const TEST_BADGE_MARKER = "<!--TEST_BADGE_SLOT-->";

/**
 * Turns a rendered email into a clearly-marked test message — used by
 * NotificationService in NOTIFICATION_MODE=development so nobody mistakes a
 * dev-mode send for a real donor notification. Only ever applied centrally
 * here, never inside individual templates.
 */
export function injectTestBadge(html: string): string {
  const badge = `<tr><td align="center" style="padding-bottom:12px;">
    <span style="display:inline-block;background:#FEF3C7;color:#92400E;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:999px;">TEST NOTIFICATION</span>
  </td></tr>`;
  return html.replace(TEST_BADGE_MARKER, badge);
}

export function emailLayout(opts: EmailLayoutOptions): string {
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `
      <tr>
        <td align="center" style="padding: 8px 0 4px;">
          <a href="${opts.ctaUrl}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;background:linear-gradient(135deg,${BRAND.green},${BRAND.greenSoft});
                    color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;
                    padding:12px 28px;border-radius:999px;">
            ${opts.ctaLabel}
          </a>
        </td>
      </tr>`
      : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charSet="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${BRAND.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.previewText}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="font-size:13px;font-weight:700;letter-spacing:2.5px;color:${BRAND.navy};">TARE ZAMEEN</span>
              <span style="display:block;font-size:9px;font-weight:600;letter-spacing:4px;color:${BRAND.muted};margin-top:2px;">FOUNDATION</span>
            </td>
          </tr>
          ${TEST_BADGE_MARKER}
          <tr>
            <td style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;padding:36px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:22px;font-weight:700;color:${BRAND.navy};padding-bottom:16px;">
                    ${opts.heading}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14.5px;line-height:1.65;color:${BRAND.text};">
                    ${opts.bodyHtml}
                  </td>
                </tr>
                ${cta}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;font-size:11.5px;line-height:1.6;color:${BRAND.muted};">
              Tare Zameen Foundation &middot; Every star on earth deserves to shine.<br />
              You're receiving this because of your relationship with Tare Zameen Foundation.
              Manage your notification preferences from your donor dashboard.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function plainTextFooter(): string {
  return "\n\n—\nTare Zameen Foundation · Every star on earth deserves to shine.\nManage your notification preferences from your donor dashboard.";
}
