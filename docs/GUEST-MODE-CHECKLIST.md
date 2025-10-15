# Guest Mode Implementation Checklist

**Complete task list for integrating guest mode into Revia**

---

## Phase 1: Backend Verification ✅ (Already Done)

- [x] Supabase `sport_sessions` table exists
- [x] Supabase `sport_exercises` table exists
- [x] RLS policies allow authenticated inserts
- [x] API endpoints handle new sessions/exercises

---

## Phase 2: Core Implementation ✅ (Already Done)

- [x] `src/lib/crypto.ts` - Encryption utilities
- [x] `src/types/guest.ts` - Type definitions
- [x] `src/stores/guestStore.ts` - State management
- [x] `src/services/migrateGuestToAccount.ts` - Migration logic
- [x] 130 comprehensive tests
- [x] Full documentation (4 docs)

---

## Phase 3: UI Components (To Do)

### 3.1 Welcome/Login Screen
- [ ] Add "Try Without Account" button to welcome screen
- [ ] Style button (ghost/secondary variant)
- [ ] Add hover state and icon
- [ ] Test on mobile (responsive)

**File**: `src/pages/Welcome.tsx` or `src/components/auth/WelcomeScreen.tsx`

### 3.2 Guest Dashboard
- [ ] Create `src/pages/GuestDashboard.tsx`
- [ ] Show session list (or empty state)
- [ ] Display statistics cards:
  - [ ] Total sessions
  - [ ] Total duration
  - [ ] Average RPE
  - [ ] Last session date
- [ ] Add "Create Session" button
- [ ] Show TTL warning banner (if < 7 days)
- [ ] Add "Create Account" CTA

### 3.3 Create Guest Session
- [ ] Create `src/pages/CreateGuestSession.tsx`
- [ ] Form fields:
  - [ ] Session name (text input)
  - [ ] Date (date picker)
  - [ ] Type (select: cardio/musculation/flexibility/other)
  - [ ] Duration (number input, min 1 max 600)
  - [ ] RPE score (slider 1-10, optional)
  - [ ] Pain level (slider 1-10, optional)
  - [ ] Notes (textarea, optional)
- [ ] Form validation (Zod or react-hook-form)
- [ ] Submit → redirect to session detail

### 3.4 Guest Session Detail
- [ ] Create `src/pages/GuestSessionDetail.tsx`
- [ ] Display session info (name, date, duration, type, RPE, etc.)
- [ ] Show exercise list (or empty state)
- [ ] Add exercise form:
  - [ ] Name
  - [ ] Type
  - [ ] Sets/reps (for musculation)
  - [ ] Weight (for musculation)
  - [ ] Duration (for cardio/flexibility)
  - [ ] Distance (for cardio, optional)
  - [ ] RPE (slider 1-10, optional)
  - [ ] Notes (optional)
- [ ] Delete exercise button (with confirmation)
- [ ] Edit session button
- [ ] Complete session button (if status = draft/in_progress)
- [ ] Delete session button (with confirmation)

### 3.5 Migration Flow
- [ ] Create `src/pages/MigrationScreen.tsx`
- [ ] Show migration prompt after registration (conditional)
- [ ] Preview section:
  - [ ] Sessions to migrate (count)
  - [ ] Exercises to migrate (count)
  - [ ] Estimated time
  - [ ] Conflicts detected (if any)
- [ ] Strategy selection (radio buttons):
  - [ ] Merge newest (default, recommended)
  - [ ] Keep guest data
  - [ ] Keep server data
  - [ ] Keep both
- [ ] Explain each strategy (tooltip or help text)
- [ ] "Start Migration" button
- [ ] Loading state during migration
- [ ] Success message (sessions/exercises migrated)
- [ ] Error handling (show errors, allow retry)
- [ ] Redirect to dashboard after success (3s delay)

### 3.6 Settings/Profile
- [ ] Add "Guest Mode" section to settings
- [ ] Show current storage usage
- [ ] Show TTL expiry date
- [ ] "Clear All Guest Data" button (with confirmation)
- [ ] "Create Account" button (if in guest mode)

---

## Phase 4: Navigation & Routing (To Do)

### 4.1 Route Configuration
- [ ] Add `/guest/dashboard` route
- [ ] Add `/guest/session/new` route
- [ ] Add `/guest/session/:id` route
- [ ] Add `/migrate` route (authenticated only)
- [ ] Add route guards:
  - [ ] `GuestOnlyRoute` component
  - [ ] `AuthOnlyRoute` component
  - [ ] `ProtectedRoute` component (guest OR auth)

