# Revia Sport MVP - Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Créer une application web moderne pour les sportifs et patients en rééducation
- Améliorer l'adhésion aux exercices prescrits de 60% à 80%
- Motiver les utilisateurs grâce à la gamification et au suivi de progression
- Offrir une expérience utilisateur intuitive et mobile-first
- Permettre le partage facile de l'historique avec les professionnels de santé
- Assurer la conformité RGPD pour la gestion des données de santé

### Background Context

Revia Sport MVP répond au besoin critique des sportifs et patients en rééducation de suivre leurs exercices prescrits et de maintenir leur motivation sur le long terme. Actuellement, 60% des patients arrêtent leurs exercices prescrits, ce qui ralentit leur récupération et réduit l'efficacité des séances de kinésithérapie.

Le marché français de la rééducation et du sport compte des millions de personnes qui ont besoin d'outils simples et motivants pour suivre leur progression. Ces utilisateurs ont besoin d'une application qui combine simplicité d'usage, gamification et partage facile avec leur kinésithérapeute.

L'application vise à devenir la solution de référence pour le suivi d'exercices en France, en combinant simplicité d'usage, gamification et partage professionnel.

### Change Log

| Date       | Version | Description              | Author    |
| ---------- | ------- | ------------------------ | --------- |
| 2024-12-19 | 1.0     | Création initiale du PRD | John (PM) |
| 2024-12-19 | 2.0     | Refocus patient/sportif  | John (PM) |
| 2025-01-14 | 1.1     | Sport MVP - Suppression Offline-first, Cabinet vers V2 | BMad Orchestrator |

## Requirements

### Functional

**FR1** : L'application doit permettre la création et la gestion de profils sportifs/patients complets incluant informations personnelles, objectifs et préférences.

**FR2** : L'application doit fournir un système de création et gestion de sessions d'exercices avec planification flexible.

**FR3** : L'application doit permettre l'enregistrement détaillé des exercices avec métriques de performance (durée, intensité, RPE, douleur).

**FR4** : L'application doit offrir un historique complet des sessions avec visualisation de la progression.

**FR5** : L'application doit permettre l'export et le partage de l'historique avec les professionnels de santé.

**FR6** : L'application doit fournir un système de gamification basique (streaks, badges, objectifs).

**FR7** : L'application doit envoyer des rappels de motivation personnalisés.

**FR8** : L'application doit offrir un mode Guest pour essai sans inscription.

**FR9** : L'application doit permettre la visualisation des statistiques de progression.

**FR10** : L'application doit offrir un système de notes et d'observations pour chaque session.

### Non Functional

**NFR1** : L'application doit se charger en moins de 2 secondes sur mobile et desktop.

**NFR2** : L'application doit être accessible 99.9% du temps avec un temps de réponse moyen inférieur à 500ms.

**NFR3** : L'application doit supporter jusqu'à 10,000 utilisateurs simultanés sans dégradation de performance.

**NFR4** : L'application doit être conforme au RGPD pour la gestion des données de santé.

**NFR5** : L'application doit fonctionner sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge) et être responsive.

**NFR6** : L'application doit chiffrer toutes les données sensibles en transit et au repos.

**NFR7** : L'application doit permettre la sauvegarde automatique des données toutes les 30 secondes.

**NFR8** : L'application doit offrir une interface accessible selon les standards WCAG AA.

## User Interface Design Goals

### Overall UX Vision

Revia Sport privilégie la simplicité et l'efficacité. L'interface doit être intuitive pour les sportifs et patients qui veulent un suivi simple et motivant. L'expérience utilisateur doit être fluide, rapide et adaptée à l'usage mobile quotidien.

### Key Interaction Paradigms

- **Navigation par onglets** : Accès rapide aux principales fonctionnalités
- **Création rapide** : Créer une session en quelques clics
- **Swipe gestures** : Navigation mobile naturelle
- **Auto-save** : Sauvegarde automatique pour éviter la perte de données
- **Mode Guest** : Essai immédiat sans friction

