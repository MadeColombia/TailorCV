# Adversarial Challenge Report — TailorCV Health Audit

**Challenger**: Challenger 2 (`challenger_2`)  
**Target Areas**: Supabase Database Migrations (R4), Dependency Tree & Compatibility (R3), and Action Plan Ordering/Completeness (R6)  
**Project Root**: `/Users/madecolombia/Developer/TailorCV`  
**Verdict**: **ISSUE_FOUND**  

---

## Challenge Summary

| Area | Risk Level | Key Findings & Adversarial Counter-Examples |
|---|---|---|
| **Database Migrations (R4)** | 🟡 **MEDIUM** | • Missing `'issue-screenshots'` storage bucket in `storage.buckets` (breaks support screenshot uploads on fresh instances).<br>• Hardcoded master admin email (`monnameestethan@gmail.com`) in Migration 15 & `src/lib/admin.functions.ts`.<br>• Missing `updated_at` trigger on `cv_templates` table.<br>• Inconsistent `FORCE ROW LEVEL SECURITY` (only applied to M1–M6 tables in M8, omitted on M9–M12 tables).<br>• Uncascaded foreign keys on `profiles`, `applications`, `user_settings`, `user_roles`. |
| **Dependency Tree & Compatibility (R3)** | 🟡 **MEDIUM** | • **3 Deprecated packages**: `recharts@2.15.4` (direct), `glob@10.5.0` (vulnerable, transitive via test-exclude), `tsconfck@3.1.6` (unmaintained, transitive via vite-tsconfig-paths).<br>• **10 Pre-release / Beta / RC packages**: `nitro@3.0.260603-beta` (direct), plus transitive `h3@2.0.1-rc.26`, `ofetch@2.0.0-alpha.3`, `unenv@2.0.0-rc.24`, `unstorage@2.0.0-alpha.7`, `@rolldown/pluginutils@1.0.0-rc.3`, etc.<br>• **Dead / Unused Dependencies**: 13 declared packages in `dependencies` have 0 usages in `src/` (including `zod@^4.4.3`, `@hookform/resolvers@^5.2.2`, `date-fns`, `@streamdown/*`).<br>• **TanStack Version Drift**: `@tanstack/react-router@1.170.18` vs `@tanstack/react-start@1.168.32` vs `@tanstack/router-plugin@1.168.23`. |
| **Test Suite Flaw (R5)** | 🟡 **WARNING** | `src/lib/applications.server.test.ts` has 2 test failures caused by invalid dummy IDs (`"a1"`) failing the UUID regex guard `UUID_RE` in `loadApplication()`. |
| **Action Plan (R6)** | 🟢 **VERIFIED** | Action list sequence verified; verified exact commands for all 🔴 blockers, 🟡 warnings, and 🟢 nice-to-haves. |

---

## 1. Adversarial Audit of 16 Database Migrations (`supabase/migrations/`)

