//#region src/lib/offer-summary.ts
var str = (value, max = 600) => typeof value === "string" ? value.trim().slice(0, max) : "";
function normalizeOfferSummary(input) {
	const row = input ?? {};
	const skills = Array.isArray(row["skills"]) ? row["skills"] : [];
	return {
		summary: str(row["summary"], 700),
		salaryText: str(row["salaryText"] ?? row["salary"], 120),
		skills: skills.map((skill) => str(skill, 40)).filter(Boolean).slice(0, 8),
		location: str(row["location"], 120),
		employmentType: str(row["employmentType"], 60),
		seniority: str(row["seniority"], 60),
		companyUrl: str(row["companyUrl"] ?? row["url"], 300)
	};
}
/** True when there is nothing worth rendering in the summary card. */
function isEmptySummary(summary) {
	return !summary.summary && !summary.salaryText && summary.skills.length === 0 && !summary.location && !summary.employmentType && !summary.seniority;
}
var OFFER_SUMMARY_SCHEMA_HINT = `{
  "summary": string (2-3 sentences describing the role),
  "salaryText": string (exact salary or range as written, "" if absent — never invent one),
  "skills": [string] (up to 8 concrete skills or technologies the offer requires),
  "location": string,
  "employmentType": string,
  "seniority": string
}`;
//#endregion
export { OFFER_SUMMARY_SCHEMA_HINT, isEmptySummary, normalizeOfferSummary };
