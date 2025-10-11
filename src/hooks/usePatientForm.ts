// Hook pour la gestion des formulaires de patients - Story 2.1
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Patient,
  CreatePatientInput,
  PatientFormError,
  PatientFormState,
  createPatientSchema,
  addressSchema,
  medicalInfoSchema,
  emergencyContactSchema,
} from '../types/patient';
import { usePatient, useAutoSave } from './usePatient';
import {
  PatientsService,
  PatientServiceError,
} from '../services/patientsService';

// Interface pour le retour du hook
export interface UsePatientFormReturn {
  form: UseFormReturn<CreatePatientInput>;
  formState: PatientFormState;
  updateField: <K extends keyof CreatePatientInput>(
    field: K,
    value: CreatePatientInput[K]
  ) => void;
  validateField: (field: keyof CreatePatientInput) => PatientFormError[];
  savePatient: () => Promise<Patient>;
  resetForm: () => void;
  isDirty: boolean;
  hasErrors: boolean;
}

// Valeurs par défaut pour le formulaire
const defaultValues: CreatePatientInput = {
  firstName: '',
  lastName: '',
  birthDate: new Date(),
  phone: '',
  email: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
  },
  medicalInfo: {
    allergies: [],
    medications: [],
    medicalHistory: '',
    currentConditions: [],
    notes: '',
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
};

