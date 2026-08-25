# Database & Migrations Diagnostic Report (R4) — TailorCV

**Audit Date**: 2026-08-24  
**Auditor**: Database & Migrations Diagnostic Worker (`worker_database_migrations_1`)  
**Project Root**: `/Users/madecolombia/Developer/TailorCV`  
**Configuration File**: `/Users/madecolombia/Developer/TailorCV/supabase/config.toml`  
**Migrations Directory**: `/Users/madecolombia/Developer/TailorCV/supabase/migrations`  

---

## 1. Executive Summary

| Diagnostic Area | Status | Key Findings |
|---|---|---|
| **Supabase CLI Availability** | ⚠️ Not Installed | `supabase` binary not found in system PATH (`/usr/local/bin`, `/opt/homebrew/bin`, etc.) nor global npm packages. `node_modules/` is not yet installed. |
| **Project Linkage & Config** | ✅ Configured | `supabase/config.toml` exists with `project_id = "ujxmlukctiijfozyiynu"`. No uncommitted `.temp/` state. |
| **Migration Count on Disk** | ✅ Verified (16/16) | Exactly 16 SQL migration files exist in `supabase/migrations/`, spanning from 2026-08-02 to 2026-08-22. |
| **Migration Syntax & Ordering** | ✅ Valid & Sequential | All 16 migrations follow chronological timestamp ordering without circular dependencies or conflicting table mutations. |
| **Schema Coverage** | ✅ Complete | 11 tables, 1 custom enum type (`app_role`), 4 stored functions, 4 triggers, and full Row-Level Security (RLS) enforcement. |
| **Storage Bucket Omission** | ⚠️ Warning | Migration 14 defines RLS policies for storage bucket `'issue-screenshots'`, but does not create the bucket in `storage.buckets`. Must be seeded or created in Supabase Dashboard. |
| **Hardcoded Master Admin** | ℹ️ Notice | Migration 15 bootstraps admin privileges for `'monnameestethan@gmail.com'`. |

---

## 2. Supabase CLI Installation & Environment Checks

### 2.1 CLI Binary Checks
- **Command**: `which supabase`  
  **Result**: `supabase not found` (Exit code 0 with fallback / binary absent from PATH).
- **Paths Inspected**:
  - `/opt/homebrew/bin/supabase` ❌ Not found
  - `/usr/local/bin/supabase` ❌ Not found
  - `~/.npm-global/bin/supabase` ❌ Not found
  - `~/.cargo/bin/supabase` ❌ Not found
- **Global NPM packages**: `npm list -g --depth=0`
  - Output: `@google/gemini-cli@0.55.1`, `npm@11.19.0` (Supabase CLI not globally installed).
- **Local `package.json`**:
  - Supabase client `@supabase/supabase-js: ^2.111.0` is present under `dependencies`.
  - Supabase CLI (`supabase`) is not listed in `devDependencies`.
  - `node_modules/` is currently not present in the workspace root.

---

## 3. Supabase Project Configuration & Linkage Analysis

### 3.1 `supabase/config.toml`
The configuration file contains:
```toml
project_id = "ujxmlukctiijfozyiynu"
```

### 3.2 Configuration Interpretation
- **Linked Project Ref**: `ujxmlukctiijfozyiynu`
- **Remote Host**: `https://ujxmlukctiijfozyiynu.supabase.co`
- **Application Integration**: `src/integrations/supabase/client.ts` and `src/integrations/supabase/client.server.ts` use environment variables (`SUPABASE_URL` / `VITE_SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`) to connect.
- **Local State**: No local Docker container or state directory (`.temp/` or `supabase/.temp/`) is currently running or tracked.

---

## 4. Verbatim Catalog of All 16 Migration Files

Every single migration file in `supabase/migrations/` has been inspected and verified line-by-line:

```
Total Migration Files: 16
Chronological Range: 2026-08-02 21:23:25 UTC -> 2026-08-22 19:24:42 UTC
Total Migrations Size: ~18.8 KB
```

