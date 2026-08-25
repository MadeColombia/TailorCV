# Requirement R1: Dead Code & Unused File Analysis Report

**Project**: TailorCV  
**Audit Date**: 2026-08-24  
**Auditor**: Explorer Agent (R1 Specialist)  
**Scope**: All source code under `/Users/madecolombia/Developer/TailorCV/src`  
**Methodology**: Static AST Graph Traversal (TypeScript Compiler API), Dynamic Import Tracking, Transitive Dependency Reachability Analysis, Cross-Reference Verification with `ripgrep`.

---

## Executive Summary & Metrics

A comprehensive static analysis of the 130 files across `src/` was conducted to identify all orphan files, unrendered React components, uncalled server/client functions, test-only exports, and unused type definitions.

### Key Metrics Summary
| Category | Total Count | Impact / Recommendation |
|---|---|---|
| **Completely Dead Files** | **27 files** | Safe to delete immediately; 0 incoming imports in production or tests |
| **Unused React Components / Sub-components** | **42 components** | Prune or remove unused exports in active component files |
| **Unused Server Functions (`createServerFn`)** | **8 functions** | Remove unused server endpoints to reduce attack surface and bundle size |
| **Unused Client Functions & Hooks** | **17 functions/hooks** | Prune unused utilities and hooks |
| **Unused Exported Constants & Variables** | **38 items** | Safe to remove or make internal |
| **Test-Only Exports (Unused in Production)** | **7 items** | Internalize or keep if unit tests validate internal algorithms |
| **Unused Exported Types & Interfaces** | **93 types** | Prune redundant interface and type definitions |
| **Unused npm Dependencies in `package.json`** | **19 packages** | Dependencies exclusively required by dead UI components |

---

## Architecture & Entry Point Discovery

The application uses **TanStack Start** (SSR full-stack framework on Vite) with **TanStack Router** file-based routing and **Supabase**.

### Standard Entry Points (Excluded from Dead Code Candidates):
1. **Server Entry**: `/Users/madecolombia/Developer/TailorCV/src/server.ts` (configured in `vite.config.ts` via `tanstackStart({ server: { entry: "server" } })`)
2. **Start Configuration**: `/Users/madecolombia/Developer/TailorCV/src/start.ts` (configures auth, CSRF, security headers, error middlewares)
3. **Client Router**: `/Users/madecolombia/Developer/TailorCV/src/router.tsx`
4. **Generated Route Tree**: `/Users/madecolombia/Developer/TailorCV/src/routeTree.gen.ts`
5. **Route Files** (`src/routes/`):
   - `src/routes/__root.tsx` (Root route layout)
   - `src/routes/index.tsx` (`/`)
   - `src/routes/auth.tsx` (`/auth`)
   - `src/routes/api/chat.ts` (`/api/chat`)
   - `src/routes/_authenticated/route.tsx` (`/_authenticated` layout)
   - `src/routes/_authenticated/admin.tsx` (`/admin`)
   - `src/routes/_authenticated/dashboard.tsx` (`/dashboard`)
   - `src/routes/_authenticated/profile.tsx` (`/profile`)
   - `src/routes/_authenticated/settings.tsx` (`/settings`)
   - `src/routes/_authenticated/applications.$id.tsx` (`/applications/$id`)
   - `src/routes/_authenticated/targets.index.tsx` (`/targets`)
   - `src/routes/_authenticated/targets.$id.tsx` (`/targets/$id`)
6. **Global Stylesheet**: `/Users/madecolombia/Developer/TailorCV/src/styles.css`
7. **Test Suites**: 14 Vitest suites matching `src/**/*.test.ts`

---

## Section 1: Completely Dead Files (27 Files)

These 27 files have **0 reachability** from any production route, server entry, or test file. They represent unused Shadcn-UI boilerplate components and an unused mobile hook.

### 1.1 Standalone Unused UI Components (23 Files)
These components were generated during UI scaffolding but are never imported anywhere in the project:

1. `/Users/madecolombia/Developer/TailorCV/src/components/ui/alert.tsx`
2. `/Users/madecolombia/Developer/TailorCV/src/components/ui/aspect-ratio.tsx`
3. `/Users/madecolombia/Developer/TailorCV/src/components/ui/avatar.tsx`
4. `/Users/madecolombia/Developer/TailorCV/src/components/ui/breadcrumb.tsx`
5. `/Users/madecolombia/Developer/TailorCV/src/components/ui/calendar.tsx`
6. `/Users/madecolombia/Developer/TailorCV/src/components/ui/carousel.tsx`
7. `/Users/madecolombia/Developer/TailorCV/src/components/ui/chart.tsx`
8. `/Users/madecolombia/Developer/TailorCV/src/components/ui/collapsible.tsx`
9. `/Users/madecolombia/Developer/TailorCV/src/components/ui/context-menu.tsx`
10. `/Users/madecolombia/Developer/TailorCV/src/components/ui/drawer.tsx`
11. `/Users/madecolombia/Developer/TailorCV/src/components/ui/form.tsx`
12. `/Users/madecolombia/Developer/TailorCV/src/components/ui/input-otp.tsx`
13. `/Users/madecolombia/Developer/TailorCV/src/components/ui/menubar.tsx`
14. `/Users/madecolombia/Developer/TailorCV/src/components/ui/navigation-menu.tsx`
15. `/Users/madecolombia/Developer/TailorCV/src/components/ui/pagination.tsx`
16. `/Users/madecolombia/Developer/TailorCV/src/components/ui/popover.tsx`
17. `/Users/madecolombia/Developer/TailorCV/src/components/ui/radio-group.tsx`
18. `/Users/madecolombia/Developer/TailorCV/src/components/ui/resizable.tsx`
19. `/Users/madecolombia/Developer/TailorCV/src/components/ui/scroll-area.tsx`
20. `/Users/madecolombia/Developer/TailorCV/src/components/ui/slider.tsx`
21. `/Users/madecolombia/Developer/TailorCV/src/components/ui/table.tsx`
22. `/Users/madecolombia/Developer/TailorCV/src/components/ui/toggle-group.tsx`
23. `/Users/madecolombia/Developer/TailorCV/src/components/ui/sidebar.tsx`

### 1.2 Transitively Dead Files (4 Files)
These files appear to be imported by other files, but their importing parents are themselves dead:
1. `/Users/madecolombia/Developer/TailorCV/src/components/ui/sheet.tsx`
   - *Dependency analysis*: Imported ONLY by `src/components/ui/sidebar.tsx` (line 17). Because `sidebar.tsx` is dead, `sheet.tsx` is transitively dead.
2. `/Users/madecolombia/Developer/TailorCV/src/components/ui/skeleton.tsx`
   - *Dependency analysis*: Imported ONLY by `src/components/ui/sidebar.tsx` (line 18). Because `sidebar.tsx` is dead, `skeleton.tsx` is transitively dead.
3. `/Users/madecolombia/Developer/TailorCV/src/components/ui/toggle.tsx`
   - *Dependency analysis*: Imported ONLY by `src/components/ui/toggle-group.tsx` (line 8). Because `toggle-group.tsx` is dead, `toggle.tsx` is transitively dead.
4. `/Users/madecolombia/Developer/TailorCV/src/hooks/use-mobile.tsx`
   - *Dependency analysis*: Imported ONLY by `src/components/ui/sidebar.tsx` (line 6). Because `sidebar.tsx` is dead, `use-mobile.tsx` is transitively dead.

---

## Section 2: Unused React Components in Active Files (42 Items)

In active files that are imported and rendered in the app, several exported sub-components are never imported or rendered anywhere.

### 2.1 Unused Components in `src/components/ai-elements/`
- **`src/components/ai-elements/conversation.tsx`**:
  - Line 132: `ConversationDownload` (VariableStatement) — download trigger component never rendered in `applications.$id.tsx`.
