# App-Kine Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Créer une application web moderne pour la gestion des cabinets de kinésithérapie
- Réduire de 50% le temps administratif des kinésithérapeutes
- Améliorer la qualité du suivi patient grâce à une documentation structurée
- Offrir une expérience utilisateur intuitive et mobile-first
- Assurer la conformité RGPD pour la gestion des données médicales
- Permettre la scalabilité pour les cabinets multi-praticiens

### Background Context

App-Kine répond au besoin critique des kinésithérapeutes français de digitaliser leur gestion quotidienne. Actuellement, la plupart des praticiens utilisent des solutions papier ou des logiciels génériques inadaptés, ce qui génère une perte de temps considérable (30-40% du temps de travail) et des erreurs de suivi.

Le marché français de la kinésithérapie compte plus de 100 000 praticiens, dont 80% exercent en libéral. Ces professionnels ont besoin d'outils spécialisés qui respectent les spécificités réglementaires françaises tout en offrant une simplicité d'usage pour une adoption rapide.

L'application vise à devenir la solution de référence pour la gestion des cabinets de kinésithérapie en France, en combinant simplicité d'usage, fonctionnalités spécialisées et conformité réglementaire.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2024-12-19 | 1.0 | Création initiale du PRD | John (PM) |

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

**Epic 1** : Infrastructure et Authentification - Mise en place de l'infrastructure de base, authentification sécurisée et gestion des utilisateurs

**Epic 2** : Gestion des Patients - Création, modification et organisation des dossiers patients avec toutes les informations nécessaires

**Epic 3** : Planification et Calendrier - Système de planification des séances avec calendrier interactif et gestion des créneaux

**Epic 4** : Documentation des Séances - Interface de documentation des séances avec notes, évaluations et suivi des objectifs

**Epic 5** : Facturation et Administration - Génération de factures, suivi des paiements et outils administratifs

**Epic 6** : Rapports et Analytics - Tableaux de bord, statistiques et rapports pour le suivi de l'activité

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

## Epic 2: Gestion des Patients

**Epic Goal** : Permettre la création, la modification et l'organisation complète des dossiers patients avec toutes les informations nécessaires à la pratique de la kinésithérapie.

### Story 2.1: Création et Modification des Dossiers Patients

En tant que kinésithérapeute,
Je veux pouvoir créer et modifier des dossiers patients complets,
Afin de centraliser toutes les informations nécessaires à leur suivi.

**Acceptance Criteria:**
1. Un formulaire de création de patient est disponible
2. Les informations personnelles, médicales et de contact sont collectées
3. La validation des données est en place
4. La modification des informations existantes est possible
5. L'historique des modifications est tracé
6. Les données sensibles sont protégées

### Story 2.2: Recherche et Filtrage des Patients

En tant que kinésithérapeute,
Je veux pouvoir rechercher rapidement un patient,
Afin de gagner du temps dans ma gestion quotidienne.

**Acceptance Criteria:**
1. Une barre de recherche instantanée est disponible
2. La recherche fonctionne sur nom, prénom et numéro de téléphone
3. Des filtres avancés sont proposés (statut, dernière séance, etc.)
4. Les résultats s'affichent en temps réel
5. La recherche est optimisée pour la performance
6. L'historique des recherches récentes est sauvegardé

### Story 2.3: Gestion des Documents et Photos

En tant que kinésithérapeute,
Je veux pouvoir ajouter des documents et photos aux dossiers patients,
Afin d'enrichir le suivi médical.

**Acceptance Criteria:**
1. L'upload de fichiers est fonctionnel
2. Les formats supportés incluent images, PDF et documents
3. La compression automatique des images est active
4. L'organisation par catégories est possible
5. La sécurité des fichiers uploadés est assurée
6. La prévisualisation des documents est disponible

### Story 2.4: Historique et Suivi des Patients

En tant que kinésithérapeute,
Je veux voir l'historique complet d'un patient,
Afin d'assurer un suivi cohérent de son traitement.

**Acceptance Criteria:**
1. L'historique des séances est affiché chronologiquement
2. Les informations médicales importantes sont mises en évidence
3. Les objectifs de traitement sont visibles
4. L'évolution du patient est tracée
5. Les alertes et rappels sont affichés
6. L'export de l'historique est possible

## Epic 3: Planification et Calendrier

**Epic Goal** : Offrir un système de planification intuitif et efficace pour gérer les séances de kinésithérapie avec un calendrier interactif et une gestion optimisée des créneaux.

### Story 3.1: Calendrier Interactif

En tant que kinésithérapeute,
Je veux avoir un calendrier interactif pour planifier mes séances,
Afin de gérer efficacement mon emploi du temps.

