export type TemplateId = "classic" | "compact" | "band";
export type TemplateFont = "helvetica" | "times" | "courier";
export type TemplateDensity = "small" | "normal" | "large";
export type TemplateSection = "summary" | "experience" | "education" | "skills";

export type TemplateSettings = {
  template: TemplateId;
  font: TemplateFont;
  density: TemplateDensity;
  accent: string;
  showPhoto: boolean;
  sectionOrder: TemplateSection[];
};

export const DEFAULT_TEMPLATE: TemplateSettings = {
  template: "classic",
  font: "helvetica",
  density: "normal",
  accent: "none",
  showPhoto: false,
  sectionOrder: ["summary", "experience", "education", "skills"],
};

export const TEMPLATE_OPTIONS: Array<{
  id: TemplateId;
  label: string;
  description: string;
}> = [
  {
    id: "classic",
    label: "Classic",
    description:
      "Single column with ruled section headings — the most conservative ATS layout.",
  },
  {
    id: "compact",
    label: "Compact",
    description:
      "Same single column, tighter spacing and smaller headings for dense CVs.",
  },
  {
    id: "band",
    label: "Header band",
    description:
      "Name and contact set apart in a light band at the top, body stays single column.",
  },
];

export const FONT_OPTIONS: Array<{
  id: TemplateFont;
  label: string;
  css: string;
}> = [
  {
    id: "helvetica",
    label: "Helvetica (sans)",
    css: "Helvetica, Arial, sans-serif",
  },
  {
    id: "times",
    label: "Times (serif)",
    css: "'Times New Roman', Times, serif",
  },
  {
    id: "courier",
    label: "Courier (mono)",
    css: "'Courier New', Courier, monospace",
  },
];

export const DENSITY_OPTIONS: Array<{
  id: TemplateDensity;
  label: string;
  factor: number;
}> = [
  { id: "small", label: "Small", factor: 0.92 },
  { id: "normal", label: "Normal", factor: 1 },
  { id: "large", label: "Large", factor: 1.08 },
];

export const ACCENT_OPTIONS: Array<{ id: string; label: string; hex: string }> =
  [
    { id: "none", label: "None (black)", hex: "#111111" },
    { id: "navy", label: "Navy", hex: "#1f3864" },
    { id: "slate", label: "Slate", hex: "#3f4a5a" },
    { id: "teal", label: "Teal", hex: "#155e5b" },
    { id: "maroon", label: "Maroon", hex: "#6b2233" },
  ];

export const SECTION_LABELS_UI: Record<TemplateSection, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
};

export function accentHex(accent: string): string {
  return (
    ACCENT_OPTIONS.find((option) => option.id === accent)?.hex ?? "#111111"
  );
}

export function densityFactor(density: TemplateDensity): number {
  return DENSITY_OPTIONS.find((option) => option.id === density)?.factor ?? 1;
}

export function fontCss(font: TemplateFont): string {
  return (
    FONT_OPTIONS.find((option) => option.id === font)?.css ??
    FONT_OPTIONS[0]!.css
  );
}

const SECTIONS: TemplateSection[] = [
  "summary",
  "experience",
  "education",
  "skills",
];

export function normalizeTemplate(input: unknown): TemplateSettings {
  const raw = (input ?? {}) as Record<string, unknown>;
  const template = (["classic", "compact", "band"] as const).includes(
    raw["template"] as TemplateId,
  )
    ? (raw["template"] as TemplateId)
    : DEFAULT_TEMPLATE.template;
  const font = (["helvetica", "times", "courier"] as const).includes(
    raw["font"] as TemplateFont,
  )
    ? (raw["font"] as TemplateFont)
    : DEFAULT_TEMPLATE.font;
  const density = (["small", "normal", "large"] as const).includes(
    raw["density"] as TemplateDensity,
  )
    ? (raw["density"] as TemplateDensity)
    : DEFAULT_TEMPLATE.density;
  const accent = ACCENT_OPTIONS.some((option) => option.id === raw["accent"])
    ? String(raw["accent"])
    : DEFAULT_TEMPLATE.accent;

  const requested = Array.isArray(raw["sectionOrder"])
    ? (raw["sectionOrder"] as unknown[]).filter(
        (item): item is TemplateSection =>
          SECTIONS.includes(item as TemplateSection),
      )
    : [];
  const sectionOrder = [...new Set([...requested, ...SECTIONS])];

  return {
    template,
    font,
    density,
    accent,
    showPhoto: raw["showPhoto"] === true,
    sectionOrder,
  };
}
