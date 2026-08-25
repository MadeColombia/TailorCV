/**
 * Application pipeline: the user-facing stage of each job application, the
 * "ghosting radar" maths and the archive countdown. Pure module — no imports
 * from server code, so both the dashboard and server functions can use it.
 */

export const PIPELINE_STAGES = [
  { value: "draft", label: "Draft", hint: "Tailoring, not sent yet." },
  { value: "applied", label: "Applied", hint: "Sent — waiting for a reply." },
  { value: "interview", label: "Interview", hint: "They invited you to talk." },
  {
    value: "offer",
    label: "Got the job",
    hint: "Offer received. Congratulations.",
  },
] as const;

/** Closed stages live in the archive rather than the pipeline bar. */
export const CLOSED_STAGES = [
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "No longer interested" },
  { value: "ghosted", label: "Ghosted" },
] as const;

export type PipelineStage =
  | (typeof PIPELINE_STAGES)[number]["value"]
  | (typeof CLOSED_STAGES)[number]["value"];

const ALL_STAGES: PipelineStage[] = [
  ...PIPELINE_STAGES.map((stage) => stage.value),
  ...CLOSED_STAGES.map((stage) => stage.value),
];

export function normalizeStage(value: unknown): PipelineStage {
  return ALL_STAGES.includes(value as PipelineStage)
    ? (value as PipelineStage)
    : "draft";
}

export function isClosedStage(stage: unknown): boolean {
  return CLOSED_STAGES.some((item) => item.value === normalizeStage(stage));
}

