# Revia Sport MVP - PRD v1.2 (Draft)

## Intro Project Analysis and Context

### Existing Project Overview

**Analysis Source**: IDE-based fresh analysis

**Current Project State**: 
Revia est une application web de gestion de cabinet de kinésithérapie existante, construite avec une architecture serverless "Full Supabase + Edge Functions". L'application actuelle se concentre sur la gestion des patients, séances, et facturation pour les kinésithérapeutes.

### Available Documentation Analysis

**Available Documentation**:
- ✅ Tech Stack Documentation (React 19 + Vite + TypeScript + Tailwind + Zustand + TanStack Query)
- ✅ Source Tree/Architecture (Architecture serverless Supabase documentée)
- ✅ Coding Standards (Standards de développement définis)
- ✅ API Documentation (Supabase Auth, Postgres, Storage)
- ✅ External API Documentation (Supabase Edge Functions)
- ⚠️ UX/UI Guidelines (Partiellement documentées)
- ✅ Technical Debt Documentation (Identifiée dans l'architecture)
- ✅ Other: PRD v1.0, Architecture technique, Spécifications techniques

### Enhancement Scope Definition

**Enhancement Type**:
- ✅ New Feature Addition
- ✅ Major Feature Modification
- ✅ UI/UX Overhaul

**Enhancement Description**: 
Transformation de l'application Revia d'un outil de gestion de cabinet vers une application sport-first pour les sportifs et patients autonomes, avec focus sur la programmation, réalisation et validation de séances d'exercices.

**Impact Assessment**:
- ✅ Major Impact (architectural changes required)

### Goals and Background Context

**Goals**:
- Aider les sportifs (et patients autonomes) à programmer, réaliser, valider leurs séances, simplement
- Augmenter l'adhérence aux exercices (baseline actuelle : 40% → objectif : 60% = +20 pts)
- Motiver via une gamification basique mais solide (streaks, badges light)
- Mobile-first, friction minimale (Guest), partage simple (CSV/PDF léger) à V1
- RGPD by design (data minimization, consentement explicite, RLS Supabase)

**Success Metrics (MVP) - Baseline Définie**:
- **Adhérence 30j** : % d'utilisateurs avec ≥2 séances/sem (baseline : 40% → objectif : 60%)
- **Activation D7** : % créent ≥1 séance + valident ≥1 séance (baseline : 25% → objectif : 45%)
- **Streak médian** : jours consécutifs (baseline : 3 jours → objectif : 7 jours)
- **Conversion Guest** : % Guest → compte permanent (baseline : 0% → objectif : 30%)

**Background Context**:
L'application Revia actuelle est conçue pour les kinésithérapeutes gérant leurs cabinets. Cette amélioration majeure transforme l'application en une solution sport-first pour les sportifs et patients autonomes, en conservant l'architecture technique existante mais en refocalisant complètement l'expérience utilisateur et les fonctionnalités métier.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-19 | 1.0 | Création initiale du PRD | John (PM) |
| 2024-12-19 | 2.0 | Refocus patient/sportif | John (PM) |
| 2025-01-14 | 1.1 | Sport MVP – suppression Offline-first, Cabinet → V2 | BMad Orchestrator |
| 2025-01-14 | 1.2 | Alignement Revia: sport-first, brownfield, tech simplifiée | Oussama/PM |

## Requirements

### Functional

**FR1** : L'application doit permettre la création d'un profil léger avec prénom/pseudo, objectifs simples (texte), et préférences utilisateur.

**FR2** : L'application doit permettre de programmer une séance avec date, type, et objectifs rapides.

**FR3** : L'application doit permettre de dupliquer une séance sur dates multiples (fonctionnalité clé UX MVP).

**FR4** : L'application doit permettre d'enregistrer les exercices de la séance (nom, séries/répétitions/temps au besoin), RPE & douleur (échelle simple), et note rapide.

**FR5** : L'application doit permettre de valider la séance (mise à jour des statistiques + feedback).

**FR6** : L'application doit fournir un historique chronologique avec filtres par période.

**FR7** : L'application doit afficher des statistiques simples : fréquence/semaine, durée totale, tendance RPE.

**FR8** : L'application doit implémenter une gamification basique : streaks + quelques badges (paliers).

**FR9** : L'application doit envoyer des rappels (notifications locales/email simples ; opt-in).

**FR10** : L'application doit proposer un mode Guest avec données locales temporaires et onboarding en 1 clic.

**FR10.1** : Le mode Guest doit stocker les données localement (localStorage) avec expiration automatique après 30 jours.

**FR10.2** : L'application doit proposer une migration sécurisée des données Guest vers un compte permanent avec consentement explicite.

**FR10.3** : Les données Guest doivent être chiffrées localement et supprimées automatiquement après migration ou expiration.

**FR11** : L'application doit permettre un export léger : CSV/PDF récap basique (séances validées).

**FR11.1** : L'export doit inclure les mentions légales RGPD et le consentement explicite de l'utilisateur.

**FR11.2** : L'export doit permettre la suppression des données personnelles conformément au RGPD.

**FR11.3** : L'export doit être limité aux données strictement nécessaires (principe de minimisation).

### Non Functional

**NFR1** : Performance - TTFB < 1s côté Vercel pour pages principales ; bundle < 300 KB initial.

**NFR2** : Compatibilité - Chrome/Safari/Firefox/Edge récents ; responsive mobile-first.

**NFR3** : Fiabilité - S'appuyer sur la disponibilité Vercel/Supabase (pas de SLO propres).

**NFR4** : Sécurité - TLS, RLS Supabase activées, hashing côté provider, politique de rôles minimale.

**NFR5** : RGPD - minimiser champs ; base légale = consentement ; pages : mentions/CGU + export/suppression.

**NFR6** : Accessibilité - WCAG AA pour contrastes et focus states prioritaires.

**NFR7** : Sauvegarde - auto-save local (draft) + save explicite serveur à la validation (évite offline-first caché).

### Compatibility Requirements

**CR1** : L'amélioration doit maintenir la compatibilité avec l'architecture Supabase existante (Auth, Postgres, Storage, Edge Functions).

**CR2** : L'amélioration doit préserver la structure de base de données existante tout en ajoutant les nouvelles tables nécessaires pour les fonctionnalités sport.

**CR3** : L'amélioration doit maintenir la cohérence UI/UX avec le système de design existant (Tailwind + Radix UI).

**CR4** : L'amélioration doit être compatible avec le système de déploiement Vercel existant.

## User Interface Enhancement Goals

### Integration with Existing UI

L'interface sport-first s'intègre avec le système de design existant en utilisant les composants Radix UI + Tailwind CSS déjà en place, mais en refocalisant la navigation sur un barre d'onglets mobile-first (Accueil / Nouvelle séance / Historique / Profil).

### Modified/New Screens and Views

- **Écran d'accueil** : Dashboard sportif avec statistiques et prochaines séances
- **Nouvelle séance** : Création et duplication de séances
- **Historique** : Liste chronologique des séances avec filtres
- **Profil** : Gestion du profil utilisateur et préférences
- **Mode Guest** : Interface simplifiée sans authentification

### UI Consistency Requirements

- Maintenir la cohérence visuelle avec l'architecture existante
- Mobile-first design avec barre d'onglets en bas
- Flux central : Programmer → Faire → Valider (écrans dédiés, CTA clairs)
- Création express + duplication multi-dates (picker calendrier)

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages**: TypeScript, JavaScript
**Frameworks**: React 19, Vite 7.x
**Database**: PostgreSQL 15+ (via Supabase)
**Infrastructure**: Vercel (Frontend), Supabase (Backend)
**External Dependencies**: Supabase Auth, Supabase Storage, TanStack Query v5, Zustand

### Integration Approach

**Database Integration Strategy**: Ajout de nouvelles tables pour les fonctionnalités sport tout en préservant les tables existantes pour la compatibilité future avec les fonctionnalités cabinet.

**API Integration Strategy**: Utilisation des Edge Functions Supabase existantes avec ajout de nouvelles fonctions pour les fonctionnalités sport.

**Frontend Integration Strategy**: Réutilisation des composants UI existants avec création de nouveaux composants spécifiques au sport.

**Testing Integration Strategy**: Extension des tests existants avec ajout de tests E2E pour les parcours sport critiques.

### Code Organization and Standards

**File Structure Approach**: Conservation de la structure existante avec ajout de dossiers spécifiques au sport dans `src/components/features/`.

**Naming Conventions**: Respect des conventions TypeScript/React existantes.

**Coding Standards**: Maintien des standards de développement existants.

**Documentation Standards**: Extension de la documentation existante avec les nouvelles fonctionnalités.

### Deployment and Operations

**Build Process Integration**: Utilisation du pipeline Vite existant.

**Deployment Strategy**: Déploiement via Vercel existant.

**Monitoring and Logging**: Extension du monitoring Sentry existant.

**Configuration Management**: Utilisation de la configuration Supabase existante.

### Risk Assessment and Mitigation

**Technical Risks**: 
- Risque de conflit entre fonctionnalités cabinet et sport
- Complexité de la migration des données existantes

**Integration Risks**:
- Risque de régression sur les fonctionnalités existantes
- Complexité de l'intégration avec l'architecture Supabase

**Deployment Risks**:
- Risque de déploiement cassant les fonctionnalités existantes

**Mitigation Strategies**:
- Développement en mode feature flag
- Tests de régression complets
- Déploiement progressif avec rollback possible

## Epic and Story Structure

**Epic Structure Decision**: Single comprehensive epic car il s'agit d'une transformation cohérente de l'application existante vers une approche sport-first, avec toutes les fonctionnalités liées et interdépendantes.

## Epic 1: Transformation Sport-First MVP

**Epic Goal**: Transformer l'application Revia d'un outil de gestion de cabinet vers une application sport-first pour les sportifs et patients autonomes, en conservant l'architecture technique existante.

**Integration Requirements**: 
- Maintenir la compatibilité avec l'architecture Supabase existante
- Préserver les fonctionnalités existantes pour une future réactivation
- Implémenter un système de feature flags pour basculer entre modes

### Story 1.1: Refactoring Architecture et Navigation

En tant qu'utilisateur sportif,
je veux une interface mobile-first avec navigation par onglets,
afin d'accéder facilement aux fonctionnalités principales sur mobile.

**Acceptance Criteria**:
1. Implémentation d'une barre d'onglets mobile (Accueil / Nouvelle séance / Historique / Profil)
2. Refactoring de la navigation existante pour supporter le mode sport
3. Adaptation responsive de tous les écrans existants
4. Mise en place d'un système de feature flags pour basculer entre modes

**Integration Verification**:
1. IV1: Vérifier que les fonctionnalités existantes restent accessibles via feature flags
2. IV2: Vérifier que la navigation mobile fonctionne sur tous les navigateurs supportés
3. IV3: Vérifier que les performances ne sont pas dégradées par les changements

### Story 1.2: Système de Profil Sportif

En tant qu'utilisateur sportif,
je veux créer un profil simple avec mes objectifs et préférences,
afin de personnaliser mon expérience d'entraînement.

**Acceptance Criteria**:
1. Création d'un formulaire de profil simplifié (prénom/pseudo, objectifs, préférences)
2. Intégration avec Supabase Auth existant
3. Stockage des préférences utilisateur
4. Interface de modification du profil

**Integration Verification**:
1. IV1: Vérifier que l'authentification Supabase existante fonctionne toujours
2. IV2: Vérifier que les données utilisateur sont correctement stockées
3. IV3: Vérifier que les performances de chargement du profil sont acceptables

### Story 1.3: Gestion des Séances Sportives

En tant qu'utilisateur sportif,
je veux programmer et dupliquer mes séances d'entraînement,
afin de planifier efficacement mes sessions.

**Acceptance Criteria**:
1. Interface de création de séance (date, type, objectifs)
2. Fonctionnalité de duplication de séance sur dates multiples
3. Picker de calendrier pour la sélection de dates
4. Sauvegarde des séances dans Supabase

**Integration Verification**:
1. IV1: Vérifier que les séances sont correctement sauvegardées en base
2. IV2: Vérifier que la duplication fonctionne sur différentes périodes
3. IV3: Vérifier que les performances de sauvegarde sont acceptables

### Story 1.4: Enregistrement des Exercices et Validation

En tant qu'utilisateur sportif,
je veux enregistrer mes exercices avec RPE et douleur,
afin de suivre ma progression et valider mes séances.

**Acceptance Criteria**:
1. Interface d'enregistrement des exercices (nom, séries, répétitions, temps)
2. Échelles de RPE et douleur intégrées
3. Système de validation de séance avec feedback
4. Mise à jour automatique des statistiques

**Integration Verification**:
1. IV1: Vérifier que les données d'exercices sont correctement sauvegardées
2. IV2: Vérifier que les statistiques sont mises à jour en temps réel
3. IV3: Vérifier que la validation de séance fonctionne correctement

### Story 1.5: Historique et Statistiques

En tant qu'utilisateur sportif,
je veux consulter mon historique et mes statistiques,
afin de suivre ma progression dans le temps.

**Acceptance Criteria**:
1. Historique chronologique des séances avec filtres
2. Statistiques de fréquence, durée et tendance RPE
3. Interface de visualisation des données
4. Export des données en CSV/PDF

**Integration Verification**:
1. IV1: Vérifier que l'historique affiche correctement toutes les séances
2. IV2: Vérifier que les statistiques sont calculées correctement
3. IV3: Vérifier que l'export fonctionne sur différents navigateurs

### Story 1.6: Gamification et Rappels

En tant qu'utilisateur sportif,
je veux être motivé par la gamification et recevoir des rappels,
afin de maintenir ma régularité d'entraînement.

**Acceptance Criteria**:
1. Système de streaks (jours consécutifs)
2. Badges de progression (paliers)
3. Système de rappels (notifications locales/email)
4. Interface de visualisation des récompenses

**Integration Verification**:
1. IV1: Vérifier que les streaks sont calculés correctement
2. IV2: Vérifier que les notifications fonctionnent sur mobile
3. IV3: Vérifier que les badges s'attribuent correctement

### Story 1.7: Mode Guest et Export

En tant qu'utilisateur sportif,
je veux essayer l'application sans créer de compte,
afin de tester les fonctionnalités avant de m'engager.

**Acceptance Criteria**:
1. Mode Guest avec données locales temporaires
2. Onboarding simplifié en 1 clic
3. Bannière de conversion "Sauvegarder mon progrès"
4. Export des données Guest vers compte permanent

**Integration Verification**:
1. IV1: Vérifier que le mode Guest fonctionne sans authentification
2. IV2: Vérifier que la conversion Guest vers compte fonctionne
3. IV3: Vérifier que les données sont correctement migrées

## V2 - Cabinet (Annexe)

Les fonctionnalités de gestion de cabinet (dossiers patients, calendrier praticien, notes pro, stats cabinet, etc.) sont reportées à la V2 avec une interface distincte, permettant de se concentrer sur l'expérience sport-first en MVP.
