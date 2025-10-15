# Guest Mode Quick Start Guide

**5-minute integration guide for developers**

---

## 1. Files Overview

You have 4 new core files + 3 test files + 3 docs:

```
src/
├── lib/crypto.ts                    # Encryption utilities
├── types/guest.ts                   # Type definitions
├── stores/guestStore.ts             # State management
└── services/migrateGuestToAccount.ts # Migration logic

src/__tests__/
├── crypto.test.ts
├── guestStore.test.ts
└── migrateGuestToAccount.test.ts

docs/
├── GUEST-MODE-DESIGN.md             # Full documentation
├── GUEST-MODE-UI-INTEGRATION.md     # UI examples
├── GUEST-MODE-SUMMARY.md            # Implementation summary
└── GUEST-MODE-QUICKSTART.md         # This file
```

---

## 2. Run Tests (Verify Installation)

```bash
npm run test crypto.test.ts
npm run test guestStore.test.ts
npm run test migrateGuestToAccount.test.ts
```

Expected: All 130 tests pass ✅

---

## 3. Basic Usage (5 Lines)

### Enter Guest Mode

```typescript
import { useGuestStore } from '@/stores/guestStore';

const store = useGuestStore();
await store.enterGuestMode();
```

### Create a Session

```typescript
const session = await store.createSession({
  name: 'Morning Workout',
  date: new Date().toISOString(),
  type: 'cardio',
  status: 'completed',
  duration_minutes: 30,
});
```

### Add Exercises

```typescript
await store.createExercise({
  session_id: session.id,
  name: 'Running',
  type: 'cardio',
  duration_seconds: 1800,
  order_index: 0,
});
```

### Get Stats

```typescript
const stats = store.getStats();
console.log(`Total sessions: ${stats.total_sessions}`);
```

### Migrate to Account

```typescript
import { migrateGuestToAccount } from '@/services/migrateGuestToAccount';

const result = await migrateGuestToAccount(userId, 'merge_newest');
if (result.success) {
  console.log(`Migrated ${result.sessions_migrated} sessions`);
}
```

---

## 4. Add to Your App (3 Steps)

### Step 1: Add Welcome Screen Button

```tsx
// src/pages/Welcome.tsx
import { useGuestStore } from '@/stores/guestStore';

export function Welcome() {
  const enterGuestMode = useGuestStore(state => state.enterGuestMode);

  const handleTryGuest = async () => {
    await enterGuestMode();
    navigate('/guest/dashboard');
  };

  return (
    <div>
      <button onClick={() => navigate('/login')}>Sign In</button>
      <button onClick={() => navigate('/register')}>Create Account</button>
      <button onClick={handleTryGuest}>Try Without Account</button>
    </div>
  );
}
```

### Step 2: Create Guest Dashboard

```tsx
// src/pages/GuestDashboard.tsx
import { useGuestStore } from '@/stores/guestStore';

export function GuestDashboard() {
  const { getSessions, getStats } = useGuestStore();
  const sessions = getSessions();
  const stats = getStats();

  return (
    <div>
      <h1>Your Workouts</h1>
      <p>Total sessions: {stats.total_sessions}</p>
      <p>Total time: {stats.total_duration_minutes} min</p>

      <button onClick={() => navigate('/guest/session/new')}>
        New Session
      </button>

      <ul>
        {sessions.map(session => (
          <li key={session.id}>
            <a href={`/guest/session/${session.id}`}>{session.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 3: Add Migration Screen

```tsx
// src/pages/Migrate.tsx
import { migrateGuestToAccount } from '@/services/migrateGuestToAccount';
import { useAuthStore } from '@/stores/authStore';

