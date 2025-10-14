import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StreakCounter } from '../../components/features/sport/StreakCounter';
import { BadgeSystem } from '../../components/features/sport/BadgeSystem';
import { SessionList } from '../../components/features/sport/SessionCard';
import { Plus, Calendar, TrendingUp, Target } from 'lucide-react';

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

  return (
    <div className="p-4 space-y-6">
      {/* En-tête de bienvenue */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bonjour ! 👋</h1>
        <p className="text-gray-600">Prêt pour votre séance d'aujourd'hui ?</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {mockStats.weeklySessions}
            </div>
            <div className="text-sm text-gray-600">Cette semaine</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {mockStats.totalSessions}
            </div>
            <div className="text-sm text-gray-600">Total séances</div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Counter */}
      <StreakCounter
        currentStreak={mockStats.currentStreak}
        bestStreak={mockStats.bestStreak}
        variant="detailed"
      />

      {/* Prochaines séances */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Prochaines séances</span>
            </CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SessionList
            sessions={mockUpcomingSessions}
            onStart={handleStartSession}
            onEdit={handleEditSession}
            onDuplicate={handleDuplicateSession}
            variant="upcoming"
          />
        </CardContent>
      </Card>

      {/* Badges et récompenses */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Récompenses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeSystem badges={mockBadges} />
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="h-12" variant="default">
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle séance
        </Button>
        <Button className="h-12" variant="outline">
          <TrendingUp className="h-5 w-5 mr-2" />
          Voir statistiques
        </Button>
      </div>
    </div>
  );
}
