# MVP Sport - Définition Stricte et Autorité

**Date**: 2025-10-16
**Source**: Compilation PRD v1.2, Architecture 01→04, QA Session 2025-10-16
**Statut**: Document d'Autorité pour Cleanup

---

## 🎯 PÉRIMÈTRE MVP STRICT

### Fonctionnalités Incluses (IN-SCOPE)

#### FR1 - Profil Utilisateur Sportif ✅
- Nom d'affichage/pseudo (obligatoire)
- Objectifs sportifs en texte libre (optionnel)
- Préférences utilisateur (notifications, thème)
- **Composant**: `src/pages/ProfilePage.tsx`, `src/pages/sport/SportProfilePage.tsx`

#### FR2 - Programmation de Séances ✅
- Création de séance avec date, type, objectifs
- Interface simple et rapide
- **Composant**: `src/pages/sport/SportSessionCreatePage.tsx`

#### FR3 - Duplication de Séances (Fonctionnalité Clé) ✅
- Duplication sur dates multiples
- Sélection de dates avec picker calendrier
- Options de récurrence
- **Composant**: `src/pages/new-session.tsx`

#### FR4 - Enregistrement des Exercices ✅
- Nom, séries, répétitions, temps
- Échelle RPE (1-10) et douleur (1-10)
- Notes libres par exercice
- **Composants**: `src/components/features/ExerciseForm.tsx`, `src/components/features/sport/RPEScale.tsx`

#### FR5 - Validation de Séance ✅
- Validation finale avec mise à jour stats
- Feedback de félicitations
- Calcul automatique du streak
- **Composant**: `src/components/features/SessionValidation.tsx`

#### FR6 - Historique Chronologique ✅
- Liste des séances avec filtres par période
- Filtres par type de séance
- **Composants**: `src/pages/sport/SportHistoryPage.tsx`, `src/components/features/sport/SportHistory/`

#### FR7 - Statistiques Simples ✅
- Fréquence/semaine, durée totale, tendance RPE
- Graphiques simples et clairs
- **Composants**: `src/components/features/SessionStatistics.tsx`, `src/components/features/sport/SportStatistics/`

#### FR10 - Mode Guest ✅
- Onboarding en 1 clic sans authentification
- Données locales temporaires (localStorage)
- Expiration automatique 30 jours
- Migration sécurisée vers compte permanent
- **Composants**: `src/pages/guest/`, `src/services/migrateGuestToAccount.ts`

---

### Fonctionnalités Exclues (OUT-OF-SCOPE)

#### FR8 - Gamification Basique ❌
**Statut**: RETIRÉ du MVP (per SMART-CLEAN-PASS-REPORT.md)
- Streaks + badges → V2
- **Raison**: Réduction bundle + focus core features
- **Composants supprimés**: `BadgeSystem.tsx`, `StreakCounter.tsx` (déjà retirés)

#### FR9 - Système de Rappels ❌
**Statut**: RETIRÉ du MVP
- Notifications locales/email → V2
- **Raison**: Simplification scope MVP
- **Service à archiver**: `src/services/notificationService.ts`

#### FR11 - Export Léger ⚠️
**Statut**: CSV UNIQUEMENT (PDF exclu)
- ✅ CSV avec papaparse (lightweight)
- ❌ PDF avec jspdf (147KB blocker)
- **Composants**: `SportExportModal.tsx` (CSV-only), `sportExportService.ts` (PDF removed)

#### Cabinet Management (Epic 2.x) ❌
**Statut**: Reporté V2
- Gestion patients/dossiers
- Calendrier praticien
- Notes professionnelles
- Facturation/statistiques cabinet
- **Répertoires à archiver**: `src/components/features/patients/`, pages patients/invoices

---

## 📐 EXIGENCES NON-FONCTIONNELLES (NFR)

### NFR1 - Performance ⚠️
**Cible**: Bundle < 300 KB initial, TTFB < 1s
**État actuel**: ~695 KB (gap: -395 KB)
**Statut**: EN COURS D'OPTIMISATION

**Bundle Breakdown** (2025-10-16):
```
Total: 695 KB (~350 KB gzipped)
├── vendor-react: 470 KB (67.8%)  ← CRITICAL
├── vendor-auth: 147 KB (21.2%)   ← Supabase Auth
├── vendor-other: 97 KB (14.0%)
└── vendor-radix: 69 KB (9.9%)
```

**Actions requises**:
- Cabinet code archive: -200KB
- Vendor optimization future: -150KB

### NFR2 - Compatibilité ✅
- Chrome/Safari/Firefox/Edge récents (2 dernières versions)
- Responsive mobile-first
- Support gestes tactiles
- **Statut**: CONFORME

