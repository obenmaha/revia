# UX Design Sport MVP - Wireframes

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
