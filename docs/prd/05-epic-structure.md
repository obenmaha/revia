# PRD Sport MVP - Structure des Épiques

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Single comprehensive epic car il s'agit d'une transformation cohérente de l'application existante vers une approche sport-first, avec toutes les fonctionnalités liées et interdépendantes.

**Rationale**: Cette transformation sport-first est un changement architectural majeur qui nécessite une coordination étroite entre tous les composants. Diviser en plusieurs épiques créerait des dépendances complexes et des risques d'incohérence. Une épique unique permet de maintenir la cohérence et de minimiser les risques d'intégration.

## Epic 1: Transformation Sport-First MVP

### Epic Goal

**Epic Goal**: Transformer l'application Revia d'un outil de gestion de cabinet vers une application sport-first pour les sportifs et patients autonomes, en conservant l'architecture technique existante.

### Integration Requirements

**Integration Requirements**: 
- Maintenir la compatibilité avec l'architecture Supabase existante
- Préserver les fonctionnalités existantes pour une future réactivation
- Implémenter un système de feature flags pour basculer entre modes

## Stories Détaillées

### Story 1.1: Refactoring Architecture et Navigation

**As a** utilisateur sportif,
**I want** une interface mobile-first avec navigation par onglets,
**so that** je puisse accéder facilement aux fonctionnalités principales sur mobile.

#### Acceptance Criteria
1. Implémentation d'une barre d'onglets mobile (Accueil / Nouvelle séance / Historique / Profil)
2. Refactoring de la navigation existante pour supporter le mode sport
3. Adaptation responsive de tous les écrans existants
4. Mise en place d'un système de feature flags pour basculer entre modes

#### Integration Verification
1. **IV1**: Vérifier que les fonctionnalités existantes restent accessibles via feature flags
2. **IV2**: Vérifier que la navigation mobile fonctionne sur tous les navigateurs supportés
3. **IV3**: Vérifier que les performances ne sont pas dégradées par les changements

### Story 1.2: Système de Profil Sportif

**As a** utilisateur sportif,
**I want** créer un profil simple avec mes objectifs et préférences,
**so that** je puisse personnaliser mon expérience d'entraînement.

#### Acceptance Criteria
1. Création d'un formulaire de profil simplifié (prénom/pseudo, objectifs, préférences)
2. Intégration avec Supabase Auth existant
3. Stockage des préférences utilisateur
4. Interface de modification du profil

#### Integration Verification
1. **IV1**: Vérifier que l'authentification Supabase existante fonctionne toujours
2. **IV2**: Vérifier que les données utilisateur sont correctement stockées
3. **IV3**: Vérifier que les performances de chargement du profil sont acceptables

### Story 1.3: Gestion des Séances Sportives

**As a** utilisateur sportif,
**I want** programmer et dupliquer mes séances d'entraînement,
**so that** je puisse planifier efficacement mes sessions.

#### Acceptance Criteria
1. Interface de création de séance (date, type, objectifs)
2. Fonctionnalité de duplication de séance sur dates multiples
3. Picker de calendrier pour la sélection de dates
4. Sauvegarde des séances dans Supabase

#### Integration Verification
1. **IV1**: Vérifier que les séances sont correctement sauvegardées en base
2. **IV2**: Vérifier que la duplication fonctionne sur différentes périodes
3. **IV3**: Vérifier que les performances de sauvegarde sont acceptables

### Story 1.4: Enregistrement des Exercices et Validation

**As a** utilisateur sportif,
**I want** enregistrer mes exercices avec RPE et douleur,
**so that** je puisse suivre ma progression et valider mes séances.

#### Acceptance Criteria
1. Interface d'enregistrement des exercices (nom, séries, répétitions, temps)
2. Échelles de RPE et douleur intégrées
3. Système de validation de séance avec feedback
4. Mise à jour automatique des statistiques

#### Integration Verification
1. **IV1**: Vérifier que les données d'exercices sont correctement sauvegardées
2. **IV2**: Vérifier que les statistiques sont mises à jour en temps réel
3. **IV3**: Vérifier que la validation de séance fonctionne correctement

### Story 1.5: Historique et Statistiques

**As a** utilisateur sportif,
**I want** consulter mon historique et mes statistiques,
**so that** je puisse suivre ma progression dans le temps.

#### Acceptance Criteria
1. Historique chronologique des séances avec filtres
2. Statistiques de fréquence, durée et tendance RPE
3. Interface de visualisation des données
4. Export des données en CSV/PDF

#### Integration Verification
1. **IV1**: Vérifier que l'historique affiche correctement toutes les séances
2. **IV2**: Vérifier que les statistiques sont calculées correctement
3. **IV3**: Vérifier que l'export fonctionne sur différents navigateurs

### Story 1.6: Gamification et Rappels

**As a** utilisateur sportif,
**I want** être motivé par la gamification et recevoir des rappels,
**so that** je puisse maintenir ma régularité d'entraînement.

#### Acceptance Criteria
1. Système de streaks (jours consécutifs)
2. Badges de progression (paliers)
3. Système de rappels (notifications locales/email)
4. Interface de visualisation des récompenses

#### Integration Verification
1. **IV1**: Vérifier que les streaks sont calculés correctement
2. **IV2**: Vérifier que les notifications fonctionnent sur mobile
3. **IV3**: Vérifier que les badges s'attribuent correctement

### Story 1.7: Mode Guest et Export

**As a** utilisateur sportif,
**I want** essayer l'application sans créer de compte,
**so that** je puisse tester les fonctionnalités avant de m'engager.

#### Acceptance Criteria
1. Mode Guest avec données locales temporaires
2. Onboarding simplifié en 1 clic
3. Bannière de conversion "Sauvegarder mon progrès"
4. Export des données Guest vers compte permanent

#### Integration Verification
1. **IV1**: Vérifier que le mode Guest fonctionne sans authentification
2. **IV2**: Vérifier que la conversion Guest vers compte fonctionne
3. **IV3**: Vérifier que les données sont correctement migrées

## V2 - Cabinet (Annexe)

Les fonctionnalités de gestion de cabinet (dossiers patients, calendrier praticien, notes pro, stats cabinet, etc.) sont reportées à la V2 avec une interface distincte, permettant de se concentrer sur l'expérience sport-first en MVP.

**Justification** : Cette approche permet de valider le concept sport-first avec un MVP focalisé, tout en préservant la possibilité de réintégrer les fonctionnalités cabinet dans une version future.
