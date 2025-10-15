// Hook pour l'export des données sport - Story 1.5
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { sportExportService } from '@/services/sportExportService';
import type { ExportFilters, SportSession, SportExercise } from '@/types/sport';

export interface UseSportExportReturn {
  exportCSV: (filters: ExportFilters) => Promise<void>;
  exportPDF: (filters: ExportFilters) => Promise<void>;
  isExporting: boolean;
  exportProgress: number;
  lastExportError: string | null;
}

export function useSportExport(): UseSportExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastExportError, setLastExportError] = useState<string | null>(null);

  // Hook pour récupérer les données d'export
  const { data: exportData, refetch: refetchExportData } = useQuery({
    queryKey: ['sport-export-data'],
    queryFn: async () => {
      const { data: sessions, error: sessionsError } = await supabase
        .from('sport_sessions')
        .select(`
          *,
          sport_exercises (
            id,
            name,
            exercise_type,
            sets,
            reps,
            weight_kg,
            duration_seconds,
            rest_seconds,
            order_index,
            notes
          )
        `)
        .order('date', { ascending: false });

      if (sessionsError) {
        throw new Error(`Erreur lors de la récupération des données: ${sessionsError.message}`);
      }

      return sessions as (SportSession & { sport_exercises: SportExercise[] })[];
    },
    enabled: false, // Ne s'exécute que manuellement
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const exportCSV = async (filters: ExportFilters): Promise<void> => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setLastExportError(null);

      // Récupérer les données
      setExportProgress(20);
      const { data: sessions } = await refetchExportData();
      
      if (!sessions?.data) {
        throw new Error('Aucune donnée à exporter');
      }

      // Filtrer les données selon les critères
      setExportProgress(40);
      const filteredSessions = filterSessions(sessions.data, filters);

      // Générer le CSV
      setExportProgress(60);
      const csvContent = await sportExportService.generateCSV(filteredSessions, filters);

      // Télécharger le fichier
      setExportProgress(80);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `revia-sport-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportProgress(100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'export CSV';
      setLastExportError(errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const exportPDF = async (filters: ExportFilters): Promise<void> => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setLastExportError(null);

      // Récupérer les données
      setExportProgress(20);
      const { data: sessions } = await refetchExportData();
      
      if (!sessions?.data) {
        throw new Error('Aucune donnée à exporter');
      }

      // Filtrer les données selon les critères
      setExportProgress(40);
      const filteredSessions = filterSessions(sessions.data, filters);

      // Générer le PDF
      setExportProgress(60);
      const pdfBlob = await sportExportService.generatePDF(filteredSessions, filters);

      // Télécharger le fichier
      setExportProgress(80);
      const link = document.createElement('a');
      const url = URL.createObjectURL(pdfBlob);
      link.setAttribute('href', url);
      link.setAttribute('download', `revia-sport-export-${new Date().toISOString().split('T')[0]}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportProgress(100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'export PDF';
      setLastExportError(errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  return {
    exportCSV,
    exportPDF,
    isExporting,
    exportProgress,
    lastExportError,
  };
}

// Fonction utilitaire pour filtrer les sessions
function filterSessions(
  sessions: (SportSession & { sport_exercises: SportExercise[] })[],
  filters: ExportFilters
): (SportSession & { sport_exercises: SportExercise[] })[] {
  return sessions.filter(session => {
    // Filtre par date
    if (filters.startDate && new Date(session.date) < filters.startDate) {
      return false;
    }
    if (filters.endDate && new Date(session.date) > filters.endDate) {
      return false;
    }

    // Filtre par type
    if (filters.type && session.type !== filters.type) {
      return false;
    }

    // Filtre par statut
    if (filters.status && session.status !== filters.status) {
      return false;
    }

    return true;
  });
}

// Hook pour les options d'export
export function useSportExportOptions() {
  const { data: options, isLoading } = useQuery({
    queryKey: ['sport-export-options'],
    queryFn: async () => {
      // Récupérer les types de sessions disponibles
      const { data: types } = await supabase
        .from('sport_sessions')
        .select('type')
        .order('type');

      // Récupérer les statuts disponibles
      const { data: statuses } = await supabase
        .from('sport_sessions')
        .select('status')
        .order('status');

      // Récupérer la plage de dates
      const { data: dateRange } = await supabase
        .from('sport_sessions')
        .select('date')
        .order('date', { ascending: true })
        .limit(1);

      const { data: latestDate } = await supabase
        .from('sport_sessions')
        .select('date')
        .order('date', { ascending: false })
        .limit(1);

      return {
        availableTypes: [...new Set(types?.map(t => t.type) || [])],
        availableStatuses: [...new Set(statuses?.map(s => s.status) || [])],
        dateRange: {
          min: dateRange?.[0]?.date ? new Date(dateRange[0].date) : new Date(),
          max: latestDate?.[0]?.date ? new Date(latestDate[0].date) : new Date(),
        },
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    options,
    isLoading,
  };
}

// Hook pour l'historique des exports
export function useSportExportHistory() {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['sport-export-history'],
    queryFn: async () => {
      // Récupérer l'historique des exports depuis le localStorage
      const historyData = localStorage.getItem('revia-sport-export-history');
      return historyData ? JSON.parse(historyData) : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addExportToHistory = (exportData: {
    type: 'csv' | 'pdf';
    filters: ExportFilters;
    timestamp: Date;
    recordCount: number;
  }) => {
    const currentHistory = history || [];
    const newHistory = [exportData, ...currentHistory].slice(0, 50); // Garder seulement les 50 derniers
    localStorage.setItem('revia-sport-export-history', JSON.stringify(newHistory));
  };

  const clearExportHistory = () => {
    localStorage.removeItem('revia-sport-export-history');
  };

  return {
    history: history || [],
    isLoading,
    error: error as Error | null,
    addExportToHistory,
    clearExportHistory,
  };
}
