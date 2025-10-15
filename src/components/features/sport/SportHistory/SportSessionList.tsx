// Liste des séances sport - Story 1.5
import React from 'react';
import { SportSessionCard } from './SportSessionCard';
import { EmptyState } from '@/components/ui/empty-state';
import { History } from 'lucide-react';
import type { SportSession, SportExercise } from '@/types/sport';

interface SportSessionWithExercises extends SportSession {
  sport_exercises: SportExercise[];
}

interface SportSessionListProps {
  sessions: SportSessionWithExercises[];
  isLoading?: boolean;
}

export function SportSessionList({ sessions, isLoading = false }: SportSessionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-200 rounded-lg h-32"
          />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Aucune séance trouvée"
        description="Ajustez vos filtres ou créez votre première séance d'entraînement."
        action={{
          label: 'Créer une séance',
          href: '/sport/sessions/new',
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SportSessionCard
          key={session.id}
          session={session}
        />
      ))}
    </div>
  );
}