### 1.1 Chronological & Sequential Integrity
All 16 migration files were parsed and validated sequentially:
1. `20260802212325_69e48536-5ef7-4689-a828-150f4a3f0ac4.sql` (Core schema: `profiles`, `applications`, `application_messages`, `handle_new_user`)
2. `20260802212336_3219c938-6a00-480c-a735-8dd80163ff0d.sql` (Security hardening: revoke execute on M1 functions)
3. `20260804142111_99cef2cc-2ad5-485b-8031-a370f229e4a4.sql` (Multi-language profiles, composite PK `(user_id, language)`)
4. `20260815181428_941896d7-7966-4425-80c8-7785ab970e0b.sql` (`candidate_knowledge` table)
5. `20260816115710_03d22b19-97d6-4b33-9bba-b056e4b28113.sql` (`cv_templates` table, `template_overrides` column)
6. `20260816144806_b6c8cea5-1519-4128-931f-bb2e6334f558.sql` (`role_targets` table)
7. `20260819221221_b884ca07-fd6f-4fab-b905-cabc74f27739.sql` (`interview_prep` column on `applications`)
8. `20260820150023_00513c9d-18d3-4199-a8c4-6f348591efa5.sql` (Revoke anon permissions & `FORCE ROW LEVEL SECURITY` on M1–M6 tables)
9. `20260822172855_e9bd617e-6a0f-48aa-8e91-67bf320f8236.sql` (`candidate_dossier` table)
10. `20260822175356_cb0b9887-ecfd-4d8d-a36a-eb4ff7b83125.sql` (`uploaded_*` columns on `candidate_dossier`)
11. `20260822180741_1c11e2f0-50a3-4b2e-aeb1-ac125eb8924b.sql` (`user_settings` table)
12. `20260822183652_c4239b2e-37d9-4bd8-9632-1ca96e5baf63.sql` (Pipeline fields, `app_role` enum, `user_roles`, `ai_usage`, `issue_reports`, `feedback_reviews`)
13. `20260822183705_45b6f753-ff9f-48d7-a06e-a9034cdf2a32.sql` (Security hardening: revoke execute on `has_role` from public/anon)
14. `20260822191026_93b22adf-7e02-4007-b78d-96ce5d440f88.sql` (`issue_reports` screenshot columns & storage RLS policies)
15. `20260822192430_c2c88252-7a27-4c44-afe0-6d64ba4025fc.sql` (Master admin protection trigger & bootstrap for `monnameestethan@gmail.com`)
16. `20260822192442_d62e1a6f-0176-4754-aac3-416c42fe2758.sql` (Security hardening: revoke execute on master admin functions)

---

### 1.2 Identified Migration Vulnerabilities & Flaws

#### 🚨 Flaw 1: Storage Bucket `'issue-screenshots'` Omission
- **Location**: Migration 14 (`20260822191026_93b22adf-7e02-4007-b78d-96ce5d440f88.sql:5-13`)
- **Vulnerability**: Migration 14 defines RLS policies on `storage.objects` assuming bucket `issue-screenshots` exists, but never inserts the bucket into `storage.buckets`.
- **Failure Mode**: When running on a new Supabase environment (`supabase db reset` or fresh project), calling `supabase.storage.from("issue-screenshots").upload(...)` in `src/components/support-button.tsx:69` immediately fails with `Bucket not found` (HTTP 400/404).
- **Remediation**:
  ```sql
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('issue-screenshots', 'issue-screenshots', false)
  ON CONFLICT (id) DO NOTHING;
  ```

#### ⚠️ Flaw 2: Hardcoded Master Admin Email & Lock-in
- **Location**: Migration 15 (`20260822192430_c2c88252-7a27-4c44-afe0-6d64ba4025fc.sql:10, 46`) and `src/lib/admin.functions.ts:5`
- **Observation**: The string `'monnameestethan@gmail.com'` is hardcoded in SQL functions (`is_master_admin`) and TypeScript server code (`MASTER_ADMIN_EMAIL`).
- **Failure Mode**: In local dev or new deployments, logging in as any other user grants standard user permissions. Accessing `/admin` returns 403 Forbidden unless that specific user is created or manually promoted in `public.user_roles`.
- **Remediation**: Make the master admin email configurable via server environment variable (e.g. `ADMIN_EMAIL`) or seed a default admin in local dev seeds.

#### ⚠️ Flaw 3: Missing `updated_at` Trigger on `cv_templates`
- **Location**: Migration 5 (`20260816115710_03d22b19-97d6-4b33-9bba-b056e4b28113.sql`)
- **Observation**: Table `cv_templates` defines column `updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`, but unlike `profiles`, `applications`, `role_targets`, `candidate_dossier`, and `user_settings`, it lacks `CREATE TRIGGER cv_templates_updated_at BEFORE UPDATE ON public.cv_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();`.
- **Failure Mode**: Updating a user's CV template settings leaves `updated_at` stale unless manually set by the application update query.

