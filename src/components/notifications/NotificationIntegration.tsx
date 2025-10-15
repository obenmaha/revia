// Composant d'intégration des notifications dans le profil - FR9
import { useEffect, useState } from 'react';
import { Bell, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationSettings } from './NotificationSettings';
import { NotificationPermissionModal } from './NotificationPermissionModal';

interface NotificationIntegrationProps {
  userId?: string;
  onSettingsChange?: () => void;
}

export function NotificationIntegration({ 
  userId, 
  onSettingsChange 
}: NotificationIntegrationProps) {
  const {
    preferences,
    isLoading,
    isError,
    permission,
    isSupported,
    requestPermission,
    updatePreferences,
  } = useNotifications(userId);

  const [showSettings, setShowSettings] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Vérifier si l'utilisateur a déjà configuré ses préférences
  const hasConfiguredPreferences = preferences && (
    preferences.email_enabled || 
    preferences.push_enabled
  );

  // Vérifier si les notifications push sont activées
  const isPushEnabled = preferences?.push_enabled && permission === 'granted';

  // Vérifier si l'utilisateur a refusé les permissions
  const hasDeniedPermission = isSupported && permission === 'denied';

  // Vérifier si l'utilisateur n'a pas encore été invité à configurer
  const needsInitialSetup = !isLoading && !isError && !hasConfiguredPreferences;

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      setShowSettings(true);
      return;
    }

    if (permission === 'denied') {
      setShowSettings(true);
      return;
    }

    if (permission !== 'granted') {
      setShowPermissionModal(true);
      return;
    }

    // Activer les notifications push
    await updatePreferences({ push_enabled: true });
    onSettingsChange?.();
  };

  const handlePermissionGranted = () => {
    setShowPermissionModal(false);
    updatePreferences({ push_enabled: true });
    onSettingsChange?.();
  };

  const handleSettingsSave = () => {
    setShowSettings(false);
    onSettingsChange?.();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Chargement des préférences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Impossible de charger les préférences de notifications.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (showSettings) {
    return (
      <NotificationSettings
        userId={userId}
        onSave={handleSettingsSave}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {isPushEnabled && (
              <Badge variant="default" className="gap-1">
                <Bell className="h-3 w-3" />
                Activé
              </Badge>
            )}
            {hasDeniedPermission && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Bloqué
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configurez vos rappels et notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {needsInitialSetup && (
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Activez les notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez des rappels pour vos séances d'entraînement
                </p>
              </div>
              <Button onClick={handleEnableNotifications} className="w-full">
                Configurer les notifications
              </Button>
            </div>
          )}

          {hasConfiguredPreferences && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-muted-foreground">
                    {preferences?.email_enabled ? 'Activé' : 'Désactivé'}
                  </p>
                </div>
                <Badge variant={preferences?.email_enabled ? 'default' : 'secondary'}>
                  {preferences?.email_enabled ? 'Activé' : 'Désactivé'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications push</p>
                  <p className="text-sm text-muted-foreground">
                    {isPushEnabled ? 'Activé' : 'Désactivé'}
                  </p>
                </div>
                <Badge variant={isPushEnabled ? 'default' : 'secondary'}>
                  {isPushEnabled ? 'Activé' : 'Désactivé'}
                </Badge>
              </div>

              {preferences?.reminder_time && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Heure des rappels</p>
                    <p className="text-sm text-muted-foreground">
                      {preferences.reminder_time}
                    </p>
                  </div>
                </div>
              )}

              {preferences?.reminder_frequency && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Fréquence</p>
                    <p className="text-sm text-muted-foreground">
                      {preferences.reminder_frequency === 'daily' && 'Quotidien'}
                      {preferences.reminder_frequency === 'twice_weekly' && 'Deux fois par semaine'}
                      {preferences.reminder_frequency === 'weekly' && 'Hebdomadaire'}
                    </p>
                  </div>
                </div>
              )}

              {hasDeniedPermission && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Les notifications push sont bloquées dans votre navigateur. 
                    Vous pouvez toujours recevoir des rappels par email.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                variant="outline" 
                onClick={() => setShowSettings(true)}
                className="w-full gap-2"
              >
                <Settings className="h-4 w-4" />
                Modifier les paramètres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <NotificationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        userId={userId}
        onPermissionGranted={handlePermissionGranted}
      />
    </>
  );
}
