import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateDuplicateDates,
  calculateDuplicateCount,
  validateDuplicateOptions,
  getDuplicateDescription,
  filterFutureDates,
  generateConstrainedDuplicateDates,
  type DuplicateOptions,
} from '../../utils/duplicateDates';
import { addDays, addWeeks, subDays } from 'date-fns';

describe('duplicateDates', () => {
  let baseDate: Date;
  let baseOptions: DuplicateOptions;

  beforeEach(() => {
    baseDate = new Date('2024-01-15T10:00:00Z');
    baseOptions = {
      startDate: baseDate,
      type: 'daily',
      count: 7,
    };
  });

  describe('generateDuplicateDates', () => {
    it('devrait générer des dates quotidiennes', () => {
      const result = generateDuplicateDates({
        ...baseOptions,
        type: 'daily',
        count: 3,
      });

      expect(result.isValid).toBe(true);
      expect(result.dates).toHaveLength(3);
      expect(result.dates[0]).toEqual(baseDate);
      expect(result.dates[1]).toEqual(addDays(baseDate, 1));
      expect(result.dates[2]).toEqual(addDays(baseDate, 2));
    });

    it('devrait générer des dates un jour sur deux', () => {
      const result = generateDuplicateDates({
        ...baseOptions,
        type: 'every-other-day',
        count: 3,
      });

      expect(result.isValid).toBe(true);
      expect(result.dates).toHaveLength(3);
      expect(result.dates[0]).toEqual(baseDate);
      expect(result.dates[1]).toEqual(addDays(baseDate, 2));
      expect(result.dates[2]).toEqual(addDays(baseDate, 4));
    });

    it('devrait générer des dates hebdomadaires', () => {
      const result = generateDuplicateDates({
        ...baseOptions,
        type: 'weekly',
        count: 3,
      });

      expect(result.isValid).toBe(true);
      expect(result.dates).toHaveLength(3);
      expect(result.dates[0]).toEqual(baseDate);
      expect(result.dates[1]).toEqual(addWeeks(baseDate, 1));
      expect(result.dates[2]).toEqual(addWeeks(baseDate, 2));
    });

    it('devrait respecter la date de fin', () => {
      const endDate = addDays(baseDate, 5);
      const result = generateDuplicateDates({
        ...baseOptions,
        type: 'daily',
        endDate,
      });

      expect(result.isValid).toBe(true);
      expect(result.dates).toHaveLength(6); // Inclut la date de début
      expect(result.dates[result.dates.length - 1]).toEqual(endDate);
    });

    it('devrait valider les paramètres invalides', () => {
      const result = generateDuplicateDates({
        ...baseOptions,
        count: 0,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le nombre de séances doit être entre 1 et 365');
    });

    it('devrait valider la date de fin antérieure', () => {
      const result = generateDuplicateDates({
        ...baseOptions,
        endDate: subDays(baseDate, 1),
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La date de fin doit être postérieure à la date de début');
    });
  });

  describe('calculateDuplicateCount', () => {
    it('devrait calculer le nombre correct pour quotidien', () => {
      const count = calculateDuplicateCount({
        ...baseOptions,
        type: 'daily',
        count: 5,
      });

      expect(count).toBe(5);
    });

    it('devrait calculer le nombre correct avec date de fin', () => {
      const endDate = addDays(baseDate, 3);
      const count = calculateDuplicateCount({
        ...baseOptions,
        type: 'daily',
        endDate,
      });

      expect(count).toBe(4); // Inclut la date de début
    });
  });

  describe('validateDuplicateOptions', () => {
    it('devrait valider des options correctes', () => {
      const validation = validateDuplicateOptions(baseOptions);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('devrait rejeter une date de début invalide', () => {
      const validation = validateDuplicateOptions({
        ...baseOptions,
        startDate: null as any,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('La date de début est requise et doit être valide');
    });

    it('devrait rejeter un type invalide', () => {
      const validation = validateDuplicateOptions({
        ...baseOptions,
        type: 'invalid' as any,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Le type de duplication doit être daily, every-other-day ou weekly');
    });

    it('devrait rejeter un nombre de séances invalide', () => {
      const validation = validateDuplicateOptions({
        ...baseOptions,
        count: 500,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Le nombre de séances doit être entre 1 et 365');
    });

    it('devrait rejeter date de fin et nombre simultanés', () => {
      const validation = validateDuplicateOptions({
        ...baseOptions,
        endDate: addDays(baseDate, 7),
        count: 5,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Vous ne pouvez pas spécifier à la fois une date de fin et un nombre de séances');
    });
  });

  describe('getDuplicateDescription', () => {
    it('devrait générer une description pour quotidien', () => {
      const description = getDuplicateDescription({
        ...baseOptions,
        type: 'daily',
        count: 7,
      });

      expect(description).toBe('Duplication quotidien pour 7 séances');
    });

    it('devrait générer une description pour un jour sur deux', () => {
      const description = getDuplicateDescription({
        ...baseOptions,
        type: 'every-other-day',
        count: 5,
      });

      expect(description).toBe('Duplication un jour sur deux pour 5 séances');
    });

    it('devrait générer une description pour hebdomadaire', () => {
      const description = getDuplicateDescription({
        ...baseOptions,
        type: 'weekly',
        count: 4,
      });

      expect(description).toBe('Duplication hebdomadaire pour 4 séances');
    });

    it('devrait générer une description avec date de fin', () => {
      const endDate = addDays(baseDate, 14);
      const description = getDuplicateDescription({
        ...baseOptions,
        type: 'daily',
        endDate,
      });

      expect(description).toContain('Duplication quotidien jusqu\'au');
    });
  });

  describe('filterFutureDates', () => {
    it('devrait filtrer les dates passées', () => {
      const pastDate = subDays(baseDate, 1);
      const futureDate = addDays(baseDate, 1);
      const dates = [pastDate, baseDate, futureDate];

      const filtered = filterFutureDates(dates, baseDate);

      expect(filtered).toHaveLength(2);
      expect(filtered).toContain(baseDate);
      expect(filtered).toContain(futureDate);
      expect(filtered).not.toContain(pastDate);
    });
  });

  describe('generateConstrainedDuplicateDates', () => {
    it('devrait exclure les week-ends', () => {
      // Lundi
      const monday = new Date('2024-01-15T10:00:00Z');
      const result = generateConstrainedDuplicateDates(
        {
          startDate: monday,
          type: 'daily',
          count: 7,
        },
        { excludeWeekends: true }
      );

      expect(result.isValid).toBe(true);
      // Devrait exclure samedi et dimanche
      expect(result.dates.length).toBeLessThan(7);
    });

    it('devrait exclure des dates spécifiques', () => {
      const excludeDate = addDays(baseDate, 2);
      const result = generateConstrainedDuplicateDates(
        {
          ...baseOptions,
          count: 5,
        },
        { excludeDates: [excludeDate] }
      );

      expect(result.isValid).toBe(true);
      expect(result.dates).not.toContain(excludeDate);
    });

    it('devrait respecter le nombre maximum de séances', () => {
      const result = generateConstrainedDuplicateDates(
        {
          ...baseOptions,
          count: 10,
        },
        { maxSessions: 3 }
      );

      expect(result.isValid).toBe(true);
      expect(result.dates).toHaveLength(3);
    });
  });

  describe('Tests d\'intégration - Scénarios réels', () => {
    it('devrait gérer un programme d\'entraînement quotidien sur 2 semaines', () => {
      const result = generateDuplicateDates({
        startDate: baseDate,
        type: 'daily',
        count: 14,
      });

      expect(result.isValid).toBe(true);
      expect(result.dates).toHaveLength(14);
      
      // Vérifier que chaque date est le jour suivant
      for (let i = 1; i < result.dates.length; i++) {
        const expectedDate = addDays(baseDate, i);
        expect(result.dates[i]).toEqual(expectedDate);
      }
    });

    it('devrait gérer un programme d\'entraînement 3 fois par semaine', () => {
      const result = generateDuplicateDates({
        startDate: baseDate,
        type: 'every-other-day',
        count: 10,
      });

      expect(result.isValid).toBe(true);
      expect(result.dates).toHaveLength(10);
      
      // Vérifier l'alternance des jours
      for (let i = 1; i < result.dates.length; i++) {
        const expectedDate = addDays(baseDate, i * 2);
        expect(result.dates[i]).toEqual(expectedDate);
      }
    });

    it('devrait gérer un programme hebdomadaire sur 1 mois', () => {
      const result = generateDuplicateDates({
        startDate: baseDate,
        type: 'weekly',
        count: 4,
      });

      expect(result.isValid).toBe(true);
      expect(result.dates).toHaveLength(4);
      
      // Vérifier les intervalles hebdomadaires
      for (let i = 1; i < result.dates.length; i++) {
        const expectedDate = addWeeks(baseDate, i);
        expect(result.dates[i]).toEqual(expectedDate);
      }
    });
  });
});
