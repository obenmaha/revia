// Composant d'export CSV pour les données sport - Story 1.5
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  SportExportService,
  type ExportFilters,
} from '@/services/sportExportService';
import { useToast } from '@/hooks/use-toast';

export interface SportCSVExportProps {
  onExport: (filters: ExportFilters) => Promise<void>;
  isExporting: boolean;
  filters?: Partial<ExportFilters>;
  className?: string;
}

export function SportCSVExport({
  onExport,
  isExporting,
  filters = {},
  className = '',
}: SportCSVExportProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const exportFilters: ExportFilters = {
        format: 'csv',
        period: filters.period || 'month',
        startDate: filters.startDate,
        endDate: filters.endDate,
        sessionTypes: filters.sessionTypes,
        includeMetadata: filters.includeMetadata ?? true,
        includeLegalNotice: filters.includeLegalNotice ?? true,
      };

      // Appeler le service d'export
      const result = await SportExportService.exportCSV(exportFilters);

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'export CSV");
      }

      // Télécharger le fichier
      if (result.data && typeof result.data === 'string') {
        const blob = new Blob([result.data], {
          type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', result.filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      }

      // Appeler le callback parent
      await onExport(exportFilters);

      toast({
        title: 'Export CSV réussi',
        description: `Le fichier ${result.filename} a été téléchargé.`,
      });
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      toast({
        title: "Erreur d'export",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'export CSV.",
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <CardTitle>Export CSV</CardTitle>
        </div>
        <CardDescription>
          Exportez vos données d'entraînement au format tableur
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Le fichier CSV contiendra :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Toutes les séances de la période sélectionnée</li>
              <li>Détails des exercices pour chaque séance</li>
              <li>Métriques RPE et niveau de douleur</li>
              <li>Durées et dates des séances</li>
            </ul>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Export en cours...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exporter CSV
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Compatible avec Excel, Google Sheets, LibreOffice Calc
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
