# App-Kine Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Créer une application web moderne pour les patients et sportifs
- Améliorer l'adhésion aux exercices prescrits de 60% à 80%
- Motiver les patients grâce à la gamification et au suivi de progression
- Offrir une expérience utilisateur intuitive et mobile-first
- Permettre le partage facile de l'historique avec le kinésithérapeute
- Assurer la conformité RGPD pour la gestion des données de santé

### Background Context

App-Kine répond au besoin critique des patients et sportifs de suivre leurs exercices prescrits et de maintenir leur motivation sur le long terme. Actuellement, 60% des patients arrêtent leurs exercices prescrits, ce qui ralentit leur récupération et réduit l'efficacité des séances de kinésithérapie.

Le marché français de la rééducation et du sport compte des millions de personnes qui ont besoin d'outils simples et motivants pour suivre leur progression. Ces utilisateurs ont besoin d'une application qui combine simplicité d'usage, gamification et partage facile avec leur kinésithérapeute.

L'application vise à devenir la solution de référence pour le suivi d'exercices en France, en combinant simplicité d'usage, gamification et partage professionnel.

### Change Log

| Date       | Version | Description              | Author    |
| ---------- | ------- | ------------------------ | --------- |
| 2024-12-19 | 1.0     | Création initiale du PRD | John (PM) |
| 2024-12-19 | 2.0     | Refocus patient/sportif  | John (PM) |

## Requirements

### Functional

**FR1** : L'application doit permettre la création et la gestion de fiches patients complètes incluant informations personnelles, médicales et de contact.

**FR2** : L'application doit fournir un calendrier interactif pour la planification et la gestion des séances de kinésithérapie.

**FR3** : L'application doit permettre la documentation des séances avec notes, évaluations et objectifs de traitement.

**FR4** : L'application doit générer automatiquement des factures basées sur les séances réalisées.

**FR5** : L'application doit offrir un système de recherche et de filtrage avancé pour localiser rapidement les patients.

**FR6** : L'application doit permettre l'ajout de photos et documents joints aux dossiers patients.

**FR7** : L'application doit envoyer des rappels automatiques aux patients avant leurs séances.

**FR8** : L'application doit fournir des statistiques et rapports sur l'activité du cabinet.

**FR9** : L'application doit permettre la gestion des créneaux de disponibilité du praticien.

**FR10** : L'application doit offrir un système de notes et d'évaluations pour suivre la progression des patients.

### Non Functional

**NFR1** : L'application doit se charger en moins de 2 secondes sur mobile et desktop.

**NFR2** : L'application doit être accessible 99.9% du temps avec un temps de réponse moyen inférieur à 500ms.

**NFR3** : L'application doit supporter jusqu'à 1000 patients par praticien sans dégradation de performance.

**NFR4** : L'application doit être conforme au RGPD pour la gestion des données médicales.

**NFR5** : L'application doit fonctionner sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge) et être responsive.

**NFR6** : L'application doit chiffrer toutes les données sensibles en transit et au repos.

**NFR7** : L'application doit permettre la sauvegarde automatique des données toutes les 30 secondes.

**NFR8** : L'application doit offrir une interface accessible selon les standards WCAG AA.

## User Interface Design Goals

### Overall UX Vision

App-Kine privilégie la simplicité et l'efficacité. L'interface doit être intuitive pour les kinésithérapeutes qui n'ont pas le temps d'apprendre des systèmes complexes. L'expérience utilisateur doit être fluide, rapide et adaptée à l'usage mobile quotidien.

### Key Interaction Paradigms

- **Navigation par onglets** : Accès rapide aux principales fonctionnalités
- **Recherche instantanée** : Trouver un patient en tapant quelques lettres
- **Glisser-déposer** : Planification intuitive des séances
- **Swipe gestures** : Navigation mobile naturelle
- **Auto-save** : Sauvegarde automatique pour éviter la perte de données

### Core Screens and Views