### Core Screens and Views

- **Tableau de bord** : Vue d'ensemble de la progression et sessions récentes
- **Nouvelle session** : Interface de création de session d'exercices
- **Historique** : Liste chronologique des sessions avec filtres
- **Profil** : Gestion du profil et des objectifs
- **Statistiques** : Graphiques de progression et métriques
- **Partage** : Export et partage avec professionnels
- **Paramètres** : Configuration des préférences et rappels

### Accessibility: WCAG AA

L'application respecte les standards d'accessibilité WCAG AA pour assurer l'usage par tous les utilisateurs, y compris ceux avec des besoins spécifiques.

### Branding

Interface moderne et motivante avec une palette de couleurs énergisantes (bleus et verts) inspirée de l'univers sportif. Typographie claire et lisible, icônes intuitives et cohérentes.

### Target Device and Platforms: Web Responsive

Application web responsive optimisée pour tous les appareils, avec une approche mobile-first. Fonctionne sur smartphones, tablettes et ordinateurs de bureau.

## Technical Assumptions

### Repository Structure: Monorepo

Structure monorepo pour gérer l'application frontend, l'API backend et les outils de déploiement dans un seul repository.

### Service Architecture

Architecture serverless modulaire avec Supabase (PostgreSQL + Auth + Storage + Edge Functions). Cette approche simplifie le développement et le déploiement tout en permettant une évolution future.

### Testing Requirements

Pyramide de tests complète :

- Tests unitaires (80%) : Logique métier et composants
- Tests d'intégration (15%) : API et interactions entre modules
- Tests end-to-end (5%) : Flux utilisateur critiques

### Additional Technical Assumptions and Requests

- **Base de données** : Supabase (PostgreSQL) pour la robustesse et la conformité RGPD
- **Authentification** : Supabase Auth avec JWT
- **Déploiement** : Vercel pour la simplicité
- **Monitoring** : Sentry pour le suivi des erreurs
- **Backup** : Sauvegarde automatique Supabase
- **CDN** : CloudFlare pour la performance globale
- **Analytics** : Plausible Analytics pour le respect de la vie privée

## Epic List

**Epic S1** : Infrastructure et Authentification - Mise en place de l'infrastructure de base, authentification sécurisée et interface mobile-first

**Epic S2** : Gestion des Sessions et Exercices - Création, enregistrement et validation des sessions d'exercices avec métriques détaillées

**Epic S3** : Historique et Progression - Visualisation de l'historique complet et suivi de la progression

**Epic S4** : Export et Partage - Export et partage de l'historique avec les professionnels de santé

**Epic S5** : Motivation et Engagement - Gamification, rappels et progression pour maintenir la motivation

## Epic S1: Infrastructure et Authentification

**Epic Goal** : Établir les fondations techniques de l'application avec un système d'authentification sécurisé, une base de données structurée et une interface utilisateur de base.

### Story S1.1: Configuration du Projet et Infrastructure

En tant que développeur,
Je veux configurer l'infrastructure de base du projet,
Afin de disposer d'un environnement de développement stable et productif.

**Acceptance Criteria:**

1. Le projet utilise React 19 avec TypeScript et Vite
2. La configuration ESLint et Prettier est en place
3. Les tests unitaires sont configurés avec Vitest
4. Le projet est configuré pour le déploiement sur Vercel
5. La structure de dossiers suit les bonnes pratiques React
6. Les variables d'environnement sont correctement configurées

### Story S1.2: Base de Données et Modèles

En tant que développeur,
Je veux créer la structure de base de données,
Afin de stocker les données des utilisateurs et sessions de manière sécurisée.

**Acceptance Criteria:**

1. Supabase est configuré avec Prisma ORM
2. Les modèles User, Session, Exercise, et Progress sont créés
3. Les migrations de base de données sont fonctionnelles
4. Les relations entre entités sont correctement définies
5. Les contraintes de sécurité et validation sont en place
6. Les index sont optimisés pour les requêtes fréquentes