### NFR3 - Fiabilité ✅
- Dépendance Vercel (99.9%)
- Dépendance Supabase (99.9%)
- **Statut**: CONFORME

### NFR4 - Sécurité ✅
- TLS en transit
- RLS Supabase activé sur toutes tables
- Hashing mots de passe (Supabase)
- Politique de rôles minimale
- **Statut**: PRODUCTION-READY (validé 2025-01-14)

### NFR5 - RGPD ✅
- Minimisation des données
- Base légale: consentement explicite
- Pages mentions légales/CGU
- Droit export/suppression
- **Composants**: `src/pages/legal/`, `src/utils/gdprCompliance.ts`

### NFR6 - Accessibilité ✅
- WCAG 2.1 Level AA
- Ratio contraste 4.5:1 minimum
- États de focus visibles
- Navigation clavier complète
- **Statut**: PRODUCTION-READY (28 tests Playwright validés)

### NFR7 - Sauvegarde ✅
- Auto-save local (draft)
- Save explicite serveur à validation
- Pas de mode offline-first complexe
- **Statut**: IMPLÉMENTÉ

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Tech Stack (Conservation Totale)
- **Frontend**: React 19 + Vite 7.x + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State**: Zustand (client) + TanStack Query v5 (server)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase (Auth + Postgres + Storage)
- **Deployment**: Vercel

**Principe**: AUCUNE nouvelle technologie ajoutée

### Modèles de Données (Additifs Uniquement)

#### Nouvelles Tables (Supabase)
1. **sport_users** (extension de auth.users)
   - display_name, sport_goals, preferences
   - streak_count, total_sessions
   - RLS: users can view/update own profile

2. **sport_sessions**
   - user_id, name, date, type, status
   - objectives, notes, rpe_score, pain_level
   - RLS: users can view/create/update own sessions

3. **sport_exercises**
   - session_id, name, exercise_type
   - sets, reps, weight_kg, duration_seconds
   - RLS: users can access via session ownership

4. **guest_data** (temporaire)
   - guest_token, encrypted_data, expires_at
   - RLS: accessible via token only

**Principe**: Aucune modification des tables existantes (patients, sessions cabinet, etc.)

### Navigation Mobile-First

**Barre d'onglets** (bottom navigation):
```
[Accueil] [+Séance] [Historique] [Profil]
```

**Écrans Sport MVP**:
- `SportDashboardPage.tsx` - Dashboard avec stats
- `SportSessionCreatePage.tsx` - Nouvelle séance
- `SportHistoryPage.tsx` - Historique filtré
- `SportProfilePage.tsx` - Profil utilisateur
- `guest/GuestDashboardPage.tsx` - Mode guest

**Layout**: `src/components/ui/app-layout.tsx`

---

## 📊 SUCCESS METRICS (Baseline Définies)

### Métriques Principales
1. **Adhérence 30j**: 40% → 60% (+20 pts)
   - % utilisateurs avec ≥2 séances/semaine

2. **Activation D7**: 25% → 45% (+20 pts)
   - % créent ≥1 séance + valident ≥1 séance

3. **Conversion Guest**: 0% → 30% (+30 pts)
   - % Guest → compte permanent

### Analytics PostHog (Events MVP Only)
**Events Sport MVP** (src/lib/analytics.ts):
- `session_created` (FR2, FR3)
- `session_validated` (FR5)
- `guest_mode_entered` (FR10)
- `guest_session_created` (FR10)
- `guest_migration_started` (FR10.2)
- `guest_migration_completed` (FR10.2)
- `guest_migration_failed` (FR10.2)

**Events EXCLUS**: Aucun event cabinet/patient/invoice/notification

---

## 🚫 EXCLUSIONS CONFIRMÉES

### Code à Archiver (V2)
1. **Cabinet Management**
   - Pages: PatientsPage, PatientDetailPage, InvoicesPage
   - Components: `src/components/features/patients/*`
   - Services: patientsService.ts, invoicesService.ts
   - Types: patient.ts, mapping.ts

2. **Gamification** (déjà retiré)
   - BadgeSystem, StreakCounter
   - Badge calculation logic

3. **Export PDF** (déjà retiré)
   - SportPDFExport.tsx
   - jspdf dependency (prevented)

4. **Notifications/Rappels** (FR9 exclu)
   - notificationService.ts
   - Notification stores/hooks

### Dépendances Exclues
- ❌ `jspdf` (147KB) - NOT installed
- ✅ `papaparse` (45KB) - KEPT for CSV
- ⚠️ Radix UI components non utilisés (audit en cours)

---

## 🔒 CONTRAINTES & RÈGLES