- **Tableau de bord** : Vue d'ensemble de l'activité du jour
- **Liste des patients** : Vue principale avec recherche et filtres
- **Fiche patient** : Détails complets d'un patient
- **Calendrier** : Planification et gestion des séances
- **Séance** : Interface de documentation d'une séance
- **Facturation** : Gestion des factures et paiements
- **Statistiques** : Rapports et analytics du cabinet
- **Paramètres** : Configuration du compte et préférences

### Accessibility: WCAG AA

L'application respecte les standards d'accessibilité WCAG AA pour assurer l'usage par tous les praticiens, y compris ceux avec des besoins spécifiques.

### Branding

Interface moderne et professionnelle avec une palette de couleurs apaisantes (bleus et verts) inspirée de l'univers médical. Typographie claire et lisible, icônes intuitives et cohérentes.

### Target Device and Platforms: Web Responsive

Application web responsive optimisée pour tous les appareils, avec une approche mobile-first. Fonctionne sur smartphones, tablettes et ordinateurs de bureau.

## Technical Assumptions

### Repository Structure: Monorepo

Structure monorepo pour gérer l'application frontend, l'API backend et les outils de déploiement dans un seul repository.

### Service Architecture

Architecture monolithique modulaire avec séparation claire des couches (présentation, logique métier, données). Cette approche simplifie le développement initial tout en permettant une évolution future vers des microservices si nécessaire.

### Testing Requirements

Pyramide de tests complète :

- Tests unitaires (80%) : Logique métier et composants
- Tests d'intégration (15%) : API et interactions entre modules
- Tests end-to-end (5%) : Flux utilisateur critiques

### Additional Technical Assumptions and Requests

- **Base de données** : PostgreSQL pour la robustesse et la conformité RGPD
- **Authentification** : JWT avec refresh tokens
- **Déploiement** : Docker + Vercel/Netlify pour la simplicité
- **Monitoring** : Sentry pour le suivi des erreurs
- **Backup** : Sauvegarde quotidienne automatique
- **CDN** : CloudFlare pour la performance globale
- **Analytics** : Plausible Analytics pour le respect de la vie privée

## Epic List

**Epic 1** : Infrastructure et Authentification - Mise en place de l'infrastructure de base, authentification sécurisée et interface mobile-first

**Epic 2** : Gestion des Sessions et Historique - Création, enregistrement et validation des sessions d'exercices avec historique complet

**Epic 3** : Export et Partage - Export et partage de l'historique avec le kinésithérapeute

**Epic 4** : Motivation et Engagement - Gamification, rappels et progression pour maintenir la motivation

## Epic 1: Infrastructure et Authentification

**Epic Goal** : Établir les fondations techniques de l'application avec un système d'authentification sécurisé, une base de données structurée et une interface utilisateur de base.

### Story 1.1: Configuration du Projet et Infrastructure

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

### Story 1.2: Base de Données et Modèles

En tant que développeur,
Je veux créer la structure de base de données,
Afin de stocker les données des utilisateurs et patients de manière sécurisée.

**Acceptance Criteria:**

1. PostgreSQL est configuré avec Prisma ORM
2. Les modèles User, Patient, Session, et Invoice sont créés
3. Les migrations de base de données sont fonctionnelles
4. Les relations entre entités sont correctement définies
5. Les contraintes de sécurité et validation sont en place
6. Les index sont optimisés pour les requêtes fréquentes

### Story 1.3: Système d'Authentification

En tant que kinésithérapeute,
Je veux pouvoir me connecter de manière sécurisée,
Afin d'accéder à mes données de manière protégée.

**Acceptance Criteria:**

1. L'inscription et la connexion sont fonctionnelles
2. L'authentification utilise JWT avec refresh tokens
3. Les mots de passe sont chiffrés avec bcrypt
4. La validation des données d'entrée est en place
5. La gestion des sessions est sécurisée
6. Les erreurs d'authentification sont gérées proprement

