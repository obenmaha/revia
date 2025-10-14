// Composant principal d'historique des sessions - Story 2.5
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Filter, RefreshCw, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSessionsPaginated } from '@/hooks/useSessions';
import type { Session, SessionFilters as SessionFiltersType } from '@/types/session';
import SessionFilters from './SessionFilters';
import SessionHistoryItem from './SessionHistoryItem';

interface SessionHistoryProps {
  onViewSession?: (session: Session) => void;
  onEditSession?: (session: Session) => void;
  onDeleteSession?: (session: Session) => void;
  onCreateSession?: () => void;
  className?: string;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({
  onViewSession,
  onEditSession,
  onDeleteSession,
  onCreateSession,
  className = '',
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SessionFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [_savedFilters, setSavedFilters] = useState<SessionFiltersType>({});

  const pageSize = 10;

  // Utiliser la pagination pour les performances
  const { sessions, pagination, isLoading, isError, error, refetch } =
    useSessionsPaginated(currentPage, pageSize, filters);

  // Grouper les sessions par date
  const groupedSessions = groupSessionsByDate(sessions);

  // Sauvegarder les filtres dans le localStorage
  useEffect(() => {
    const saved = localStorage.getItem('session-filters');
    if (saved) {
      try {
        const parsedFilters = JSON.parse(saved);
        setSavedFilters(parsedFilters);
        setFilters(parsedFilters);
      } catch {
        console.error('Erreur lors du chargement des filtres sauvegardés');
      }
    }
  }, []);

  const handleFiltersChange = (newFilters: SessionFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset à la première page
  };

  const handleSaveFilters = (filtersToSave: SessionFiltersType) => {
    setSavedFilters(filtersToSave);
    localStorage.setItem('session-filters', JSON.stringify(filtersToSave));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll vers le haut de la liste
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Actualisation',
      description: "L'historique a été actualisé.",
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== undefined && value !== null && value !== ''
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (isError) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Erreur de chargement</h3>
                <p className="text-sm text-red-500 mt-1">
                  {error || "Impossible de charger l'historique des sessions."}
                </p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
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
      {/* En-tête avec actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Historique des sessions
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {pagination?.total || 0} session
                {(pagination?.total || 0) > 1 ? 's' : ''} au total
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-blue-600">
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Actualiser
              </Button>
              {onCreateSession && (
                <Button
                  onClick={onCreateSession}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle session
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SessionFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSaveFilters={handleSaveFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des sessions */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Aucune session trouvée
                </h3>
                <p className="text-sm mb-4">
                  {activeFiltersCount > 0
                    ? 'Aucune session ne correspond à vos filtres.'
                    : 'Commencez par créer votre première session.'}
                </p>
                {activeFiltersCount > 0 ? (
                  <Button variant="outline" onClick={() => setFilters({})}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réinitialiser les filtres
                  </Button>
                ) : onCreateSession ? (
                  <Button
                    onClick={onCreateSession}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une session
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Sessions groupées par date */}
          {Object.entries(groupedSessions).map(([date, sessions]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Calendar className="w-5 h-5" />
                <span>{date}</span>
                <Badge variant="outline" className="text-sm">
                  {sessions.length} session{sessions.length > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="space-y-3">
                {sessions.map(session => (
                  <SessionHistoryItem
                    key={session.id}
                    session={session}
                    onView={onViewSession}
                    onEdit={onEditSession}
                    onDelete={onDeleteSession}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Fonction pour grouper les sessions par date
function groupSessionsByDate(sessions: Session[]): Record<string, Session[]> {
  const grouped: Record<string, Session[]> = {};

  sessions.forEach(session => {
    const date = new Date(session.date);
    const dateKey = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(session);
  });

  // Trier les sessions dans chaque groupe par date (plus récent en premier)
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  return grouped;
}

export default SessionHistory;
