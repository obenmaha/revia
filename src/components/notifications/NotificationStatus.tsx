// Composant de statut des notifications pour l'en-tête - FR9
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationStatusProps {
  userId?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function NotificationStatus({ 
  userId, 
  showLabel = false, 
  size = 'md' 
}: NotificationStatusProps) {
  const { 
    preferences, 
    permission, 
    isSupported, 
    isLoading 
  } = useNotifications(userId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse w-4 h-4 bg-gray-200 rounded"></div>
        {showLabel && <span className="text-sm text-muted-foreground">Chargement...</span>}
      </div>
    );
  }

  const isEnabled = preferences?.push_enabled && permission === 'granted';
  const isBlocked = isSupported && permission === 'denied';
  const isUnsupported = !isSupported;

  const getIcon = () => {
    if (isUnsupported) return <BellOff className="h-4 w-4 text-gray-400" />;
    if (isBlocked) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (isEnabled) return <Bell className="h-4 w-4 text-green-600" />;
    return <BellOff className="h-4 w-4 text-gray-400" />;
  };

  const getStatus = () => {
    if (isUnsupported) return 'Non supporté';
    if (isBlocked) return 'Bloqué';
    if (isEnabled) return 'Activé';
    return 'Désactivé';
  };

  const getTooltip = () => {
    if (isUnsupported) return 'Votre navigateur ne supporte pas les notifications';
    if (isBlocked) return 'Les notifications sont bloquées dans votre navigateur';
    if (isEnabled) return 'Notifications activées';
    return 'Notifications désactivées';
  };

  const getVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isUnsupported) return 'secondary';
    if (isBlocked) return 'destructive';
    if (isEnabled) return 'default';
    return 'outline';
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={`${iconSize} ${isEnabled ? 'text-green-600' : isBlocked ? 'text-red-500' : 'text-gray-400'}`}>
              {getIcon()}
            </div>
            {showLabel && (
              <span className="text-sm text-muted-foreground">
                {getStatus()}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltip()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Composant compact pour l'en-tête
export function NotificationStatusCompact({ userId }: { userId?: string }) {
  const { preferences, permission, isSupported } = useNotifications(userId);

  const isEnabled = preferences?.push_enabled && permission === 'granted';
  const isBlocked = isSupported && permission === 'denied';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative p-2"
      title={isEnabled ? 'Notifications activées' : 'Notifications désactivées'}
    >
      <Bell className={`h-4 w-4 ${isEnabled ? 'text-green-600' : isBlocked ? 'text-red-500' : 'text-gray-400'}`} />
      {isEnabled && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
      )}
    </Button>
  );
}

// Composant de badge pour les paramètres
export function NotificationBadge({ userId }: { userId?: string }) {
  const { preferences, permission, isSupported } = useNotifications(userId);

  const isEnabled = preferences?.push_enabled && permission === 'granted';
  const isBlocked = isSupported && permission === 'denied';
  const isUnsupported = !isSupported;

  const getVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isUnsupported) return 'secondary';
    if (isBlocked) return 'destructive';
    if (isEnabled) return 'default';
    return 'outline';
  };

  const getText = () => {
    if (isUnsupported) return 'Non supporté';
    if (isBlocked) return 'Bloqué';
    if (isEnabled) return 'Activé';
    return 'Désactivé';
  };

  return (
    <Badge variant={getVariant()} className="gap-1">
      <Bell className="h-3 w-3" />
      {getText()}
    </Badge>
  );
}
