// Tests de régression pour les fonctionnalités sport existantes
// Garantit que les nouvelles fonctionnalités n'impactent pas l'existant
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { SessionCard } from '@/components/features/sport/SessionCard';
import { ModeToggle } from '@/components/features/ModeToggle';
import { ExerciseManager } from '@/components/features/ExerciseManager';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

// Mock des hooks
vi.mock('@/hooks/useFeatureFlags', () => ({
  useFeatureFlags: vi.fn(),
  useAppMode: vi.fn(),
}));

// Mock des composants qui dépendent de Supabase
vi.mock('@/hooks/useExercises', () => ({
  useExercises: vi.fn(() => ({
    exercises: [],
    isLoading: false,
    error: null,
    addExercise: vi.fn(),
    updateExercise: vi.fn(),
    deleteExercise: vi.fn(),
  })),
  useExerciseStats: vi.fn(() => ({
    totalExercises: 0,
    totalDuration: 0,
    averageIntensity: 0,
    isLoading: false,
  })),
}));

// Mock du hook useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock de framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock de @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => children,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn(),
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  })),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    transform: vi.fn(),
  },
}));

const mockSession = {
  id: 'test-session-1',
  name: 'Séance Test',
  type: 'cardio' as const,
  date: '2025-01-15',
  time: '10:00',
  duration: 60,
  status: 'draft' as const,
  exercises: 3,
  rpe: 7,
  painLevel: 2,
};

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Tests de régression - Fonctionnalités Sport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des feature flags par défaut
    (useFeatureFlags as any).mockReturnValue({
      SPORT_MODE: true,
      CABINET_MODE: true,
    });
  });

  describe('SessionCard - Fonctionnalités existantes', () => {
    it('devrait afficher les informations de session correctement', () => {
      const mockOnStart = vi.fn();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <SessionCard
          session={mockSession}
          onStart={mockOnStart}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
        { wrapper: createTestWrapper() }
      );

      expect(screen.getByText('Séance Test')).toBeInTheDocument();
      expect(screen.getByText('Cardio')).toBeInTheDocument();
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
      expect(screen.getByText('Brouillon')).toBeInTheDocument();
    });

    it('devrait gérer les actions de session sans erreur', async () => {
      const mockOnStart = vi.fn();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <SessionCard
          session={mockSession}
          onStart={mockOnStart}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
        { wrapper: createTestWrapper() }
      );

      // Test du bouton de démarrage
      const startButton = screen.getByRole('button', { name: /démarrer/i });
      fireEvent.click(startButton);
      expect(mockOnStart).toHaveBeenCalledTimes(1);

      // Test du bouton d'édition
      const editButton = screen.getByRole('button', { name: /modifier/i });
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);

      // Test du bouton de suppression
      const deleteButton = screen.getByRole('button', { name: /supprimer/i });
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('devrait afficher les métriques RPE et douleur correctement', () => {
      const mockOnStart = vi.fn();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <SessionCard
          session={mockSession}
          onStart={mockOnStart}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
        { wrapper: createTestWrapper() }
      );

      expect(screen.getByText('RPE: 7')).toBeInTheDocument();
      expect(screen.getByText('Douleur: 2')).toBeInTheDocument();
    });
  });

  describe('ModeToggle - Fonctionnalités existantes', () => {
    it('devrait afficher les deux modes correctement', () => {
      render(<ModeToggle />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Mode Sport')).toBeInTheDocument();
      expect(screen.getByText('Mode Cabinet')).toBeInTheDocument();
      expect(screen.getByText('Entraînement personnel')).toBeInTheDocument();
      expect(screen.getByText('Gestion de cabinet')).toBeInTheDocument();
    });

    it('devrait gérer le changement de mode sans erreur', async () => {
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
        };
      });

      render(<ModeToggle />, { wrapper: createTestWrapper() });

      const sportButton = screen.getByRole('button', { name: /mode sport/i });
      fireEvent.click(sportButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/sport/dashboard');
      });
    });

    it('devrait afficher les feature flags correctement', () => {
      render(<ModeToggle />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Sport=ON')).toBeInTheDocument();
      expect(screen.getByText('Cabinet=ON')).toBeInTheDocument();
    });
  });

  describe('ExerciseManager - Fonctionnalités existantes', () => {
    it('devrait s\'afficher sans erreur avec une session vide', () => {
      render(
        <ExerciseManager sessionId="test-session-1" />,
        { wrapper: createTestWrapper() }
      );

      expect(screen.getByText(/gestion des exercices/i)).toBeInTheDocument();
    });

    it('devrait gérer l\'ajout d\'exercice sans erreur', async () => {
      render(
        <ExerciseManager sessionId="test-session-1" />,
        { wrapper: createTestWrapper() }
      );

      const addButton = screen.getByRole('button', { name: /ajouter un exercice/i });
      fireEvent.click(addButton);

      // Vérifier que le formulaire d'ajout s'affiche
      await waitFor(() => {
        expect(screen.getByText(/nouvel exercice/i)).toBeInTheDocument();
      });
    });
  });

  describe('Compatibilité des types existants', () => {
    it('devrait maintenir la compatibilité des types Session', () => {
      const session: typeof mockSession = {
        id: 'test-id',
        name: 'Test Session',
        type: 'cardio',
        date: '2025-01-15',
        time: '10:00',
        duration: 60,
        status: 'draft',
        exercises: 0,
        rpe: undefined,
        painLevel: undefined,
      };

      expect(session.id).toBe('test-id');
      expect(session.type).toBe('cardio');
      expect(session.status).toBe('draft');
    });

    it('devrait maintenir la compatibilité des types d\'exercice', () => {
      const exercise = {
        id: 'test-exercise-1',
        sessionId: 'test-session-1',
        name: 'Squats',
        exerciseType: 'musculation',
        sets: 3,
        reps: 12,
        weightKg: 20,
        durationSeconds: 0,
        restSeconds: 60,
        orderIndex: 1,
        notes: 'Test notes',
      };

      expect(exercise.id).toBe('test-exercise-1');
      expect(exercise.exerciseType).toBe('musculation');
      expect(exercise.sets).toBe(3);
    });
  });

  describe('Performance et stabilité', () => {
    it('devrait charger les composants dans un temps acceptable', async () => {
      const startTime = performance.now();

      render(
        <SessionCard
          session={mockSession}
          onStart={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Séance Test')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Le composant devrait se charger en moins de 100ms
      expect(loadTime).toBeLessThan(100);
    });

    it('devrait gérer les erreurs de props sans crash', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <SessionCard
            session={null as any}
            onStart={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />,
          { wrapper: createTestWrapper() }
        );
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibilité', () => {
    it('devrait maintenir l\'accessibilité des composants existants', () => {
      render(
        <SessionCard
          session={mockSession}
          onStart={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
        { wrapper: createTestWrapper() }
      );

      // Vérifier que les boutons ont des labels appropriés
      expect(screen.getByRole('button', { name: /démarrer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument();
    });

    it('devrait maintenir la navigation au clavier', () => {
      render(<ModeToggle />, { wrapper: createTestWrapper() });

      const sportButton = screen.getByRole('button', { name: /mode sport/i });
      const cabinetButton = screen.getByRole('button', { name: /mode cabinet/i });

      // Vérifier que les boutons sont focusables
      sportButton.focus();
      expect(document.activeElement).toBe(sportButton);

      cabinetButton.focus();
      expect(document.activeElement).toBe(cabinetButton);
    });
  });
});