- **`src/components/ai-elements/message.tsx`**:
  - Line 65: `MessageActions` (VariableStatement)
  - Line 80: `MessageAction` (VariableStatement)
  - Line 141: `MessageBranch` (VariableStatement)
  - Line 194: `MessageBranchContent` (VariableStatement)
  - Line 227: `MessageBranchSelector` (VariableStatement)
  - Line 252: `MessageBranchPrevious` (VariableStatement)
  - Line 275: `MessageBranchNext` (VariableStatement)
  - Line 298: `MessageBranchPage` (VariableStatement)
  - Line 341: `MessageToolbar` (VariableStatement)
- **`src/components/ai-elements/prompt-input.tsx`**:
  - Line 248: `PromptInputProvider` (VariableStatement)
  - Line 398: `LocalReferencedSourcesContext` (VariableStatement)
  - Line 417: `PromptInputActionAddAttachments` (VariableStatement)
  - Line 444: `PromptInputActionAddScreenshot` (VariableStatement)
  - Line 945: `PromptInputBody` (VariableStatement)
  - Line 1076: `PromptInputHeader` (VariableStatement)
  - Line 1105: `PromptInputTools` (VariableStatement)
  - Line 1127: `PromptInputButton` (VariableStatement)
  - Line 1170: `PromptInputActionMenu` (VariableStatement)
  - Line 1176: `PromptInputActionMenuTrigger` (VariableStatement)
  - Line 1191: `PromptInputActionMenuContent` (VariableStatement)
  - Line 1201: `PromptInputActionMenuItem` (VariableStatement)
  - Line 1267: `PromptInputSelect` (VariableStatement)
  - Line 1275: `PromptInputSelectTrigger` (VariableStatement)
  - Line 1293: `PromptInputSelectContent` (VariableStatement)
  - Line 1302: `PromptInputSelectItem` (VariableStatement)
  - Line 1311: `PromptInputSelectValue` (VariableStatement)
  - Line 1320: `PromptInputHoverCard` (VariableStatement)
  - Line 1332: `PromptInputHoverCardTrigger` (VariableStatement)
  - Line 1340: `PromptInputHoverCardContent` (VariableStatement)
  - Line 1349: `PromptInputTabsList` (VariableStatement)
  - Line 1356: `PromptInputTab` (VariableStatement)
  - Line 1363: `PromptInputTabLabel` (VariableStatement)
  - Line 1380: `PromptInputTabBody` (VariableStatement)
  - Line 1389: `PromptInputTabItem` (VariableStatement)
  - Line 1404: `PromptInputCommand` (VariableStatement)
  - Line 1411: `PromptInputCommandInput` (VariableStatement)
  - Line 1420: `PromptInputCommandList` (VariableStatement)
  - Line 1429: `PromptInputCommandEmpty` (VariableStatement)
  - Line 1438: `PromptInputCommandGroup` (VariableStatement)
  - Line 1447: `PromptInputCommandItem` (VariableStatement)
  - Line 1458: `PromptInputCommandSeparator` (VariableStatement)

---

## Section 3: Unused Server Functions & Backend Handlers (8 Functions)

These backend server functions are exported but are **never invoked** by any client component, route loader, or backend handler:

| File Path | Line | Function Name | Description & Reason Unused |
|---|---|---|---|
| `/Users/madecolombia/Developer/TailorCV/src/lib/applications.functions.ts` | 175 | `getCandidateKnowledge` | Query function for `candidate_knowledge` table; superseded by direct dossier loading |
| `/Users/madecolombia/Developer/TailorCV/src/lib/applications.functions.ts` | 615 | `setSalaryExpectation` | Mutation for `applications.salary_expectation`; UI form inputs update salary via full application patch |
| `/Users/madecolombia/Developer/TailorCV/src/lib/applications.functions.ts` | 665 | `updateOfferSummary` | Manual offer summary patch; UI exclusively uses `summariseOffer` (auto-summary) |
| `/Users/madecolombia/Developer/TailorCV/src/lib/feedback.functions.ts` | 63 | `listMyReviews` | Lists reviews for current user; review history is not currently rendered in settings/dashboard |
| `/Users/madecolombia/Developer/TailorCV/src/lib/template.functions.ts` | 36 | `setApplicationTemplate` | Per-application visual override; application templates currently inherit user-wide template |
| `/Users/madecolombia/Developer/TailorCV/src/lib/ai-gateway.server.ts` | 43 | `recordUsage` | Export is unused externally (used only internally by `callGateway` at line 93) |
| `/Users/madecolombia/Developer/TailorCV/src/lib/crypto.server.ts` | 36 | `isEncrypted` | Exported helper; `dossier.server.ts` imports `encryptText`/`decryptText` directly |
| `/Users/madecolombia/Developer/TailorCV/src/lib/dossier.server.ts` | 48 | `saveDossier` | Exported helper; application code updates dossier via `saveUploadedContext` or `mergeAnswerIntoDossier` |