**File**: `src/App.tsx` or `src/router.tsx`

### 4.2 Navbar/Header
- [ ] Show "👤 Guest Mode" badge if in guest mode
- [ ] Add "Create Account" button in header (guest mode only)
- [ ] Hide/show menu items based on mode:
  - [ ] Guest: dashboard, sessions, settings
  - [ ] Auth: dashboard, sessions, profile, billing, etc.

**File**: `src/components/layout/Header.tsx`

### 4.3 Sidebar/Navigation
- [ ] Update sidebar to show guest-specific menu
- [ ] Highlight current route
- [ ] Show TTL countdown (optional)

---

## Phase 5: Auto-Loading & Persistence (To Do)

### 5.1 App Initialization
- [ ] Auto-load guest data on app start
- [ ] Check TTL expiry on load
- [ ] Clear expired data automatically
- [ ] Show notification if data expired

**File**: `src/App.tsx` or `src/lib/providers.tsx`

```tsx
useEffect(() => {
  const load = useGuestStore.getState().load;
  const checkTTL = useGuestStore.getState().checkTTL;

  load().then(() => {
    if (checkTTL()) {
      toast.warning('Guest data expired and was cleared');
    }
  });
}, []);
```

### 5.2 Route Protection
- [ ] Redirect unauthenticated + non-guest users to `/welcome`
- [ ] Allow guest users to access `/guest/*` routes
- [ ] Allow authenticated users to access `/migrate` route
- [ ] Block guest users from accessing `/profile`, `/billing`, etc.

---

## Phase 6: User Experience (To Do)

### 6.1 TTL Warning
- [ ] Show banner 7 days before expiry
- [ ] Update countdown daily
- [ ] Urgent warning 1 day before expiry
- [ ] Auto-redirect to `/welcome` on expiry

**Component**: `src/components/GuestTTLWarning.tsx`

### 6.2 Migration Prompts
- [ ] Show modal after registration (if guest data exists)
- [ ] "Import your X sessions?" with preview
- [ ] Allow user to skip (but remind later)
- [ ] Add "Import Guest Data" link to dashboard (for 7 days)

### 6.3 Empty States
- [ ] Empty guest dashboard: "No sessions yet. Create your first workout!"
- [ ] Empty session detail: "No exercises yet. Add your first exercise!"

### 6.4 Loading States
- [ ] Show spinner during encryption/decryption (if > 50ms)
- [ ] Show progress bar during migration
- [ ] Disable buttons during async operations

### 6.5 Error Handling
- [ ] WebCrypto not supported → show error + hide guest mode option
- [ ] localStorage full → show error + prompt migration
- [ ] Decryption failed → clear corrupted data + show error
- [ ] Migration failed → show errors + allow retry

### 6.6 Notifications/Toasts
- [ ] "Guest mode activated"
- [ ] "Session created"
- [ ] "Exercise added"
- [ ] "Data saved"
- [ ] "Migration started"
- [ ] "Migration complete"
- [ ] "Guest data cleared"
- [ ] Errors (as toast notifications)

---

## Phase 7: Styling & Polish (To Do)

### 7.1 Consistent Styling
- [ ] Use existing design system (Tailwind classes)
- [ ] Match color scheme (guest mode badge, warnings)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support (if app has dark mode)

### 7.2 Animations
- [ ] Fade in/out for modals
- [ ] Slide in/out for toasts
- [ ] Smooth transitions for route changes
- [ ] Progress bar animation during migration

### 7.3 Accessibility
- [ ] Semantic HTML (`<button>`, `<form>`, etc.)
- [ ] ARIA labels for icons
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader announcements (live regions)
- [ ] Focus management (modals, forms)

---

## Phase 8: Testing (To Do)

### 8.1 Unit Tests
- [x] `crypto.test.ts` (60 tests) ✅
- [x] `guestStore.test.ts` (40 tests) ✅
- [x] `migrateGuestToAccount.test.ts` (30 tests) ✅
- [ ] Add UI component tests (optional):
  - [ ] `GuestDashboard.test.tsx`
  - [ ] `CreateGuestSession.test.tsx`
  - [ ] `MigrationScreen.test.tsx`

### 8.2 Manual Testing
- [ ] Test 1: Enter guest mode
  - [ ] Click "Try Without Account"
  - [ ] Redirected to guest dashboard
  - [ ] Dashboard shows empty state
- [ ] Test 2: Create session
  - [ ] Fill form
  - [ ] Submit
  - [ ] Session appears in list
