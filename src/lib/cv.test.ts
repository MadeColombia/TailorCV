import { describe, expect, it } from "vitest";
import {
  cvToPlainText,
  emptyCv,
  guessLinkLabel,
  linkItemsToLine,
  normalizeCv,
  normalizeLinkItems,
  normalizeMatch,
  sectionLabels,
  LANGUAGES,
  LINK_PRESETS,
  emptyExperience,
  emptyEducation,
  emptyLink,
} from "./cv";

describe("guessLinkLabel", () => {
  it("recognises the common profile hosts", () => {
    expect(guessLinkLabel("https://LinkedIn.com/in/x")).toBe("LinkedIn");
    expect(guessLinkLabel("https://github.com/x")).toBe("GitHub");
    expect(guessLinkLabel("https://gitlab.com/x")).toBe("GitLab");
    expect(guessLinkLabel("https://dribbble.com/x")).toBe("Portfolio");
    expect(guessLinkLabel("https://behance.net/x")).toBe("Portfolio");
    expect(guessLinkLabel("https://example.com")).toBe("Website");
  });
});

describe("normalizeLinkItems", () => {
  it("keeps structured items and trims urls", () => {
    expect(normalizeLinkItems([{ label: "GitHub", url: " https://gh.com " }, { label: "", url: "" }])).toEqual([
      { label: "GitHub", url: "https://gh.com" },
    ]);
  });

  it("falls back to the legacy single line field", () => {
    expect(normalizeLinkItems(undefined, "https://linkedin.com/in/a | https://x.dev")).toEqual([
      { label: "LinkedIn", url: "https://linkedin.com/in/a" },
      { label: "Website", url: "https://x.dev" },
    ]);
  });

  it("returns an empty list when there is nothing at all", () => {
    expect(normalizeLinkItems([], "")).toEqual([]);
    expect(normalizeLinkItems("nope")).toEqual([]);
  });
});

describe("linkItemsToLine", () => {
  it("joins labelled and unlabelled links", () => {
    expect(
      linkItemsToLine([
        { label: " GitHub ", url: " https://gh.com " },
        { label: "", url: "https://x.dev" },
        { label: "Skip", url: "  " },
      ]),
    ).toBe("GitHub: https://gh.com  |  https://x.dev");
  });
});

describe("normalizeCv", () => {
  it("returns the empty CV for junk input", () => {
    expect(normalizeCv(null)).toEqual(emptyCv);
    expect(normalizeCv({ experiences: "no", education: 3, skills: null })).toEqual(emptyCv);
  });

  it("coerces values and drops blank bullets/skills", () => {
    const cv = normalizeCv({
      fullName: "Ada",
      phone: 555,
      links: "https://github.com/ada",
      experiences: [{ company: "ACME", bullets: ["Shipped", "  ", 7] }],
      education: [{ school: "MIT" }],
      skills: ["SQL", "  ", "Python"],
    });
    expect(cv.fullName).toBe("Ada");
    expect(cv.phone).toBe("555");
    expect(cv.linkItems).toEqual([{ label: "GitHub", url: "https://github.com/ada" }]);
    expect(cv.links).toBe("GitHub: https://github.com/ada");
    expect(cv.experiences[0]!.bullets).toEqual(["Shipped", "7"]);
    expect(cv.education[0]).toEqual({ school: "MIT", degree: "", start: "", end: "", details: "" });
    expect(cv.skills).toEqual(["SQL", "Python"]);
  });

  it("keeps the legacy links string when no link items resolve", () => {
    expect(normalizeCv({ links: "   " }).links).toBe("   ");
  });
});

describe("normalizeMatch", () => {
  it("clamps and rounds the score", () => {
    expect(normalizeMatch({ score: 130 }).score).toBe(100);
    expect(normalizeMatch({ score: -5 }).score).toBe(0);
    expect(normalizeMatch({ score: 71.6 }).score).toBe(72);
    expect(normalizeMatch({ score: "abc" }).score).toBe(0);
  });

  it("normalizes the keyword lists and notes", () => {
    const match = normalizeMatch({ matched: ["sql", ""], missing: "x", notes: 12 });
    expect(match.matched).toEqual(["sql"]);
    expect(match.missing).toEqual([]);
    expect(match.notes).toBe("12");
  });
});

describe("cvToPlainText", () => {
  it("renders every populated section", () => {
    const text = cvToPlainText(
      normalizeCv({
        fullName: "Ada Lovelace",
        headline: "Analyst",
        email: "a@b.c",
        phone: "555",
        location: "Madrid",
        summary: "Does things.",
        experiences: [
          { company: "ACME", title: "Lead", location: "Remote", start: "2020", end: "2024", bullets: ["Shipped"] },
        ],
        education: [{ school: "MIT", degree: "BSc", start: "2014", end: "2018", details: "Honours" }],
        skills: ["SQL"],
      }),
    );
    expect(text).toContain("ADA LOVELACE");
    expect(text).toContain("a@b.c | 555 | Madrid");
    expect(text).toContain("PROFESSIONAL SUMMARY");
    expect(text).toContain("Lead - ACME");
    expect(text).toContain("Remote | 2020 - 2024");
    expect(text).toContain("- Shipped");
    expect(text).toContain("BSc - MIT");
    expect(text).toContain("Honours");
    expect(text).toContain("SKILLS\nSQL");
  });

  it("omits sections that are empty", () => {
    expect(cvToPlainText(emptyCv)).toBe("");
  });
});

describe("constants and labels", () => {
  it("exposes stable defaults", () => {
    expect(LANGUAGES.map((l) => l.code).slice(0, 3)).toEqual(["en", "es", "pt"]);
    expect(LINK_PRESETS).toContain("Portfolio");
    expect(emptyLink.label).toBe("LinkedIn");
    expect(emptyExperience.bullets).toEqual([""]);
    expect(emptyEducation.school).toBe("");
  });

  it("localizes the section headings", () => {
    expect(sectionLabels("es").skills).toBe("Competencias");
    expect(sectionLabels("fr").skills).toBe("Compétences");
    expect(sectionLabels("xx").skills).toBe("Skills");
  });
});