---

## Section 4: Unused Client Functions, Hooks, and Utilities (17 Items)

| File Path | Line | Name | Kind |
|---|---|---|---|
| `src/components/ai-elements/conversation.tsx` | 124 | `messagesToMarkdown` | FunctionDeclaration |
| `src/components/ai-elements/prompt-input.tsx` | 213 | `usePromptInputController` | VariableStatement (Hook) |
| `src/components/ai-elements/prompt-input.tsx` | 227 | `useProviderAttachments` | VariableStatement (Hook) |
| `src/components/ai-elements/prompt-input.tsx` | 374 | `usePromptInputAttachments` | VariableStatement (Hook) |
| `src/components/ai-elements/prompt-input.tsx` | 401 | `usePromptInputReferencedSources` | VariableStatement (Hook) |
| `src/lib/cv.ts` | 56 | `isProfileLanguage` | FunctionDeclaration |
| `src/lib/error-capture.ts` | 18 | `describeError` | FunctionDeclaration |
| `src/lib/pipeline.ts` | 48 | `daysSince` | FunctionDeclaration |
| `src/lib/pipeline.ts` | 78 | `responseLikelihood` | FunctionDeclaration |
| `src/lib/pipeline.ts` | 262 | `archiveExpired` | FunctionDeclaration |
| `src/lib/ui-strings.ts` | 212 | `uiStrings` | FunctionDeclaration |
| `src/lib/ui-strings.ts` | 216 | `readStoredUiLanguage` | FunctionDeclaration |
| `src/lib/ui-strings.ts` | 228 | `useUiLanguage` | FunctionDeclaration |
| `src/lib/user-settings.ts` | 60 | `normalizeDepth` | FunctionDeclaration |
| `src/lib/user-settings.ts` | 66 | `depthMaxQuestions` | FunctionDeclaration |
| `src/lib/user-settings.ts` | 131 | `normalizeCvLanguages` | FunctionDeclaration |
| `src/integrations/supabase/types.ts` | 658 | `Constants` | VariableStatement |

---

## Section 5: Unused Exported Constants and Variables (38 Items)

These constants and sub-component primitives are exported from active files but never imported:

- `src/components/application-tracker.tsx:404`: `PIPELINE_STAGES` (re-export)
- `src/components/ui/alert-dialog.tsx`: `AlertDialogPortal` (L105), `AlertDialogOverlay` (L106)
- `src/components/ui/badge.tsx`: `badgeVariants` (L32)
- `src/components/ui/button-group.tsx`: `ButtonGroupSeparator` (L80), `buttonGroupVariants` (L82)
- `src/components/ui/card.tsx`: `CardFooter` (L55), `CardDescription` (L55)
- `src/components/ui/command.tsx`: `CommandDialog` (L135), `CommandShortcut` (L141)
- `src/components/ui/dialog.tsx`: `DialogPortal` (L95), `DialogOverlay` (L96), `DialogClose` (L98)
- `src/components/ui/dropdown-menu.tsx`: `DropdownMenuCheckboxItem` (L176), `DropdownMenuRadioItem` (L177), `DropdownMenuLabel` (L178), `DropdownMenuSeparator` (L179), `DropdownMenuShortcut` (L180), `DropdownMenuGroup` (L181), `DropdownMenuPortal` (L182), `DropdownMenuSub` (L183), `DropdownMenuSubContent` (L184), `DropdownMenuSubTrigger` (L185), `DropdownMenuRadioGroup` (L186)
- `src/components/ui/input-group.tsx`: `InputGroupText` (L167), `InputGroupInput` (L168)
- `src/components/ui/select.tsx`: `SelectGroup` (L143), `SelectLabel` (L147), `SelectSeparator` (L149), `SelectScrollUpButton` (L150), `SelectScrollDownButton` (L151)
- `src/lib/client-info.ts`: `APP_BUILD` (L3)
- `src/lib/cv.ts`: `CV_SECTION_LABELS` (L253)
- `src/lib/interview-prep.ts`: `PREP_CATEGORIES` (L1)
- `src/lib/pipeline.ts`: `DAY_MS` (L45), `DEFAULT_WINDOWS` (L67)
- `src/lib/ui-strings.ts`: `UI_LANGUAGE_KEY` (L8)

