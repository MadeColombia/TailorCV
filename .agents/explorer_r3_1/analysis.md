# Technical Analysis: AI Rate Limits, Token Controls & Cost Management

**Target System**: TailorCV Full-Stack Web Application  
**Investigation Scope**: Requirement R3 — AI Rate Limits & Cost Control  
**Auditor**: Explorer 3  
**Date**: 2026-08-24  

---

## 1. Executive Summary & Verdict

| Assessment Dimension | Status | Summary Finding |
| :--- | :---: | :--- |
| **Overall Rate Limiting** | ⚠️ **PARTIAL** | Implemented strictly on `POST /api/chat` using an in-memory fixed-window per-user counter; **COMPLETELY MISSING** on all 10 non-chat AI server functions. |
| **Storage Architecture** | ⚠️ **IN-MEMORY ONLY** | Process-local `Map` in `src/routes/api/chat.ts`. Ineffective in multi-instance, serverless, or edge deployments (e.g. Nitro/Cloudflare/replicas). |
| **Token Limit Controls (`max_tokens`)** | ❌ **MISSING** | Neither `streamText` in `src/routes/api/chat.ts` nor `callGateway` in `src/lib/ai-gateway.server.ts` passes `max_tokens` / `maxOutputTokens` to the LLM API. |
| **Input Budget & Truncation** | ✅ **PRESENT (ROBUST)** | Strict message limits (60 messages), character limits (6,000 chars/message part), and input document caps (30k/60k chars) exist. |
| **Authentication & Gatekeeping** | ✅ **PRESENT (STRICT)** | All AI endpoints and server functions require valid Supabase JWT Bearer authentication; no anonymous access. |
| **Local Pre-Flight Guardrails** | ✅ **PRESENT (FOR CHAT)** | Regex-based screening blocks prompt injections and off-topic requests before invoking the LLM API. |
| **Token Accounting & Telemetry** | ⚠️ **PARTIAL** | `ai_usage` table exists, but streaming chat (`POST /api/chat`) and 5 out of 10 AI server functions fail to record usage. |

---

## 2. Complete Inventory of AI Endpoints & Functions

The TailorCV application invokes OpenAI LLM models across **1 HTTP API route** and **10 server functions / background helpers** (via `callGateway`).

| # | Endpoint / Function | File Location | AI Invocation Method | Model | Auth Gate | Rate Limiting | `max_tokens` Set? | Usage Logged (`ai_usage`)? |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **1** | `POST /api/chat` | `src/routes/api/chat.ts:38-186` | `streamText` (`ai` SDK) | `gpt-5.6-luna` | `createUserScopedClient` (Bearer JWT) | ✅ **Present** (In-Memory 30/10min) | ❌ **No** | ❌ **No** (Streaming unlogged) |
| **2** | `tailorCv` | `src/lib/applications.functions.ts:215-297` | `callGateway` (JSON) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ✅ **Yes** (`tailor_cv`) |
| **3** | `generateCoverLetter` | `src/lib/applications.functions.ts:299-342` | `callGateway` (Text) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ✅ **Yes** (`cover_letter`) |
| **4** | `generateInterviewPrep` | `src/lib/applications.functions.ts:345-410` | `callGateway` (JSON) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ✅ **Yes** (`interview_prep`) |
| **5** | `changeApplicationLanguage` | `src/lib/applications.functions.ts:416-492` | `callGateway` (JSON) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ✅ **Yes** (`translate`) |
| **6** | `summariseOffer` | `src/lib/applications.functions.ts:629-662` | `callGateway` (JSON) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ✅ **Yes** (`offer_summary`) |
| **7** | `generateTargetCv` | `src/lib/targets.functions.ts:107-186` | `callGateway` (JSON) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ❌ **No** (`feature` omitted) |
| **8** | `analyzeOfferUrl` | `src/lib/offer.functions.ts:60-108` | `callGateway` (JSON) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ✅ **Yes** (`offer_analysis`) |
| **9** | `extractCvFromFile` | `src/lib/profile.functions.ts:108-138` | `callGateway` (Multimodal) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ❌ **No** (`feature` omitted) |
| **10** | `translateProfile` | `src/lib/profile.functions.ts:141-207` | `callGateway` (JSON) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ❌ **No** (`feature` omitted) |
| **11** | `uploadCandidateContext` | `src/lib/settings.functions.ts:66-113` | `callGateway` (Multimodal PDF) | `gpt-5.6-luna` | `requireSupabaseAuth` | ❌ **Missing** | ❌ **No** | ❌ **No** (`feature` omitted) |
| **12** | `mergeAnswerIntoDossier` | `src/lib/dossier.server.ts:98-144` | `callGateway` (Text) | `gpt-5.6-luna` | Inherited from `rememberAnswer` | ❌ **Missing** | ❌ **No** | ❌ **No** (`feature` omitted) |

