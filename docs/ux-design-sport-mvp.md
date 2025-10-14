# UX Design - Revia Sport MVP

## Vue d'Ensemble

Ce document définit l'expérience utilisateur pour la transformation sport-first de Revia, en conservant la cohérence avec le design system existant tout en optimisant pour l'usage mobile et les parcours sportifs.

## Principes UX Sport-First

### 1. Mobile-First Design
- **Interface tactile** : Optimisée pour les gestes mobiles
- **Navigation par onglets** : Accès rapide aux fonctionnalités principales
- **Contenu prioritaire** : Informations essentielles en premier
- **Performance** : Chargement rapide sur connexions mobiles

### 2. Friction Minimale
- **Onboarding express** : 1 clic pour commencer
- **Mode Guest** : Aucune inscription requise
- **Actions rapides** : Création et duplication de séances en 2-3 clics
- **Feedback immédiat** : Validation et confirmation instantanées

### 3. Motivation et Gamification
- **Progression visible** : Streaks, badges, statistiques
- **Récompenses** : Système de badges et paliers
- **Encouragement** : Messages positifs et motivationnels
- **Partage** : Export simple pour partager les progrès

## Architecture de Navigation

### Navigation Mobile (Barre d'Onglets)

```
┌─────────────────────────────────────┐
│  🏠 Accueil  📅 Séances  📊 Stats  👤 Profil  │
└─────────────────────────────────────┘
```

**Onglets :**
1. **🏠 Accueil** : Dashboard avec prochaines séances et statistiques
2. **📅 Séances** : Gestion des séances (créer, dupliquer, historique)
3. **📊 Stats** : Statistiques et gamification (streaks, badges)
4. **👤 Profil** : Paramètres utilisateur et préférences

### Navigation Desktop (Adaptation)

```
┌─────────────────────────────────────────────────────────┐
│  🏠 Accueil  📅 Séances  📊 Stats  👤 Profil  [Menu]  │
└─────────────────────────────────────────────────────────┘
```

## Wireframes Détaillés

### 1. Écran d'Accueil (Dashboard Sport)

```
┌─────────────────────────────────────┐
│  🏠 Accueil  📅 Séances  📊 Stats  👤 Profil  │
├─────────────────────────────────────┤
│                                     │
│  👋 Salut [Nom] !                   │
│  Prêt pour ta séance ?              │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  🔥 Streak: 7 jours            │ │
│  │  🏆 Badges: 3/10               │ │
│  │  📈 Progression: +15%           │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Prochaine séance                   │
│  ┌─────────────────────────────────┐ │
│  │  💪 Musculation - Aujourd'hui   │ │
│  │  🕐 18:00 - 45 min              │ │
│  │  [Commencer] [Reporter]         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Séances récentes                   │
│  ┌─────────────────────────────────┐ │
│  │  🏃 Cardio - Hier               │ │
│  │  ✅ Complétée - 30 min          │ │
│  │  RPE: 7/10                      │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [➕ Nouvelle séance]               │
│                                     │
└─────────────────────────────────────┘
```

### 2. Écran Séances (Gestion)

