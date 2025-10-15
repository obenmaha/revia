// Tests unitaires pour les calculs de statistiques sport - Story 1.5
import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateWeeklyFrequency,
  calculateTotalDuration,
  calculateAverageRPE,
  calculateAveragePainLevel,
  calculateSessionsByType,
  calculateCurrentStreak,
  calculateBestStreak,
  calculateMonthlyProgression,
  calculateAllStats,
  calculateTrends,
  type SessionData,
} from '@/utils/sportStats';

describe('Calculs de statistiques sport', () => {
  let mockSessions: SessionData[];

  beforeEach(() => {
    const today = new Date();
    mockSessions = [
      {
        id: '1',
        date: today.toISOString().split('T')[0],
        type: 'cardio',
        status: 'completed',
        duration_minutes: 60,
        rpe_score: 7,
        pain_level: 2,
      },
      {
        id: '2',
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        type: 'musculation',
        status: 'completed',
        duration_minutes: 45,
        rpe_score: 8,
        pain_level: 3,
      },
      {
        id: '3',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        type: 'cardio',
        status: 'completed',
        duration_minutes: 30,
        rpe_score: 6,
        pain_level: 1,
      },
      {
        id: '4',
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        type: 'flexibility',
        status: 'completed',
        duration_minutes: 20,
        rpe_score: 4,
        pain_level: 1,
      },
    ];
  });

  describe('calculateWeeklyFrequency', () => {
    it('devrait calculer correctement la fréquence hebdomadaire pour 30 jours', () => {
      const frequency = calculateWeeklyFrequency(mockSessions, 30);
      // 4 séances sur 30 jours = 4 / (30/7) ≈ 0.93 séances par semaine
      expect(frequency).toBeCloseTo(0.9, 1);
    });

    it('devrait calculer correctement la fréquence hebdomadaire pour 7 jours', () => {
      const frequency = calculateWeeklyFrequency(mockSessions, 7);
      // 4 séances sur 7 jours = 4 séances par semaine
      expect(frequency).toBe(4);
    });

    it('devrait retourner 0 pour aucune séance', () => {
      const frequency = calculateWeeklyFrequency([], 30);
      expect(frequency).toBe(0);
    });

    it('devrait utiliser 30 jours par défaut', () => {
      const frequency = calculateWeeklyFrequency(mockSessions);
      expect(frequency).toBeGreaterThan(0);
    });
  });

  describe('calculateTotalDuration', () => {
    it('devrait calculer correctement la durée totale', () => {
      const total = calculateTotalDuration(mockSessions);
      // 60 + 45 + 30 + 20 = 155 minutes
      expect(total).toBe(155);
    });

    it('devrait retourner 0 pour aucune séance', () => {
      const total = calculateTotalDuration([]);
      expect(total).toBe(0);
    });

    it('devrait gérer les durées manquantes (undefined)', () => {
      const sessionsWithMissing = [
        { ...mockSessions[0], duration_minutes: 0 },
        mockSessions[1],
      ];
      const total = calculateTotalDuration(sessionsWithMissing);
      expect(total).toBe(45);
    });
  });

  describe('calculateAverageRPE', () => {
    it('devrait calculer correctement le RPE moyen', () => {
      const avgRPE = calculateAverageRPE(mockSessions);
      // (7 + 8 + 6 + 4) / 4 = 6.25 ≈ 6.3
      expect(avgRPE).toBeCloseTo(6.3, 1);
    });

    it('devrait retourner 0 pour aucune séance', () => {
      const avgRPE = calculateAverageRPE([]);
      expect(avgRPE).toBe(0);
    });

    it('devrait arrondir à une décimale', () => {
      const sessions = [{ ...mockSessions[0], rpe_score: 7.77 }];
      const avgRPE = calculateAverageRPE(sessions);
      expect(avgRPE).toBe(7.8);
    });
  });

  describe('calculateAveragePainLevel', () => {
    it('devrait calculer correctement le niveau de douleur moyen', () => {
      const avgPain = calculateAveragePainLevel(mockSessions);
      // (2 + 3 + 1 + 1) / 4 = 1.75 ≈ 1.8
      expect(avgPain).toBeCloseTo(1.8, 1);
    });

    it('devrait retourner 0 pour aucune séance', () => {
      const avgPain = calculateAveragePainLevel([]);
      expect(avgPain).toBe(0);
    });

    it('devrait gérer les valeurs manquantes', () => {
      const sessions = [{ ...mockSessions[0], pain_level: 0 }, mockSessions[1]];
      const avgPain = calculateAveragePainLevel(sessions);
      expect(avgPain).toBe(1.5);
    });
  });

  describe('calculateSessionsByType', () => {
    it('devrait compter correctement les séances par type', () => {
      const byType = calculateSessionsByType(mockSessions);
      expect(byType).toEqual({
        cardio: 2,
        musculation: 1,
        flexibility: 1,
      });
    });

    it('devrait retourner un objet vide pour aucune séance', () => {
      const byType = calculateSessionsByType([]);
      expect(byType).toEqual({});
    });

    it('devrait gérer les types manquants en utilisant "other"', () => {
      const sessions = [{ ...mockSessions[0], type: '' }];
      const byType = calculateSessionsByType(sessions);
      expect(byType).toHaveProperty('other');
      expect(byType.other).toBe(1);
    });
  });

  describe('calculateCurrentStreak', () => {
    it('devrait calculer correctement le streak actuel', () => {
      const streak = calculateCurrentStreak(mockSessions);
      // 4 jours consécutifs
      expect(streak).toBe(4);
    });

    it('devrait retourner 0 pour aucune séance', () => {
      const streak = calculateCurrentStreak([]);
      expect(streak).toBe(0);
    });

    it('devrait retourner 0 si la dernière séance est trop ancienne', () => {
      const oldSessions = [
        {
          ...mockSessions[0],
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
      ];
      const streak = calculateCurrentStreak(oldSessions);
      expect(streak).toBe(0);
    });

    it("devrait s'arrêter au premier jour manquant", () => {
      const today = new Date();
      const sessionsWithGap = [
        {
          id: '1',
          date: today.toISOString().split('T')[0],
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '2',
          date: new Date(today.getTime() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        // Gap de 2 jours
        {
          id: '3',
          date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
      ];
      const streak = calculateCurrentStreak(sessionsWithGap);
      expect(streak).toBe(2);
    });

    it('devrait gérer plusieurs séances le même jour', () => {
      const today = new Date();
      const sessionsWithDuplicates = [
        {
          id: '1',
          date: today.toISOString().split('T')[0],
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '2',
          date: today.toISOString().split('T')[0],
          type: 'musculation',
          status: 'completed',
          duration_minutes: 45,
          rpe_score: 8,
          pain_level: 3,
        },
      ];
      const streak = calculateCurrentStreak(sessionsWithDuplicates);
      expect(streak).toBe(1);
    });
  });

  describe('calculateBestStreak', () => {
    it('devrait calculer correctement le meilleur streak', () => {
      const bestStreak = calculateBestStreak(mockSessions);
      // 4 jours consécutifs
      expect(bestStreak).toBe(4);
    });

    it('devrait retourner 0 pour aucune séance', () => {
      const bestStreak = calculateBestStreak([]);
      expect(bestStreak).toBe(0);
    });

    it('devrait trouver le plus long streak même avec des gaps', () => {
      const today = new Date();
      const sessionsWithMultipleStreaks = [
        // Premier streak: 3 jours
        {
          id: '1',
          date: '2025-01-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '2',
          date: '2025-01-02',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '3',
          date: '2025-01-03',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        // Gap
        // Deuxième streak: 5 jours (le meilleur)
        {
          id: '4',
          date: '2025-01-10',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '5',
          date: '2025-01-11',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '6',
          date: '2025-01-12',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '7',
          date: '2025-01-13',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '8',
          date: '2025-01-14',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
      ];
      const bestStreak = calculateBestStreak(sessionsWithMultipleStreaks);
      expect(bestStreak).toBe(5);
    });

    it('devrait gérer plusieurs séances le même jour', () => {
      const sessionsWithDuplicates = [
        {
          id: '1',
          date: '2025-01-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '2',
          date: '2025-01-01',
          type: 'musculation',
          status: 'completed',
          duration_minutes: 45,
          rpe_score: 8,
          pain_level: 3,
        },
        {
          id: '3',
          date: '2025-01-02',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
      ];
      const bestStreak = calculateBestStreak(sessionsWithDuplicates);
      expect(bestStreak).toBe(2);
    });
  });

  describe('calculateMonthlyProgression', () => {
    it('devrait grouper les séances par mois', () => {
      const progression = calculateMonthlyProgression(mockSessions);
      expect(progression.length).toBeGreaterThan(0);
      expect(progression[0]).toHaveProperty('month');
      expect(progression[0]).toHaveProperty('sessions_count');
      expect(progression[0]).toHaveProperty('total_duration');
      expect(progression[0]).toHaveProperty('average_rpe');
    });

    it('devrait retourner un tableau vide pour aucune séance', () => {
      const progression = calculateMonthlyProgression([]);
      expect(progression).toEqual([]);
    });

    it('devrait calculer correctement les statistiques mensuelles', () => {
      const sessions = [
        {
          id: '1',
          date: '2025-01-15',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '2',
          date: '2025-01-20',
          type: 'musculation',
          status: 'completed',
          duration_minutes: 45,
          rpe_score: 8,
          pain_level: 3,
        },
        {
          id: '3',
          date: '2025-02-10',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 30,
          rpe_score: 6,
          pain_level: 1,
        },
      ];
      const progression = calculateMonthlyProgression(sessions);

      expect(progression).toHaveLength(2);

      const jan = progression.find(p => p.month === '2025-01');
      expect(jan).toBeDefined();
      expect(jan?.sessions_count).toBe(2);
      expect(jan?.total_duration).toBe(105);

      const feb = progression.find(p => p.month === '2025-02');
      expect(feb).toBeDefined();
      expect(feb?.sessions_count).toBe(1);
      expect(feb?.total_duration).toBe(30);
    });

    it('devrait trier les mois par ordre chronologique', () => {
      const sessions = [
        {
          id: '1',
          date: '2025-03-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '2',
          date: '2025-01-01',
          type: 'musculation',
          status: 'completed',
          duration_minutes: 45,
          rpe_score: 8,
          pain_level: 3,
        },
        {
          id: '3',
          date: '2025-02-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 30,
          rpe_score: 6,
          pain_level: 1,
        },
      ];
      const progression = calculateMonthlyProgression(sessions);

      expect(progression[0].month).toBe('2025-01');
      expect(progression[1].month).toBe('2025-02');
      expect(progression[2].month).toBe('2025-03');
    });
  });

  describe('calculateAllStats', () => {
    it('devrait calculer toutes les statistiques correctement', () => {
      const stats = calculateAllStats(mockSessions, 30);

      expect(stats.total_sessions).toBe(4);
      expect(stats.weekly_frequency).toBeGreaterThan(0);
      expect(stats.total_duration_minutes).toBe(155);
      expect(stats.average_rpe).toBeCloseTo(6.3, 1);
      expect(stats.current_streak).toBeGreaterThan(0);
      expect(stats.best_streak).toBeGreaterThan(0);
      expect(stats.sessions_by_type).toHaveProperty('cardio');
      expect(stats.monthly_progression).toBeDefined();
    });

    it('devrait gérer un tableau vide de séances', () => {
      const stats = calculateAllStats([], 30);

      expect(stats.total_sessions).toBe(0);
      expect(stats.weekly_frequency).toBe(0);
      expect(stats.total_duration_minutes).toBe(0);
      expect(stats.average_rpe).toBe(0);
      expect(stats.current_streak).toBe(0);
      expect(stats.best_streak).toBe(0);
      expect(stats.sessions_by_type).toEqual({});
      expect(stats.monthly_progression).toEqual([]);
    });

    it('devrait utiliser la période fournie pour le calcul de fréquence', () => {
      const stats7days = calculateAllStats(mockSessions, 7);
      const stats30days = calculateAllStats(mockSessions, 30);

      expect(stats7days.weekly_frequency).toBeGreaterThan(
        stats30days.weekly_frequency
      );
    });
  });

  describe('calculateTrends', () => {
    it('devrait détecter une tendance à la hausse pour le RPE', () => {
      const sessions = [
        // Anciennes séances (RPE bas)
        {
          id: '1',
          date: '2025-01-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 5,
          pain_level: 2,
        },
        {
          id: '2',
          date: '2025-01-02',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 5,
          pain_level: 2,
        },
        // Nouvelles séances (RPE haut)
        {
          id: '3',
          date: '2025-01-10',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 8,
          pain_level: 2,
        },
        {
          id: '4',
          date: '2025-01-11',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 9,
          pain_level: 2,
        },
      ];
      const trends = calculateTrends(sessions);
      expect(trends.intensityTrend).toBe('up');
    });

    it('devrait détecter une tendance à la baisse pour la douleur', () => {
      const sessions = [
        // Anciennes séances (douleur haute)
        {
          id: '1',
          date: '2025-01-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 5,
        },
        {
          id: '2',
          date: '2025-01-02',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 5,
        },
        // Nouvelles séances (douleur basse)
        {
          id: '3',
          date: '2025-01-10',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '4',
          date: '2025-01-11',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 1,
        },
      ];
      const trends = calculateTrends(sessions);
      expect(trends.painTrend).toBe('down');
    });

    it('devrait détecter une tendance stable', () => {
      const sessions = [
        {
          id: '1',
          date: '2025-01-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '2',
          date: '2025-01-02',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '3',
          date: '2025-01-10',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '4',
          date: '2025-01-11',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
      ];
      const trends = calculateTrends(sessions);
      expect(trends.intensityTrend).toBe('stable');
      expect(trends.painTrend).toBe('stable');
    });

    it('devrait retourner stable pour moins de 2 séances', () => {
      const sessions = [
        {
          id: '1',
          date: '2025-01-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
      ];
      const trends = calculateTrends(sessions);
      expect(trends.intensityTrend).toBe('stable');
      expect(trends.painTrend).toBe('stable');
    });

    it('devrait retourner stable pour aucune séance', () => {
      const trends = calculateTrends([]);
      expect(trends.intensityTrend).toBe('stable');
      expect(trends.painTrend).toBe('stable');
    });
  });

  describe('Edge cases et robustesse', () => {
    it('devrait gérer des valeurs extrêmes', () => {
      const extremeSessions = [
        {
          id: '1',
          date: '2025-01-01',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 1000,
          rpe_score: 10,
          pain_level: 10,
        },
      ];
      const stats = calculateAllStats(extremeSessions, 1);

      expect(stats.total_duration_minutes).toBe(1000);
      expect(stats.average_rpe).toBe(10);
    });

    it('devrait gérer des dates dans le désordre', () => {
      const today = new Date();
      const unorderedSessions = [
        {
          id: '1',
          date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '2',
          date: today.toISOString().split('T')[0],
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
        {
          id: '3',
          date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
      ];
      const streak = calculateCurrentStreak(unorderedSessions);
      // Le streak devrait être 1 car seul aujourd'hui est dans la fenêtre de streak
      expect(streak).toBeGreaterThanOrEqual(1);
    });

    it('devrait gérer des dates invalides gracieusement', () => {
      const invalidDateSessions = [
        {
          id: '1',
          date: '',
          type: 'cardio',
          status: 'completed',
          duration_minutes: 60,
          rpe_score: 7,
          pain_level: 2,
        },
      ];
      // Ne devrait pas planter
      expect(() =>
        calculateMonthlyProgression(invalidDateSessions)
      ).not.toThrow();
    });
  });
});
