# Requirement R2: Security & Data Leak Audit Report

**Date:** 2026-08-24  
**Auditor:** Explorer R2 (Security & Data Leak Audit Specialist)  
**Target Application:** TailorCV  
**Audit Scope:** Supabase Row Level Security (RLS) policies (`supabase/migrations/`), client/server Supabase clients, Server Functions and data loaders (`src/lib/`), API routes (`src/routes/api/`), storage buckets, and defense-in-depth tenant isolation controls.

---

## 1. Executive Summary & Verdict

The TailorCV application implements a robust **defense-in-depth data isolation architecture**. User tenancy is strictly enforced at two independent layers:
1. **Database Engine Layer (Supabase Postgres):** Row Level Security (RLS) is enabled and enforced across all tables. Permissions for `anon` are revoked across all user-data tables. Security definer functions have explicit `SET search_path = public` and restricted execution grants.
2. **Application / Server Function Layer (TanStack Start):** Server functions utilize `requireSupabaseAuth` middleware to construct user-scoped Supabase clients carrying the authenticated user's JWT. All data queries, updates, and deletes explicitly bind `.eq("user_id", context.userId)` or `user_id: context.userId`.

### Overall Security Status: **PASS** (Zero Cross-Tenant Leaks or Unauthenticated Data Exposures Identified)

---

## 2. Table-by-Table Isolation & RLS Audit Matrix

