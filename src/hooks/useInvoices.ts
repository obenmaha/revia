import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '../services/invoicesService';
import { queryKeys } from '../lib/query-client';
import type { Invoice, PaginatedResponse } from '../types';

export function useInvoices(
  params: {
    page?: number;
    limit?: number;
    patientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) {
  const queryClient = useQueryClient();

  // Query pour la liste des factures
  const {
    data: invoicesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.invoicesByPractitioner('current'),
    queryFn: () => invoicesService.getInvoices(params),
    keepPreviousData: true,
  });

  // Mutation de création de facture
  const createInvoiceMutation = useMutation({
    mutationFn: invoicesService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoicesByPractitioner('current'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.statsByPractitioner('current'),
      });
    },
  });

  // Mutation de mise à jour de facture
  const updateInvoiceMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<
        Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>
      >;
    }) => invoicesService.updateInvoice(id, data),
    onSuccess: updatedInvoice => {
      queryClient.setQueryData(
        queryKeys.invoice(updatedInvoice.id),
        updatedInvoice
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoicesByPractitioner('current'),
      });
    },
  });

  // Mutation de suppression de facture
  const deleteInvoiceMutation = useMutation({
    mutationFn: invoicesService.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoicesByPractitioner('current'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.statsByPractitioner('current'),
      });
    },
  });

  // Fonctions d'action
  const createInvoice = async (
    invoiceData: Omit<
      Invoice,
      'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber' | 'status'
    >
  ) => {
    return createInvoiceMutation.mutateAsync(invoiceData);
  };

  const updateInvoice = async (
    id: string,
    invoiceData: Partial<
      Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>
    >
  ) => {
    return updateInvoiceMutation.mutateAsync({ id, data: invoiceData });
  };

  const deleteInvoice = async (id: string) => {
    return deleteInvoiceMutation.mutateAsync(id);
  };

  return {
    // Données
    invoices: invoicesData?.data || [],
    pagination: invoicesData?.pagination,

    // État
    isLoading,
    error,

    // Actions
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refetch,

    // États des mutations
    isCreating: createInvoiceMutation.isPending,
    isUpdating: updateInvoiceMutation.isPending,
    isDeleting: deleteInvoiceMutation.isPending,

    // Erreurs
    createError: createInvoiceMutation.error,
    updateError: updateInvoiceMutation.error,
    deleteError: deleteInvoiceMutation.error,
  };
}

export function useInvoice(id: string) {
  const queryClient = useQueryClient();

  // Query pour une facture spécifique
  const {
    data: invoice,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: () => invoicesService.getInvoiceById(id),
    enabled: !!id,
  });

  // Mutation de mise à jour de facture
  const updateInvoiceMutation = useMutation({
    mutationFn: (
      data: Partial<
        Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>
      >
    ) => invoicesService.updateInvoice(id, data),
    onSuccess: updatedInvoice => {
      queryClient.setQueryData(queryKeys.invoice(id), updatedInvoice);
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoicesByPractitioner('current'),
      });
    },
  });

  // Fonctions d'action
  const updateInvoice = async (
    invoiceData: Partial<
      Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>
    >
  ) => {
    return updateInvoiceMutation.mutateAsync(invoiceData);
  };

  return {
    // Données
    invoice,

    // État
    isLoading,
    error,

    // Actions
    updateInvoice,
    refetch,

    // États des mutations
    isUpdating: updateInvoiceMutation.isPending,

    // Erreurs
    updateError: updateInvoiceMutation.error,
  };
}
