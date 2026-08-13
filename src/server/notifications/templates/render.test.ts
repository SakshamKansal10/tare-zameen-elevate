import { describe, expect, it } from "vitest";
import { escapeHtml, renderTemplateString, TemplateRenderError } from "./render";

describe("renderTemplateString", () => {
  it("substitutes every {{variable}} with its value", () => {
    const result = renderTemplateString("test", "Hello {{name}}, you have {{count}} messages.", {
      name: "Priya",
      count: 3,
    });
    expect(result).toBe("Hello Priya, you have 3 messages.");
  });

  it("throws TemplateRenderError when a variable is missing, and never renders 'undefined'", () => {
    expect(() => renderTemplateString("test", "Hello {{name}}!", {})).toThrow(TemplateRenderError);
  });

  it("throws when a variable is explicitly null, and never renders 'null'", () => {
    expect(() =>
      renderTemplateString("test", "Hello {{name}}!", { name: null as unknown as string }),
    ).toThrow(TemplateRenderError);
  });

  it("throws instead of rendering '[object Object]' for a non-primitive value", () => {
    expect(() =>
      renderTemplateString("test", "Hello {{name}}!", {
        name: { nested: true } as unknown as string,
      }),
    ).toThrow(TemplateRenderError);
  });

  it("lists every missing variable in the error, deduplicated", () => {
    try {
      renderTemplateString("test", "{{a}} {{b}} {{a}}", {});
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(TemplateRenderError);
      expect((error as TemplateRenderError).missingVariables).toEqual(["a", "b"]);
    }
  });

  it("handles templates with no placeholders", () => {
    expect(renderTemplateString("test", "No variables here.", {})).toBe("No variables here.");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert('x')</script> & "quotes"`)).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; &quot;quotes&quot;",
    );
  });
});
