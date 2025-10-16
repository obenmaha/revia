# Clean Checklist - Règles de Nettoyage et Archivage

**Date**: 2025-10-16
**Objectif**: Guide opérationnel pour archiver le code hors-scope MVP Sport
**Principe**: Approche par lot, validation QA, rollback possible

---

## 🎯 STRATÉGIE D'ARCHIVAGE

### Principe Directeur
**Brownfield Safe**: Archiver progressivement, jamais supprimer définitivement, toujours versionner.

### Structure d'Archive
```
_archive/
├── YYYY-MM-DD/
│   ├── cabinet/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── ARCHIVE_MANIFEST.md
│   ├── gamification/  (déjà fait)
│   └── export-pdf/    (déjà fait)
└── README.md
```

**Date Format**: `YYYY-MM-DD` = date d'archivage (ex: `2025-10-16`)

---

## 🗂️ LOT 1: CABINET MANAGEMENT (P0 - CRITICAL)

### Étape 1.1 - Pages Cabinet
**Objectif**: Archiver les pages cabinet non utilisées par Sport MVP

#### Fichiers à Archiver
```bash
# Source → Destination
src/pages/PatientsPage.tsx        → _archive/2025-10-16/cabinet/pages/
src/pages/PatientDetailPage.tsx   → _archive/2025-10-16/cabinet/pages/
src/pages/PatientProfilePage.tsx  → _archive/2025-10-16/cabinet/pages/
src/pages/InvoicesPage.tsx        → _archive/2025-10-16/cabinet/pages/
src/pages/DashboardPage.tsx       → _archive/2025-10-16/cabinet/pages/
src/pages/HomePage.tsx             → _archive/2025-10-16/cabinet/pages/
src/pages/SessionsPage.tsx        → _archive/2025-10-16/cabinet/pages/
```

#### Commandes
```bash
# 1. Créer structure archive
mkdir -p _archive/2025-10-16/cabinet/pages

# 2. Déplacer fichiers
git mv src/pages/PatientsPage.tsx _archive/2025-10-16/cabinet/pages/
git mv src/pages/PatientDetailPage.tsx _archive/2025-10-16/cabinet/pages/
git mv src/pages/PatientProfilePage.tsx _archive/2025-10-16/cabinet/pages/
git mv src/pages/InvoicesPage.tsx _archive/2025-10-16/cabinet/pages/
git mv src/pages/DashboardPage.tsx _archive/2025-10-16/cabinet/pages/
git mv src/pages/HomePage.tsx _archive/2025-10-16/cabinet/pages/
git mv src/pages/SessionsPage.tsx _archive/2025-10-16/cabinet/pages/

# 3. Vérifier build
npm run build
```

#### QA Gate
- ✅ Build succeeds (Vite)
- ✅ No new TypeScript errors
- ✅ Sport pages still accessible
- ✅ No broken imports

**Estimated Savings**: -50 KB bundle

---

### Étape 1.2 - Components Cabinet
**Objectif**: Archiver composants cabinet non utilisés

#### Fichiers à Archiver
```bash
# Dossier entier
src/components/features/patients/  → _archive/2025-10-16/cabinet/components/patients/

# Fichiers individuels
src/components/features/SessionDetails.tsx       → _archive/2025-10-16/cabinet/components/
src/components/features/SessionFilters.tsx       → _archive/2025-10-16/cabinet/components/
src/components/features/SessionHistory.tsx       → _archive/2025-10-16/cabinet/components/
src/components/features/SessionHistoryItem.tsx   → _archive/2025-10-16/cabinet/components/
src/components/features/SessionNotes.tsx         → _archive/2025-10-16/cabinet/components/
src/components/features/SessionStatistics.tsx    → _archive/2025-10-16/cabinet/components/
src/components/features/ValidationButton.tsx     → _archive/2025-10-16/cabinet/components/

# Forms
src/components/forms/PatientForm.tsx             → _archive/2025-10-16/cabinet/components/forms/
```

