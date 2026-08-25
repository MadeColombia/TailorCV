import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
//#region src/lib/pipeline.ts
var pipeline_exports = /* @__PURE__ */ __exportAll({
	CLOSED_STAGES: () => CLOSED_STAGES,
	DAY_MS: () => DAY_MS,
	DEFAULT_WINDOWS: () => DEFAULT_WINDOWS,
	PIPELINE_STAGES: () => PIPELINE_STAGES,
	daysSince: () => daysSince,
	daysUntil: () => daysUntil,
	isClosedStage: () => isClosedStage,
	matchesFilter: () => matchesFilter,
	normalizeStage: () => normalizeStage,
	pipelineHealth: () => pipelineHealth,
	responseLikelihood: () => responseLikelihood,
	stageLabel: () => stageLabel,
	suggestedFollowUp: () => suggestedFollowUp,
	toneEdgeClass: () => toneEdgeClass,
	toneTextClass: () => toneTextClass
});
/**
* Application pipeline: the user-facing stage of each job application, the
* "ghosting radar" maths and the archive countdown. Pure module — no imports
* from server code, so both the dashboard and server functions can use it.
*/
var PIPELINE_STAGES = [
	{
		value: "draft",
		label: "Draft",
		hint: "Tailoring, not sent yet."
	},
	{
		value: "applied",
		label: "Applied",
		hint: "Sent — waiting for a reply."
	},
	{
		value: "interview",
		label: "Interview",
		hint: "They invited you to talk."
	},
	{
		value: "offer",
		label: "Got the job",
		hint: "Offer received. Congratulations."
	}
];
/** Closed stages live in the archive rather than the pipeline bar. */
var CLOSED_STAGES = [
	{
		value: "rejected",
		label: "Rejected"
	},
	{
		value: "withdrawn",
		label: "No longer interested"
	},
	{
		value: "ghosted",
		label: "Ghosted"
	}
];
var ALL_STAGES = [...PIPELINE_STAGES.map((stage) => stage.value), ...CLOSED_STAGES.map((stage) => stage.value)];
function normalizeStage(value) {
	return ALL_STAGES.includes(value) ? value : "draft";
}
function isClosedStage(stage) {
	return CLOSED_STAGES.some((item) => item.value === normalizeStage(stage));
}
function stageLabel(stage) {
	const value = normalizeStage(stage);
	return [...PIPELINE_STAGES, ...CLOSED_STAGES].find((item) => item.value === value)?.label ?? "Draft";
}
var DAY_MS = 864e5;
/** Whole days elapsed since a timestamp; null when the date is unusable. */
function daysSince(value, now = Date.now()) {
	const stamp = typeof value === "string" ? Date.parse(value) : Number(value);
	if (!Number.isFinite(stamp)) return null;
	return Math.floor((now - stamp) / DAY_MS);
}
/** Whole days until a future timestamp (negative once it has passed). */
function daysUntil(value, now = Date.now()) {
	const days = daysSince(value, now);
	return days === null ? null : -days;
}
var DEFAULT_WINDOWS = {
	responseWindowDays: 21,
	ghostAfterDays: 45,
	archiveRetentionDays: 30,
	followupOffsetDays: 10
};
/**
* Rough chance the company still replies, decaying from 100% on the day you
* applied to near zero once the "considered dead" window is passed.
*/
function responseLikelihood(daysElapsed, windows = DEFAULT_WINDOWS) {
	if (!Number.isFinite(daysElapsed) || daysElapsed <= 0) return 100;
	const response = Math.max(1, windows.responseWindowDays);
	const dead = Math.max(response + 1, windows.ghostAfterDays);
	if (daysElapsed >= dead) return 3;
	if (daysElapsed <= response) return Math.round(100 - daysElapsed / response * 45);
	const ratio = (daysElapsed - response) / (dead - response);
	return Math.max(3, Math.round(55 - ratio * 52));
}
/** Everything the dashboard card needs to colour itself and explain why. */
function pipelineHealth(row, windows = DEFAULT_WINDOWS, now = Date.now()) {
	const stage = normalizeStage(row.stage);
	const daysApplied = daysSince(row.applied_at, now);
	const interviewInDays = row.interview_at ? daysUntil(row.interview_at, now) : null;
	const archiveDeletesInDays = row.archived_at ? Math.max(0, windows.archiveRetentionDays - (daysSince(row.archived_at, now) ?? 0)) : null;
	const base = {
		stage,
		daysApplied,
		likelihood: null,
		interviewInDays,
		archiveDeletesInDays
	};
	if (isClosedStage(stage)) return {
		...base,
		tone: "muted",
		sentence: archiveDeletesInDays === null ? stageLabel(stage) : `${stageLabel(stage)} · deletes in ${archiveDeletesInDays} day${archiveDeletesInDays === 1 ? "" : "s"}`
	};
	if (stage === "offer") return {
		...base,
		tone: "success",
		sentence: "You got the job — congratulations."
	};
	if (stage === "interview") {
		if (interviewInDays === null) return {
			...base,
			tone: "info",
			sentence: "Interview stage — add the date to get a countdown."
		};
		if (interviewInDays > 0) return {
			...base,
			tone: "info",
			sentence: `Interview in ${interviewInDays} day${interviewInDays === 1 ? "" : "s"} — practise the prep questions.`
		};
		if (interviewInDays === 0) return {
			...base,
			tone: "info",
			sentence: "Interview is today. Good luck."
		};
		return {
			...base,
			tone: "warn",
			sentence: `Interview was ${Math.abs(interviewInDays)} day${interviewInDays === -1 ? "" : "s"} ago — worth following up.`
		};
	}
	if (stage === "draft") return {
		...base,
		tone: "neutral",
		sentence: "Draft — not sent yet."
	};
	const elapsed = daysApplied ?? 0;
	const likelihood = responseLikelihood(elapsed, windows);
	const ratio = elapsed / Math.max(1, windows.responseWindowDays);
	const dayText = `Applied ${elapsed} day${elapsed === 1 ? "" : "s"} ago`;
	if (elapsed >= windows.ghostAfterDays) return {
		...base,
		likelihood,
		tone: "danger",
		sentence: `${dayText} · likely ghosted (${likelihood}% chance of a reply)`
	};
	if (ratio >= 1) return {
		...base,
		likelihood,
		tone: "danger",
		sentence: `${dayText} · past the usual ${windows.responseWindowDays}-day reply window (${likelihood}% chance of a reply)`
	};
	if (ratio >= .6) return {
		...base,
		likelihood,
		tone: "warn",
		sentence: `${dayText} · most companies reply within ${windows.responseWindowDays} days (${likelihood}% chance of a reply)`
	};
	return {
		...base,
		likelihood,
		tone: "ok",
		sentence: `${dayText} · on track (${likelihood}% chance of a reply)`
	};
}
/** Tailwind classes for the coloured left edge of a card. */
function toneEdgeClass(tone) {
	switch (tone) {
		case "ok": return "border-l-4 border-l-primary";
		case "warn": return "border-l-4 border-l-amber-500";
		case "danger": return "border-l-4 border-l-destructive";
		case "info": return "border-l-4 border-l-sky-500";
		case "success": return "border-l-4 border-l-emerald-500";
		case "muted": return "border-l-4 border-l-muted opacity-80";
		default: return "border-l-4 border-l-border";
	}
}
function toneTextClass(tone) {
	switch (tone) {
		case "warn": return "text-amber-600 dark:text-amber-400";
		case "danger": return "text-destructive";
		case "info": return "text-sky-600 dark:text-sky-400";
		case "success": return "text-emerald-600 dark:text-emerald-400";
		case "ok": return "text-primary";
		default: return "text-muted-foreground";
	}
}
/** Suggested follow-up date, `followupOffsetDays` after applying. */
function suggestedFollowUp(appliedAt, windows = DEFAULT_WINDOWS) {
	const stamp = typeof appliedAt === "string" ? Date.parse(appliedAt) : Number(appliedAt);
	if (!Number.isFinite(stamp)) return null;
	return new Date(stamp + Math.max(1, windows.followupOffsetDays) * DAY_MS).toISOString();
}
function matchesFilter(row, filter, windows = DEFAULT_WINDOWS, now = Date.now()) {
	const stage = normalizeStage(row.stage);
	const closed = isClosedStage(stage) || Boolean(row.archived_at);
	if (filter === "all") return true;
	if (filter === "archive") return closed;
	if (closed) return false;
	if (filter === "draft") return stage === "draft";
	if (filter === "interviewing") return stage === "interview";
	if (filter === "active") return stage === "applied" || stage === "interview";
	if (stage !== "applied") return false;
	const health = pipelineHealth(row, windows, now);
	return health.tone === "warn" || health.tone === "danger";
}
//#endregion
export { pipelineHealth as a, toneEdgeClass as c, matchesFilter as i, toneTextClass as l, PIPELINE_STAGES as n, pipeline_exports as o, daysUntil as r, stageLabel as s, CLOSED_STAGES as t };
