/**
 * The candidate dossier: a single living markdown document per user holding
 * everything they have ever told the AI. It is stored in the database (not in
 * any chat transcript) and re-read on every AI call, so an old application
 * picked up weeks later still sees the latest facts.
 */

export const DOSSIER_MAX_CHARS = 12000;

export const DOSSIER_HEADING = "# Candidate dossier";

export const DOSSIER_SECTION_HINT = `## Scope & seniority
## Tools & technologies
## Metrics & outcomes
## Ways of working
## Preferences & constraints
## Other facts`;

/** Trim, collapse noise and cap the document so prompts stay bounded. */
export function normalizeDossier(input: unknown): string {
  if (typeof input !== "string") return "";
  const text = input.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text.length > DOSSIER_MAX_CHARS ? `${text.slice(0, DOSSIER_MAX_CHARS).trim()}…` : text;
}

/**
 * Deterministic merge used when the AI merge is unavailable: the new fact is
 * appended verbatim under "Other facts" so nothing is ever lost.
 */
export function appendFact(existing: unknown, question: string, answer: string): string {
  const base = normalizeDossier(existing);
  const q = question.trim();
  const a = answer.trim();
  if (!a) return base;
  const line = q ? `- ${q} — ${a}` : `- ${a}`;
  if (base.includes(a)) return base;
  const head = base || `${DOSSIER_HEADING}\n\n## Other facts`;
  const body = head.includes("## Other facts") ? head : `${head}\n\n## Other facts`;
  return normalizeDossier(`${body}\n${line}`);
}

/** What gets injected into prompts. */
export function dossierToPrompt(content: unknown): string {
  const text = normalizeDossier(content);
  return text || "(nothing recorded yet)";
}

export function isDossierEmpty(content: unknown): boolean {
  return normalizeDossier(content).replace(/^#.*$/gm, "").trim().length === 0;
}

/** Heading used for the section the candidate uploads themselves. */
export const UPLOADED_HEADING = "## Candidate-provided context (uploaded document)";

export const UPLOADED_MAX_CHARS = 8000;

/** Trim and cap an uploaded document so it never crowds out the learned facts. */
export function normalizeUploadedContext(input: unknown): string {
  if (typeof input !== "string") return "";
  const text = input.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text.length > UPLOADED_MAX_CHARS
    ? `${text.slice(0, UPLOADED_MAX_CHARS).trim()}…`
    : text;
}

/**
 * Join the two independent sections into the single document used in prompts.
 * The learned (question-driven) part is never rewritten by an upload and vice
 * versa — they only ever meet here.
 */
export function combineDossier(learned: unknown, uploaded: unknown): string {
  const base = normalizeDossier(learned);
  const extra = normalizeUploadedContext(uploaded);
  if (!extra) return base;
  const head = base || DOSSIER_HEADING;
  return `${head}\n\n${UPLOADED_HEADING}\n${extra}`;
}
