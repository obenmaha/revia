# Guest Mode Design Documentation

## Overview

Guest mode allows users to track workouts offline without creating an account. Data is encrypted client-side using AES-GCM and stored in localStorage with a 30-day TTL. Users can later migrate their data to a full account with conflict resolution.

## Architecture

### Security Constraints

1. **No server writes pre-migration** - All data stays local until migration
2. **Encrypted storage** - AES-GCM 256-bit encryption via WebCrypto API
3. **Device-bound salt** - Unique salt per encryption operation
4. **30-day TTL** - Automatic expiry with timestamp checks
5. **No PII in logs** - Error messages sanitized to prevent data leaks
6. **Secure wipe** - Overwrite-then-delete on migration/expiry

### Components

```
src/
├── lib/
│   └── crypto.ts                    # AES-GCM encryption utilities
├── types/
│   └── guest.ts                     # Guest mode type definitions
├── stores/
│   └── guestStore.ts                # Zustand store with encrypted persistence
├── services/
│   └── migrateGuestToAccount.ts     # Migration service with conflict resolution
└── __tests__/
    ├── crypto.test.ts               # Encryption tests
    ├── guestStore.test.ts           # Store and TTL tests
    └── migrateGuestToAccount.test.ts # Migration tests
```

---

## Encryption Layer (`src/lib/crypto.ts`)

### WebCrypto AES-GCM Implementation

**Algorithm**: AES-GCM with 256-bit keys
**Key Derivation**: PBKDF2 with 100,000 iterations
**IV**: 96-bit random (12 bytes)
**Salt**: 128-bit random (16 bytes) per encryption

### Core Functions

#### `encrypt<T>(data: T): Promise<EncryptedBlob>`

Encrypts data and returns:
```typescript
{
  ciphertext: string; // base64
  iv: string;         // base64
  salt: string;       // base64
  timestamp: number;  // Unix ms
}
```

**Process**:
1. Generate device key (persisted in localStorage)
2. Generate random salt and IV
3. Derive encryption key via PBKDF2
4. Encrypt data with AES-GCM
5. Return base64-encoded blob with timestamp

#### `decrypt<T>(blob: EncryptedBlob): Promise<T>`

Decrypts an encrypted blob:
1. Retrieve device key
2. Derive decryption key with stored salt
3. Decrypt ciphertext
4. Parse and return JSON

#### `isExpired(blob: EncryptedBlob, ttlDays: number): boolean`

Checks if data exceeded TTL (default 30 days).

#### `wipeEncryptionKeys(): void`

Securely deletes encryption keys:
1. Overwrite with random data
2. Delete from localStorage

---

## Guest Store (`src/stores/guestStore.ts`)

### State

```typescript
{
  isGuestMode: boolean;
  data: GuestData | null;
  isLoading: boolean;
  error: string | null;
  lastSync: number | null;
  expiresAt: number | null;
}
```

### GuestData Structure

```typescript
{
  sessions: GuestSession[];
  exercises: GuestExercise[];
  stats: GuestStats;
  version: number;
  created_at: string;
  updated_at: string;
}
```

### Key Actions

#### `enterGuestMode()`
- Creates empty guest data or loads existing
- Sets 30-day expiry
- Validates WebCrypto support

#### `createSession(data) → GuestSession`
- Generates UUID
- Adds timestamps
- Recalculates stats
- Encrypts and saves

#### `createExercise(data) → GuestExercise`
- Links to session via `session_id`
- Supports: sets, reps, weight, duration, distance, RPE
- Maintains `order_index` for sorting

#### `getStats() → GuestStats`
- Total sessions/exercises
- Total duration
- Sessions by type
- Average RPE
- Last session date

#### `checkTTL() → boolean`
- Returns `true` if expired
- Called on `load()`

#### `clear()`
- Secure wipe of all data
- Overwrites localStorage before deletion
- Wipes encryption keys

---

## Migration Service (`src/services/migrateGuestToAccount.ts`)

