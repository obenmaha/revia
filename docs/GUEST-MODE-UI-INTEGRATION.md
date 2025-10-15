# Guest Mode UI Integration Guide

Quick reference for integrating guest mode into the Revia UI.

---

## 1. Entry Point: Login/Welcome Screen

### Add "Try Without Account" Button

```tsx
// src/components/auth/WelcomeScreen.tsx
import { useGuestStore } from '@/stores/guestStore';
import { useNavigate } from 'react-router-dom';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const enterGuestMode = useGuestStore(state => state.enterGuestMode);

  const handleGuestMode = async () => {
    try {
      await enterGuestMode();
      navigate('/guest/dashboard');
    } catch (error) {
      console.error('Failed to enter guest mode:', error);
      // Show error toast
    }
  };

  return (
    <div>
      <h1>Welcome to Revia</h1>
      <button onClick={() => navigate('/login')}>Sign In</button>
      <button onClick={() => navigate('/register')}>Create Account</button>
      <button onClick={handleGuestMode} variant="ghost">
        Try Without Account
      </button>
    </div>
  );
}
```

---

## 2. Guest Dashboard

### Show TTL Warning and Stats

```tsx
// src/components/guest/GuestDashboard.tsx
import { useGuestStore } from '@/stores/guestStore';
import { useEffect, useState } from 'react';

export function GuestDashboard() {
  const { data, expiresAt, getStats } = useGuestStore();
  const stats = getStats();
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (expiresAt) {
      const days = Math.floor((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
      setDaysRemaining(Math.max(0, days));
    }
  }, [expiresAt]);

  return (
    <div>
      {/* TTL Warning Banner */}
      {daysRemaining <= 7 && (
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
          <h3>⚠️ Guest Data Expires Soon</h3>
          <p>Your data will be deleted in {daysRemaining} days.</p>
          <button onClick={() => navigate('/register')}>
            Create Account to Keep Data
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Sessions"
          value={stats.total_sessions}
          icon="🏋️"
        />
        <StatCard
          title="Total Time"
          value={`${stats.total_duration_minutes} min`}
          icon="⏱️"
        />
        <StatCard
          title="Avg RPE"
          value={stats.avg_rpe?.toFixed(1) || 'N/A'}
          icon="💪"
        />
      </div>

      {/* Session List */}
      <SessionList sessions={data?.sessions || []} />
    </div>
  );
}
```

---

## 3. Create Session

### Use Guest Store Instead of Server

```tsx
// src/components/guest/CreateGuestSession.tsx
import { useGuestStore } from '@/stores/guestStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreateGuestSession() {
  const navigate = useNavigate();
  const createSession = useGuestStore(state => state.createSession);

  const [form, setForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'cardio' as const,
    duration_minutes: 30,
    rpe_score: 5,
    pain_level: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await createSession({
        ...form,
        status: 'draft',
        date: new Date(form.date).toISOString(),
      });

      navigate(`/guest/session/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      // Show error toast
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Session name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
      />

      <input
        type="date"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
      />

      <select
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value as any })}
      >
        <option value="cardio">Cardio</option>
        <option value="musculation">Musculation</option>
        <option value="flexibility">Flexibility</option>
        <option value="other">Other</option>
      </select>

      <input
        type="number"
        placeholder="Duration (minutes)"
        value={form.duration_minutes}
        onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })}
        min={1}
        max={600}
      />

      <label>
        RPE (1-10):
        <input
          type="range"
          value={form.rpe_score}
          onChange={e => setForm({ ...form, rpe_score: Number(e.target.value) })}
          min={1}
          max={10}
        />
        <span>{form.rpe_score}</span>
      </label>

      <button type="submit">Create Session</button>
    </form>
  );
}
```

---

## 4. Session Detail with Exercises

```tsx
// src/components/guest/GuestSessionDetail.tsx
import { useGuestStore } from '@/stores/guestStore';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

