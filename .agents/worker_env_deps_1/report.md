# TailorCV Diagnostic Report: Environment Variables (R2) & Dependencies (R3)

**Author**: `worker_env_deps_1`  
**Timestamp**: 2026-08-24T00:22:00Z  
**Target Root**: `/Users/madecolombia/Developer/TailorCV`  
**Node.js Version**: `v26.7.0` (Live verification)  
**npm Version**: `11.19.0` (Live verification)  

---

## 1. Executive Summary

This diagnostic report provides a comprehensive, live evaluation of the environment configuration (R2) and dependency tree (R3) for TailorCV.

### Key Highlights:
1. **Environment Variables (R2)**:
   - **Critical Finding**: **ZERO `.env*` files exist on disk** (`.env`, `.env.local`, `.env.example`, `.env.sample` are all missing from the project root).
   - **All 6 mandatory environment variables** (client-side and server-side) are currently ❌ **MISSING** from local storage.
   - 2 additional application environment variables were identified during AST / regex scanning: `DOSSIER_ENCRYPTION_KEY` (server-side sensitive AES encryption key) and `VITE_APP_BUILD` (client diagnostics).
   - Without `.env` / `.env.local`, the application will crash immediately upon accessing Supabase or calling AI generation routes due to fail-fast guard clauses in `client.ts`, `client.server.ts`, and `ai-gateway.server.ts`.

2. **Dependencies (R3)**:
   - `node_modules/` was initially ❌ **MISSING** on disk.
   - Live installation via `npm install --offline` was executed, populating `node_modules/` with 789 packages in 8s.
   - Peer dependency conflicts: **0** (clean dependency graph resolution).
   - Several packages are pinned to **pre-release / beta / alpha / RC versions**, notably `nitro@3.0.260603-beta` (and its transitive dependencies `h3@2.0.1-rc.22`, `ofetch@2.0.0-alpha.3`, `unenv@2.0.0-rc.24`, `unstorage@2.0.0-alpha.7`), as well as modern major versions (`vite@^8.1.5` resolving to `8.2.0`, `zod@^4.4.3`, and `@tanstack/react-start@1.168.32`).

---

## 2. Requirement R2: Environment Variable Audit

### 2.1 File System Inspection
A full directory scan was performed in `/Users/madecolombia/Developer/TailorCV` for `.env*` files:
```sh
$ ls -la .env*
zsh: no matches found: .env*

$ find . -maxdepth 2 -name "*env*"
(0 results found)
```
**Status**: No `.env`, `.env.local`, `.env.development`, `.env.production`, or `.env.example` file exists in the repository.

---

### 2.2 Variable Classification Table

| # | Variable Name | Scope | Required / Optional | Status | Value Format / Expected | Code Location |
|---|---------------|-------|---------------------|--------|-------------------------|---------------|
| 1 | `VITE_SUPABASE_URL` | Client (Vite) | **MANDATORY** | ❌ **MISSING** | `https://<project-id>.supabase.co` | `src/integrations/supabase/client.ts:34` |
| 2 | `VITE_SUPABASE_PUBLISHABLE_KEY` | Client (Vite) | **MANDATORY** | ❌ **MISSING** | `sb_publishable_...` or JWT `eyJ...` | `src/integrations/supabase/client.ts:35` |
| 3 | `SUPABASE_URL` | Server (SSR/Nitro) | **MANDATORY** | ❌ **MISSING** | `https://<project-id>.supabase.co` | `src/integrations/supabase/client.server.ts:33`, `auth-middleware.ts:36`, `supabase-user.server.ts:10` |
| 4 | `SUPABASE_SERVICE_ROLE_KEY` | Server (SSR/Nitro) | **MANDATORY** | ❌ **MISSING** | `sb_secret_...` or JWT `eyJ...` (Secret admin key) | `src/integrations/supabase/client.server.ts:34` |
| 5 | `SUPABASE_PUBLISHABLE_KEY` | Server (SSR/Nitro) | **MANDATORY** | ❌ **MISSING** | `sb_publishable_...` or JWT `eyJ...` | `src/integrations/supabase/auth-middleware.ts:37`, `client.ts:35`, `supabase-user.server.ts:11` |
| 6 | `LOVABLE_API_KEY` | Server (SSR/Nitro) | **MANDATORY** | ❌ **MISSING** | Lovable Gateway API Token (e.g. `lov_...` or UUID) | `src/lib/ai-gateway.server.ts:18` |
| 7 | `DOSSIER_ENCRYPTION_KEY` | Server (SSR/Nitro) | Optional / Recommended | ❌ **MISSING** | 32+ char secret string for AES-256-GCM | `src/lib/crypto.server.ts:26`, `src/lib/settings.functions.ts:20` |
| 8 | `VITE_APP_BUILD` | Client (Vite) | Optional | ❌ **MISSING** | Build ID string (defaults to `"dev"`) | `src/lib/client-info.ts:4` |

