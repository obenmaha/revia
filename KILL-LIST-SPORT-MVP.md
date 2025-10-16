# KILL-LIST: Sport MVP Cleanup (Smart Clean Pass)

**Date**: 2025-10-16
**Branch**: chore/cleanup-sport-only
**Architect**: Claude (Senior Brownfield Architect)

## Executive Summary

This document identifies all files, dependencies, and code to be archived or removed to achieve Sport MVP scope.

### Targets
- **Bundle Size**: <300KB (Current: 709KB, Gap: -409KB / -57.7%)
- **Test Pass**: >95%
- **Scope**: FR1–FR7 + FR9 + FR10 only
- **Remove**: Cabinet, Billing, Gamification (FR8), Heavy Export (FR11)

---

## Phase 1: OUT-OF-SCOPE FILES TO ARCHIVE

### A. Cabinet Management (Epic 2.x → V2 Annex)

**Pages** (to archive/epic3/cabinet/):
- `src/pages/PatientsPage.tsx`
- `src/pages/PatientDetailPage.tsx`
- `src/pages/PatientProfilePage.tsx`
- `src/pages/InvoicesPage.tsx`
- `src/pages/DashboardPage.tsx` (cabinet version)
- `src/pages/HomePage.tsx` (cabinet landing)
- `src/pages/SessionsPage.tsx` (cabinet session mgmt)

**Components** (to archive/epic3/cabinet/):
- `src/components/features/patients/*`
- `src/components/forms/PatientForm.tsx`
- `src/components/features/SessionStatistics.tsx` (cabinet-specific)
- `src/components/features/SessionNotes.tsx`
- `src/components/features/SessionHistoryItem.tsx` (cabinet version)
- `src/components/features/SessionHistory.tsx` (cabinet version)
- `src/components/features/SessionFilters.tsx` (cabinet version)
- `src/components/features/SessionDetails.tsx` (cabinet version)
- `src/components/features/ValidationButton.tsx` (cabinet validation)

**Services** (to archive/epic3/cabinet/):
- `src/services/patientsService.ts`
- `src/services/invoicesService.ts`
- `src/services/sessionsService.ts` (cabinet-specific methods)

**Hooks** (to archive/epic3/cabinet/):
- `src/hooks/usePatients.ts`
- `src/hooks/usePatient.ts`
- `src/hooks/usePatientForm.ts`
- `src/hooks/useInvoices.ts`
- `src/hooks/useSessions.ts` (cabinet-specific)
- `src/hooks/useSessionForm.ts` (cabinet-specific)

**Types** (to archive/epic3/cabinet/):
- `src/types/patient.ts`
- `src/types/mapping.ts` (patient mappings)

**Tests** (to archive/epic3/cabinet/):
- `src/__tests__/patient-simple.test.ts`

---

### B. Gamification (FR8 → V2 Future)

**Components** (to archive/epic3/gamification/):
- `src/components/features/sport/BadgeSystem.tsx`
- `src/components/features/sport/StreakCounter.tsx`

**Utils** (remove gamification logic from):
- `src/utils/sportStats.ts` (badge/streak calculation methods)

---

### C. Heavy Export Features (FR11 PDF/CSV → Simplified or Deferred)

**Decision**: Keep lightweight CSV export, remove PDF generation (jspdf is 147KB!)

**To Remove**:
- `src/components/features/sport/SportExport/SportPDFExport.tsx`
- PDF generation logic from `src/services/sportExportService.ts`
- PDF-specific types from `src/types/sport.ts`

**To Keep** (lightweight):
- CSV export (papaparse is lighter)
- `SportExportModal.tsx` (simplified for CSV only)

**Dependencies to Remove**:
- `jspdf` (not installed, preventing install)

**Dependencies to Keep**:
- `papaparse` (install for CSV only)

---

### D. Unused UI Components (Heavy Radix UI)

**Candidates for Removal** (not used in Sport MVP):
- `src/components/ui/accordion.tsx` ❓
- `src/components/ui/alert-dialog.tsx` ✅ (use dialog instead)
- `src/components/ui/aspect-ratio.tsx` ❓
- `src/components/ui/collapsible.tsx` ❓
- `src/components/ui/combobox.tsx` ❓
- `src/components/ui/command.tsx` ❓
- `src/components/ui/context-menu.tsx` ❓
- `src/components/ui/data-table.tsx` ❓ (check if used)
- `src/components/ui/emoji-picker.tsx` ❓
- `src/components/ui/hover-card.tsx` ❓
- `src/components/ui/menubar.tsx` ❓
- `src/components/ui/navigation-menu.tsx` ❓
- `src/components/ui/resizable.tsx` ❓
- `src/components/ui/sidebar.tsx` ❓ (check if sport uses)
- `src/components/ui/slider.tsx` ❓ (RPE/pain scales?)
- `src/components/ui/page-stepper.tsx` ❓

**Action**: Audit usage before removal (use Grep to check imports)

---

### E. Unused Hooks (Utility Overhead)

**Candidates for Removal**:
- `src/hooks/useClickOutside.ts` ❓
- `src/hooks/useCopyToClipboard.ts` ❓
- `src/hooks/useFocusTrap.ts` ❓
- `src/hooks/useGeolocation.ts` ❌ (not sport-related)
- `src/hooks/useHover.ts` ❓
- `src/hooks/useIntersectionObserver.ts` ❓
- `src/hooks/useKeyPress.ts` ❓
- `src/hooks/useOnlineStatus.ts` ❓
- `src/hooks/usePrevious.ts` ❓
- `src/hooks/useToggle.ts` ❓
- `src/hooks/useWindowSize.ts` ❓