| # | Timestamp (UTC) | Filename | Size (Bytes) | Primary Purpose & Schema Objects Created/Modified |
|---|---|---|---|---|
| **1** | `2026-08-02 21:23:25` | `20260802212325_69e48536-5ef7-4689-a828-150f4a3f0ac4.sql` | 3,449 | **Initial Core Schema Setup**: <br>• Creates function `public.set_updated_at()`<br>• Creates table `public.profiles` (PK `user_id`, JSONB fields for experiences, education, skills; RLS enabled)<br>• Creates table `public.applications` (PK `id UUID`, status, tailored_cv JSONB, match_result JSONB; RLS enabled, index `applications_user_idx`)<br>• Creates table `public.application_messages` (PK `id UUID`, FK `application_id` ON DELETE CASCADE; RLS enabled, index `application_messages_app_idx`)<br>• Creates function `public.handle_new_user()` (SECURITY DEFINER) and trigger `on_auth_user_created` on `auth.users`. |
| **2** | `2026-08-02 21:23:36` | `20260802212336_3219c938-6a00-480c-a735-8dd80163ff0d.sql` | 170 | **Security Hardening (Function Execution)**: <br>• Revokes `EXECUTE` on `public.handle_new_user()` and `public.set_updated_at()` from `PUBLIC, anon, authenticated`. |
| **3** | `2026-08-04 14:21:11` | `20260804142111_99cef2cc-2ad5-485b-8031-a370f229e4a4.sql` | 1,088 | **Multi-Language Profiles & Application Language/URL**: <br>• Alters `public.profiles`: adds `language text DEFAULT 'en'`, `photo_url text`, `link_items jsonb`<br>• Drops `profiles_pkey` and adds composite PK `(user_id, language)`<br>• Alters `public.applications`: adds `offer_url text`, `language text DEFAULT 'en'`<br>• Updates `public.handle_new_user()` to insert default `'en'` profile on conflict `(user_id, language)`. |
| **4** | `2026-08-15 18:14:28` | `20260815181428_941896d7-7966-4425-80c8-7785ab970e0b.sql` | 848 | **Candidate Knowledge Base**: <br>• Creates table `public.candidate_knowledge` (PK `id UUID`, FK `user_id -> auth.users`, FK `source_application_id -> applications(id) ON DELETE SET NULL`)<br>• Enables RLS with policy `"Users manage their own knowledge"`<br>• Creates index `candidate_knowledge_user_idx` on `(user_id, created_at DESC)`. |
| **5** | `2026-08-16 11:57:10` | `20260816115710_03d22b19-97d6-4b33-9bba-b056e4b28113.sql` | 642 | **CV Templates & Application Overrides**: <br>• Creates table `public.cv_templates` (PK `user_id -> auth.users`, `settings JSONB`)<br>• Enables RLS with policy `"Users manage their own cv template"`<br>• Alters `public.applications`: adds column `template_overrides JSONB`. |
| **6** | `2026-08-16 14:48:06` | `20260816144806_b6c8cea5-1519-4128-931f-bb2e6334f558.sql` | 1,172 | **Role Targets (Targeted CV & Industry Tracking)**: <br>• Creates table `public.role_targets` (PK `id UUID`, FK `user_id -> auth.users`, `keywords JSONB`, `generated_cv JSONB`, `match_result JSONB`)<br>• Enables RLS with policy `"Users manage own role targets"`<br>• Creates index `role_targets_user_id_idx` and `role_targets_set_updated_at` trigger. |
| **7** | `2026-08-19 22:12:21` | `20260819221221_b884ca07-fd6f-4fab-b905-cabc74f27739.sql` | 78 | **Interview Preparation**: <br>• Alters `public.applications`: adds column `interview_prep JSONB`. |
| **8** | `2026-08-20 15:00:23` | `20260820150023_00513c9d-18d3-4199-a8c4-6f348591efa5.sql` | 879 | **Security Hardening (Anon Revocation & Force RLS)**: <br>• Revokes all permissions from `anon` on 6 tables: `profiles`, `applications`, `application_messages`, `candidate_knowledge`, `cv_templates`, `role_targets`<br>• Enforces `FORCE ROW LEVEL SECURITY` on all 6 tables. |
| **9** | `2026-08-22 17:28:55` | `20260822172855_e9bd617e-6a0f-48aa-8e91-67bf320f8236.sql` | 784 | **Candidate Dossier (Raw Master Context)**: <br>• Creates table `public.candidate_dossier` (PK `user_id -> auth.users`, `content TEXT`, RLS enabled with policy `"Users manage their own dossier"`)<br>• Attaches `candidate_dossier_updated_at` trigger. |
| **10** | `2026-08-22 17:53:56` | `20260822175356_cb0b9887-ecfd-4d8d-a36a-eb4ff7b83125.sql` | 205 | **Dossier Upload Metadata**: <br>• Alters `public.candidate_dossier`: adds `uploaded_context text DEFAULT ''`, `uploaded_name text`, `uploaded_at timestamptz`. |
| **11** | `2026-08-22 18:07:41` | `20260822180741_1c11e2f0-50a3-4b2e-aeb1-ac125eb8924b.sql` | 1,195 | **User Settings & Preferences**: <br>• Creates table `public.user_settings` (PK `user_id UUID`, `ui_language`, `cv_languages TEXT[]`, `cover_letter_tone`, `interview_depth`, `auto_delete_enabled`, `session_message_cap`, etc.)<br>• Enables RLS with policy `"Users manage their own settings"`<br>• Attaches `user_settings_updated_at` trigger. |
| **12** | `2026-08-22 18:36:52` | `20260822183652_c4239b2e-37d9-4bd8-9632-1ca96e5baf63.sql` | 5,342 | **Application Pipeline, RBAC, AI Usage & Feedback**: <br>• Alters `applications`: adds stage/pipeline columns (`stage`, `applied_at`, `interview_at`, `archived_at`, `outcome_feedback`, `next_action_at`, `last_followup_at`, `offer_summary`, `salary_expectation`)<br>• Alters `user_settings`: adds tracking preference columns (`response_window_days`, `ghost_after_days`, etc.)<br>• Creates ENUM `public.app_role` (`'admin'`, `'user'`)<br>• Creates table `public.user_roles` (PK `id UUID`, UNIQUE `(user_id, role)`, RLS enabled for user and admin)<br>• Creates function `public.has_role(_user_id uuid, _role public.app_role)` (SECURITY DEFINER)<br>• Creates table `public.ai_usage` (token tracking; RLS enabled for admins)<br>• Creates table `public.issue_reports` (error reporting; RLS for users & admins)<br>• Creates table `public.feedback_reviews` (user feedback; RLS for users & admins). |
| **13** | `2026-08-22 18:37:05` | `20260822183705_45b6f753-ff9f-48d7-a06e-a9034cdf2a32.sql` | 244 | **Security Hardening (RBAC Function Permissions)**: <br>• Revokes `has_role` execute from `PUBLIC` and `anon`<br>• Grants `EXECUTE ON FUNCTION public.has_role(...)` to `authenticated, service_role`. |
| **14** | `2026-08-22 19:10:26` | `20260822191026_93b22adf-7e02-4007-b78d-96ce5d440f88.sql` | 714 | **Issue Screenshots & Storage RLS**: <br>• Alters `public.issue_reports`: adds `screenshot_path text`, `client_info jsonb`<br>• Adds storage policies on `storage.objects` for bucket `'issue-screenshots'` (Insert: authenticated user folder; Select: user own screenshot or admin). |
| **15** | `2026-08-22 19:24:30` | `20260822192430_c2c88252-7a27-4c44-afe0-6d64ba4025fc.sql` | 1,421 | **Master Admin Role Protection & Seed**: <br>• Creates function `public.is_master_admin(_user_id uuid)` checking email `'monnameestethan@gmail.com'`<br>• Creates trigger function `public.protect_master_admin()` preventing deletion/demotion of master admin<br>• Attaches `protect_master_admin` trigger to `public.user_roles`<br>• Bootstraps admin role for `'monnameestethan@gmail.com'`. |
| **16** | `2026-08-22 19:24:42` | `20260822192442_d62e1a6f-0176-4754-aac3-416c42fe2758.sql` | 244 | **Security Hardening (Master Admin Function Permissions)**: <br>• Revokes execute on `protect_master_admin()` from `PUBLIC, anon, authenticated`<br>• Revokes execute on `is_master_admin(uuid)` from `PUBLIC, anon, authenticated`<br>• Grants execute on `is_master_admin(uuid)` to `service_role`. |

