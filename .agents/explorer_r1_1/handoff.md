# Handoff Report: Requirement R1 (Dead Code & Unused File Analysis)

**Task**: Requirement R1: Dead Code & Unused File Analysis for the TailorCV project  
**Agent**: Explorer 1 (`explorer_r1_1`)  
**Target Path**: `/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/analysis.md`  
**Working Directory**: `/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1`  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

### Codebase Inventory & Entry Points
- Scanned 130 files across `src/`.
- Entry points identified:
  - Framework entry: `src/server.ts`, `src/start.ts`, `src/router.tsx`, `src/routeTree.gen.ts`, `src/styles.css`.
  - 12 route modules in `src/routes/` (`__root.tsx`, `auth.tsx`, `index.tsx`, `api/chat.ts`, `_authenticated/route.tsx`, `_authenticated/admin.tsx`, `_authenticated/dashboard.tsx`, `_authenticated/profile.tsx`, `_authenticated/settings.tsx`, `_authenticated/applications.$id.tsx`, `_authenticated/targets.index.tsx`, `_authenticated/targets.$id.tsx`).
  - 14 test suites in `src/lib/*.test.ts`.

### Unused Files Directly Observed (27 Files)
Direct AST import tracing and reachability analysis proved that 27 files have 0 reachability from any route, server entry, or test:
1. `src/components/ui/alert.tsx`
2. `src/components/ui/aspect-ratio.tsx`
3. `src/components/ui/avatar.tsx`
4. `src/components/ui/breadcrumb.tsx`
5. `src/components/ui/calendar.tsx`
6. `src/components/ui/carousel.tsx`
7. `src/components/ui/chart.tsx`
8. `src/components/ui/collapsible.tsx`
9. `src/components/ui/context-menu.tsx`
10. `src/components/ui/drawer.tsx`
11. `src/components/ui/form.tsx`
12. `src/components/ui/input-otp.tsx`
13. `src/components/ui/menubar.tsx`
14. `src/components/ui/navigation-menu.tsx`
15. `src/components/ui/pagination.tsx`
16. `src/components/ui/popover.tsx`
17. `src/components/ui/radio-group.tsx`
18. `src/components/ui/resizable.tsx`
19. `src/components/ui/scroll-area.tsx`
20. `src/components/ui/sheet.tsx` (imported only by dead `sidebar.tsx:17`)
21. `src/components/ui/sidebar.tsx` (0 incoming imports)
22. `src/components/ui/skeleton.tsx` (imported only by dead `sidebar.tsx:18`)
23. `src/components/ui/slider.tsx`
24. `src/components/ui/table.tsx`
25. `src/components/ui/toggle-group.tsx`
26. `src/components/ui/toggle.tsx` (imported only by dead `toggle-group.tsx:8`)
27. `src/hooks/use-mobile.tsx` (imported only by dead `sidebar.tsx:6`)

### Unused Server Functions (`createServerFn`)
- `src/lib/applications.functions.ts:175` (`getCandidateKnowledge`)
- `src/lib/applications.functions.ts:615` (`setSalaryExpectation`)
- `src/lib/applications.functions.ts:665` (`updateOfferSummary`)
- `src/lib/feedback.functions.ts:63` (`listMyReviews`)
- `src/lib/template.functions.ts:36` (`setApplicationTemplate`)

### Unused React Sub-Components in Active Files (42 Components)
- `src/components/ai-elements/conversation.tsx`: `ConversationDownload` (L132)
- `src/components/ai-elements/message.tsx`: `MessageActions` (L65), `MessageAction` (L80), `MessageBranch` (L141), `MessageBranchContent` (L194), `MessageBranchSelector` (L227), `MessageBranchPrevious` (L252), `MessageBranchNext` (L275), `MessageBranchPage` (L298), `MessageToolbar` (L341)
- `src/components/ai-elements/prompt-input.tsx`: 32 sub-components (L248, L398, L417, L444, L945, L1076, L1105, L1127, L1170, L1176, L1191, L1201, L1267, L1275, L1293, L1302, L1311, L1320, L1332, L1340, L1349, L1356, L1363, L1380, L1389, L1404, L1411, L1420, L1429, L1438, L1447, L1458).