```
┌─────────────────────────────────────┐
│  🏠 Accueil  📅 Séances  📊 Stats  👤 Profil  │
├─────────────────────────────────────┤
│                                     │
│  📅 Mes Séances                     │
│                                     │
│  [Filtres] [Recherche] [➕ Nouvelle] │
│                                     │
│  Aujourd'hui                        │
│  ┌─────────────────────────────────┐ │
│  │  💪 Musculation - 18:00         │ │
│  │  🏋️ 5 exercices - 45 min        │ │
│  │  [▶️ Commencer] [✏️ Modifier]    │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Demain                             │
│  ┌─────────────────────────────────┐ │
│  │  🏃 Cardio - 07:00              │ │
│  │  🏃 3 exercices - 30 min        │ │
│  │  [▶️ Commencer] [✏️ Modifier]    │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Cette semaine                      │
│  ┌─────────────────────────────────┐ │
│  │  🧘 Yoga - Mercredi 19:00       │ │
│  │  🧘 4 exercices - 60 min        │ │
│  │  [▶️ Commencer] [✏️ Modifier]    │ │
│  └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 3. Écran Création de Séance

```
┌─────────────────────────────────────┐
│  ← Retour  📅 Nouvelle Séance       │
├─────────────────────────────────────┤
│                                     │
│  Informations de base               │
│  ┌─────────────────────────────────┐ │
│  │  Nom de la séance               │ │
│  │  [Musculation du haut du corps] │ │
│  │                                 │ │
│  │  Type                           │ │
│  │  [💪 Musculation ▼]            │ │
│  │                                 │ │
│  │  Date et heure                  │ │
│  │  [📅 Aujourd'hui] [🕐 18:00]    │ │
│  │                                 │ │
│  │  Objectifs                      │ │
│  │  [Développer la force...]       │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Dupliquer sur plusieurs jours      │
│  ┌─────────────────────────────────┐ │
│  │  ☐ Dupliquer cette séance       │ │
│  │  [📅 Jusqu'au 31/01]            │ │
│  │  [📅 Tous les 2 jours]          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [Annuler] [Suivant: Exercices]     │
│                                     │
└─────────────────────────────────────┘
```

### 4. Écran Exercices de Séance

```
┌─────────────────────────────────────┐
│  ← Retour  💪 Musculation du haut   │
├─────────────────────────────────────┤
│                                     │
│  Exercices (5)                      │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  1. Développé couché            │ │
│  │  🏋️ 3 séries × 8 reps          │ │
│  │  💪 60kg                        │ │
│  │  [✅ Fait] [✏️ Modifier]        │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  2. Tractions                  │ │
│  │  🏋️ 3 séries × 10 reps         │ │
│  │  💪 Poids du corps              │ │
│  │  [▶️ En cours] [✏️ Modifier]    │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [➕ Ajouter exercice]              │
│                                     │
│  Évaluation de la séance            │
│  ┌─────────────────────────────────┐ │
│  │  RPE (1-10): [7] ●●●●●●●○○○     │ │
│  │  Douleur (1-10): [3] ●●●○○○○○○○ │ │
│  │  Notes: [Très bonne séance...]  │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [Pause] [✅ Valider la séance]     │
│                                     │
└─────────────────────────────────────┘
```

### 5. Écran Statistiques et Gamification

```
┌─────────────────────────────────────┐
│  🏠 Accueil  📅 Séances  📊 Stats  👤 Profil  │
├─────────────────────────────────────┤
│                                     │
│  📊 Mes Statistiques                │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  🔥 Streak actuel: 7 jours      │ │
│  │  🏆 Meilleur streak: 15 jours   │ │
│  │  📈 Progression: +15% ce mois   │ │
│  └─────────────────────────────────┘ │
│                                     │
│  🏆 Badges obtenus (3/10)           │
│  ┌─────────────────────────────────┐ │
│  │  🥇 Premier pas    🥈 Régulier   │ │
│  │  ✅ Obtenu         ✅ Obtenu     │ │
│  │                                 │ │
│  │  🥉 Endurant       🏅 Champion   │ │
│  │  ✅ Obtenu         🔒 2 séances  │ │
│  └─────────────────────────────────┘ │
│                                     │
│  📈 Activité cette semaine          │
│  ┌─────────────────────────────────┐ │
│  │  L  M  M  J  V  S  D            │ │
│  │  ✅ ✅ ❌ ✅ ✅ ❌ ✅            │ │
│  │  5/7 jours actifs               │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [📤 Exporter mes données]          │
│                                     │
└─────────────────────────────────────┘
```

### 6. Écran Profil Utilisateur

```
┌─────────────────────────────────────┐
│  🏠 Accueil  📅 Séances  📊 Stats  👤 Profil  │
├─────────────────────────────────────┤
│                                     │
│  👤 Mon Profil                      │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  📸 [Photo de profil]           │ │
│  │  [Changer]                      │ │
│  │                                 │ │
│  │  Nom d'affichage                │ │
│  │  [Sportif123]                   │ │
│  │                                 │ │
│  │  Objectifs sportifs             │ │
│  │  [Développer ma force et...]    │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Préférences                        │
│  ┌─────────────────────────────────┐ │
│  │  🔔 Notifications               │ │
│  │  ☑️ Rappels de séances          │ │
│  │  ☑️ Conseils motivationnels     │ │
│  │  ☐ Newsletter                   │ │
│  │                                 │ │
│  │  🌙 Thème                       │ │
│  │  ○ Clair  ● Sombre  ○ Auto      │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Données et confidentialité         │
│  ┌─────────────────────────────────┐ │
│  │  📤 [Exporter mes données]      │ │
│  │  🗑️ [Supprimer mon compte]      │ │
│  │  📋 [Mentions légales]          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [Déconnexion]                      │
│                                     │
└─────────────────────────────────────┘
```

## Composants UX Spécialisés

### 1. Composant Streak Counter

```tsx
interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  variant?: 'compact' | 'detailed';
}

// Usage
<StreakCounter 
  currentStreak={7} 
  bestStreak={15} 
  variant="detailed" 
/>
```

**Design :**
- **Compact** : 🔥 7 jours
- **Detailed** : Carte avec progression et historique

### 2. Composant Badge System

```tsx
interface BadgeProps {
  type: 'achievement' | 'milestone' | 'special';
  name: string;
  description: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
}

// Usage
<Badge 
  type="milestone"
  name="Régulier"
  description="7 séances consécutives"
  earned={true}
/>
```

**Design :**
- **Earned** : Badge coloré avec animation
- **Locked** : Badge grisé avec progression
- **Special** : Badge avec effet spécial

### 3. Composant RPE Scale

```tsx
interface RPEScaleProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showLabels?: boolean;
}

