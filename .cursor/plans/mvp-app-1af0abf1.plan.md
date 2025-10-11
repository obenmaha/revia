<!-- 1af0abf1-2e85-4b09-b3b0-5ad6ec87d19b c4ea1317-0131-423c-a067-f463cff399a1 -->

# Plan de Développement MVP App-Kine Complet

## Vue d'ensemble

Développement d'une application web complète de gestion de cabinet de kinésithérapie avec les 6 Epics fonctionnels. L'application utilisera la stack MVP 2025 optimisée : React 19, TypeScript, Supabase (PostgreSQL), Node.js backend, TanStack Query, Zustand, Radix UI + shadcn, React Hook Form + Zod.

## Phase 1: Configuration Supabase et Backend (Epic 1.1)

### 1.1 Configuration Supabase

- Créer `.env.local` avec les credentials Supabase fournis
- Compléter la configuration dans `src/lib/supabase.ts`
- Créer le schéma de base de données Supabase (migration SQL)
- Tables : users, patients, sessions, invoices, payments, documents
- Configurer Row Level Security (RLS) pour l'isolation des données

### 1.2 Backend Node.js + Express

- Créer la structure backend selon `docs/specifications-techniques.md`
- Configurer Express avec TypeScript, Prisma, middleware de sécurité
- Implémenter les contrôleurs, services, repositories
- Configurer la connexion Supabase PostgreSQL via Prisma
- Mettre en place les routes API RESTful

### 1.3 Services et Intégrations

- Finaliser `src/services/api.ts` avec interceptors
- Créer services spécifiques : `authService.ts`, `patientsService.ts`, `sessionsService.ts`
- Configurer TanStack Query avec Supabase Realtime
- Implémenter le système de cache et invalidation

## Phase 2: Authentification et Sécurité (Epic 1.2)

### 2.1 Système d'Authentification

- Page de connexion avec React Hook Form + Zod
- Page d'inscription avec validation complète
- Intégration Supabase Auth (JWT + OAuth)
- Gestion des tokens (access + refresh)
- Middleware de protection des routes

### 2.2 Interface Utilisateur Auth

- Composants UI avec Radix UI : LoginForm, RegisterForm, ResetPasswordForm
- Gestion des états de chargement et erreurs
- Redirection après authentification
- Persistance de session avec Zustand

### 2.3 Sécurité RGPD

- Implémenter RLS sur toutes les tables Supabase
- Configurer les politiques de sécurité par praticien
- Chiffrement des données sensibles (AES-256)
- Logs d'audit pour accès aux données médicales
- Gestion du consentement utilisateur

## Phase 3: Navigation et Layout (Epic 1.3)

### 3.1 Structure de Navigation

- Layout principal avec sidebar responsive
- Navigation avec React Router v7
- Breadcrumbs dynamiques
- Menu mobile avec drawer
- Thème clair/sombre (Zustand store)

### 3.2 Composants UI de Base

- Créer les composants shadcn : Button, Input, Select, Dialog, Toast, Tabs
- Composants de formulaire réutilisables
- Système de notifications avec Zustand
- Loading states et skeletons
- Error boundaries

### 3.3 Design System

- Configuration Tailwind avec tokens de design
- Composants accessibles WCAG AA
- Responsive mobile-first
- Icônes avec Lucide React

## Phase 4: Gestion des Patients (Epic 2)

### 4.1 CRUD Patients

- Page liste patients avec recherche instantanée
- Formulaire création/édition patient (React Hook Form + Zod)
- Validation complète des données
- Fiche patient détaillée
- Historique des modifications

### 4.2 Recherche et Filtrage

- Barre de recherche avec debounce
- Filtres avancés (statut, dernière séance, etc.)
- Tri multi-colonnes
- Pagination optimisée avec TanStack Query
- Recherche full-text PostgreSQL

### 4.3 Documents et Photos

- Upload de fichiers avec Supabase Storage
- Compression automatique des images (Sharp backend)
- Prévisualisation des documents
- Organisation par catégories
- Sécurité et chiffrement des fichiers

### 4.4 API Backend Patients