---

## 5. Comprehensive Database Schema Inventory

### 5.1 Tables (11 Total)

| Table Name | Primary Key | Foreign Keys | RLS Status | Summary of Columns & Purpose |
|---|---|---|---|---|
| `profiles` | `(user_id, language)` | None (FK implicit to auth) | ENABLED + FORCED | Multi-language CV profile (contact info, headline, summary, JSONB experiences/education/skills, photo_url, link_items). |
| `applications` | `id (UUID)` | None | ENABLED + FORCED | Job applications (company, role_title, offer_text, offer_url, status, stage, tailored_cv, cover_letter, match_result, interview_prep, pipeline timestamps). |
| `application_messages` | `id (UUID)` | `application_id -> applications(id) ON DELETE CASCADE` | ENABLED + FORCED | Chat message thread for tailoring and interviewing per application. |
| `candidate_knowledge` | `id (UUID)` | `user_id -> auth.users(id) ON DELETE CASCADE`<br>`source_application_id -> applications(id) ON DELETE SET NULL` | ENABLED + FORCED | Knowledge base Q&A entries extracted from previous applications. |
| `cv_templates` | `user_id (UUID)` | `user_id -> auth.users(id) ON DELETE CASCADE` | ENABLED + FORCED | Custom styling & typography preferences for generated CVs. |
| `role_targets` | `id (UUID)` | `user_id -> auth.users(id) ON DELETE CASCADE` | ENABLED + FORCED | Target roles, seniority, keywords, and pre-generated CV templates by role archetype. |
| `candidate_dossier` | `user_id (UUID)` | `user_id -> auth.users(id) ON DELETE CASCADE` | ENABLED | Raw candidate background text, uploaded document context & metadata. |
| `user_settings` | `user_id (UUID)` | None | ENABLED | UI language, CV languages, tone preferences, auto-delete intervals, and pipeline alert timing. |
| `user_roles` | `id (UUID)` | UNIQUE `(user_id, role)` | ENABLED | RBAC user role assignments (`admin`, `user`). |
| `ai_usage` | `id (UUID)` | None | ENABLED | Token usage telemetry (prompt_tokens, completion_tokens, total_tokens, model, feature). |
| `issue_reports` | `id (UUID)` | None | ENABLED | User bug/issue reports, route, user_agent, screenshot_path, client_info. |
| `feedback_reviews` | `id (UUID)` | `application_id -> applications(id) ON DELETE SET NULL` | ENABLED | User ratings, reviews, testimonial permissions (`may_quote`). |