### Story S1.3: Système d'Authentification

En tant que sportif/patient,
Je veux pouvoir me connecter de manière sécurisée,
Afin d'accéder à mes données de manière protégée.

**Acceptance Criteria:**

1. L'inscription et la connexion sont fonctionnelles
2. L'authentification utilise Supabase Auth avec JWT
3. Les mots de passe sont sécurisés
4. La validation des données d'entrée est en place
5. La gestion des sessions est sécurisée
6. Les erreurs d'authentification sont gérées proprement

### Story S1.4: Interface de Base et Navigation

En tant que sportif/patient,
Je veux avoir une interface de navigation claire,
Afin d'accéder facilement aux différentes fonctionnalités.

**Acceptance Criteria:**

1. Un système de navigation principal est implémenté
2. Les routes sont protégées par l'authentification
3. L'interface est responsive et mobile-first
4. Un système de thème (clair/sombre) est disponible
5. Les composants UI de base sont réutilisables
6. L'accessibilité WCAG AA est respectée

### Story S1.5: Mode Guest

En tant que visiteur,
Je veux pouvoir essayer l'application sans m'inscrire,
Afin de tester les fonctionnalités avant de m'engager.

**Acceptance Criteria:**

1. Un mode Guest est disponible
2. Les fonctionnalités de base sont accessibles
3. Les données sont sauvegardées temporairement
4. La conversion vers un compte complet est possible
5. L'interface est claire sur le mode Guest
6. Les limitations sont expliquées

## Epic S2: Gestion des Sessions et Exercices

**Epic Goal** : Permettre aux utilisateurs de créer, enregistrer et valider leurs sessions d'exercices, avec des métriques détaillées de performance.

### Story S2.1: Profil Sportif/Patient

En tant que sportif/patient,
Je veux pouvoir créer et modifier mon profil,
Afin de personnaliser mon expérience dans l'application.

**Acceptance Criteria:**

1. Un formulaire de création de profil est disponible
2. Les informations personnelles de base sont collectées
3. Les objectifs et préférences sont configurables
4. La validation des données est en place
5. La modification des informations existantes est possible
6. Le profil est sauvegardé automatiquement

### Story S2.2: Créer une Session

En tant que sportif/patient,
Je veux pouvoir créer une nouvelle session d'exercices,
Afin de planifier mes entraînements.

**Acceptance Criteria:**

1. Un formulaire de création de session est disponible
2. Les informations de base sont collectées (nom, date, type, objectif)
3. La validation des données est en place
4. La session est sauvegardée automatiquement
5. L'interface est intuitive et rapide
6. Les sessions sont organisées chronologiquement

### Story S2.3: Enregistrer des Exercices

En tant que sportif/patient,
Je veux pouvoir enregistrer les exercices de ma session,
Afin de suivre ma progression détaillée.

**Acceptance Criteria:**

1. Une interface d'enregistrement d'exercices est disponible
2. Les informations de base sont collectées (nom, durée, intensité, notes)
3. Les métriques RPE (Rate of Perceived Exertion) sont enregistrées
4. Les niveaux de douleur sont trackés
5. L'ajout d'exercices multiples est possible
6. L'interface est optimisée pour mobile

### Story S2.4: Valider une Session

En tant que sportif/patient,
Je veux pouvoir valider ma session terminée,
Afin de confirmer que j'ai réalisé mes exercices.

**Acceptance Criteria:**

1. Un bouton de validation est disponible
2. La confirmation de validation est demandée
3. La session est marquée comme terminée
4. Les statistiques sont mises à jour
5. Un feedback de validation est affiché
6. L'historique est mis à jour automatiquement

## Epic S3: Historique et Progression

**Epic Goal** : Permettre aux utilisateurs de visualiser leur historique complet et de suivre leur progression dans le temps.

