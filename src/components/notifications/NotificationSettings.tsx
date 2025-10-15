// Composant de configuration des préférences de notifications - FR9
import { useState, useEffect } from 'react';
import { Bell, Mail, Clock, Calendar, Settings, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPermissionModal } from './NotificationPermissionModal';

interface NotificationSettingsProps {
  userId?: string;
  onSave?: () => void;
}

export function NotificationSettings({ userId, onSave }: NotificationSettingsProps) {
  const {
    preferences,
    isLoading,
    isError,
    updatePreferences,
    isUpdating,
    updateError,
    requestPermission,
    permission,
    isSupported,
  } = useNotifications(userId);

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [localPreferences, setLocalPreferences] = useState({
    email_enabled: false,
    push_enabled: false,
    reminder_time: '18:00',
    reminder_days: [1, 2, 3, 4, 5], // Lundi à Vendredi
    reminder_frequency: 'twice_weekly' as 'daily' | 'twice_weekly' | 'weekly',
    timezone: 'Europe/Paris',
  });

  // Initialiser les préférences locales
  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        email_enabled: preferences.email_enabled,
        push_enabled: preferences.push_enabled,
        reminder_time: preferences.reminder_time,
        reminder_days: preferences.reminder_days,
        reminder_frequency: preferences.reminder_frequency,
        timezone: preferences.timezone,
      });
    }
  }, [preferences]);

  const handleToggle = (key: keyof typeof localPreferences, value: boolean) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleTimeChange = (time: string) => {
    setLocalPreferences(prev => ({ ...prev, reminder_time: time }));
  };

  const handleFrequencyChange = (frequency: 'daily' | 'twice_weekly' | 'weekly') => {
    setLocalPreferences(prev => ({ ...prev, reminder_frequency: frequency }));
  };

  const handleDayToggle = (day: number) => {
    setLocalPreferences(prev => ({
      ...prev,
      reminder_days: prev.reminder_days.includes(day)
        ? prev.reminder_days.filter(d => d !== day)
        : [...prev.reminder_days, day].sort()
    }));
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      setIsPermissionModalOpen(true);
      return;
    }
    handleToggle('push_enabled', enabled);
  };

  const handleSave = async () => {
    try {
      await updatePreferences(localPreferences);
      onSave?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const hasChanges = preferences ? (
    localPreferences.email_enabled !== preferences.email_enabled ||
    localPreferences.push_enabled !== preferences.push_enabled ||
    localPreferences.reminder_time !== preferences.reminder_time ||
    localPreferences.reminder_frequency !== preferences.reminder_frequency ||
    JSON.stringify(localPreferences.reminder_days.sort()) !== JSON.stringify(preferences.reminder_days.sort())
  ) : true;

  const dayNames = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

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
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
              Veuillez réessayer plus tard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configurez vos préférences de rappels et notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notifications Email */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="email-notifications">Notifications par email</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={localPreferences.email_enabled}
                onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Recevez des rappels et des résumés par email
            </p>
          </div>

          {/* Notifications Push */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="push-notifications">Notifications push</Label>
                {!isSupported && (
                  <Badge variant="secondary" className="text-xs">Non supporté</Badge>
                )}
                {isSupported && permission === 'granted' && (
                  <Badge variant="default" className="text-xs">Autorisé</Badge>
                )}
                {isSupported && permission === 'denied' && (
                  <Badge variant="destructive" className="text-xs">Bloqué</Badge>
                )}
              </div>
              <Switch
                id="push-notifications"
                checked={localPreferences.push_enabled}
                onCheckedChange={handlePushToggle}
                disabled={!isSupported || permission === 'denied'}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Recevez des rappels instantanés dans votre navigateur
            </p>
            {isSupported && permission === 'denied' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les notifications sont bloquées dans votre navigateur. 
                  Activez-les dans les paramètres pour recevoir des rappels.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Heure des rappels */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label>Heure des rappels</Label>
            </div>
            <Select value={localPreferences.reminder_time} onValueChange={handleTimeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Heure à laquelle vous souhaitez recevoir vos rappels quotidiens
            </p>
          </div>

          {/* Fréquence des rappels */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label>Fréquence des rappels</Label>
            </div>
            <Select 
              value={localPreferences.reminder_frequency} 
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="twice_weekly">Deux fois par semaine</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              À quelle fréquence souhaitez-vous recevoir des rappels ?
            </p>
          </div>

          {/* Jours de la semaine */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label>Jours de rappel</Label>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <Button
                  key={index}
                  variant={localPreferences.reminder_days.includes(index) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDayToggle(index)}
                  className="text-xs"
                >
                  {day.slice(0, 3)}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Sélectionnez les jours où vous souhaitez recevoir des rappels
            </p>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isUpdating}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>

          {updateError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erreur lors de la sauvegarde : {updateError.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <NotificationPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        userId={userId}
        onPermissionGranted={() => {
          handleToggle('push_enabled', true);
          setIsPermissionModalOpen(false);
        }}
      />
    </>
  );
}
