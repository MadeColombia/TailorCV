# TailorCV Master Audit Report: Dead Code, Security & RLS, and AI Cost/Rate Limits

**Target System**: TailorCV Full-Stack Web Application  
**Framework**: TanStack Start (SSR on Vite), TanStack Router, Supabase (Postgres RLS, Auth, Storage), OpenAI API  
**Audit Date**: 2026-08-24  
**Audit Status**: Completed  
**Codebase Modification**: None (Read-only static & architectural audit; `git status` clean on tracked source)

---

## Executive Summary

A comprehensive multi-disciplinary audit of the TailorCV codebase was performed covering three core requirements:
1. **R1: Dead Code & Unused File Analysis** — Full AST reachability graph traversal across `src/` to identify orphan files, unrendered UI components, dead server functions, and unused dependencies.
2. **R2: Security & Row Level Security (RLS) Isolation Audit** — Deep-dive verification of database schemas, migration files (`supabase/migrations/`), data loaders (`src/lib/`), authentication middleware, and cross-tenant leakage vectors.
3. **R3: AI Rate Limits, Token Controls & Cost Management** — Rigorous inspection of `src/routes/api/chat.ts`, `src/lib/ai-gateway.server.ts`, and all 10 background AI server functions.

### Overall Assessment Matrix

| Domain | Status | Key Verdict |
|---|:---:|---|
| **R1: Dead Code & Architecture** | ⚠️ **27 Dead Files** | 27 files (23 UI components, 4 transitively dead files) and 19 npm packages can be safely deleted immediately. 8 server functions are uncalled. |
| **R2: Security & Tenant Isolation** | ✅ **PASS** | Strict multi-tenant isolation at both Postgres RLS and Application Query layers. Zero cross-tenant data leaks or unauthenticated data exposures identified. |
| **R3: AI Rate Limits & Cost Control** | ⚠️ **PARTIAL** | Chat route has in-memory rate limiting and pre-flight guardrails; however, **all 10 non-chat AI server functions lack rate limiting**, `max_tokens` is omitted across all LLM invocations, and streaming chat usage is unlogged in `ai_usage`. |

---

## Part 1: Dead Code & Unused File Analysis (Requirement R1)

### 1.1 Methodology & Entry Point Discovery
Static AST traversal (TypeScript Compiler API), dynamic import tracking, and cross-reference verification with `ripgrep` were conducted across all 130 files in `src/`.

**Standard Entry Points Verified (Preserved):**
- **Server Entry**: `/Users/madecolombia/Developer/TailorCV/src/server.ts` (configured in `vite.config.ts` via `tanstackStart({ server: { entry: "server" } })`)
- **Start Configuration & Middlewares**: `/Users/madecolombia/Developer/TailorCV/src/start.ts`
- **Client Router**: `/Users/madecolombia/Developer/TailorCV/src/router.tsx`
- **Generated Route Tree**: `/Users/madecolombia/Developer/TailorCV/src/routeTree.gen.ts`
- **Active Route Definitions** (`src/routes/`): `__root.tsx`, `index.tsx`, `auth.tsx`, `api/chat.ts`, `_authenticated/route.tsx`, `_authenticated/admin.tsx`, `_authenticated/dashboard.tsx`, `_authenticated/profile.tsx`, `_authenticated/settings.tsx`, `_authenticated/applications.$id.tsx`, `_authenticated/targets.index.tsx`, `_authenticated/targets.$id.tsx`.
- **Global Stylesheet**: `/Users/madecolombia/Developer/TailorCV/src/styles.css`
- **Test Suites**: 14 Vitest suites matching `src/**/*.test.ts`.

---

### 1.2 Completely Dead Files (27 Files — 0 Inbound References)

These 27 files have **0 reachability** from any production route, server entry, dynamic import, or test file. They represent unused Shadcn-UI boilerplate and an unused mobile detection hook.

#### A. Standalone Unused UI Components (23 Files)
```
/Users/madecolombia/Developer/TailorCV/src/components/ui/alert.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/aspect-ratio.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/avatar.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/breadcrumb.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/calendar.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/carousel.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/chart.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/collapsible.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/context-menu.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/drawer.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/form.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/input-otp.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/menubar.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/navigation-menu.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/pagination.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/popover.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/radio-group.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/resizable.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/scroll-area.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/slider.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/table.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/toggle-group.tsx
/Users/madecolombia/Developer/TailorCV/src/components/ui/sidebar.tsx
```

