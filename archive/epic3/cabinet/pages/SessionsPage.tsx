// Page de gestion des sessions - Story 2.2
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Calendar,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { useSessions, useSessionStats } from '../hooks/useSessions';
import { SessionForm } from '../components/features/SessionForm';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  SESSION_TYPE_OPTIONS,
  CreateSessionInput,
  SessionStatus,
  SessionType,
} from '../../types/session';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Interface pour les props
interface SessionsPageProps {
  showCreateForm?: boolean;
}

// Composant principal de la page des sessions
export function SessionsPage({ showCreateForm = false }: SessionsPageProps) {
  const [showForm, setShowForm] = useState(showCreateForm);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Hooks pour les données
  const { sessions, isLoading, isError, error, createSession, refetch } =
    useSessions({
      search: searchQuery || undefined,
      type: typeFilter !== 'all' ? (typeFilter as SessionType) : undefined,
      status:
        statusFilter !== 'all' ? (statusFilter as SessionStatus) : undefined,
    });

  const { stats, isLoading: statsLoading } = useSessionStats();

  // Gestion de la création de session
  const handleCreateSession = async (sessionData: CreateSessionInput) => {
    try {
      await createSession(sessionData);
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  // Gestion de l'édition de session
  const handleEditSession = (sessionId: string) => {
    setEditingSession(sessionId);
  };

  // Gestion de la suppression de session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      // TODO: Implémenter la suppression
      console.log('Suppression de la session:', sessionId);
      setShowDeleteDialog(null);
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Gestion du changement de statut
  const handleStatusChange = async (
    sessionId: string,
    newStatus: SessionStatus
  ) => {
    try {
      // TODO: Implémenter le changement de statut
      console.log('Changement de statut:', sessionId, newStatus);
      refetch();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  // Formatage de la date
  const formatDate = (date: Date) => {
    return format(date, 'PPP', { locale: fr });
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type: string) => {
    const option = SESSION_TYPE_OPTIONS.find(opt => opt.value === type);
    return (
      (option?.icon === 'HeartPulse' && '❤️') ||
      (option?.icon === 'Trophy' && '🏆') ||
      (option?.icon === 'Dumbbell' && '🏋️') ||
      '⋯'
    );
  };

  // Composant de statistiques
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ce mois
              </p>
              <p className="text-2xl font-bold">{stats.sessionsThisMonth}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                En cours
              </p>
              <p className="text-2xl font-bold">{stats.inProgressSessions}</p>
            </div>
            <Play className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Brouillons
              </p>
              <p className="text-2xl font-bold">{stats.draftSessions}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Composant de filtre
  const FilterBar = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une session..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Type d'activité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {SESSION_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon(option.value)}</span>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  // Composant de liste des sessions
  const SessionsList = () => (
    <div className="space-y-4">
      {sessions.map(session => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{session.name}</h3>
                    <Badge className={getStatusColor(session.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(session.status)}
                        <span className="capitalize">{session.status}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{getTypeIcon(session.type)}</span>
                      <span className="capitalize">
                        {
                          SESSION_TYPE_OPTIONS.find(
                            opt => opt.value === session.type
                          )?.label
                        }
                      </span>
                    </div>
                  </div>

                  {session.objectives && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {session.objectives}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditSession(session.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    {session.status === 'draft' && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(session.id, 'in_progress')
                        }
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Démarrer
                      </DropdownMenuItem>
                    )}
                    {session.status === 'in_progress' && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(session.id, 'completed')
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Terminer
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(session.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  // États de chargement et d'erreur
  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Chargement des sessions...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Erreur lors du chargement des sessions'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mode formulaire
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            ← Retour aux sessions
          </Button>
          <h1 className="text-2xl font-bold">Nouvelle session</h1>
        </div>

        <SessionForm
          onSave={handleCreateSession}
          onCancel={() => setShowForm(false)}
          showHeader={false}
        />
      </div>
    );
  }

  // Mode édition
  if (editingSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setEditingSession(null)}>
            ← Retour aux sessions
          </Button>
          <h1 className="text-2xl font-bold">Modifier la session</h1>
        </div>

        <SessionForm
          sessionId={editingSession}
          onSave={() => {
            setEditingSession(null);
            refetch();
          }}
          onCancel={() => setEditingSession(null)}
          showHeader={false}
        />
      </div>
    );
  }

  // Mode liste
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes sessions</h1>
          <p className="text-muted-foreground">
            Gérez vos sessions d'entraînement et de rééducation
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle session
        </Button>
      </div>

      {/* Statistiques */}
      <StatsCards />

      {/* Filtres */}
      <FilterBar />

      {/* Liste des sessions */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucune session trouvée
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucune session ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre première session.'}
            </p>
            {!searchQuery && typeFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une session
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <SessionsList />
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette session ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                showDeleteDialog && handleDeleteSession(showDeleteDialog)
              }
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export par défaut pour la compatibilité avec React Router
export default SessionsPage;
