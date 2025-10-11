// Hook pour la gestion d'un patient - Story 2.1
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient, CreatePatientInput } from '../types/patient';
import {
  PatientsService,
  PatientServiceError,
} from '../services/patientsService';

// Interface pour le retour du hook
export interface UsePatientReturn {
  patient: Patient | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  updatePatient: (updates: Partial<CreatePatientInput>) => Promise<void>;
  deletePatient: () => Promise<void>;
  refetch: () => void;
}

// Hook pour gérer un patient spécifique
export function usePatient(patientId: string | null): UsePatientReturn {
  const queryClient = useQueryClient();

  // Query pour récupérer le patient
  const {
    data: patient,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => {
      if (!patientId) return null;
      return PatientsService.getPatient(patientId);
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof PatientServiceError && error.code === 'AUTH_ERROR') {
        return false; // Ne pas retry en cas d'erreur d'authentification
      }
      return failureCount < 3;
    },
  });

  // Mutation pour mettre à jour le patient
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CreatePatientInput>;
    }) => PatientsService.updatePatient(id, updates),
    onSuccess: updatedPatient => {
      // Mise à jour du cache
      queryClient.setQueryData(['patient', patientId], updatedPatient);
      // Invalidation des listes de patients
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: error => {
      console.error('Erreur lors de la mise à jour du patient:', error);
    },
  });

  // Mutation pour supprimer le patient
  const deleteMutation = useMutation({
    mutationFn: (id: string) => PatientsService.deletePatient(id),
    onSuccess: () => {
      // Suppression du cache
      queryClient.removeQueries({ queryKey: ['patient', patientId] });
      // Invalidation des listes de patients
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: error => {
      console.error('Erreur lors de la suppression du patient:', error);
    },
  });

  // Fonction pour mettre à jour le patient
  const handleUpdatePatient = useCallback(
    async (updates: Partial<CreatePatientInput>) => {
      if (!patientId) {
        throw new Error('ID patient requis pour la mise à jour');
      }
      await updateMutation.mutateAsync({ id: patientId, updates });
    },
    [patientId, updateMutation]
  );

  // Fonction pour supprimer le patient
  const handleDeletePatient = useCallback(async () => {
    if (!patientId) {
      throw new Error('ID patient requis pour la suppression');
    }
    await deleteMutation.mutateAsync(patientId);
  }, [patientId, deleteMutation]);

  return {
    patient: patient || null,
    isLoading:
      isLoading || updateMutation.isPending || deleteMutation.isPending,
    isError: isError || updateMutation.isError || deleteMutation.isError,
    error:
      error?.message ||
      updateMutation.error?.message ||
      deleteMutation.error?.message ||
      null,
    updatePatient: handleUpdatePatient,
    deletePatient: handleDeletePatient,
    refetch,
  };
}

// Hook pour gérer la liste des patients
export function usePatients() {
  const queryClient = useQueryClient();

  // Query pour récupérer tous les patients
  const {
    data: patients = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patients'],
    queryFn: () => PatientsService.getPatients(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof PatientServiceError && error.code === 'AUTH_ERROR') {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation pour créer un nouveau patient
  const createMutation = useMutation({
    mutationFn: (patientData: CreatePatientInput) =>
      PatientsService.createPatient(patientData),
    onSuccess: () => {
      // Invalidation de la liste des patients
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: error => {
      console.error('Erreur lors de la création du patient:', error);
    },
  });

  // Fonction pour créer un patient
  const createPatient = useCallback(
    async (patientData: CreatePatientInput) => {
      return await createMutation.mutateAsync(patientData);
    },
    [createMutation]
  );

  return {
    patients,
    isLoading: isLoading || createMutation.isPending,
    isError: isError || createMutation.isError,
    error: error?.message || createMutation.error?.message || null,
    createPatient,
    refetch,
  };
}

// Hook pour la recherche de patients
export function usePatientSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce de la requête de recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Query pour la recherche
  const {
    data: searchResults = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['patients', 'search', debouncedQuery],
    queryFn: () => PatientsService.searchPatients(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error instanceof PatientServiceError && error.code === 'AUTH_ERROR') {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    query,
    setQuery,
    searchResults,
    isLoading,
    isError,
    error: error?.message || null,
  };
}

// Hook pour la sauvegarde automatique
export function useAutoSave(patientId: string | null) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const autoSave = useCallback(
    async (updates: Partial<CreatePatientInput>) => {
      if (!patientId) return;

      setIsAutoSaving(true);
      try {
        await PatientsService.autoSavePatient(patientId, updates);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      } finally {
        setIsAutoSaving(false);
      }
    },
    [patientId]
  );

  return {
    autoSave,
    isAutoSaving,
    lastSaved,
  };
}
