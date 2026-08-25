//#region src/lib/notifications.ts
var STORAGE_KEY = "tailorcv.notifications";
var NOTIFICATION_EVENTS = [
	{
		key: "cv_tailored",
		label: "CV tailored",
		description: "When a tailored CV finishes generating."
	},
	{
		key: "cover_letter",
		label: "Cover letter ready",
		description: "When a cover letter finishes generating."
	},
	{
		key: "interview_prep",
		label: "Interview prep ready",
		description: "When screening questions and answers are drafted."
	},
	{
		key: "offer_analyzed",
		label: "Job offer analysed",
		description: "When a pasted job link has been read successfully."
	},
	{
		key: "errors",
		label: "Errors and failures",
		description: "Unreachable job links, failed generations and other problems."
	}
];
var defaultNotificationPrefs = {
	enabled: false,
	cv_tailored: true,
	cover_letter: true,
	interview_prep: true,
	offer_analyzed: true,
	errors: true
};
function loadNotificationPrefs() {
	if (typeof window === "undefined") return defaultNotificationPrefs;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultNotificationPrefs;
		const parsed = JSON.parse(raw);
		return {
			...defaultNotificationPrefs,
			...parsed
		};
	} catch {
		return defaultNotificationPrefs;
	}
}
function saveNotificationPrefs(prefs) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
function notificationsSupported() {
	return typeof window !== "undefined" && "Notification" in window;
}
async function requestNotificationPermission() {
	if (!notificationsSupported()) return "denied";
	return Notification.requestPermission();
}
/** Fire a browser notification when the user opted in for that event type. */
function notify(event, title, body) {
	if (!notificationsSupported()) return;
	const prefs = loadNotificationPrefs();
	if (!prefs.enabled || !prefs[event]) return;
	if (Notification.permission !== "granted") return;
	try {
		new Notification(title, {
			body: body ?? "",
			tag: `tailorcv-${event}`,
			icon: "/favicon.ico"
		});
	} catch {}
}
//#endregion
export { notify as a, notificationsSupported as i, defaultNotificationPrefs as n, requestNotificationPermission as o, loadNotificationPrefs as r, saveNotificationPrefs as s, NOTIFICATION_EVENTS as t };
