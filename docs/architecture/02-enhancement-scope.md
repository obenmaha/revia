# Architecture Sport MVP - Portée et Stratégie d'Intégration

## Enhancement Scope and Integration Strategy

### Enhancement Overview

**Enhancement Type:** Major Feature Modification + UI/UX Overhaul
**Scope:** Transformation complète de l'expérience utilisateur de cabinet vers sport-first
**Integration Impact:** Major Impact (architectural changes required)

### Integration Approach

#### Code Integration Strategy

**Code Integration Strategy:**

- Réutilisation des composants UI existants (Radix UI + Tailwind)
- Extension des stores Zustand existants pour les fonctionnalités sport
- Conservation de la structure de routage React Router
- Ajout de nouveaux composants sport dans `src/components/features/`

**Détails** :

- Composants Radix UI existants réutilisés (Button, Card, Dialog, etc.)
- Extension des stores existants avec de nouveaux états sport
- Routes existantes préservées avec ajout de nouvelles routes sport
- Organisation modulaire dans le dossier features

#### Database Integration

**Database Integration:**

- Ajout de nouvelles tables pour les fonctionnalités sport
- Conservation des tables existantes pour compatibilité future
- Extension du système RLS existant pour les nouvelles entités
- Migration progressive des données

**Détails** :

- Nouvelles tables : sport_users, sport_sessions, sport_exercises, sport_badges, guest_data
- Tables existantes : patients, sessions, exercises (préservées)
- RLS étendu aux nouvelles tables avec mêmes principes
- Migrations Supabase progressives sans impact

#### API Integration

**API Integration:**

- Extension des Edge Functions Supabase existantes
- Nouveaux endpoints pour les fonctionnalités sport
- Conservation de l'authentification Supabase existante
- Intégration avec les services existants

**Détails** :

- Nouvelles Edge Functions : sport-user, sport-sessions, sport-stats
- Endpoints existants préservés
- Authentification Supabase maintenue
- Services existants étendus

#### UI Integration

**UI Integration:**

- Refactoring de la navigation vers mobile-first
- Conservation du système de design existant
- Nouveaux écrans sport avec barre d'onglets
- Mode Guest sans authentification

**Détails** :

- Navigation : sidebar desktop → onglets mobile
- Design system : Tailwind + Radix UI maintenu
- Nouveaux écrans : dashboard sport, séances, stats, profil
- Mode Guest : interface simplifiée sans auth

### Compatibility Requirements

#### Existing API Compatibility

- **Conservation de tous les endpoints existants**
- Aucune modification des API cabinet
- Extension uniquement avec nouveaux endpoints
- Versioning si nécessaire

#### Database Schema Compatibility

- **Ajout de tables sans modification des existantes**
- Contraintes existantes préservées
- Index existants maintenus
- RLS existant étendu

#### UI/UX Consistency

- **Maintien de la cohérence visuelle avec Radix UI + Tailwind**
- Composants existants réutilisés
- Patterns d'interaction conservés
- Thème et couleurs cohérents

#### Performance Impact

- **Bundle < 300KB, TTFB < 1s maintenus**
- Optimisations mobiles ajoutées
- Lazy loading des composants sport
- Cache optimisé

## Tech Stack

### Existing Technology Stack

| Category           | Current Technology    | Version | Usage in Enhancement | Notes        |
| ------------------ | --------------------- | ------- | -------------------- | ------------ |
| Frontend Framework | React                 | 19      | Core framework       | Conservation |
| Build Tool         | Vite                  | 7.x     | Build system         | Conservation |
| Language           | TypeScript            | Latest  | Type safety          | Conservation |
| Styling            | Tailwind CSS          | Latest  | UI styling           | Conservation |
| UI Components      | Radix UI              | Latest  | Component library    | Conservation |
| State Management   | Zustand               | Latest  | Client state         | Extension    |
| Server State       | TanStack Query        | v5      | Server state         | Conservation |
| Routing            | React Router          | v6      | Navigation           | Refactoring  |
| Forms              | React Hook Form + Zod | Latest  | Form handling        | Conservation |
| Backend Platform   | Supabase              | Latest  | Backend services     | Extension    |
| Database           | PostgreSQL            | 15+     | Data storage         | Extension    |
| Authentication     | Supabase Auth         | Latest  | User auth            | Conservation |
| File Storage       | Supabase Storage      | Latest  | File handling        | Conservation |
| Deployment         | Vercel                | Latest  | Frontend hosting     | Conservation |

### New Technology Additions

| Technology                  | Version | Purpose | Rationale                                | Integration Method |
| --------------------------- | ------- | ------- | ---------------------------------------- | ------------------ |
| Aucune nouvelle technologie | -       | -       | Conservation de l'architecture existante | -                  |

**Note** : Aucune nouvelle technologie n'est ajoutée pour maintenir la simplicité et la cohérence avec l'architecture existante.