---

### 2.3 Detailed Codebase Usage & Fallback Analysis

#### A. Client Supabase Client (`src/integrations/supabase/client.ts`)
- **Reading mechanism**:
  ```ts
  const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] || process.env['SUPABASE_PUBLISHABLE_KEY'];
  ```
- **Failure behavior**: Throws a hard error when accessed if both are undefined:
  ```ts
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [...];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  ```
- **Key formats supported**: Supports both legacy JWT tokens and new opaque API keys starting with `sb_publishable_` or `sb_secret_`.

#### B. Server Supabase Admin Client (`src/integrations/supabase/client.server.ts`)
- **Reading mechanism**: `process.env['SUPABASE_URL']` and `process.env['SUPABASE_SERVICE_ROLE_KEY']`.
- **Failure behavior**: Throws `Missing Supabase environment variable(s)` when `supabaseAdmin` proxy is invoked.
- **Security Notice**: Bypasses Row-Level Security (RLS); must only be used in server handlers and never exposed to the client.

#### C. Auth Middleware & User Scoped Client (`src/integrations/supabase/auth-middleware.ts`, `src/lib/supabase-user.server.ts`)
- **Reading mechanism**: `process.env['SUPABASE_URL']` and `process.env['SUPABASE_PUBLISHABLE_KEY']`.
- **Purpose**: Authenticates incoming Bearer tokens using `supabase.auth.getClaims(token)` with RLS enforced.

#### D. Lovable AI Gateway (`src/lib/ai-gateway.server.ts`)
- **Reading mechanism**: `process.env['LOVABLE_API_KEY']` via `requireApiKey()`.
- **Target URL**: `https://ai.gateway.lovable.dev/v1/chat/completions`.
- **Model**: `openai/gpt-5.6-sol`.
- **Headers**: `"Lovable-API-Key": requireApiKey()`, `"X-Lovable-AIG-SDK": "vercel-ai-sdk"`.
- **Failure behavior**: Throws `Error("AI is not configured for this project.")` if `LOVABLE_API_KEY` is missing.

#### E. Dossier Encryption Key (`src/lib/crypto.server.ts`)
- **Reading mechanism**: `process.env['DOSSIER_ENCRYPTION_KEY']`.
- **Behavior**: Uses SHA-256 digest of the key to initialize AES-256-GCM envelope encryption. If missing, encryption is bypassed and plaintext is returned directly without throwing an exception.

---

### 2.4 Recommended `.env.example` Template
To remediate the missing environment variables, create `.env` (or `.env.local`) based on the following template:

```env
# =============================================================================
# TailorCV Environment Variables
# =============================================================================

# --- Client-side Supabase Configuration (Vite) ---
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key

# --- Server-side Supabase Configuration (SSR / Nitro) ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key

# --- Lovable AI Gateway ---
LOVABLE_API_KEY=your-lovable-api-key

# --- Optional / Recommended Server Secrets ---
DOSSIER_ENCRYPTION_KEY=your-random-32-character-secret-key
VITE_APP_BUILD=local-dev
```

---

## 3. Requirement R3: Dependency Audit

### 3.1 Runtime & Package Manager Environment
Verbatim command execution results:
- `node -v` => `v26.7.0`
- `npm -v` => `11.19.0`
- `bun -v` => `zsh: command not found: bun`

---

### 3.2 `node_modules` Directory Status
- **Initial state**: ❌ `node_modules/` was NOT present on disk.
- **Remediation & Live Install**: Executed `npm install --offline`.
- **Current state**: ✅ `node_modules/` is present and verified with `789` packages installed.

---

