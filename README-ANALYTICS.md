# Analytics PostHog - Implémentation Revia

## 🎯 Objectif

Implémentation d'un wrapper analytics sécurisé pour PostHog dans l'application Revia, avec conformité RGPD et protection par variables d'environnement.

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
- `src/lib/analytics.ts` - Wrapper principal PostHog
- `src/examples/analytics-usage.ts` - Exemples d'utilisation
- `docs/analytics-privacy.md` - Documentation confidentialité
- `README-ANALYTICS.md` - Ce fichier

### Fichiers modifiés
- `env.example` - Ajout des variables PostHog
- `src/pages/new-session.tsx` - Intégration événements session
- `src/hooks/useValidateSession.ts` - Intégration événements validation
- `src/stores/guestStore.ts` - Intégration événements guest
- `src/services/migrateGuestToAccount.ts` - Intégration événements migration

## 🚀 Installation

1. **Installer PostHog**
   ```bash
   npm install posthog-js
   ```

2. **Configurer les variables d'environnement**
   ```bash
   # Copier le fichier d'exemple
   cp env.example .env.local
   
   # Éditer .env.local et ajouter :
   VITE_ANALYTICS_ENABLED=true
   VITE_POSTHOG_KEY=your-posthog-key-here
   VITE_POSTHOG_HOST=https://app.posthog.com
   VITE_DEBUG_ANALYTICS=false
   ```

3. **Obtenir une clé PostHog**
   - Créer un compte sur [PostHog](https://posthog.com)
   - Créer un nouveau projet
   - Copier la clé API depuis les paramètres du projet

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_ANALYTICS_ENABLED` | Active/désactive l'analytics | `false` |
| `VITE_POSTHOG_KEY` | Clé API PostHog | Requis si activé |
| `VITE_POSTHOG_HOST` | Instance PostHog | `https://app.posthog.com` |
| `VITE_DEBUG_ANALYTICS` | Mode debug | `false` |

### Configuration PostHog

Le wrapper est configuré avec les paramètres de sécurité suivants :
- `person_profiles: 'identified_only'` - Profils seulement pour utilisateurs identifiés
- `capture_pageview: false` - Pas de tracking automatique des pages
- `disable_session_recording: true` - Pas d'enregistrement de session
- `respect_dnt: true` - Respecte Do Not Track
- `opt_out_capturing_by_default: true` - Opt-out par défaut

## 📊 Événements trackés

### Sessions
- `session_created` - Création d'une session (avec/sans duplication)
- `session_validated` - Validation d'une session avec exercices

### Mode Guest
- `guest_mode_entered` - Entrée en mode guest
- `guest_session_created` - Création d'une session guest
- `guest_migration_started` - Début de migration vers compte
- `guest_migration_completed` - Migration réussie
- `guest_migration_failed` - Échec de migration

### Erreurs
- `error_occurred` - Erreurs avec contexte

### Performance
- `page_load` - Temps de chargement des pages

## 🛡️ Sécurité et confidentialité

### Conformité RGPD
- ✅ Consentement explicite requis
- ✅ Opt-out par défaut
- ✅ Anonymisation des données sensibles
- ✅ Pas de collecte de données personnelles
- ✅ Rétention limitée (365 jours max)
- ✅ Droit à l'oubli

### Données exclues
- Noms, prénoms, emails
- Numéros de téléphone
- Adresses
- Contenu des notes utilisateur
- Données médicales sensibles

### Anonymisation automatique
- Messages d'erreur tronqués à 200 caractères
- Suppression des clés sensibles
- IDs de session anonymisés (UUIDs)

## 💻 Utilisation

### Import du service
```typescript
import { analytics } from '@/lib/analytics';
```

### Vérification du statut
```typescript
const status = analytics.getStatus();
if (status.available) {
  // Analytics disponible
}
```

### Tracking d'événements
```typescript
// Événement typé
analytics.track('session_created', {
  session_type: 'cardio',
  has_duplicates: false
});

// Identification utilisateur
analytics.identify('user-123', {
  user_type: 'authenticated',
  app_mode: 'sport'
});
```

### Gestion du consentement
```typescript
// Activer avec consentement
analytics.enableTracking();

// Désactiver
analytics.disableTracking();
```

## 🧪 Tests

### Mode développement
```bash
# Activer le debug
VITE_DEBUG_ANALYTICS=true npm run dev
```

### Vérification manuelle
```typescript
// Dans la console du navigateur
analytics.getStatus();
// Doit retourner: { enabled: true, initialized: true, available: true }
```

## 📈 Monitoring

### Dashboard PostHog
1. Aller sur [PostHog Dashboard](https://app.posthog.com)
2. Sélectionner le projet Revia
3. Consulter les événements en temps réel
4. Créer des insights personnalisés

### Métriques importantes
- Taux de création de sessions
- Taux de validation de sessions
- Conversion guest → compte
- Taux d'erreurs par composant
- Temps de chargement des pages

## 🔍 Dépannage

### Problèmes courants

1. **Analytics non initialisé**
   ```bash
   # Vérifier les variables d'environnement
   echo $VITE_ANALYTICS_ENABLED
   echo $VITE_POSTHOG_KEY
   ```

2. **Événements non envoyés**
   ```typescript
   // Vérifier le statut
   console.log(analytics.getStatus());
   
   // Activer le debug
   VITE_DEBUG_ANALYTICS=true
   ```

3. **Erreurs de configuration**
   ```typescript
   // Vérifier la clé PostHog
   if (!import.meta.env.VITE_POSTHOG_KEY) {
     console.error('VITE_POSTHOG_KEY manquant');
   }
   ```

## 📚 Documentation

- [Documentation PostHog](https://posthog.com/docs)
- [Conformité RGPD](docs/analytics-privacy.md)
- [Exemples d'utilisation](src/examples/analytics-usage.ts)

## 🤝 Contribution

Pour ajouter de nouveaux événements :

1. **Définir le type dans `analytics.ts`**
   ```typescript
   'nouvel_evenement': {
     propriete1: string;
     propriete2: number;
   }
   ```

2. **Utiliser le tracking typé**
   ```typescript
   analytics.track('nouvel_evenement', {
     propriete1: 'valeur',
     propriete2: 123
   });
   ```

3. **Tester en mode debug**
   ```bash
   VITE_DEBUG_ANALYTICS=true npm run dev
   ```

4. **Documenter dans `analytics-privacy.md`**

## 📝 Changelog

### v1.0.0 (2025-01-15)
- ✅ Wrapper PostHog complet
- ✅ Conformité RGPD
- ✅ Protection par variables d'environnement
- ✅ Événements session, validation, guest
- ✅ Anonymisation automatique
- ✅ Documentation complète
- ✅ Exemples d'utilisation
