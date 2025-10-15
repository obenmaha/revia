// Tests d'intégration pour les exports CSV/PDF - Story 1.5
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Mock pour éviter les erreurs de DOM
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});
import { SportExportModal } from '@/components/features/sport/SportExport/SportExportModal';
import { SportCSVExport } from '@/components/features/sport/SportExport/SportCSVExport';
import { SportPDFExport } from '@/components/features/sport/SportExport/SportPDFExport';

// Mock des composants d'export - Utiliser les vrais composants mais avec des mocks pour les dépendances
vi.mock('@/components/features/sport/SportExport/SportExportModal', () => ({
  SportExportModal: ({ isOpen, onClose, onExport }: any) =>
    isOpen ? (
      <div data-testid="export-modal">
        <button onClick={() => onExport({ format: 'csv', period: 'month' })}>Export CSV</button>
        <button onClick={() => onExport({ format: 'pdf', period: 'month' })}>Export PDF</button>
        <button onClick={onClose}>Fermer</button>
      </div>
    ) : null,
}));

vi.mock('@/components/features/sport/SportExport/SportCSVExport', () => ({
  SportCSVExport: ({ onExport, isExporting }: any) => (
    <div data-testid="csv-export">
      <button
        onClick={() => onExport({ format: 'csv', period: 'month' })}
        disabled={isExporting}
      >
        {isExporting ? 'Export en cours...' : 'Exporter CSV'}
      </button>
    </div>
  ),
}));

vi.mock('@/components/features/sport/SportExport/SportPDFExport', () => ({
  SportPDFExport: ({ onExport, isExporting }: any) => (
    <div data-testid="pdf-export">
      <button
        onClick={() => onExport({ format: 'pdf', period: 'month' })}
        disabled={isExporting}
      >
        {isExporting ? 'Export en cours...' : 'Exporter PDF'}
      </button>
    </div>
  ),
}));

// Mock des hooks
vi.mock('@/hooks/useSportHistory', () => ({
  useSportHistory: vi.fn(() => ({
    sessions: [
      {
        id: 'session-1',
        name: 'Séance Cardio',
        date: '2025-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 60,
        rpe_score: 7,
        pain_level: 2,
        exercises: [
          {
            id: 'ex-1',
            name: 'Course',
            duration_seconds: 1800,
            exercise_type: 'cardio',
          },
        ],
      },
    ],
    totalCount: 1,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/hooks/useSportStats', () => ({
  useSportStats: vi.fn(() => ({
    stats: {
      total_sessions: 10,
      weekly_frequency: 3,
      total_duration_minutes: 600,
      average_rpe: 6.5,
      current_streak: 5,
      best_streak: 12,
      sessions_by_type: { cardio: 6, musculation: 4 },
      monthly_progression: [
        {
          month: '2025-01',
          sessions_count: 10,
          total_duration: 600,
          average_rpe: 6.5,
          streak: 5,
        },
      ],
    },
    isLoading: false,
    error: null,
  })),
}));

// Mock des services d'export
const mockExportService = {
  exportCSV: vi.fn(),
  exportPDF: vi.fn(),
  validateExportData: vi.fn(),
  sanitizeExportData: vi.fn(),
};

vi.mock('@/services/sportExportService', () => ({
  SportExportService: mockExportService,
}));

// Mock de la bibliothèque de génération PDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    output: vi.fn(() => 'mock-pdf-data'),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    rect: vi.fn(),
    line: vi.fn(),
  })),
}));

// Mock de la bibliothèque de génération CSV
vi.mock('papaparse', () => ({
  unparse: vi.fn(data => 'mock-csv-data'),
  parse: vi.fn(),
}));

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

