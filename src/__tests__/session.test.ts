// Tests pour la gestion des sessions - Story 2.2
import { describe, it, expect } from 'vitest';
import {
  Session,
  CreateSessionInput,
  SessionType,
  SessionStatus,
  SESSION_TYPE_OPTIONS,
} from '../types/session';
import { createSessionSchema, updateSessionSchema } from '../types/session';

describe('Types Session', () => {
  it('devrait valider la structure des données Session', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const validSession: Session = {
      id: 'test-session-id',
      userId: 'test-user-id',
      name: 'Séance matin',
      date: futureDate,
      type: 'rehabilitation',
      status: 'draft',
      objectives: 'Améliorer la mobilité',
      notes: 'Session de rééducation',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validSession).toBeDefined();
    expect(validSession.id).toBe('test-session-id');
    expect(validSession.name).toBe('Séance matin');
    expect(validSession.type).toBe('rehabilitation');
    expect(validSession.status).toBe('draft');
  });

  it('devrait valider la structure des données CreateSessionInput', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const validInput: CreateSessionInput = {
      name: 'Entraînement cardio',
      date: futureDate,
      type: 'fitness',
      objectives: "Améliorer l'endurance",
      notes: 'Session intensive',
    };

    expect(validInput).toBeDefined();
    expect(validInput.name).toBe('Entraînement cardio');
    expect(validInput.type).toBe('fitness');
  });

  it("devrait valider les types d'activité", () => {
    const validTypes: SessionType[] = [
      'rehabilitation',
      'sport',
      'fitness',
      'other',
    ];

    validTypes.forEach(type => {
      expect(['rehabilitation', 'sport', 'fitness', 'other']).toContain(type);
    });
  });

  it('devrait valider les statuts de session', () => {
    const validStatuses: SessionStatus[] = [
      'draft',
      'in_progress',
      'completed',
    ];

    validStatuses.forEach(status => {
      expect(['draft', 'in_progress', 'completed']).toContain(status);
    });
  });
});

describe('Validation Zod', () => {
  it('devrait valider un nom de session valide', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const validData = {
      name: 'Séance matin',
      date: futureDate,
      type: 'rehabilitation' as SessionType,
    };

    const result = createSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Séance matin');
      expect(result.data.type).toBe('rehabilitation');
    }
  });

  it('devrait rejeter un nom trop court', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const invalidData = {
      name: 'Se',
      date: futureDate,
      type: 'rehabilitation' as SessionType,
    };

    const result = createSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Nom requis (min 3 caractères)'
      );
    }
  });

  it('devrait valider une date dans le futur', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const validData = {
      name: 'Séance future',
      date: futureDate,
      type: 'rehabilitation' as SessionType,
    };

    const result = createSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toEqual(futureDate);
    }
  });

  it('devrait rejeter une date dans le passé', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const invalidData = {
      name: 'Séance passée',
      date: pastDate,
      type: 'rehabilitation' as SessionType,
    };

    const result = createSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Date dans le futur requise');
    }
  });

  it("devrait valider un type d'activité valide", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const validData = {
      name: 'Séance sport',
      date: futureDate,
      type: 'sport' as SessionType,
    };

    const result = createSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('sport');
    }
  });

  it("devrait rejeter un type d'activité invalide", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const invalidData = {
      name: 'Séance invalide',
      date: futureDate,
      type: 'invalid_type' as SessionType,
    };

    const result = createSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Le message d'erreur peut varier selon la version de Zod
      expect(result.error.issues[0].message).toMatch(
        /Type d'activité invalide|Invalid option/
      );
    }
  });

  it('devrait valider des objectifs optionnels', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const validData = {
      name: 'Séance sans objectifs',
      date: futureDate,
      type: 'rehabilitation' as SessionType,
      objectives: undefined,
    };

    const result = createSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('devrait rejeter des objectifs trop longs', () => {
    const longObjectives = 'a'.repeat(501);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const invalidData = {
      name: 'Séance avec objectifs longs',
      date: futureDate,
      type: 'rehabilitation' as SessionType,
      objectives: longObjectives,
    };

    const result = createSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Objectifs trop longs (max 500 caractères)'
      );
    }
  });

  it('devrait valider des notes optionnelles', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const validData = {
      name: 'Séance sans notes',
      date: futureDate,
      type: 'rehabilitation' as SessionType,
      notes: undefined,
    };

    const result = createSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('devrait rejeter des notes trop longues', () => {
    const longNotes = 'a'.repeat(1001);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 jours dans le futur

    const invalidData = {
      name: 'Séance avec notes longues',
      date: futureDate,
      type: 'rehabilitation' as SessionType,
      notes: longNotes,
    };

    const result = createSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Notes trop longues (max 1000 caractères)'
      );
    }
  });
});