- Routes CRUD complètes : GET, POST, PUT, DELETE /api/patients
- Validation Zod côté serveur
- Pagination et filtrage optimisés
- Gestion des relations (séances, factures)

## Phase 5: Calendrier et Planification (Epic 3)

### 5.1 Interface Calendrier

- Intégration FullCalendar.js ou bibliothèque similaire
- Vues mensuelle, hebdomadaire, quotidienne
- Glisser-déposer pour planification
- Détection des conflits de créneaux
- Synchronisation temps réel avec Supabase Realtime

### 5.2 Gestion des Séances

- Formulaire création/modification séance
- Gestion des statuts (scheduled, completed, cancelled, no_show)
- Créneaux de disponibilité du praticien
- Gestion des récurrences
- Intégration avec fiches patients

### 5.3 Notifications et Rappels

- Système de notifications push
- Rappels automatiques par email
- Configuration des préférences de notification
- Templates d'emails personnalisables
- Integration SMTP (Resend ou SendGrid)

### 5.4 API Backend Calendrier

- Routes /api/sessions avec filtrage par date/praticien/patient
- Endpoints pour disponibilités et conflits
- Webhooks pour notifications
- Optimisation des requêtes avec index PostgreSQL

## Phase 6: Documentation des Séances (Epic 4)

### 6.1 Interface Documentation

- Formulaire de séance avec auto-save
- Templates de séance personnalisables
- Saisie rapide avec raccourcis
- Éditeur de notes riche
- Interface optimisée tablette

### 6.2 Objectifs et Évaluations

- Définition d'objectifs de traitement
- Système d'évaluation de progression
- Métriques personnalisables
- Graphiques de progression (Recharts)
- Alertes de non-progression

### 6.3 Exercices et Recommandations

- Bibliothèque d'exercices prédéfinis
- Prescription personnalisée
- Instructions avec images/vidéos
- Suivi de réalisation
- Export pour patients (PDF)

### 6.4 API Backend Documentation

- Routes /api/sessions/:id/notes, /api/objectives, /api/exercises
- Gestion des templates
- Génération PDF avec Puppeteer
- Stockage sécurisé des données médicales

## Phase 7: Facturation (Epic 5)

### 7.1 Génération de Factures

- Création automatique depuis séances
- Templates de facture personnalisables
- Conformité légale française
- Numérotation automatique
- Génération PDF professionnel

### 7.2 Suivi des Paiements

- Enregistrement des paiements
- Statuts (draft, sent, paid, overdue)
- Relances automatiques
- Statistiques de recouvrement
- Export comptable

### 7.3 Remboursements Sécurité Sociale

- Calcul automatique des remboursements
- Génération feuilles de soins
- Tracking des remboursements
- Alertes de retard

### 7.4 API Backend Facturation

- Routes /api/invoices avec gestion complète
- Routes /api/payments
- Calculs automatiques
- Intégration potentielle Stripe/moyens de paiement

## Phase 8: Analytics et Rapports (Epic 6)

### 8.1 Tableau de Bord

- KPIs principaux (séances du jour, patients actifs, CA)
- Métriques en temps réel
- Widgets personnalisables
- Alertes importantes
- Graphiques interactifs (Recharts)

### 8.2 Statistiques

- Fréquentation par période
- Analyse par patient
- Tendances et prévisions
- Comparaisons périodiques
- Export Excel/CSV

### 8.3 Rapports Financiers

- Revenus par période
- Analyse des coûts
- Projections financières
- Rapports pour comptabilité
- Export PDF professionnel

### 8.4 API Backend Analytics

- Routes /api/stats avec agrégations PostgreSQL
- Calculs optimisés avec vues matérialisées
- Cache Redis pour performance
- Endpoints pour exports

## Phase 9: PWA et Optimisations

### 9.1 Progressive Web App

- Configuration Workbox pour Service Worker
- Cache des assets statiques
- Mode offline basique
- Installation sur mobile
- Notifications push

### 9.2 Performance

- Code splitting optimisé
- Lazy loading des routes
- Optimisation des images
- Compression Brotli/Gzip
- CDN CloudFlare

### 9.3 Monitoring et Logging

- Configuration Sentry pour erreurs
- Logs backend avec Winston
- Métriques de performance
- Analytics utilisateur (PostHog optionnel)

