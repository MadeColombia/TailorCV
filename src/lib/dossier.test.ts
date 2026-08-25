import { describe, expect, it } from "vitest";
import {
  DOSSIER_MAX_CHARS,
  UPLOADED_HEADING,
  UPLOADED_MAX_CHARS,
  appendFact,
  combineDossier,
  normalizeUploadedContext,
  dossierToPrompt,
  isDossierEmpty,
  normalizeDossier,
} from "./dossier";

describe("normalizeDossier", () => {
  it("returns an empty string for non-strings", () => {
    expect(normalizeDossier(null)).toBe("");
    expect(normalizeDossier(42)).toBe("");
  });

  it("collapses blank lines and trims", () => {
    expect(normalizeDossier("  a\r\n\n\n\nb  ")).toBe("a\n\nb");
  });

  it("caps very long documents", () => {
    const out = normalizeDossier("x".repeat(DOSSIER_MAX_CHARS + 500));
    expect(out.length).toBe(DOSSIER_MAX_CHARS + 1);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("appendFact", () => {
  it("creates the document when empty", () => {
    const out = appendFact("", "Team size?", "Led a team of 6");
    expect(out).toContain("# Candidate dossier");
    expect(out).toContain("- Team size? — Led a team of 6");
  });

  it("appends under an existing Other facts section", () => {
    const base = "# Candidate dossier\n\n## Other facts\n- Ships weekly";
    const out = appendFact(base, "", "Uses Terraform");
    expect(out).toContain("- Ships weekly");
    expect(out).toContain("- Uses Terraform");
    expect(out.match(/## Other facts/g)).toHaveLength(1);
  });

  it("adds a section when the document has none", () => {
    const out = appendFact("# Candidate dossier\n\n## Tools\n- Go", "", "Kafka");
    expect(out).toContain("## Other facts");
    expect(out).toContain("- Kafka");
  });

  it("ignores empty answers and duplicates", () => {
    const base = "# Candidate dossier\n\n## Other facts\n- Kafka";
    expect(appendFact(base, "q", "   ")).toBe(base);
    expect(appendFact(base, "q", "Kafka")).toBe(base);
  });
});

describe("dossierToPrompt / isDossierEmpty", () => {
  it("falls back to a placeholder", () => {
    expect(dossierToPrompt("")).toBe("(nothing recorded yet)");
    expect(dossierToPrompt("- a")).toBe("- a");
  });

  it("treats a headings-only document as empty", () => {
    expect(isDossierEmpty("# Candidate dossier\n\n## Other facts")).toBe(true);
    expect(isDossierEmpty("# Candidate dossier\n- fact")).toBe(false);
  });
});

describe("combineDossier / normalizeUploadedContext", () => {
  it("keeps the uploaded text in its own section", () => {
    const out = combineDossier("# Candidate dossier\n- fact", "- uploaded fact");
    expect(out).toContain(UPLOADED_HEADING);
    expect(out).toContain("- fact");
    expect(out).toContain("- uploaded fact");
  });

  it("returns just the learned part when nothing is uploaded", () => {
    expect(combineDossier("- fact", "")).toBe("- fact");
  });

  it("adds a heading when only uploaded context exists", () => {
    expect(combineDossier("", "- uploaded")).toContain("# Candidate dossier");
  });

  it("caps uploaded documents", () => {
    const out = normalizeUploadedContext("y".repeat(UPLOADED_MAX_CHARS + 200));
    expect(out.length).toBe(UPLOADED_MAX_CHARS + 1);
    expect(normalizeUploadedContext(7)).toBe("");
  });
});