#### Commandes
```bash
# 1. Créer structure
mkdir -p _archive/2025-10-16/cabinet/components/{patients,forms}

# 2. Déplacer dossier complet
git mv src/components/features/patients _archive/2025-10-16/cabinet/components/

# 3. Déplacer fichiers individuels
git mv src/components/features/SessionDetails.tsx _archive/2025-10-16/cabinet/components/
git mv src/components/features/SessionFilters.tsx _archive/2025-10-16/cabinet/components/
git mv src/components/features/SessionHistory.tsx _archive/2025-10-16/cabinet/components/
git mv src/components/features/SessionHistoryItem.tsx _archive/2025-10-16/cabinet/components/
git mv src/components/features/SessionNotes.tsx _archive/2025-10-16/cabinet/components/
git mv src/components/features/SessionStatistics.tsx _archive/2025-10-16/cabinet/components/
git mv src/components/features/ValidationButton.tsx _archive/2025-10-16/cabinet/components/
git mv src/components/forms/PatientForm.tsx _archive/2025-10-16/cabinet/components/forms/

# 4. Vérifier build
npm run build
```

#### QA Gate
- ✅ Build succeeds
- ✅ Sport components still work
- ✅ No circular dependencies
- ✅ ExerciseForm/SessionForm (sport) preserved

**Estimated Savings**: -80 KB bundle

---

### Étape 1.3 - Services & Hooks Cabinet + Notifications
**Objectif**: Archiver services et hooks cabinet + notificationService (FR9 exclu)

#### Fichiers à Archiver
```bash
# Services Cabinet
src/services/patientsService.ts   → _archive/2025-10-16/cabinet/services/
src/services/invoicesService.ts   → _archive/2025-10-16/cabinet/services/
src/services/sessionsService.ts   → _archive/2025-10-16/cabinet/services/

# Services Notifications (FR9)
src/services/notificationService.ts → _archive/2025-10-16/notifications/services/

# Hooks Cabinet
src/hooks/usePatients.ts           → _archive/2025-10-16/cabinet/hooks/
src/hooks/usePatient.ts            → _archive/2025-10-16/cabinet/hooks/
src/hooks/usePatientForm.ts        → _archive/2025-10-16/cabinet/hooks/
src/hooks/useInvoices.ts           → _archive/2025-10-16/cabinet/hooks/
src/hooks/useSessions.ts           → _archive/2025-10-16/cabinet/hooks/
src/hooks/useSessionForm.ts        → _archive/2025-10-16/cabinet/hooks/
```

#### Commandes
```bash
# 1. Créer structure
mkdir -p _archive/2025-10-16/cabinet/{services,hooks}
mkdir -p _archive/2025-10-16/notifications/services

# 2. Services Cabinet
git mv src/services/patientsService.ts _archive/2025-10-16/cabinet/services/
git mv src/services/invoicesService.ts _archive/2025-10-16/cabinet/services/
git mv src/services/sessionsService.ts _archive/2025-10-16/cabinet/services/

# 3. Services Notifications (FR9)
git mv src/services/notificationService.ts _archive/2025-10-16/notifications/services/

# 4. Hooks Cabinet
git mv src/hooks/usePatients.ts _archive/2025-10-16/cabinet/hooks/
git mv src/hooks/usePatient.ts _archive/2025-10-16/cabinet/hooks/
git mv src/hooks/usePatientForm.ts _archive/2025-10-16/cabinet/hooks/
git mv src/hooks/useInvoices.ts _archive/2025-10-16/cabinet/hooks/
git mv src/hooks/useSessions.ts _archive/2025-10-16/cabinet/hooks/
git mv src/hooks/useSessionForm.ts _archive/2025-10-16/cabinet/hooks/

# 5. Vérifier build
npm run build
```

#### QA Gate
- ✅ Build succeeds
- ✅ Sport services work (sessionService.ts preserved)
- ✅ No service errors
- ✅ API calls still functional

**Estimated Savings**: -50 KB bundle

---

### Étape 1.4 - Types & Tests Cabinet
**Objectif**: Archiver types et tests cabinet

#### Fichiers à Archiver
```bash
# Types
src/types/patient.ts               → _archive/2025-10-16/cabinet/types/
src/types/mapping.ts               → _archive/2025-10-16/cabinet/types/

# Tests
src/__tests__/patient-simple.test.ts → _archive/2025-10-16/cabinet/tests/
```

