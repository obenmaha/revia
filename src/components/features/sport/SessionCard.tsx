import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SportSession {
  id: string;
  name: string;
  type: 'cardio' | 'musculation' | 'yoga' | 'autre';
  date: string;
  time: string;
  duration: number;
  status: 'draft' | 'in_progress' | 'completed';
  exercises: number;
  rpe?: number;
  painLevel?: number;
}

interface SessionCardProps {
  session: SportSession;
  onStart: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  variant?: 'upcoming' | 'completed' | 'draft';
  className?: string;
}

const SESSION_ICONS = {
  cardio: '🏃',
  musculation: '💪',
  yoga: '🧘',
  autre: '🏋️',
};

const SESSION_COLORS = {
  cardio: 'bg-blue-500',
  musculation: 'bg-red-500',
  yoga: 'bg-green-500',
  autre: 'bg-purple-500',
};

export function SessionCard({
  session,
  onStart,
  onEdit,
  onDuplicate,
  variant = 'upcoming',
  className,
}: SessionCardProps) {
  const getStatusColor = () => {
    switch (session.status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in_progress':
        return 'border-blue-500 bg-blue-50';
      case 'draft':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'completed':
        return '✅ Complétée';
      case 'in_progress':
        return '▶️ En cours';
      case 'draft':
        return '📝 Brouillon';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        getStatusColor(),
        className
      )}
      role="article"
      aria-labelledby={`session-title-${session.id}`}
      aria-describedby={`session-details-${session.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-lg',
                SESSION_COLORS[session.type]
              )}
              aria-hidden="true"
            >
              {SESSION_ICONS[session.type]}
            </div>
            <div>
              <CardTitle 
                id={`session-title-${session.id}`}
                className="text-lg"
              >
                {session.name}
              </CardTitle>
              <div 
                id={`session-details-${session.id}`}
                className="text-sm text-muted-foreground"
              >
                {formatDate(session.date)} • {session.time}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {session.duration} min
            </div>
            <div className="text-xs text-muted-foreground">
              {session.exercises} exercices
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground" aria-label={`Statut: ${getStatusText()}`}>
            {getStatusText()}
          </div>
          {session.status === 'completed' && session.rpe && (
            <div className="text-sm text-muted-foreground" aria-label={`RPE: ${session.rpe} sur 10`}>
              RPE: {session.rpe}/10
            </div>
          )}
        </div>

        <div className="flex space-x-2" role="group" aria-label="Actions disponibles">
          {variant === 'upcoming' && session.status === 'draft' && (
            <>
              <Button onClick={onStart} className="flex-1" size="sm">
                Continuer
              </Button>
              <Button 
                onClick={onEdit} 
                variant="outline" 
                size="sm"
                aria-label="Modifier la séance"
                title="Modifier la séance"
              >
                ✏️
              </Button>
            </>
          )}

          {variant === 'upcoming' && session.status !== 'completed' && (
            <>
              <Button onClick={onStart} className="flex-1" size="sm">
                {session.status === 'in_progress' ? 'Reprendre' : 'Commencer'}
              </Button>
              <Button 
                onClick={onEdit} 
                variant="outline" 
                size="sm"
                aria-label="Modifier la séance"
                title="Modifier la séance"
              >
                ✏️
              </Button>
              <Button 
                onClick={onDuplicate} 
                variant="outline" 
                size="sm"
                aria-label="Dupliquer la séance"
                title="Dupliquer la séance"
              >
                📋
              </Button>
            </>
          )}

          {variant === 'completed' && (
            <>
              <Button
                onClick={onEdit}
                variant="outline"
                className="flex-1"
                size="sm"
                aria-label="Voir les détails de la séance"
              >
                Voir les détails
              </Button>
              <Button 
                onClick={onDuplicate} 
                variant="outline" 
                size="sm"
                aria-label="Dupliquer la séance"
                title="Dupliquer la séance"
              >
                📋
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SessionListProps {
  sessions: SportSession[];
  onStart: (session: SportSession) => void;
  onEdit: (session: SportSession) => void;
  onDuplicate: (session: SportSession) => void;
  variant?: 'upcoming' | 'completed' | 'draft';
  className?: string;
}

export function SessionList({
  sessions,
  onStart,
  onEdit,
  onDuplicate,
  variant = 'upcoming',
  className,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className={cn('text-center py-8', className)} role="status" aria-live="polite">
        <div className="text-muted-foreground text-lg mb-2">
          {variant === 'upcoming' && 'Aucune séance programmée'}
          {variant === 'completed' && 'Aucune séance terminée'}
          {variant === 'draft' && 'Aucun brouillon'}
        </div>
        <div className="text-muted-foreground/70 text-sm">
          {variant === 'upcoming' &&
            'Créez votre première séance pour commencer'}
          {variant === 'completed' && 'Vos séances terminées apparaîtront ici'}
          {variant === 'draft' && 'Vos brouillons apparaîtront ici'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)} role="list" aria-label={`Liste des séances ${variant === 'upcoming' ? 'à venir' : variant === 'completed' ? 'terminées' : 'brouillons'}`}>
      {sessions.map((session, index) => (
        <div key={session.id} role="listitem" aria-posinset={index + 1} aria-setsize={sessions.length}>
          <SessionCard
            session={session}
            onStart={() => onStart(session)}
            onEdit={() => onEdit(session)}
            onDuplicate={() => onDuplicate(session)}
            variant={variant}
          />
        </div>
      ))}
    </div>
  );
}
