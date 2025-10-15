import React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { PageEmpty } from '@/components/ui/page-empty';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus,
  History,
  TrendingUp,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SportHistoryEmptyStateProps {
  type: 'no-sessions' | 'no-results' | 'loading' | 'error';
  searchQuery?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreateSession?: () => void;
  className?: string;
}

export function SportHistoryEmptyState({
  type,
  searchQuery,
  hasFilters = false,
  onClearFilters,
  onCreateSession,
  className,
}: SportHistoryEmptyStateProps) {
  if (type === 'loading') {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <PageEmpty
        icon={<History className="h-12 w-12 text-destructive" />}
        title="Erreur de chargement"
        description="Impossible de charger l'historique des séances. Veuillez réessayer."
        action={{
          label: 'Réessayer',
          onClick: () => window.location.reload(),
        }}
        className={className}
      />
    );
  }

  if (type === 'no-results') {
    return (
      <PageEmpty
        icon={<Search className="h-12 w-12 text-muted-foreground" />}
        title="Aucune séance trouvée"
        description={
          searchQuery
            ? `Aucune séance ne correspond à "${searchQuery}"`
            : hasFilters
            ? 'Aucune séance ne correspond à vos filtres'
            : 'Aucune séance trouvée'
        }
        action={
          hasFilters
            ? {
                label: 'Effacer les filtres',
                onClick: onClearFilters,
              }
            : undefined
        }
        className={className}
      />
    );
  }

  // type === 'no-sessions'
  return (
    <PageEmpty
      icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
      title="Aucune séance dans l'historique"
      description="Commencez votre parcours sportif en créant votre première séance d'entraînement."
      action={{
        label: 'Créer une séance',
        onClick: onCreateSession,
      }}
      className={className}
    />
  );
}

// Composant pour les statistiques vides
export function SportHistoryStatsEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn('text-center py-8', className)}>
      <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Aucune statistique disponible
      </h3>
      <p className="text-sm text-muted-foreground">
        Les statistiques apparaîtront après vos premières séances
      </p>
    </div>
  );
}

// Composant pour les objectifs vides
export function SportHistoryGoalsEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn('text-center py-8', className)}>
      <Target className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Aucun objectif défini
      </h3>
      <p className="text-sm text-muted-foreground">
        Définissez vos objectifs pour suivre votre progression
      </p>
    </div>
  );
}
