/**
 * Minimal, dependency-free `{{variable}}` template render engine.
 *
 * Design: message *wording* lives as plain strings with `{{placeholder}}`
 * tokens (see the template modules in this folder) — never inline in
 * NotificationService or the trigger files. Optional/conditional copy
 * (e.g. "for {{campaignName}}") is pre-computed by each template's
 * `buildVariables()` into a plain string before it ever reaches this
 * renderer, so the renderer itself only ever does straight substitution —
 * that keeps it simple while still guaranteeing every variable in a
 * rendered message came from real donor/donation data.
 */

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export class TemplateRenderError extends Error {
  constructor(
    public readonly templateKey: string,
    public readonly missingVariables: string[],
  ) {
    super(
      `Template "${templateKey}" is missing required variable(s): ${missingVariables.join(", ")}`,
    );
    this.name = "TemplateRenderError";
  }
}

export type TemplateVariables = Record<string, string | number>;

/**
 * Substitutes every `{{key}}` token with `data[key]`. Throws
 * TemplateRenderError if a token has no corresponding value, or if a value
 * is not a string/number (guards against `[object Object]` leaking into a
 * rendered message). Never silently renders "undefined" or "null".
 */
export function renderTemplateString(
  templateKey: string,
  template: string,
  data: TemplateVariables,
): string {
  const missing: string[] = [];

  const rendered = template.replace(PLACEHOLDER_RE, (_match, key: string) => {
    if (!(key in data)) {
      missing.push(key);
      return "";
    }
    const value = data[key];
    if (value === undefined || value === null) {
      missing.push(key);
      return "";
    }
    if (typeof value !== "string" && typeof value !== "number") {
      missing.push(key);
      return "";
    }
    return String(value);
  });

  if (missing.length > 0) {
    throw new TemplateRenderError(templateKey, Array.from(new Set(missing)));
  }

  return rendered;
}

/** Escapes text that will be interpolated into HTML (donor-supplied names, campaign names, etc). */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
