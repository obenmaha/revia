# Analytics et Confidentialité - PostHog

## Vue d'ensemble

Ce document décrit l'implémentation des analytics PostHog dans l'application Revia, en conformité avec le RGPD et les bonnes pratiques de confidentialité.

## Configuration

### Variables d'environnement

```bash
# Analytics (PostHog) - Optionnel
VITE_ANALYTICS_ENABLED=false                    # Désactivé par défaut
VITE_POSTHOG_KEY=your-posthog-key-here          # Clé API PostHog
VITE_POSTHOG_HOST=https://app.posthog.com       # Instance PostHog
VITE_DEBUG_ANALYTICS=false                      # Mode debug
```

### Activation

L'analytics n'est activé que si :
1. `VITE_ANALYTICS_ENABLED=true`
2. `VITE_POSTHOG_KEY` est défini
3. L'utilisateur a donné son consentement explicite

## Conformité RGPD

### Principes appliqués

1. **Consentement explicite** : Opt-out par défaut, activation manuelle requise
2. **Minimisation des données** : Seules les données nécessaires sont collectées
3. **Anonymisation** : Aucune donnée personnelle identifiable n'est envoyée
4. **Transparence** : Tous les événements sont documentés et auditable
5. **Droit à l'oubli** : Possibilité de désactiver complètement le tracking

### Données collectées

#### Événements de session
- `session_created` : Type de session, duplication (anonymisé)
- `session_validated` : Nombre d'exercices, durée, RPE moyen (anonymisé)

#### Événements guest
- `guest_mode_entered` : Point d'entrée, user agent (anonymisé)
- `guest_session_created` : Type de session, première session (anonymisé)
- `guest_migration_started` : Nombre de sessions/exercices (anonymisé)
- `guest_migration_completed` : Statistiques de migration (anonymisé)
- `guest_migration_failed` : Type d'erreur (anonymisé)

#### Événements d'erreur
- `error_occurred` : Type d'erreur, composant, action utilisateur (anonymisé)

### Données exclues

Les données suivantes ne sont **JAMAIS** collectées :
- Noms, prénoms, emails
- Numéros de téléphone
- Adresses
- Contenu des notes utilisateur
- Données médicales sensibles
- Identifiants personnels

## Sécurité

### Chiffrement
- Toutes les communications utilisent HTTPS
- PostHog utilise un chiffrement de bout en bout
- Les clés API sont stockées de manière sécurisée

### Anonymisation
- Les IDs de session sont des UUIDs générés localement
- Aucun identifiant utilisateur n'est transmis sans consentement
- Les messages d'erreur sont tronqués à 200 caractères

### Rétention des données
- Durée de rétention : 365 jours maximum
- Suppression automatique après expiration
- Possibilité de suppression immédiate via `analytics.disableTracking()`

## Utilisation

### Initialisation

```typescript
import { analytics } from '@/lib/analytics';

// Vérifier le statut
const status = analytics.getStatus();
console.log('Analytics enabled:', status.enabled);

// Activer le tracking (avec consentement utilisateur)
analytics.enableTracking();
```

### Tracking d'événements

```typescript
// Événement typé avec validation
analytics.track('session_created', {
  session_type: 'cardio',
  has_duplicates: false
});

// Identification utilisateur (authentifié uniquement)
analytics.identify('user-123', {
  user_type: 'authenticated',
  app_mode: 'sport'
});
```

### Désactivation

```typescript
// Désactiver pour l'utilisateur actuel
analytics.disableTracking();

// Vérifier le statut
const status = analytics.getStatus();
```

## Audit et conformité

### Logs de debug

En mode développement avec `VITE_DEBUG_ANALYTICS=true` :
- Tous les événements sont loggés dans la console
- Aucune donnée sensible n'apparaît dans les logs
- Statut d'initialisation visible

### Vérification

```typescript
// Vérifier que l'analytics est correctement configuré
const status = analytics.getStatus();
if (!status.enabled) {
  console.log('Analytics désactivé - VITE_ANALYTICS_ENABLED=false');
}
```

## Dépannage

### Problèmes courants

1. **Analytics non initialisé**
   - Vérifier `VITE_ANALYTICS_ENABLED=true`
   - Vérifier `VITE_POSTHOG_KEY` est défini
   - Vérifier la connectivité réseau

2. **Événements non envoyés**
   - Vérifier le consentement utilisateur
   - Activer le mode debug pour voir les logs
   - Vérifier les erreurs dans la console

3. **Données sensibles détectées**
   - Vérifier la fonction `sanitizeProperties()`
   - Ajouter les clés sensibles à la liste d'exclusion
   - Tester avec des données réelles

### Support

Pour toute question sur l'implémentation analytics :
- Consulter la documentation PostHog : https://posthog.com/docs
- Vérifier les logs de debug en mode développement
- Contacter l'équipe de développement Revia

## Changelog

### v1.0.0 (2025-01-15)
- Implémentation initiale du wrapper PostHog
- Support des événements de session et guest
- Conformité RGPD complète
- Protection par variables d'environnement
- Anonymisation automatique des données sensibles