### Test-Only Exports (7 Functions / Constants)
- `src/lib/cv.ts:128` (`normalizeLinkItems`)
- `src/lib/cv.ts:146` (`guessLinkLabel`)
- `src/lib/cv.ts:155` (`linkItemsToLine`)
- `src/lib/dossier.ts:8` (`DOSSIER_MAX_CHARS`)
- `src/lib/dossier.ts:48` (`isDossierEmpty`)
- `src/lib/dossier.ts:55` (`UPLOADED_MAX_CHARS`)
- `src/lib/offer-parse.ts:22` (`findJobPosting`)

### Unused npm Dependencies (19 packages)
- 13 Radix UI dependencies: `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-slider`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`.
- 6 UI helper packages: `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `recharts`, `vaul`, `react-hook-form`.

---

## 2. Logic Chain

1. **Step 1 (Root Discovery)**: We established all production root entry points defined by TanStack Start and TanStack Router (`server.ts`, `start.ts`, `router.tsx`, `routeTree.gen.ts`, all route files in `src/routes/`).
2. **Step 2 (Dependency Graph Construction)**: Built an AST-based dependency graph resolving both static `import` declarations and dynamic `await import(...)` calls across all 130 TypeScript files in `src/`.
3. **Step 3 (Reachability Analysis)**: Traced reachability from root nodes. 87 files are reachable in the production bundle/SSR graph, 14 files are standalone unit tests, 2 files are generated route tree / styles, leaving exactly 27 files completely unreached.
4. **Step 4 (Transitive Pruning)**: Verified that apparent imports in `sheet.tsx`, `skeleton.tsx`, `toggle.tsx`, and `use-mobile.tsx` only originated from other dead files (`sidebar.tsx`, `toggle-group.tsx`), confirming that they are transitively dead.
5. **Step 5 (Symbol-Level Cross-Referencing)**: For each reachable file, parsed every exported identifier (components, functions, hooks, constants, types) and cross-checked usage across all other reachable files and test files, categorizing unused symbols.

---

## 3. Caveats

- **No Caveats on Dead Files**: The 27 dead files are 100% disconnected from the build. No dynamic string template imports (`import('./' + name)`) exist in the codebase.
- **Supabase Generated Types**: `src/integrations/supabase/types.ts` contains many unused table types and helper types (`Tables`, `TablesInsert`, `TablesUpdate`, `Enums`, `CompositeTypes`, `Constants`). These are generated artifacts by Supabase CLI and may be kept for future schema typing or regenerated as needed.
- **Test-Only Exports**: 7 functions/constants are imported only in unit tests. Deleting them would break test files unless the corresponding unit test assertions are also cleaned up.
- **Source Code Integrity**: In accordance with instructions, 0 source files were deleted or modified. Codebase remains `git status` clean.

---

## 4. Conclusion

- **27 unused files** under `src/components/ui/` and `src/hooks/` can be safely removed without affecting application runtime behavior or build.
- **19 npm packages** in `package.json` can be removed once the 27 dead files are pruned.
- **5 exported server functions** in `src/lib/*.functions.ts` are dead endpoints that can be removed to reduce server surface area.
- Full details, exact line numbers, and breakdown are documented in `/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/analysis.md`.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Unreachable Files**:
   ```bash
   node /Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/audit_reachability.mjs
   ```
   Outputs the 27 completely dead files and confirms 0 incoming imports.

2. **Verify Transitive Dead Imports (e.g. sidebar -> skeleton / sheet / use-mobile)**:
   ```bash
   git grep "components/ui/sidebar" src/
   git grep "components/ui/sheet" src/
   git grep "hooks/use-mobile" src/
   ```
   Confirms that `sidebar` is never imported by any active route, and `sheet` / `use-mobile` are only imported by `sidebar`.

3. **Verify Server Function Usages**:
   ```bash
   git grep "getCandidateKnowledge" src/
   git grep "setSalaryExpectation" src/
   git grep "updateOfferSummary" src/
   git grep "listMyReviews" src/
   git grep "setApplicationTemplate" src/
   ```
   Confirms 0 imports across `src/` outside their definition files.
