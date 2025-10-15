# PRD Sport MVP - Exigences Non-Fonctionnelles

## Non Functional Requirements

### NFR1 - Performance

**NFR1** : Performance - TTFB < 1s côté Vercel pour pages principales ; bundle < 300 KB initial.

**Détails** :

- Time To First Byte < 1 seconde
- Bundle JavaScript initial < 300 KB
- Chargement des pages principales < 2 secondes
- Optimisation mobile (3G/4G)

### NFR2 - Compatibilité

**NFR2** : Compatibilité - Chrome/Safari/Firefox/Edge récents ; responsive mobile-first.

**Détails** :

- Support des navigateurs récents (dernières 2 versions)
- Design responsive mobile-first
- Support des gestes tactiles
- Compatibilité PWA (Progressive Web App)

### NFR3 - Fiabilité

**NFR3** : Fiabilité - S'appuyer sur la disponibilité Vercel/Supabase (pas de SLO propres).

**Détails** :

- Dépendance de la disponibilité Vercel (99.9%)
- Dépendance de la disponibilité Supabase (99.9%)
- Pas de SLO (Service Level Objective) propres
- Gestion gracieuse des pannes

### NFR4 - Sécurité

**NFR4** : Sécurité - TLS, RLS Supabase activées, hashing côté provider, politique de rôles minimale.

**Détails** :

- Chiffrement TLS en transit
- Row Level Security (RLS) activé sur toutes les tables
- Hashing des mots de passe côté Supabase
- Politique de rôles minimale (utilisateur/admin)

### NFR5 - RGPD

**NFR5** : RGPD - minimiser champs ; base légale = consentement ; pages : mentions/CGU + export/suppression.

**Détails** :

- Minimisation des données collectées
- Base légale : consentement explicite
- Pages mentions légales et CGU
- Droit à l'export et à la suppression
- Politique de rétention des données

### NFR6 - Accessibilité

**NFR6** : Accessibilité - WCAG AA pour contrastes et focus states prioritaires.

**Détails** :

- Conformité WCAG AA niveau minimum
- Ratio de contraste 4.5:1 minimum
- États de focus visibles
- Navigation clavier complète
- Labels pour lecteurs d'écran

### NFR7 - Sauvegarde

**NFR7** : Sauvegarde - auto-save local (draft) + save explicite serveur à la validation (évite offline-first caché).

**Détails** :

- Sauvegarde automatique locale des brouillons
- Sauvegarde explicite serveur à la validation
- Pas de mode offline-first complexe
- Synchronisation transparente

## Compatibility Requirements

### CR1 - API Compatibility

**CR1** : L'amélioration doit maintenir la compatibilité avec l'architecture Supabase existante (Auth, Postgres, Storage, Edge Functions).

**Détails** :

- Conservation de tous les endpoints existants
- Extension des Edge Functions sans modification
- Maintien de l'authentification Supabase
- Compatibilité avec les services existants

### CR2 - Database Schema Compatibility

**CR2** : L'amélioration doit préserver la structure de base de données existante tout en ajoutant les nouvelles tables nécessaires pour les fonctionnalités sport.

**Détails** :

- Aucune modification des tables existantes
- Ajout de nouvelles tables uniquement
- Maintien des contraintes existantes
- Migration progressive sans impact

### CR3 - UI/UX Consistency

**CR3** : L'amélioration doit maintenir la cohérence UI/UX avec le système de design existant (Tailwind + Radix UI).

**Détails** :

- Réutilisation des composants Radix UI
- Conservation du système de couleurs Tailwind
- Maintien des patterns d'interaction
- Cohérence visuelle globale

### CR4 - Deployment Compatibility

**CR4** : L'amélioration doit être compatible avec le système de déploiement Vercel existant.

**Détails** :

- Déploiement via Vercel sans modification
- Conservation du pipeline de build
- Compatibilité avec les environnements existants
- Rollback possible en cas de problème
