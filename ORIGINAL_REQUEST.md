# Original User Request

## 2026-08-25T15:10:53Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Small, focused team

This is a single self-contained fix; keep it small and focused. Safely prune all confirmed dead code and unused dependencies identified in the audit report from the TailorCV codebase, ensuring zero regressions by running full test and build verification.

Working directory: /Users/madecolombia/Developer/TailorCV
Integrity mode: development

## Requirements

### R1. Prune Unused UI Components and Dead Source Files

Delete the 27 unreferenced files in `src/components/ui/` and `src/hooks/` identified in the master audit report (`AUDIT_REPORT.md`). Ensure no active components or routes have broken imports.

### R2. Clean Up Unused Dependencies

Remove the 19 unused packages from `package.json` that were only referenced by the deleted UI components. Run a clean dependency update to sync lockfiles.

### R3. Verify Build and Test Integrity

Execute all test suites (`npm run test`), TypeScript checks (`npx tsc --noEmit`), and production build (`npm run build`) to guarantee that no active features or imports are broken.

## Acceptance Criteria

### Verification & Cleanliness

- [ ] All 27 dead files listed in `AUDIT_REPORT.md` are deleted from `src/`.
- [ ] `package.json` is pruned of the 19 unreferenced UI packages.
- [ ] `npx tsc --noEmit` runs with 0 type errors.
- [ ] `npm run test` executes and 100% of test suites pass.
- [ ] `npm run build` completes successfully.
