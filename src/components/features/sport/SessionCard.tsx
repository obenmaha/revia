
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
        'transition-all duration-200 hover:shadow-md',
        getStatusColor(),
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-lg',
                SESSION_COLORS[session.type]
              )}
            >
              {SESSION_ICONS[session.type]}
            </div>
            <div>
              <CardTitle className="text-lg">{session.name}</CardTitle>
              <div className="text-sm text-gray-600">
                {formatDate(session.date)} • {session.time}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              {session.duration} min
            </div>
            <div className="text-xs text-gray-500">
              {session.exercises} exercices
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">{getStatusText()}</div>
          {session.status === 'completed' && session.rpe && (
            <div className="text-sm text-gray-600">RPE: {session.rpe}/10</div>
          )}
        </div>

        <div className="flex space-x-2">
          {variant === 'upcoming' && session.status === 'draft' && (
            <>
              <Button onClick={onStart} className="flex-1" size="sm">
                Continuer
              </Button>
              <Button onClick={onEdit} variant="outline" size="sm">
                ✏️
              </Button>
            </>
          )}

          {variant === 'upcoming' && session.status !== 'completed' && (
            <>
              <Button onClick={onStart} className="flex-1" size="sm">
                {session.status === 'in_progress' ? 'Reprendre' : 'Commencer'}
              </Button>
              <Button onClick={onEdit} variant="outline" size="sm">
                ✏️
              </Button>
              <Button onClick={onDuplicate} variant="outline" size="sm">
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
              >
                Voir les détails
              </Button>
              <Button onClick={onDuplicate} variant="outline" size="sm">
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
      <div className={cn('text-center py-8', className)}>
        <div className="text-gray-500 text-lg mb-2">
          {variant === 'upcoming' && 'Aucune séance programmée'}
          {variant === 'completed' && 'Aucune séance terminée'}
          {variant === 'draft' && 'Aucun brouillon'}
        </div>
        <div className="text-gray-400 text-sm">
          {variant === 'upcoming' &&
            'Créez votre première séance pour commencer'}
          {variant === 'completed' && 'Vos séances terminées apparaîtront ici'}
          {variant === 'draft' && 'Vos brouillons apparaîtront ici'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {sessions.map(session => (
        <SessionCard
          key={session.id}
          session={session}
          onStart={() => onStart(session)}
          onEdit={() => onEdit(session)}
          onDuplicate={() => onDuplicate(session)}
          variant={variant}
        />
      ))}
    </div>
  );
}