#### Commandes
```bash
# 1. Créer structure
mkdir -p _archive/2025-10-16/cabinet/{types,tests}

# 2. Types
git mv src/types/patient.ts _archive/2025-10-16/cabinet/types/
git mv src/types/mapping.ts _archive/2025-10-16/cabinet/types/

# 3. Tests
git mv src/__tests__/patient-simple.test.ts _archive/2025-10-16/cabinet/tests/

# 4. Vérifier build
npm run build
```

#### QA Gate
- ✅ Build succeeds
- ✅ TypeScript errors reduced
- ✅ Sport types intact
- ✅ Test suite still runs

**Estimated Savings**: -20 KB bundle

---

### Étape 1.5 - Routes Cabinet (App.tsx)
**Objectif**: Retirer routes cabinet de App.tsx

#### Modifications
```typescript
// src/App.tsx
// AVANT
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import InvoicesPage from './pages/InvoicesPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';

// Routes cabinet
<Route path="/patients" element={<PatientsPage />} />
<Route path="/patients/:id" element={<PatientDetailPage />} />
<Route path="/invoices" element={<InvoicesPage />} />
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/" element={<HomePage />} />

// APRÈS
// Imports cabinet removed
// Routes cabinet removed

// Redirect root to Sport dashboard
<Route path="/" element={<Navigate to="/sport/dashboard" replace />} />
```

#### Commandes
```bash
# 1. Éditer App.tsx (utiliser Read puis Edit)
# Retirer imports cabinet
# Retirer routes cabinet
# Ajouter redirect / → /sport/dashboard

# 2. Vérifier build
npm run build

# 3. Test navigation
npm run dev
# Vérifier: localhost:5173/ → redirige vers /sport/dashboard
```

#### QA Gate
- ✅ Build succeeds
- ✅ No import errors
- ✅ Sport routes work
- ✅ Root path redirects correctly
- ✅ No 404 on Sport pages

**Estimated Savings**: Code clarity (no direct bundle impact)

---

## 📊 LOT 1 SUMMARY

### Fichiers Archivés (Total Lot 1)
- **Pages**: 7 fichiers
- **Components**: ~15 fichiers
- **Services**: 4 fichiers (3 cabinet + 1 notification)
- **Hooks**: 6 fichiers
- **Types**: 2 fichiers
- **Tests**: 1 fichier

**Total**: ~35 fichiers archivés

### Savings Estimés (Lot 1)
| Catégorie | Savings |
|-----------|---------|
| Pages | -50 KB |
| Components | -80 KB |
| Services | -50 KB |
| Types/Tests | -20 KB |
| **TOTAL** | **-200 KB** |

### QA Gates (Lot 1)
✅ All steps must pass:
1. `npm run build` → SUCCESS
2. `npm run test` → PASS (>95%)
3. TypeScript errors → REDUCED (not increased)
4. Sport pages → ACCESSIBLE
5. Navigation → FUNCTIONAL

---

## 🎨 LOT 2: OPTIMISATION VENDOR (P2 - FUTURE)

### Étape 2.1 - Analyse Bundle Détaillée
**Objectif**: Identifier opportunités d'optimisation vendor

#### Commandes
```bash
# 1. Analyse bundle actuel
npm run build
npm run qa:analyze-bundle

# 2. Dépendances non utilisées
npm run qa:depcheck

# 3. Circular dependencies
npm run qa:circular
```

#### Analyse Cibles
- **React Vendor** (470 KB): Évaluer Preact migration
- **Radix UI** (69 KB): Identifier composants non utilisés restants
- **Auth UI** (147 KB): Analyser nécessité @supabase/auth-ui-react

**Savings Potentiels**: -150 KB (avec Preact + optimisations)

---

### Étape 2.2 - Preact Migration (OPTIONNEL)
**Objectif**: Migrer React → Preact pour réduire vendor bundle

#### Modifications
```json
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  }
});

// package.json
"dependencies": {
  "preact": "^10.19.0",
  // Remove "react", "react-dom"
}
```

#### Risques
- ⚠️ HIGH: Compatibility issues avec Radix UI
- ⚠️ HIGH: Extensive testing required
- ⚠️ MEDIUM: Supabase Auth UI compatibility

**Recommendation**: Defer to post-MVP (trop risqué pour deadline)

