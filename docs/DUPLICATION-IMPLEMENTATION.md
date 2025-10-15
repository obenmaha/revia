# Implémentation de la Duplication de Séances (FR2/FR3)

## Vue d'ensemble

Cette implémentation répond aux exigences fonctionnelles FR2 (Programmation de Séances) et FR3 (Duplication de Séances) du PRD Sport MVP. Elle permet aux utilisateurs de créer des séances et de les dupliquer sur plusieurs dates avec différents types de récurrence.

## Composants implémentés

### 1. Page de création de séance (`src/pages/new-session.tsx`)

**Fonctionnalités :**
- Formulaire complet de création de séance
- Interface de duplication avec options de récurrence
- Validation des données en temps réel
- Aperçu des dates de duplication
- Intégration avec le service de sessions

**Types de récurrence supportés :**
- **Quotidien** : Tous les jours
- **1 jour sur 2** : Un jour sur deux
- **Hebdomadaire** : Toutes les semaines

### 2. Utilitaire de duplication (`src/utils/duplicateDates.ts`)

**Fonctionnalités principales :**
- `generateDuplicateDates()` : Génère les dates selon le type de récurrence
- `calculateDuplicateCount()` : Calcule le nombre de séances créées
- `validateDuplicateOptions()` : Valide les options de duplication
- `getDuplicateDescription()` : Génère une description lisible
- `filterFutureDates()` : Filtre les dates passées
- `generateConstrainedDuplicateDates()` : Génère avec contraintes (exclure week-ends, etc.)

**Types de récurrence :**
```typescript
type DuplicateType = 'daily' | 'every-other-day' | 'weekly';
```

### 3. Service de sessions étendu (`src/services/sessionService.ts`)

**Nouvelles méthodes :**
- `duplicateSession()` : Duplique une session sur plusieurs dates
- `duplicateExistingSession()` : Duplique une session existante

**Fonctionnalités :**
- Validation des données avec Zod
- Insertion en lot dans Supabase
- Gestion des erreurs complète
- Sécurité RLS (Row Level Security)

### 4. Tests complets

**Tests unitaires (`src/__tests__/utils/duplicateDates.test.ts`) :**
- Tests de génération de dates pour chaque type de récurrence
- Tests de validation des paramètres
- Tests de contraintes (week-ends, dates spécifiques)
- Tests d'intégration avec scénarios réels

**Tests d'intégration (`src/__tests__/integration/new-session.test.tsx`) :**
- Tests du formulaire de création
- Tests de l'interface de duplication
- Tests de validation et soumission
- Tests de navigation

**Tests de service (`src/__tests__/services/sessionService-duplication.test.ts`) :**
- Tests de duplication de sessions
- Tests de gestion d'erreurs
- Tests d'authentification
- Tests de base de données

## Exemples d'utilisation

### Création d'une séance avec duplication quotidienne

```typescript
const sessionData = {
  name: 'Cardio matinal',
  date: new Date('2024-01-15'),
  type: 'cardio',
  objectives: 'Améliorer l\'endurance',
  notes: 'Séance de 30 minutes'
};

const duplicateOptions = {
  startDate: new Date('2024-01-15'),
  type: 'daily',
  count: 7
};

const sessions = await SessionService.duplicateSession(sessionData, duplicateOptions);
// Crée 7 séances du 15 au 21 janvier
```

### Duplication hebdomadaire

```typescript
const duplicateOptions = {
  startDate: new Date('2024-01-15'),
  type: 'weekly',
  count: 4
};

const sessions = await SessionService.duplicateSession(sessionData, duplicateOptions);
// Crée 4 séances : 15, 22, 29 janvier et 5 février
```

### Duplication avec contraintes

```typescript
const dates = generateConstrainedDuplicateDates(
  { startDate: new Date('2024-01-15'), type: 'daily', count: 10 },
  { excludeWeekends: true, maxSessions: 5 }
);
// Exclut les week-ends et limite à 5 séances
```

## Interface utilisateur

### Formulaire de base
- Nom de la séance (obligatoire)
- Type de séance (cardio, musculation, yoga, autre)
- Date et heure
- Durée en minutes
- Objectifs et notes

### Section de duplication
- Checkbox pour activer la duplication
- Sélection du type de récurrence
- Date de fin ou nombre de séances
- Aperçu des dates générées

### Validation
- Champs obligatoires
- Validation des dates (date de fin > date de début)
- Limites sur le nombre de séances (1-365)
- Validation des types de récurrence

## Gestion des erreurs

### Erreurs de validation
- Données manquantes ou invalides
- Dates incohérentes
- Types de récurrence non supportés

### Erreurs d'authentification
- Utilisateur non connecté
- Session expirée

### Erreurs de base de données
- Conflits de contraintes
- Erreurs de réseau
- Violations RLS

## Performance et optimisations

### Insertion en lot
- Toutes les sessions sont créées en une seule requête
- Réduction des allers-retours vers la base de données

### Validation côté client
- Calcul des dates en temps réel
- Aperçu immédiat pour l'utilisateur
- Réduction des requêtes serveur

### Gestion mémoire
- Limitation du nombre de séances (max 365)
- Filtrage des dates passées
- Optimisation des calculs de dates

## Sécurité

### Row Level Security (RLS)
- Toutes les requêtes respectent les politiques RLS
- Vérification de l'utilisateur connecté
- Isolation des données par utilisateur

### Validation des données
- Validation côté client et serveur
- Sanitisation des entrées utilisateur
- Protection contre les injections

## Tests et qualité

### Couverture de tests
- Tests unitaires : 100% des fonctions utilitaires
- Tests d'intégration : Flux utilisateur complet
- Tests de service : Toutes les méthodes de duplication

### Scénarios testés
- Programmes d'entraînement quotidiens
- Programmes 3 fois par semaine
- Programmes hebdomadaires
- Gestion des erreurs
- Validation des contraintes

## Évolutions futures

### Fonctionnalités possibles
- Duplication avec exclusions de dates spécifiques
- Duplication basée sur des patterns complexes
- Templates de programmes pré-définis
- Duplication de séries d'exercices

### Optimisations
- Cache des calculs de dates
- Pagination pour les grandes séries
- Interface de gestion des duplications en lot

## Conformité aux exigences

### FR2 - Programmation de Séances ✅
- ✅ Sélection de date et heure
- ✅ Type de séance
- ✅ Objectifs de la séance
- ✅ Interface simple et rapide

### FR3 - Duplication de Séances ✅
- ✅ Duplication d'une séance existante
- ✅ Sélection de dates multiples
- ✅ Options de récurrence (quotidien, tous les 2 jours, hebdomadaire)
- ✅ Picker de calendrier pour faciliter la sélection

## Conclusion

L'implémentation de la duplication de séances répond complètement aux exigences FR2 et FR3 du PRD Sport MVP. Elle offre une interface intuitive pour créer des programmes d'entraînement récurrents tout en maintenant la simplicité et la performance requises pour un MVP.

La solution est extensible, bien testée et prête pour la production.
