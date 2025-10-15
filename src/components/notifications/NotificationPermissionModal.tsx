// Composant modal pour demander les permissions de notifications - FR9
import { useState } from 'react';
import { Bell, X, Settings, Smartphone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onPermissionGranted?: () => void;
}

export function NotificationPermissionModal({
  isOpen,
  onClose,
  userId,
  onPermissionGranted,
}: NotificationPermissionModalProps) {
  const { requestPermission, permission, isSupported, isRequestingPermission } = useNotifications(userId);
  const [step, setStep] = useState<'intro' | 'permission' | 'success' | 'error'>('intro');

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setStep('permission');
    const granted = await requestPermission();
    
    if (granted) {
      setStep('success');
      onPermissionGranted?.();
    } else {
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('intro');
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Activez les notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez des rappels pour vos séances d'entraînement
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Rappels de séances</p>
                  <p className="text-xs text-muted-foreground">
                    Soyez notifié avant vos séances programmées
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Résumés par email</p>
                  <p className="text-xs text-muted-foreground">
                    Recevez un récapitulatif de vos performances
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Personnalisable</p>
                  <p className="text-xs text-muted-foreground">
                    Configurez vos préférences à tout moment
                  </p>
                </div>
              </div>
            </div>

            {!isSupported && (
              <Alert>
                <AlertDescription>
                  Votre navigateur ne supporte pas les notifications. 
                  Vous pourrez toujours recevoir des rappels par email.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Plus tard
              </Button>
              <Button 
                onClick={handleRequestPermission} 
                disabled={!isSupported || isRequestingPermission}
                className="flex-1"
              >
                {isRequestingPermission ? 'Demande...' : 'Activer'}
              </Button>
            </div>
          </CardContent>
        );

      case 'permission':
        return (
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <h3 className="font-semibold">Demande de permission</h3>
              <p className="text-sm text-muted-foreground">
                Votre navigateur va vous demander l'autorisation d'envoyer des notifications.
                Cliquez sur "Autoriser" pour continuer.
              </p>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Conseil :</strong> Si vous ne voyez pas la demande, 
                vérifiez que les notifications ne sont pas bloquées dans les paramètres de votre navigateur.
              </AlertDescription>
            </Alert>

            <Button variant="outline" onClick={handleClose} className="w-full">
              Annuler
            </Button>
          </CardContent>
        );

      case 'success':
        return (
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-800">Notifications activées !</h3>
              <p className="text-sm text-muted-foreground">
                Vous recevrez maintenant des rappels pour vos séances d'entraînement.
              </p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Prochaine étape :</strong> Configurez vos préférences de notifications 
                dans les paramètres de votre profil pour personnaliser vos rappels.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Parfait !
            </Button>
          </CardContent>
        );

      case 'error':
        return (
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-red-800">Notifications refusées</h3>
              <p className="text-sm text-muted-foreground">
                Vous ne recevrez pas de rappels push, mais vous pouvez toujours 
                recevoir des notifications par email.
              </p>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Pour activer plus tard :</strong> Allez dans les paramètres de votre navigateur 
                et autorisez les notifications pour ce site.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('intro')} className="flex-1">
                Réessayer
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Continuer
              </Button>
            </div>
          </CardContent>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>
                {step === 'intro' && 'Activez les rappels pour vos séances'}
                {step === 'permission' && 'Demande en cours...'}
                {step === 'success' && 'Configuration terminée'}
                {step === 'error' && 'Configuration échouée'}
              </CardDescription>
            </div>
            {step !== 'permission' && (
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        {renderContent()}
      </Card>
    </div>
  );
}

// Composant pour afficher le statut des permissions
export function NotificationStatus({ userId }: { userId?: string }) {
  const { permission, isSupported, preferences } = useNotifications(userId);

  if (!isSupported) {
    return (
      <Badge variant="secondary" className="gap-1">
        <X className="h-3 w-3" />
        Non supporté
      </Badge>
    );
  }

  if (permission === 'granted' && preferences?.push_enabled) {
    return (
      <Badge variant="default" className="gap-1">
        <Bell className="h-3 w-3" />
        Activé
      </Badge>
    );
  }

  if (permission === 'denied') {
    return (
      <Badge variant="destructive" className="gap-1">
        <X className="h-3 w-3" />
        Bloqué
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Bell className="h-3 w-3" />
      En attente
    </Badge>
  );
}