---

## 3. Deep Dive: Rate Limiting Implementation

### 3.1 Chat Route Rate Limiter (`src/routes/api/chat.ts` & `src/lib/chat-guard.ts`)
The tailoring interview chat route enforces a per-user fixed-window rate limit:
```typescript
// src/routes/api/chat.ts:22-24
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const rateState: RateLimitState = new Map();

// Execution logic in handler (lines 73-95):
const now = Date.now();
pruneRateLimit(rateState, now);
const { loadSettings } = await import("@/lib/user-settings.server");
const settings = await loadSettings(supabase, userId);
const limit = checkRateLimit(
  rateState,
  userId,
  now,
  settings.sessionMessageCap || RATE_LIMIT,
  RATE_WINDOW_MS,
);
if (!limit.allowed) {
  return new Response(
    `You've hit your AI usage limit for this session (${settings.sessionMessageCap} messages). You can raise it in Settings, or wait a moment.`,
    {
      status: 429,
      headers: {
        "retry-after": String(limit.retryAfterSeconds),
        "cache-control": "no-store",
      },
    },
  );
}
```

#### Core Algorithm (`src/lib/chat-guard.ts:54-80`):
- Fixed Window: `checkRateLimit` initializes an entry `{ count: 1, resetAt: now + windowMs }` upon first message.
- Window expiry: Once `now >= entry.resetAt`, window resets.
- Pruning: `pruneRateLimit` deletes expired entries to prevent memory leaks.
- User-level customization: Users can customize `sessionMessageCap` in user settings between `5` and `200` (bounded by `SESSION_CAP_MIN` and `SESSION_CAP_MAX` in `src/lib/user-settings.ts:76-77`).

### 3.2 Key Architectural Vulnerabilities & Rate Limiting Gaps

1. **Process-Local Memory (`Map`) in Serverless / Multi-Instance Deployments**:
   - `rateState` resides in Node.js heap memory (`new Map()`).
   - In horizontally scaled containers, serverless platforms (e.g. Nitro on Vercel, Netlify, Cloudflare Workers), or rolling deployments, memory is not shared between instances. A client can cycle requests across instances, effectively multiplying or bypassing their rate limit.
   - Restarts or cold starts wipe the rate limit counter entirely.

2. **Total Absence of Rate Limiting on One-Shot AI Functions**:
   - None of the 10 server functions in `src/lib/applications.functions.ts`, `src/lib/targets.functions.ts`, `src/lib/profile.functions.ts`, `src/lib/offer.functions.ts`, or `src/lib/settings.functions.ts` check `checkRateLimit` or any rate limiting middleware.
   - An authenticated user or automated script can invoke `tailorCv`, `generateCoverLetter`, `generateInterviewPrep`, or `extractCvFromFile` thousands of times continuously, depleting the organization's OpenAI API credit quota within minutes.

3. **Absence of IP-Based Rate Limiting**:
   - Unauthenticated or malformed requests to `/api/chat` or other endpoints are rejected at the application level, but without an IP-based sliding window rate limiter or WAF, brute-force requests and denial-of-wallet / denial-of-service attempts can exhaust server compute.

---

## 4. Deep Dive: Token Limit & Input Budget Controls

### 4.1 Missing Output Token Limits (`max_tokens` / `maxOutputTokens`)
- **`POST /api/chat` (`src/routes/api/chat.ts:174-178`)**:
  ```typescript
  const result = streamText({
    model: gateway(CHAT_MODEL),
    system,
    messages: await convertToModelMessages(messages),
    // ⚠️ maxTokens / maxOutputTokens is NOT set!
  });
  ```
- **`callGateway` (`src/lib/ai-gateway.server.ts:59-74`)**:
  ```typescript
  export async function callGateway(
    messages: GatewayMessage[],
    options: { json?: boolean; feature?: string; userId?: string } = {},
  ): Promise<string> {
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${requireApiKey()}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
        // ⚠️ max_tokens / max_completion_tokens is NOT set!
      }),
    });
  ```
- **Risk**: Any generation can run until the default model maximum context or completion limit, risking unbounded completion token costs on runaway generation, JSON formatting loops, or adversarial completions.

### 4.2 Input Validation & Prompt Budgeting Controls (Present vs. Missing)

| Control Type | Location | Implementation | Verdict |
| :--- | :--- | :--- | :---: |
| **Chat Message History Count** | `src/routes/api/chat.ts:19, 53-55, 60` | Enforces `MAX_MESSAGES = 60`; rejects `> 60` with HTTP 400 and slices `messages.slice(-MAX_MESSAGES)`. | ✅ Strong |
| **Chat Message Length** | `src/routes/api/chat.ts:20, 63` | Truncates text part to `MAX_CHARS = 6000` chars (`slice(0, MAX_CHARS)`). | ✅ Strong |
| **Stored Knowledge Limit** | `src/lib/applications.server.ts:63` | Retrieves only the latest 80 candidate knowledge answers (`.limit(80)`). | ✅ Good |
| **Job Description Summarization** | `src/lib/applications.functions.ts:647` | Truncates raw offer text to 30,000 characters (`offerText.slice(0, 30000)`). | ✅ Good |
| **Job URL Scraping Input** | `src/lib/offer.functions.ts:71` | Slices extracted text to 60,000 characters (`text.slice(0, 60000)`). | ✅ Good |
| **Candidate Context Upload** | `src/lib/settings.functions.ts:76` | Slices filename to 200 chars; rejects base64 larger than 8MB (`base64.length > 8_000_000`). | ✅ Good |
| **Dossier Merge Input** | `src/lib/applications.functions.ts:188-189` | Slices question to 2,000 chars and answer to 4,000 chars. | ✅ Good |
| **Composite Master Profile Prompt Budget** | `src/lib/applications.functions.ts:245-283` | Entire profile JSON, draft CV JSON, transcript, dossier, and knowledge are concatenated without a composite token budget check. | ⚠️ Risk |

---

## 5. Deep Dive: Cost Control & Abuse Prevention

### 5.1 Local Pre-Flight Guardrails (`src/lib/chat-guard.ts`)
`screenUserMessage` intercepts user messages locally **before** contacting the LLM API:
- **Prompt Injection Defense** (`INJECTION_PATTERNS` lines 12-25): Regexes matching `ignore previous`, `disregard prior`, `system prompt`, `prompt injection`, `reveal instructions`, `you are now`, `act as`, `pretend to be`, `jailbreak`, `DAN mode`, `developer mode`, etc.
- **Off-Topic Abuse Defense** (`OFF_TOPIC_PATTERNS` lines 27-36): Regexes matching code generation (`write python script`, `build website`), shell command execution (`rm -rf`, `sudo`, `npm install`), general creative writing (`write poem`, `essay`), translation of foreign texts, homework, recipes, weather, and math equations.
- **Immediate Rejection**: If triggered, `POST /api/chat:104` immediately returns `textResponse(OFF_TOPIC_REPLY)` with HTTP 200, consuming **zero OpenAI tokens**.

### 5.2 Model Selection & Pricing Uniformity
- All features across the application use a single constant: `export const CHAT_MODEL = "gpt-5.6-luna"` (`src/lib/ai-gateway.server.ts:3`).
- **Cost Inefficiency**: Simpler tasks (e.g. `summariseOffer`, `translateProfile`, `interview_prep`, `changeApplicationLanguage`) utilize the same top-tier model as complex CV rewriting (`tailorCv`), resulting in unnecessarily high token costs for utility functions.

### 5.3 Token Usage Telemetry & Accounting Audit
The Supabase table `public.ai_usage` tracks prompt and completion tokens:
- **Table Definition** (`supabase/migrations/20260822183652_c4239b2e-37d9-4bd8-9632-1ca96e5baf63.sql:56-71`):
  - Columns: `id`, `user_id`, `feature`, `model`, `prompt_tokens`, `completion_tokens`, `total_tokens`, `created_at`.
  - Accessible to admins via `src/lib/admin.functions.ts:62-108`.

#### ⚠️ Critical Accounting Telemetry Gaps Identified:
1. **Streaming Chat (`POST /api/chat`) is NOT logged**:
   - `streamText` does not attach `onFinish` to record prompt or completion token counts to `public.ai_usage`. Chat is typically the largest token consumer in the app, yet it produces zero records in `ai_usage`.
2. **Missing `feature` / `userId` in Server Functions**:
   - `generateTargetCv` (`src/lib/targets.functions.ts:171`): calls `callGateway(..., { json: true })` without `feature` or `userId`.
   - `extractCvFromFile` (`src/lib/profile.functions.ts:135`): calls `callGateway(..., { json: true })` without `feature` or `userId`.
   - `translateProfile` (`src/lib/profile.functions.ts:176`): calls `callGateway(..., { json: true })` without `feature` or `userId`.
   - `uploadCandidateContext` (`src/lib/settings.functions.ts:86`): calls `callGateway(...)` without `feature` or `userId`.
   - `mergeAnswerIntoDossier` (`src/lib/dossier.server.ts:110`): calls `callGateway(...)` without `feature` or `userId`.
3. **No Automatic Budget Enforcement / Quotas**:
   - Logging is purely observational; there is no monthly per-user token quota or automatic lock when spending exceeds a threshold.

### 5.4 Test Suite Anomaly
- Running `npm run test` revealed an import failure in `src/lib/ai-gateway.server.test.ts`:
  - `src/lib/ai-gateway.server.ts:1` imports `@ai-sdk/openai`.
  - In `package.json`, `@ai-sdk/openai` is missing from `dependencies` (only `@ai-sdk/react` and `ai` are present).

---

## 6. Recommendations & Remediation Plan

### High Priority (Cost & Security Protection)
1. **Implement Global Rate Limiting across all AI Server Functions**:
   - Apply per-user rate limiting (e.g. 10 CV generations/day or 5 calls/minute) to `tailorCv`, `generateCoverLetter`, `generateInterviewPrep`, `extractCvFromFile`, `generateTargetCv`, and `translateProfile`.
2. **Set `max_tokens` / `maxOutputTokens` on all LLM calls**:
   - Pass explicit limits in `callGateway` (e.g. `max_tokens: 3000` for `tailor_cv`, `max_tokens: 800` for `cover_letter`, `max_tokens: 1500` for `interview_prep`, `max_tokens: 600` for `offer_summary`).
   - Pass `maxTokens` in `streamText` in `src/routes/api/chat.ts`.
3. **Transition Rate Limiting to Distributed Store**:
   - Replace the in-memory `Map` with Upstash Redis / Redis or Supabase RPC table counter so rate limits are shared across all server instances and persist across restarts.

### Medium Priority (Cost Optimization & Observability)
4. **Complete Usage Telemetry in `ai_usage`**:
   - Add `onFinish` callback to `streamText` in `/api/chat.ts` to log chat token consumption.
   - Add `feature` and `userId` parameters to all remaining 5 `callGateway` call sites (`generateTargetCv`, `extractCvFromFile`, `translateProfile`, `uploadCandidateContext`, `mergeAnswerIntoDossier`).
5. **Model Tiering for Secondary Features**:
   - Use a faster, cheaper model (e.g. `gpt-4o-mini` or equivalent) for `summariseOffer`, `analyzeOfferUrl`, `changeApplicationLanguage`, and `translateProfile`, reserving premium models for `tailorCv` and `chat`.
6. **Fix Missing Dependency in `package.json`**:
   - Add `@ai-sdk/openai` to `package.json` to resolve the test failure in `ai-gateway.server.test.ts`.

---