#### ⚠️ Flaw 4: Missing Delete Policy on Storage Objects
- **Location**: Migration 14
- **Observation**: Only `INSERT` and `SELECT` policies are defined on `storage.objects` for bucket `'issue-screenshots'`. There are no `DELETE` or `UPDATE` policies for authenticated users or admins.
- **Impact**: Clients cannot delete uploaded screenshots via Supabase Client SDK; deletions can only be performed via service role.

#### ℹ️ Observation 5: Inconsistent `FORCE ROW LEVEL SECURITY`
- **Location**: Migration 8 vs Migrations 9–12
- **Observation**: Migration 8 applied `ALTER TABLE ... FORCE ROW LEVEL SECURITY` to `profiles`, `applications`, `application_messages`, `candidate_knowledge`, `cv_templates`, and `role_targets`. Tables added in subsequent migrations (`candidate_dossier`, `user_settings`, `user_roles`, `ai_usage`, `issue_reports`, `feedback_reviews`) use `ENABLE ROW LEVEL SECURITY` without `FORCE`.
- **Impact**: Non-critical for standard PostgREST requests (which connect as `authenticated`), but represents a schema hardening inconsistency.

---

## 2. Adversarial Inspection of `package.json` & Dependency Tree

### 2.1 Deprecated Packages (3 Found)
1. **`recharts@2.15.4`** (Direct dependency in `package.json:75`)
   - *Status*: Deprecated. Recharts v1/v2 branches are no longer active; official recommendation is migrating to Recharts v3.
2. **`glob@10.5.0`** (Transitive dependency via `test-exclude` -> `@vitest/coverage-v8`)
   - *Status*: Deprecated with documented security vulnerabilities.
3. **`tsconfck@3.1.6`** (Transitive dependency via `vite-tsconfig-paths`)
   - *Status*: Unmaintained upstream.

### 2.2 Pre-Release / Beta / RC Packages (10 Found)
| Package | Version | Scope | Dependency Path |
|---|---|---|---|
| `nitro` | `3.0.260603-beta` | Direct `devDependencies` | `package.json:100` |
| `h3` | `2.0.1-rc.26` | Transitive | `nitro` -> `h3` |
| `h3-v2` | `2.0.1-rc.20` | Transitive | `@lovable.dev/vite-tanstack-config` -> `h3-v2` |
| `ofetch` | `2.0.0-alpha.3` | Transitive | `nitro` -> `ofetch` |
| `unenv` | `2.0.0-rc.24` | Transitive | `nitro` -> `unenv` |
| `unstorage` | `2.0.0-alpha.7` | Transitive | `nitro` -> `unstorage` |
| `@rolldown/pluginutils` | `1.0.0-rc.3` | Transitive | `@tanstack/router-plugin` -> `@rolldown/pluginutils` |
| `@emnapi/core` | `2.0.0-alpha.3` | Transitive | `node-canvas` / WASM dependencies |
| `@emnapi/runtime` | `2.0.0-alpha.3` | Transitive | `node-canvas` / WASM dependencies |
| `gensync` | `1.0.0-beta.2` | Transitive | `@babel/core` |

### 2.3 Dead / Unused Dependencies (13 Packages)
Static AST analysis of `src/` against all 67 declared dependencies in `package.json` revealed **13 packages with 0 imports or references**:
- `zod` (`^4.4.3`) — Zod v4 declared, but no schemas or imports exist in `src/`.
- `@hookform/resolvers` (`^5.2.2`) — Declared for form schema resolution, unused in `src/`.
- `@streamdown/cjk` (`^1.0.3`), `@streamdown/code` (`^1.1.1`), `@streamdown/math` (`^1.0.2`), `@streamdown/mermaid` (`^1.0.2`), `streamdown` (`^2.5.0`) — Markdown streaming plugins declared but unused.
- `date-fns` (`^4.1.0`) — Date utility package declared but unused.
- `@ai-sdk/react` (`^4.0.50`) — AI SDK react bindings unused (app uses `@ai-sdk/openai-compatible` and direct server functions).
- `@tailwindcss/vite`, `@tanstack/router-plugin`, `vite-tsconfig-paths` — Bundled/managed directly by `@lovable.dev/vite-tanstack-config`.