**Acceptance Criteria:**
1. Un calendrier mensuel, hebdomadaire et quotidien est disponible
2. La création de séances par glisser-déposer est possible
3. Les créneaux disponibles et occupés sont visuellement distincts
4. La modification et suppression des séances est intuitive
5. Les conflits de planning sont détectés automatiquement
6. L'interface est optimisée pour mobile

### Story 3.2: Gestion des Créneaux de Disponibilité

En tant que kinésithérapeute,
Je veux définir mes créneaux de disponibilité,
Afin que les patients ne puissent réserver que sur mes heures de travail.

**Acceptance Criteria:**
1. La définition des horaires de travail est possible
2. Les jours fériés et congés peuvent être marqués
3. Les créneaux récurrents sont configurables
4. Les exceptions ponctuelles sont gérées
5. La synchronisation avec les calendriers externes est possible
6. Les alertes de modification sont envoyées

### Story 3.3: Réservation et Annulation de Séances

En tant que kinésithérapeute,
Je veux gérer les réservations et annulations de séances,
Afin d'optimiser mon planning et la satisfaction patient.

**Acceptance Criteria:**
1. La réservation de séances est simple et rapide
2. Les annulations sont gérées avec gestion des créneaux libérés
3. Les listes d'attente sont mises en place
4. Les rappels automatiques sont envoyés
5. Les motifs d'annulation sont enregistrés
6. Les statistiques de fréquentation sont calculées

### Story 3.4: Rappels et Notifications

En tant que kinésithérapeute,
Je veux recevoir des rappels pour mes séances,
Afin de ne rien oublier dans ma journée de travail.

**Acceptance Criteria:**
1. Les rappels de séances sont configurables
2. Les notifications push et email sont disponibles
3. Les rappels personnalisés par patient sont possibles
4. La gestion des préférences de notification est intuitive
5. Les rappels de suivi post-séance sont automatiques
6. L'intégration avec les calendriers externes fonctionne

## Epic 4: Documentation des Séances

**Epic Goal** : Fournir une interface complète pour documenter les séances de kinésithérapie avec notes détaillées, évaluations et suivi des objectifs de traitement.

### Story 4.1: Interface de Documentation des Séances

En tant que kinésithérapeute,
Je veux documenter facilement mes séances,
Afin de maintenir un suivi précis de chaque patient.

**Acceptance Criteria:**
1. Une interface de documentation intuitive est disponible
2. Les templates de séances sont personnalisables
3. La saisie rapide des informations courantes est possible
4. L'auto-sauvegarde fonctionne en continu
5. Les champs obligatoires sont clairement identifiés
6. L'interface est optimisée pour tablette

### Story 4.2: Évaluations et Objectifs de Traitement

En tant que kinésithérapeute,
Je veux définir et suivre les objectifs de traitement,
Afin d'assurer une progression cohérente de mes patients.

**Acceptance Criteria:**
1. La définition d'objectifs de traitement est possible
2. Les évaluations de progression sont standardisées
3. Les métriques de suivi sont personnalisables
4. L'historique des évaluations est accessible
5. Les alertes de non-progression sont activées
6. Les rapports de progression sont générables

### Story 4.3: Notes et Observations

En tant que kinésithérapeute,
Je veux ajouter des notes détaillées à mes séances,
Afin de documenter précisément l'évolution de mes patients.

**Acceptance Criteria:**
1. Un système de notes libres est disponible
2. Les notes sont organisées par catégories
3. La recherche dans les notes est fonctionnelle
4. Les notes confidentielles sont protégées
5. L'export des notes est possible
6. Les templates de notes sont réutilisables

### Story 4.4: Exercices et Recommandations

En tant que kinésithérapeute,
Je veux prescrire des exercices à mes patients,
Afin d'optimiser leur récupération entre les séances.

**Acceptance Criteria:**
1. Une bibliothèque d'exercices est disponible
2. La prescription d'exercices personnalisés est possible
3. Les instructions visuelles sont incluses
4. Le suivi de réalisation des exercices est tracé
5. Les modifications de prescription sont historisées
6. L'envoi automatique aux patients est configurable

## Epic 5: Facturation et Administration

**Epic Goal** : Automatiser la facturation et fournir des outils administratifs complets pour la gestion financière et administrative du cabinet.

### Story 5.1: Génération Automatique de Factures

En tant que kinésithérapeute,
Je veux générer automatiquement mes factures,
Afin de gagner du temps sur les tâches administratives.

