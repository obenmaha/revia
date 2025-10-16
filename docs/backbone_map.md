# Backbone Map - Fichiers/Dossiers à PRÉSERVER

**Date**: 2025-10-16
**Objectif**: Liste EXPLICITE des chemins à protéger pendant le cleanup
**Principe**: Si un fichier/dossier est listé ici → NE PAS ARCHIVER

---

## 🛡️ ROUTES & PAGES SPORT MVP

### Pages Sport (CORE)
```
`src/pages/sport/SportDashboardPage.tsx`
`src/pages/sport/SportHistoryPage.tsx`
`src/pages/sport/SportProfilePage.tsx`
`src/pages/sport/SportSessionCreatePage.tsx`
```

### Pages Guest Mode
```
`src/pages/guest/GuestDashboardPage.tsx`
`src/pages/guest/`
```

### Pages Légales (RGPD NFR5)
```
`src/pages/legal/LegalCGUPage.tsx`
`src/pages/legal/LegalMentionsPage.tsx`
`src/pages/legal/`
```

### Pages Auth & Navigation
```
`src/pages/LoginPage.tsx`
`src/pages/RegisterPage.tsx`
`src/pages/ProfilePage.tsx`
`src/pages/new-session.tsx`
```

**Note**: `DashboardPage.tsx` et `HomePage.tsx` sont des pages cabinet → À ARCHIVER (pas dans backbone)

---

## 🧩 FEATURES & COMPOSANTS SPORT MVP

### Sport Features (FR1-FR7, FR9, FR10)
```
`src/components/features/sport/`
`src/components/features/sport/RPEScale.tsx`
`src/components/features/sport/SessionCard.tsx`
`src/components/features/sport/SportHistoryEmptyState.tsx`
`src/components/features/sport/SportHistoryFilters.tsx`
`src/components/features/sport/SportExport/`
`src/components/features/sport/SportExport/SportExportModal.tsx`
`src/components/features/sport/SportExport/SportCSVExport.tsx`
`src/components/features/sport/SportHistory/`
`src/components/features/sport/SportHistory/SportHistoryList.tsx`
`src/components/features/sport/SportStatistics/`
`src/components/features/sport/SportStatistics/SportStatsCard.tsx`
```

### Core Exercise Components (FR4)
```
`src/components/features/ExerciseForm.tsx`
`src/components/features/ExerciseList.tsx`
`src/components/features/ExerciseManager.tsx`
```

### Core Session Components (FR2-FR5)
```
`src/components/features/SessionForm.tsx`
`src/components/features/SessionValidation.tsx`
```

**EXCLUSIONS** (composants cabinet à archiver):
- ❌ `SessionDetails.tsx` (cabinet-specific)
- ❌ `SessionFilters.tsx` (cabinet version)
- ❌ `SessionHistory.tsx` (cabinet version)
- ❌ `SessionHistoryItem.tsx` (cabinet version)
- ❌ `SessionNotes.tsx` (cabinet only)
- ❌ `SessionStatistics.tsx` (cabinet version)
- ❌ `ValidationButton.tsx` (cabinet validation)

---

## 🎨 UI COMPONENTS (Radix + Custom)

### Core UI (Utilisés par Sport MVP)
```
`src/components/ui/app-layout.tsx`
`src/components/ui/button.tsx`
`src/components/ui/calendar.tsx`
`src/components/ui/card.tsx`
`src/components/ui/checkbox.tsx`
`src/components/ui/dialog.tsx`
`src/components/ui/dropdown-menu.tsx`
`src/components/ui/form.tsx`
`src/components/ui/input.tsx`
`src/components/ui/label.tsx`
`src/components/ui/popover.tsx`
`src/components/ui/radio-group.tsx`
`src/components/ui/scroll-area.tsx`
`src/components/ui/select.tsx`
`src/components/ui/separator.tsx`
`src/components/ui/skeleton.tsx`
`src/components/ui/switch.tsx`
`src/components/ui/table.tsx`
`src/components/ui/tabs.tsx`
`src/components/ui/textarea.tsx`
`src/components/ui/toast.tsx`
`src/components/ui/toaster.tsx`
```

### Navigation & Layout
```
`src/components/ui/navigation/`
`src/components/ui/navigation/bottom-tabs.tsx`
`src/components/ui/navigation/mobile-nav.tsx`
```

### Forms (React Hook Form + Zod)
```
`src/components/forms/`
`src/components/forms/FormField.tsx`
`src/components/forms/FormError.tsx`
```

**EXCLUSIONS** (composants UI non utilisés - déjà retirés):
- ✅ Retirés: accordion, alert-dialog, aspect-ratio, collapsible, combobox, command, context-menu, emoji-picker, hover-card, menubar, navigation-menu, resizable, page-stepper

---

## 📡 SERVICES & API

### Services Sport MVP
```
`src/services/api.ts`
`src/services/authService.ts`
`src/services/databaseService.ts`
`src/services/exerciseService.ts`
`src/services/sessionService.ts`
`src/services/sportExportService.ts`
`src/services/sportHistoryService.ts`
`src/services/stats.ts`
`src/services/migrateGuestToAccount.ts`
`src/services/testService.ts`
```

