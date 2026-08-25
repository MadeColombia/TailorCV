export type Experience = {
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Education = {
  school: string;
  degree: string;
  start: string;
  end: string;
  details: string;
};

export type LinkItem = {
  label: string;
  url: string;
};

export type CvData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  /** Legacy single-line links field, kept as a flattened fallback. */
  links: string;
  linkItems: LinkItem[];
  photoUrl: string;
  headline: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
};

/** Every language a CV version can be written in. English is always available. */
export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "ca", label: "Catalan", native: "Català" },
] as const;

export type ProfileLanguage = (typeof LANGUAGES)[number]["code"];

/** The language every account starts with and falls back to. */
export const DEFAULT_LANGUAGE: ProfileLanguage = "en";

export function isProfileLanguage(value: unknown): value is ProfileLanguage {
  return LANGUAGES.some((item) => item.code === value);
}

export function normalizeLanguage(value: unknown): ProfileLanguage {
  return isProfileLanguage(value) ? value : DEFAULT_LANGUAGE;
}

/** English name of a language, used in AI prompts ("Write this in Spanish"). */
export function languageName(value: unknown): string {
  const code = normalizeLanguage(value);
  return LANGUAGES.find((item) => item.code === code)!.label;
}

/** Native name of a language, used in the UI. */
export function languageNative(value: unknown): string {
  const code = normalizeLanguage(value);
  return LANGUAGES.find((item) => item.code === code)!.native;
}

export const LINK_PRESETS = [
  "LinkedIn",
  "GitHub",
  "Portfolio",
  "Website",
  "Other",
];

export type MatchResult = {
  score: number;
  matched: string[];
  missing: string[];
  notes: string;
};

export const emptyCv: CvData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  links: "",
  linkItems: [],
  photoUrl: "",
  headline: "",
  summary: "",
  experiences: [],
  education: [],
  skills: [],
};

export const emptyLink: LinkItem = { label: "LinkedIn", url: "" };

export const emptyExperience: Experience = {
  company: "",
  title: "",
  location: "",
  start: "",
  end: "",
  bullets: [""],
};

export const emptyEducation: Education = {
  school: "",
  degree: "",
  start: "",
  end: "",
  details: "",
};

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function strArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(str).filter((item) => item.trim().length > 0)
    : [];
}

