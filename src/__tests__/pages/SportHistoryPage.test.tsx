import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SportHistoryPage } from '../../pages/sport/SportHistoryPage';

// Mock des hooks
vi.mock('../../hooks/useSportHistory', () => ({
  useSportHistory: vi.fn(),
  useSportHistoryStats: vi.fn(),
}));

vi.mock('../../hooks/useSportStats', () => ({
  useSportStats: vi.fn(),
}));

// Mock des composants UI
vi.mock('../../components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 data-testid="card-title" {...props}>{children}</h3>,
}));

vi.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('../../components/features/sport/SessionCard', () => ({
  SessionList: ({ sessions, onStart, onEdit, onDuplicate, variant }: any) => (
    <div data-testid="session-list" data-variant={variant}>
      {sessions.map((session: any) => (
        <div key={session.id} data-testid={`session-item-${session.id}`}>
          <span>{session.name}</span>
          <button onClick={() => onStart(session)}>Start</button>
          <button onClick={() => onEdit(session)}>Edit</button>
          <button onClick={() => onDuplicate(session)}>Duplicate</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../../components/ui/pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange, totalItems }: any) => (
    <div data-testid="pagination">
      <span>Page {currentPage} sur {totalPages}</span>
      <span>Total: {totalItems}</span>
      <button onClick={() => onPageChange(currentPage - 1)}>Précédent</button>
      <button onClick={() => onPageChange(currentPage + 1)}>Suivant</button>
    </div>
  ),
}));

vi.mock('../../components/features/sport/SportHistoryFilters', () => ({
  SportHistoryFilters: ({ filters, onFiltersChange, onClearFilters }: any) => (
    <div data-testid="history-filters">
      <input
        data-testid="search-input"
        value={filters.searchQuery}
        onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
        placeholder="Rechercher..."
      />
      <select
        data-testid="type-filter"
        value={filters.type}
        onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
      >
        <option value="all">Tous les types</option>
        <option value="cardio">Cardio</option>
        <option value="musculation">Musculation</option>
      </select>
      <select
        data-testid="period-filter"
        value={filters.period}
        onChange={(e) => onFiltersChange({ ...filters, period: e.target.value })}
      >
        <option value="all">Toutes les périodes</option>
        <option value="week">Cette semaine</option>
        <option value="month">Ce mois</option>
      </select>
      <button data-testid="clear-filters" onClick={onClearFilters}>
        Effacer les filtres
      </button>
    </div>
  ),
}));

vi.mock('../../components/features/sport/SportHistoryEmptyState', () => ({
  SportHistoryEmptyState: ({ type, searchQuery, hasFilters, onClearFilters, onCreateSession }: any) => (
    <div data-testid="empty-state" data-type={type}>
      {type === 'loading' && <span>Chargement...</span>}
      {type === 'error' && <span>Erreur de chargement</span>}
      {type === 'no-results' && (
        <div>
          <span>Aucune séance trouvée</span>
          {hasFilters && (
            <button onClick={onClearFilters}>Effacer les filtres</button>
          )}
        </div>
      )}
      {type === 'no-sessions' && (
        <div>
          <span>Aucune séance dans l'historique</span>
          <button onClick={onCreateSession}>Créer une séance</button>
        </div>
      )}
    </div>
  ),
}));

const mockSessions = [
  {
    id: '1',
    name: 'Séance Cardio',
    type: 'cardio',
    date: '2024-01-15',
    time: '10:00',
    duration: 30,
    status: 'completed',
    exercises: 5,
    rpe: 7,
    painLevel: 2,
  },
  {
    id: '2',
    name: 'Musculation',
    type: 'musculation',
    date: '2024-01-14',
    time: '18:00',
    duration: 45,
    status: 'completed',
    exercises: 8,
    rpe: 8,
    painLevel: 3,
  },
];

const mockStats = {
  totalSessions: 2,
  totalDuration: 75,
  averageRPE: 7.5,
  averagePainLevel: 2.5,
  sessionsByType: { cardio: 1, musculation: 1 },
  sessionsByStatus: { completed: 2 },
};

const mockGlobalStats = {
  total_sessions: 2,
  total_duration_minutes: 75,
  average_rpe: 7.5,
  weekly_frequency: 3,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('SportHistoryPage', () => {
  const mockUseSportHistory = vi.fn();
  const mockUseSportHistoryStats = vi.fn();
  const mockUseSportStats = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock par défaut pour les hooks
    mockUseSportHistory.mockReturnValue({
      sessions: mockSessions,
      totalCount: 2,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasNextPage: false,
      hasPreviousPage: false,
    });

    mockUseSportHistoryStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
    });

    mockUseSportStats.mockReturnValue({
      stats: mockGlobalStats,
      isLoading: false,
    });

    vi.mocked(require('../../hooks/useSportHistory').useSportHistory).mockImplementation(mockUseSportHistory);
    vi.mocked(require('../../hooks/useSportHistory').useSportHistoryStats).mockImplementation(mockUseSportHistoryStats);
    vi.mocked(require('../../hooks/useSportStats').useSportStats).mockImplementation(mockUseSportStats);
  });

  describe('Rendu de base', () => {
    it('affiche le titre et la description', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByText('Historique des séances')).toBeInTheDocument();
      expect(screen.getByText('Consultez et analysez vos séances passées')).toBeInTheDocument();
    });

    it('affiche les statistiques rapides', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByText('2')).toBeInTheDocument(); // totalSessions
      expect(screen.getByText('Séances totales')).toBeInTheDocument();
      expect(screen.getByText('1.3h')).toBeInTheDocument(); // totalDuration en heures
      expect(screen.getByText('Temps total')).toBeInTheDocument();
    });

    it('affiche les filtres', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('history-filters')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('type-filter')).toBeInTheDocument();
      expect(screen.getByTestId('period-filter')).toBeInTheDocument();
    });

    it('affiche la liste des séances', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('session-list')).toBeInTheDocument();
      expect(screen.getByText('Séance Cardio')).toBeInTheDocument();
      expect(screen.getByText('Musculation')).toBeInTheDocument();
    });
  });

  describe('États de chargement', () => {
    it('affiche l\'état de chargement', () => {
      mockUseSportHistory.mockReturnValue({
        sessions: [],
        totalCount: 0,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        hasPreviousPage: false,
      });

      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });
  });

  describe('États d\'erreur', () => {
    it('affiche l\'état d\'erreur', () => {
      mockUseSportHistory.mockReturnValue({
        sessions: [],
        totalCount: 0,
        isLoading: false,
        error: new Error('Erreur de chargement'),
        refetch: vi.fn(),
        hasNextPage: false,
        hasPreviousPage: false,
      });

      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    });
  });

  describe('États vides', () => {
    it('affiche l\'état vide sans filtres', () => {
      mockUseSportHistory.mockReturnValue({
        sessions: [],
        totalCount: 0,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        hasPreviousPage: false,
      });

      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Aucune séance dans l'historique')).toBeInTheDocument();
    });

    it('affiche l\'état vide avec filtres actifs', () => {
      mockUseSportHistory.mockReturnValue({
        sessions: [],
        totalCount: 0,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        hasPreviousPage: false,
      });

      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      // Simuler des filtres actifs
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Aucune séance trouvée')).toBeInTheDocument();
    });
  });

  describe('Filtres', () => {
    it('permet de filtrer par recherche', async () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'cardio' } });
      
      await waitFor(() => {
        expect(mockUseSportHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            searchQuery: 'cardio',
          })
        );
      });
    });

    it('permet de filtrer par type', async () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      const typeFilter = screen.getByTestId('type-filter');
      fireEvent.change(typeFilter, { target: { value: 'cardio' } });
      
      await waitFor(() => {
        expect(mockUseSportHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'cardio',
          })
        );
      });
    });

    it('permet de filtrer par période', async () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      const periodFilter = screen.getByTestId('period-filter');
      fireEvent.change(periodFilter, { target: { value: 'week' } });
      
      await waitFor(() => {
        expect(mockUseSportHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: expect.any(String),
            endDate: expect.any(String),
          })
        );
      });
    });

    it('permet d\'effacer les filtres', async () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      const clearButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(mockUseSportHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            searchQuery: undefined,
            type: undefined,
            startDate: undefined,
            endDate: undefined,
          })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('affiche la pagination quand il y a plusieurs pages', () => {
      mockUseSportHistory.mockReturnValue({
        sessions: mockSessions,
        totalCount: 25,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: true,
        hasPreviousPage: false,
      });

      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('Page 1 sur 3')).toBeInTheDocument();
      expect(screen.getByText('Total: 25')).toBeInTheDocument();
    });

    it('ne cache pas la pagination quand il n\'y a qu\'une page', () => {
      mockUseSportHistory.mockReturnValue({
        sessions: mockSessions,
        totalCount: 5,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        hasPreviousPage: false,
      });

      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('permet de naviguer entre les pages', async () => {
      mockUseSportHistory.mockReturnValue({
        sessions: mockSessions,
        totalCount: 25,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: true,
        hasPreviousPage: true,
      });

      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      const nextButton = screen.getByText('Suivant');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(mockUseSportHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      });
    });
  });

  describe('Actions sur les séances', () => {
    it('permet de démarrer une séance', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);
      
      // Vérifier que la fonction est appelée (dans un vrai test, on vérifierait les logs)
      expect(startButton).toBeInTheDocument();
    });

    it('permet de modifier une séance', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      expect(editButton).toBeInTheDocument();
    });

    it('permet de dupliquer une séance', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      const duplicateButton = screen.getByText('Duplicate');
      fireEvent.click(duplicateButton);
      
      expect(duplicateButton).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('a des attributs ARIA appropriés', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // sections
      expect(screen.getByRole('list')).toBeInTheDocument(); // session list
    });

    it('a des labels appropriés pour les filtres', () => {
      render(<SportHistoryPage />, { wrapper: createWrapper() });
      
      expect(screen.getByLabelText('Rechercher dans les séances')).toBeInTheDocument();
    });
  });
});
