import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  debounce,
  throttle,
} from './index';

describe('Utils', () => {
  describe('cn', () => {
    it('should combine classes correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', null, undefined, false, 'class2')).toBe(
        'class1 class2'
      );
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-12-19');
      const formatted = formatDate(date);
      expect(formatted).toContain('décembre');
      expect(formatted).toContain('2024');
    });

    it('should handle string input', () => {
      const formatted = formatDate('2024-12-19');
      expect(formatted).toContain('décembre');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2024-12-19T14:30:00');
      const formatted = formatTime(date);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-12-19T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('décembre');
      expect(formatted).toContain('2024');
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      return new Promise<void>(resolve => {
        let callCount = 0;
        const debouncedFn = debounce(() => {
          callCount++;
        }, 100);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        setTimeout(() => {
          expect(callCount).toBe(1);
          resolve();
        }, 150);
      });
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      return new Promise<void>(resolve => {
        let callCount = 0;
        const throttledFn = throttle(() => {
          callCount++;
        }, 100);

        throttledFn();
        throttledFn();
        throttledFn();

        setTimeout(() => {
          expect(callCount).toBe(1);
          resolve();
        }, 50);
      });
    });
  });
});