export function GuestSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    getSession,
    getExercises,
    updateSession,
    createExercise,
    deleteExercise,
  } = useGuestStore();

  const session = getSession(sessionId!);
  const exercises = getExercises(sessionId!);
  const [editingExercise, setEditingExercise] = useState(false);

  if (!session) {
    return <div>Session not found</div>;
  }

  const handleAddExercise = async (exerciseData: any) => {
    try {
      await createExercise({
        session_id: sessionId!,
        ...exerciseData,
        order_index: exercises.length,
      });
      setEditingExercise(false);
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  };

  const handleCompleteSession = async () => {
    try {
      await updateSession(sessionId!, { status: 'completed' });
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  return (
    <div>
      <h1>{session.name}</h1>
      <p>Date: {new Date(session.date).toLocaleDateString()}</p>
      <p>Duration: {session.duration_minutes} min</p>
      <p>Type: {session.type}</p>
      <p>Status: {session.status}</p>

      {/* Exercises List */}
      <div>
        <h2>Exercises ({exercises.length})</h2>
        {exercises.map(exercise => (
          <div key={exercise.id} className="border p-4 rounded mb-2">
            <h3>{exercise.name}</h3>
            <p>Type: {exercise.type}</p>
            {exercise.sets && <p>Sets: {exercise.sets}</p>}
            {exercise.reps && <p>Reps: {exercise.reps}</p>}
            {exercise.weight_kg && <p>Weight: {exercise.weight_kg} kg</p>}
            {exercise.duration_seconds && (
              <p>Duration: {Math.floor(exercise.duration_seconds / 60)} min</p>
            )}
            {exercise.rpe && <p>RPE: {exercise.rpe}/10</p>}
            <button onClick={() => deleteExercise(exercise.id)}>Delete</button>
          </div>
        ))}
      </div>

      <button onClick={() => setEditingExercise(true)}>Add Exercise</button>

      {session.status !== 'completed' && (
        <button onClick={handleCompleteSession}>Complete Session</button>
      )}

      {/* Add Exercise Modal */}
      {editingExercise && (
        <ExerciseForm
          onSubmit={handleAddExercise}
          onCancel={() => setEditingExercise(false)}
        />
      )}
    </div>
  );
}
```

---

## 5. Migration Flow

### Step 1: Show Migration Prompt After Registration

```tsx
// src/components/auth/RegisterSuccess.tsx
import { useGuestStore } from '@/stores/guestStore';
import { useState, useEffect } from 'react';
import { previewMigration } from '@/services/migrateGuestToAccount';

export function RegisterSuccess({ userId }: { userId: string }) {
  const { data, isGuestMode } = useGuestStore();
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    if (isGuestMode && data && data.sessions.length > 0) {
      // Show migration prompt
      loadPreview();
    }
  }, [isGuestMode, data]);

  const loadPreview = async () => {
    const result = await previewMigration(userId, 'merge_newest');
    setPreview(result);
  };

  if (!preview) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded">
      <h2>🎉 Account Created Successfully!</h2>
      <p>You have {preview.sessions_to_migrate} sessions from guest mode.</p>
      <p>Would you like to import them to your account?</p>

      {preview.conflicts.length > 0 && (
        <p className="text-yellow-600">
          ⚠️ {preview.conflicts.length} potential conflicts detected
        </p>
      )}

      <button onClick={() => navigate('/migrate')}>
        Import Guest Data
      </button>
      <button onClick={() => navigate('/dashboard')} variant="ghost">
        Skip (Data will be deleted in {Math.floor((expiresAt - Date.now()) / (24*60*60*1000))} days)
      </button>
    </div>
  );
}
```

### Step 2: Migration Screen

```tsx
// src/components/guest/MigrationScreen.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  migrateGuestToAccount,
  previewMigration,
  validateGuestDataBeforeMigration,
} from '@/services/migrateGuestToAccount';
import { useAuthStore } from '@/stores/authStore';
import type { ConflictResolutionStrategy } from '@/types/guest';

