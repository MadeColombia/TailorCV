/**
 * Browser notifications for long-running work (tailoring, cover letters,
 * interview prep) and for failures such as an unreachable job-offer URL.
 * Preferences live in localStorage — nothing is sent to a server.
 */

export type NotificationEvent =
  | "cv_tailored"
  | "cover_letter"
  | "interview_prep"
  | "offer_analyzed"
  | "errors";

export type NotificationPrefs = Record<NotificationEvent, boolean> & { enabled: boolean };

const STORAGE_KEY = "tailorcv.notifications";

export const NOTIFICATION_EVENTS: Array<{
  key: NotificationEvent;
  label: string;
  description: string;
}> = [
  { key: "cv_tailored", label: "CV tailored", description: "When a tailored CV finishes generating." },
  { key: "cover_letter", label: "Cover letter ready", description: "When a cover letter finishes generating." },
  { key: "interview_prep", label: "Interview prep ready", description: "When screening questions and answers are drafted." },
  { key: "offer_analyzed", label: "Job offer analysed", description: "When a pasted job link has been read successfully." },
  { key: "errors", label: "Errors and failures", description: "Unreachable job links, failed generations and other problems." },
];

export const defaultNotificationPrefs: NotificationPrefs = {
  enabled: false,
  cv_tailored: true,
  cover_letter: true,
  interview_prep: true,
  offer_analyzed: true,
  errors: true,
};

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return defaultNotificationPrefs;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultNotificationPrefs;
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return { ...defaultNotificationPrefs, ...parsed };
  } catch {
    return defaultNotificationPrefs;
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  return Notification.requestPermission();
}

/** Fire a browser notification when the user opted in for that event type. */
export function notify(event: NotificationEvent, title: string, body?: string) {
  if (!notificationsSupported()) return;
  const prefs = loadNotificationPrefs();
  if (!prefs.enabled || !prefs[event]) return;
  if (Notification.permission !== "granted") return;
  try {
    // eslint-disable-next-line no-new
    new Notification(title, { body: body ?? "", tag: `tailorcv-${event}`, icon: "/favicon.ico" });
  } catch {
    /* notification API can throw on some platforms; ignore */
  }
}