**Savings Potentiels**: -140 KB gzipped

---

### Étape 2.3 - Radix UI Audit
**Objectif**: Retirer composants Radix UI non utilisés restants

#### Audit Commande
```bash
# Pour chaque composant Radix
for comp in accordion alert-dialog aspect-ratio collapsible combobox command context-menu data-table emoji-picker hover-card menubar navigation-menu resizable sidebar slider page-stepper; do
  echo "=== $comp ==="
  grep -r "import.*$comp" src/ --include="*.tsx" --include="*.ts" | wc -l
done
```

#### Si 0 imports trouvés → Archiver
```bash
git mv src/components/ui/$comp.tsx _archive/2025-10-16/radix-unused/
```

**Note**: 13 composants déjà retirés (per SMART-CLEAN-PASS)

**Savings Potentiels**: -10 KB (composants restants non utilisés)

---

## 🔄 LOT 3: CLEANUP TYPE SYSTEM (P1 - HIGH)

### Étape 3.1 - Régénération Types Supabase
**Objectif**: Synchroniser types avec schéma database actuel

#### Commandes
```bash
# 1. Vérifier accès Supabase
npx supabase status

# 2. Régénérer types
npm run types:generate
# OU
npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/supabase.ts

# 3. Vérifier compilation
npm run build
```

#### QA Gate
- ✅ `sport_sessions` table in types
- ✅ `sport_exercises` table in types
- ✅ `guest_data` table in types
- ✅ TypeScript errors reduced
- ✅ No new type errors

**Impact**: Fix ~50 TypeScript errors (database type mismatches)

---

### Étape 3.2 - Standardisation Date Types
**Objectif**: Uniformiser `Date` vs `string` dans codebase

#### Principe Décision
**Adopter**: ISO strings (`string`) partout
**Raison**: Supabase retourne ISO strings, conversion coûteuse

#### Modifications Typiques
```typescript
// AVANT
interface SportSession {
  date: Date;  // ❌ Conflict avec Supabase
}

// APRÈS
interface SportSession {
  date: string;  // ✅ ISO string (YYYY-MM-DD)
}

// Conversion UI uniquement
const dateObj = new Date(session.date);
```

#### Fichiers à Modifier
- `src/types/sport.ts`
- `src/types/session.ts`
- `src/services/sessionService.ts`
- `src/services/sportHistoryService.ts`

#### QA Gate
- ✅ TypeScript errors reduced
- ✅ Date pickers work
- ✅ Date formatting works
- ✅ No date parsing errors

**Impact**: Fix ~30 TypeScript errors (Date type mismatches)

---

### Étape 3.3 - Cleanup Imports Non Utilisés
**Objectif**: Retirer imports/variables non utilisés

#### Commandes
```bash
# 1. Identifier unused imports
npm run qa:tsprune

# 2. Auto-fix avec ESLint (si configuré)
npx eslint src/ --fix

# 3. Vérifier manuellement
# Rechercher "declared but never read"
npm run build 2>&1 | grep "never read"
```

#### Modifications Typiques
```typescript
// AVANT
import React from 'react';  // ❌ Unused avec React 19 JSX transform
import { SportSession, SportExercise } from '@/types/sport';  // ❌ Imported but not used

// APRÈS
// Imports removed
```

#### QA Gate
- ✅ TypeScript warnings reduced
- ✅ No functional changes
- ✅ Build succeeds

**Impact**: Fix ~20 TypeScript warnings (unused imports)

---

## 📈 QA GATES NUMÉRIQUES POST-LOT

### Gate 1: Bundle Size
```bash
npm run build
# Vérifier dist/assets/*.js sizes

# Cible après Lot 1 (Cabinet Archive)
# Total: <500 KB (intermédiaire)
# Final target: <300 KB (avec Lot 2)
```

**Success Criteria**:
- ✅ Bundle reduced by ≥150 KB after Lot 1
- ✅ No single chunk >150 KB (except vendor-react)

---

### Gate 2: TypeScript Errors
```bash
npm run build 2>&1 | grep "error TS" | wc -l

# Cible après Lot 3 (Type Cleanup)
# Errors: <10 (acceptable)
# Errors: 0 (ideal)
```