#### B. Transitively Dead Files (4 Files)
These files are only imported by files that are themselves completely dead:
1. `/Users/madecolombia/Developer/TailorCV/src/components/ui/sheet.tsx` — Imported *only* by `sidebar.tsx` (L17).
2. `/Users/madecolombia/Developer/TailorCV/src/components/ui/skeleton.tsx` — Imported *only* by `sidebar.tsx` (L18).
3. `/Users/madecolombia/Developer/TailorCV/src/components/ui/toggle.tsx` — Imported *only* by `toggle-group.tsx` (L8).
4. `/Users/madecolombia/Developer/TailorCV/src/hooks/use-mobile.tsx` — Imported *only* by `sidebar.tsx` (L6).

---

### 1.3 Unused React Components in Active Files (42 Sub-components)

Within active component modules imported by routes, several exported primitives are never rendered:
- **`src/components/ai-elements/conversation.tsx`**: `ConversationDownload` (L132)
- **`src/components/ai-elements/message.tsx`**: `MessageActions` (L65), `MessageAction` (L80), `MessageBranch` (L141), `MessageBranchContent` (L194), `MessageBranchSelector` (L227), `MessageBranchPrevious` (L252), `MessageBranchNext` (L275), `MessageBranchPage` (L298), `MessageToolbar` (L341)
- **`src/components/ai-elements/prompt-input.tsx`**: `PromptInputProvider` (L248), `LocalReferencedSourcesContext` (L398), `PromptInputActionAddAttachments` (L417), `PromptInputActionAddScreenshot` (L444), `PromptInputBody` (L945), `PromptInputHeader` (L1076), `PromptInputTools` (L1105), `PromptInputButton` (L1127), `PromptInputActionMenu` (L1170), `PromptInputActionMenuTrigger` (L1176), `PromptInputActionMenuContent` (L1191), `PromptInputActionMenuItem` (L1201), `PromptInputSelect` (L1267), `PromptInputSelectTrigger` (L1275), `PromptInputSelectContent` (L1293), `PromptInputSelectItem` (L1302), `PromptInputSelectValue` (L1311), `PromptInputHoverCard` (L1320), `PromptInputHoverCardTrigger` (L1332), `PromptInputHoverCardContent` (L1340), `PromptInputTabsList` (L1349), `PromptInputTab` (L1356), `PromptInputTabLabel` (L1363), `PromptInputTabBody` (L1380), `PromptInputTabItem` (L1389), `PromptInputCommand` (L1404), `PromptInputCommandInput` (L1411), `PromptInputCommandList` (L1420), `PromptInputCommandEmpty` (L1429), `PromptInputCommandGroup` (L1438), `PromptInputCommandItem` (L1447), `PromptInputCommandSeparator` (L1458).

---

### 1.4 Unused Server Functions & Backend Handlers (8 Functions)

| File Path | Line | Function Name | Analysis & Reason Unused |
|---|---|---|---|
| `/Users/madecolombia/Developer/TailorCV/src/lib/applications.functions.ts` | 175 | `getCandidateKnowledge` | Query function for `candidate_knowledge`; superseded by unified dossier loading |
| `/Users/madecolombia/Developer/TailorCV/src/lib/applications.functions.ts` | 615 | `setSalaryExpectation` | Mutation for `applications.salary_expectation`; UI form updates salary via full application patch |
| `/Users/madecolombia/Developer/TailorCV/src/lib/applications.functions.ts` | 665 | `updateOfferSummary` | Manual offer summary patch; UI exclusively uses `summariseOffer` (AI auto-summary) |
| `/Users/madecolombia/Developer/TailorCV/src/lib/feedback.functions.ts` | 63 | `listMyReviews` | Lists reviews for current user; review history is not currently rendered in UI |
| `/Users/madecolombia/Developer/TailorCV/src/lib/template.functions.ts` | 36 | `setApplicationTemplate` | Per-application visual override; application templates currently inherit user-wide template |
| `/Users/madecolombia/Developer/TailorCV/src/lib/ai-gateway.server.ts` | 43 | `recordUsage` | Export is unused externally (called only internally by `callGateway` at L93) |
| `/Users/madecolombia/Developer/TailorCV/src/lib/crypto.server.ts` | 36 | `isEncrypted` | Exported helper; `dossier.server.ts` directly uses `encryptText`/`decryptText` |
| `/Users/madecolombia/Developer/TailorCV/src/lib/dossier.server.ts` | 48 | `saveDossier` | Exported helper; application code updates dossier via `saveUploadedContext` or `mergeAnswerIntoDossier` |