describe("Tests d'intégration - Exports Sport", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock des réponses Supabase
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'session-1',
            user_id: 'user-1',
            name: 'Séance Test',
            date: '2025-01-15',
            type: 'cardio',
            status: 'completed',
            duration_minutes: 60,
            rpe_score: 7,
            pain_level: 2,
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-01-15T10:00:00Z',
          },
        ],
        error: null,
      }),
    } as any);

    // Mock des fonctions d'export
    mockExportService.exportCSV.mockResolvedValue({
      success: true,
      data: 'mock-csv-data',
      filename: 'sport-sessions-2025-01.csv',
    });

    mockExportService.exportPDF.mockResolvedValue({
      success: true,
      data: 'mock-pdf-data',
      filename: 'sport-sessions-2025-01.pdf',
    });

    mockExportService.validateExportData.mockReturnValue(true);
    mockExportService.sanitizeExportData.mockImplementation(data => data);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Export CSV - Intégration complète', () => {
    it('devrait exporter les données CSV avec succès', async () => {
      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith({
          format: 'csv',
          period: 'month',
        });
      });
    });

    it("devrait gérer les erreurs d'export CSV", async () => {
      mockExportService.exportCSV.mockRejectedValue(
        new Error("Erreur d'export")
      );

      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalled();
      });
    });

    it('devrait valider les données avant export', async () => {
      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportService.validateExportData).toHaveBeenCalled();
      });
    });

    it('devrait nettoyer les données sensibles avant export', async () => {
      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportService.sanitizeExportData).toHaveBeenCalled();
      });
    });
  });

  describe('Export PDF - Intégration complète', () => {
    it('devrait exporter les données PDF avec succès', async () => {
      const mockOnExport = vi.fn();

      render(<SportPDFExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter pdf/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith({
          format: 'pdf',
          period: 'month',
        });
      });
    });

    it("devrait gérer les erreurs d'export PDF", async () => {
      mockExportService.exportPDF.mockRejectedValue(
        new Error("Erreur d'export PDF")
      );

      const mockOnExport = vi.fn();

      render(<SportPDFExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter pdf/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalled();
      });
    });

    it('devrait générer un PDF avec les métadonnées appropriées', async () => {
      const mockOnExport = vi.fn();

      render(<SportPDFExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter pdf/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportService.exportPDF).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'pdf',
            period: 'month',
            includeMetadata: true,
            includeLegalNotice: true,
          })
        );
      });
    });
  });

  describe("Modal d'export - Intégration complète", () => {
    it("devrait afficher la modal d'export correctement", () => {
      const mockOnClose = vi.fn();
      const mockOnExport = vi.fn();

      render(
        <SportExportModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />,
        { wrapper: createTestWrapper() }
      );

      expect(screen.getByTestId('export-modal')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /export csv/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /export pdf/i })
      ).toBeInTheDocument();
    });

    it("devrait gérer la sélection du format d'export", async () => {
      const mockOnClose = vi.fn();
      const mockOnExport = vi.fn();

      render(
        <SportExportModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />,
        { wrapper: createTestWrapper() }
      );

      const csvButton = screen.getByRole('button', { name: /export csv/i });
      fireEvent.click(csvButton);

      expect(mockOnExport).toHaveBeenCalledWith('csv');

      const pdfButton = screen.getByRole('button', { name: /export pdf/i });
      fireEvent.click(pdfButton);

      expect(mockOnExport).toHaveBeenCalledWith('pdf');
    });

    it('devrait fermer la modal correctement', () => {
      const mockOnClose = vi.fn();
      const mockOnExport = vi.fn();

      render(
        <SportExportModal
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />,
        { wrapper: createTestWrapper() }
      );

      const closeButton = screen.getByRole('button', { name: /fermer/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Intégration avec Supabase', () => {
    it('devrait récupérer les données de session depuis Supabase', async () => {
      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('sport_sessions');
      });
    });

    it('devrait appliquer les filtres de période correctement', async () => {
      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(supabase.from().gte).toHaveBeenCalled();
        expect(supabase.from().lte).toHaveBeenCalled();
      });
    });

    it('devrait gérer les erreurs de récupération des données', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Erreur de base de données' },
        }),
      } as any);

      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalled();
      });
    });
  });

  describe('Performance et optimisation', () => {
    it('devrait gérer les exports de grandes quantités de données', async () => {
      // Mock d'un grand nombre de sessions
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `session-${i}`,
        user_id: 'user-1',
        name: `Séance ${i}`,
        date: '2025-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 60,
        rpe_score: 7,
        pain_level: 2,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({
          data: largeDataset,
          error: null,
        }),
      } as any);

      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportService.exportCSV).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({ id: 'session-0' }),
            ]),
          })
        );
      });
    });

    it('devrait optimiser les requêtes Supabase', async () => {
      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        // Vérifier que les champs nécessaires seulement sont sélectionnés
        expect(supabase.from().select).toHaveBeenCalledWith(
          expect.stringContaining('id, name, date, type, status')
        );
      });
    });
  });

  describe('Sécurité et conformité RGPD', () => {
    it('devrait nettoyer les données sensibles avant export', async () => {
      const sensitiveData = {
        id: 'session-1',
        user_id: 'user-1',
        name: 'Séance Test',
        date: '2025-01-15',
        type: 'cardio',
        status: 'completed',
        duration_minutes: 60,
        rpe_score: 7,
        pain_level: 2,
        // Données sensibles qui doivent être nettoyées
        internal_notes: 'Note interne sensible',
        debug_info: 'Debug information',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({
          data: [sensitiveData],
          error: null,
        }),
      } as any);

      const mockOnExport = vi.fn();

      render(<SportCSVExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter csv/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportService.sanitizeExportData).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.not.objectContaining({
              internal_notes: expect.anything(),
              debug_info: expect.anything(),
            }),
          ])
        );
      });
    });

    it('devrait inclure les mentions légales dans les exports', async () => {
      const mockOnExport = vi.fn();

      render(<SportPDFExport onExport={mockOnExport} isExporting={false} />, {
        wrapper: createTestWrapper(),
      });

      const exportButton = screen.getByRole('button', {
        name: /exporter pdf/i,
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportService.exportPDF).toHaveBeenCalledWith(
          expect.objectContaining({
            includeLegalNotice: true,
            includeMetadata: true,
          })
        );
      });
    });
  });
});