**Success Criteria**:
- ✅ Errors reduced by ≥50% after Lot 3
- ✅ No new errors introduced

---

### Gate 3: Test Coverage
```bash
npm run test -- --coverage

# Cible
# Coverage: >95% (all categories)
```

**Success Criteria**:
- ✅ Coverage ≥95% statements
- ✅ Coverage ≥95% branches
- ✅ Coverage ≥95% functions
- ✅ Coverage ≥95% lines

---

### Gate 4: Build Success
```bash
npm run build
# Exit code must be 0

npm run test
# Exit code must be 0
```

**Success Criteria**:
- ✅ Vite build succeeds (<30s)
- ✅ All tests pass
- ✅ No critical warnings

---

### Gate 5: Functional Validation (Manuel)

**Checklist**:
- [ ] Sport Dashboard loads
- [ ] Create session works
- [ ] Duplicate session works
- [ ] Exercise recording works
- [ ] Session validation works
- [ ] History loads and filters
- [ ] CSV export works
- [ ] Guest mode works
- [ ] Profile page works

**Success Criteria**: ✅ 9/9 features functional (notifications exclu MVP)

---

## 🔐 RÈGLES DE SÉCURITÉ ARCHIVAGE

### Règle 1: Toujours utiliser `git mv`
**Pourquoi**: Préserve l'historique Git
```bash
# ✅ BON
git mv src/pages/PatientsPage.tsx _archive/2025-10-16/cabinet/pages/

# ❌ MAUVAIS
rm src/pages/PatientsPage.tsx
mkdir -p _archive/2025-10-16/cabinet/pages/
# Perte historique Git
```

### Règle 2: Commit par lot atomique
**Principe**: Un commit = un lot complet avec QA validé
```bash
# Exemple Lot 1, Étape 1.1
git add _archive/2025-10-16/cabinet/pages/
git commit -m "chore(archive): Lot 1.1 - Archive cabinet pages

- Archive 7 cabinet pages to _archive/2025-10-16/cabinet/pages/
- Estimated savings: -50 KB bundle
- QA: Build succeeds, Sport pages accessible

Refs: clean_checklist.md Lot 1.1"
```

### Règle 3: Manifest obligatoire par lot
**Contenu**: `_archive/YYYY-MM-DD/LOT_NAME/ARCHIVE_MANIFEST.md`
```markdown
# Archive Manifest - Cabinet Pages

**Date**: 2025-10-16
**Lot**: 1.1 - Cabinet Pages
**Reason**: Out-of-scope MVP Sport (FR1-FR7, FR9, FR10 only)

## Files Archived (7)
1. PatientsPage.tsx
2. PatientDetailPage.tsx
3. ...

## Restoration Procedure
To restore:
\`\`\`bash
git mv _archive/2025-10-16/cabinet/pages/*.tsx src/pages/
# Update App.tsx routes
npm run build
\`\`\`

## Dependencies
- None (isolated pages)

## Impact
- Bundle: -50 KB
- Routes removed from App.tsx
```

### Règle 4: Rollback plan systématique
**Commande Rollback**:
```bash
# Rollback dernier commit
git revert HEAD

# OU restauration manuelle
git mv _archive/2025-10-16/cabinet/pages/*.tsx src/pages/
# Ré-éditer App.tsx
npm run build
```

### Règle 5: Validation QA avant push
**Checklist avant `git push`**:
- [ ] `npm run build` → SUCCESS
- [ ] `npm run test` → PASS
- [ ] TypeScript errors ≤ baseline
- [ ] Manual smoke test passed
- [ ] Manifest créé
- [ ] Commit message clair

---

## 📋 PATTERNS & ANTI-PATTERNS

### ✅ Pattern: Archive Progressive
```bash
# Étape par étape, validation entre chaque
git mv src/pages/PatientsPage.tsx _archive/2025-10-16/cabinet/pages/
npm run build  # ✅ Validation immédiate
git add . && git commit -m "Archive PatientsPage"

git mv src/pages/PatientDetailPage.tsx _archive/2025-10-16/cabinet/pages/
npm run build  # ✅ Validation immédiate
git add . && git commit -m "Archive PatientDetailPage"
```