### Migration Flow

```
1. Load & decrypt guest data
2. Fetch existing server sessions
3. Detect conflicts
4. Apply resolution strategy
5. Insert sessions (one by one to get IDs)
6. Insert exercises (linked to new session IDs)
7. Wipe guest data on success
```

### Conflict Detection

Conflicts occur when:
- Same date + same name
- Same date + similar duration (±5 min)

### Conflict Resolution Strategies

#### `keep_guest`
Prefer guest data, skip server duplicates

#### `keep_server`
Prefer server data, skip guest duplicates

#### `merge_newest`
Compare `updated_at` timestamps, keep most recent

#### `merge_both`
Keep both, rename guest session with " (imported)" suffix

### Functions

#### `migrateGuestToAccount(userId, strategy) → MigrationResult`

Main migration function. Returns:
```typescript
{
  success: boolean;
  sessions_migrated: number;
  exercises_migrated: number;
  conflicts_resolved: number;
  errors: string[];
  strategy_used: ConflictResolutionStrategy;
}
```

**Error Handling**:
- Logs errors without PII
- Continues migration on individual failures
- Only wipes guest data if at least one item migrated successfully
- Leaves guest data intact on complete failure (allows retry)

#### `validateGuestDataBeforeMigration() → ValidationResult`

Pre-flight checks:
- TTL expiry
- Orphaned exercises
- Invalid dates
- Schema compliance

#### `previewMigration(userId, strategy) → Preview`

Dry-run without server writes:
```typescript
{
  sessions_to_migrate: number;
  exercises_to_migrate: number;
  conflicts: MigrationConflict[];
  estimated_time_ms: number;
}
```

#### `estimateMigrationTime(sessionCount, exerciseCount) → number`

Rough estimate: 200ms/session + 100ms/exercise

---

## Type Definitions (`src/types/guest.ts`)

### GuestSession