// Usage
<RPEScale 
  value={7} 
  onChange={setRPE}
  label="RPE (Rate of Perceived Exertion)"
  showLabels={true}
/>
```

**Design :**
- Échelle de 1 à 10 avec couleurs
- Labels descriptifs (Très facile → Très difficile)
- Animation au changement de valeur

### 4. Composant Session Card

```tsx
interface SessionCardProps {
  session: SportSession;
  onStart: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  variant?: 'upcoming' | 'completed' | 'draft';
}

// Usage
<SessionCard 
  session={session}
  onStart={handleStart}
  onEdit={handleEdit}
  onDuplicate={handleDuplicate}
  variant="upcoming"
/>
```

**Design :**
- **Upcoming** : Carte avec CTA "Commencer"
- **Completed** : Carte avec statistiques et RPE
- **Draft** : Carte avec CTA "Continuer"

## Parcours Utilisateur

### 1. Parcours Guest (Premier Usage)

```
1. Arrivée sur l'app
   ↓
2. Écran d'accueil Guest
   ↓
3. [Commencer sans compte] → Mode Guest
   ↓
4. Création rapide d'une séance
   ↓
5. Réalisation de la séance
   ↓
6. Validation et feedback
   ↓
7. Bannière "Sauvegarder mes progrès"
   ↓
8. [Créer un compte] → Migration des données
```

### 2. Parcours Utilisateur Authentifié

```
1. Connexion
   ↓
2. Dashboard avec statistiques
   ↓
3. [Nouvelle séance] → Création
   ↓
4. [Dupliquer] → Sélection des dates
   ↓
5. [Commencer] → Réalisation
   ↓
6. Enregistrement des exercices
   ↓
7. Évaluation RPE/Douleur
   ↓
8. Validation → Mise à jour des stats
   ↓
9. Retour au dashboard
```

### 3. Parcours Gamification

```
1. Réalisation d'une séance
   ↓
2. Validation
   ↓
3. Calcul automatique du streak
   ↓
4. Vérification des badges
   ↓
5. Attribution des nouveaux badges
   ↓
6. Animation de félicitations
   ↓
7. Mise à jour des statistiques
```

## Design System Sport

### Couleurs

```css
/* Couleurs principales */
--sport-primary: #2563eb;      /* Bleu sport */
--sport-secondary: #10b981;    /* Vert succès */
--sport-accent: #f59e0b;       /* Orange énergie */
--sport-danger: #ef4444;       /* Rouge alerte */

/* Couleurs de gamification */
--streak-fire: #ff6b35;        /* Feu streak */
--badge-gold: #ffd700;         /* Or badge */
--badge-silver: #c0c0c0;       /* Argent badge */
--badge-bronze: #cd7f32;       /* Bronze badge */