export function stageLabel(stage: unknown): string {
  const value = normalizeStage(stage);
  return (
    [...PIPELINE_STAGES, ...CLOSED_STAGES].find((item) => item.value === value)
      ?.label ?? "Draft"
  );
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days elapsed since a timestamp; null when the date is unusable. */
export function daysSince(
  value: unknown,
  now: number = Date.now(),
): number | null {
  const stamp = typeof value === "string" ? Date.parse(value) : Number(value);
  if (!Number.isFinite(stamp)) return null;
  return Math.floor((now - stamp) / DAY_MS);
}

/** Whole days until a future timestamp (negative once it has passed). */
export function daysUntil(
  value: unknown,
  now: number = Date.now(),
): number | null {
  const days = daysSince(value, now);
  return days === null ? null : -days;
}

export type TrackingWindows = {
  responseWindowDays: number;
  ghostAfterDays: number;
  archiveRetentionDays: number;
  followupOffsetDays: number;
};

export const DEFAULT_WINDOWS: TrackingWindows = {
  responseWindowDays: 21,
  ghostAfterDays: 45,
  archiveRetentionDays: 30,
  followupOffsetDays: 10,
};

/**
 * Rough chance the company still replies, decaying from 100% on the day you
 * applied to near zero once the "considered dead" window is passed.
 */
export function responseLikelihood(
  daysElapsed: number,
  windows: TrackingWindows = DEFAULT_WINDOWS,
): number {
  if (!Number.isFinite(daysElapsed) || daysElapsed <= 0) return 100;
  const response = Math.max(1, windows.responseWindowDays);
  const dead = Math.max(response + 1, windows.ghostAfterDays);
  if (daysElapsed >= dead) return 3;
  if (daysElapsed <= response) {
    // Gentle slope down to 55% across the normal reply window.
    return Math.round(100 - (daysElapsed / response) * 45);
  }
  const ratio = (daysElapsed - response) / (dead - response);
  return Math.max(3, Math.round(55 - ratio * 52));
}

export type PipelineTone =
  "neutral" | "ok" | "warn" | "danger" | "info" | "success" | "muted";

export type PipelineHealth = {
  stage: PipelineStage;
  tone: PipelineTone;
  /** Plain sentence for the card — never jargon. */
  sentence: string;
  daysApplied: number | null;
  likelihood: number | null;
  interviewInDays: number | null;
  archiveDeletesInDays: number | null;
};

export type PipelineRow = {
  stage?: unknown;
  applied_at?: unknown;
  interview_at?: unknown;
  archived_at?: unknown;
  next_action_at?: unknown;
};

/** Everything the dashboard card needs to colour itself and explain why. */
export function pipelineHealth(
  row: PipelineRow,
  windows: TrackingWindows = DEFAULT_WINDOWS,
  now: number = Date.now(),
): PipelineHealth {
  const stage = normalizeStage(row.stage);
  const daysApplied = daysSince(row.applied_at, now);
  const interviewInDays = row.interview_at
    ? daysUntil(row.interview_at, now)
    : null;
  const archiveDeletesInDays = row.archived_at
    ? Math.max(
        0,
        windows.archiveRetentionDays - (daysSince(row.archived_at, now) ?? 0),
      )
    : null;

  const base = {
    stage,
    daysApplied,
    likelihood: null as number | null,
    interviewInDays,
    archiveDeletesInDays,
  };

  if (isClosedStage(stage)) {
    return {
      ...base,
      tone: "muted",
      sentence:
        archiveDeletesInDays === null
          ? stageLabel(stage)
          : `${stageLabel(stage)} · deletes in ${archiveDeletesInDays} day${archiveDeletesInDays === 1 ? "" : "s"}`,
    };
  }

  if (stage === "offer") {
    return {
      ...base,
      tone: "success",
      sentence: "You got the job — congratulations.",
    };
  }

  if (stage === "interview") {
    if (interviewInDays === null) {
      return {
        ...base,
        tone: "info",
        sentence: "Interview stage — add the date to get a countdown.",
      };
    }
    if (interviewInDays > 0) {
      return {
        ...base,
        tone: "info",
        sentence: `Interview in ${interviewInDays} day${interviewInDays === 1 ? "" : "s"} — practise the prep questions.`,
      };
    }
    if (interviewInDays === 0) {
      return {
        ...base,
        tone: "info",
        sentence: "Interview is today. Good luck.",
      };
    }
    return {
      ...base,
      tone: "warn",
      sentence: `Interview was ${Math.abs(interviewInDays)} day${interviewInDays === -1 ? "" : "s"} ago — worth following up.`,
    };
  }

  if (stage === "draft") {
    return { ...base, tone: "neutral", sentence: "Draft — not sent yet." };
  }

  // Applied: the ghosting radar.
  const elapsed = daysApplied ?? 0;
  const likelihood = responseLikelihood(elapsed, windows);
  const ratio = elapsed / Math.max(1, windows.responseWindowDays);
  const dayText = `Applied ${elapsed} day${elapsed === 1 ? "" : "s"} ago`;

  if (elapsed >= windows.ghostAfterDays) {
    return {
      ...base,
      likelihood,
      tone: "danger",
      sentence: `${dayText} · likely ghosted (${likelihood}% chance of a reply)`,
    };
  }
  if (ratio >= 1) {
    return {
      ...base,
      likelihood,
      tone: "danger",
      sentence: `${dayText} · past the usual ${windows.responseWindowDays}-day reply window (${likelihood}% chance of a reply)`,
    };
  }
  if (ratio >= 0.6) {
    return {
      ...base,
      likelihood,
      tone: "warn",
      sentence: `${dayText} · most companies reply within ${windows.responseWindowDays} days (${likelihood}% chance of a reply)`,
    };
  }
  return {
    ...base,
    likelihood,
    tone: "ok",
    sentence: `${dayText} · on track (${likelihood}% chance of a reply)`,
  };
}

/** Tailwind classes for the coloured left edge of a card. */
export function toneEdgeClass(tone: PipelineTone): string {
  switch (tone) {
    case "ok":
      return "border-l-4 border-l-primary";
    case "warn":
      return "border-l-4 border-l-amber-500";
    case "danger":
      return "border-l-4 border-l-destructive";
    case "info":
      return "border-l-4 border-l-sky-500";
    case "success":
      return "border-l-4 border-l-emerald-500";
    case "muted":
      return "border-l-4 border-l-muted opacity-80";
    default:
      return "border-l-4 border-l-border";
  }
}

export function toneTextClass(tone: PipelineTone): string {
  switch (tone) {
    case "warn":
      return "text-amber-600 dark:text-amber-400";
    case "danger":
      return "text-destructive";
    case "info":
      return "text-sky-600 dark:text-sky-400";
    case "success":
      return "text-emerald-600 dark:text-emerald-400";
    case "ok":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

/** Suggested follow-up date, `followupOffsetDays` after applying. */
export function suggestedFollowUp(
  appliedAt: unknown,
  windows: TrackingWindows = DEFAULT_WINDOWS,
): string | null {
  const stamp =
    typeof appliedAt === "string" ? Date.parse(appliedAt) : Number(appliedAt);
  if (!Number.isFinite(stamp)) return null;
  return new Date(
    stamp + Math.max(1, windows.followupOffsetDays) * DAY_MS,
  ).toISOString();
}

/** True when an archived row has outlived the retention window. */
export function archiveExpired(
  archivedAt: unknown,
  windows: TrackingWindows = DEFAULT_WINDOWS,
  now: number = Date.now(),
): boolean {
  const days = daysSince(archivedAt, now);
  return days !== null && days >= Math.max(1, windows.archiveRetentionDays);
}

export type PipelineFilter =
  "all" | "active" | "draft" | "interviewing" | "risk" | "archive";

export function matchesFilter(
  row: PipelineRow,
  filter: PipelineFilter,
  windows: TrackingWindows = DEFAULT_WINDOWS,
  now: number = Date.now(),
): boolean {
  const stage = normalizeStage(row.stage);
  const closed = isClosedStage(stage) || Boolean(row.archived_at);
  if (filter === "all") return true;
  if (filter === "archive") return closed;
  if (closed) return false;
  if (filter === "draft") return stage === "draft";
  if (filter === "interviewing") return stage === "interview";
  // Active: sent and still moving (applied or interviewing).
  if (filter === "active") return stage === "applied" || stage === "interview";
  // At risk: applied and past 60% of the reply window.
  if (stage !== "applied") return false;
  const health = pipelineHealth(row, windows, now);
  return health.tone === "warn" || health.tone === "danger";
}
