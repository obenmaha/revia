// Fonctions utilitaires pour les statistiques sport - Story 1.5
import type { SportStats, MonthlyStats } from '@/hooks/useSportStats';

export interface SessionData {
  id: string;
  date: string;
  type: string;
  status: string;
  duration_minutes: number;
  rpe_score: number;
  pain_level: number;
}

/**
 * Calcule la fréquence hebdomadaire des séances
 */
export function calculateWeeklyFrequency(
  sessions: SessionData[],
  periodDays: number = 30
): number {
  if (sessions.length === 0) return 0;

  const weeks = periodDays / 7;
  return Math.round((sessions.length / weeks) * 10) / 10;
}

/**
 * Calcule la durée totale des séances
 */
export function calculateTotalDuration(sessions: SessionData[]): number {
  return sessions.reduce(
    (total, session) => total + (session.duration_minutes || 0),
    0
  );
}

/**
 * Calcule le RPE moyen
 */
export function calculateAverageRPE(sessions: SessionData[]): number {
  if (sessions.length === 0) return 0;

  const totalRPE = sessions.reduce(
    (sum, session) => sum + (session.rpe_score || 0),
    0
  );
  return Math.round((totalRPE / sessions.length) * 10) / 10;
}

/**
 * Calcule le niveau de douleur moyen
 */
export function calculateAveragePainLevel(sessions: SessionData[]): number {
  if (sessions.length === 0) return 0;

  const totalPain = sessions.reduce(
    (sum, session) => sum + (session.pain_level || 0),
    0
  );
  return Math.round((totalPain / sessions.length) * 10) / 10;
}

/**
 * Calcule le nombre de séances par type
 */
export function calculateSessionsByType(
  sessions: SessionData[]
): Record<string, number> {
  return sessions.reduce(
    (acc, session) => {
      const type = session.type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Calcule le streak actuel (jours consécutifs avec au moins une séance)
 */
export function calculateCurrentStreak(sessions: SessionData[]): number {
  if (sessions.length === 0) return 0;

  // Trier les séances par date décroissante
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Extraire les dates uniques
  const uniqueDates = Array.from(new Set(sortedSessions.map(s => s.date))).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (uniqueDates.length === 0) return 0;

  // Vérifier si la date la plus récente est aujourd'hui ou hier
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Si la dernière séance est trop ancienne, le streak est 0
  if (daysDiff > 1) return 0;

  // Compter les jours consécutifs
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    currentDate.setHours(0, 0, 0, 0);

    const previousDate = new Date(uniqueDates[i - 1]);
    previousDate.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calcule le meilleur streak (plus longue série de jours consécutifs)
 */
export function calculateBestStreak(sessions: SessionData[]): number {
  if (sessions.length === 0) return 0;

  // Extraire les dates uniques et les trier
  const uniqueDates = Array.from(new Set(sessions.map(s => s.date))).sort();

  if (uniqueDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    currentDate.setHours(0, 0, 0, 0);

    const previousDate = new Date(uniqueDates[i - 1]);
    previousDate.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Groupe les séances par mois et calcule les statistiques mensuelles
 */
export function calculateMonthlyProgression(
  sessions: SessionData[]
): MonthlyStats[] {
  if (sessions.length === 0) return [];

  // Grouper par mois
  const monthlyData = sessions.reduce(
    (acc, session) => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          sessions: [],
          month: monthKey,
        };
      }

      acc[monthKey].sessions.push(session);
      return acc;
    },
    {} as Record<string, { sessions: SessionData[]; month: string }>
  );

  // Calculer les statistiques pour chaque mois
  return Object.values(monthlyData)
    .map(({ month, sessions: monthlySessions }) => {
      const sessionsCount = monthlySessions.length;
      const totalDuration = calculateTotalDuration(monthlySessions);
      const averageRPE = calculateAverageRPE(monthlySessions);
      const streak = calculateCurrentStreak(monthlySessions);

      return {
        month,
        sessions_count: sessionsCount,
        total_duration: totalDuration,
        average_rpe: averageRPE,
        streak,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calcule toutes les statistiques à partir d'un tableau de sessions
 */
export function calculateAllStats(
  sessions: SessionData[],
  periodDays: number = 30
): SportStats {
  return {
    total_sessions: sessions.length,
    weekly_frequency: calculateWeeklyFrequency(sessions, periodDays),
    total_duration_minutes: calculateTotalDuration(sessions),
    average_rpe: calculateAverageRPE(sessions),
    current_streak: calculateCurrentStreak(sessions),
    best_streak: calculateBestStreak(sessions),
    sessions_by_type: calculateSessionsByType(sessions),
    monthly_progression: calculateMonthlyProgression(sessions),
  };
}

/**
 * Calcule les tendances d'intensité et de douleur
 */
export function calculateTrends(sessions: SessionData[]): {
  intensityTrend: 'up' | 'down' | 'stable';
  painTrend: 'up' | 'down' | 'stable';
} {
  if (sessions.length < 2) {
    return { intensityTrend: 'stable', painTrend: 'stable' };
  }

  // Trier par date pour s'assurer que les sessions récentes sont en premier
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Diviser en deux moitiés (récent vs ancien)
  const midpoint = Math.ceil(sortedSessions.length / 2);
  const recentSessions = sortedSessions.slice(0, midpoint);
  const olderSessions = sortedSessions.slice(midpoint);

  const recentRPE = calculateAverageRPE(recentSessions);
  const olderRPE = calculateAverageRPE(olderSessions);

  const recentPain = calculateAveragePainLevel(recentSessions);
  const olderPain = calculateAveragePainLevel(olderSessions);

  const intensityTrend =
    recentRPE > olderRPE ? 'up' : recentRPE < olderRPE ? 'down' : 'stable';
  const painTrend =
    recentPain > olderPain ? 'up' : recentPain < olderPain ? 'down' : 'stable';

  return { intensityTrend, painTrend };
}
