import { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { PageHeader } from '../components/ui/page-header';
import { PageContent } from '../components/ui/page-content';
import { PageTable } from '../components/ui/page-table';
import type { PageFilter } from '../components/ui/page-filters';
import type { PageAction } from '../components/ui/page-actions';
import type { Invoice } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export function InvoicesPage() {
  const { invoices, pagination, error, refetch } = useInvoices();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const filters: PageFilter[] = [
    {
      key: 'search',
      label: 'Recherche',
      type: 'text',
      placeholder: 'Numéro, patient...',
      value: searchTerm,
      onChange: value => setSearchTerm(value as string),
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: '', label: 'Tous' },
        { value: 'draft', label: 'Brouillon' },
        { value: 'sent', label: 'Envoyée' },
        { value: 'paid', label: 'Payée' },
        { value: 'overdue', label: 'En retard' },
      ],
      value: statusFilter,
      onChange: value => setStatusFilter(value as string),
    },
    {
      key: 'date',
      label: "Date d'échéance",
      type: 'date',
      value: dateFilter,
      onChange: value => setDateFilter(value as Date | undefined),
    },
  ];

  const actions: PageAction[] = [
    {
      label: 'Nouvelle facture',
      onClick: () => {
        // TODO: Ouvrir modal de création
        console.log('Créer une nouvelle facture');
      },
      variant: 'default',
    },
    {
      label: 'Exporter',
      onClick: () => {
        // TODO: Exporter les factures
        console.log('Exporter les factures');
      },
      variant: 'outline',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'sent':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Envoyée
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Payée
          </Badge>
        );
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Numéro',
      cell: ({
        row,
      }: {
        row: { getValue: (key: string) => unknown; original: Invoice };
      }) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">
            {String(row.getValue('invoiceNumber'))}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'patient',
      header: 'Patient',
      cell: ({
        row,
      }: {
        row: { getValue: (key: string) => unknown; original: Invoice };
      }) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Patient ID: {row.original.patientId}</span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Montant',
      cell: ({
        row,
      }: {
        row: { getValue: (key: string) => unknown; original: Invoice };
      }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {Number(row.getValue('amount')).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }: { row: { getValue: (key: string) => unknown } }) =>
        getStatusBadge(String(row.getValue('status'))),
    },
    {
      accessorKey: 'dueDate',
      header: 'Échéance',
      cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
        const date = new Date(String(row.getValue('dueDate')));
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{date.toLocaleDateString('fr-FR')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Créée le',
      cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
        const date = new Date(String(row.getValue('createdAt')));
        return date.toLocaleDateString('fr-FR');
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({
        row,
      }: {
        row: { getValue: (key: string) => unknown; original: Invoice };
      }) => {
        const invoice = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log('Voir', invoice.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log('Modifier', invoice.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log('Supprimer', invoice.id)}
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
            Erreur lors du chargement des factures
          </p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des factures"
        description="Créez et gérez vos factures et paiements"
        breadcrumbs={[{ title: 'Accueil', href: '/' }, { title: 'Factures' }]}
        action={{
          label: 'Nouvelle facture',
          onClick: () => console.log('Créer une nouvelle facture'),
        }}
      />

      <PageContent>
        <PageTable
          title="Liste des factures"
          description={`${pagination?.total || 0} facture(s) au total`}
          data={invoices}
          columns={columns}
          filters={filters}
          actions={actions}
          searchKey="search"
          searchPlaceholder="Rechercher une facture..."
          pageSize={10}
          showPagination
          showSearch
        />
      </PageContent>
    </div>
  );
}