/* Couleurs RPE */
--rpe-1-2: #22c55e;            /* Vert - Facile */
--rpe-3-4: #84cc16;            /* Vert clair */
--rpe-5-6: #eab308;            /* Jaune - Modéré */
--rpe-7-8: #f97316;            /* Orange - Difficile */
--rpe-9-10: #ef4444;           /* Rouge - Très difficile */
```

### Typographie

```css
/* Titres */
--font-sport-title: 2rem;      /* 32px */
--font-sport-subtitle: 1.5rem; /* 24px */
--font-sport-heading: 1.25rem; /* 20px */

/* Corps de texte */
--font-sport-body: 1rem;       /* 16px */
--font-sport-small: 0.875rem;  /* 14px */
--font-sport-caption: 0.75rem; /* 12px */

/* Métriques */
--font-sport-metric: 2.5rem;   /* 40px - Streaks, badges */
--font-sport-number: 1.5rem;   /* 24px - Statistiques */
```

### Espacement

```css
/* Espacement mobile */
--space-sport-xs: 0.25rem;     /* 4px */
--space-sport-sm: 0.5rem;      /* 8px */
--space-sport-md: 1rem;        /* 16px */
--space-sport-lg: 1.5rem;      /* 24px */
--space-sport-xl: 2rem;        /* 32px */
--space-sport-2xl: 3rem;       /* 48px */

/* Padding des composants */
--padding-sport-card: 1rem;
--padding-sport-button: 0.75rem 1.5rem;
--padding-sport-input: 0.75rem 1rem;
```

### Animations

```css
/* Animations de base */
--animation-sport-fast: 150ms ease-out;
--animation-sport-normal: 300ms ease-out;
--animation-sport-slow: 500ms ease-out;

/* Animations spéciales */
--animation-streak: 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
--animation-badge: 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
--animation-rpe: 0.3s ease-out;
```

## Responsive Design

### Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;        /* Small tablets */
--breakpoint-md: 768px;        /* Tablets */
--breakpoint-lg: 1024px;       /* Desktop */
--breakpoint-xl: 1280px;       /* Large desktop */
```

### Adaptations par Écran

#### Mobile (< 640px)
- Navigation par onglets en bas
- Cartes pleine largeur
- Boutons de taille tactile (44px min)
- Texte lisible sans zoom

#### Tablet (640px - 1024px)
- Navigation hybride (onglets + sidebar)
- Cartes en grille 2 colonnes
- Espacement optimisé
- Interactions tactiles

#### Desktop (> 1024px)
- Navigation sidebar complète
- Cartes en grille 3 colonnes
- Hover states
- Interactions clavier

## Accessibilité

### WCAG AA Compliance

1. **Contraste** : Ratio minimum 4.5:1
2. **Focus** : Indicateurs de focus visibles
3. **Navigation** : Navigation au clavier complète
4. **Écrans lecteurs** : Labels et descriptions appropriés
5. **Couleurs** : Information non dépendante de la couleur

### Bonnes Pratiques

- **Labels explicites** : "Commencer la séance" vs "Bouton"
- **États clairs** : Visuellement distincts (actif, inactif, en cours)
- **Feedback** : Confirmation des actions importantes
- **Erreurs** : Messages d'erreur clairs et actionables
- **Chargement** : Indicateurs de progression

## Tests UX

### Tests d'Utilisabilité

1. **Parcours complet** : De l'accueil à la validation de séance
2. **Mode Guest** : Création et migration de compte
3. **Gamification** : Compréhension des streaks et badges
4. **Mobile** : Utilisation sur différents appareils
5. **Accessibilité** : Tests avec lecteurs d'écran

### Métriques UX

- **Temps de tâche** : < 30s pour créer une séance
- **Taux d'erreur** : < 5% sur les actions critiques
- **Satisfaction** : Score SUS > 70
- **Adoption** : 80% des utilisateurs utilisent le mode Guest
- **Rétention** : 60% des utilisateurs reviennent après 7 jours

## Conclusion

Ce design system sport-first optimise l'expérience utilisateur pour les sportifs tout en conservant la cohérence avec l'architecture existante de Revia. L'approche mobile-first et la gamification intégrée maximisent l'engagement et l'adhérence aux exercices.