**EXCLUSIONS** (services à archiver):
- ❌ `patientsService.ts` (cabinet)
- ❌ `invoicesService.ts` (cabinet)
- ❌ `sessionsService.ts` (cabinet-specific, différent de sessionService.ts sport)
- ❌ `notificationService.ts` (FR9 exclu MVP)

---

## 🪝 HOOKS CORE

### Hooks Sport MVP (Utilisés)
```
`src/hooks/useAuth.ts`
`src/hooks/useDebounce.ts`
`src/hooks/useExercises.ts`
`src/hooks/useMediaQuery.ts`
`src/hooks/useSession.ts`
`src/hooks/useSportHistory.ts`
`src/hooks/useSportStats.ts`
`src/hooks/useToast.ts`
```

**EXCLUSIONS** (hooks non utilisés - déjà retirés):
- ✅ Retirés: useClickOutside, useCopyToClipboard, useFocusTrap, useGeolocation, useHover, useIntersectionObserver, useKeyPress, useOnlineStatus, usePrevious, useToggle, useWindowSize

**EXCLUSIONS** (hooks cabinet à archiver):
- ❌ `usePatients.ts`
- ❌ `usePatient.ts`
- ❌ `usePatientForm.ts`
- ❌ `useInvoices.ts`
- ❌ `useSessions.ts` (cabinet-specific)
- ❌ `useSessionForm.ts` (cabinet-specific)

---

## 🗄️ STORES (Zustand)

### Stores Sport MVP
```
`src/stores/authStore.ts`
`src/stores/exerciseStore.ts`
`src/stores/guestStore.ts`
`src/stores/notificationStore.ts`
`src/stores/sessionStore.ts`
`src/stores/sportStore.ts`
`src/stores/uiStore.ts`
```

**EXCLUSIONS** (stores cabinet à archiver):
- ❌ `patientStore.ts`
- ❌ `invoiceStore.ts`

---

## 📝 TYPES & VALIDATION

### Types Sport MVP
```
`src/types/supabase.ts`
`src/types/database.types.ts`
`src/types/sport.ts`
`src/types/exercise.ts`
`src/types/session.ts`
`src/types/user.ts`
`src/types/guest.ts`
`src/types/notification.ts`
`src/types/analytics.ts`
```

### Validation (Zod)
```
`src/validation/`
`src/validation/exerciseSchema.ts`
`src/validation/sessionSchema.ts`
`src/validation/userSchema.ts`
```

**EXCLUSIONS** (types cabinet à archiver):
- ❌ `patient.ts`
- ❌ `mapping.ts` (patient mappings)

---

## 🔧 UTILS & LIB

### Utils Core
```
`src/utils/`
`src/utils/cn.ts`
`src/utils/dateUtils.ts`
`src/utils/exportUtils.ts`
`src/utils/formatters.ts`
`src/utils/gdprCompliance.ts`
`src/utils/sportStats.ts`
`src/utils/validation.ts`
```

### Lib (Config & Intégrations)
```
`src/lib/`
`src/lib/analytics.ts`
`src/lib/queryClient.ts`
`src/lib/supabase.ts`
```

### Config
```
`src/config/`
`src/config/supabase.ts`
`src/config/app.ts`
```

---

## 🧪 TESTS (Infrastructure à Conserver)

### Test Setup
```
`src/test/`
`src/test/setup.ts`
`src/test/test-utils.tsx`
`src/__mocks__/`
`src/__mocks__/lucide-react.tsx`
```

### Tests Sport MVP
```
`src/__tests__/`
`src/__tests__/guest-mode.test.ts`
`src/__tests__/sport-session.test.ts`
`src/__tests__/exercise.test.ts`
`src/__tests__/notification.test.ts`
```

**EXCLUSIONS** (tests cabinet à archiver):
- ❌ `patient-simple.test.ts`

---

## 📦 ROOT & CONFIG FILES

### Build & Deployment
```
`package.json`
`package-lock.json`
`vite.config.ts`
`tsconfig.json`
`tsconfig.app.json`
`tsconfig.node.json`
`vercel.json`
```

### TypeScript & Linting
```
`.eslintrc.cjs`
`.prettierrc`
`.prettierignore`
```

### Git
```
`.gitignore`
`.gitattributes`
```

### Environment
```
`.env.example`
`.env.local` (si existe)
```

### Documentation Root
```
`README.md`
`CHANGELOG.md`
```

---

## 🚀 ENTRY POINTS & CORE

### Application Entry
```
`index.html`
`src/main.tsx`
`src/App.tsx`
`src/App.css`
`src/index.css`
```

### Assets
```
`src/assets/`
`public/`
```

---

## 📂 DOSSIERS ENTIERS À PRÉSERVER

### Complets (tous les fichiers)
```
`src/components/ui/navigation/`
`src/components/forms/`
`src/components/features/sport/`
`src/pages/sport/`
`src/pages/guest/`
`src/pages/legal/`
`src/lib/`
`src/config/`
`src/test/`
`src/__mocks__/`
`src/validation/`
`src/assets/`
`public/`
```