export function MigrationScreen() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [strategy, setStrategy] = useState<ConflictResolutionStrategy>('merge_newest');
  const [preview, setPreview] = useState<any>(null);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadPreview();
    validateData();
  }, [strategy]);

  const loadPreview = async () => {
    if (!user) return;
    const p = await previewMigration(user.id, strategy);
    setPreview(p);
  };

  const validateData = async () => {
    const validation = await validateGuestDataBeforeMigration();
    if (!validation.valid) {
      // Show errors
    }
  };

  const handleMigrate = async () => {
    if (!user) return;

    setMigrating(true);
    try {
      const res = await migrateGuestToAccount(user.id, strategy);
      setResult(res);

      if (res.success) {
        // Show success, redirect after 3s
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setMigrating(false);
    }
  };

  if (result) {
    return (
      <div>
        {result.success ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded">
            <h2>✅ Migration Successful!</h2>
            <p>Migrated {result.sessions_migrated} sessions and {result.exercises_migrated} exercises</p>
            {result.conflicts_resolved > 0 && (
              <p>Resolved {result.conflicts_resolved} conflicts</p>
            )}
            <p>Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 p-6 rounded">
            <h2>❌ Migration Failed</h2>
            <p>Some errors occurred:</p>
            <ul>
              {result.errors.map((err: string, i: number) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
            <button onClick={() => setResult(null)}>Try Again</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Import Guest Data</h1>

      {/* Preview */}
      {preview && (
        <div className="bg-gray-50 p-4 rounded mb-4">
          <h3>Preview</h3>
          <p>Sessions to import: {preview.sessions_to_migrate}</p>
          <p>Exercises to import: {preview.exercises_to_migrate}</p>
          <p>Estimated time: {Math.ceil(preview.estimated_time_ms / 1000)}s</p>

          {preview.conflicts.length > 0 && (
            <div className="mt-4">
              <h4 className="text-yellow-600">⚠️ Conflicts Detected</h4>
              <p>{preview.conflicts.length} sessions overlap with existing data</p>
            </div>
          )}
        </div>
      )}

      {/* Strategy Selection */}
      <div className="mb-4">
        <h3>Conflict Resolution</h3>
        <label className="block">
          <input
            type="radio"
            value="merge_newest"
            checked={strategy === 'merge_newest'}
            onChange={e => setStrategy(e.target.value as any)}
          />
          Keep Newest (Recommended)
        </label>
        <label className="block">
          <input
            type="radio"
            value="keep_guest"
            checked={strategy === 'keep_guest'}
            onChange={e => setStrategy(e.target.value as any)}
          />
          Keep Guest Data
        </label>
        <label className="block">
          <input
            type="radio"
            value="keep_server"
            checked={strategy === 'keep_server'}
            onChange={e => setStrategy(e.target.value as any)}
          />
          Keep Server Data
        </label>
        <label className="block">
          <input
            type="radio"
            value="merge_both"
            checked={strategy === 'merge_both'}
            onChange={e => setStrategy(e.target.value as any)}
          />
          Keep Both (May create duplicates)
        </label>
      </div>

      <button
        onClick={handleMigrate}
        disabled={migrating}
        className="bg-blue-500 text-white px-6 py-2 rounded"
      >
        {migrating ? 'Migrating...' : 'Start Migration'}
      </button>

      <button
        onClick={() => navigate('/dashboard')}
        variant="ghost"
        disabled={migrating}
      >
        Skip for Now
      </button>
    </div>
  );
}
```

---

## 6. Route Protection

### Guest vs Authenticated Routes

```tsx
// src/components/routing/ProtectedRoute.tsx
import { useAuthStore } from '@/stores/authStore';
import { useGuestStore } from '@/stores/guestStore';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isGuestMode = useGuestStore(state => state.isGuestMode);

  if (!isAuthenticated && !isGuestMode) {
    return <Navigate to="/welcome" />;
  }

  return <>{children}</>;
}

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const isGuestMode = useGuestStore(state => state.isGuestMode);

  if (!isGuestMode) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

export function AuthOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/welcome" />;
  }

  return <>{children}</>;
}
```

### Route Configuration

```tsx
// src/App.tsx or src/router.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />

        {/* Guest Routes */}
        <Route path="/guest" element={<GuestOnlyRoute><GuestLayout /></GuestOnlyRoute>}>
          <Route path="dashboard" element={<GuestDashboard />} />
          <Route path="session/new" element={<CreateGuestSession />} />
          <Route path="session/:sessionId" element={<GuestSessionDetail />} />
          <Route path="stats" element={<GuestStats />} />
        </Route>

        {/* Migration Route (available to newly registered users) */}
        <Route path="/migrate" element={<AuthOnlyRoute><MigrationScreen /></AuthOnlyRoute>} />

        {/* Authenticated Routes */}
        <Route path="/" element={<AuthOnlyRoute><MainLayout /></AuthOnlyRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sessions" element={<SessionList />} />
          {/* ... other authenticated routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 7. Navbar/Header

### Show Guest Mode Indicator

```tsx
// src/components/layout/Header.tsx
import { useAuthStore } from '@/stores/authStore';
import { useGuestStore } from '@/stores/guestStore';

export function Header() {
  const user = useAuthStore(state => state.user);
  const isGuestMode = useGuestStore(state => state.isGuestMode);

  return (
    <header>
      <div className="logo">Revia</div>

      {isGuestMode ? (
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 font-medium">👤 Guest Mode</span>
          <button onClick={() => navigate('/register')} size="sm">
            Create Account
          </button>
        </div>
      ) : user ? (
        <div className="flex items-center gap-2">
          <span>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => navigate('/login')}>Sign In</button>
      )}
    </header>
  );
}
```

---

## 8. Data Persistence Check

### Auto-load Guest Data on App Start

```tsx
// src/App.tsx or src/lib/providers.tsx
import { useEffect } from 'react';
import { useGuestStore } from '@/stores/guestStore';
import { useAuthStore } from '@/stores/authStore';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const loadGuestData = useGuestStore(state => state.load);
  const checkTTL = useGuestStore(state => state.checkTTL);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    // If not authenticated, try to load guest data
    if (!isAuthenticated) {
      loadGuestData().then(() => {
        const expired = checkTTL();
        if (expired) {
          // Show expiry notification
          console.warn('Guest data expired');
        }
      });
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
```

---

## 9. Settings: Clear Guest Data

```tsx
// src/components/guest/GuestSettings.tsx
import { useGuestStore } from '@/stores/guestStore';
import { useNavigate } from 'react-router-dom';

export function GuestSettings() {
  const navigate = useNavigate();
  const { clear, getStats } = useGuestStore();
  const stats = getStats();

  const handleClearData = async () => {
    const confirmed = window.confirm(
      `Delete all guest data? This will remove ${stats.total_sessions} sessions and cannot be undone.`
    );

    if (confirmed) {
      await clear();
      navigate('/welcome');
    }
  };

  return (
    <div>
      <h2>Guest Mode Settings</h2>

      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <h3>⚠️ Delete All Data</h3>
        <p>Permanently delete all guest sessions and exercises.</p>
        <button onClick={handleClearData} className="bg-red-500 text-white">
          Delete All Guest Data
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded mt-4">
        <h3>💡 Save Your Data</h3>
        <p>Create an account to keep your data permanently.</p>
        <button onClick={() => navigate('/register')}>
          Create Account
        </button>
      </div>
    </div>
  );
}
```

---

## 10. TypeScript Type Narrowing

### Detect Guest vs Server Sessions

```tsx
// src/utils/sessionHelpers.ts
import type { GuestSession } from '@/types/guest';
import type { SportSession } from '@/types/sport';

export function isGuestSession(session: GuestSession | SportSession): session is GuestSession {
  return !('user_id' in session);
}

// Usage in components
function SessionCard({ session }: { session: GuestSession | SportSession }) {
  if (isGuestSession(session)) {
    // Guest session - no user_id
    return <GuestSessionCard session={session} />;
  } else {
    // Server session - has user_id
    return <ServerSessionCard session={session} />;
  }
}
```

---

## Summary Checklist

- [ ] Add "Try Without Account" button to welcome screen
- [ ] Create guest dashboard with TTL warning
- [ ] Implement session/exercise CRUD for guest mode
- [ ] Add migration prompt after registration
- [ ] Build migration screen with strategy selection
- [ ] Add route protection (guest vs authenticated)
- [ ] Show guest mode indicator in header
- [ ] Auto-load guest data on app start
- [ ] Add "Clear Guest Data" in settings
- [ ] Test full flow: guest → register → migrate

---

## Testing Checklist

- [ ] Guest can create/edit/delete sessions offline
- [ ] Data persists across browser refresh
- [ ] TTL warning appears 7 days before expiry
- [ ] Expired data auto-deleted on load
- [ ] Migration works with all strategies
- [ ] Conflicts detected and resolved correctly
- [ ] Guest data wiped after successful migration
- [ ] Failed migration leaves guest data intact
- [ ] No PII in browser console logs
- [ ] WebCrypto fallback message shown on unsupported browsers

---

## Performance Tips

1. **Lazy load migration screen** - Only import when needed
2. **Debounce saves** - Don't encrypt on every keystroke
3. **Show loading states** - Encryption can take 50-100ms
4. **Batch operations** - Update multiple exercises in one save
5. **Virtual scrolling** - For large session lists (100+)

---

## Accessibility

- Use semantic HTML (`<button>`, `<form>`)
- Add ARIA labels for TTL warnings
- Keyboard navigation for all interactive elements
- Screen reader announcements for migration progress
- Focus management during multi-step migration

---

## Analytics Events (Optional)

```typescript
// Track guest mode usage
trackEvent('guest_mode_entered');
trackEvent('guest_session_created', { type: 'cardio' });
trackEvent('guest_migration_started', { sessions: 5, strategy: 'merge_newest' });
trackEvent('guest_migration_completed', { sessions_migrated: 5, conflicts: 2 });
trackEvent('guest_data_expired');
```

---

## FAQ

**Q: Can guest data sync across devices?**
A: No, device-bound encryption prevents cross-device sync. Users must create an account for multi-device access.

**Q: What happens if user clears browser data?**
A: All guest data is lost. Recommend early account creation.

**Q: Can guest mode work offline?**
A: Yes, all operations are local. No server connection needed until migration.

**Q: How to test migration without real data?**
A: Use `previewMigration()` for dry-run testing.
