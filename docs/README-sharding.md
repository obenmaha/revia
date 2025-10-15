# Documentation Shardée - Revia Sport MVP

## Vue d'Ensemble

Cette documentation a été shardée pour faciliter le développement IDE et la maintenance. Chaque section est organisée dans des fichiers séparés pour une navigation optimale.

## Structure des Documents

### 📋 PRD (Product Requirements Document)

- **01-introduction.md** : Vue d'ensemble, contexte et objectifs
- **02-functional-requirements.md** : Exigences fonctionnelles détaillées
- **03-non-functional-requirements.md** : Exigences non-fonctionnelles et compatibilité
- **04-ui-enhancement-goals.md** : Objectifs d'amélioration UI/UX
- **05-epic-structure.md** : Structure des épiques et stories

### 🏗️ Architecture

- **01-introduction.md** : Introduction et analyse du projet existant
- **02-enhancement-scope.md** : Portée et stratégie d'intégration
- **03-data-models.md** : Modèles de données et schémas
- **04-component-architecture.md** : Architecture des composants

### 🎨 UX Design

- **01-design-principles.md** : Principes de design et système de couleurs
- **02-wireframes.md** : Wireframes détaillés et composants spécialisés
- **03-user-journeys.md** : Parcours utilisateur et métriques UX

## Navigation Rapide

### Pour les Développeurs

1. **Commencer par** : `architecture/01-introduction.md`
2. **Modèles de données** : `architecture/03-data-models.md`
3. **Composants** : `architecture/04-component-architecture.md`
4. **Wireframes** : `ux/02-wireframes.md`

### Pour les Product Owners

1. **Commencer par** : `prd/01-introduction.md`
2. **Exigences** : `prd/02-functional-requirements.md`
3. **Stories** : `prd/05-epic-structure.md`
4. **Parcours utilisateur** : `ux/03-user-journeys.md`

### Pour les UX Designers

1. **Commencer par** : `ux/01-design-principles.md`
2. **Wireframes** : `ux/02-wireframes.md`
3. **Parcours** : `ux/03-user-journeys.md`
4. **Objectifs UI** : `prd/04-ui-enhancement-goals.md`

## Fichiers de Référence

### Documents Complets (Non-Shardés)

- **prd-v1.2-sport-mvp.md** : PRD complet original
- **architecture-sport-mvp.md** : Architecture complète originale
- **ux-design-sport-mvp.md** : UX Design complet original

### Composants Implémentés

- **src/components/features/sport/** : Composants React spécialisés
  - `StreakCounter.tsx` : Affichage des streaks
  - `BadgeSystem.tsx` : Système de badges
  - `RPEScale.tsx` : Échelles RPE et douleur
  - `SessionCard.tsx` : Cartes de séances

### Tests et Validation

- **docs/qa/regression-test-suite-sport-mvp.md** : Suite de tests de régression
- **docs/qa/** : Dossier des validations QA

## Workflow de Développement

### 1. Phase de Planification

- Lire `prd/01-introduction.md` pour comprendre le contexte
- Consulter `prd/05-epic-structure.md` pour les stories
- Examiner `architecture/01-introduction.md` pour l'architecture

### 2. Phase de Développement

- Suivre `architecture/03-data-models.md` pour les modèles
- Implémenter selon `architecture/04-component-architecture.md`
- Utiliser `ux/02-wireframes.md` pour l'interface

### 3. Phase de Test

- Exécuter `docs/qa/regression-test-suite-sport-mvp.md`
- Valider les parcours utilisateur `ux/03-user-journeys.md`
- Vérifier les exigences `prd/02-functional-requirements.md`

## Mise à Jour de la Documentation

### Quand Modifier

- **PRD** : Changements de fonctionnalités ou d'exigences
- **Architecture** : Modifications techniques ou de structure
- **UX** : Changements d'interface ou de parcours utilisateur

### Comment Modifier

1. Modifier le fichier shardé concerné
2. Mettre à jour le document complet correspondant
3. Vérifier la cohérence entre les versions
4. Notifier l'équipe des changements

## Liens Utiles

- **Repository** : [Revia GitHub](https://github.com/your-org/revia)
- **Supabase** : [Dashboard Supabase](https://supabase.com/dashboard)
- **Vercel** : [Dashboard Vercel](https://vercel.com/dashboard)
- **Design System** : [Radix UI](https://www.radix-ui.com/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)

## Support

Pour toute question sur la documentation ou l'architecture :

1. Consulter les documents shardés correspondants
2. Vérifier les documents complets pour le contexte
3. Contacter l'équipe de développement
4. Créer une issue GitHub si nécessaire