## Phase 10: Tests et Déploiement

### 10.1 Tests

- Tests unitaires composants (Vitest + Testing Library)
- Tests API backend (Supertest)
- Tests d'intégration TanStack Query
- Tests E2E critiques (Playwright optionnel)
- Couverture de code >80%

### 10.2 Documentation

- README complet avec instructions setup
- Documentation API (Swagger optionnel)
- Guide utilisateur basique
- Documentation technique architecture

### 10.3 Déploiement

- Configuration CI/CD GitHub Actions
- Déploiement frontend sur Vercel
- Déploiement backend sur Railway/Render
- Configuration variables d'environnement production
- Tests de production

## Fichiers Critiques

### Configuration

- `.env.local` - Variables Supabase et secrets
- `src/lib/supabase.ts` - Client Supabase
- `src/lib/query-client.ts` - Configuration TanStack Query
- `src/lib/providers.tsx` - Providers React
- `backend/prisma/schema.prisma` - Schéma base de données

### Stores Zustand

- `src/stores/authStore.ts` - Authentification
- `src/stores/appStore.ts` - État global app
- `src/stores/patientsStore.ts` - Gestion patients
- `src/stores/calendarStore.ts` - État calendrier

### Services

- `src/services/api.ts` - Client API
- `src/services/authService.ts` - Service authentification
- `src/services/patientsService.ts` - Service patients
- `src/services/sessionsService.ts` - Service séances
- `src/services/invoicesService.ts` - Service facturation

### Backend

- `backend/src/server.ts` - Serveur Express
- `backend/src/routes/*.ts` - Routes API
- `backend/src/controllers/*.ts` - Contrôleurs
- `backend/src/services/*.ts` - Logique métier
- `backend/src/middleware/auth.ts` - Middleware auth

## Priorités d'Exécution

1. Configuration Supabase + Backend + Auth (Critique)
2. Navigation + UI de base (Bloquant)
3. Gestion Patients (MVP Core)
4. Calendrier (MVP Core)
5. Documentation Séances (MVP Core)
6. Facturation (Important)
7. Analytics (Nice to have)
8. PWA + Optimisations (Post-MVP)

### To-dos

- [ ] Epic 1: Configuration Infrastructure et Backend - Supabase, Express, Prisma, sécurité
- [ ] Epic 1: Système d'Authentification - Pages login/register, Supabase Auth, JWT, RLS
- [ ] Epic 1: Navigation et Layout - React Router v7, sidebar, composants UI shadcn
- [ ] Epic 2: Gestion Patients - CRUD complet, recherche, filtres, formulaires validés
- [ ] Epic 2: Documents et Photos - Upload Supabase Storage, compression, sécurité
- [ ] Epic 3: Calendrier Interactif - FullCalendar, glisser-déposer, vues multiples
- [ ] Epic 3: Gestion Séances - Création, modification, statuts, disponibilités
- [ ] Epic 3: Notifications et Rappels - Emails automatiques, configuration SMTP
- [ ] Epic 4: Documentation Séances - Formulaires, auto-save, templates, éditeur notes
- [ ] Epic 4: Objectifs et Évaluations - Progression, métriques, graphiques Recharts
- [ ] Epic 4: Bibliothèque Exercices - Prescription, instructions, suivi, export PDF
- [ ] Epic 5: Génération Factures - Automatique depuis séances, templates, PDF, conformité
- [ ] Epic 5: Suivi Paiements - Enregistrement, statuts, relances, stats recouvrement
- [ ] Epic 5: Remboursements - Calculs auto, feuilles de soins, tracking, alertes
- [ ] Epic 6: Tableau de Bord - KPIs, métriques temps réel, widgets, graphiques
- [ ] Epic 6: Statistiques Avancées - Fréquentation, tendances, analyses, exports
- [ ] Epic 6: Rapports Financiers - Revenus, coûts, projections, exports Excel/PDF
- [ ] PWA: Configuration Workbox, Service Worker, cache offline, notifications push
- [ ] Tests et Déploiement - Tests unitaires/E2E, CI/CD, Vercel + Railway, production
