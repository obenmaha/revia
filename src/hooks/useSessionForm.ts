// Hook pour la gestion des formulaires de sessions - Story 2.2
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Session,
  CreateSessionInput,
  SessionFormError,
  SessionFormState,
  createSessionSchema,
} from '../types/session';
import { useSession, useAutoSave } from './useSessions';
import {
  SessionService,
  SessionServiceError,
} from '../services/sessionService';

// Interface pour le retour du hook
export interface UseSessionFormReturn {
  form: UseFormReturn<CreateSessionInput>;
  formState: SessionFormState;
  updateField: <K extends keyof CreateSessionInput>(
    field: K,
    value: CreateSessionInput[K]
  ) => void;
  validateField: (field: keyof CreateSessionInput) => SessionFormError[];
  saveSession: () => Promise<Session>;
  resetForm: () => void;
  isDirty: boolean;
  hasErrors: boolean;
}

// Valeurs par défaut pour le formulaire
const defaultValues: CreateSessionInput = {
  name: '',
  date: new Date(),
  type: 'rehabilitation',
  objectives: '',
  notes: '',
};

// Hook principal pour les formulaires de sessions
export function useSessionForm(
  sessionId?: string | null
): UseSessionFormReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Récupération de la session existante si ID fourni
  const { session, updateSession } = useSession(sessionId || null);
  const {
    autoSave,
    isAutoSaving,
    lastSaved: autoSavedAt,
  } = useAutoSave(sessionId || null);

  // Initialisation du formulaire avec React Hook Form
  const form = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { watch, setValue, reset, formState: reactFormState } = form;

  // État du formulaire personnalisé
  const formState: SessionFormState = useMemo(() => {
    const errors: SessionFormError[] = [];

    // Conversion des erreurs React Hook Form en format personnalisé
    Object.entries(reactFormState.errors).forEach(([field, error]) => {
      if (error?.message) {
        errors.push({
          field: field as keyof CreateSessionInput,
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

  // Chargement des données de la session existante
  useEffect(() => {
    if (session && sessionId) {
      const sessionData: CreateSessionInput = {
        name: session.name,
        date: session.date,
        type: session.type,
        objectives: session.objectives || '',
        notes: session.notes || '',
      };
      reset(sessionData);
    }
  }, [session, sessionId, reset]);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    if (!sessionId || !reactFormState.isDirty) return;

    const timer = setTimeout(() => {
      const formData = watch();
      autoSave(formData);
    }, 2000); // Sauvegarde automatique après 2 secondes d'inactivité

    return () => clearTimeout(timer);
  }, [watch, reactFormState.isDirty, sessionId, autoSave]);

  // Fonction pour mettre à jour un champ
  const updateField = useCallback(
    <K extends keyof CreateSessionInput>(
      field: K,
      value: CreateSessionInput[K]
    ) => {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  // Fonction pour valider un champ spécifique
  const validateField = useCallback(
    (field: keyof CreateSessionInput): SessionFormError[] => {
      const fieldValue = watch(field);
      const errors: SessionFormError[] = [];

      try {
        // Validation du champ spécifique
        switch (field) {
          case 'name':
            if (!fieldValue || fieldValue.length < 3) {
              errors.push({
                field,
                message: 'Nom requis (min 3 caractères)',
              });
            }
            break;
          case 'date':
            if (!fieldValue || fieldValue < new Date()) {
              errors.push({
                field,
                message: 'Date dans le futur requise',
              });
            }
            if (
              fieldValue &&
              fieldValue > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            ) {
              errors.push({
                field,
                message: 'Date trop éloignée (max 1 an)',
              });
            }
            break;
          case 'type':
            if (
              !fieldValue ||
              !['rehabilitation', 'sport', 'fitness', 'other'].includes(
                fieldValue
              )
            ) {
              errors.push({
                field,
                message: "Type d'activité invalide",
              });
            }
            break;
          case 'objectives':
            if (fieldValue && fieldValue.length > 500) {
              errors.push({
                field,
                message: 'Objectifs trop longs (max 500 caractères)',
              });
            }
            break;
          case 'notes':
            if (fieldValue && fieldValue.length > 1000) {
              errors.push({
                field,
                message: 'Notes trop longues (max 1000 caractères)',
              });
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

  // Fonction pour sauvegarder la session
  const saveSession = useCallback(async (): Promise<Session> => {
    setIsSaving(true);

    try {
      const formData = watch();

      // Validation complète du formulaire
      const validatedData = createSessionSchema.parse(formData);

      let savedSession: Session;

      if (sessionId && session) {
        // Mise à jour d'une session existante
        savedSession = await updateSession(validatedData);
      } else {
        // Création d'une nouvelle session
        savedSession = await SessionService.createSession(validatedData);
      }

      setLastSaved(new Date());
      reset(validatedData); // Reset pour marquer le formulaire comme non modifié

      return savedSession;
    } catch (err) {
      if (err instanceof SessionServiceError) {
        throw err;
      }
      if (err instanceof Error) {
        throw new SessionServiceError(
          `Erreur de validation: ${err.message}`,
          'VALIDATION_ERROR'
        );
      }
      throw new SessionServiceError(
        'Erreur inconnue lors de la sauvegarde',
        'UNKNOWN_ERROR'
      );
    } finally {
      setIsSaving(false);
    }
  }, [watch, sessionId, session, updateSession, reset]);

  // Fonction pour réinitialiser le formulaire
  const resetForm = useCallback(() => {
    if (session && sessionId) {
      const sessionData: CreateSessionInput = {
        name: session.name,
        date: session.date,
        type: session.type,
        objectives: session.objectives || '',
        notes: session.notes || '',
      };
      reset(sessionData);
    } else {
      reset(defaultValues);
    }
  }, [session, sessionId, reset]);

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
    saveSession,
    resetForm,
    isDirty,
    hasErrors,
  };
}

// Hook pour la création d'une nouvelle session
export function useCreateSessionForm() {
  return useSessionForm(null);
}

// Hook pour l'édition d'une session existante
export function useEditSessionForm(sessionId: string) {
  return useSessionForm(sessionId);
}
