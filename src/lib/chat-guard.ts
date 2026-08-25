/**
 * Guardrails for the tailoring interview chat.
 *
 * The chat spends AI credits, so it must stay on-task: it exists only to ask
 * the candidate about their experience for one job offer. These helpers block
 * the two cheap-to-detect abuses (prompt injection / instruction override, and
 * "use this as a general assistant" requests) and rate-limit each user.
 */

export type GuardVerdict = { blocked: false } | { blocked: true; reason: string };

const INJECTION_PATTERNS: RegExp[] = [
  /\bignore (all|any|the)?\s*(previous|prior|above|earlier)\b/i,
  /\bdisregard (all|any|the)?\s*(previous|prior|above|earlier)\b/i,
  /\b(system|developer)\s+prompt\b/i,
  /\bprompt\s+injection\b/i,
  /\b(reveal|show|print|repeat|output)\b.{0,30}\b(instructions|prompt|rules)\b/i,
  /\byou are now\b/i,
  /\bact as (a|an)\b/i,
  /\bpretend (to be|you are)\b/i,
  /\bjailbreak|\bDAN mode\b/i,
  /\bforget (your|the|all)\b.{0,20}\b(rules|instructions)\b/i,
  /\bno longer bound\b/i,
  /\bdeveloper mode\b/i,
];

const OFF_TOPIC_PATTERNS: RegExp[] = [
  /\b(write|generate|create|build|give me)\b.{0,40}\b(script|program|code|function|app|website|sql query|regex)\b/i,
  /\b(run|execute|exec|eval)\b.{0,20}\b(command|shell|bash|code|script|this)\b/i,
  /\b(curl|wget|rm -rf|sudo|npm install|pip install|SELECT \* FROM|DROP TABLE)\b/i,
  /\bwrite (me )?(a )?(poem|song|story|essay|joke|novel)\b/i,
  /\b(translate|summari[sz]e) (this|the following) (article|text|book|page)\b/i,
  /\b(homework|recipe|workout plan|travel itinerary|horoscope)\b/i,
  /\bwhat('| i)s the weather\b/i,
  /\bsolve\b.{0,20}\b(math|equation)\b/i,
];

export const OFF_TOPIC_REPLY =
  "I can only help with this job application — your experience, the offer, and how to tailor your CV. Let's get back to that: what would you like to cover?";

/** Classify one user message before it ever reaches the model. */
export function screenUserMessage(text: string): GuardVerdict {
  const trimmed = text.trim();
  if (!trimmed) return { blocked: false };
  if (INJECTION_PATTERNS.some((re) => re.test(trimmed))) {
    return { blocked: true, reason: "instruction-override" };
  }
  if (OFF_TOPIC_PATTERNS.some((re) => re.test(trimmed))) {
    return { blocked: true, reason: "off-topic" };
  }
  return { blocked: false };
}

/** Simple fixed-window per-user rate limit, so one account can't drain credits. */
export type RateLimitState = Map<string, { count: number; resetAt: number }>;

export function checkRateLimit(
  state: RateLimitState,
  key: string,
  now: number,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const entry = state.get(key);
  if (!entry || now >= entry.resetAt) {
    state.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Drop stale windows so the map can't grow unbounded. */
export function pruneRateLimit(state: RateLimitState, now: number) {
  for (const [key, entry] of state) if (now >= entry.resetAt) state.delete(key);
}