```typescript
{
  id: string;                 // UUID
  name: string;
  date: string;               // ISO date
  type: 'cardio' | 'musculation' | 'flexibility' | 'other';
  status: 'draft' | 'in_progress' | 'completed';
  duration_minutes: number;
  rpe_score?: number;         // 1-10
  pain_level?: number;        // 1-10
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### GuestExercise

```typescript
{
  id: string;                 // UUID
  session_id: string;         // Links to GuestSession
  name: string;
  type: 'cardio' | 'musculation' | 'flexibility' | 'other';
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  rpe?: number;               // 1-10
  notes?: string;
  order_index: number;        // For sorting
  created_at: string;
  updated_at: string;
}
```

### Validation

Zod schemas for runtime validation:
- `guestSessionSchema`
- `guestExerciseSchema`
- `guestDataSchema`

Type guards:
- `isGuestSession(obj)`
- `isGuestExercise(obj)`
- `isGuestData(obj)`

---

## Storage Format

### localStorage Keys

- `revia_guest_data` - Encrypted guest data
- `guest_device_key` - Device encryption key

### Encrypted Storage Structure

```typescript
{
  encrypted: {
    ciphertext: string;
    iv: string;
    salt: string;
    timestamp: number;
  },
  metadata: {
    version: number;          // Schema version (1)
    last_accessed: number;    // Unix ms
    expires_at: number;       // Unix ms (now + 30 days)
    session_count: number;    // Quick check without decryption
  }
}
```

---

## Testing

### Test Coverage

#### `crypto.test.ts` (60 tests)

**Encryption/Decryption**:
- Simple and complex data structures
- Arrays and nested objects
- Empty data
- Unicode and special characters
- Large data (1MB)

**Security**:
- Unique IVs per encryption
- Unique salts per encryption
- Tamper detection (ciphertext, IV)
- No PII in error logs
- 256-bit key strength

**TTL**:
- Fresh data not expired
- Old data expired (30+ days)
- Exact boundary conditions
- Custom TTL values

**Secure Wipe**:
- Key removal
- Overwrite before deletion
- No-op on missing keys

#### `guestStore.test.ts` (40 tests)

**Lifecycle**:
- Enter/exit guest mode
- Load existing data
- Clear and wipe

**Session Management**:
- Create/update/delete
- Get single/all sessions
- Non-existent sessions return null

**Exercise Management**:
- Create/update/delete
- Link to sessions
- Sort by order_index
- Cascade delete with sessions

**Statistics**:
- Total sessions/exercises
- Total duration
- Sessions by type
- Average RPE
- Last session date

**TTL**:
- Check expiry
- Auto-clear on load
- Fresh data not expired

**Persistence**:
- Data survives store reload
- Encrypted in localStorage
- lastSync updated

**Security**:
- No PII in logs
- Overwrite before wipe

#### `migrateGuestToAccount.test.ts` (30 tests)

**No Conflicts**:
- Migrate sessions successfully
- Migrate exercises with sessions
- Handle empty guest data

**Conflict Resolution**:
- Detect duplicates (name+date, duration)
- `keep_guest` strategy
- `keep_server` strategy
- `merge_newest` strategy
- `merge_both` strategy

**Validation**:
- Valid data passes
- Detect expired data
- Detect orphaned exercises
- Detect invalid dates

**Preview**:
- Dry-run without writes
- Estimate migration time
- List conflicts

**Error Handling**:
- Supabase insert errors
- Don't clear data on failure
- Skip exercises if session fails

**Security**:
- No PII in logs
- Wipe after success

---

## Security Analysis

### Threats Mitigated

1. **Data theft via localStorage inspection**
   - ✅ Encrypted with AES-GCM
   - ✅ Device-bound keys

2. **Cross-device data access**
   - ✅ Device key not portable
   - ✅ Salt unique per encryption

3. **Stale data accumulation**
   - ✅ 30-day TTL enforced
   - ✅ Auto-wipe on expiry

4. **PII leakage via logs**
   - ✅ Error messages sanitized
   - ✅ No sensitive data in console

5. **Data remnants after migration**
   - ✅ Overwrite-then-delete
   - ✅ Keys wiped separately

### Threats NOT Mitigated

1. **XSS attacks** - If attacker injects JS, can read decrypted data in memory
2. **Browser extension snooping** - Extensions with page access can see decrypted state
3. **Physical device theft** - If device unlocked, attacker can use guest mode
4. **Forensic recovery** - Overwrite once may not prevent advanced recovery (SSD wear leveling)

### Recommendations

1. Prompt migration to account frequently (e.g., after 3 sessions)
2. Show TTL countdown in UI (e.g., "Data expires in 23 days")
3. Add optional biometric lock for guest mode on mobile
4. Consider IndexedDB for larger datasets (localStorage has ~5MB limit)

---

## Usage Example

### Enter Guest Mode

```typescript
import { useGuestStore } from '@/stores/guestStore';

const store = useGuestStore();

// Enter guest mode
await store.enterGuestMode();
```

### Create Session

```typescript
const session = await store.createSession({
  name: 'Morning Workout',
  date: new Date().toISOString(),
  type: 'cardio',
  status: 'completed',
  duration_minutes: 45,
  rpe_score: 7,
  pain_level: 2,
});
```

### Add Exercises

```typescript
await store.createExercise({
  session_id: session.id,
  name: 'Running',
  type: 'cardio',
  duration_seconds: 1800,
  distance_meters: 5000,
  rpe: 7,
  order_index: 0,
});

await store.createExercise({
  session_id: session.id,
  name: 'Stretching',
  type: 'flexibility',
  duration_seconds: 600,
  order_index: 1,
});
```

### View Stats

```typescript
const stats = store.getStats();
console.log(`Total sessions: ${stats.total_sessions}`);
console.log(`Total duration: ${stats.total_duration_minutes} min`);
console.log(`Average RPE: ${stats.avg_rpe}`);
```

### Check TTL

```typescript
if (store.checkTTL()) {
  console.warn('Guest data expired, please migrate to account');
}
```

### Migrate to Account

```typescript
import { migrateGuestToAccount, previewMigration } from '@/services/migrateGuestToAccount';

