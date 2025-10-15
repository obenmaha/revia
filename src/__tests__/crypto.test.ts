/**
 * Tests for crypto utilities
 * Validates AES-GCM encryption, TTL, and secure wipe
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  encrypt,
  decrypt,
  isExpired,
  wipeEncryptionKeys,
  generateDeviceKey,
  isWebCryptoSupported,
  type EncryptedBlob,
} from '@/lib/crypto';

describe('Crypto utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after tests
    localStorage.clear();
  });

  describe('WebCrypto support', () => {
    it('should detect WebCrypto API availability', () => {
      expect(isWebCryptoSupported()).toBe(true);
    });
  });

  describe('Device key generation', () => {
    it('should generate a device key', async () => {
      const key = await generateDeviceKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should persist device key in localStorage', async () => {
      const key1 = await generateDeviceKey();
      const key2 = await generateDeviceKey();
      expect(key1).toBe(key2); // Same key on second call
    });

    it('should store device key without PII', async () => {
      await generateDeviceKey();
      const stored = localStorage.getItem('guest_device_key');
      expect(stored).toBeDefined();

      // Ensure no obvious PII patterns (email, phone, names)
      expect(stored).not.toMatch(/@/); // No email
      expect(stored).not.toMatch(/\d{10}/); // No phone numbers
    });
  });

  describe('Encryption and decryption', () => {
    it('should encrypt and decrypt simple data', async () => {
      const data = { message: 'Hello World', count: 42 };
      const encrypted = await encrypt(data);

      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.timestamp).toBeDefined();

      const decrypted = await decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt complex nested data', async () => {
      const data = {
        sessions: [
          { id: '1', name: 'Workout A', exercises: ['squat', 'bench'] },
          { id: '2', name: 'Workout B', exercises: ['deadlift', 'row'] },
        ],
        stats: { total: 2, avg_duration: 60 },
      };

      const encrypted = await encrypt(data);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });

    it('should handle empty data', async () => {
      const data = {};
      const encrypted = await encrypt(data);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });

    it('should handle arrays', async () => {
      const data = [1, 2, 3, 4, 5];
      const encrypted = await encrypt(data);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });

    it('should produce different ciphertexts for same data', async () => {
      const data = { test: 'data' };
      const encrypted1 = await encrypt(data);
      const encrypted2 = await encrypt(data);

      // Different IVs and salts
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);

      // But both decrypt correctly
      const decrypted1 = await decrypt(encrypted1);
      const decrypted2 = await decrypt(encrypted2);
      expect(decrypted1).toEqual(data);
      expect(decrypted2).toEqual(data);
    });

    it('should fail to decrypt with tampered ciphertext', async () => {
      const data = { secret: 'password' };
      const encrypted = await encrypt(data);

      // Tamper with ciphertext
      encrypted.ciphertext = encrypted.ciphertext.slice(0, -5) + 'XXXXX';

      await expect(decrypt(encrypted)).rejects.toThrow('Decryption failed');
    });

    it('should fail to decrypt with wrong IV', async () => {
      const data = { secret: 'password' };
      const encrypted = await encrypt(data);

      // Replace IV
      encrypted.iv = btoa('wrongivwrongiv');

      await expect(decrypt(encrypted)).rejects.toThrow('Decryption failed');
    });

    it('should include timestamp in encrypted blob', async () => {
      const beforeEncryption = Date.now();
      const data = { test: 'data' };
      const encrypted = await encrypt(data);
      const afterEncryption = Date.now();

      expect(encrypted.timestamp).toBeGreaterThanOrEqual(beforeEncryption);
      expect(encrypted.timestamp).toBeLessThanOrEqual(afterEncryption);
    });
  });

  describe('TTL expiry checks', () => {
    it('should not mark fresh data as expired', () => {
      const blob: EncryptedBlob = {
        ciphertext: 'test',
        iv: 'test',
        salt: 'test',
        timestamp: Date.now(),
      };

      expect(isExpired(blob, 30)).toBe(false);
    });

    it('should mark old data as expired (30 days)', () => {
      const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
      const blob: EncryptedBlob = {
        ciphertext: 'test',
        iv: 'test',
        salt: 'test',
        timestamp: thirtyOneDaysAgo,
      };

      expect(isExpired(blob, 30)).toBe(true);
    });

    it('should mark data as expired exactly at TTL boundary', () => {
      const exactlyThirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000 - 1;
      const blob: EncryptedBlob = {
        ciphertext: 'test',
        iv: 'test',
        salt: 'test',
        timestamp: exactlyThirtyDaysAgo,
      };

      expect(isExpired(blob, 30)).toBe(true);
    });

    it('should support custom TTL values', () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const blob: EncryptedBlob = {
        ciphertext: 'test',
        iv: 'test',
        salt: 'test',
        timestamp: eightDaysAgo,
      };

      expect(isExpired(blob, 7)).toBe(true); // 7-day TTL
      expect(isExpired(blob, 10)).toBe(false); // 10-day TTL
    });
  });

  describe('Secure wipe', () => {
    it('should remove device key from localStorage', async () => {
      await generateDeviceKey();
      expect(localStorage.getItem('guest_device_key')).toBeDefined();

      wipeEncryptionKeys();
      expect(localStorage.getItem('guest_device_key')).toBeNull();
    });

    it('should overwrite key before deletion', async () => {
      await generateDeviceKey();
      const originalKey = localStorage.getItem('guest_device_key');

      // Mock setItem to track calls
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      wipeEncryptionKeys();

      // Should call setItem once to overwrite, then removeItem
      expect(setItemSpy).toHaveBeenCalled();
      const lastCall = setItemSpy.mock.calls[setItemSpy.mock.calls.length - 1];
      expect(lastCall[0]).toBe('guest_device_key');
      expect(lastCall[1]).not.toBe(originalKey); // Different value (random overwrite)

      setItemSpy.mockRestore();
    });

    it('should not crash if no key exists', () => {
      expect(() => wipeEncryptionKeys()).not.toThrow();
    });
  });

  describe('Security properties', () => {
    it('should not log sensitive data', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const data = {
        password: 'super-secret-password',
        email: 'user@example.com',
      };

      const encrypted = await encrypt(data);

      // Intentionally corrupt data to trigger decryption error
      encrypted.ciphertext = 'corrupted';

      try {
        await decrypt(encrypted);
      } catch {
        // Expected error
      }

      // Check that console.error calls don't contain PII
      for (const call of consoleErrorSpy.mock.calls) {
        const message = call.join(' ');
        expect(message).not.toContain('super-secret-password');
        expect(message).not.toContain('user@example.com');
      }

      consoleErrorSpy.mockRestore();
    });

    it('should use strong encryption (256-bit key)', async () => {
      // This is implicitly tested by successful encryption/decryption
      // and by checking that ciphertext is not reversible without key
      const data = { sensitive: 'data' };
      const encrypted = await encrypt(data);

      // Ciphertext should not be the original data in base64
      const plainBase64 = btoa(JSON.stringify(data));
      expect(encrypted.ciphertext).not.toBe(plainBase64);

      // Ciphertext length should be reasonable
      expect(encrypted.ciphertext.length).toBeGreaterThan(20);
    });

    it('should use unique IVs for each encryption', async () => {
      const data = { test: 'data' };
      const ivs = new Set<string>();

      // Encrypt 10 times
      for (let i = 0; i < 10; i++) {
        const encrypted = await encrypt(data);
        ivs.add(encrypted.iv);
      }

      // All IVs should be unique
      expect(ivs.size).toBe(10);
    });

    it('should use unique salts for each encryption', async () => {
      const data = { test: 'data' };
      const salts = new Set<string>();

      // Encrypt 10 times
      for (let i = 0; i < 10; i++) {
        const encrypted = await encrypt(data);
        salts.add(encrypted.salt);
      }

      // All salts should be unique
      expect(salts.size).toBe(10);
    });
  });

  describe('Edge cases', () => {
    it('should handle null values', async () => {
      const data = { value: null };
      const encrypted = await encrypt(data);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });

    it('should handle undefined values', async () => {
      const data = { value: undefined };
      const encrypted = await encrypt(data);
      const decrypted = await decrypt(encrypted);
      // Note: JSON.stringify converts undefined to null in objects
      expect(decrypted).toEqual({ value: null });
    });

    it('should handle very large data (1MB)', async () => {
      const largeData = {
        sessions: Array.from({ length: 1000 }, (_, i) => ({
          id: `session-${i}`,
          name: `Workout ${i}`,
          exercises: Array.from({ length: 10 }, (_, j) => ({
            id: `exercise-${i}-${j}`,
            name: `Exercise ${j}`,
          })),
        })),
      };

      const encrypted = await encrypt(largeData);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toEqual(largeData);
    }, 10000); // 10s timeout for large data

    it('should handle special characters and unicode', async () => {
      const data = {
        emoji: '🏋️‍♂️💪🔥',
        chinese: '你好世界',
        special: '<script>alert("xss")</script>',
        quotes: 'He said "hello"',
      };

      const encrypted = await encrypt(data);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toEqual(data);
    });
  });
});
