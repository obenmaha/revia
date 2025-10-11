import React from 'react';
import { useSessions } from '../hooks/useSessions';
import { PageHeader } from '../components/ui/page-header';
import { PageContent } from '../components/ui/page-content';
import { PageTable } from '../components/ui/page-table';
import { PageFilters, PageFilter } from '../components/ui/page-filters';
import { PageActions, PageAction } from '../components/ui/page-actions';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export function SessionsPage() {
  const {
    sessions,
    pagination,
    isLoading,
    error,
    createSession,
    updateSession,
    deleteSession,
    refetch,
  } = useSessions();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>();

  const filters: PageFilter[] = [
    {
      key: 'search',
      label: 'Recherche',
      type: 'text',
      placeholder: 'Patient, notes...',
      value: searchTerm,
      onChange: setSearchTerm,
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: '', label: 'Tous' },
        { value: 'scheduled', label: 'Planifiée' },
        { value: 'completed', label: 'Terminée' },
        { value: 'cancelled', label: 'Annulée' },
        { value: 'no_show', label: 'Absent' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: 'date',
      label: 'Date de séance',
      type: 'date',
      value: dateFilter,
      onChange: setDateFilter,
    },
  ];

  const actions: PageAction[] = [
    {
      label: 'Nouvelle séance',
      onClick: () => {
        // TODO: Ouvrir modal de création
        console.log('Créer une nouvelle séance');
      },
      variant: 'default',
    },
    {
      label: 'Exporter',
      onClick: () => {
        // TODO: Exporter les séances
        console.log('Exporter les séances');
      },
      variant: 'outline',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Planifiée</Badge>;
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Terminée
          </Badge>
        );
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      case 'no_show':
        return <Badge variant="secondary">Absent</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: 'patient',
      header: 'Patient',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>
            {row.original.patient?.firstName} {row.original.patient?.lastName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Date et heure',
      cell: ({ row }: any) => {
        const date = new Date(row.getValue('scheduledAt'));
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {date.toLocaleDateString('fr-FR')} à{' '}
              {date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'duration',
      header: 'Durée',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('duration')} min</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }: any) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }: any) => {
        const notes = row.getValue('notes');
        return notes ? (
          <span className="truncate max-w-[200px]">{notes}</span>
        ) : (
          <span className="text-muted-foreground">Aucune note</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const session = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log('Voir', session.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log('Modifier', session.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log('Supprimer', session.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Erreur lors du chargement des séances
          </p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des séances"
        description="Planifiez et gérez vos séances avec les patients"
        breadcrumbs={[{ title: 'Accueil', href: '/' }, { title: 'Séances' }]}
        action={{
          label: 'Nouvelle séance',
          onClick: () => console.log('Créer une nouvelle séance'),
        }}
      />

      <PageContent>
        <PageTable
          title="Liste des séances"
          description={`${pagination?.total || 0} séance(s) au total`}
          data={sessions}
          columns={columns}
          filters={filters}
          actions={actions}
          searchKey="search"
          searchPlaceholder="Rechercher une séance..."
          pageSize={10}
          showPagination
          showSearch
        />
      </PageContent>
    </div>
  );
}