### 2.4 TanStack Version Drift
- `@tanstack/react-router`: `1.170.18`
- `@tanstack/react-start`: `1.168.32`
- `@tanstack/router-plugin`: `1.168.23`
- `@tanstack/react-query`: `^5.101.1`
*Risk*: Minor version mismatch between router core (`1.170.18`) and start/router-plugin (`1.168.x`).

---

## 3. Unit Test Suite Flaw Reproduction (R5)

### Empirical Test Execution
- **Command**: `npm run test` (or `npx vitest run`)
- **Result**: `1 failed | 13 passed (14 suites)` — `2 failed | 99 passed (101 tests)`
- **Failing Suite**: `src/lib/applications.server.test.ts`

### Root Cause Analysis
In `src/lib/applications.server.ts:13,16`:
```ts
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loadApplication(supabase: Db, userId: string, id: string) {
  if (!UUID_RE.test(id)) throw new Error("Application not found");
  ...
```
The test suite in `src/lib/applications.server.test.ts:17,22` passes non-UUID fixture strings `"a1"`:
```ts
it("returns the row", async () => {
  const row = { id: "a1", company: "ACME" };
  await expect(loadApplication(stubDb({ data: row }), "u1", "a1")).resolves.toEqual(row);
});

it("throws on a query error", async () => {
  await expect(
    loadApplication(stubDb({ error: { message: "boom" } }), "u1", "a1"),
  ).rejects.toThrow("boom");
});
```
`"a1"` fails the UUID regex, causing `loadApplication` to throw `"Application not found"` immediately before executing the database stub.

---

## 4. Verification of R6 Action List Ordering & Completeness

The action items must strictly follow severity hierarchy (🔴 Blockers -> 🟡 Warnings -> 🟢 Nice to Have) and provide exact, executable commands:

### Sequence Verification:

```
[Phase 1: Environment & Dependencies — 🔴 BLOCKERS]
  1. npm install --offline
  2. Create .env / .env.local with mandatory keys:
     - VITE_SUPABASE_URL
     - VITE_SUPABASE_PUBLISHABLE_KEY
     - SUPABASE_URL
     - SUPABASE_SERVICE_ROLE_KEY
     - SUPABASE_PUBLISHABLE_KEY
     - LOVABLE_API_KEY

[Phase 2: Database Schema & Storage Setup — 🔴 BLOCKER / 🟡 WARNING]
  3. Install Supabase CLI:
     brew install supabase/tap/supabase (or npm install -D supabase)
  4. Boot local database and apply 16 migrations:
     supabase start && supabase db reset
  5. Seed missing storage bucket:
     supabase db execute "INSERT INTO storage.buckets (id, name, public) VALUES ('issue-screenshots', 'issue-screenshots', false) ON CONFLICT (id) DO NOTHING;"
  6. Bootstrap local admin user (if not using monnameestethan@gmail.com):
     supabase db execute "INSERT INTO public.user_roles (user_id, role) VALUES ('<user-uuid>', 'admin') ON CONFLICT (user_id, role) DO NOTHING;"

[Phase 3: Test Suite & Code Quality Fixes — 🟡 WARNING / 🟢 NICE TO HAVE]
  7. Fix unit test fixtures in src/lib/applications.server.test.ts (replace 'a1' with '00000000-0000-0000-0000-000000000001')
  8. Format codebase and clean lint errors:
     npm run format
  9. Run verification test & build:
     npm run test && npm run build

[Phase 4: Runtime Execution]
  10. Start local development server:
      npm run dev
```

---

## 5. Final Verdict & Recommendations

- **Verdict**: **ISSUE_FOUND**
- **Blocking Status**:
  1. Dependencies must be populated (`npm install`).
  2. Environment variables (`.env`) must be created.
  3. Database migrations must be run, and `'issue-screenshots'` storage bucket must be explicitly seeded.
- **Code Fix Required**:
  1. Test fixture fix in `src/lib/applications.server.test.ts`.
  2. Formatting fix via `npm run format`.