### ❌ Anti-Pattern: Archive en masse sans validation
```bash
# ❌ NE PAS FAIRE
git mv src/pages/*.tsx _archive/2025-10-16/cabinet/pages/
git commit -m "Archive all pages"
npm run build  # ❌ Découverte erreurs trop tard, rollback complexe
```

### ✅ Pattern: Grep audit avant archivage
```bash
# Vérifier qu'un fichier n'est pas importé
grep -r "import.*PatientsPage" src/ --include="*.tsx" --include="*.ts"
# Si 0 résultats → OK pour archiver
```

### ❌ Anti-Pattern: Archiver sans vérifier dépendances
```bash
# ❌ Archiver un service sans vérifier qui l'importe
git mv src/services/patientsService.ts _archive/
npm run build  # ❌ Erreur: "Cannot find module 'patientsService'"
```

### ✅ Pattern: Archive avec dépendances
```bash
# 1. Identifier dépendances
grep -r "patientsService" src/ --include="*.tsx" --include="*.ts"

# 2. Archiver fichiers utilisateurs PUIS service
git mv src/pages/PatientsPage.tsx _archive/
git mv src/hooks/usePatients.ts _archive/
git mv src/services/patientsService.ts _archive/  # En dernier

# 3. Valider
npm run build
```

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### Phase 1: Quick Wins (Déjà fait ✅)
1. ✅ Remove unused UI components (13 files)
2. ✅ Remove unused hooks (11 files)
3. ✅ Remove PDF export (2 files)
**Result**: -14 KB bundle, 26 files removed

### Phase 2: Cabinet Archive (À faire - P0)
4. ⏳ Lot 1.1 - Archive cabinet pages (7 files)
5. ⏳ Lot 1.2 - Archive cabinet components (15 files)
6. ⏳ Lot 1.3 - Archive cabinet services/hooks (9 files)
7. ⏳ Lot 1.4 - Archive cabinet types/tests (3 files)
8. ⏳ Lot 1.5 - Update App.tsx routes
**Expected Result**: -200 KB bundle, 34 files archived

### Phase 3: Type System (À faire - P1)
9. ⏳ Lot 3.1 - Regenerate Supabase types
10. ⏳ Lot 3.2 - Standardize Date types
11. ⏳ Lot 3.3 - Cleanup unused imports
**Expected Result**: -80 TypeScript errors

### Phase 4: Vendor Optimization (Futur - P2)
12. ⏭️ Lot 2.1 - Analyze bundle
13. ⏭️ Lot 2.3 - Radix UI audit
14. ⏭️ Lot 2.2 - Preact migration (OPTIONNEL)
**Expected Result**: -150 KB bundle (si Preact)

---

## 📊 OBJECTIFS FINAUX

### Bundle Size
- **Avant cleanup total**: 708 KB
- **Après Lot 1 (Cabinet)**: ~500 KB (intermédiaire)
- **Après Lot 2 (Vendor opt)**: ~350 KB (si Preact)
- **Target NFR1**: <300 KB

### TypeScript Errors
- **Avant cleanup**: ~120 errors
- **Après Lot 3**: <10 errors
- **Target**: 0 errors

### Test Coverage
- **Avant**: ~95% (estimé)
- **Target**: >95% (validé)

### Fichiers
- **Avant cleanup total**: ~350 files
- **Après archivage**: ~280 files (70 archivés)
- **Reduction**: -20% files

---

## 🔗 RÉFÉRENCES

### Documentation Liée
- `docs/mvp_sport_summary.md` - Définition MVP strict
- `docs/backbone_map.md` - Fichiers à préserver
- `docs/SMART-CLEAN-PASS-REPORT.md` - Cleanup déjà effectué
- `KILL-LIST-SPORT-MVP.md` - Stratégie cleanup originale

### Rapports QA
- `docs/qa/qa-report-mvp-sport-nfr-pass-v2.md`
- `docs/qa/gates/mvp-sport-nfr-pass.yml`
- `docs/qa/session-summary-2025-10-16.md`

### PRD & Architecture
- `docs/prd/02-functional-requirements.md` (FR1-FR11)
- `docs/prd/03-non-functional-requirements.md` (NFR1-NFR7)
- `docs/architecture/04-component-architecture.md`

---

**Fin du Clean Checklist**
