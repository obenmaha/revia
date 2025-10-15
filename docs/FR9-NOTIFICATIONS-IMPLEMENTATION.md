# FR9 - Implémentation du Système de Notifications

## Vue d'ensemble

Cette implémentation couvre le système de notifications et de rappels pour l'application sport, incluant les notifications push locales, les notifications par email, et la gestion des préférences utilisateur.

## Fonctionnalités implémentées

### ✅ 1. Préférences de notifications (prefs.notifs binding)
- Table `notification_preferences` avec RLS
- Hook `useNotifications` pour la gestion d'état
- Liaison avec les préférences utilisateur existantes
- Support des notifications email et push

### ✅ 2. Hook scheduleLocalReminder
- Hook `useNotifications` avec fonction `scheduleLocalReminder`
- Hook spécialisé `useScheduleSessionReminder` pour les séances
- Service `NotificationService` pour la logique métier
- Gestion des permissions et de la compatibilité navigateur

### ✅ 3. UX des permissions
- Composant `NotificationPermissionModal` pour la demande de permission
- Composant `NotificationSettings` pour la configuration
- Composant `NotificationIntegration` pour l'intégration dans le profil
- Composant `NotificationStatus` pour l'affichage du statut

### ✅ 4. Tests unitaires (opt-out cancels)
- Tests complets pour `useNotifications`
- Tests pour les composants de notification
- Tests pour l'opt-out et l'annulation des rappels
- Couverture des cas d'erreur et des permissions

## Structure des fichiers

```
src/
├── hooks/
│   └── useNotifications.ts              # Hook principal pour les notifications
├── components/notifications/
│   ├── NotificationSettings.tsx         # Configuration des préférences
│   ├── NotificationPermissionModal.tsx  # Modal de demande de permission
│   ├── NotificationIntegration.tsx      # Intégration dans le profil
│   ├── NotificationStatus.tsx           # Affichage du statut
│   ├── NotificationExample.tsx          # Exemple d'utilisation
│   └── index.ts                         # Exports
├── services/
│   └── notificationService.ts           # Service de notifications
├── __tests__/
│   ├── useNotifications.test.ts         # Tests du hook
│   └── NotificationSettings.test.tsx    # Tests des composants
└── types/
    └── supabase.ts                      # Types mis à jour
```

## Base de données

### Tables créées

#### `notification_preferences`
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT FALSE,
  reminder_time VARCHAR(5) DEFAULT '18:00',
  reminder_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  reminder_frequency VARCHAR(20) DEFAULT 'twice_weekly',
  last_reminded_at TIMESTAMP WITH TIME ZONE,
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `notification_logs`
```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(20) CHECK (type IN ('email_reminder', 'push_notification', 'in_app')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

#### `user_profile`
```sql
CREATE TABLE user_profile (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(20),
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  fitness_level VARCHAR(20),
  goals JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fonctions RPC

- `get_users_for_reminders()` - Récupère les utilisateurs éligibles
- `log_notification_sent(user_id, type, metadata)` - Enregistre l'envoi
- `should_send_reminder(user_id)` - Vérifie si un rappel doit être envoyé

## Utilisation

### Hook principal

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    preferences,
    permission,
    isSupported,
    scheduleLocalReminder,
    updatePreferences,
    requestPermission
  } = useNotifications(userId);

  // Utilisation...
}
```

### Composants

```typescript
import { 
  NotificationSettings, 
  NotificationIntegration,
  NotificationStatus 
} from '@/components/notifications';

// Configuration complète
<NotificationIntegration userId={userId} />

// Statut simple
<NotificationStatus userId={userId} showLabel />

// Configuration avancée
<NotificationSettings userId={userId} />
```

### Service

```typescript
import { NotificationService } from '@/services/notificationService';

// Programmer une notification
await NotificationService.scheduleLocalNotification({
  title: 'Rappel',
  body: 'Votre séance commence bientôt',
  tag: 'session-reminder'
});

// Vérifier la compatibilité
const compatibility = NotificationService.getBrowserCompatibility();
```

## Gestion des permissions

### États des permissions
- `default` - Pas encore demandé
- `granted` - Autorisé
- `denied` - Refusé

### Flux de permission
1. Vérification du support navigateur
2. Demande de permission si nécessaire
3. Configuration des préférences
4. Programmation des rappels

## Tests

### Tests du hook
- Gestion des permissions
- Programmation des rappels
- Annulation des notifications
- Gestion des erreurs

### Tests des composants
- Rendu des états
- Interactions utilisateur
- Gestion des erreurs
- Intégration des hooks

## Compatibilité navigateur

### Support des notifications
- ✅ Chrome/Edge (toutes versions)
- ✅ Firefox (toutes versions)
- ✅ Safari (macOS)
- ❌ Safari iOS (pas de support Web Notifications)

### Stratégie de fallback
1. **Web Push** (si supporté et autorisé)
2. **Email** (toujours disponible via Edge Functions)
3. **In-App** (toujours disponible)

## Configuration

### Variables d'environnement
Aucune variable d'environnement supplémentaire requise.

### Dépendances
- `@tanstack/react-query` - Gestion d'état
- `zustand` - Store global
- `lucide-react` - Icônes

## Migration

### Appliquer la migration
```bash
# Appliquer la migration de base de données
supabase db push
```

### Mise à jour des types
```bash
# Générer les types TypeScript
npm run generate-types
```

## Exemples d'utilisation

### Intégration dans le profil utilisateur

```typescript
import { NotificationIntegration } from '@/components/notifications';

function ProfilePage() {
  return (
    <div>
      {/* Autres composants du profil */}
      <NotificationIntegration userId={userId} />
    </div>
  );
}
```

### Programmation d'un rappel de séance

```typescript
import { useScheduleSessionReminder } from '@/hooks/useNotifications';

function SessionComponent() {
  const { scheduleSessionReminder } = useScheduleSessionReminder();
  
  const handleScheduleReminder = async () => {
    const sessionDate = new Date('2025-01-20T18:00:00');
    
    await scheduleSessionReminder('Séance de musculation', sessionDate, {
      minutesBefore: 15,
      customMessage: 'Préparez-vous pour votre séance !'
    });
  };
}
```

### Test des notifications

```typescript
import { NotificationExample } from '@/components/notifications';

function TestPage() {
  return <NotificationExample userId={userId} />;
}
```

## Notes importantes

1. **Permissions** : Les notifications push nécessitent une interaction utilisateur pour être activées
2. **Compatibilité** : Safari iOS ne supporte pas les Web Notifications
3. **Rate limiting** : Les notifications sont limitées pour éviter le spam
4. **RGPD** : Les préférences sont stockées localement et peuvent être supprimées
5. **Tests** : Utilisez le composant `NotificationExample` pour tester les fonctionnalités

## Prochaines étapes

1. Intégrer dans les pages de profil existantes
2. Ajouter les Edge Functions pour les emails
3. Implémenter les notifications in-app
4. Ajouter les métriques de notification
5. Optimiser les performances pour les gros volumes