---

### 1.5 Unused Client Functions, Hooks & Utilities (17 Items)

- `src/components/ai-elements/conversation.tsx:124`: `messagesToMarkdown`
- `src/components/ai-elements/prompt-input.tsx`: `usePromptInputController` (L213), `useProviderAttachments` (L227), `usePromptInputAttachments` (L374), `usePromptInputReferencedSources` (L401)
- `src/lib/cv.ts:56`: `isProfileLanguage`
- `src/lib/error-capture.ts:18`: `describeError`
- `src/lib/pipeline.ts`: `daysSince` (L48), `responseLikelihood` (L78), `archiveExpired` (L262)
- `src/lib/ui-strings.ts`: `uiStrings` (L212), `readStoredUiLanguage` (L216), `useUiLanguage` (L228)
- `src/lib/user-settings.ts`: `normalizeDepth` (L60), `depthMaxQuestions` (L66), `normalizeCvLanguages` (L131)
- `src/integrations/supabase/types.ts:658`: `Constants`

---

### 1.6 Test-Only Exports (7 Items)

These functions/constants are imported only in `.test.ts` test files and have **0 production callers**:
1. `src/lib/cv.ts:128`: `normalizeLinkItems` (Tested in `cv.test.ts`)
2. `src/lib/cv.ts:146`: `guessLinkLabel` (Tested in `cv.test.ts`)
3. `src/lib/cv.ts:155`: `linkItemsToLine` (Tested in `cv.test.ts`)
4. `src/lib/dossier.ts:8`: `DOSSIER_MAX_CHARS` (Tested in `dossier.test.ts`)
5. `src/lib/dossier.ts:48`: `isDossierEmpty` (Tested in `dossier.test.ts`)
6. `src/lib/dossier.ts:55`: `UPLOADED_MAX_CHARS` (Tested in `dossier.test.ts`)
7. `src/lib/offer-parse.ts:22`: `findJobPosting` (Tested in `offer-parse.test.ts`)

---

### 1.7 Unused npm Dependencies in `package.json` (19 Packages)

Because the 27 UI component files above are dead, the following 19 packages listed in `dependencies` are completely unreferenced in the production build:
1. `@radix-ui/react-aspect-ratio`
2. `@radix-ui/react-avatar`
3. `@radix-ui/react-collapsible`
4. `@radix-ui/react-context-menu`
5. `@radix-ui/react-menubar`
6. `@radix-ui/react-navigation-menu`
7. `@radix-ui/react-popover`
8. `@radix-ui/react-radio-group`
9. `@radix-ui/react-scroll-area`
10. `@radix-ui/react-slider`
11. `@radix-ui/react-toggle`
12. `@radix-ui/react-toggle-group`
13. `embla-carousel-react`
14. `input-otp`
15. `react-day-picker`
16. `react-resizable-panels`
17. `recharts`
18. `vaul`
19. `react-hook-form` (forms in production utilize native inputs and state)

---

## Part 2: Security & Row Level Security (RLS) Audit (Requirement R2)

### 2.1 Security Architecture Overview
TailorCV employs an exemplary **two-layer defense-in-depth model**:
1. **Database Engine Layer (Postgres RLS)**: Row Level Security is enabled across every database table. Unauthenticated (`anon`) access permissions are explicitly revoked.
2. **Application Layer (TanStack Start Server Functions)**: Every server function executes behind `requireSupabaseAuth` middleware, which parses the Bearer JWT, validates claims, initializes a user-scoped Supabase client, and explicitly filters queries by `userId`.

---

### 2.2 Table-by-Table Isolation & RLS Audit Matrix

