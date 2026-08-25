/**
 * The "at a glance" summary of a job offer shown at the top of a workspace.
 * Pure module: shared by the offer analyser, the server function that
 * back-fills it from pasted text, and the UI card.
 */

export type OfferSummary = {
  summary: string;
  salaryText: string;
  skills: string[];
  location: string;
  employmentType: string;
  seniority: string;
  companyUrl: string;
};

export const EMPTY_OFFER_SUMMARY: OfferSummary = {
  summary: "",
  salaryText: "",
  skills: [],
  location: "",
  employmentType: "",
  seniority: "",
  companyUrl: "",
};

const str = (value: unknown, max = 600): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export function normalizeOfferSummary(input: unknown): OfferSummary {
  const row = (input ?? {}) as Record<string, unknown>;
  const skills = Array.isArray(row["skills"])
    ? (row["skills"] as unknown[])
    : [];
  return {
    summary: str(row["summary"], 700),
    salaryText: str(row["salaryText"] ?? row["salary"], 120),
    skills: skills
      .map((skill) => str(skill, 40))
      .filter(Boolean)
      .slice(0, 8),
    location: str(row["location"], 120),
    employmentType: str(row["employmentType"], 60),
    seniority: str(row["seniority"], 60),
    companyUrl: str(row["companyUrl"] ?? row["url"], 300),
  };
}

/** True when there is nothing worth rendering in the summary card. */
export function isEmptySummary(summary: OfferSummary): boolean {
  return (
    !summary.summary &&
    !summary.salaryText &&
    summary.skills.length === 0 &&
    !summary.location &&
    !summary.employmentType &&
    !summary.seniority
  );
}

export const OFFER_SUMMARY_SCHEMA_HINT = `{
  "summary": string (2-3 sentences describing the role),
  "salaryText": string (exact salary or range as written, "" if absent — never invent one),
  "skills": [string] (up to 8 concrete skills or technologies the offer requires),
  "location": string,
  "employmentType": string,
  "seniority": string
}`;