**Action**: Audit usage with Grep

---

## Phase 2: DEPENDENCY OPTIMIZATION

### A. Dependencies to REMOVE (Unused or Out-of-Scope)

**Heavy Dependencies**:
- `jspdf` (147KB vendor chunk) → NOT INSTALLING (PDF export removed)
- `emoji-picker-react` ❓ (check if used)
- `@heroicons/react` ❓ (lucide-react preferred)
- `workbox-window` ❓ (PWA - check if needed for MVP)
- `react-dropzone` ❓ (file upload - check if sport uses)
- `papaparse` → KEEP but verify tree-shaking
- `framer-motion` ❓ (animations - check if sport uses)

### B. Dependencies to OPTIMIZE

**React Vendor Bundle (470KB gzipped → 143KB)**:
- Consider Preact migration (saves ~140KB gzipped)
- **Decision**: Defer to post-MVP (high risk)

**Radix UI (68KB → 21KB gzipped)**:
- Audit unused components
- Consider lightweight alternatives for simple cases
- **Action**: Remove unused Radix components

**Lucide Icons (21KB → 4.8KB gzipped)**:
- Use named imports only
- Audit icon usage
- **Script**: `npm run qa:optimize-imports`

**Date-fns (22KB → 6.4KB gzipped)**:
- Already migrated from moment
- Ensure tree-shaking works
- **Status**: ✅ OK

---

## Phase 3: CODE SPLITTING ENHANCEMENTS

**Current State**: ✅ Route-based splitting implemented

**Further Optimizations**:
1. Dynamic imports for heavy components (BadgeSystem, etc.)
2. Defer non-critical features (notifications, analytics)
3. Separate vendor chunks by priority

---

## Phase 4: ANALYTICS CLEANUP (PostHog)

**Keep ONLY MVP Events**:
- `session_created`
- `session_validated`
- `guest_started`
- `guest_migrated`

**Remove**:
- Cabinet-related events
- Patient events
- Invoice events
- All other non-Sport events

**File**: `src/lib/analytics.ts`

---

## Phase 5: TYPE CLEANUP

**Issues Identified** (TypeScript ~50 errors):

### A. Missing Database Types
- `sport_sessions` table not in type definitions
- `sport_exercises` table not in type definitions

**Action**: Run `npm run types:generate`

### B. Export-Related Types
- `ExportFilters` (move to sport.ts or remove if PDF removed)
- `SportSessionWithExercises` (ensure proper export)

### C. Date Inconsistencies
- Standardize `Date` vs `string` across codebase
- Fix type mismatches in services

---

## PRIORITY MATRIX

### P0 - CRITICAL (Bundle Blockers)
1. ❌ Remove cabinet pages/components → archive
2. ❌ Remove PDF export (jspdf) → archive
3. ❌ Audit & remove unused Radix components
4. ❌ Audit & remove unused hooks
5. ✅ Optimize Lucide icon imports

### P1 - HIGH (Test & Type Safety)
6. ❌ Install papaparse (CSV export)
7. ❌ Regenerate Supabase types
8. ❌ Fix TypeScript errors (~50)
9. ❌ Fix test timeouts

### P2 - MEDIUM (Polish)
10. ❌ Clean PostHog events
11. ❌ Remove unused dependencies
12. ❌ Update documentation

---

## ESTIMATED SAVINGS

| Category | Before | After | Savings |
|----------|--------|-------|---------|
| **Cabinet Code** | ~200KB | 0KB | -200KB |
| **PDF Export (jspdf)** | 147KB | 0KB | -147KB |
| **Unused Radix Components** | ~30KB | 0KB | -30KB |
| **Unused Hooks/Utils** | ~20KB | 0KB | -20KB |
| **Icon Optimization** | 21KB | ~10KB | -11KB |
| **TOTAL REDUCTION** | 709KB | **~301KB** | **-408KB** |

**Target**: <300KB
**Projected**: ~301KB
**Margin**: +1KB (ACCEPTABLE or further optimize)

---

## RISK LOG

### High Risk
1. **Removing cabinet code may break shared components**
   - Mitigation: Careful dependency analysis before archiving
   - Verify: Run full test suite after each archive batch

2. **Type regeneration may cause new errors**
   - Mitigation: Incremental fixes, test after regeneration
   - Rollback: Git checkpoint before type changes

### Medium Risk
3. **Removing Radix components may break Sport UI**
   - Mitigation: Grep audit before removal
   - Verify: Visual regression tests (manual)

4. **Optimizing vendor bundles may break runtime**
   - Mitigation: Test export functionality thoroughly
   - Defer: Preact migration to post-MVP

---

## NEXT ACTIONS (Sequential)

1. ✅ Create archive directory structure
2. ⏳ Audit component/hook usage (Grep analysis)
3. ⏳ Archive cabinet code batch 1 (pages)
4. ⏳ Archive cabinet code batch 2 (components)
5. ⏳ Archive cabinet code batch 3 (services/hooks)
6. ⏳ Remove PDF export code
7. ⏳ Remove gamification components
8. ⏳ Remove unused UI components (post-audit)
9. ⏳ Install papaparse, regenerate types
10. ⏳ Fix TypeScript errors
11. ⏳ Run full test suite
12. ⏳ Verify bundle <300KB
13. ⏳ Update App.tsx routes (remove cabinet routes)
14. ⏳ Clean PostHog analytics
15. ⏳ Commit & PR

---

**End of Kill-List**
