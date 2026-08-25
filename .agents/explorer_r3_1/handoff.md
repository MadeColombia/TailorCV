# Handoff Report: Requirement R3 — AI Rate Limits & Cost Control

**Agent**: Explorer 3  
**Working Directory**: `/Users/madecolombia/Developer/TailorCV/.agents/explorer_r3_1`  
**Target Milestone**: R3 (AI Rate Limits & Cost Control Audit)  
**Date**: 2026-08-24  

---

## 1. Observation

### 1.1 Chat API Route & Rate Limiting
- **File**: `src/routes/api/chat.ts`
  - Lines 22-24:
    ```typescript
    const RATE_LIMIT = 30;
    const RATE_WINDOW_MS = 10 * 60 * 1000;
    const rateState: RateLimitState = new Map();
    ```
  - Lines 72-95:
    ```typescript
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
  - Lines 174-178:
    ```typescript
    const result = streamText({
      model: gateway(CHAT_MODEL),
      system,
      messages: await convertToModelMessages(messages),
    });
    ```
    `maxTokens` or `maxOutputTokens` is omitted.

### 1.2 Rate Limiting Helper Implementation
- **File**: `src/lib/chat-guard.ts`
  - Lines 54-80:
    ```typescript
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
    ```

### 1.3 AI Gateway & Uncapped Completions
- **File**: `src/lib/ai-gateway.server.ts`
  - Lines 3: `export const CHAT_MODEL = "gpt-5.6-luna";`
  - Lines 69-74:
    ```typescript
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
    ```
    No `max_tokens` or `max_completion_tokens` parameter is included.

### 1.4 Non-Chat AI Server Functions Missing Rate Limiting & Usage Logging
10 server functions call `callGateway` without checking `checkRateLimit`:
1. `tailorCv` (`src/lib/applications.functions.ts:215-297`) — Rate limit: None, Usage: logged (`tailor_cv`).
2. `generateCoverLetter` (`src/lib/applications.functions.ts:299-342`) — Rate limit: None, Usage: logged (`cover_letter`).
3. `generateInterviewPrep` (`src/lib/applications.functions.ts:345-410`) — Rate limit: None, Usage: logged (`interview_prep`).
4. `changeApplicationLanguage` (`src/lib/applications.functions.ts:416-492`) — Rate limit: None, Usage: logged (`translate`).
5. `summariseOffer` (`src/lib/applications.functions.ts:629-662`) — Rate limit: None, Usage: logged (`offer_summary`).
6. `generateTargetCv` (`src/lib/targets.functions.ts:107-186`) — Rate limit: None, Usage: **omitted** (`{ json: true }` only).
7. `analyzeOfferUrl` (`src/lib/offer.functions.ts:60-108`) — Rate limit: None, Usage: logged (`offer_analysis`).
8. `extractCvFromFile` (`src/lib/profile.functions.ts:108-138`) — Rate limit: None, Usage: **omitted**.
9. `translateProfile` (`src/lib/profile.functions.ts:141-207`) — Rate limit: None, Usage: **omitted**.
10. `uploadCandidateContext` (`src/lib/settings.functions.ts:66-113`) — Rate limit: None, Usage: **omitted**.
11. `mergeAnswerIntoDossier` (`src/lib/dossier.server.ts:98-144`) — Rate limit: None, Usage: **omitted**.

### 1.5 Unit Test Output
- Running `npm run test` (`vitest run`) resulted in:
  - 13 test files passed (90 tests).
  - 1 test file failed: `src/lib/ai-gateway.server.test.ts` with verbatim error:
    `Error: Cannot find package '@ai-sdk/openai' imported from '/Users/madecolombia/Developer/TailorCV/src/lib/ai-gateway.server.ts'`
  - Confirmed `@ai-sdk/openai` is missing from `package.json` dependencies.

---

## 2. Logic Chain

1. **Rate Limiting Assessment**:
   - *Premise*: Rate limiting is evaluated on whether user actions that incur AI costs are restricted per user / IP over time.
   - *Observation*: `POST /api/chat` calls `checkRateLimit(rateState, userId, ...)` with a fixed 10-minute window and per-user message cap (`src/routes/api/chat.ts:77-95`).
   - *Observation*: The other 10 server functions (`tailorCv`, `generateCoverLetter`, `generateInterviewPrep`, etc.) make direct calls to `callGateway` without checking `rateState` or any rate limit mechanism.
   - *Deduction*: Rate limiting is **PARTIAL** across the system (present only on chat, absent on all generation/translation/extraction functions).

2. **Storage Architecture Assessment**:
   - *Observation*: `rateState` is instantiated as `new Map()` in module scope (`src/routes/api/chat.ts:24`).
   - *Deduction*: In-memory state is isolated per process/worker and wiped on process restart, making it vulnerable to rate-limit bypass in multi-instance or serverless environments.

3. **Token Limit Control Assessment**:
   - *Observation*: `streamText` in `src/routes/api/chat.ts:174` and `fetch` body in `src/lib/ai-gateway.server.ts:69` omit `max_tokens` / `maxOutputTokens`.
   - *Deduction*: Token limits on LLM completions are **MISSING**.
   - *Observation*: Input message count is bounded to 60 (`MAX_MESSAGES`), message text parts to 6,000 chars (`MAX_CHARS`), and raw input documents to 30,000–60,000 chars.
   - *Deduction*: Input budget controls are **PRESENT**.

4. **Cost Control & Abuse Prevention Assessment**:
   - *Observation*: All routes/functions enforce Supabase JWT Bearer authentication; unauthenticated calls return 401.
   - *Observation*: `screenUserMessage` intercepts prompt injection and off-topic requests locally before invoking the LLM.
   - *Observation*: `ai_usage` table exists, but streaming chat and 5 server functions do not write records.
   - *Deduction*: Authentication and pre-flight abuse guards are **PRESENT**, while usage telemetry is **PARTIAL** and model tiering is **MISSING** (single `gpt-5.6-luna` model for all tasks).

---

## 3. Caveats

1. **No Edge Functions**: No Supabase Edge Functions (`supabase/functions/`) exist in the repository; all server logic is handled within TanStack Start server routes and server functions.
2. **Reverse Proxy / CDN WAF**: External reverse proxy or Cloudflare CDN WAF rate-limiting settings (if any exist in deployment infrastructure) cannot be inspected from the application source code repository.
3. **Read-Only Scope**: In accordance with the Explorer role constraints, no source code or package dependencies were altered.

---

## 4. Conclusion

- **Verdict on Rate Limiting**: **PARTIAL**
  - **Present**: On `POST /api/chat` (per-user fixed-window via in-memory `Map`).
  - **Missing**: On all 10 non-chat AI server functions (`tailorCv`, `generateCoverLetter`, `generateInterviewPrep`, `changeApplicationLanguage`, `summariseOffer`, `generateTargetCv`, `analyzeOfferUrl`, `extractCvFromFile`, `translateProfile`, `uploadCandidateContext` / `mergeAnswerIntoDossier`).
  - **Missing**: No IP-based rate limiting on `/api/chat`.
- **Verdict on Token Limits**: **PARTIAL**
  - Output completion limits (`max_tokens`) are **MISSING** everywhere.
  - Input truncation limits (message count, character slice, document size) are **PRESENT**.
- **Actionable Remediation**:
  1. Add rate limiting middleware/counters to all AI server functions.
  2. Specify `max_tokens` across all calls in `callGateway` and `streamText`.
  3. Migrate rate limiting state from in-memory `Map` to Redis/Upstash or Supabase RPC table counter.
  4. Implement `onFinish` in `streamText` and add missing `feature`/`userId` options in `callGateway` to complete `ai_usage` tracking.
  5. Install `@ai-sdk/openai` in `package.json` to fix `ai-gateway.server.test.ts`.

---

## 5. Verification Method

To independently verify these findings:

1. **Inspect Chat Rate Limiter**:
   - `src/routes/api/chat.ts` lines 22–24, 72–95.
   - `src/lib/chat-guard.ts` lines 54–80.
2. **Inspect AI Gateway & Omission of `max_tokens`**:
   - `src/lib/ai-gateway.server.ts` lines 59–75.
3. **Inspect Server Functions Lacking Rate Limit Checks**:
   - `src/lib/applications.functions.ts` (lines 215, 299, 345, 416, 629).
   - `src/lib/targets.functions.ts` (line 107).
   - `src/lib/offer.functions.ts` (line 60).
   - `src/lib/profile.functions.ts` (lines 108, 141).
   - `src/lib/settings.functions.ts` (line 66).
4. **Run Project Test Suite**:
   ```bash
   npm run test
   ```
   Observe 13 passed test suites and 1 failed suite (`ai-gateway.server.test.ts` due to missing `@ai-sdk/openai` package).