export function Migrate() {
  const user = useAuthStore(state => state.user);

  const handleMigrate = async () => {
    const result = await migrateGuestToAccount(user!.id, 'merge_newest');
    if (result.success) {
      alert(`Migrated ${result.sessions_migrated} sessions!`);
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <h1>Import Guest Data</h1>
      <button onClick={handleMigrate}>Start Migration</button>
    </div>
  );
}
```

---

## 5. Add Routes

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/welcome" element={<Welcome />} />
  <Route path="/guest/dashboard" element={<GuestDashboard />} />
  <Route path="/migrate" element={<Migrate />} />
  {/* ... existing routes */}
</Routes>
```

---

## 6. Auto-Load Guest Data

```tsx
// src/App.tsx or src/main.tsx
import { useEffect } from 'react';
import { useGuestStore } from '@/stores/guestStore';

function App() {
  const load = useGuestStore(state => state.load);

  useEffect(() => {
    load(); // Auto-load guest data if exists
  }, []);

  return <Routes>{/* ... */}</Routes>;
}
```

---

## 7. Show Guest Mode Indicator

```tsx
// src/components/Header.tsx
import { useGuestStore } from '@/stores/guestStore';

export function Header() {
  const isGuestMode = useGuestStore(state => state.isGuestMode);

  return (
    <header>
      {isGuestMode && (
        <span className="badge">👤 Guest Mode</span>
      )}
    </header>
  );
}
```

---

## 8. TTL Warning

```tsx
// src/components/GuestWarning.tsx
import { useGuestStore } from '@/stores/guestStore';
import { useEffect, useState } from 'react';

export function GuestWarning() {
  const expiresAt = useGuestStore(state => state.expiresAt);
  const [daysLeft, setDaysLeft] = useState(30);

  useEffect(() => {
    if (expiresAt) {
      const days = Math.floor((expiresAt - Date.now()) / (24*60*60*1000));
      setDaysLeft(days);
    }
  }, [expiresAt]);

  if (daysLeft > 7) return null;

  return (
    <div className="alert alert-warning">
      ⚠️ Guest data expires in {daysLeft} days.
      <button onClick={() => navigate('/register')}>Create Account</button>
    </div>
  );
}
```

---

## 9. Test Manually

### Test 1: Create Guest Session
1. Go to `/welcome`
2. Click "Try Without Account"
3. Create a session
4. Refresh page → session still there ✅

### Test 2: Migration
1. Register new account
2. See migration prompt
3. Click "Start Migration"
4. Check server for migrated sessions ✅

### Test 3: TTL Expiry
1. Open DevTools → Application → Local Storage
2. Find `revia_guest_data`
3. Edit `encrypted.timestamp` to 31 days ago
4. Refresh page → data cleared ✅

---

## 10. Check Everything Works

```bash
# Run tests
npm run test

# Build
npm run build

# Start dev server
npm run dev
```

Visit:
- `/welcome` → Should see "Try Without Account"
- `/guest/dashboard` → Should see empty state
- Create session → Should encrypt to localStorage

Check localStorage:
```javascript
// In browser console
localStorage.getItem('revia_guest_data')
// Should see encrypted JSON blob
```

---

## Common Issues

**Issue**: "Cannot find module '@/stores/guestStore'"
**Fix**: Check path alias in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Issue**: "WebCrypto not supported"
**Fix**: Use HTTPS (not HTTP) or localhost

**Issue**: Tests failing
**Fix**: Run `npm install` to ensure all deps installed

---

## Next Steps

1. ✅ Tests passing
2. ✅ Manual testing complete
3. ⬜ Add UI components (see `GUEST-MODE-UI-INTEGRATION.md`)
4. ⬜ Style components
5. ⬜ Add E2E tests
6. ⬜ Deploy to staging
7. ⬜ User testing

---

## Full Documentation

- **Architecture**: `docs/GUEST-MODE-DESIGN.md` (900 lines)
- **UI Examples**: `docs/GUEST-MODE-UI-INTEGRATION.md` (850 lines)
- **Summary**: `docs/GUEST-MODE-SUMMARY.md` (500 lines)

---

## API Cheat Sheet

### Store Methods

```typescript
// Lifecycle
enterGuestMode() → Promise<void>
exitGuestMode() → Promise<void>
load() → Promise<void>
save() → Promise<void>
clear() → Promise<void>

// Sessions
createSession(data) → Promise<GuestSession>
updateSession(id, updates) → Promise<void>
deleteSession(id) → Promise<void>
getSession(id) → GuestSession | null
getSessions() → GuestSession[]

// Exercises
createExercise(data) → Promise<GuestExercise>
updateExercise(id, updates) → Promise<void>
deleteExercise(id) → Promise<void>
getExercises(sessionId) → GuestExercise[]

// Stats & TTL
getStats() → GuestStats
checkTTL() → boolean (true if expired)
```

### Migration Functions

```typescript
// Main migration
migrateGuestToAccount(userId, strategy) → Promise<MigrationResult>

// Helpers
validateGuestDataBeforeMigration() → Promise<ValidationResult>
previewMigration(userId, strategy) → Promise<Preview>
estimateMigrationTime(sessions, exercises) → number
```

### Strategies

- `'merge_newest'` - Keep most recent (recommended)
- `'keep_guest'` - Prefer guest data
- `'keep_server'` - Prefer server data
- `'merge_both'` - Keep both, rename guest

---

## That's It! 🎉

You now have a fully functional guest mode system.

**Questions?** Check:
1. `docs/GUEST-MODE-DESIGN.md` - Architecture
2. `docs/GUEST-MODE-UI-INTEGRATION.md` - UI examples
3. Test files - Usage examples

**Happy coding!**