| Table / Resource | RLS Enabled | FORCE RLS | RLS Policy Definitions | Application Layer Scoping Filter | Isolation Verdict |
|---|:---:|:---:|---|---|:---:|
| `public.profiles` | YES | YES (`20260820150023:4`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260802212325`) | `.eq("user_id", context.userId)` in `getProfile`, `saveProfile`, `listProfileVersions`, `loadProfileCv` | **PASS** |
| `public.applications` | YES | YES (`20260820150023:5`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260802212325`) | `.eq("user_id", context.userId)` & `.eq("id", id)` in all operations (`loadApplication`, `listApplications`, `updateApplication`, `deleteApplication`) | **PASS** |
| `public.application_messages` | YES | YES (`20260820150023:6`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260802212325`) | `user_id: context.userId` in `saveChatTurn`; cascading delete FK on `applications` | **PASS** |
| `public.candidate_knowledge` | YES | YES (`20260820150023:7`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260815181428`) | `.eq("user_id", userId)` in `loadKnowledge`, `rememberAnswer`, `eraseCandidateContext` | **PASS** |
| `public.cv_templates` | YES | YES (`20260820150023:8`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260816115710`) | `.eq("user_id", context.userId)` in `getCvTemplate`, `saveCvTemplate` | **PASS** |
| `public.role_targets` | YES | YES (`20260820150023:9`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260816144806`) | `.eq("user_id", context.userId)` in all CRUD operations; target cap (10) scoped to user | **PASS** |
| `public.candidate_dossier` | YES | Default RLS (`20260822172855`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` | `.eq("user_id", userId)` in `loadDossierParts`, `saveDossier`, `eraseDossier`; AES-256-GCM encrypted | **PASS** |
| `public.user_settings` | YES | Default RLS (`20260822180741`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` | `.eq("user_id", userId)` in `loadSettings`, `saveSettings` | **PASS** |
| `public.user_roles` | YES | Default RLS (`20260822183652`) | Users read own role (`auth.uid() = user_id`); Admins read all roles (`has_role(auth.uid(), 'admin')`) | Modifications restricted to `service_role`; master admin protected by trigger `protect_master_admin` | **PASS** |
| `public.ai_usage` | YES | Default RLS (`20260822183652`) | Admins read usage (`has_role(auth.uid(), 'admin')`) | Direct client access revoked; inserts performed server-side via `supabaseAdmin` | **PASS** |
| `public.issue_reports` | YES | Default RLS (`20260822183652`) | Users manage own issues; Admins read/update all issues | `submitIssue` enforces `user_id: context.userId` and validates screenshot path matches `${context.userId}/` | **PASS** |
| `public.feedback_reviews` | YES | Default RLS (`20260822183652`) | Users manage own reviews; Admins read all reviews | `submitReview`, `listMyReviews` enforce `user_id: context.userId` | **PASS** |
| `storage.objects` (`issue-screenshots`) | YES | Storage RLS (`20260822191026`) | Upload/read restricted to `(storage.foldername(name))[1] = auth.uid()::text`; Admin read allowed | Client uploads to `${userId}/${uuid}.${ext}`; admin creates short-lived signed URLs | **PASS** |

---

### 2.3 Deep Dive: Data Loaders & IDOR Immunity
1. **Application & CV Loader (`src/lib/applications.server.ts:15-26`)**:
   ```typescript
   export async function loadApplication(supabase: SupabaseClient, userId: string, id: string) {
     if (!UUID_RE.test(id)) return null;
     const { data, error } = await supabase
       .from("applications")
       .select("*")
       .eq("id", id)
       .eq("user_id", userId)
       .maybeSingle();
     if (error || !data) return null;
     return data;
   }
   ```
   *Analysis*: Even if database RLS were bypassed, the application loader enforces UUID format validation and explicit `.eq("user_id", userId)`, rendering Insecure Direct Object Reference (IDOR) attacks impossible.

2. **Dossier Envelope Encryption at Rest (`src/lib/crypto.server.ts` & `src/lib/dossier.server.ts`)**:
   Candidate dossier free-text is encrypted at rest using AES-256-GCM with authenticated tags before insertion into Postgres, protecting sensitive resume data against database-level inspection.

3. **MFA-Guarded Account Archive Export (`src/lib/user-settings.functions.ts:12-45`)**:
   Full account data export (`exportAccountArchive`) enforces Two-Factor Authentication (`claims.aal === 'aal2'`), preventing data exfiltration even if a session token is temporarily compromised.

4. **CSRF & Security Headers (`src/start.ts`)**:
   - `createCsrfMiddleware` intercepts all incoming mutations.
   - `securityHeadersMiddleware` injects strict headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `cache-control: private, no-store`).

---

## Part 3: AI Rate Limits, Token Controls & Cost Management (Requirement R3)

### 3.1 AI Route & Server Function Inventory

TailorCV invokes OpenAI LLM models across **1 HTTP API route** (`POST /api/chat`) and **10 server functions / background helpers**:

| # | Endpoint / Server Function | File Location | Invocation Method | Model | Auth Gate | Rate Limiting | `max_tokens` Set? | Usage Logged (`ai_usage`)? |
|---|---|---|---|---|---|:---:|:---:|:---:|
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

