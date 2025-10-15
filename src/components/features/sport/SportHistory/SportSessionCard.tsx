// Carte de séance sport - Story 1.5
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Activity, 
  Target, 
  FileText, 
  Edit, 
  Trash2, 
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { SportSession, SportExercise, SportSessionType, SportSessionStatus } from '@/types/sport';

interface SportSessionWithExercises extends SportSession {
  sport_exercises: SportExercise[];
}

interface SportSessionCardProps {
  session: SportSessionWithExercises;
  onEdit?: (session: SportSession) => void;
  onDelete?: (session: SportSession) => void;
  onStart?: (session: SportSession) => void;
  onComplete?: (session: SportSession) => void;
}

const SESSION_TYPE_CONFIG: Record<SportSessionType, { label: string; color: string; icon: string }> = {
  cardio: { label: 'Cardio', color: 'bg-red-100 text-red-800', icon: '❤️' },
  musculation: { label: 'Musculation', color: 'bg-blue-100 text-blue-800', icon: '💪' },
  flexibility: { label: 'Flexibilité', color: 'bg-green-100 text-green-800', icon: '🧘' },
  other: { label: 'Autre', color: 'bg-gray-100 text-gray-800', icon: '🏃' },
};

const SESSION_STATUS_CONFIG: Record<SportSessionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: <FileText className="h-4 w-4" /> },
  in_progress: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: <Play className="h-4 w-4" /> },
  completed: { label: 'Terminée', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
};

export function SportSessionCard({
  session,
  onEdit,
  onDelete,
  onStart,
  onComplete,
}: SportSessionCardProps) {
  const typeConfig = SESSION_TYPE_CONFIG[session.type];
  const statusConfig = SESSION_STATUS_CONFIG[session.status];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: fr });
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const getRPEColor = (rpe?: number) => {
    if (!rpe) return 'text-gray-500';
    if (rpe <= 3) return 'text-green-600';
    if (rpe <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPainColor = (pain?: number) => {
    if (!pain) return 'text-gray-500';
    if (pain <= 3) return 'text-green-600';
    if (pain <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{typeConfig.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(session.date)}</span>
                <span>•</span>
                <Clock className="h-4 w-4" />
                <span>{formatTime(session.date)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={typeConfig.color}>
              {typeConfig.label}
            </Badge>
            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(session.duration_minutes)}
            </div>
            <div className="text-sm text-gray-500">Durée</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {session.sport_exercises.length}
            </div>
            <div className="text-sm text-gray-500">Exercices</div>
          </div>
          {session.rpe_score && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRPEColor(session.rpe_score)}`}>
                {session.rpe_score}/10
              </div>
              <div className="text-sm text-gray-500">RPE</div>
            </div>
          )}
          {session.pain_level && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${getPainColor(session.pain_level)}`}>
                {session.pain_level}/10
              </div>
              <div className="text-sm text-gray-500">Douleur</div>
            </div>
          )}
        </div>

        {/* Objectifs et notes */}
        {(session.objectives || session.notes) && (
          <div className="space-y-2">
            {session.objectives && (
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Objectifs</div>
                  <div className="text-sm text-gray-600">{session.objectives}</div>
                </div>
              </div>
            )}
            {session.notes && (
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Notes</div>
                  <div className="text-sm text-gray-600">{session.notes}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Liste des exercices */}
        {session.sport_exercises.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Exercices</div>
            <div className="space-y-1">
              {session.sport_exercises.slice(0, 3).map((exercise, index) => (
                <div key={exercise.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span className="text-gray-900">{exercise.name}</span>
                    {exercise.sets && exercise.reps && (
                      <span className="text-gray-500">
                        ({exercise.sets} × {exercise.reps})
                      </span>
                    )}
                    {exercise.weight_kg && (
                      <span className="text-gray-500">
                        {exercise.weight_kg}kg
                      </span>
                    )}
                  </div>
                  {exercise.duration_seconds && (
                    <span className="text-gray-500">
                      {Math.floor(exercise.duration_seconds / 60)}min
                    </span>
                  )}
                </div>
              ))}
              {session.sport_exercises.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{session.sport_exercises.length - 3} autres exercices
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            {session.status === 'draft' && onStart && (
              <Button
                size="sm"
                onClick={() => onStart(session)}
                className="flex items-center space-x-1"
              >
                <Play className="h-4 w-4" />
                <span>Commencer</span>
              </Button>
            )}
            {session.status === 'in_progress' && onComplete && (
              <Button
                size="sm"
                onClick={() => onComplete(session)}
                className="flex items-center space-x-1"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Terminer</span>
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(session)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(session)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