### Story S3.1: Voir l'Historique

En tant que sportif/patient,
Je veux pouvoir voir l'historique de mes sessions,
Afin de suivre ma progression dans le temps.

**Acceptance Criteria:**

1. Une liste chronologique des sessions est disponible
2. Les sessions sont organisées par date
3. Les informations clés sont visibles (date, type, statut, durée)
4. La navigation dans l'historique est intuitive
5. Les filtres par période sont disponibles
6. L'interface est optimisée pour mobile

### Story S3.2: Détails d'une Session

En tant que sportif/patient,
Je veux pouvoir voir les détails d'une session,
Afin de revoir mes exercices et mes notes.

**Acceptance Criteria:**

1. Une page de détails de session est disponible
2. Tous les exercices de la session sont affichés
3. Les notes et observations sont visibles
4. Les métriques de performance sont calculées
5. La navigation vers l'historique est possible
6. L'interface est claire et lisible

### Story S3.3: Statistiques de Progression

En tant que sportif/patient,
Je veux pouvoir voir mes statistiques de progression,
Afin de comprendre mes améliorations.

**Acceptance Criteria:**

1. Des graphiques de progression sont disponibles
2. Les métriques clés sont affichées (fréquence, durée, intensité)
3. Les tendances sont visibles
4. L'interface est claire et lisible
5. Les données sont mises à jour en temps réel
6. L'export des graphiques est possible

## Epic S4: Export et Partage

**Epic Goal** : Permettre aux utilisateurs d'exporter et de partager leur historique avec les professionnels de santé pour améliorer le suivi thérapeutique.

### Story S4.1: Export pour Professionnel

En tant que sportif/patient,
Je veux pouvoir exporter mes sessions pour mon professionnel de santé,
Afin qu'il puisse voir ma progression.

**Acceptance Criteria:**

1. Un bouton d'export est disponible dans l'historique
2. L'export en PDF et CSV est possible
3. Les données essentielles sont incluses (sessions, exercices, métriques)
4. Le format est lisible et professionnel
5. L'export est généré rapidement
6. Les données sensibles sont protégées

### Story S4.2: Partage avec Professionnel

En tant que sportif/patient,
Je veux pouvoir partager facilement mes données avec mon professionnel de santé,
Afin d'améliorer mon suivi thérapeutique.

**Acceptance Criteria:**

1. Un système de partage est disponible
2. Le partage par lien ou email est possible
3. Les données partagées sont sécurisées
4. Le professionnel peut voir les données sans compte
5. Le partage est révocable
6. L'historique de partage est tracé

### Story S4.3: Filtrage des Données

En tant que sportif/patient,
Je veux pouvoir filtrer mes données avant de les partager,
Afin de ne montrer que les informations pertinentes.

**Acceptance Criteria:**

1. Des filtres par période sont disponibles
2. Le filtrage par type d'exercice est possible
3. Les filtres sont faciles à utiliser
4. L'aperçu des données filtrées est visible
5. Les filtres sont sauvegardés
6. L'interface est intuitive

### Story S4.4: Résumé de Progression

En tant que sportif/patient,
Je veux pouvoir générer un résumé de ma progression,
Afin de montrer mes améliorations à mon professionnel de santé.

**Acceptance Criteria:**

1. Un résumé automatique est généré
2. Les métriques clés sont calculées (fréquence, durée, progression)
3. Les graphiques de progression sont inclus
4. Le résumé est personnalisable
5. L'export du résumé est possible
6. L'interface est claire et lisible

## Epic S5: Motivation et Engagement

**Epic Goal** : Maintenir la motivation et l'engagement des utilisateurs grâce à la gamification, aux rappels et au suivi de progression.

### Story S5.1: Rappels de Session

En tant que sportif/patient,
Je veux recevoir des rappels pour mes sessions,
Afin de ne pas oublier de faire mes exercices.

**Acceptance Criteria:**

