//#region node_modules/.nitro/vite/services/ssr/assets/interview-prep-CpEj5H5V.js
var PREP_CATEGORIES = [
	"role",
	"company",
	"behavioural",
	"gap"
];
var str = (value) => typeof value === "string" ? value.trim() : "";
function normalizeCategory(value) {
	const raw = str(value).toLowerCase();
	if (raw === "behavioral") return "behavioural";
	return PREP_CATEGORIES.includes(raw) ? raw : "role";
}
function normalizeInterviewPrep(input) {
	const source = input ?? {};
	return { questions: (Array.isArray(source.questions) ? source.questions : []).map((item) => {
		const entry = item ?? {};
		const category = normalizeCategory(entry["category"]);
		return {
			category,
			question: str(entry["question"]),
			why: str(entry["why"]),
			answer: str(entry["answer"]),
			isGap: entry["isGap"] === true || category === "gap"
		};
	}).filter((item) => item.question.length > 0) };
}
var CATEGORY_LABELS = {
	role: "Role & technical",
	company: "Company & motivation",
	behavioural: "Behavioural",
	gap: "Likely gaps"
};
function prepToPlainText(prep) {
	return prep.questions.map((item, index) => `${index + 1}. [${CATEGORY_LABELS[item.category]}] ${item.question}\nWhy: ${item.why}\nAnswer: ${item.answer}`).join("\n\n");
}
//#endregion
export { normalizeInterviewPrep as n, prepToPlainText as r, CATEGORY_LABELS as t };