export function normalizeLinkItems(
  input: unknown,
  fallbackLinks = "",
): LinkItem[] {
  if (Array.isArray(input)) {
    const items = (input as unknown[])
      .map((item) => {
        const raw = (item ?? {}) as Record<string, unknown>;
        return { label: str(raw["label"]), url: str(raw["url"]).trim() };
      })
      .filter((item) => item.url.length > 0 || item.label.trim().length > 0);
    if (items.length) return items;
  }
  // Fall back to the legacy single-line links field.
  return fallbackLinks
    .split(/[|,\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((url) => ({ label: guessLinkLabel(url), url }));
}

export function guessLinkLabel(url: string): string {
  const value = url.toLowerCase();
  if (value.includes("linkedin")) return "LinkedIn";
  if (value.includes("github")) return "GitHub";
  if (value.includes("gitlab")) return "GitLab";
  if (value.includes("behance") || value.includes("dribbble"))
    return "Portfolio";
  return "Website";
}

export function linkItemsToLine(items: LinkItem[]): string {
  return items
    .filter((item) => item.url.trim())
    .map((item) =>
      item.label.trim()
        ? `${item.label.trim()}: ${item.url.trim()}`
        : item.url.trim(),
    )
    .join("  |  ");
}

export function normalizeCv(input: unknown): CvData {
  const raw = (input ?? {}) as Record<string, unknown>;
  const legacyLinks = str(raw["links"]);
  const linkItems = normalizeLinkItems(raw["linkItems"], legacyLinks);
  return {
    fullName: str(raw["fullName"]),
    email: str(raw["email"]),
    phone: str(raw["phone"]),
    location: str(raw["location"]),
    links: linkItems.length ? linkItemsToLine(linkItems) : legacyLinks,
    linkItems,
    photoUrl: str(raw["photoUrl"]),
    headline: str(raw["headline"]),
    summary: str(raw["summary"]),

    experiences: Array.isArray(raw["experiences"])
      ? (raw["experiences"] as unknown[]).map((item) => {
          const exp = (item ?? {}) as Record<string, unknown>;
          return {
            company: str(exp["company"]),
            title: str(exp["title"]),
            location: str(exp["location"]),
            start: str(exp["start"]),
            end: str(exp["end"]),
            bullets: strArray(exp["bullets"]),
          };
        })
      : [],
    education: Array.isArray(raw["education"])
      ? (raw["education"] as unknown[]).map((item) => {
          const edu = (item ?? {}) as Record<string, unknown>;
          return {
            school: str(edu["school"]),
            degree: str(edu["degree"]),
            start: str(edu["start"]),
            end: str(edu["end"]),
            details: str(edu["details"]),
          };
        })
      : [],
    skills: strArray(raw["skills"]),
  };
}

export function normalizeMatch(input: unknown): MatchResult {
  const raw = (input ?? {}) as Record<string, unknown>;
  const score = Number(raw["score"]);
  return {
    score: Number.isFinite(score)
      ? Math.max(0, Math.min(100, Math.round(score)))
      : 0,
    matched: strArray(raw["matched"]),
    missing: strArray(raw["missing"]),
    notes: str(raw["notes"]),
  };
}

export function cvToPlainText(cv: CvData): string {
  const lines: string[] = [];
  lines.push(cv.fullName.toUpperCase());
  if (cv.headline) lines.push(cv.headline);
  const contact = [cv.email, cv.phone, cv.location, cv.links]
    .filter(Boolean)
    .join(" | ");
  if (contact) lines.push(contact);
  if (cv.summary) {
    lines.push("", "PROFESSIONAL SUMMARY", cv.summary);
  }
  if (cv.experiences.length) {
    lines.push("", "PROFESSIONAL EXPERIENCE");
    for (const exp of cv.experiences) {
      lines.push("", `${exp.title}${exp.company ? ` - ${exp.company}` : ""}`);
      const meta = [
        exp.location,
        [exp.start, exp.end].filter(Boolean).join(" - "),
      ]
        .filter(Boolean)
        .join(" | ");
      if (meta) lines.push(meta);
      for (const bullet of exp.bullets) lines.push(`- ${bullet}`);
    }
  }
  if (cv.education.length) {
    lines.push("", "EDUCATION");
    for (const edu of cv.education) {
      lines.push("", `${edu.degree}${edu.school ? ` - ${edu.school}` : ""}`);
      const meta = [edu.start, edu.end].filter(Boolean).join(" - ");
      if (meta) lines.push(meta);
      if (edu.details) lines.push(edu.details);
    }
  }
  if (cv.skills.length) {
    lines.push("", "SKILLS", cv.skills.join(", "));
  }
  return lines.join("\n");
}

/** Section headings, localized to the profile language. */
export const CV_SECTION_LABELS: Record<
  ProfileLanguage,
  {
    summary: string;
    experience: string;
    education: string;
    skills: string;
  }
> = {
  en: {
    summary: "Professional Summary",
    experience: "Professional Experience",
    education: "Education",
    skills: "Skills",
  },
  es: {
    summary: "Perfil Profesional",
    experience: "Experiencia Profesional",
    education: "Formación Académica",
    skills: "Competencias",
  },
  pt: {
    summary: "Perfil Profissional",
    experience: "Experiência Profissional",
    education: "Formação Académica",
    skills: "Competências",
  },
  fr: {
    summary: "Profil Professionnel",
    experience: "Expérience Professionnelle",
    education: "Formation",
    skills: "Compétences",
  },
  de: {
    summary: "Profil",
    experience: "Berufserfahrung",
    education: "Ausbildung",
    skills: "Kenntnisse",
  },
  it: {
    summary: "Profilo Professionale",
    experience: "Esperienza Professionale",
    education: "Formazione",
    skills: "Competenze",
  },
  nl: {
    summary: "Profiel",
    experience: "Werkervaring",
    education: "Opleiding",
    skills: "Vaardigheden",
  },
  ca: {
    summary: "Perfil Professional",
    experience: "Experiència Professional",
    education: "Formació Acadèmica",
    skills: "Competències",
  },
};

export function sectionLabels(language: unknown) {
  return CV_SECTION_LABELS[normalizeLanguage(language)];
}
