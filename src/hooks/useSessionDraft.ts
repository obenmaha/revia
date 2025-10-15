// Hook pour la gestion des brouillons de session avec TTL - FR4/FR5/NFR7
import { useState, useEffect, useCallback } from 'react';
import { Exercise, CreateExerciseInput } from '../types/exercise';

const DRAFT_TTL_MS = 72 * 60 * 60 * 1000; // 72 heures en millisecondes
const DRAFT_KEY_PREFIX = 'session_draft_';

// Interface pour les données de brouillon
interface SessionDraftData {
  exercises: CreateExerciseInput[];
  timestamp: number; // Timestamp de création du brouillon
  sessionId: string;
}

// Interface pour le retour du hook
export interface UseSessionDraftReturn {
  draftExercises: CreateExerciseInput[];
  saveDraft: (exercises: CreateExerciseInput[]) => void;
  clearDraft: () => void;
  hasDraft: boolean;
  draftAge: number | null; // Age du brouillon en millisecondes
  isExpired: boolean;
}

/**
 * Hook pour gérer les brouillons de session avec TTL de 72 heures
 * Persiste les exercices non validés dans localStorage
 *
 * @param sessionId - ID de la session
 * @returns Objet contenant les données et méthodes de gestion du brouillon
 */
export function useSessionDraft(sessionId: string): UseSessionDraftReturn {
  const [draftExercises, setDraftExercises] = useState<CreateExerciseInput[]>(
    []
  );
  const [draftTimestamp, setDraftTimestamp] = useState<number | null>(null);

  const draftKey = `${DRAFT_KEY_PREFIX}${sessionId}`;

  // Charger le brouillon depuis localStorage au montage
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
      const storedDraft = window.localStorage.getItem(draftKey);
      if (!storedDraft) {
        setDraftExercises([]);
        setDraftTimestamp(null);
        return;
      }

      const draftData: SessionDraftData = JSON.parse(storedDraft);
      const now = Date.now();
      const age = now - draftData.timestamp;

      // Vérifier si le brouillon a expiré (72h)
      if (age > DRAFT_TTL_MS) {
        // Brouillon expiré, le supprimer
        window.localStorage.removeItem(draftKey);
        setDraftExercises([]);
        setDraftTimestamp(null);
        console.log(
          `Brouillon expiré pour la session ${sessionId} (âge: ${Math.round(age / (1000 * 60 * 60))}h)`
        );
      } else {
        // Brouillon valide, le charger
        setDraftExercises(draftData.exercises);
        setDraftTimestamp(draftData.timestamp);
        console.log(
          `Brouillon chargé pour la session ${sessionId} (âge: ${Math.round(age / (1000 * 60 * 60))}h)`
        );
      }
    } catch (error) {
      console.error(
        'Erreur lors du chargement du brouillon depuis localStorage:',
        error
      );
      // En cas d'erreur, nettoyer le brouillon corrompu
      window.localStorage.removeItem(draftKey);
      setDraftExercises([]);
      setDraftTimestamp(null);
    }
  }, [sessionId, draftKey]);

  // Sauvegarder le brouillon dans localStorage
  const saveDraft = useCallback(
    (exercises: CreateExerciseInput[]) => {
      if (typeof window === 'undefined' || !sessionId) return;

      try {
        const now = Date.now();
        const draftData: SessionDraftData = {
          exercises,
          timestamp: now,
          sessionId,
        };

        window.localStorage.setItem(draftKey, JSON.stringify(draftData));
        setDraftExercises(exercises);
        setDraftTimestamp(now);
        console.log(`Brouillon sauvegardé pour la session ${sessionId}`);
      } catch (error) {
        console.error(
          'Erreur lors de la sauvegarde du brouillon dans localStorage:',
          error
        );
        throw new Error(
          'Impossible de sauvegarder le brouillon. Vérifiez l\'espace disponible dans le navigateur.'
        );
      }
    },
    [sessionId, draftKey]
  );

  // Effacer le brouillon
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
      window.localStorage.removeItem(draftKey);
      setDraftExercises([]);
      setDraftTimestamp(null);
      console.log(`Brouillon effacé pour la session ${sessionId}`);
    } catch (error) {
      console.error(
        'Erreur lors de la suppression du brouillon depuis localStorage:',
        error
      );
    }
  }, [sessionId, draftKey]);

  // Calculer l'âge du brouillon
  const draftAge = draftTimestamp ? Date.now() - draftTimestamp : null;

  // Vérifier si le brouillon a expiré
  const isExpired = draftAge !== null && draftAge > DRAFT_TTL_MS;

  // Nettoyer automatiquement si expiré
  useEffect(() => {
    if (isExpired) {
      clearDraft();
    }
  }, [isExpired, clearDraft]);

  return {
    draftExercises,
    saveDraft,
    clearDraft,
    hasDraft: draftExercises.length > 0,
    draftAge,
    isExpired,
  };
}

/**
 * Hook utilitaire pour nettoyer tous les brouillons expirés
 * Utile à appeler au démarrage de l'application
 */
export function useCleanExpiredDrafts() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      // Parcourir tous les éléments de localStorage
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith(DRAFT_KEY_PREFIX)) continue;

        const value = window.localStorage.getItem(key);
        if (!value) continue;

        try {
          const draftData: SessionDraftData = JSON.parse(value);
          const age = now - draftData.timestamp;

          if (age > DRAFT_TTL_MS) {
            keysToRemove.push(key);
          }
        } catch {
          // JSON invalide, marquer pour suppression
          keysToRemove.push(key);
        }
      }

      // Supprimer les brouillons expirés
      keysToRemove.forEach(key => {
        window.localStorage.removeItem(key);
        console.log(`Brouillon expiré supprimé: ${key}`);
      });

      if (keysToRemove.length > 0) {
        console.log(`${keysToRemove.length} brouillon(s) expiré(s) supprimé(s)`);
      }
    } catch (error) {
      console.error(
        'Erreur lors du nettoyage des brouillons expirés:',
        error
      );
    }
  }, []);
}
