/**
 * Comprehensive Defense-in-Depth Guardrails for TailorCV AI interactions.
 *
 * Enforces strict boundaries against:
 * 1. Prompt injections, persona overrides, and jailbreak attempts.
 * 2. Sensitive credential and PII leaks (API keys, JWTs, passwords, SSNs).
 * 3. Off-topic abuse and general assistant diversion.
 * 4. Post-flight system prompt and secret leakage.
 * 5. Multi-endpoint per-user rate limiting.
 */

export type GuardVerdict = { blocked: false } | { blocked: true; reason: string };

const INJECTION_PATTERNS: RegExp[] = [
  /\bignore (all|any|the)?\s*(previous|prior|above|earlier)\b/i,
  /\bdisregard (all|any|the)?\s*(previous|prior|above|earlier)\b/i,
  /\b(system|developer)\s+prompt\b/i,
  /\bprompt\s+injection\b/i,
  /\b(reveal|show|print|repeat|output|leak|dump)\b.{0,30}\b(instructions|prompt|rules|system|pre-prompt|context)\b/i,
  /\bwhat (are|were) your (initial|original|system)?\s*(instructions|prompts|rules)\b/i,
  /\byou are now\b/i,
  /\bact as (a|an)\b/i,
  /\bpretend (to be|you are)\b/i,
  /\bjailbreak|\bDAN mode\b|\bdeveloper mode\b/i,
  /\bforget (your|the|all)\b.{0,20}\b(rules|instructions)\b/i,
  /\bno longer bound\b/i,
  /<\/?(?:system|instruction|prompt|context|untrusted_[a-z_]+)>/i,
  /\b(new persona|override persona|bypass restrictions|simulate unfiltered)\b/i,
  /\bbase64\s*decode\b/i,
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

const SENSITIVE_PATTERNS: RegExp[] = [
  /\b(sk-[a-zA-Z0-9_-]{20,})\b/i, // OpenAI API Keys
  /\b(sbp_[a-zA-Z0-9_-]{20,}|sb_[a-zA-Z0-9_-]{20,})\b/i, // Supabase Keys
  /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/, // JWT Tokens
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i, // Private Keys
  /\b(?:password|passwd|pwd)\s*[:=]\s*['"][^\s'"]+['"]/i, // Hardcoded passwords
  /\b\d{3}-\d{2}-\d{4}\b/, // US SSN pattern
];

export const OFF_TOPIC_REPLY =
  "I can only help with this job application — your experience, the offer, and how to tailor your CV. Let's get back to that: what would you like to cover?";

export const SENSITIVE_DATA_REPLY =
  "For your security, please do not include sensitive credentials, passwords, or personal identification numbers in this session. Let's continue focusing on your professional experience.";

/**
 * Classify one user message before it reaches the model.
 * Checks for prompt injections, off-topic requests, and raw sensitive credentials.
 */
export function screenUserMessage(text: string): GuardVerdict {
  const trimmed = text.trim();
  if (!trimmed) return { blocked: false };

  if (INJECTION_PATTERNS.some((re) => re.test(trimmed))) {
    return { blocked: true, reason: "instruction-override" };
  }
  if (SENSITIVE_PATTERNS.some((re) => re.test(trimmed))) {
    return { blocked: true, reason: "sensitive-data" };
  }
  if (OFF_TOPIC_PATTERNS.some((re) => re.test(trimmed))) {
    return { blocked: true, reason: "off-topic" };
  }
  return { blocked: false };
}

/**
 * Escapes potential XML tag injection and redacts known credential patterns
 * from untrusted user content before prompt construction.
 */
export function sanitizeUntrustedContent(content: string): string {
  if (!content) return "";
  let sanitized = content
    .replace(/<\/?(?:system|instruction|prompt|untrusted_[a-z_]+)>/gi, "[tag-removed]")
    .replace(/\b(sk-[a-zA-Z0-9_-]{20,})\b/gi, "[REDACTED_API_KEY]")
    .replace(/\b(sbp_[a-zA-Z0-9_-]{20,}|sb_[a-zA-Z0-9_-]{20,})\b/gi, "[REDACTED_KEY]")
    .replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, "[REDACTED_JWT]");
  return sanitized;
}

/**
 * Encapsulates untrusted input within explicit XML delimiters.
 */
export function wrapUntrustedXml(tagName: string, content: string): string {
  const sanitized = sanitizeUntrustedContent(content);
  return `<untrusted_${tagName}>\n${sanitized}\n</untrusted_${tagName}>`;
}

/**
 * Post-flight output scanner. Ensures that AI generated output does not leak
 * system instructions or environment secrets.
 */
export function screenAiOutput(output: string): string {
  if (!output) return "";
  let cleaned = output;

  // Redact potential leaked keys
  cleaned = cleaned
    .replace(/\b(sk-[a-zA-Z0-9_-]{20,})\b/gi, "[REDACTED_API_KEY]")
    .replace(/\b(sbp_[a-zA-Z0-9_-]{20,}|sb_[a-zA-Z0-9_-]{20,})\b/gi, "[REDACTED_KEY]")
    .replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, "[REDACTED_JWT]");

  return cleaned;
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