1. Un système de rappels est disponible
2. Les rappels sont configurables (fréquence, heure)
3. Les notifications push et email sont possibles
4. Les rappels sont personnalisables
5. La gestion des préférences est intuitive
6. Les rappels sont désactivables

### Story S5.2: Gamification Basique

En tant que sportif/patient,
Je veux être motivé par des éléments de jeu,
Afin de maintenir ma régularité dans les exercices.

**Acceptance Criteria:**

1. Un système de streaks est disponible
2. Des badges de progression sont attribués
3. Les objectifs sont visibles et motivants
4. Les récompenses sont claires
5. L'interface est engageante
6. Les statistiques personnelles sont affichées

### Story S5.3: Progression Simple

En tant que sportif/patient,
Je veux voir ma progression de manière simple,
Afin de rester motivé dans mes exercices.

**Acceptance Criteria:**

1. Des graphiques de progression sont disponibles
2. Les métriques clés sont affichées (fréquence, durée, intensité)
3. Les tendances sont visibles
4. L'interface est claire et lisible
5. Les données sont mises à jour en temps réel
6. L'export des graphiques est possible

### Story S5.4: Objectifs Personnalisés

En tant que sportif/patient,
Je veux pouvoir définir mes objectifs personnels,
Afin de rester motivé et concentré.

**Acceptance Criteria:**

1. Un système d'objectifs est disponible
2. Les objectifs sont personnalisables
3. Le suivi des objectifs est visible
4. Les célébrations de réussite sont motivantes
5. L'interface est engageante
6. Les objectifs sont adaptatifs

## V2 Annex: Fonctionnalités Cabinet (Futures)

### Fonctionnalités Cabinet - Version 2

Les fonctionnalités suivantes sont reportées à la version 2 pour se concentrer sur l'expérience utilisateur sportif/patient dans le MVP :

#### Gestion des Patients (FR1, FR5, FR6)
- Fiches patients complètes pour les kinésithérapeutes
- Système de recherche et de filtrage avancé
- Ajout de photos et documents joints aux dossiers patients

#### Planification et Calendrier (FR2, FR9)
- Calendrier interactif pour la planification des séances
- Gestion des créneaux de disponibilité du praticien
- Planification des séances de kinésithérapie

#### Documentation Professionnelle (FR3, FR10)
- Documentation des séances avec notes et évaluations
- Objectifs de traitement et suivi médical
- Notes et évaluations pour suivre la progression des patients

#### Facturation (FR4)
- Génération automatique des factures basées sur les séances
- Gestion des paiements et de la comptabilité

#### Rappels et Communication (FR7)
- Rappels automatiques aux patients avant leurs séances
- Système de communication patient-praticien

#### Statistiques Cabinet (FR8)
- Statistiques et rapports sur l'activité du cabinet
- Analytics pour les praticiens

### Justification du Report

Ces fonctionnalités sont reportées car :

1. **Focus MVP** : Le MVP se concentre sur l'expérience utilisateur sportif/patient
2. **Complexité** : Les fonctionnalités cabinet nécessitent une interface distincte
3. **Marché** : L'expérience utilisateur est prioritaire pour l'adoption
4. **Développement** : Permet de valider le concept avant d'ajouter la complexité cabinet

## Checklist Results Report

_Cette section sera remplie après l'exécution de la checklist PM_

## Next Steps

### UX Expert Prompt

"Créez l'architecture UX/UI pour Revia Sport MVP, une application de suivi d'exercices pour sportifs et patients en rééducation. L'application doit être mobile-first, intuitive, et optimisée pour l'usage quotidien. Consultez le PRD pour les spécifications détaillées des fonctionnalités et des exigences utilisateur."

### Architect Prompt

"Créez l'architecture technique pour Revia Sport MVP, une application web React/TypeScript de suivi d'exercices. L'application doit être sécurisée, performante, et conforme RGPD. Consultez le PRD pour les spécifications fonctionnelles et techniques détaillées."
