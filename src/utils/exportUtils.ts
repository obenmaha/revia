// Utilitaires pour l'export des données - Story 1.5
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import type { SportSession, SportExercise, ExportFilters } from '@/types/sport';

export interface ExportData {
  sessions: (SportSession & { sport_exercises: SportExercise[] })[];
  filters: ExportFilters;
  metadata: {
    exportDate: Date;
    totalSessions: number;
    period: string;
  };
}

/**
 * Génération de CSV pour les données sport
 */
export function generateCSV(data: ExportData): string {
  const csvData = data.sessions.map(session => ({
    'ID': session.id,
    'Nom': session.name,
    'Date': session.date,
    'Type': session.type,
    'Statut': session.status,
    'Durée (min)': session.duration_minutes,
    'RPE': session.rpe_score || '',
    'Douleur': session.pain_level || '',
    'Objectifs': session.objectives || '',
    'Notes': session.notes || '',
    'Exercices': session.sport_exercises.length,
    'Créé le': session.created_at,
  }));

  return Papa.unparse(csvData, {
    header: true,
    delimiter: ',',
  });
}

/**
 * Génération de PDF pour les données sport
 */
export function generatePDF(data: ExportData): Blob {
  const pdf = new jsPDF();
  
  // Configuration de base
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);

  // En-tête
  pdf.text('Rapport d\'Entraînement Sport', 20, 20);
  pdf.setFontSize(12);
  pdf.text(`Période: ${data.metadata.period}`, 20, 30);
  pdf.text(`Généré le: ${data.metadata.exportDate.toLocaleDateString('fr-FR')}`, 20, 40);
  pdf.text(`Total des séances: ${data.metadata.totalSessions}`, 20, 50);

  // Ligne de séparation
  pdf.line(20, 55, 190, 55);

  // Contenu des sessions
  let yPosition = 70;
  data.sessions.forEach((session, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Titre de la session
    pdf.setFontSize(12);
    pdf.text(`${index + 1}. ${session.name}`, 20, yPosition);
    yPosition += 10;

    // Détails de la session
    pdf.setFontSize(10);
    pdf.text(`Date: ${formatDate(session.date)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Type: ${session.type}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Statut: ${session.status}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Durée: ${session.duration_minutes} min`, 20, yPosition);
    yPosition += 6;
    
    if (session.rpe_score) {
      pdf.text(`RPE: ${session.rpe_score}/10`, 20, yPosition);
      yPosition += 6;
    }
    
    if (session.pain_level) {
      pdf.text(`Douleur: ${session.pain_level}/10`, 20, yPosition);
      yPosition += 6;
    }

    // Objectifs et notes
    if (session.objectives) {
      pdf.text(`Objectifs: ${session.objectives}`, 20, yPosition);
      yPosition += 6;
    }
    
    if (session.notes) {
      pdf.text(`Notes: ${session.notes}`, 20, yPosition);
      yPosition += 6;
    }

    // Exercices
    if (session.sport_exercises && session.sport_exercises.length > 0) {
      pdf.text('Exercices:', 20, yPosition);
      yPosition += 6;

      session.sport_exercises.forEach(exercise => {
        pdf.text(`- ${exercise.name} (${exercise.exercise_type})`, 25, yPosition);
        yPosition += 5;
        
        if (exercise.sets && exercise.reps) {
          pdf.text(`  ${exercise.sets} séries x ${exercise.reps} reps`, 25, yPosition);
          yPosition += 5;
        }
        
        if (exercise.weight_kg) {
          pdf.text(`  Poids: ${exercise.weight_kg}kg`, 25, yPosition);
          yPosition += 5;
        }
        
        if (exercise.duration_seconds) {
          pdf.text(`  Durée: ${Math.round(exercise.duration_seconds / 60)}min`, 25, yPosition);
          yPosition += 5;
        }
        
        if (exercise.notes) {
          pdf.text(`  Notes: ${exercise.notes}`, 25, yPosition);
          yPosition += 5;
        }
      });
    }

    yPosition += 10;
  });

  // Mentions légales
  addLegalNotice(pdf);

  return pdf.output('blob');
}

/**
 * Formatage des dates pour l'export
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Ajout des mentions légales au PDF
 */
function addLegalNotice(pdf: jsPDF): void {
  const pageHeight = pdf.internal.pageSize.height;
  const yPosition = pageHeight - 40;

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);

  pdf.text('Mentions légales:', 20, yPosition);
  pdf.text('- Données personnelles protégées par le RGPD', 20, yPosition + 6);
  pdf.text(
    '- Export généré le ' + new Date().toLocaleString('fr-FR'),
    20,
    yPosition + 12
  );
  pdf.text('- Usage personnel uniquement', 20, yPosition + 18);
  pdf.text('- Revia - Votre partenaire fitness digital', 20, yPosition + 24);
}

/**
 * Validation des données d'export
 */
export function validateExportData(sessions: any[]): boolean {
  if (!Array.isArray(sessions)) {
    return false;
  }

  return sessions.every(session => 
    session.id &&
    session.name &&
    session.date &&
    session.type &&
    session.status &&
    typeof session.duration_minutes === 'number'
  );
}

/**
 * Nettoyage des données sensibles
 */
export function sanitizeExportData(
  sessions: (SportSession & { sport_exercises: SportExercise[] })[]
): any[] {
  return sessions.map(session => ({
    id: session.id,
    name: session.name,
    date: session.date,
    type: session.type,
    status: session.status,
    duration_minutes: session.duration_minutes,
    rpe_score: session.rpe_score || null,
    pain_level: session.pain_level || null,
    objectives: session.objectives || null,
    notes: session.notes || null,
    exercises: session.sport_exercises.map(exercise => ({
      name: exercise.name,
      exercise_type: exercise.exercise_type,
      sets: exercise.sets || null,
      reps: exercise.reps || null,
      weight_kg: exercise.weight_kg || null,
      duration_seconds: exercise.duration_seconds || null,
      rest_seconds: exercise.rest_seconds || null,
      notes: exercise.notes || null,
    })),
    created_at: session.created_at,
  }));
}

/**
 * Génération du nom de fichier
 */
export function generateExportFilename(
  format: 'csv' | 'pdf',
  period: string,
  includeDate: boolean = true
): string {
  const date = includeDate ? new Date().toISOString().split('T')[0] : '';
  const periodLabel = period.toLowerCase().replace(/\s+/g, '-');
  const dateSuffix = includeDate ? `-${date}` : '';
  return `revia-sport-export-${periodLabel}${dateSuffix}.${format}`;
}

/**
 * Téléchargement de fichier
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calcul de la taille du fichier
 */
export function getFileSize(blob: Blob): string {
  const bytes = blob.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Vérification de la compatibilité du navigateur
 */
export function checkBrowserCompatibility(): {
  supported: boolean;
  features: {
    download: boolean;
    blob: boolean;
    csv: boolean;
    pdf: boolean;
  };
} {
  const features = {
    download: 'download' in document.createElement('a'),
    blob: typeof Blob !== 'undefined',
    csv: typeof Papa !== 'undefined',
    pdf: typeof jsPDF !== 'undefined',
  };

  return {
    supported: Object.values(features).every(Boolean),
    features,
  };
}
