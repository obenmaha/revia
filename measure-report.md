# Rapport de Mesure PostHog - Revia

**Date :** 15 octobre 2025  
**Période analysée :** 7 derniers jours  
**Statut :** ⚠️ **ANALYTICS NON ACTIVÉ**

## 📊 Résumé Exécutif

L'analyse révèle que **PostHog n'est pas activé** dans l'environnement actuel. Aucun événement n'est collecté, ce qui empêche la validation des KPIs métier.

### État du Tracking
- **Analytics activé :** ❌ Non (`VITE_ANALYTICS_ENABLED=false`)
- **Clé PostHog :** ❌ Non configurée (`VITE_POSTHOG_KEY` manquante)
- **Événements collectés :** 0 (aucune donnée disponible)
- **Projet PostHog :** Connecté mais vide

## 🔍 Analyse des Événements

### Événements Définis dans le Code

L'application définit les événements suivants dans `src/lib/analytics.ts` :

#### 1. Événements de Session
- **`session_created`** : Création d'une session d'entraînement
  - Propriétés : `session_type`, `has_duplicates`, `duplicate_type`, `duplicate_count`
- **`session_validated`** : Validation d'une session complétée
  - Propriétés : `session_id`, `exercise_count`, `total_duration_minutes`, `average_rpe`, `has_pain_levels`

#### 2. Événements Guest Mode
- **`guest_mode_entered`** : Entrée en mode invité
- **`guest_session_created`** : Création de session en mode invité
- **`guest_migration_started`** : Début de migration vers compte
- **`guest_migration_completed`** : Migration réussie
- **`guest_migration_failed`** : Échec de migration

#### 3. Événements d'Erreur
- **`error_occurred`** : Erreurs système
- **`page_load`** : Performance de chargement

### Implémentation dans l'Application

✅ **Événements implémentés :**
- `session_created` : `src/pages/new-session.tsx` (ligne 34)
- `session_validated` : `src/hooks/useValidateSession.ts` (ligne 8)
- Événements guest : `src/stores/guestStore.ts` (ligne 25)

## 📈 Validation des KPIs

### KPI 1: Adherence 30d ≥60%
**Formule attendue :** `(Utilisateurs actifs 30j / Utilisateurs totaux) × 100`

**Événements requis :**
- `session_created` pour identifier les utilisateurs actifs
- `session_validated` pour confirmer l'engagement

**Statut :** ❌ **Impossible à calculer** (aucune donnée)

### KPI 2: Activation D7 ≥45%
**Formule attendue :** `(Utilisateurs ayant validé une session en 7j / Nouveaux utilisateurs) × 100`

**Événements requis :**
- `session_created` + `session_validated` pour l'activation
- `guest_mode_entered` pour les nouveaux utilisateurs

**Statut :** ❌ **Impossible à calculer** (aucune donnée)

### KPI 3: Guest→Account ≥30%
**Formule attendue :** `(Migrations réussies / Entrées guest) × 100`

**Événements requis :**
- `guest_mode_entered` pour le dénominateur
- `guest_migration_completed` pour le numérateur

**Statut :** ❌ **Impossible à calculer** (aucune donnée)

## 🚨 Problèmes Identifiés

### 1. Configuration Manquante
```bash
# Variables d'environnement requises
VITE_ANALYTICS_ENABLED=true
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_DEBUG_ANALYTICS=true
```

### 2. Aucune Donnée Collectée
- 0 événements dans PostHog
- Aucun utilisateur tracké
- Aucune session enregistrée

### 3. Conformité RGPD
✅ **Bien configuré :**
- Opt-out par défaut (`opt_out_capturing_by_default: true`)
- Anonymisation des données sensibles
- Respect du Do Not Track
- Pas d'enregistrement de session

## 🔧 Recommandations

### 1. Activation Immédiate
```bash
# 1. Configurer les variables d'environnement
cp env.example .env.local
# Éditer .env.local avec les vraies valeurs

# 2. Obtenir une clé PostHog
# - Créer un compte sur posthog.com
# - Créer un nouveau projet
# - Copier la clé API

# 3. Activer le tracking
VITE_ANALYTICS_ENABLED=true
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Test de Validation
```typescript
// Tester l'analytics en développement
import { analytics } from './src/lib/analytics';

// Vérifier le statut
console.log(analytics.getStatus());

// Tester un événement
analytics.track('session_created', {
  session_type: 'cardio',
  has_duplicates: false
});
```

### 3. Dashboard PostHog
Créer des insights pour chaque KPI :
- **Adherence 30d** : Funnel `session_created` → `session_validated` (30j)
- **Activation D7** : Cohort des nouveaux utilisateurs avec validation
- **Guest→Account** : Funnel `guest_mode_entered` → `guest_migration_completed`

## 📋 Plan d'Action

### Phase 1: Configuration (1 jour)
1. ✅ Configurer les variables d'environnement
2. ✅ Obtenir la clé PostHog
3. ✅ Tester la connexion

### Phase 2: Validation (3 jours)
1. ✅ Collecter des données de test
2. ✅ Vérifier les événements dans PostHog
3. ✅ Valider les formules KPI

### Phase 3: Production (1 jour)
1. ✅ Activer en production
2. ✅ Monitorer les métriques
3. ✅ Créer les dashboards

## 🎯 Prochaines Étapes

1. **Immédiat :** Configurer PostHog et activer le tracking
2. **Court terme :** Collecter 7 jours de données pour validation
3. **Moyen terme :** Créer les dashboards KPI automatisés
4. **Long terme :** Optimiser les métriques basées sur les données

---

**Note :** Ce rapport sera mis à jour une fois PostHog activé et les données collectées.