### Story 1.4: Interface de Base et Navigation

En tant que kinésithérapeute,
Je veux avoir une interface de navigation claire,
Afin d'accéder facilement aux différentes fonctionnalités.

**Acceptance Criteria:**

1. Un système de navigation principal est implémenté
2. Les routes sont protégées par l'authentification
3. L'interface est responsive et mobile-first
4. Un système de thème (clair/sombre) est disponible
5. Les composants UI de base sont réutilisables
6. L'accessibilité WCAG AA est respectée

## Epic 2: Gestion des Sessions et Historique

**Epic Goal** : Permettre aux patients de créer, enregistrer et valider leurs sessions d'exercices, avec un historique complet de leur progression.

### Story 2.1: Profil Patient/Sportif

En tant que patient/sportif,
Je veux pouvoir créer et modifier mon profil,
Afin de personnaliser mon expérience dans l'application.

**Acceptance Criteria:**

1. Un formulaire de création de profil est disponible
2. Les informations personnelles de base sont collectées
3. La validation des données est en place
4. La modification des informations existantes est possible
5. Le profil est sauvegardé automatiquement
6. Les données sensibles sont protégées

### Story 2.2: Créer une Session

En tant que patient/sportif,
Je veux pouvoir créer une nouvelle session d'exercices,
Afin de planifier mes entraînements.

**Acceptance Criteria:**

1. Un formulaire de création de session est disponible
2. Les informations de base sont collectées (nom, date, type)
3. La validation des données est en place
4. La session est sauvegardée automatiquement
5. L'interface est intuitive et rapide
6. Les sessions sont organisées chronologiquement

### Story 2.3: Enregistrer des Exercices

En tant que patient/sportif,
Je veux pouvoir enregistrer les exercices de ma session,
Afin de suivre ma progression.

**Acceptance Criteria:**

1. Une interface d'enregistrement d'exercices est disponible
2. Les informations de base sont collectées (nom, durée, intensité, notes)
3. La validation des données est en place
4. L'ajout d'exercices multiples est possible
5. L'interface est optimisée pour mobile
6. Les données sont sauvegardées automatiquement

### Story 2.4: Valider une Session

En tant que patient/sportif,
Je veux pouvoir valider ma session terminée,
Afin de confirmer que j'ai réalisé mes exercices.

**Acceptance Criteria:**

1. Un bouton de validation est disponible
2. La confirmation de validation est demandée
3. La session est marquée comme terminée
4. Les statistiques sont mises à jour
5. Un feedback de validation est affiché
6. L'historique est mis à jour automatiquement

### Story 2.5: Voir l'Historique

En tant que patient/sportif,
Je veux pouvoir voir l'historique de mes sessions,
Afin de suivre ma progression dans le temps.

**Acceptance Criteria:**

1. Une liste chronologique des sessions est disponible
2. Les sessions sont organisées par date
3. Les informations clés sont visibles (date, type, statut)
4. La navigation dans l'historique est intuitive
5. Les filtres par période sont disponibles
6. L'interface est optimisée pour mobile

### Story 2.6: Détails d'une Session

En tant que patient/sportif,
Je veux pouvoir voir les détails d'une session,
Afin de revoir mes exercices et mes notes.

**Acceptance Criteria:**

1. Une page de détails de session est disponible
2. Tous les exercices de la session sont affichés
3. Les notes et observations sont visibles
4. Les statistiques de la session sont calculées
5. La navigation vers l'historique est possible
6. L'interface est claire et lisible

## Epic 3: Export et Partage

**Epic Goal** : Permettre aux patients d'exporter et de partager leur historique avec leur kinésithérapeute pour améliorer le suivi thérapeutique.

### Story 3.1: Export pour Kiné

En tant que patient/sportif,
Je veux pouvoir exporter mes sessions pour mon kinésithérapeute,
Afin qu'il puisse voir ma progression.

**Acceptance Criteria:**

