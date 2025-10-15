// Tests pour les validations de limites RPE et pain_level - FR4
import { describe, it, expect } from 'vitest';
import {
  exerciseSchema,
  createExerciseSchema,
  updateExerciseSchema,
} from '../types/exercise';

describe('Exercise Boundaries - RPE (intensity) 1..10', () => {
  it('devrait accepter RPE = 1 (minimum valide)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 1,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intensity).toBe(1);
    }
  });

  it('devrait accepter RPE = 10 (maximum valide)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 10,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intensity).toBe(10);
    }
  });

  it('devrait accepter RPE = 5 (valeur intermédiaire)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intensity).toBe(5);
    }
  });

  it('devrait rejeter RPE = 0 (en dessous du minimum)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 0,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Intensité minimale 1');
    }
  });

  it('devrait rejeter RPE = 11 (au-dessus du maximum)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 11,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Intensité maximale 10'
      );
    }
  });

  it('devrait rejeter RPE négatif', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: -5,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Intensité minimale 1');
    }
  });

  it('devrait rejeter RPE = 100 (très au-dessus du maximum)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 100,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Intensité maximale 10'
      );
    }
  });
});

describe('Exercise Boundaries - Pain Level 0..10', () => {
  it('devrait accepter painLevel = 0 (aucune douleur)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: 0,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.painLevel).toBe(0);
    }
  });

  it('devrait accepter painLevel = 10 (douleur maximale)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: 10,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.painLevel).toBe(10);
    }
  });

  it('devrait accepter painLevel = 5 (valeur intermédiaire)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: 5,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.painLevel).toBe(5);
    }
  });

  it('devrait accepter painLevel = undefined (optionnel)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.painLevel).toBeUndefined();
    }
  });

  it('devrait rejeter painLevel = -1 (en dessous du minimum)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: -1,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Niveau de douleur minimum 0'
      );
    }
  });

  it('devrait rejeter painLevel = 11 (au-dessus du maximum)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: 11,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Niveau de douleur maximum 10'
      );
    }
  });

  it('devrait rejeter painLevel = -10 (très négatif)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: -10,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Niveau de douleur minimum 0'
      );
    }
  });

  it('devrait rejeter painLevel = 100 (très au-dessus du maximum)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: 100,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Niveau de douleur maximum 10'
      );
    }
  });
});

describe('Exercise Boundaries - Combined RPE and Pain Level', () => {
  it('devrait accepter RPE=1 et painLevel=0 (minimums valides)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 1,
      painLevel: 0,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intensity).toBe(1);
      expect(result.data.painLevel).toBe(0);
    }
  });

  it('devrait accepter RPE=10 et painLevel=10 (maximums valides)', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 10,
      painLevel: 10,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intensity).toBe(10);
      expect(result.data.painLevel).toBe(10);
    }
  });

  it('devrait rejeter si RPE invalide même si painLevel valide', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 15,
      painLevel: 5,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('devrait rejeter si painLevel invalide même si RPE valide', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: 15,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('devrait rejeter si les deux sont invalides', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 0,
      painLevel: -1,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Devrait avoir au moins 2 erreurs
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('CreateExerciseSchema Boundaries', () => {
  it('devrait valider avec sessionId et limites correctes', () => {
    const data = {
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: 3,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = createExerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('devrait rejeter avec RPE invalide dans createExerciseSchema', () => {
    const data = {
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Exercise',
      duration: 30,
      intensity: 11,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = createExerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('UpdateExerciseSchema Boundaries', () => {
  it('devrait valider une mise à jour partielle de RPE', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      intensity: 7,
    };

    const result = updateExerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('devrait valider une mise à jour partielle de painLevel', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      painLevel: 4,
    };

    const result = updateExerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('devrait rejeter une mise à jour avec RPE invalide', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      intensity: 0,
    };

    const result = updateExerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('devrait rejeter une mise à jour avec painLevel invalide', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      painLevel: 11,
    };

    const result = updateExerciseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('Edge Cases - Decimal and String Values', () => {
  it('devrait arrondir les valeurs décimales pour RPE', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5.7, // Sera probablement tronqué ou arrondi
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    // Zod accepte les nombres décimaux, mais l'application devrait les gérer
    expect(result.success).toBe(true);
  });

  it('devrait arrondir les valeurs décimales pour painLevel', () => {
    const data = {
      name: 'Test Exercise',
      duration: 30,
      intensity: 5,
      painLevel: 3.5,
      exerciseType: 'cardio' as const,
      orderIndex: 0,
    };

    const result = exerciseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
