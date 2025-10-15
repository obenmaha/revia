// Composant d'export PDF pour les données sport - Story 1.5
import React from 'react';
import { FileText } from 'lucide-react';
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

export interface SportPDFExportProps {
  onExport: (filters: ExportFilters) => Promise<void>;
  isExporting: boolean;
  filters?: Partial<ExportFilters>;
  className?: string;
}

export function SportPDFExport({
  onExport,
  isExporting,
  filters = {},
  className = '',
}: SportPDFExportProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const exportFilters: ExportFilters = {
        format: 'pdf',
        period: filters.period || 'month',
        startDate: filters.startDate,
        endDate: filters.endDate,
        sessionTypes: filters.sessionTypes,
        includeMetadata: filters.includeMetadata ?? true,
        includeLegalNotice: filters.includeLegalNotice ?? true,
      };

      // Appeler le service d'export
      const result = await SportExportService.exportPDF(exportFilters);

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'export PDF");
      }

      // Télécharger le fichier
      if (result.data && result.data instanceof Blob) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(result.data);

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
        title: 'Export PDF réussi',
        description: `Le fichier ${result.filename} a été téléchargé.`,
      });
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast({
        title: "Erreur d'export",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'export PDF.",
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle>Export PDF</CardTitle>
        </div>
        <CardDescription>
          Générez un rapport formaté de vos entraînements
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Le rapport PDF contiendra :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Résumé de la période sélectionnée</li>
              <li>Liste détaillée de toutes les séances</li>
              <li>Informations sur chaque exercice</li>
              <li>Métriques et statistiques</li>
              <li>Mentions légales et conformité RGPD</li>
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
                <FileText className="h-4 w-4 mr-2" />
                Exporter PDF
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Document professionnel prêt à imprimer ou partager
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