**Acceptance Criteria:**
1. La génération automatique basée sur les séances est active
2. Les templates de facture sont personnalisables
3. La conformité légale française est respectée
4. L'envoi automatique par email est possible
5. La gestion des numéros de facture est automatique
6. L'export en PDF est de qualité professionnelle

### Story 5.2: Suivi des Paiements

En tant que kinésithérapeute,
Je veux suivre les paiements de mes patients,
Afin de gérer efficacement ma trésorerie.

**Acceptance Criteria:**
1. L'enregistrement des paiements est simple
2. Les statuts de paiement sont visibles
3. Les relances automatiques sont configurables
4. Les statistiques de recouvrement sont disponibles
5. L'intégration avec les moyens de paiement est possible
6. Les rapports de trésorerie sont générables

### Story 5.3: Gestion des Remboursements

En tant que kinésithérapeute,
Je veux gérer les remboursements de sécurité sociale,
Afin de simplifier mes démarches administratives.

**Acceptance Criteria:**
1. Le calcul automatique des remboursements est fonctionnel
2. La génération des feuilles de soins est automatisée
3. Le suivi des remboursements est tracé
4. L'intégration avec les plateformes de télétransmission est possible
5. Les alertes de retard de remboursement sont actives
6. Les rapports de remboursement sont disponibles

### Story 5.4: Outils Administratifs

En tant que kinésithérapeute,
Je veux accéder à des outils administratifs complets,
Afin de gérer efficacement mon cabinet.

**Acceptance Criteria:**
1. Un tableau de bord administratif est disponible
2. Les statistiques de fréquentation sont calculées
3. Les rapports d'activité sont générables
4. L'export des données est possible
5. La sauvegarde automatique est configurée
6. Les alertes administratives sont personnalisables

## Epic 6: Rapports et Analytics

**Epic Goal** : Fournir des tableaux de bord, statistiques et rapports complets pour analyser l'activité du cabinet et optimiser la gestion.

### Story 6.1: Tableau de Bord Principal

En tant que kinésithérapeute,
Je veux avoir une vue d'ensemble de mon activité,
Afin de prendre des décisions éclairées sur mon cabinet.

**Acceptance Criteria:**
1. Un tableau de bord avec KPIs principaux est disponible
2. Les métriques de performance sont affichées
3. Les alertes importantes sont mises en évidence
4. La personnalisation des widgets est possible
5. Les données sont mises à jour en temps réel
6. L'export du tableau de bord est fonctionnel

### Story 6.2: Statistiques de Fréquentation

En tant que kinésithérapeute,
Je veux analyser la fréquentation de mon cabinet,
Afin d'optimiser mon planning et mes revenus.

**Acceptance Criteria:**
1. Les statistiques de fréquentation sont calculées
2. Les tendances temporelles sont visibles
3. Les analyses par patient sont disponibles
4. Les comparaisons périodiques sont possibles
5. Les prévisions de fréquentation sont générées
6. L'export des statistiques est possible

### Story 6.3: Rapports Financiers

En tant que kinésithérapeute,
Je veux générer des rapports financiers détaillés,
Afin de suivre la performance de mon cabinet.

**Acceptance Criteria:**
1. Les rapports de revenus sont générables
2. L'analyse des coûts est disponible
3. Les projections financières sont calculées
4. Les comparaisons budgétaires sont possibles
5. L'export vers Excel/PDF est fonctionnel
6. Les alertes financières sont configurables

### Story 6.4: Analytics Avancés

En tant que kinésithérapeute,
Je veux accéder à des analyses avancées,
Afin d'optimiser ma pratique et la satisfaction patient.

**Acceptance Criteria:**
1. Les analyses de performance patient sont disponibles
2. Les métriques de satisfaction sont calculées
3. Les recommandations d'amélioration sont proposées
4. Les comparaisons avec les benchmarks sont possibles
5. Les prédictions de tendances sont générées
6. L'intégration avec des outils externes est possible

## Checklist Results Report

*Cette section sera remplie après l'exécution de la checklist PM*

## Next Steps

### UX Expert Prompt

"Créez l'architecture UX/UI pour App-Kine, une application de gestion de cabinet de kinésithérapie. L'application doit être mobile-first, intuitive pour les kinésithérapeutes, et optimisée pour l'usage quotidien. Consultez le PRD pour les spécifications détaillées des fonctionnalités et des exigences utilisateur."

### Architect Prompt

"Créez l'architecture technique pour App-Kine, une application web React/TypeScript de gestion de cabinet de kinésithérapie. L'application doit être sécurisée, performante, et conforme RGPD. Consultez le PRD pour les spécifications fonctionnelles et techniques détaillées."