- [ ] Test 3: Add exercises
  - [ ] Open session detail
  - [ ] Add 3 exercises
  - [ ] Exercises saved and displayed
- [ ] Test 4: Persistence
  - [ ] Refresh browser
  - [ ] Guest data still there
- [ ] Test 5: Statistics
  - [ ] Create multiple sessions
  - [ ] Stats update correctly (total, duration, avg RPE)
- [ ] Test 6: TTL expiry
  - [ ] Manually set timestamp to 31 days ago (DevTools)
  - [ ] Refresh page
  - [ ] Data cleared + notification shown
- [ ] Test 7: Migration (no conflicts)
  - [ ] Create account
  - [ ] See migration prompt
  - [ ] Start migration
  - [ ] Data migrated to server
  - [ ] Guest data wiped
- [ ] Test 8: Migration (with conflicts)
  - [ ] Create guest session
  - [ ] Create account + add server session with same name/date
  - [ ] Migrate with different strategies
  - [ ] Verify correct resolution
- [ ] Test 9: Migration failure
  - [ ] Simulate network error (DevTools offline mode)
  - [ ] Start migration
  - [ ] Error shown
  - [ ] Guest data NOT wiped
  - [ ] Retry works
- [ ] Test 10: Clear guest data
  - [ ] Go to settings
  - [ ] Click "Clear All Guest Data"
  - [ ] Confirm
  - [ ] Data wiped + redirected

### 8.3 E2E Tests (Optional)
- [ ] Playwright test: Full guest flow
  ```typescript
  test('guest mode full flow', async ({ page }) => {
    await page.goto('/welcome');
    await page.click('text=Try Without Account');
    await expect(page).toHaveURL('/guest/dashboard');

    await page.click('text=New Session');
    await page.fill('input[name=name]', 'Test Workout');
    await page.click('button[type=submit]');

    await expect(page.locator('text=Test Workout')).toBeVisible();
  });
  ```

### 8.4 Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

---

## Phase 9: Performance (To Do)

### 9.1 Optimization
- [ ] Lazy load migration screen (dynamic import)
- [ ] Debounce auto-save (300ms)
- [ ] Virtual scrolling for large session lists (100+ items)
- [ ] Batch operations (update multiple exercises at once)

### 9.2 Monitoring
- [ ] Track guest mode activation rate
- [ ] Track average sessions per guest
- [ ] Track migration completion rate
- [ ] Track conflict resolution distribution
- [ ] Track TTL expiry rate

---

## Phase 10: Documentation (To Do)

### 10.1 User-Facing Docs
- [ ] Add "What is Guest Mode?" FAQ
- [ ] Add "How to migrate data" guide
- [ ] Add "Data privacy" explanation

### 10.2 Developer Docs
- [x] Architecture doc (`GUEST-MODE-DESIGN.md`) ✅
- [x] UI integration guide (`GUEST-MODE-UI-INTEGRATION.md`) ✅
- [x] Summary (`GUEST-MODE-SUMMARY.md`) ✅
- [x] Quick start (`GUEST-MODE-QUICKSTART.md`) ✅
- [x] Checklist (this file) ✅

### 10.3 Code Comments
- [x] All functions documented with JSDoc ✅
- [x] Complex logic explained inline ✅

---

## Phase 11: Security Audit (To Do)

### 11.1 Code Review
- [ ] Review encryption implementation
- [ ] Review TTL enforcement
- [ ] Review secure wipe logic
- [ ] Review PII handling in logs
- [ ] Review error messages (no sensitive data)

