import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionService, SessionServiceError } from '../../services/sessionService';
import { generateDuplicateDates } from '../../utils/duplicateDates';

// Mock de Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock de l'utilitaire duplicateDates
vi.mock('../../utils/duplicateDates', () => ({
  generateDuplicateDates: vi.fn(),
}));

// Mock des types
vi.mock('../../types/session', () => ({
  createSessionSchema: {
    parse: vi.fn((data) => data),
  },
  mapSupabaseSessionToSession: vi.fn((data) => ({
    id: data.id,
    name: data.name,
    date: new Date(data.date),
    type: data.type,
    status: data.status,
    objectives: data.objectives,
    notes: data.notes,
  })),
}));

describe('SessionService - Duplication', () => {
  const mockUser = { id: 'user-123' };
  const mockSessionData = {
    name: 'Test Session',
    date: new Date('2024-01-15'),
    type: 'cardio',
    objectives: 'Test objectives',
    notes: 'Test notes',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('duplicateSession', () => {
    it('devrait créer plusieurs sessions avec duplication quotidienne', async () => {
      const mockDuplicateResult = {
        dates: [
          new Date('2024-01-15'),
          new Date('2024-01-16'),
          new Date('2024-01-17'),
        ],
        totalCount: 3,
        isValid: true,
        errors: [],
      };

      (generateDuplicateDates as any).mockReturnValue(mockDuplicateResult);

      const mockInsertResult = {
        data: [
          { id: '1', name: 'Test Session', date: '2024-01-15T00:00:00.000Z', type: 'cardio', status: 'draft' },
          { id: '2', name: 'Test Session', date: '2024-01-16T00:00:00.000Z', type: 'cardio', status: 'draft' },
          { id: '3', name: 'Test Session', date: '2024-01-17T00:00:00.000Z', type: 'cardio', status: 'draft' },
        ],
        error: null,
      };

      const mockQuery = {
        insert: vi.fn(() => ({
          select: vi.fn().mockResolvedValue(mockInsertResult),
        })),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const duplicateOptions = {
        startDate: new Date('2024-01-15'),
        type: 'daily' as const,
        count: 3,
      };

      const result = await SessionService.duplicateSession(mockSessionData, duplicateOptions);

      expect(result).toHaveLength(3);
      expect(generateDuplicateDates).toHaveBeenCalledWith(duplicateOptions);
      expect(mockQuery.insert).toHaveBeenCalledWith([
        {
          user_id: 'user-123',
          name: 'Test Session',
          date: '2024-01-15T00:00:00.000Z',
          type: 'cardio',
          status: 'draft',
          objectives: 'Test objectives',
          notes: 'Test notes',
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
        {
          user_id: 'user-123',
          name: 'Test Session',
          date: '2024-01-16T00:00:00.000Z',
          type: 'cardio',
          status: 'draft',
          objectives: 'Test objectives',
          notes: 'Test notes',
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
        {
          user_id: 'user-123',
          name: 'Test Session',
          date: '2024-01-17T00:00:00.000Z',
          type: 'cardio',
          status: 'draft',
          objectives: 'Test objectives',
          notes: 'Test notes',
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ]);
    });

    it('devrait gérer les erreurs de validation de duplication', async () => {
      const mockDuplicateResult = {
        dates: [],
        totalCount: 0,
        isValid: false,
        errors: ['Date de fin invalide'],
      };

      (generateDuplicateDates as any).mockReturnValue(mockDuplicateResult);

      const duplicateOptions = {
        startDate: new Date('2024-01-15'),
        type: 'daily' as const,
        count: 3,
      };

      await expect(
        SessionService.duplicateSession(mockSessionData, duplicateOptions)
      ).rejects.toThrow(SessionServiceError);

      await expect(
        SessionService.duplicateSession(mockSessionData, duplicateOptions)
      ).rejects.toThrow('Erreur de duplication: Date de fin invalide');
    });

    it('devrait gérer les erreurs d\'authentification', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Non authentifié'),
      });

      const duplicateOptions = {
        startDate: new Date('2024-01-15'),
        type: 'daily' as const,
        count: 3,
      };

      await expect(
        SessionService.duplicateSession(mockSessionData, duplicateOptions)
      ).rejects.toThrow(SessionServiceError);

      await expect(
        SessionService.duplicateSession(mockSessionData, duplicateOptions)
      ).rejects.toThrow('Utilisateur non authentifié');
    });

    it('devrait gérer les erreurs de base de données', async () => {
      const mockDuplicateResult = {
        dates: [new Date('2024-01-15')],
        totalCount: 1,
        isValid: true,
        errors: [],
      };

      (generateDuplicateDates as any).mockReturnValue(mockDuplicateResult);

      const mockInsertResult = {
        data: null,
        error: new Error('Erreur de base de données'),
      };

      const mockQuery = {
        insert: vi.fn(() => ({
          select: vi.fn().mockResolvedValue(mockInsertResult),
        })),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const duplicateOptions = {
        startDate: new Date('2024-01-15'),
        type: 'daily' as const,
        count: 1,
      };

      await expect(
        SessionService.duplicateSession(mockSessionData, duplicateOptions)
      ).rejects.toThrow(SessionServiceError);

      await expect(
        SessionService.duplicateSession(mockSessionData, duplicateOptions)
      ).rejects.toThrow('Erreur lors de la duplication des sessions');
    });
  });

  describe('duplicateExistingSession', () => {
    it('devrait dupliquer une session existante', async () => {
      const mockSourceSession = {
        id: 'source-123',
        name: 'Source Session',
        date: new Date('2024-01-15'),
        type: 'musculation',
        objectives: 'Source objectives',
        notes: 'Source notes',
      };

      // Mock de getSession
      const mockGetSession = vi.spyOn(SessionService, 'getSession');
      mockGetSession.mockResolvedValue(mockSourceSession as any);

      // Mock de duplicateSession
      const mockDuplicateSession = vi.spyOn(SessionService, 'duplicateSession');
      const mockCreatedSessions = [
        { id: '1', name: 'Source Session', date: new Date('2024-01-15') },
        { id: '2', name: 'Source Session', date: new Date('2024-01-16') },
      ];
      mockDuplicateSession.mockResolvedValue(mockCreatedSessions as any);

      const duplicateOptions = {
        startDate: new Date('2024-01-15'),
        type: 'daily' as const,
        count: 2,
      };

      const result = await SessionService.duplicateExistingSession(
        'source-123',
        duplicateOptions
      );

      expect(result).toEqual(mockCreatedSessions);
      expect(mockGetSession).toHaveBeenCalledWith('source-123');
      expect(mockDuplicateSession).toHaveBeenCalledWith(
        {
          name: 'Source Session',
          date: new Date('2024-01-15'),
          type: 'musculation',
          objectives: 'Source objectives',
          notes: 'Source notes',
        },
        duplicateOptions
      );
    });

    it('devrait gérer le cas où la session source n\'existe pas', async () => {
      const mockGetSession = vi.spyOn(SessionService, 'getSession');
      mockGetSession.mockResolvedValue(null);

      const duplicateOptions = {
        startDate: new Date('2024-01-15'),
        type: 'daily' as const,
        count: 2,
      };

      await expect(
        SessionService.duplicateExistingSession('non-existent', duplicateOptions)
      ).rejects.toThrow(SessionServiceError);

      await expect(
        SessionService.duplicateExistingSession('non-existent', duplicateOptions)
      ).rejects.toThrow('Session source non trouvée');
    });
  });

  describe('Tests d\'intégration - Scénarios réels', () => {
    it('devrait gérer un programme d\'entraînement quotidien sur 1 semaine', async () => {
      const mockDuplicateResult = {
        dates: Array.from({ length: 7 }, (_, i) => 
          new Date(2024, 0, 15 + i)
        ),
        totalCount: 7,
        isValid: true,
        errors: [],
      };

      (generateDuplicateDates as any).mockReturnValue(mockDuplicateResult);

      const mockInsertResult = {
        data: Array.from({ length: 7 }, (_, i) => ({
          id: `session-${i + 1}`,
          name: 'Programme Cardio',
          date: new Date(2024, 0, 15 + i).toISOString(),
          type: 'cardio',
          status: 'draft',
        })),
        error: null,
      };

      const mockQuery = {
        insert: vi.fn(() => ({
          select: vi.fn().mockResolvedValue(mockInsertResult),
        })),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const sessionData = {
        name: 'Programme Cardio',
        date: new Date('2024-01-15'),
        type: 'cardio',
        objectives: 'Améliorer l\'endurance',
        notes: 'Programme de 7 jours',
      };

      const duplicateOptions = {
        startDate: new Date('2024-01-15'),
        type: 'daily' as const,
        count: 7,
      };

      const result = await SessionService.duplicateSession(sessionData, duplicateOptions);

      expect(result).toHaveLength(7);
      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Programme Cardio',
            type: 'cardio',
            status: 'draft',
          }),
        ])
      );
    });

    it('devrait gérer un programme d\'entraînement 3 fois par semaine', async () => {
      const mockDuplicateResult = {
        dates: [
          new Date('2024-01-15'), // Lundi
          new Date('2024-01-17'), // Mercredi
          new Date('2024-01-19'), // Vendredi
        ],
        totalCount: 3,
        isValid: true,
        errors: [],
      };

      (generateDuplicateDates as any).mockReturnValue(mockDuplicateResult);

      const mockInsertResult = {
        data: mockDuplicateResult.dates.map((date, i) => ({
          id: `session-${i + 1}`,
          name: 'Musculation',
          date: date.toISOString(),
          type: 'musculation',
          status: 'draft',
        })),
        error: null,
      };

      const mockQuery = {
        insert: vi.fn(() => ({
          select: vi.fn().mockResolvedValue(mockInsertResult),
        })),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const sessionData = {
        name: 'Musculation',
        date: new Date('2024-01-15'),
        type: 'musculation',
        objectives: 'Développer la force',
        notes: '3 fois par semaine',
      };

      const duplicateOptions = {
        startDate: new Date('2024-01-15'),
        type: 'every-other-day' as const,
        count: 3,
      };

      const result = await SessionService.duplicateSession(sessionData, duplicateOptions);

      expect(result).toHaveLength(3);
      expect(generateDuplicateDates).toHaveBeenCalledWith({
        startDate: new Date('2024-01-15'),
        type: 'every-other-day',
        count: 3,
      });
    });
  });
});
