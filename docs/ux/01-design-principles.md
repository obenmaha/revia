# UX Design Sport MVP - Principes de Design

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