// Preview migration
const preview = await previewMigration(userId, 'merge_newest');
console.log(`Will migrate ${preview.sessions_to_migrate} sessions`);
console.log(`Estimated time: ${preview.estimated_time_ms}ms`);

if (preview.conflicts.length > 0) {
  console.warn(`Found ${preview.conflicts.length} conflicts`);
}

// Perform migration
const result = await migrateGuestToAccount(userId, 'merge_newest');

if (result.success) {
  console.log(`Migrated ${result.sessions_migrated} sessions and ${result.exercises_migrated} exercises`);
} else {
  console.error('Migration failed:', result.errors);
}
```

---

## Performance Considerations

### Encryption Overhead

- **Encrypt 1KB**: ~2-5ms
- **Encrypt 100KB**: ~10-20ms
- **Decrypt 1KB**: ~2-5ms
- **Decrypt 100KB**: ~10-20ms

PBKDF2 key derivation (100k iterations): ~50-100ms on modern hardware

### localStorage Limits

- **Chrome/Edge**: 5-10MB per origin
- **Firefox**: 10MB per origin
- **Safari**: 5MB per origin

**Estimated capacity**:
- 1 session ≈ 0.5KB plaintext → 1KB encrypted
- 1 exercise ≈ 0.3KB plaintext → 0.6KB encrypted
- **~2500 sessions** or **~8000 exercises** before hitting 5MB limit

### Migration Time

- Single session: ~200ms (Supabase insert + network)
- Single exercise: ~100ms
- **Example**: 50 sessions + 200 exercises = 10s + 20s = 30s total

---

## Future Enhancements

1. **Progressive migration** - Migrate in batches to avoid long blocking operations
2. **Background sync** - Automatic migration after account creation
3. **IndexedDB storage** - Support larger datasets
4. **Compression** - gzip before encryption to reduce storage
5. **Biometric lock** - Optional Face ID/Touch ID for guest data access
6. **Cloud backup** - Encrypted backup to user's cloud storage (iCloud, Google Drive)
7. **Multi-device sync** - Optional P2P sync between devices via QR code
8. **Export/import** - Allow manual backup as encrypted file

---

## Dependencies

```json
{
  "zustand": "^4.x",        // State management
  "uuid": "^9.x",           // UUID generation
  "zod": "^3.x"             // Runtime validation
}
```

**Native APIs**:
- WebCrypto API (`crypto.subtle`)
- localStorage
- TextEncoder/TextDecoder

---

## Browser Compatibility

✅ Chrome/Edge 37+
✅ Firefox 34+
✅ Safari 11+
✅ iOS Safari 11+
✅ Chrome Android 37+

**Fallback**: If WebCrypto unavailable, display warning and disable guest mode.

---

## Compliance Notes

- **GDPR**: Data stored locally, user-controlled deletion
- **HIPAA**: Not suitable for PHI without additional safeguards (device encryption, access logs)
- **CCPA**: User can export/delete via migration or wipe

**Recommendation**: For medical applications, add disclaimer that guest mode is for casual use only, not for storing sensitive health information.

---

## Changelog

### v1.0.0 (2024)
- Initial implementation
- AES-GCM encryption with device-bound keys
- 30-day TTL with auto-expiry
- Conflict resolution strategies
- Comprehensive test coverage
- Security hardening (no PII in logs, secure wipe)

---

## Contact

For questions or issues, see:
- Source: `src/lib/crypto.ts`, `src/stores/guestStore.ts`, `src/services/migrateGuestToAccount.ts`
- Tests: `src/__tests__/crypto.test.ts`, `src/__tests__/guestStore.test.ts`, `src/__tests__/migrateGuestToAccount.test.ts`
- Types: `src/types/guest.ts`