| Table / Resource | RLS Enabled | FORCE RLS | RLS Policies (SELECT / INSERT / UPDATE / DELETE) | Application Layer Tenancy Filter | Isolation Verdict |
|---|---|---|---|---|:---:|
| `public.profiles` | YES (`20260802212325:22`) | YES (`20260820150023:4`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260802212325:23-24`) | `.eq("user_id", context.userId)` in `getProfile`, `saveProfile`, `listProfileVersions`, `loadProfileCv` | **PASS** |
| `public.applications` | YES (`20260802212325:43`) | YES (`20260820150023:5`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260802212325:44-45`) | `.eq("user_id", context.userId)` & `.eq("id", id)` in `loadApplication`, `listApplications`, `updateApplication`, `deleteApplication` | **PASS** |
| `public.application_messages` | YES (`20260802212325:60`) | YES (`20260820150023:6`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260802212325:61-62`) | `user_id: context.userId` in `saveChatTurn`; FK `application_id REFERENCES applications(id) ON DELETE CASCADE` | **PASS** |
| `public.candidate_knowledge` | YES (`20260815181428:11`) | YES (`20260820150023:7`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260815181428:12`) | `.eq("user_id", userId)` in `loadKnowledge`, `rememberAnswer`, `eraseCandidateContext`, `enforceContextRetention` | **PASS** |
| `public.cv_templates` | YES (`20260816115710:8`) | YES (`20260820150023:8`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260816115710:9`) | `.eq("user_id", context.userId)` in `getCvTemplate`, `saveCvTemplate` | **PASS** |
| `public.role_targets` | YES (`20260816144806:20`) | YES (`20260820150023:9`) | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260816144806:22-25`) | `.eq("user_id", context.userId)` in `listRoleTargets`, `getRoleTarget`, `createRoleTarget`, `updateRoleTarget`, `deleteRoleTarget`, `generateTargetCv` | **PASS** |
| `public.candidate_dossier` | YES (`20260822172855:11`) | Default RLS | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260822172855:13-17`) | `.eq("user_id", userId)` in `loadDossierParts`, `saveDossier`, `eraseDossier`; AES-256-GCM encryption at rest | **PASS** |
| `public.user_settings` | YES (`20260822180741:20`) | Default RLS | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (`20260822180741:22-25`) | `.eq("user_id", userId)` in `loadSettings`, `saveSettings` | **PASS** |
| `public.user_roles` | YES (`20260822183652:36`) | Default RLS | `Users read own roles` (`20260822183652:38-39`), `Admins read all roles` (`20260822183652:52-53`) | Mutations restricted to `service_role` and master admin email check in `setAdminRole`; master admin protected by trigger | **PASS** |
| `public.ai_usage` | YES (`20260822183652:67`) | Default RLS | `Admins read usage` (`20260822183652:69-70`) | Direct access revoked for authenticated/anon; inserted solely by server `ai-gateway.server.ts` via `supabaseAdmin` | **PASS** |
| `public.issue_reports` | YES (`20260822183652:85`) | Default RLS | `Users manage own issues` (`20260822183652:87-88`), `Admins read issues` (`20260822183652:90-91`), `Admins update issues` (`20260822183652:93-95`) | `submitIssue` enforces `user_id: context.userId` and validates `screenshotPath.startsWith("${context.userId}/")` | **PASS** |
| `public.feedback_reviews` | YES (`20260822183652:110`) | Default RLS | `Users manage own reviews` (`20260822183652:112-113`), `Admins read reviews` (`20260822183652:114-116`) | `submitReview`, `listMyReviews` enforce `user_id: context.userId` | **PASS** |
| `storage.objects` (`issue-screenshots`) | YES (Storage RLS) | Storage RLS | User upload/read restricted to `(storage.foldername(name))[1] = auth.uid()::text`; Admin read allowed (`20260822191026:6-13`) | Client upload in `SupportButton` constructs `${userId}/${crypto.randomUUID()}.${ext}`; admin dashboard generates temporary signed URLs | **PASS** |

---

## 3. Detailed Data Access & Loader Review

### 3.1 Client Initialization & Key Segregation
1. **Client-Side Supabase Client (`src/integrations/supabase/client.ts`):**
   - Uses publishable key (`VITE_SUPABASE_PUBLISHABLE_KEY`).
   - Used for authentication operations (sign-in, sign-up, session refresh, MFA enrollment) and client storage uploads.
   - Does not perform direct table queries.
2. **Server-Side Admin Client (`src/integrations/supabase/client.server.ts`):**
   - Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS).
   - Segregated into `.server.ts` module and only imported dynamically within protected server-side handlers:
     - `src/lib/admin.functions.ts` (gated by `assertAdmin(context)` / `isMasterEmail`)
     - `src/lib/ai-gateway.server.ts` (for background insertion into `ai_usage`)
3. **Per-Request User-Scoped Client (`src/integrations/supabase/auth-middleware.ts` & `src/lib/supabase-user.server.ts`):**
   - `requireSupabaseAuth` middleware validates the Bearer JWT (`supabase.auth.getClaims(token)`), extracts `claims.sub`, and initializes a per-request `supabase` client with the user's Bearer token.
   - RLS automatically evaluates `auth.uid()` against this token.
   - Context `{ supabase, userId, claims }` is passed down to every server function handler.

### 3.2 Data Loaders and Mutations in `src/lib/`

#### A. Applications & Messages (`src/lib/applications.functions.ts` & `src/lib/applications.server.ts`)
- **`loadApplication(supabase, userId, id)` (`src/lib/applications.server.ts:15-26`):**
  - Validates `id` against UUID format regex.
  - Queries `.from("applications").select("*").eq("id", id).eq("user_id", userId).maybeSingle()`.
  - Guarantees strict IDOR prevention even if RLS were absent.
- **`listApplications` (`src/lib/applications.functions.ts:15-41`):**
  - Retention sweep and listing queries are explicitly scoped with `.eq("user_id", context.userId)`.
- **`createApplication`, `updateApplication`, `deleteApplication` (`src/lib/applications.functions.ts:59-154`):**
  - Insert explicitly sets `user_id: context.userId`.
  - Update and Delete enforce `.eq("id", data.id).eq("user_id", context.userId)`.
  - Role target seeding (`targetId`) checks `.eq("id", data.targetId).eq("user_id", context.userId)`.
- **`saveChatTurn` (`src/lib/applications.functions.ts:156-173`):**
  - Maps turns to include `user_id: context.userId` and `application_id: data.applicationId`.
- **`tailorCv`, `generateCoverLetter`, `generateInterviewPrep`, `changeApplicationLanguage`, `updateApplicationStage`:**
  - Every pipeline operation calls `loadApplication(context.supabase, context.userId, data.id)` before any AI or DB mutation, and executes updates scoped by `.eq("id", data.id).eq("user_id", context.userId)`.

#### B. Profiles (`src/lib/profile.functions.ts` & `src/lib/applications.server.ts`)
- **`getProfile` (`src/lib/profile.functions.ts:40-59`):**
  - Queries `.from("profiles").select("*").eq("user_id", context.userId)`.
- **`listProfileVersions` (`src/lib/profile.functions.ts:63-72`):**
  - Queries `.from("profiles").select("language, full_name, headline, updated_at").eq("user_id", context.userId)`.
- **`saveProfile` (`src/lib/profile.functions.ts:74-106`):**
  - Upserts to `profiles` with `user_id: context.userId` on conflict `user_id,language`.
  - Photo sync update is scoped to `.eq("user_id", context.userId)`.
- **`loadProfileCv` (`src/lib/applications.server.ts:28-54`):**
  - Queries `.from("profiles").select("*").eq("user_id", userId).eq("language", ...).maybeSingle()`.

#### C. Candidate Knowledge & Dossier (`src/lib/applications.functions.ts`, `src/lib/dossier.server.ts`, `src/lib/settings.functions.ts`)
- **`candidate_knowledge`:**
  - `loadKnowledge`: `.from("candidate_knowledge").select("question, answer, created_at").eq("user_id", userId)`.
  - `rememberAnswer`: Inserts with `user_id: context.userId`.
  - `eraseCandidateContext`: Deletes with `.eq("user_id", context.userId)`.
- **`candidate_dossier`:**
  - `loadDossierParts`: Queries `.from("candidate_dossier").select(...).eq("user_id", userId)`.
  - `saveDossier` / `saveUploadedContext`: Encrypts content via AES-256-GCM (`crypto.server.ts`) and upserts with `user_id: userId`.
  - `clearUploadedContext` / `eraseDossier`: Deletes / updates with `.eq("user_id", userId)`.

#### D. Role Targets (`src/lib/targets.functions.ts`)
- `listRoleTargets`, `getRoleTarget`, `createRoleTarget`, `updateRoleTarget`, `deleteRoleTarget`, `generateTargetCv`:
  - Every function specifies `.eq("user_id", context.userId)` or `user_id: context.userId`.
  - Total role target limit (`MAX_TARGETS = 10`) is counted with `.eq("user_id", context.userId)`.

#### E. User Settings & Account Export (`src/lib/user-settings.functions.ts`, `src/lib/user-settings.server.ts`)
- `loadSettings`: `.from("user_settings").select("*").eq("user_id", userId)`.
- `saveSettings`: Upserts with `user_id: userId`.
- `exportAccountArchive`:
  - Requires `claims.aal === 'aal2'` (MFA Authenticator verification required).
  - Fetches profiles, applications, role targets, templates, knowledge, settings, and dossier parts strictly filtered by `userId`.

#### F. Feedback & Issue Reporting (`src/lib/feedback.functions.ts` & `src/components/support-button.tsx`)
- `submitIssue`:
  - Enforces `user_id: context.userId`.
  - Explicitly validates that `screenshotPath.startsWith(`${context.userId}/`)` preventing screenshot reference injection / IDOR.
- `submitReview`: Enforces `user_id: context.userId`.
- `listMyReviews`: Scoped to `.eq("user_id", context.userId)`.

#### G. Admin Functions (`src/lib/admin.functions.ts`)
- `assertAdmin`: Validates `isMasterEmail(claims.email)` or calls `has_role(userId, 'admin')` RPC.
- `getAdminOverview`: Protected by `assertAdmin(context)`. Aggregates system metrics, token spend, issue reports, reviews, and signups. Issue screenshot signed URLs are created on demand for admins.
- `setAdminRole`: Restricted exclusively to `isMasterEmail(claims.email)`. Master admin cannot be modified or demoted.
- `setIssueStatus`: Protected by `assertAdmin(context)`.

---

## 4. API Routes Security Review (`src/routes/api/chat.ts`)

- **Authentication:** Validates Bearer token format and calls `createUserScopedClient(token)` (`src/lib/supabase-user.server.ts`).
- **User Tenancy & Data Loading:**
  - All contextual data passed to the AI model (`loadApplication`, `loadProfileCv`, `loadKnowledge`, `loadDossier`) is retrieved server-side using the authenticated `userId` and user-scoped `supabase` client.
  - No client-supplied CV, dossier, or prior answers are accepted from the request body.
- **Input Validation & DoS Protection:**
  - Enforces max message count (`MAX_MESSAGES = 60`), max characters per message (`MAX_CHARS = 6000`), and UUID validation on `applicationId`.
  - Rate limiting enforced per `userId` using sliding window (`checkRateLimit`).
  - Off-topic / instruction-override prompt screening (`screenUserMessage`) stops rogue queries before AI invocation.

---

## 5. Security Architecture & Defense-in-Depth Features

1. **FORCE ROW LEVEL SECURITY:**
   - Applied in migration `20260820150023` to `profiles`, `applications`, `application_messages`, `candidate_knowledge`, `cv_templates`, `role_targets`.
2. **Anonymous Access Revocation:**
   - Permissions for `anon` explicitly revoked across all user-data tables and security functions (`20260820150023`, `20260802212336`, `20260804142111`, `20260822183705`, `20260822192442`).
3. **Envelope Encryption at Rest:**
   - Candidate dossier free-text is encrypted at rest with AES-256-GCM using `DOSSIER_ENCRYPTION_KEY` (`src/lib/crypto.server.ts`).
4. **MFA Guarded Data Export:**
   - Full account ZIP export (`exportAccountArchive`) mandates Two-Factor Authentication (`aal2`).
5. **CSRF & Security Headers:**
   - `createCsrfMiddleware` protects all Server Functions against cross-site requests (`src/start.ts:40`).
   - `securityHeadersMiddleware` injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, and `cache-control: private, no-store`.

---

## 6. Recommendations & Minor Hardening Observations

1. **Future Migration Minor Hardening:**
   - Consider adding `ALTER TABLE public.candidate_dossier FORCE ROW LEVEL SECURITY;` and `ALTER TABLE public.user_settings FORCE ROW LEVEL SECURITY;` in future migrations to match the other tables (though standard `ENABLE ROW LEVEL SECURITY` is already active and fully effective for client roles).
2. **Role Revocation in Master Admin Function:**
   - Master admin protection is strongly enforced in both SQL (`protect_master_admin` trigger) and TypeScript (`admin.functions.ts:193-203`).

---

## 7. Conclusion

Requirement R2 is completely fulfilled. User data isolation across `applications`, `profiles`, `candidate_knowledge`, and all supporting tables is thoroughly implemented, verified at both the database and application layers, and exhibits no vulnerabilities to cross-tenant data leaks, IDOR, or unauthenticated access.