// Hook principal pour les formulaires de patients
export function usePatientForm(
  patientId?: string | null
): UsePatientFormReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Récupération du patient existant si ID fourni
  const { patient, updatePatient } = usePatient(patientId || null);
  const {
    autoSave,
    isAutoSaving,
    lastSaved: autoSavedAt,
  } = useAutoSave(patientId || null);

  // Initialisation du formulaire avec React Hook Form
  const form = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { watch, setValue, reset, formState: reactFormState } = form;

  // État du formulaire personnalisé
  const formState: PatientFormState = useMemo(() => {
    const errors: PatientFormError[] = [];

    // Conversion des erreurs React Hook Form en format personnalisé
    Object.entries(reactFormState.errors).forEach(([field, error]) => {
      if (error?.message) {
        errors.push({
          field: field as keyof CreatePatientInput,
          message: error.message,
        });
      }
    });

    return {
      isLoading: false,
      isSaving: isSaving || isAutoSaving,
      isDirty: reactFormState.isDirty,
      errors,
    };
  }, [reactFormState, isSaving, isAutoSaving]);

  // Chargement des données du patient existant
  useEffect(() => {
    if (patient && patientId) {
      const patientData: CreatePatientInput = {
        firstName: patient.firstName,
        lastName: patient.lastName,
        birthDate: patient.birthDate,
        phone: patient.phone,
        email: patient.email || '',
        address: patient.address,
        medicalInfo: patient.medicalInfo,
        emergencyContact: patient.emergencyContact,
      };
      reset(patientData);
    }
  }, [patient, patientId, reset]);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    if (!patientId || !reactFormState.isDirty) return;

    const timer = setTimeout(() => {
      const formData = watch();
      autoSave(formData);
    }, 2000); // Sauvegarde automatique après 2 secondes d'inactivité

    return () => clearTimeout(timer);
  }, [watch, reactFormState.isDirty, patientId, autoSave]);

  // Fonction pour mettre à jour un champ
  const updateField = useCallback(
    <K extends keyof CreatePatientInput>(
      field: K,
      value: CreatePatientInput[K]
    ) => {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  // Fonction pour valider un champ spécifique
  const validateField = useCallback(
    (field: keyof CreatePatientInput): PatientFormError[] => {
      const fieldValue = watch(field);
      const errors: PatientFormError[] = [];

      try {
        // Validation du champ spécifique
        switch (field) {
          case 'firstName':
          case 'lastName':
            if (!fieldValue || fieldValue.length < 2) {
              errors.push({
                field,
                message: `${field === 'firstName' ? 'Prénom' : 'Nom'} requis (min 2 caractères)`,
              });
            }
            break;
          case 'birthDate':
            if (!fieldValue || fieldValue > new Date()) {
              errors.push({
                field,
                message: 'Date de naissance invalide',
              });
            }
            break;
          case 'phone':
            if (!fieldValue || !/^[0-9+\-\s()]+$/.test(fieldValue)) {
              errors.push({
                field,
                message: 'Format téléphone invalide',
              });
            }
            break;
          case 'email':
            if (fieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
              errors.push({
                field,
                message: 'Email invalide',
              });
            }
            break;
          case 'address':
            if (fieldValue) {
              try {
                addressSchema.parse(fieldValue);
              } catch (error) {
                if (error instanceof Error) {
                  errors.push({
                    field,
                    message: error.message,
                  });
                }
              }
            }
            break;
          case 'medicalInfo':
            if (fieldValue) {
              try {
                medicalInfoSchema.parse(fieldValue);
              } catch (error) {
                if (error instanceof Error) {
                  errors.push({
                    field,
                    message: error.message,
                  });
                }
              }
            }
            break;
          case 'emergencyContact':
            if (fieldValue) {
              try {
                emergencyContactSchema.parse(fieldValue);
              } catch (error) {
                if (error instanceof Error) {
                  errors.push({
                    field,
                    message: error.message,
                  });
                }
              }
            }
            break;
        }
      } catch {
        errors.push({
          field,
          message: 'Erreur de validation',
        });
      }

      return errors;
    },
    [watch]
  );

  // Fonction pour sauvegarder le patient
  const savePatient = useCallback(async (): Promise<Patient> => {
    setIsSaving(true);

    try {
      const formData = watch();

      // Validation complète du formulaire
      const validatedData = createPatientSchema.parse(formData);

      let savedPatient: Patient;

      if (patientId && patient) {
        // Mise à jour d'un patient existant
        savedPatient = await updatePatient(validatedData);
      } else {
        // Création d'un nouveau patient
        savedPatient = await PatientsService.createPatient(validatedData);
      }

      setLastSaved(new Date());
      reset(validatedData); // Reset pour marquer le formulaire comme non modifié

      return savedPatient;
    } catch (err) {
      if (err instanceof PatientServiceError) {
        throw err;
      }
      if (err instanceof Error) {
        throw new PatientServiceError(
          `Erreur de validation: ${err.message}`,
          'VALIDATION_ERROR'
        );
      }
      throw new PatientServiceError(
        'Erreur inconnue lors de la sauvegarde',
        'UNKNOWN_ERROR'
      );
    } finally {
      setIsSaving(false);
    }
  }, [watch, patientId, patient, updatePatient, reset]);

  // Fonction pour réinitialiser le formulaire
  const resetForm = useCallback(() => {
    if (patient && patientId) {
      const patientData: CreatePatientInput = {
        firstName: patient.firstName,
        lastName: patient.lastName,
        birthDate: patient.birthDate,
        phone: patient.phone,
        email: patient.email || '',
        address: patient.address,
        medicalInfo: patient.medicalInfo,
        emergencyContact: patient.emergencyContact,
      };
      reset(patientData);
    } else {
      reset(defaultValues);
    }
  }, [patient, patientId, reset]);

  // Calcul des propriétés dérivées
  const isDirty = reactFormState.isDirty;
  const hasErrors = Object.keys(reactFormState.errors).length > 0;

  return {
    form,
    formState: {
      ...formState,
      isDirty,
      isSaving: isSaving || isAutoSaving,
      lastSaved: lastSaved || autoSavedAt,
    },
    updateField,
    validateField,
    savePatient,
    resetForm,
    isDirty,
    hasErrors,
  };
}

// Hook pour la création d'un nouveau patient
export function useCreatePatientForm() {
  return usePatientForm(null);
}

// Hook pour l'édition d'un patient existant
export function useEditPatientForm(patientId: string) {
  return usePatientForm(patientId);
}
