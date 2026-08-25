import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { f as normalizeLanguage } from "./cv-DMqvWRdG.js";
//#region src/lib/user-settings.ts
/**
* Per-account preferences: interface language, the CV languages the user keeps,
* generation defaults, privacy retention and the AI spending guard.
* Pure module — safe to import from client and server.
*/
var user_settings_exports = /* @__PURE__ */ __exportAll({
	AUTO_DELETE_MAX_MONTHS: () => 36,
	AUTO_DELETE_MIN_MONTHS: () => 1,
	COVER_LETTER_TONES: () => COVER_LETTER_TONES,
	DEFAULT_SETTINGS: () => DEFAULT_SETTINGS,
	INTERVIEW_DEPTHS: () => INTERVIEW_DEPTHS,
	SESSION_CAP_MAX: () => 200,
	SESSION_CAP_MIN: () => 5,
	TRACKING_BOUNDS: () => TRACKING_BOUNDS,
	UI_LANGUAGES: () => UI_LANGUAGES,
	depthMaxQuestions: () => depthMaxQuestions,
	depthPromptHint: () => depthPromptHint,
	isContextExpired: () => isContextExpired,
	normalizeCvLanguages: () => normalizeCvLanguages,
	normalizeDepth: () => normalizeDepth,
	normalizeSettings: () => normalizeSettings,
	normalizeTone: () => normalizeTone,
	normalizeUiLanguage: () => normalizeUiLanguage,
	settingsToRow: () => settingsToRow
});
/** Languages the app interface itself is translated into. */
var UI_LANGUAGES = [
	{
		code: "en",
		label: "English"
	},
	{
		code: "es",
		label: "Español"
	},
	{
		code: "pt",
		label: "Português"
	}
];
function normalizeUiLanguage(value) {
	return UI_LANGUAGES.some((item) => item.code === value) ? value : "en";
}
var COVER_LETTER_TONES = [
	{
		value: "professional",
		label: "Professional",
		hint: "Warm but businesslike. Safe default."
	},
	{
		value: "enthusiastic",
		label: "Enthusiastic",
		hint: "Energetic, shows genuine excitement."
	},
	{
		value: "concise",
		label: "Short and punchy",
		hint: "Three tight paragraphs, no filler."
	},
	{
		value: "formal",
		label: "Formal",
		hint: "Traditional and conservative industries."
	},
	{
		value: "storytelling",
		label: "Storytelling",
		hint: "Opens with a concrete moment."
	}
];
function normalizeTone(value) {
	return COVER_LETTER_TONES.some((item) => item.value === value) ? value : "professional";
}
var INTERVIEW_DEPTHS = [
	{
		value: "light",
		label: "Light",
		hint: "Only asks when something critical is missing (1–2 questions).",
		maxQuestions: 2
	},
	{
		value: "standard",
		label: "Standard",
		hint: "Balanced — covers the main gaps (3–5 questions).",
		maxQuestions: 5
	},
	{
		value: "deep",
		label: "Deep",
		hint: "Digs into metrics, scope and edge cases (up to 10 questions).",
		maxQuestions: 10
	}
];
function normalizeDepth(value) {
	return INTERVIEW_DEPTHS.some((item) => item.value === value) ? value : "standard";
}
function depthMaxQuestions(value) {
	const depth = normalizeDepth(value);
	return INTERVIEW_DEPTHS.find((item) => item.value === depth).maxQuestions;
}
/** Bounds for the application-tracking windows. */
var TRACKING_BOUNDS = {
	responseWindowDays: {
		min: 3,
		max: 120,
		fallback: 21
	},
	ghostAfterDays: {
		min: 7,
		max: 240,
		fallback: 45
	},
	archiveRetentionDays: {
		min: 7,
		max: 365,
		fallback: 30
	},
	followupOffsetDays: {
		min: 1,
		max: 90,
		fallback: 10
	}
};
var DEFAULT_SETTINGS = {
	uiLanguage: "en",
	cvLanguages: ["en"],
	defaultAppLanguage: "en",
	coverLetterTone: "professional",
	interviewDepth: "standard",
	autoDeleteEnabled: false,
	autoDeleteMonths: 12,
	sessionMessageCap: 30,
	emailContextExpiry: true,
	emailNewFeatures: false,
	responseWindowDays: 21,
	ghostAfterDays: 45,
	archiveRetentionDays: 30,
	followupOffsetDays: 10,
	deepPrepOnInterview: true
};
function clamp(value, min, max, fallback) {
	const num = Math.round(Number(value));
	if (!Number.isFinite(num)) return fallback;
	return Math.min(max, Math.max(min, num));
}
/** English is never removable, and duplicates/unknown codes are dropped. */
function normalizeCvLanguages(value) {
	const list = Array.isArray(value) ? value : [];
	const codes = /* @__PURE__ */ new Set(["en"]);
	for (const item of list) if (typeof item === "string" && item !== "en") {
		const code = normalizeLanguage(item);
		if (code === item) codes.add(code);
	}
	return [...codes];
}
/** Accepts a database row (snake_case) or a partial patch (camelCase). */
function normalizeSettings(input) {
	const row = input ?? {};
	const pick = (snake, camel) => row[camel] !== void 0 ? row[camel] : row[snake];
	const cvLanguages = normalizeCvLanguages(pick("cv_languages", "cvLanguages"));
	const defaultApp = normalizeLanguage(pick("default_app_language", "defaultAppLanguage"));
	return {
		uiLanguage: normalizeUiLanguage(pick("ui_language", "uiLanguage")),
		cvLanguages,
		defaultAppLanguage: cvLanguages.includes(defaultApp) ? defaultApp : "en",
		coverLetterTone: normalizeTone(pick("cover_letter_tone", "coverLetterTone")),
		interviewDepth: normalizeDepth(pick("interview_depth", "interviewDepth")),
		autoDeleteEnabled: Boolean(pick("auto_delete_enabled", "autoDeleteEnabled")),
		autoDeleteMonths: clamp(pick("auto_delete_months", "autoDeleteMonths"), 1, 36, DEFAULT_SETTINGS.autoDeleteMonths),
		sessionMessageCap: clamp(pick("session_message_cap", "sessionMessageCap"), 5, 200, DEFAULT_SETTINGS.sessionMessageCap),
		emailContextExpiry: pick("email_context_expiry", "emailContextExpiry") === void 0 ? DEFAULT_SETTINGS.emailContextExpiry : Boolean(pick("email_context_expiry", "emailContextExpiry")),
		emailNewFeatures: Boolean(pick("email_new_features", "emailNewFeatures")),
		responseWindowDays: clamp(pick("response_window_days", "responseWindowDays"), TRACKING_BOUNDS.responseWindowDays.min, TRACKING_BOUNDS.responseWindowDays.max, TRACKING_BOUNDS.responseWindowDays.fallback),
		ghostAfterDays: clamp(pick("ghost_after_days", "ghostAfterDays"), TRACKING_BOUNDS.ghostAfterDays.min, TRACKING_BOUNDS.ghostAfterDays.max, TRACKING_BOUNDS.ghostAfterDays.fallback),
		archiveRetentionDays: clamp(pick("archive_retention_days", "archiveRetentionDays"), TRACKING_BOUNDS.archiveRetentionDays.min, TRACKING_BOUNDS.archiveRetentionDays.max, TRACKING_BOUNDS.archiveRetentionDays.fallback),
		followupOffsetDays: clamp(pick("followup_offset_days", "followupOffsetDays"), TRACKING_BOUNDS.followupOffsetDays.min, TRACKING_BOUNDS.followupOffsetDays.max, TRACKING_BOUNDS.followupOffsetDays.fallback),
		deepPrepOnInterview: pick("deep_prep_on_interview", "deepPrepOnInterview") === void 0 ? true : Boolean(pick("deep_prep_on_interview", "deepPrepOnInterview"))
	};
}
/** Shape written back to the database. */
function settingsToRow(settings) {
	return {
		ui_language: settings.uiLanguage,
		cv_languages: settings.cvLanguages,
		default_app_language: settings.defaultAppLanguage,
		cover_letter_tone: settings.coverLetterTone,
		interview_depth: settings.interviewDepth,
		auto_delete_enabled: settings.autoDeleteEnabled,
		auto_delete_months: settings.autoDeleteMonths,
		session_message_cap: settings.sessionMessageCap,
		email_context_expiry: settings.emailContextExpiry,
		email_new_features: settings.emailNewFeatures,
		response_window_days: settings.responseWindowDays,
		ghost_after_days: settings.ghostAfterDays,
		archive_retention_days: settings.archiveRetentionDays,
		followup_offset_days: settings.followupOffsetDays,
		deep_prep_on_interview: settings.deepPrepOnInterview
	};
}
/** True when a dossier last touched at `updatedAt` is past its retention window. */
function isContextExpired(settings, updatedAt, now = Date.now()) {
	if (!settings.autoDeleteEnabled) return false;
	const stamp = typeof updatedAt === "string" ? Date.parse(updatedAt) : Number(updatedAt);
	if (!Number.isFinite(stamp)) return false;
	const months = clamp(settings.autoDeleteMonths, 1, 36, DEFAULT_SETTINGS.autoDeleteMonths);
	return now - stamp > months * 30 * 24 * 60 * 60 * 1e3;
}
/** Prompt fragment describing how many questions the interviewer may ask. */
function depthPromptHint(value) {
	const depth = normalizeDepth(value);
	const max = depthMaxQuestions(depth);
	if (depth === "light") return `INTERVIEW DEPTH: light. Ask at most ${max} questions in total, and only if a requirement is critical and completely uncovered. Otherwise say nothing is missing.`;
	if (depth === "deep") return `INTERVIEW DEPTH: deep. Ask up to ${max} questions in total, probing metrics, scope, team size and edge cases — but still never repeat anything already known.`;
	return `INTERVIEW DEPTH: standard. Ask up to ${max} questions in total, covering only the material gaps.`;
}
//#endregion
export { UI_LANGUAGES as a, normalizeTone as c, user_settings_exports as d, TRACKING_BOUNDS as i, normalizeUiLanguage as l, DEFAULT_SETTINGS as n, depthPromptHint as o, INTERVIEW_DEPTHS as r, normalizeSettings as s, COVER_LETTER_TONES as t, settingsToRow as u };