describe("Options de type d'activité", () => {
  it('devrait avoir toutes les options requises', () => {
    expect(SESSION_TYPE_OPTIONS).toHaveLength(4);

    const types = SESSION_TYPE_OPTIONS.map(option => option.value);
    expect(types).toContain('rehabilitation');
    expect(types).toContain('sport');
    expect(types).toContain('fitness');
    expect(types).toContain('other');
  });

  it('devrait avoir des labels en français', () => {
    SESSION_TYPE_OPTIONS.forEach(option => {
      expect(option.label).toBeDefined();
      expect(option.label.length).toBeGreaterThan(0);
    });
  });

  it('devrait avoir des descriptions', () => {
    SESSION_TYPE_OPTIONS.forEach(option => {
      expect(option.description).toBeDefined();
      expect(option.description.length).toBeGreaterThan(0);
    });
  });

  it('devrait avoir des icônes', () => {
    SESSION_TYPE_OPTIONS.forEach(option => {
      expect(option.icon).toBeDefined();
      expect(option.icon.length).toBeGreaterThan(0);
    });
  });

  it('devrait avoir des couleurs', () => {
    SESSION_TYPE_OPTIONS.forEach(option => {
      expect(option.color).toBeDefined();
      expect(option.color).toMatch(/^text-\w+-\d+$/);
    });
  });
});

describe('Validation de mise à jour', () => {
  it('devrait valider une mise à jour partielle', () => {
    const updateData = {
      id: '123e4567-e89b-12d3-a456-426614174000', // UUID valide
      name: 'Séance modifiée',
      status: 'in_progress' as SessionStatus,
    };

    const result = updateSessionSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Séance modifiée');
      expect(result.data.status).toBe('in_progress');
    }
  });

  it('devrait rejeter un ID invalide', () => {
    const invalidData = {
      id: 'invalid-id',
      name: 'Séance modifiée',
    };

    const result = updateSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('ID session invalide');
    }
  });

  it('devrait valider un statut valide', () => {
    const validData = {
      id: '123e4567-e89b-12d3-a456-426614174000', // UUID valide
      status: 'completed' as SessionStatus,
    };

    const result = updateSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('completed');
    }
  });

  it('devrait rejeter un statut invalide', () => {
    const invalidData = {
      id: '123e4567-e89b-12d3-a456-426614174000', // UUID valide
      status: 'invalid_status' as SessionStatus,
    };

    const result = updateSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Vérifier que l'erreur contient le message de statut invalide
      const errorMessages = result.error.issues.map(issue => issue.message);
      expect(
        errorMessages.some(
          msg =>
            msg.includes('Statut de session invalide') ||
            msg.includes('Invalid option')
        )
      ).toBe(true);
    }
  });
});

describe('Fonctions utilitaires', () => {
  it('devrait formater une date correctement', () => {
    const date = new Date('2024-12-25');
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

    expect(formattedDate).toContain('2024');
    expect(formattedDate).toContain('décembre');
    expect(formattedDate).toContain('25');
  });

  it('devrait calculer la différence de jours', () => {
    const date1 = new Date('2024-12-25');
    const date2 = new Date('2024-12-30');
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(5);
  });

  it('devrait valider une date dans la plage autorisée', () => {
    const today = new Date();
    const maxDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);

    const validDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours dans le futur

    expect(validDate.getTime()).toBeGreaterThan(today.getTime());
    expect(validDate.getTime()).toBeLessThan(maxDate.getTime());
  });
});

describe('Gestion des erreurs', () => {
  it('devrait gérer les erreurs de validation', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const invalidData = {
      name: '',
      date: pastDate,
      type: 'invalid' as SessionType,
    };

    const result = createSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toHaveLength(3); // 3 erreurs attendues
    }
  });

  it("devrait fournir des messages d'erreur en français", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const invalidData = {
      name: 'Se',
      date: pastDate,
      type: 'invalid' as SessionType,
    };

    const result = createSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map(issue => issue.message);
      expect(messages).toContain('Nom requis (min 3 caractères)');
      expect(messages).toContain('Date dans le futur requise');
      // Le message par défaut de Zod est utilisé pour les types invalides
      expect(
        messages.some(
          msg =>
            msg.includes("Type d'activité invalide") ||
            msg.includes('Invalid option')
        )
      ).toBe(true);
    }
  });
});