### 5.2 Custom Types & Enums (1 Total)
- `public.app_role`: `ENUM ('admin', 'user')` (Defined in Migration 12).

### 5.3 Stored Functions (4 Total)
1. `public.set_updated_at()` — Trigger function updating `updated_at = now()`. (M1, hardened in M2).
2. `public.handle_new_user()` — Trigger function inserting initial profile on `auth.users` insert. (M1, updated M3, hardened M2/M3).
3. `public.has_role(_user_id uuid, _role public.app_role)` — Security definer helper checking `user_roles`. (M12, hardened in M13).
4. `public.is_master_admin(_user_id uuid)` & `public.protect_master_admin()` — Trigger and check functions protecting master admin. (M15, hardened in M16).

---

## 6. Migration Dependency, Integrity, and Conflict Analysis

### 6.1 Dependency & Ordering Validation
1. **Chronological Consistency**:
   All 16 migrations are sequenced strictly by timestamp (20260802 -> 20260822). Every reference to a function (e.g., `set_updated_at`) or table (e.g., `applications`) occurs only after that object has been created.
2. **Idempotency & Safety**:
   - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` is used across migrations 3, 7, 10, 12, 14.
   - `CREATE TABLE IF NOT EXISTS` is used across migrations 12.
   - `DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;` is used for `app_role`.
   - `DROP POLICY IF EXISTS` is used before policy re-creation in migrations 12 and 14.
   - `DROP TRIGGER IF EXISTS` is used before trigger creation in migration 15.

### 6.2 Key Warnings & Audit Observations

#### ⚠️ Warning 1: Storage Bucket `'issue-screenshots'` Not Created by Migrations
- **Location**: Migration 14 (`20260822191026_93b22adf-7e02-4007-b78d-96ce5d440f88.sql`)
- **Observation**: The migration defines RLS policies on `storage.objects` for `bucket_id = 'issue-screenshots'`, but does not execute `INSERT INTO storage.buckets (id, name, public) VALUES ('issue-screenshots', 'issue-screenshots', false);`.
- **Impact**: When running on a fresh local Supabase instance or new remote project, user screenshot uploads from the Support dialog (`src/components/support-button.tsx`) will fail with `Bucket not found` until the bucket is created.
- **Recommended Action**: Add a seed statement or migration:
  ```sql
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('issue-screenshots', 'issue-screenshots', false)
  ON CONFLICT (id) DO NOTHING;
  ```

#### ℹ️ Notice 2: Hardcoded Master Admin Email
- **Location**: Migration 15 (`20260822192430_c2c88252-7a27-4c44-afe0-6d64ba4025fc.sql`)
- **Observation**: Hardcodes `'monnameestethan@gmail.com'` for master admin role assignment and protection.
- **Impact**: For local development or production under a different admin identity, admin routes (`/admin`) will return 403 Forbidden unless that email is used or an admin role is manually inserted for the active user:
  ```sql
  INSERT INTO public.user_roles (user_id, role)
  VALUES ('<target-user-uuid>', 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  ```

#### ℹ️ Notice 3: Profiles Table Composite Primary Key
- **Location**: Migration 3 (`20260804142111_99cef2cc-2ad5-485b-8031-a370f229e4a4.sql`)
- **Observation**: The primary key was migrated from `(user_id)` to `(user_id, language)` to support multi-language CVs.
- **Verification**: Verified that `src/lib/profile.functions.ts` uses `{ onConflict: "user_id,language" }` and filters by `user_id` and `language`, matching this composite schema.

---

## 7. Step-by-Step Operational Runbook

### 7.1 Installing Supabase CLI

#### Option A: Via Homebrew (macOS Recommended)
```bash
brew install supabase/tap/supabase
```

#### Option B: Via NPM (Project DevDependency)
```bash
npm install -D supabase
```

#### Option C: Ad-Hoc via NPX
```bash
npx supabase --version
```

---

### 7.2 Local Development Workflow

#### Step 1: Start the Local Supabase Stack
*(Requires Docker Desktop / OrbStack running)*
```bash
supabase start
```
This boots PostgreSQL, PostgREST, GoTrue Auth, Storage, Kong API Gateway, and Supabase Studio UI (default `http://localhost:54323`).

#### Step 2: Apply Migrations & Reset Local Database
```bash
# Applies all 16 migrations sequentially from supabase/migrations/
supabase db reset
```

#### Step 3: Check Migration and Service Status
```bash
supabase migration list
supabase status
```

#### Step 4: Stop Local Services
```bash
supabase stop
```

---

### 7.3 Remote Supabase Deployment Workflow

#### Step 1: Login to Supabase CLI
```bash
supabase login
```

#### Step 2: Link Repository to the Remote Project
```bash
# Using project_id configured in supabase/config.toml
supabase link --project-ref ujxmlukctiijfozyiynu
```

#### Step 3: Inspect Differences Between Local and Remote
```bash
supabase db diff --linked
```

#### Step 4: Push Local Migrations to Remote
```bash
supabase db push
```

#### Step 5: Pull Remote Schema Changes (if modified in Supabase Studio)
```bash
supabase db pull
```

---

### 7.4 TypeScript Type Generation

To keep `src/integrations/supabase/types.ts` synchronized with database migrations:

#### From Local Database:
```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

#### From Linked Remote Project:
```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

#### From Remote Project ID directly:
```bash
supabase gen types typescript --project-id ujxmlukctiijfozyiynu > src/integrations/supabase/types.ts
```

---

### 7.5 Creating New Migrations

```bash
# Create a new timestamped migration file
supabase migration new <migration_description>

# Or auto-generate migration from local database diff
supabase db diff -f <migration_description>
```
