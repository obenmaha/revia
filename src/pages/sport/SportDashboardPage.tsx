import React, { useState, useEffect } from 'react';
import { ReviaCard, ReviaCardHeader, ReviaCardTitle, ReviaCardContent } from '../../components/ui/revia-card';
import { ReviaButton } from '../../components/ui/revia-button';
import { StreakCounter } from '../../components/features/sport/StreakCounter';
import { BadgeSystem } from '../../components/features/sport/BadgeSystem';
import { SessionList } from '../../components/features/sport/SessionCard';
import { Skeleton, StatsSkeleton, SessionListSkeleton } from '../../components/ui/skeleton';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Plus, Calendar, TrendingUp, Target, Loader2, Flame, Trophy, BarChart3 } from 'lucide-react';

// Données mockées pour la démonstration
const mockStats = {
  currentStreak: 7,
  bestStreak: 15,
  weeklySessions: 4,
  totalSessions: 23,
};

const mockUpcomingSessions = [
  {
    id: '1',
    name: 'Séance Cardio',
    type: 'cardio' as const,
    date: '2024-01-15',
    time: '18:00',
    duration: 45,
    status: 'draft' as const,
    exercises: 3,
    rpe: undefined,
    painLevel: undefined,
  },
  {
    id: '2',
    name: 'Musculation Bras',
    type: 'musculation' as const,
    date: '2024-01-16',
    time: '19:30',
    duration: 60,
    status: 'draft' as const,
    exercises: 5,
    rpe: undefined,
    painLevel: undefined,
  },
];

const mockBadges = [
  {
    type: 'achievement' as const,
    name: 'Premier Pas',
    description: 'Première séance complétée',
    earned: true,
    progress: 1,
    maxProgress: 1,
    icon: '🎯',
  },
  {
    type: 'milestone' as const,
    name: 'Streak 7',
    description: '7 jours consécutifs',
    earned: true,
    progress: 7,
    maxProgress: 7,
    icon: '🔥',
  },
  {
    type: 'special' as const,
    name: 'Débutant',
    description: '10 séances complétées',
    earned: false,
    progress: 8,
    maxProgress: 10,
    icon: '🏆',
  },
];

export function SportDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(mockStats);
  const [sessions, setSessions] = useState(mockUpcomingSessions);
  const [badges, setBadges] = useState(mockBadges);

  // Simulation du chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleStartSession = (session: { id: string; name: string }) => {
    console.log('Démarrer séance:', session);
    // TODO: Navigation vers la page de séance
  };

  const handleEditSession = (session: { id: string; name: string }) => {
    console.log('Modifier séance:', session);
    // TODO: Navigation vers l'édition
  };

  const handleDuplicateSession = (session: { id: string; name: string }) => {
    console.log('Dupliquer séance:', session);
    // TODO: Logique de duplication
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        {/* En-tête de chargement */}
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Statistiques de chargement */}
        <StatsSkeleton />

        {/* Streak de chargement */}
        <Skeleton className="h-32 w-full rounded-lg" />

        {/* Séances de chargement */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <SessionListSkeleton />
          </CardContent>
        </Card>

        {/* Badges de chargement */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-[var(--revia-neutral)] min-h-screen">
      {/* En-tête de bienvenue selon wireframe Revia */}
      <div className="text-center">
        <h1 className="font-montserrat text-2xl font-bold text-[var(--revia-text)] mb-2">
          👋 Salut Sportif !
        </h1>
        <p className="font-inter text-[var(--revia-text)] opacity-80">
          Prêt pour ta séance ?
        </p>
      </div>

      {/* Statistiques principales selon wireframe Revia */}
      <ReviaCard variant="stat" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <ReviaCardContent className="text-center">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Flame className="h-6 w-6" />
              <div>
                <div className="text-2xl font-bold">7 jours</div>
                <div className="text-sm opacity-90">Streak</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6" />
              <div>
                <div className="text-2xl font-bold">3/10</div>
                <div className="text-sm opacity-90">Badges</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6" />
              <div>
                <div className="text-2xl font-bold">+15%</div>
                <div className="text-sm opacity-90">Progression</div>
              </div>
            </div>
          </div>
        </ReviaCardContent>
      </ReviaCard>

      {/* Prochaine séance selon wireframe Revia */}
      <ReviaCard>
        <ReviaCardHeader>
          <ReviaCardTitle>Prochaine séance</ReviaCardTitle>
        </ReviaCardHeader>
        <ReviaCardContent>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl">
                  💪
                </div>
                <div>
                  <h3 className="font-roboto font-semibold text-lg">Musculation - Aujourd'hui</h3>
                  <p className="font-inter text-sm text-gray-600">🕐 18:00 - 45 min</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <ReviaButton variant="primary" size="sm">
                  Commencer
                </ReviaButton>
                <ReviaButton variant="outline" size="sm">
                  Reporter
                </ReviaButton>
              </div>
            </div>
          </div>
        </ReviaCardContent>
      </ReviaCard>

      {/* Séances récentes selon wireframe Revia */}
      <ReviaCard>
        <ReviaCardHeader>
          <ReviaCardTitle>Séances récentes</ReviaCardTitle>
        </ReviaCardHeader>
        <ReviaCardContent>
          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    🏃
                  </div>
                  <div>
                    <h4 className="font-roboto font-semibold">Cardio - Hier</h4>
                    <p className="font-inter text-sm text-gray-600">✅ Complétée - 30 min</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-roboto font-semibold text-green-600">RPE: 7/10</div>
                </div>
              </div>
            </div>
          </div>
        </ReviaCardContent>
      </ReviaCard>

      {/* Action principale selon wireframe Revia */}
      <div className="text-center">
        <ReviaButton variant="primary" size="lg" className="w-full max-w-xs">
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle séance
        </ReviaButton>
      </div>
    </div>
  );
}
