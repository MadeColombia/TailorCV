import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cv-DMqvWRdG.js
var cv_DMqvWRdG_exports = /* @__PURE__ */ __exportAll({
	a: () => emptyCv,
	c: () => emptyLink,
	d: () => normalizeCv,
	f: () => normalizeLanguage,
	i: () => cv_exports,
	l: () => languageName,
	m: () => sectionLabels,
	n: () => LINK_PRESETS,
	o: () => emptyEducation,
	p: () => normalizeMatch,
	r: () => cvToPlainText,
	s: () => emptyExperience,
	t: () => LANGUAGES,
	u: () => languageNative
});
var cv_exports = /* @__PURE__ */ __exportAll$1({
	CV_SECTION_LABELS: () => CV_SECTION_LABELS,
	DEFAULT_LANGUAGE: () => "en",
	LANGUAGES: () => LANGUAGES,
	LINK_PRESETS: () => LINK_PRESETS,
	cvToPlainText: () => cvToPlainText,
	emptyCv: () => emptyCv,
	emptyEducation: () => emptyEducation,
	emptyExperience: () => emptyExperience,
	emptyLink: () => emptyLink,
	guessLinkLabel: () => guessLinkLabel,
	isProfileLanguage: () => isProfileLanguage,
	languageName: () => languageName,
	languageNative: () => languageNative,
	linkItemsToLine: () => linkItemsToLine,
	normalizeCv: () => normalizeCv,
	normalizeLanguage: () => normalizeLanguage,
	normalizeLinkItems: () => normalizeLinkItems,
	normalizeMatch: () => normalizeMatch,
	sectionLabels: () => sectionLabels
});
/** Every language a CV version can be written in. English is always available. */
var LANGUAGES = [
	{
		code: "en",
		label: "English",
		native: "English"
	},
	{
		code: "es",
		label: "Spanish",
		native: "Español"
	},
	{
		code: "pt",
		label: "Portuguese",
		native: "Português"
	},
	{
		code: "fr",
		label: "French",
		native: "Français"
	},
	{
		code: "de",
		label: "German",
		native: "Deutsch"
	},
	{
		code: "it",
		label: "Italian",
		native: "Italiano"
	},
	{
		code: "nl",
		label: "Dutch",
		native: "Nederlands"
	},
	{
		code: "ca",
		label: "Catalan",
		native: "Català"
	}
];
function isProfileLanguage(value) {
	return LANGUAGES.some((item) => item.code === value);
}
function normalizeLanguage(value) {
	return isProfileLanguage(value) ? value : "en";
}
/** English name of a language, used in AI prompts ("Write this in Spanish"). */
function languageName(value) {
	const code = normalizeLanguage(value);
	return LANGUAGES.find((item) => item.code === code).label;
}
/** Native name of a language, used in the UI. */
function languageNative(value) {
	const code = normalizeLanguage(value);
	return LANGUAGES.find((item) => item.code === code).native;
}
var LINK_PRESETS = [
	"LinkedIn",
	"GitHub",
	"Portfolio",
	"Website",
	"Other"
];
var emptyCv = {
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
	skills: []
};
var emptyLink = {
	label: "LinkedIn",
	url: ""
};
var emptyExperience = {
	company: "",
	title: "",
	location: "",
	start: "",
	end: "",
	bullets: [""]
};
var emptyEducation = {
	school: "",
	degree: "",
	start: "",
	end: "",
	details: ""
};
function str(value) {
	return typeof value === "string" ? value : value == null ? "" : String(value);
}
function strArray(value) {
	return Array.isArray(value) ? value.map(str).filter((item) => item.trim().length > 0) : [];
}
function normalizeLinkItems(input, fallbackLinks = "") {
	if (Array.isArray(input)) {
		const items = input.map((item) => {
			const raw = item ?? {};
			return {
				label: str(raw["label"]),
				url: str(raw["url"]).trim()
			};
		}).filter((item) => item.url.length > 0 || item.label.trim().length > 0);
		if (items.length) return items;
	}
	return fallbackLinks.split(/[|,\n]/).map((part) => part.trim()).filter(Boolean).map((url) => ({
		label: guessLinkLabel(url),
		url
	}));
}
function guessLinkLabel(url) {
	const value = url.toLowerCase();
	if (value.includes("linkedin")) return "LinkedIn";
	if (value.includes("github")) return "GitHub";
	if (value.includes("gitlab")) return "GitLab";
	if (value.includes("behance") || value.includes("dribbble")) return "Portfolio";
	return "Website";
}
function linkItemsToLine(items) {
	return items.filter((item) => item.url.trim()).map((item) => item.label.trim() ? `${item.label.trim()}: ${item.url.trim()}` : item.url.trim()).join("  |  ");
}
function normalizeCv(input) {
	const raw = input ?? {};
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
		experiences: Array.isArray(raw["experiences"]) ? raw["experiences"].map((item) => {
			const exp = item ?? {};
			return {
				company: str(exp["company"]),
				title: str(exp["title"]),
				location: str(exp["location"]),
				start: str(exp["start"]),
				end: str(exp["end"]),
				bullets: strArray(exp["bullets"])
			};
		}) : [],
		education: Array.isArray(raw["education"]) ? raw["education"].map((item) => {
			const edu = item ?? {};
			return {
				school: str(edu["school"]),
				degree: str(edu["degree"]),
				start: str(edu["start"]),
				end: str(edu["end"]),
				details: str(edu["details"])
			};
		}) : [],
		skills: strArray(raw["skills"])
	};
}
function normalizeMatch(input) {
	const raw = input ?? {};
	const score = Number(raw["score"]);
	return {
		score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
		matched: strArray(raw["matched"]),
		missing: strArray(raw["missing"]),
		notes: str(raw["notes"])
	};
}
function cvToPlainText(cv) {
	const lines = [];
	lines.push(cv.fullName.toUpperCase());
	if (cv.headline) lines.push(cv.headline);
	const contact = [
		cv.email,
		cv.phone,
		cv.location,
		cv.links
	].filter(Boolean).join(" | ");
	if (contact) lines.push(contact);
	if (cv.summary) lines.push("", "PROFESSIONAL SUMMARY", cv.summary);
	if (cv.experiences.length) {
		lines.push("", "PROFESSIONAL EXPERIENCE");
		for (const exp of cv.experiences) {
			lines.push("", `${exp.title}${exp.company ? ` - ${exp.company}` : ""}`);
			const meta = [exp.location, [exp.start, exp.end].filter(Boolean).join(" - ")].filter(Boolean).join(" | ");
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
	if (cv.skills.length) lines.push("", "SKILLS", cv.skills.join(", "));
	return lines.join("\n");
}
/** Section headings, localized to the profile language. */
var CV_SECTION_LABELS = {
	en: {
		summary: "Professional Summary",
		experience: "Professional Experience",
		education: "Education",
		skills: "Skills"
	},
	es: {
		summary: "Perfil Profesional",
		experience: "Experiencia Profesional",
		education: "Formación Académica",
		skills: "Competencias"
	},
	pt: {
		summary: "Perfil Profissional",
		experience: "Experiência Profissional",
		education: "Formação Académica",
		skills: "Competências"
	},
	fr: {
		summary: "Profil Professionnel",
		experience: "Expérience Professionnelle",
		education: "Formation",
		skills: "Compétences"
	},
	de: {
		summary: "Profil",
		experience: "Berufserfahrung",
		education: "Ausbildung",
		skills: "Kenntnisse"
	},
	it: {
		summary: "Profilo Professionale",
		experience: "Esperienza Professionale",
		education: "Formazione",
		skills: "Competenze"
	},
	nl: {
		summary: "Profiel",
		experience: "Werkervaring",
		education: "Opleiding",
		skills: "Vaardigheden"
	},
	ca: {
		summary: "Perfil Professional",
		experience: "Experiència Professional",
		education: "Formació Acadèmica",
		skills: "Competències"
	}
};
function sectionLabels(language) {
	return CV_SECTION_LABELS[normalizeLanguage(language)];
}
//#endregion
export { emptyCv as a, emptyLink as c, normalizeCv as d, normalizeLanguage as f, cv_DMqvWRdG_exports as i, languageName as l, sectionLabels as m, LINK_PRESETS as n, emptyEducation as o, normalizeMatch as p, cvToPlainText as r, emptyExperience as s, LANGUAGES as t, languageNative as u };
