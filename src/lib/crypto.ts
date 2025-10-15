/**
 * WebCrypto utilities for AES-GCM encryption
 * Used for encrypting guest mode data in localStorage
 *
 * Security: Device-bound salt, 30-day TTL, no server writes pre-migration
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for GCM
const SALT_LENGTH = 16;

export interface EncryptedBlob {
  ciphertext: string; // base64
  iv: string; // base64
  salt: string; // base64
  timestamp: number; // encryption timestamp for TTL
}

/**
 * Generates a device-bound salt using available entropy
 * Falls back to crypto.getRandomValues if no device identifiers available
 */
async function getDeviceBoundSalt(): Promise<Uint8Array> {
  const salt = new Uint8Array(SALT_LENGTH);

  // Use crypto.getRandomValues for strong randomness
  // In production, you could augment with device-specific data (screen resolution, timezone, etc.)
  // but avoid PII (no MAC addresses, user agent fingerprinting with identifiable info)
  crypto.getRandomValues(salt);

  return salt;
}

/**
 * Derives a cryptographic key from a password using PBKDF2
 * @param password - User password or device-bound identifier
 * @param salt - Salt for key derivation
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // OWASP recommendation
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates a device-bound encryption key
 * Uses device entropy + localStorage persistence
 */
export async function generateDeviceKey(): Promise<string> {
  const DEVICE_KEY_STORAGE = 'guest_device_key';

  // Check if device key already exists
  let deviceKey = localStorage.getItem(DEVICE_KEY_STORAGE);

  if (!deviceKey) {
    // Generate new device key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    deviceKey = btoa(String.fromCharCode(...randomBytes));
    localStorage.setItem(DEVICE_KEY_STORAGE, deviceKey);
  }

  return deviceKey;
}

/**
 * Encrypts data using AES-GCM with device-bound salt
 * @param data - Plain object to encrypt
 * @returns EncryptedBlob with ciphertext, iv, salt, and timestamp
 */
export async function encrypt<T>(data: T): Promise<EncryptedBlob> {
  try {
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(JSON.stringify(data));

    // Generate device-bound salt and IV
    const salt = await getDeviceBoundSalt();
    const iv = new Uint8Array(IV_LENGTH);
    crypto.getRandomValues(iv);

    // Derive encryption key
    const deviceKey = await generateDeviceKey();
    const key = await deriveKey(deviceKey, salt);

    // Encrypt
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      plaintext
    );

    // Convert to base64 for storage
    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt)),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[crypto] Encryption failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts an EncryptedBlob back to original data
 * @param blob - Encrypted blob with ciphertext, iv, and salt
 * @returns Decrypted data
 */
export async function decrypt<T>(blob: EncryptedBlob): Promise<T> {
  try {
    const decoder = new TextDecoder();

    // Decode from base64
    const ciphertext = Uint8Array.from(atob(blob.ciphertext), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(blob.iv), c => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(blob.salt), c => c.charCodeAt(0));

    // Derive decryption key
    const deviceKey = await generateDeviceKey();
    const key = await deriveKey(deviceKey, salt);

    // Decrypt
    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    const json = decoder.decode(plaintext);
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('[crypto] Decryption failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Decryption failed');
  }
}

/**
 * Checks if an encrypted blob has exceeded TTL (30 days)
 * @param blob - Encrypted blob with timestamp
 * @param ttlDays - Time-to-live in days (default 30)
 */
export function isExpired(blob: EncryptedBlob, ttlDays = 30): boolean {
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  return Date.now() - blob.timestamp > ttlMs;
}

/**
 * Securely wipes encryption keys and data
 * Overwrites localStorage entries before deletion
 */
export function wipeEncryptionKeys(): void {
  const DEVICE_KEY_STORAGE = 'guest_device_key';

  // Overwrite with random data before deletion (defense in depth)
  const randomData = new Uint8Array(32);
  crypto.getRandomValues(randomData);
  localStorage.setItem(DEVICE_KEY_STORAGE, btoa(String.fromCharCode(...randomData)));

  // Delete
  localStorage.removeItem(DEVICE_KEY_STORAGE);
}

/**
 * Browser compatibility check for WebCrypto API
 */
export function isWebCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
}
