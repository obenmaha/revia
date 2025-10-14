// Composant principal de détails de session - Story 2.6
import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSessions';
import { useExercises, useExerciseStats } from '@/hooks/useExercises';
import type { Session } from '@/types/session';
import { SessionBreadcrumb } from '@/components/ui/breadcrumb';
import SessionStatistics from './SessionStatistics';
import SessionNotes from './SessionNotes';
import ExerciseList from './ExerciseList';

interface SessionDetailsProps {
  sessionId: string;
  onBack?: () => void;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
  className?: string;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({
  sessionId,
  onBack,
  onEdit,
  onDelete: _onDelete,
  className = '',
}) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    session,
    isLoading: sessionLoading,
    isError: sessionError,
    error: sessionErrorMsg,
    updateSession,
    deleteSession,
  } = useSession(sessionId);

  const { exercises, isLoading: exercisesLoading } = useExercises(sessionId);

  const { stats, isLoading: statsLoading } = useExerciseStats(sessionId);

  const isLoading = sessionLoading || exercisesLoading || statsLoading;

  const handleUpdateNotes = async (notes: string) => {
    if (!session) return;

    try {
      await updateSession({ notes });
    } catch {
      throw new Error('Impossible de sauvegarder les notes');
    }
  };

  const handleDelete = async () => {
    if (!session) return;

    setIsDeleting(true);
    try {
      await deleteSession();
      toast({
        title: 'Session supprimée',
        description: 'La session a été supprimée avec succès.',
      });
      onBack?.();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la session. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'in_progress':
        return 'En cours';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rehabilitation':
        return 'bg-blue-100 text-blue-800';
      case 'sport':
        return 'bg-green-100 text-green-800';
      case 'fitness':
        return 'bg-orange-100 text-orange-800';
      case 'other':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rehabilitation':
        return 'Rééducation';
      case 'sport':
        return 'Sport';
      case 'fitness':
        return 'Fitness';
      case 'other':
        return 'Autre';
      default:
        return type;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Chargement des détails de la session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Erreur de chargement</h3>
                <p className="text-sm text-red-500 mt-1">
                  {sessionErrorMsg ||
                    'Impossible de charger les détails de la session.'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Breadcrumb */}
      <SessionBreadcrumb
        sessionName={session.name}
        onBackToHistory={onBack}
        onBackToHome={onBack}
      />

      {/* En-tête de session */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(session.status)} text-sm`}
                  >
                    {getStatusLabel(session.status)}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${getTypeColor(session.type)} text-sm`}
                  >
                    {getTypeLabel(session.type)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(session.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>
                    {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(session)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques de session */}
      <SessionStatistics stats={stats} sessionDate={session.date} />

      {/* Exercices de la session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Exercices de la session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseList
            sessionId={sessionId}
            onEdit={() => {}} // Désactiver l'édition en mode lecture
            onDelete={() => {}} // Désactiver la suppression en mode lecture
          />
        </CardContent>
      </Card>

      {/* Notes de session */}
      <SessionNotes
        session={session}
        onUpdateNotes={handleUpdateNotes}
        isEditable={session.status !== 'completed'}
      />
    </div>
  );
};

export default SessionDetails;
