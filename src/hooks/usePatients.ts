import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService } from '../services/patientsService';
import { queryKeys } from '../lib/query-client';
import type { Patient, PatientForm, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

export function usePatients(
  params: {
    page?: number;
    limit?: number;
    query?: string;
  } = {}
) {
  const queryClient = useQueryClient();

  // Query pour la liste des patients
  const {
    data: patientsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.patientsByPractitioner('current'), params],
    queryFn: () =>
      patientsService.getPatients(params.page, params.limit, params.query),
    keepPreviousData: true,
  });

  // Mutation de création de patient
  const createPatientMutation = useMutation({
    mutationFn: patientsService.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      queryClient.invalidateQueries({
        queryKey: queryKeys.statsByPractitioner('current'),
      });
      toast.success('Patient créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la création : ${error.message}`);
    },
  });

  // Mutation de mise à jour de patient
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientForm> }) =>
      patientsService.updatePatient(id, data),
    onSuccess: updatedPatient => {
      queryClient.setQueryData(
        queryKeys.patient(updatedPatient.id),
        updatedPatient
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      toast.success('Patient mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    },
  });

  // Mutation de suppression de patient
  const deletePatientMutation = useMutation({
    mutationFn: patientsService.deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      queryClient.invalidateQueries({
        queryKey: queryKeys.statsByPractitioner('current'),
      });
      toast.success('Patient supprimé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression : ${error.message}`);
    },
  });

  // Fonctions d'action
  const createPatient = async (patientData: PatientForm) => {
    return createPatientMutation.mutateAsync(patientData);
  };

  const updatePatient = async (
    id: string,
    patientData: Partial<PatientForm>
  ) => {
    return updatePatientMutation.mutateAsync({ id, data: patientData });
  };

  const deletePatient = async (id: string) => {
    return deletePatientMutation.mutateAsync(id);
  };

  return {
    // Données
    patients: patientsData?.data || [],
    pagination: patientsData?.pagination,

    // État
    isLoading,
    error,

    // Actions
    createPatient,
    updatePatient,
    deletePatient,
    refetch,

    // États des mutations
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending,

    // Erreurs
    createError: createPatientMutation.error,
    updateError: updatePatientMutation.error,
    deleteError: deletePatientMutation.error,
  };
}

export function usePatient(id: string) {
  const queryClient = useQueryClient();

  // Query pour un patient spécifique
  const {
    data: patient,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.patient(id),
    queryFn: () => patientsService.getPatientById(id),
    enabled: !!id,
  });

  // Mutation de mise à jour de patient
  const updatePatientMutation = useMutation({
    mutationFn: (data: Partial<PatientForm>) =>
      patientsService.updatePatient(id, data),
    onSuccess: updatedPatient => {
      queryClient.setQueryData(queryKeys.patient(id), updatedPatient);
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      toast.success('Patient mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    },
  });

  // Fonctions d'action
  const updatePatient = async (patientData: Partial<PatientForm>) => {
    return updatePatientMutation.mutateAsync(patientData);
  };

  return {
    // Données
    patient,

    // État
    isLoading,
    error,

    // Actions
    updatePatient,
    refetch,

    // États des mutations
    isUpdating: updatePatientMutation.isPending,

    // Erreurs
    updateError: updatePatientMutation.error,
  };
}
