import { describe, expect, it } from "vitest";
import {
  accentHex,
  densityFactor,
  fontCss,
  normalizeTemplate,
  DEFAULT_TEMPLATE,
  TEMPLATE_OPTIONS,
  SECTION_LABELS_UI,
} from "./cv-template";

describe("template lookups", () => {
  it("resolves accents with a black fallback", () => {
    expect(accentHex("navy")).toBe("#1f3864");
    expect(accentHex("neon")).toBe("#111111");
  });

  it("resolves density factors", () => {
    expect(densityFactor("small")).toBe(0.92);
    expect(densityFactor("large")).toBe(1.08);
    expect(densityFactor("huge" as never)).toBe(1);
  });

  it("resolves font stacks with a sans fallback", () => {
    expect(fontCss("times")).toContain("Times");
    expect(fontCss("comic" as never)).toContain("Helvetica");
  });

  it("ships three ATS templates and section labels", () => {
    expect(TEMPLATE_OPTIONS.map((t) => t.id)).toEqual([
      "classic",
      "compact",
      "band",
    ]);
    expect(SECTION_LABELS_UI.experience).toBe("Experience");
  });
});

describe("normalizeTemplate", () => {
  it("falls back to the default design for junk input", () => {
    expect(normalizeTemplate(null)).toEqual(DEFAULT_TEMPLATE);
    expect(
      normalizeTemplate({
        template: "fancy",
        font: "wingdings",
        density: "xl",
        accent: "pink",
      }),
    ).toEqual(DEFAULT_TEMPLATE);
  });

  it("keeps valid settings", () => {
    expect(
      normalizeTemplate({
        template: "band",
        font: "courier",
        density: "small",
        accent: "teal",
        showPhoto: true,
      }),
    ).toEqual({
      template: "band",
      font: "courier",
      density: "small",
      accent: "teal",
      showPhoto: true,
      sectionOrder: ["summary", "experience", "education", "skills"],
    });
  });

  it("respects a custom section order and appends the missing sections", () => {
    expect(
      normalizeTemplate({ sectionOrder: ["skills", "nope", "skills"] })
        .sectionOrder,
    ).toEqual(["skills", "summary", "experience", "education"]);
  });

  it("treats a non-boolean showPhoto as false", () => {
    expect(normalizeTemplate({ showPhoto: "yes" }).showPhoto).toBe(false);
  });
});
