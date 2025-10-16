// Modal d'export sécurisé pour les données sport - Story 1.5
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { ExportFilters } from '@/types/sport';

interface SportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: ExportFilters) => Promise<void>;
  className?: string;
}

export function SportExportModal({
  isOpen,
  onClose,
  onExport,
  className = '',
}: SportExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportPeriod, setExportPeriod] = useState<
    'week' | 'month' | 'year' | 'custom'
  >('month');
  const [gdprCompliant, setGdprCompliant] = useState(true);
  const [includePersonalData, setIncludePersonalData] = useState(false);
  const [includeLegalNotice, setIncludeLegalNotice] = useState(true);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Validation des données personnelles
      if (includePersonalData && !gdprCompliant) {
        toast({
          title: 'Conformité RGPD requise',
          description:
            'Vous devez accepter la conformité RGPD pour exporter des données personnelles.',
          variant: 'destructive',
        });
        return;
      }

      // Configuration de l'export
      const filters: ExportFilters = {
        format: exportFormat,
        period: exportPeriod,
        startDate: exportPeriod === 'custom' ? customStartDate : undefined,
        endDate: exportPeriod === 'custom' ? customEndDate : undefined,
        includePersonalData,
        includeLegalNotice,
      };

      // Validation des dates personnalisées
      if (exportPeriod === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast({
            title: 'Dates requises',
            description:
              "Veuillez sélectionner les dates de début et de fin pour l'export personnalisé.",
            variant: 'destructive',
          });
          return;
        }

        if (new Date(customStartDate) > new Date(customEndDate)) {
          toast({
            title: 'Dates invalides',
            description:
              'La date de début doit être antérieure à la date de fin.',
            variant: 'destructive',
          });
          return;
        }
      }

      await onExport(filters);

      toast({
        title: 'Export réussi',
        description: `Vos données ont été exportées en ${exportFormat.toUpperCase()}.`,
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export de vos données.",
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week':
        return '7 derniers jours';
      case 'month':
        return '30 derniers jours';
      case 'year':
        return '12 derniers mois';
      case 'custom':
        return 'Période personnalisée';
      default:
        return '30 derniers jours';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-2xl mx-4 ${className}`}
          onClick={e => e.stopPropagation()}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <CardTitle>Exporter les données sport</CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  <Shield className="h-3 w-3 mr-1" />
                  RGPD
                </Badge>
              </div>
              <CardDescription>
                Exportez vos données d'entraînement en toute sécurité
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Format d'export */}
              <div className="space-y-2">
                <Label>Format d'export</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={exportFormat === 'csv' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('csv')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <FileSpreadsheet className="h-6 w-6 mb-2" />
                    <span>CSV</span>
                    <span className="text-xs opacity-75">Tableur</span>
                  </Button>
                  <Button
                    variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('pdf')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <span>PDF</span>
                    <span className="text-xs opacity-75">Rapport</span>
                  </Button>
                </div>
              </div>

              {/* Période d'export */}
              <div className="space-y-2">
                <Label>Période d'export</Label>
                <Select
                  value={exportPeriod}
                  onValueChange={(value: any) => setExportPeriod(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">7 derniers jours</SelectItem>
                    <SelectItem value="month">30 derniers jours</SelectItem>
                    <SelectItem value="year">12 derniers mois</SelectItem>
                    <SelectItem value="custom">
                      Période personnalisée
                    </SelectItem>
                  </SelectContent>
                </Select>

                {exportPeriod === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Date de début</Label>
                      <input
                        id="start-date"
                        type="date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">Date de fin</Label>
                      <input
                        id="end-date"
                        type="date"
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Options de confidentialité */}
              <div className="space-y-4">
                <Label>Options de confidentialité</Label>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gdpr-compliant"
                      checked={gdprCompliant}
                      onCheckedChange={checked =>
                        setGdprCompliant(checked as boolean)
                      }
                    />
                    <Label htmlFor="gdpr-compliant" className="text-sm">
                      Conformité RGPD (recommandé)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-personal-data"
                      checked={includePersonalData}
                      onCheckedChange={checked =>
                        setIncludePersonalData(checked as boolean)
                      }
                      disabled={!gdprCompliant}
                    />
                    <Label htmlFor="include-personal-data" className="text-sm">
                      Inclure les notes personnelles
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-legal-notice"
                      checked={includeLegalNotice}
                      onCheckedChange={checked =>
                        setIncludeLegalNotice(checked as boolean)
                      }
                    />
                    <Label htmlFor="include-legal-notice" className="text-sm">
                      Inclure les mentions légales
                    </Label>
                  </div>
                </div>
              </div>

              {/* Avertissement de sécurité */}
              {includePersonalData && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Attention :</strong> L'export inclura vos notes
                    personnelles. Assurez-vous de stocker ces données en
                    sécurité et de les supprimer après utilisation si
                    nécessaire.
                  </AlertDescription>
                </Alert>
              )}

              {/* Informations sur l'export */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Résumé de l'export</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Format: {exportFormat.toUpperCase()}</div>
                  <div>• Période: {getPeriodLabel(exportPeriod)}</div>
                  <div>
                    • Données personnelles:{' '}
                    {includePersonalData ? 'Oui' : 'Non'}
                  </div>
                  <div>• Conformité RGPD: {gdprCompliant ? 'Oui' : 'Non'}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isExporting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="min-w-[120px]"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

