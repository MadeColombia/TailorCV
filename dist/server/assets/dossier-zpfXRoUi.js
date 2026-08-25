//#region src/lib/dossier.ts
/**
* The candidate dossier: a single living markdown document per user holding
* everything they have ever told the AI. It is stored in the database (not in
* any chat transcript) and re-read on every AI call, so an old application
* picked up weeks later still sees the latest facts.
*/
var DOSSIER_MAX_CHARS = 12e3;
var DOSSIER_HEADING = "# Candidate dossier";
var DOSSIER_SECTION_HINT = `## Scope & seniority
## Tools & technologies
## Metrics & outcomes
## Ways of working
## Preferences & constraints
## Other facts`;
/** Trim, collapse noise and cap the document so prompts stay bounded. */
function normalizeDossier(input) {
	if (typeof input !== "string") return "";
	const text = input.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
	return text.length > 12e3 ? `${text.slice(0, DOSSIER_MAX_CHARS).trim()}…` : text;
}
/**
* Deterministic merge used when the AI merge is unavailable: the new fact is
* appended verbatim under "Other facts" so nothing is ever lost.
*/
function appendFact(existing, question, answer) {
	const base = normalizeDossier(existing);
	const q = question.trim();
	const a = answer.trim();
	if (!a) return base;
	const line = q ? `- ${q} — ${a}` : `- ${a}`;
	if (base.includes(a)) return base;
	const head = base || `# Candidate dossier\n\n## Other facts`;
	return normalizeDossier(`${head.includes("## Other facts") ? head : `${head}\n\n## Other facts`}\n${line}`);
}
/** What gets injected into prompts. */
function dossierToPrompt(content) {
	return normalizeDossier(content) || "(nothing recorded yet)";
}
/** Heading used for the section the candidate uploads themselves. */
var UPLOADED_HEADING = "## Candidate-provided context (uploaded document)";
var UPLOADED_MAX_CHARS = 8e3;
/** Trim and cap an uploaded document so it never crowds out the learned facts. */
function normalizeUploadedContext(input) {
	if (typeof input !== "string") return "";
	const text = input.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
	return text.length > 8e3 ? `${text.slice(0, UPLOADED_MAX_CHARS).trim()}…` : text;
}
/**
* Join the two independent sections into the single document used in prompts.
* The learned (question-driven) part is never rewritten by an upload and vice
* versa — they only ever meet here.
*/
function combineDossier(learned, uploaded) {
	const base = normalizeDossier(learned);
	const extra = normalizeUploadedContext(uploaded);
	if (!extra) return base;
	return `${base || "# Candidate dossier"}\n\n${UPLOADED_HEADING}\n${extra}`;
}
//#endregion
export { DOSSIER_HEADING, DOSSIER_SECTION_HINT, UPLOADED_HEADING, appendFact, combineDossier, dossierToPrompt, normalizeDossier, normalizeUploadedContext };