### Partiels (certains fichiers seulement)
```
`src/components/features/` (ExerciseForm, SessionForm, SessionValidation)
`src/services/` (SAUF patientsService, invoicesService)
`src/hooks/` (SAUF usePatients*, useInvoices, useSessions cabinet)
`src/types/` (SAUF patient.ts, mapping.ts)
`src/pages/` (SAUF DashboardPage, HomePage cabinet)
```

---

## 📋 SCRIPTS & AUTOMATION

### Scripts package.json (à préserver)
```
`scripts/qa:*` (all QA scripts)
`scripts/types:generate`
`scripts/analyze-bundle`
```

### CI/CD
```
`.github/workflows/`
`.github/workflows/scope-guard.yml`
```

---

## 🔐 SUPABASE & DATABASE

### Migrations (si présentes)
```
`supabase/migrations/`
`supabase/seed.sql`
`supabase/config.toml`
```

### Types générés
```
`src/types/supabase.ts` (auto-generated)
`src/types/database.types.ts`
```

---

## 🎯 RÈGLES DE PRÉSERVATION

### Règle 1: Préfixes Sport
**PRÉSERVER** tout fichier/dossier contenant:
- `sport*` (SportDashboardPage, sportExportService, etc.)
- `guest*` (GuestDashboardPage, guestStore, etc.)

### Règle 2: Core Features FR1-FR7, FR10
**PRÉSERVER** tout fichier implémentant:
- Profil utilisateur (FR1)
- Programmation séances (FR2)
- Duplication séances (FR3)
- Enregistrement exercices (FR4)
- Validation séance (FR5)
- Historique (FR6)
- Statistiques (FR7)
- Mode Guest (FR10)

### Règle 3: Infrastructure Technique
**PRÉSERVER** obligatoirement:
- Tous les fichiers config (vite, tsconfig, package.json)
- Tous les fichiers entry point (main.tsx, App.tsx, index.html)
- Tous les stores Zustand (SAUF patientStore, invoiceStore)
- Tous les services API (SAUF patientsService, invoicesService)

### Règle 4: RGPD & Légal
**PRÉSERVER** obligatoirement:
- `src/pages/legal/*`
- `src/utils/gdprCompliance.ts`
- Toute mention de "consent", "RGPD", "privacy"

### Règle 5: Tests & QA
**PRÉSERVER** obligatoirement:
- `src/test/*`
- `src/__mocks__/*`
- Tous les `*.test.ts` Sport MVP (SAUF patient-simple.test.ts)
- Configuration Playwright

---

## ❌ ANTI-PATTERNS (Ce qui NE doit PAS être préservé)

### Mots-clés Cabinet (À ARCHIVER)
- `patient*` (SAUF dans types génériques)
- `invoice*`
- `practitioner*`
- `cabinet*`
- `billing*`

### Composants Retirés (Déjà fait)
- ✅ BadgeSystem, StreakCounter (gamification FR8)
- ✅ SportPDFExport (export PDF FR11)
- ✅ 13 unused UI components
- ✅ 11 unused hooks

### Dossiers Cabinet (À ARCHIVER)
- `src/components/features/patients/`
- Pages: PatientsPage, PatientDetailPage, InvoicesPage, DashboardPage (cabinet), HomePage (cabinet)

---

## 📊 STATISTIQUES BACKBONE

### Fichiers Préservés (Estimé)
- **Pages Sport**: 4 pages + 2 guest + 2 legal = **8 pages**
- **Components Features**: ~15 composants sport core
- **Components UI**: ~25 composants Radix utilisés
- **Services**: 10 services (sport + core, notificationService exclu)
- **Hooks**: 8 hooks core
- **Stores**: 6-7 stores (notificationStore exclu si existe)
- **Types**: 7-8 types sport + core
- **Tests**: ~20 test files (sport MVP)

**Total estimé**: ~200-250 fichiers backbone

### Fichiers à Archiver (Estimé)
- **Cabinet**: ~38+ files
- **Gamification**: 2 files (déjà retirés)
- **PDF Export**: 2 files (déjà retirés)
- **Notifications**: 1-3 files (FR9 exclu)
- **Unused UI/Hooks**: 24 files (déjà retirés)

**Total archivé/retiré**: ~67-69 files

---

## 🔍 VALIDATION BACKBONE

### Commande Vérification
Pour vérifier qu'un fichier est dans le backbone:
```bash
# Rechercher dans ce fichier
grep -F "\`chemin/du/fichier.tsx\`" docs/backbone_map.md

# Vérifier imports d'un fichier
grep -r "import.*NomFichier" src/
```

### Tests Intégrité
Après archivage, vérifier:
```bash
# 1. Build réussit
npm run build

# 2. Tests passent
npm run test

# 3. Aucun import cassé
npm run types:check

# 4. Application démarre
npm run dev
```

---

**Fin du Backbone Map**