### 11.2 Penetration Testing
- [ ] Test XSS attacks (can't decrypt without page context)
- [ ] Test localStorage tampering (decryption fails)
- [ ] Test TTL bypass (can't extend expiry)
- [ ] Test migration exploits (RLS policies protect server)

### 11.3 Compliance
- [ ] GDPR: User can export/delete data ✅
- [ ] CCPA: Data not sold/shared ✅
- [ ] HIPAA: Add disclaimer (not for PHI) ✅

---

## Phase 12: Deployment (To Do)

### 12.1 Pre-Deployment
- [ ] All tests passing
- [ ] Manual testing complete
- [ ] Code review approved
- [ ] Security audit passed
- [ ] Documentation complete

### 12.2 Staging Deployment
- [ ] Deploy to staging environment
- [ ] Test migration with staging database
- [ ] Verify HTTPS (WebCrypto requires secure context)
- [ ] Test on real devices (mobile, tablet)

### 12.3 Production Deployment
- [ ] Deploy to production
- [ ] Monitor error logs (first 24h)
- [ ] Track guest mode activation rate
- [ ] Gather user feedback

### 12.4 Post-Deployment
- [ ] Announce feature (blog post, email, social)
- [ ] Monitor metrics (adoption, migration rate)
- [ ] Iterate based on feedback

---

## Phase 13: Maintenance (Ongoing)

### 13.1 Bug Fixes
- [ ] Monitor error reports
- [ ] Fix critical issues within 24h
- [ ] Fix minor issues within 1 week

### 13.2 Feature Enhancements
- [ ] Progressive migration (batch inserts)
- [ ] Background sync after account creation
- [ ] IndexedDB for larger datasets
- [ ] Compression before encryption
- [ ] Biometric lock for mobile
- [ ] Cloud backup integration
- [ ] Export/import functionality

### 13.3 Documentation Updates
- [ ] Update docs with new features
- [ ] Add troubleshooting guides
- [ ] Add video tutorials (optional)

---

## Estimated Time

| Phase | Time | Status |
|-------|------|--------|
| Phase 1: Backend Verification | 30 min | ✅ Done |
| Phase 2: Core Implementation | 4-6 hours | ✅ Done |
| Phase 3: UI Components | 4-6 hours | ⬜ To Do |
| Phase 4: Navigation & Routing | 1-2 hours | ⬜ To Do |
| Phase 5: Auto-Loading | 30 min | ⬜ To Do |
| Phase 6: User Experience | 2-3 hours | ⬜ To Do |
| Phase 7: Styling & Polish | 2-3 hours | ⬜ To Do |
| Phase 8: Testing | 3-4 hours | ✅ Core tests done |
| Phase 9: Performance | 1-2 hours | ⬜ To Do |
| Phase 10: Documentation | 2 hours | ✅ Done |
| Phase 11: Security Audit | 2-3 hours | ⬜ To Do |
| Phase 12: Deployment | 1-2 hours | ⬜ To Do |
| **Total** | **20-30 hours** | **~40% done** |

---

## Priority Levels

**P0 (Must Have)**:
- Welcome screen button
- Guest dashboard (basic)
- Create session (basic form)
- Migration screen (basic)
- Route protection
- TTL warning

**P1 (Should Have)**:
- Session detail with exercises
- Statistics display
- Migration conflict resolution UI
- Empty states
- Error handling

**P2 (Nice to Have)**:
- Advanced statistics
- Charts/graphs
- Export/import
- Progressive migration
- Biometric lock

---

## Success Criteria

**MVP Launch** (P0 features):
- ✅ Users can enter guest mode
- ✅ Users can create sessions
- ✅ Users can migrate to account
- ✅ Data encrypted at rest
- ✅ TTL enforced (30 days)
- ✅ Tests passing

**V1.0 Launch** (P0 + P1 features):
- ✅ Full session/exercise management
- ✅ Statistics dashboard
- ✅ Conflict resolution
- ✅ Polished UI/UX
- ✅ Mobile responsive

**V2.0 Launch** (P0 + P1 + P2 features):
- ✅ Advanced features
- ✅ Performance optimizations
- ✅ Enhanced security

---

## Quick Status Check

Run these commands to verify implementation status:

```bash
# Files exist?
ls src/lib/crypto.ts
ls src/stores/guestStore.ts
ls src/services/migrateGuestToAccount.ts

# Tests pass?
npm run test crypto.test.ts
npm run test guestStore.test.ts
npm run test migrateGuestToAccount.test.ts

# Build works?
npm run build
```

Expected:
- ✅ All files exist
- ✅ 130 tests pass
- ✅ Build succeeds

---

## Next Steps

**Right Now**:
1. Run tests: `npm run test`
2. Read `docs/GUEST-MODE-QUICKSTART.md`
3. Start Phase 3: UI Components

**This Week**:
1. Complete Phase 3-5 (UI, routing, auto-load)
2. Manual testing (Phase 8.2)
3. Deploy to staging

**Next Week**:
1. Complete Phase 6-7 (UX, styling)
2. Security audit (Phase 11)
3. Deploy to production

---

## Questions?

- **Architecture**: `docs/GUEST-MODE-DESIGN.md`
- **UI Examples**: `docs/GUEST-MODE-UI-INTEGRATION.md`
- **Quick Start**: `docs/GUEST-MODE-QUICKSTART.md`
- **Summary**: `docs/GUEST-MODE-SUMMARY.md`

---

**Ready to build? Let's go! 🚀**
