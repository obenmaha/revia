import { addDays, addWeeks, isAfter, isBefore, isSameDay } from 'date-fns';

export type DuplicateType = 'daily' | 'every-other-day' | 'weekly';

export interface DuplicateOptions {
  startDate: Date;
  type: DuplicateType;
  endDate?: Date | null;
  count?: number;
}

export interface DuplicateResult {
  dates: Date[];
  totalCount: number;
  isValid: boolean;
  errors: string[];
}

/**
 * Génère les dates de duplication selon le type de récurrence spécifié
 * @param options Options de duplication
 * @returns Résultat avec les dates générées et les informations de validation
 */
export function generateDuplicateDates(options: DuplicateOptions): DuplicateResult {
  const { startDate, type, endDate, count = 7 } = options;
  const errors: string[] = [];
  const dates: Date[] = [startDate];

  // Validation des paramètres
  if (count < 1 || count > 365) {
    errors.push('Le nombre de séances doit être entre 1 et 365');
  }

  if (endDate && isBefore(endDate, startDate)) {
    errors.push('La date de fin doit être postérieure à la date de début');
  }

  if (errors.length > 0) {
    return {
      dates: [startDate],
      totalCount: 1,
      isValid: false,
      errors,
    };
  }

  let currentDate = new Date(startDate);
  let generatedCount = 1;

  // Génération des dates selon le type de récurrence
  while (generatedCount < count) {
    let nextDate: Date;

    switch (type) {
      case 'daily':
        nextDate = addDays(currentDate, 1);
        break;
      
      case 'every-other-day':
        nextDate = addDays(currentDate, 2);
        break;
      
      case 'weekly':
        nextDate = addWeeks(currentDate, 1);
        break;
      
      default:
        throw new Error(`Type de duplication non supporté: ${type}`);
    }

    // Vérifier si on dépasse la date de fin
    if (endDate && isAfter(nextDate, endDate)) {
      break;
    }

    dates.push(nextDate);
    currentDate = nextDate;
    generatedCount++;
  }

  return {
    dates,
    totalCount: dates.length,
    isValid: true,
    errors: [],
  };
}

/**
 * Calcule le nombre de séances qui seront créées avec les options données
 * @param options Options de duplication
 * @returns Nombre estimé de séances
 */
export function calculateDuplicateCount(options: DuplicateOptions): number {
  const result = generateDuplicateDates(options);
  return result.totalCount;
}

/**
 * Valide les options de duplication
 * @param options Options de duplication
 * @returns Résultat de validation
 */
export function validateDuplicateOptions(options: DuplicateOptions): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.startDate || !(options.startDate instanceof Date)) {
    errors.push('La date de début est requise et doit être valide');
  }

  if (!options.type || !['daily', 'every-other-day', 'weekly'].includes(options.type)) {
    errors.push('Le type de duplication doit être daily, every-other-day ou weekly');
  }

  if (options.count !== undefined && (options.count < 1 || options.count > 365)) {
    errors.push('Le nombre de séances doit être entre 1 et 365');
  }

  if (options.endDate && options.count) {
    errors.push('Vous ne pouvez pas spécifier à la fois une date de fin et un nombre de séances');
  }

  if (options.endDate && options.startDate && isBefore(options.endDate, options.startDate)) {
    errors.push('La date de fin doit être postérieure à la date de début');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Génère un résumé lisible des options de duplication
 * @param options Options de duplication
 * @returns Description textuelle
 */
export function getDuplicateDescription(options: DuplicateOptions): string {
  const { type, count, endDate } = options;
  
  const typeLabels = {
    daily: 'quotidien',
    'every-other-day': 'un jour sur deux',
    weekly: 'hebdomadaire',
  };

  const typeLabel = typeLabels[type];
  
  if (endDate) {
    return `Duplication ${typeLabel} jusqu'au ${endDate.toLocaleDateString('fr-FR')}`;
  }
  
  return `Duplication ${typeLabel} pour ${count} séances`;
}

/**
 * Filtre les dates de duplication pour exclure les dates passées
 * @param dates Liste des dates
 * @param referenceDate Date de référence (par défaut: aujourd'hui)
 * @returns Dates filtrées
 */
export function filterFutureDates(dates: Date[], referenceDate: Date = new Date()): Date[] {
  return dates.filter(date => isAfter(date, referenceDate) || isSameDay(date, referenceDate));
}

/**
 * Génère des dates de duplication avec des contraintes spécifiques
 * @param options Options de duplication
 * @param constraints Contraintes supplémentaires
 * @returns Résultat avec les dates générées
 */
export function generateConstrainedDuplicateDates(
  options: DuplicateOptions,
  constraints: {
    excludeWeekends?: boolean;
    excludeDates?: Date[];
    maxSessions?: number;
  } = {}
): DuplicateResult {
  const { excludeWeekends = false, excludeDates = [], maxSessions } = constraints;
  
  const baseResult = generateDuplicateDates(options);
  
  if (!baseResult.isValid) {
    return baseResult;
  }

  let filteredDates = baseResult.dates;

  // Exclure les week-ends si demandé
  if (excludeWeekends) {
    filteredDates = filteredDates.filter(date => {
      const dayOfWeek = date.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 = dimanche, 6 = samedi
    });
  }

  // Exclure les dates spécifiées
  if (excludeDates.length > 0) {
    filteredDates = filteredDates.filter(date => 
      !excludeDates.some(excludeDate => isSameDay(date, excludeDate))
    );
  }

  // Limiter le nombre de séances
  if (maxSessions && filteredDates.length > maxSessions) {
    filteredDates = filteredDates.slice(0, maxSessions);
  }

  return {
    dates: filteredDates,
    totalCount: filteredDates.length,
    isValid: true,
    errors: [],
  };
}