1. Un bouton d'export est disponible dans l'historique
2. L'export en PDF et CSV est possible
3. Les données essentielles sont incluses (sessions, exercices, notes)
4. Le format est lisible et professionnel
5. L'export est généré rapidement
6. Les données sensibles sont protégées

### Story 3.2: Partage avec Kiné

En tant que patient/sportif,
Je veux pouvoir partager facilement mes données avec mon kinésithérapeute,
Afin d'améliorer mon suivi thérapeutique.

**Acceptance Criteria:**

1. Un système de partage est disponible
2. Le partage par lien ou email est possible
3. Les données partagées sont sécurisées
4. Le kiné peut voir les données sans compte
5. Le partage est révocable
6. L'historique de partage est tracé

### Story 3.3: Filtrage des Données

En tant que patient/sportif,
Je veux pouvoir filtrer mes données avant de les partager,
Afin de ne montrer que les informations pertinentes.

**Acceptance Criteria:**

1. Des filtres par période sont disponibles
2. Le filtrage par type d'exercice est possible
3. Les filtres sont faciles à utiliser
4. L'aperçu des données filtrées est visible
5. Les filtres sont sauvegardés
6. L'interface est intuitive

### Story 3.4: Résumé de Progression

En tant que patient/sportif,
Je veux pouvoir générer un résumé de ma progression,
Afin de montrer mes améliorations à mon kinésithérapeute.

**Acceptance Criteria:**

1. Un résumé automatique est généré
2. Les métriques clés sont calculées (fréquence, durée, progression)
3. Les graphiques de progression sont inclus
4. Le résumé est personnalisable
5. L'export du résumé est possible
6. L'interface est claire et lisible

## Epic 4: Motivation et Engagement

**Epic Goal** : Maintenir la motivation et l'engagement des patients grâce à la gamification, aux rappels et au suivi de progression.

### Story 4.1: Rappels de Session

En tant que patient/sportif,
Je veux recevoir des rappels pour mes sessions,
Afin de ne pas oublier de faire mes exercices.

**Acceptance Criteria:**

1. Un système de rappels est disponible
2. Les rappels sont configurables (fréquence, heure)
3. Les notifications push et email sont possibles
4. Les rappels sont personnalisables
5. La gestion des préférences est intuitive
6. Les rappels sont désactivables

### Story 4.2: Progression Simple

En tant que patient/sportif,
Je veux voir ma progression de manière simple,
Afin de rester motivé dans mes exercices.

**Acceptance Criteria:**

1. Des graphiques de progression sont disponibles
2. Les métriques clés sont affichées (fréquence, durée)
3. Les tendances sont visibles
4. L'interface est claire et lisible
5. Les données sont mises à jour en temps réel
6. L'export des graphiques est possible

### Story 4.3: Mode Guest

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

### Story 4.4: Gamification Basique

En tant que patient/sportif,
Je veux être motivé par des éléments de jeu,
Afin de maintenir ma régularité dans les exercices.

**Acceptance Criteria:**

1. Un système de streaks est disponible
2. Des badges de progression sont attribués
3. Les objectifs sont visibles et motivants
4. Les récompenses sont claires
5. L'interface est engageante
6. Les statistiques personnelles sont affichées


## Checklist Results Report

_Cette section sera remplie après l'exécution de la checklist PM_

## Next Steps

### UX Expert Prompt

"Créez l'architecture UX/UI pour App-Kine, une application de gestion de cabinet de kinésithérapie. L'application doit être mobile-first, intuitive pour les kinésithérapeutes, et optimisée pour l'usage quotidien. Consultez le PRD pour les spécifications détaillées des fonctionnalités et des exigences utilisateur."

### Architect Prompt

"Créez l'architecture technique pour App-Kine, une application web React/TypeScript de gestion de cabinet de kinésithérapie. L'application doit être sécurisée, performante, et conforme RGPD. Consultez le PRD pour les spécifications fonctionnelles et techniques détaillées."