### 3.2 AI Chat Rate Limiting Architecture (`src/routes/api/chat.ts` & `src/lib/chat-guard.ts`)

#### How it works:
1. **Window Definition**: Fixed window of 10 minutes (`RATE_WINDOW_MS = 600,000 ms`) with a default limit of 30 messages (`RATE_LIMIT = 30`).
2. **State Store**: Process-local `Map<string, RateLimitEntry>` stored in `rateState`.
3. **Execution**:
   ```typescript
   const now = Date.now();
   pruneRateLimit(rateState, now);
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
       { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
     );
   }
   ```
4. **User Customization**: Users can configure `sessionMessageCap` in settings between `5` and `200` messages.

#### Vulnerabilities & Limitations:
- **Serverless / Multi-Instance Ineffectiveness**: Because state is stored in a process-local Node.js `Map`, instances running in serverless environments or multi-container clusters do not share rate limit state. Cold starts wipe counters, and clients can cycle requests across instances.
- **Complete Absence on Non-Chat Functions**: Authenticated users can invoke expensive one-shot endpoints (`tailorCv`, `generateCoverLetter`, `generateInterviewPrep`, `extractCvFromFile`) without rate limitations.

---

### 3.3 Token Limit Controls & Input Budgets

#### Missing Output Token Caps (`max_tokens` / `maxOutputTokens`)
Neither `streamText` in `src/routes/api/chat.ts` nor `callGateway` in `src/lib/ai-gateway.server.ts` supplies `max_tokens` or `maxOutputTokens` to the OpenAI API:
```typescript
// src/lib/ai-gateway.server.ts:63-73
const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${requireApiKey()}` },
  body: JSON.stringify({
    model: CHAT_MODEL,
    messages,
    ...(options.json ? { response_format: { type: "json_object" } } : {}),
    // ⚠️ max_tokens / max_completion_tokens is completely absent!
  }),
});
```
*Risk*: OpenAI defaults to the model's maximum completion capacity. Runaway loops or verbose completions can generate thousands of unnecessary output tokens.

#### Input Budget & Truncation Controls (Strong)
- **Chat History**: Truncated to the last 60 messages (`messages.slice(-MAX_MESSAGES)`).
- **Message Part Characters**: Individual text parts capped at 6,000 characters (`text.slice(0, MAX_CHARS)`).
- **Candidate Knowledge Retrieval**: Limited to 80 records (`.limit(80)`).
- **Job Offer Text**: Truncated to 30,000 characters for summarization (`offerText.slice(0, 30000)`).
- **Job URL Scraping**: Truncated to 60,000 characters (`text.slice(0, 60000)`).
- **File Extraction Upload**: Max 8MB payload limit (`base64.length > 8_000_000`).

---

### 3.4 Local Pre-Flight Guardrails & Cost Defense (`src/lib/chat-guard.ts`)
`screenUserMessage` intercepts messages locally before contacting OpenAI:
- **Prompt Injection Defense**: Evaluates regex patterns for jailbreaks, system prompt overrides, DAN mode, and developer mode.
- **Off-Topic Defense**: Blocks coding requests, shell execution, creative writing, homework, and math puzzles.
- **Zero-Token Rejection**: When triggered, `/api/chat` immediately returns a static reply without making an OpenAI API call, consuming **0 tokens**.

---

### 3.5 Telemetry & Accounting Gaps
The `public.ai_usage` table exists to record token usage, but exhibits two major tracking blind spots:
1. **Streaming Chat is NOT logged**: `streamText` lacks an `onFinish` handler to persist prompt and completion tokens.
2. **Missing Feature & User Tags**: 5 out of 10 server functions (`generateTargetCv`, `extractCvFromFile`, `translateProfile`, `uploadCandidateContext`, `mergeAnswerIntoDossier`) call `callGateway` without passing `{ feature, userId }`, bypassing `recordUsage`.

---

## Part 4: Prioritized Remediation Roadmap

```
+-------------------------------------------------------------------------------+
|                        PRIORITIZED REMEDIATION ROADMAP                        |
+-----------------------------------+-------------------------------------------+
| PHASE 1: HIGH PRIORITY            | - Delete 27 dead UI files                 |
| (Cost, Security & Cleanup)        | - Set explicit `max_tokens` on all AI     |
|                                   | - Implement rate limiting on AI functions |
|                                   | - Log streaming chat in `ai_usage`        |
+-----------------------------------+-------------------------------------------+
| PHASE 2: MEDIUM PRIORITY          | - Prune 19 unused npm dependencies       |
| (Bundle Optimization & Telemetry) | - Remove 5 dead server functions          |
|                                   | - Add `{ feature, userId }` to AI calls   |
|                                   | - Add `@ai-sdk/openai` to package.json    |
+-----------------------------------+-------------------------------------------+
| PHASE 3: ARCHITECTURAL HARDENING  | - Migrate rate limiting to Upstash Redis  |
| (Distributed Scale & Quotas)      | - Tier models (`gpt-4o-mini` for summary) |
|                                   | - Enforce monthly per-user token quotas   |
+-----------------------------------+-------------------------------------------+
```

### Phase 1: High Priority (Cost Protection & Immediate Cleanup)
1. **Set Explicit `max_tokens` on All AI Invocations**:
   - In `src/lib/ai-gateway.server.ts:callGateway`: Add `max_tokens: options.maxTokens ?? 3000`.
   - In `src/routes/api/chat.ts:streamText`: Add `maxTokens: 1500`.
   - Feature-specific caps: `tailor_cv` (3,000), `cover_letter` (800), `interview_prep` (1,500), `offer_summary` (600), `translate` (2,500).
2. **Implement Rate Limiting on One-Shot AI Server Functions**:
   - Introduce rate limiting middleware for `tailorCv`, `generateCoverLetter`, `generateInterviewPrep`, `extractCvFromFile`, `generateTargetCv`, and `translateProfile` (e.g., max 10 generation calls per 10-minute window per user).
3. **Capture Streaming Chat Usage in `public.ai_usage`**:
   - Add `onFinish({ usage })` to `streamText` in `src/routes/api/chat.ts` to insert prompt and completion tokens into `ai_usage`.
4. **Safely Remove 27 Dead UI Files**:
   - Delete the 23 standalone UI components and 4 transitively dead files listed in Section 1.2.

### Phase 2: Medium Priority (Dependency Pruning & Telemetry Completion)
1. **Prune 19 Unused npm Dependencies**:
   - Remove unused Radix UI primitives, `vaul`, `recharts`, `react-day-picker`, `embla-carousel-react`, `input-otp`, and `react-hook-form` from `package.json`.
2. **Remove Deprecated / Uncalled Server Functions**:
   - Safely prune `getCandidateKnowledge`, `setSalaryExpectation`, `updateOfferSummary`, `listMyReviews`, and `setApplicationTemplate`.
3. **Tag Remaining AI Call Sites**:
   - Pass `{ feature: 'target_cv', userId: context.userId }`, `{ feature: 'extract_cv', userId: context.userId }`, etc., in `generateTargetCv`, `extractCvFromFile`, `translateProfile`, `uploadCandidateContext`, and `mergeAnswerIntoDossier`.
4. **Fix Missing Dependency in `package.json`**:
   - Add `@ai-sdk/openai` to `dependencies` to resolve the test failure in `ai-gateway.server.test.ts`.

### Phase 3: Architectural Hardening & Cost Optimization
1. **Migrate Rate Limiting to Distributed Store (e.g. Upstash Redis / Postgres RPC)**:
   - Transition from in-memory `Map` to Redis sliding window or Supabase RPC rate limiter for multi-instance consistency.
2. **Implement Model Tiering for Secondary Tasks**:
   - Assign faster, lower-cost models (e.g. `gpt-4o-mini`) for utility tasks (`summariseOffer`, `analyzeOfferUrl`, `translateProfile`, `changeApplicationLanguage`), reserving `gpt-5.6-luna` for complex CV generation.
3. **Automated Monthly Spending Quotas**:
   - Enforce account-level token quotas in `callGateway` checking cumulative monthly spend against tier limits.

---

## Conclusion

The TailorCV application demonstrates **outstanding multi-tenant data isolation and security architecture (Verdict: PASS)**, with robust RLS policies, zero cross-tenant leakage vectors, envelope encryption for candidate dossiers, and pre-flight chat guardrails.

To achieve production-grade operational efficiency and cost predictability, the development team should prioritize:
1. Pruning the **27 identified dead files** and **19 unused dependencies**.
2. Adding **output token caps (`max_tokens`)** and **rate limiting** across all AI server functions.
3. Closing the telemetry gap by logging streaming chat tokens to `ai_usage`.