### 1. Supabase Auth/RLS - NON NÉGOCIABLE
- RLS activé sur toutes tables MVP
- Aucune migration destructive
- Extension uniquement (pas de modification schéma existant)

### 2. UI Mobile-First - PRIORITAIRE
- Barre onglets bas (< 640px)
- Touch targets ≥ 44px
- Navigation clavier complète (desktop)

### 3. RGPD by Design - OBLIGATOIRE
- Consentement explicite (rappels, analytics)
- Data minimization (champs strictement nécessaires)
- Opt-in par défaut (pas d'opt-out)
- Pages légales accessibles

### 4. Performance Budget - EN COURS
- Bundle initial: <300 KB (actuel: 695 KB)
- TTFB: <1s (à valider)
- Lazy loading routes implémenté ✅

### 5. Accessibilité WCAG AA - PRODUCTION-READY
- Contraste 4.5:1 minimum ✅
- Focus states visibles ✅
- Labels ARIA complets ✅
- Navigation clavier ✅

---

## 📋 QA GATES (Status 2025-10-16)

| Gate | Target | Actual | Status |
|------|--------|--------|--------|
| **NFR1: Bundle** | <300 KB | 695 KB | ❌ FAIL (-395 KB) |
| **NFR4: RLS** | PASS | PASS | ✅ PRODUCTION-READY |
| **NFR6: A11y** | PASS | PASS | ✅ PRODUCTION-READY |
| **Test Coverage** | >95% | ~95%* | ⚠️ LIKELY PASS |
| **Build Success** | Required | Success | ✅ PASS |

*Infrastructure excellente (23 test files, 434 tests), validation finale requise

**Gate Decision**: ⚠️ MINOR CONCERNS (Quality Score: 78/100)
- Déployable avec monitoring performance
- Bundle optimization sprint recommandé

---

## 🛠️ CLEANUP STRATEGY

### Déjà Fait (SMART-CLEAN-PASS)
✅ Removed 26 files:
- 13 unused UI components (accordion, alert-dialog, etc.)
- 11 unused hooks (useClickOutside, useCopyToClipboard, etc.)
- 2 PDF export files
- **Savings**: -14 KB bundle

### À Faire (Prochains PRs)
1. **Cabinet Code Archive** (P1 - HIGH)
   - Archive ~38+ files cabinet
   - **Estimated savings**: -200 KB
   - **Risk**: Medium-High (shared dependencies)

2. **Type System Cleanup** (P1 - HIGH)
   - Regenerate Supabase types
   - Fix Date standardization
   - **Estimated time**: 2-3 hours

3. **Vendor Optimization** (P3 - FUTURE)
   - Preact migration consideration
   - Radix UI alternatives
   - **Estimated savings**: -150 KB

---

## 📖 RÉFÉRENCES DOCUMENTATION

### Documents Sources
- `docs/prd/01-introduction.md` → `05-epic-structure.md`
- `docs/architecture/01-introduction.md` → `04-component-architecture.md`
- `docs/prd-v1.2-sport-mvp.md` (consolidated)
- `docs/qa/session-summary-2025-10-16.md` (QA validation)
- `docs/SMART-CLEAN-PASS-REPORT.md` (cleanup execution)
- `KILL-LIST-SPORT-MVP.md` (cleanup strategy)

### Rapports QA
- `docs/qa/qa-report-mvp-sport-nfr-pass-v2.md` (500+ lines)
- `docs/qa/gates/mvp-sport-nfr-pass.yml` (gate decision)
- Historical: `docs/qa/RAPPORT-REVISION-COMPLETE-2025-01-14.md`

---

## 🎯 DÉFINITION "DONE" MVP

### Critères Fonctionnels
- ✅ FR1 (Profil) → FR7 (Stats) implémentés
- ✅ FR10 (Guest mode) implémenté
- ✅ CSV export (FR11 partiel) implémenté
- ❌ FR8 (Gamification) exclu MVP
- ❌ FR9 (Rappels) exclu MVP

### Critères NFR
- ⚠️ Bundle <300 KB (en cours, 695 KB actuel)
- ✅ RLS production-ready
- ✅ A11y WCAG AA compliant
- ✅ RGPD compliant (pages légales + consent)
- ✅ Mobile-first navigation

### Critères Qualité
- ✅ Build succeeds (Vite 10.43s)
- ⚠️ Test coverage >95% (infrastructure OK, validation finale requise)
- ✅ Security tests PASS
- ✅ A11y tests PASS (28 Playwright tests)
- ⚠️ TypeScript errors: ~120 (non-blocking, cleanup requis)

### Déploiement
- ✅ Application déployable
- ⚠️ Monitoring performance recommandé
- ⚠️ Bundle optimization sprint suivant

---

**Fin du Document d'Autorité MVP Sport**