*(Note: `src/server.ts:47 export default` is TanStack Start's server handler entry point and is active).*

---

## Section 6: Test-Only Exports (7 Items)

These functions and constants are only imported and tested inside `.test.ts` test suites, but have **0 callers in actual production application code**:

1. `src/lib/cv.ts:128`: `normalizeLinkItems` (Tested in `src/lib/cv.test.ts`)
2. `src/lib/cv.ts:146`: `guessLinkLabel` (Tested in `src/lib/cv.test.ts`)
3. `src/lib/cv.ts:155`: `linkItemsToLine` (Tested in `src/lib/cv.test.ts`)
4. `src/lib/dossier.ts:8`: `DOSSIER_MAX_CHARS` (Tested in `src/lib/dossier.test.ts`)
5. `src/lib/dossier.ts:48`: `isDossierEmpty` (Tested in `src/lib/dossier.test.ts`)
6. `src/lib/dossier.ts:55`: `UPLOADED_MAX_CHARS` (Tested in `src/lib/dossier.test.ts`)
7. `src/lib/offer-parse.ts:22`: `findJobPosting` (Tested in `src/lib/offer-parse.test.ts`)

*Recommendation*: If these helper routines are obsolete or replaced by newer logic (e.g. `normalizeDossier`), clean them up together with their test assertions.

---

## Section 7: Unused Types and Interfaces (93 Items)

The codebase contains 93 exported TypeScript types/interfaces with 0 external references. Key examples include:
- **`src/lib/ai-gateway.server.ts`**: `GatewayMessage` (L21), `UsageRecord` (L30)
- **`src/lib/chat-client.ts`**: `ChatRole` (L1)
- **`src/lib/chat-guard.ts`**: `GuardVerdict` (L10)
- **`src/lib/client-info.ts`**: `ClientInfo` (L6)
- **`src/lib/cv-template.ts`**: `TemplateId` (L1), `TemplateFont` (L2), `TemplateDensity` (L3)
- **`src/lib/cv.ts`**: `Experience` (L1), `Education` (L10), `LinkItem` (L18)
- **`src/lib/dossier.server.ts`**: `DossierParts` (L12)
- **`src/lib/interview-prep.ts`**: `PrepCategory` (L2), `PrepQuestion` (L4)
- **`src/lib/notifications.ts`**: `NotificationEvent` (L7)
- **`src/lib/pipeline.ts`**: `PipelineTone` (L94), `PipelineHealth` (L96), `PipelineRow` (L107)
- **`src/lib/profile-strings.ts`**: `ProfileStrings` (L2)
- **`src/lib/ui-strings.ts`**: `UiStrings` (L10)
- **`src/lib/user-settings.ts`**: `CoverLetterTone` (L29), `InterviewDepth` (L58)
- **`src/integrations/supabase/types.ts`**: `Json` (L1), `Tables` (L545), `TablesInsert` (L574), `TablesUpdate` (L599), `Enums` (L624), `CompositeTypes` (L641)

---

## Section 8: Unused npm Packages in `package.json` (19 Packages)

Because 27 UI component files are dead, 19 npm packages in `dependencies` are exclusively imported by dead files or never imported anywhere in `src/`:

### Packages used ONLY in dead UI components:
1. `@radix-ui/react-aspect-ratio` (used in dead `aspect-ratio.tsx`)
2. `@radix-ui/react-avatar` (used in dead `avatar.tsx`)
3. `@radix-ui/react-collapsible` (used in dead `collapsible.tsx`)
4. `@radix-ui/react-context-menu` (used in dead `context-menu.tsx`)
5. `@radix-ui/react-menubar` (used in dead `menubar.tsx`)
6. `@radix-ui/react-navigation-menu` (used in dead `navigation-menu.tsx`)
7. `@radix-ui/react-popover` (used in dead `popover.tsx`)
8. `@radix-ui/react-radio-group` (used in dead `radio-group.tsx`)
9. `@radix-ui/react-scroll-area` (used in dead `scroll-area.tsx`)
10. `@radix-ui/react-slider` (used in dead `slider.tsx`)
11. `@radix-ui/react-toggle` (used in dead `toggle.tsx`)
12. `@radix-ui/react-toggle-group` (used in dead `toggle-group.tsx`)
13. `embla-carousel-react` (used in dead `carousel.tsx`)
14. `input-otp` (used in dead `input-otp.tsx`)
15. `react-day-picker` (used in dead `calendar.tsx`)
16. `react-resizable-panels` (used in dead `resizable.tsx`)
17. `recharts` (used in dead `chart.tsx`)
18. `vaul` (used in dead `drawer.tsx`)
19. `react-hook-form` (used in dead `form.tsx` — active forms use standard uncontrolled inputs or simple state)

---

## Section 9: Dynamic Import & Routing Verification

We investigated whether any of the 27 dead files could be loaded dynamically at runtime:
1. **Dynamic `import(...)` Audit**:
   All dynamic imports in the codebase were inspected. They target:
   - `@tanstack/react-start/server-entry` (in `src/server.ts`)
   - `@/lib/crypto.server` (in `src/lib/dossier.server.ts`)
   - `@/lib/ai-gateway.server` (in `src/lib/dossier.server.ts`, `src/lib/applications.functions.ts`)
   - `@/lib/dossier.server` (in `src/lib/applications.functions.ts`, `src/lib/settings.functions.ts`, `src/lib/targets.functions.ts`, `src/lib/user-settings.functions.ts`, `src/routes/api/chat.ts`)
   - `@/integrations/supabase/client.server` (in `src/lib/admin.functions.ts`, `src/lib/ai-gateway.server.ts`)
   - `@/lib/offer-summary` (in `src/lib/applications.functions.ts`)
   - `@/lib/supabase-user.server` (in `src/routes/api/chat.ts`)
   - `@/lib/user-settings.server` (in `src/lib/applications.functions.ts`, `src/lib/user-settings.functions.ts`, `src/routes/api/chat.ts`)
   - `@/lib/cv` (in `src/routes/api/chat.ts`)
   - `@/lib/interview-prep` (in `src/routes/api/chat.ts`)
   - `@/lib/cv-pdf` (in `src/routes/_authenticated/applications.$id.tsx`, `src/routes/_authenticated/targets.$id.tsx`)
   - `@/lib/user-settings` (in `src/routes/_authenticated/applications.$id.tsx`)
2. **TanStack Router File-Based Routing**:
   The TanStack Router plugin generates `src/routeTree.gen.ts` from files in `src/routes/`. No route files import or reference any of the 27 dead files.
3. **Verdict**: **None** of the 27 dead files are referenced directly or dynamically.

---

## Section 10: Summary & Actionable Cleanup Recommendations

1. **Delete Dead UI Files**: Safely remove all 27 files in Section 1.
2. **Remove Dead npm Dependencies**: Remove the 19 unused Radix/charting/carousel dependencies from `package.json`.
3. **Deprecate Unused Server Functions**: Remove the 5 unused server functions (`getCandidateKnowledge`, `setSalaryExpectation`, `updateOfferSummary`, `listMyReviews`, `setApplicationTemplate`) to eliminate unused endpoints and reduce server bundle footprint.
4. **Codebase Status**: Read-only investigation completed without any modifications to source code (`git status` is clean).
