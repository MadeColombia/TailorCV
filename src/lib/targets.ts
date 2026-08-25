export const MAX_TARGETS = 5;

export type RoleTargetInput = {
  title: string;
  seniority?: string;
  location?: string;
  industry?: string;
  keywords?: string[];
  sampleOffers?: string;
  language?: string;
};

export function targetLanguage(value: unknown): "en" | "es" {
  return value === "es" ? "es" : "en";
}