### 3.3 Live `npm install` Output (Verbatim)

```
npm warn deprecated tsconfck@3.1.6: unmaintained
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated recharts@2.15.4: 1.x and 2.x branches are no longer active. Bump to Recharts v3 to receive latest features and bugfixes. See https://github.com/recharts/recharts/wiki/3.0-migration-guide

added 789 packages, and audited 790 packages in 8s

239 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
npm warn install-scripts 3 packages have install scripts not yet covered by allowScripts:
npm warn install-scripts   fsevents@2.3.3 (install: (install scripts present))
npm warn install-scripts   core-js@3.50.0 (postinstall: node -e "try{require('./postinstall')}catch(e){}")
npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
```

#### Peer Dependency Status:
- `npm install` and `npm ls --depth=0` completed with **exit code 0**.
- **No peer-dependency conflicts or blocking errors** were reported.

---

### 3.4 Audit of Pre-Release, Beta, Alpha & Pinned Dependencies

An exhaustive audit of `package.json` and `package-lock.json` was conducted to isolate packages pinned to non-release, beta, or pre-release channels:

| Package | Locked / Resolved Version | Channel / Classification | Risk Assessment / Notes |
|---------|---------------------------|--------------------------|-------------------------|
| **`nitro`** | `3.0.260603-beta` | ⚠️ **Beta Build** (Pre-release) | Pinned explicitly in `devDependencies`. Powers the server build for TanStack Start SSR. |
| **`h3`** | `2.0.1-rc.22` | ⚠️ **Release Candidate** (RC) | Transitive dependency of `nitro`. Pre-release HTTP framework core. |
| **`ofetch`** | `2.0.0-alpha.3` | ⚠️ **Alpha Build** | Transitive dependency of `nitro`. Pre-release fetch wrapper. |
| **`unenv`** | `2.0.0-rc.24` | ⚠️ **Release Candidate** (RC) | Transitive dependency of `nitro`. Pre-release Node/edge polyfill. |
| **`unstorage`** | `2.0.0-alpha.7` | ⚠️ **Alpha Build** | Transitive dependency of `nitro`. Pre-release key-value storage layer. |
| **`@rolldown/pluginutils`** | `1.0.0-rc.3` | ⚠️ **Release Candidate** (RC) | Transitive bundler utility. |
| **`@emnapi/runtime`** | `2.0.0-alpha.3` | ⚠️ **Alpha Build** | Transitive WASM / N-API bridge. |
| **`@emnapi/core`** | `2.0.0-alpha.3` | ⚠️ **Alpha Build** | Transitive WASM / N-API bridge. |
| **`date-fns-jalali`** | `4.1.0-0` | ⚠️ **Pre-release tag** | Transitive date parsing helper. |
| **`vite`** | `^8.1.5` (`8.2.0`) | ⚠️ **Cutting-Edge Major** | Bleeding-edge major release. |
| **`zod`** | `^4.4.3` (`4.4.3`) | ⚠️ **Major Version 4** | Standard production ecosystems often use Zod v3; Zod v4 syntax must be maintained. |
| **`@tanstack/react-start`** | `1.168.32` | ℹ️ **Rapid Release Cycle** | Active development line for TanStack Start SSR framework. |

---

## 4. Prioritized Action Items for Environment & Dependencies

1. 🔴 **BLOCKER: Create `.env` / `.env.local` file**
   - Populate all 6 mandatory variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `LOVABLE_API_KEY`).
   - Create `.env.example` in source control so developers know what keys are required.

2. 🟡 **WARNING: Maintain Dependency Pinning for Nitro v3 Ecosystem**
   - Because `@lovable.dev/vite-tanstack-config` and TanStack Start depend on `nitro 3.0.260603-beta`, do not run unconstrained `npm update` that could mismatch Nitro beta versions with TanStack router plugins.

3. 🟢 **NICE TO HAVE: Set `DOSSIER_ENCRYPTION_KEY`**
   - Generate a 32+ character random string for `DOSSIER_ENCRYPTION_KEY` in production to enable envelope encryption for candidate profiles.

4. 🟢 **NICE TO HAVE: Deprecation Cleanups**
   - Update `recharts` to v3 when breaking changes are accommodated.
   - Replace or update `glob` and `tsconfck` dependencies if upstream packages release patches.
