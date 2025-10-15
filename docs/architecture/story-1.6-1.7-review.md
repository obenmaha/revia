# Architecture Review - Stories 1.6 & 1.7

**Review Date:** 2025-01-15
**Reviewer:** Alex (Software Architect)
**Stories:** 1.6 (Gamification et Rappels), 1.7 (Mode Guest et Export)
**Project:** Revia Sport MVP
**Architecture:** Full Supabase Serverless (React 19 + TypeScript + Vite + Supabase)

---

## Executive Summary

### Story 1.6: Gamification et Rappels
**Status:** ⚠️ **APPROVED WITH CONCERNS**

**Summary:**
Story 1.6 introduces a gamification system with streaks, badges, and reminder notifications. The proposed architecture is sound and follows Supabase best practices, but several performance and scalability concerns need addressing before development.

**Key Concerns:**
- PostgreSQL function complexity may impact performance at scale
- Web Notifications API has limited browser support and requires careful fallback handling
- Email reminder Edge Function needs rate limiting and scheduling strategy
- Badge trigger system could become a bottleneck with high user activity

**Approval Conditions:**
1. Implement database query optimization and indexing strategy
2. Add comprehensive fallback for Web Notifications API
3. Define clear rate limiting and scheduling for email reminders
4. Implement badge calculation caching to reduce database load

---

### Story 1.7: Mode Guest et Export
**Status:** 🚨 **APPROVED WITH MAJOR CONCERNS**

**Summary:**
Story 1.7 introduces a guest mode with client-side encryption and data migration capabilities. While the concept is valuable for user acquisition, the implementation presents significant security and technical challenges that require careful attention.

**Critical Concerns:**
- Client-side encryption with crypto-js may not be secure enough for production
- localStorage size limits (5-10MB) could be reached quickly with 100 sessions
- Migration from Guest to Account has atomicity and rollback risks
- RGPD compliance requires legal validation beyond technical implementation
- XSS vulnerabilities in Guest data storage need thorough security testing

**Approval Conditions:**
1. Security audit of encryption implementation by security specialist
2. Implement robust error handling and rollback for migration
3. Add localStorage quota monitoring and user warnings
4. Legal validation of RGPD compliance approach
5. Comprehensive security testing (XSS, data leakage, encryption strength)

---

## Story 1.6: Gamification et Rappels - Technical Analysis

### Architecture Validation

#### ✅ Strengths

1. **Database Schema Design**
   - Well-structured tables (user_streaks, badges, user_badges, notification_preferences)
   - Proper normalization and foreign key relationships
   - RLS policies correctly scoped to user_id
   - Appropriate indexes for performance

2. **PostgreSQL Functions**
   - Streak calculation using window functions is efficient
   - Badge attribution logic is centralized in database
   - Function permissions using SECURITY DEFINER are appropriate

3. **Component Architecture**
   - Clear separation between presentation and business logic
   - Reuse of existing Radix UI components
   - React Hook Form + Zod for form validation
   - TanStack Query for server state management

4. **Integration Points**
   - Seamless integration with existing SportSession validation
   - Proper integration with Story 1.5 statistics
   - Non-breaking addition to existing architecture

#### ⚠️ Concerns and Risks

### 1. Database Performance Concerns

**Issue:** Streak calculation function is complex and runs on every session validation
```sql
-- Current implementation uses multiple CTEs and window functions
WITH daily_sessions AS (
  SELECT date, ROW_NUMBER() OVER (ORDER BY date DESC) as rn,
  ...
)
```

**Risk Level:** MEDIUM
**Impact:** Could cause performance degradation with large datasets (>1000 sessions per user)

**Mitigation:**
```sql
-- Recommendation: Pre-calculate and cache streaks in user_streaks table
-- Update only on session completion, not on every read

CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_updated_at TIMESTAMP,
  -- Cache the last calculation
  last_calculation_at TIMESTAMP DEFAULT NOW()
);

-- Add trigger to update streak on session completion
CREATE OR REPLACE FUNCTION update_streak_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Recalculate streak only when status changes to completed
    UPDATE user_streaks
    SET
      current_streak = calculate_current_streak(NEW.user_id),
      last_activity_date = NEW.date,
      streak_updated_at = NOW(),
      last_calculation_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER streak_update_trigger
AFTER UPDATE ON sport_sessions
FOR EACH ROW
EXECUTE FUNCTION update_streak_on_session_complete();
```

**Index Optimization:**
```sql
-- Add composite index for streak queries
CREATE INDEX idx_sport_sessions_user_status_date
ON sport_sessions(user_id, status, date DESC)
WHERE status = 'completed';

-- Add index for badge checks
CREATE INDEX idx_user_badges_user_earned
ON user_badges(user_id, earned_at DESC);
```

### 2. Badge Attribution Performance

**Issue:** Trigger-based badge attribution on every session completion

**Risk Level:** MEDIUM
**Impact:** Multiple database queries for each badge type check

**Mitigation:**
```typescript
// Implement batch badge checking with caching
class BadgeService {
  private static badgeCache = new Map<string, Badge[]>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    // Check cache first
    const cached = this.badgeCache.get(userId);
    if (cached) return cached;

    // Batch check all badge types in single query
    const newBadges = await supabase.rpc('check_user_badges', {
      user_uuid: userId
    });

    // Cache results
    this.badgeCache.set(userId, newBadges);
    setTimeout(() => this.badgeCache.delete(userId), this.CACHE_TTL);

    return newBadges;
  }
}
```

**PostgreSQL Function:**
```sql
-- Create single function to check all badges at once
CREATE OR REPLACE FUNCTION check_user_badges(user_uuid UUID)
RETURNS SETOF badges AS $$
DECLARE
  user_stats RECORD;
  badge RECORD;
BEGIN
  -- Get user stats once
  SELECT
    COUNT(*) as total_sessions,
    MAX(current_streak) as max_streak,
    SUM(duration_minutes) as total_duration
  INTO user_stats
  FROM sport_sessions
  WHERE user_id = user_uuid AND status = 'completed';

  -- Check all badge requirements
  FOR badge IN
    SELECT * FROM badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = user_uuid AND ub.badge_id = b.id
    )
  LOOP
    IF (badge.requirement_type = 'sessions' AND user_stats.total_sessions >= badge.requirement_value)
    OR (badge.requirement_type = 'streak' AND user_stats.max_streak >= badge.requirement_value)
    OR (badge.requirement_type = 'duration' AND user_stats.total_duration >= badge.requirement_value)
    THEN
      RETURN NEXT badge;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Notification System Architecture

**Issue:** Web Notifications API has limited support and strict permissions

**Browser Support:**
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ⚠️ Safari: Limited support (requires user gesture)
- ❌ Safari iOS: No support for Web Notifications

**Risk Level:** HIGH
**Impact:** 30-40% of mobile users (iOS Safari) cannot receive push notifications

**Mitigation Strategy:**

```typescript
// Implement comprehensive notification fallback
class NotificationService {
  private static async checkNotificationSupport(): Promise<{
    webPush: boolean;
    email: boolean;
    inApp: boolean;
  }> {
    return {
      webPush: 'Notification' in window && Notification.permission !== 'denied',
      email: true, // Always available via Edge Functions
      inApp: true, // Always available
    };
  }

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Web Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  static async scheduleReminder(
    userId: string,
    preferences: NotificationPreference
  ): Promise<void> {
    const support = await this.checkNotificationSupport();

    // Primary: Web Push (if supported)
    if (support.webPush && preferences.push_enabled) {
      await this.scheduleWebPush(userId, preferences);
    }

    // Fallback: Email (always available)
    if (preferences.email_enabled) {
      await this.scheduleEmail(userId, preferences);
    }

    // In-App notifications (always available)
    await this.scheduleInAppNotification(userId, preferences);
  }

  private static async scheduleEmail(
    userId: string,
    preferences: NotificationPreference
  ): Promise<void> {
    // Call Edge Function to schedule email
    const { error } = await supabase.functions.invoke('schedule-reminder-email', {
      body: {
        userId,
        preferences,
      },
    });

    if (error) {
      console.error('Email scheduling error:', error);
      throw new Error('Failed to schedule email reminder');
    }
  }
}
```

### 4. Edge Function for Email Reminders

**Issue:** Edge Function needs proper scheduling and rate limiting

**Risk Level:** MEDIUM
**Impact:** Potential spam, high costs, or failed deliveries

**Recommended Implementation:**

```typescript
// supabase/functions/send-reminder-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rate limiting configuration
const RATE_LIMIT = {
  maxEmailsPerDay: 1,
  maxEmailsPerWeek: 3,
  cooldownHours: 23, // Minimum 23h between emails
};

serve(async (req) => {
  try {
    const { userId, email, userName, currentStreak } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limiting
    const { data: recentEmails, error: logError } = await supabase
      .from('notification_logs')
      .select('sent_at')
      .eq('user_id', userId)
      .eq('type', 'email_reminder')
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('sent_at', { ascending: false });

    if (logError) {
      throw new Error(`Failed to check rate limit: ${logError.message}`);
    }

    // Check cooldown period
    if (recentEmails && recentEmails.length > 0) {
      const lastEmail = new Date(recentEmails[0].sent_at);
      const hoursSinceLastEmail = (Date.now() - lastEmail.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastEmail < RATE_LIMIT.cooldownHours) {
        console.log(`Rate limit: ${hoursSinceLastEmail}h since last email (cooldown: ${RATE_LIMIT.cooldownHours}h)`);
        return new Response(
          JSON.stringify({
            skipped: true,
            reason: 'rate_limit',
            nextAllowedAt: new Date(lastEmail.getTime() + RATE_LIMIT.cooldownHours * 60 * 60 * 1000)
          }),
          { status: 200 }
        );
      }
    }

    // Check daily limit
    if (recentEmails && recentEmails.length >= RATE_LIMIT.maxEmailsPerDay) {
      console.log(`Daily limit reached: ${recentEmails.length} emails`);
      return new Response(
        JSON.stringify({ skipped: true, reason: 'daily_limit' }),
        { status: 200 }
      );
    }

    // Check user preferences
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefsError || !prefs?.email_enabled) {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'user_opted_out' }),
        { status: 200 }
      );
    }

    // Generate personalized template
    const emailTemplate = generateReminderEmail(userName, currentStreak, prefs);

    // Send email via service (Resend, SendGrid, etc.)
    // TODO: Implement actual email sending
    console.log('Email template:', emailTemplate);

    // Log the email send
    await supabase.from('notification_logs').insert({
      user_id: userId,
      type: 'email_reminder',
      sent_at: new Date().toISOString(),
      metadata: { streak: currentStreak, template: emailTemplate },
    });

    return new Response(
      JSON.stringify({ success: true, sentAt: new Date().toISOString() }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});

function generateReminderEmail(
  userName: string,
  currentStreak: number,
  prefs: any
): string {
  const templates = [
    `Salut ${userName}! 🔥 Ton streak de ${currentStreak} jours t'attend. Prêt pour une nouvelle séance?`,
    `${userName}, maintiens ton élan! 💪 ${currentStreak} jours de suite, c'est impressionnant!`,
    `Hey ${userName}! ⚡ Une petite séance aujourd'hui pour continuer ton streak de ${currentStreak} jours?`,
  ];

  // Personalize based on time of day
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'matinée' : hour < 18 ? 'après-midi' : 'soirée';

  const template = templates[Math.floor(Math.random() * templates.length)];
  return `${template}\n\nBonne ${timeOfDay} et bon entraînement! 🏃‍♂️`;
}
```

**Scheduling Strategy:**

Use Supabase Edge Functions with cron:

```yaml
# supabase/functions/send-reminder-email/cron.yaml
name: send-reminder-emails
schedule: "0 * * * *" # Every hour
```

Or implement a more sophisticated scheduling:

```typescript
// Check users who need reminders based on their timezone and preferences
const { data: usersToNotify } = await supabase
  .from('notification_preferences')
  .select('user_id, reminder_time, timezone')
  .eq('email_enabled', true)
  .is('last_reminded_at', null)
  .or(`last_reminded_at.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);
```

### 5. RLS Policies Review

**Current RLS:**
```sql
-- Politiques RLS pour notification_preferences
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());
```

**Recommendation:** Add INSERT policy and default values

```sql
-- Add INSERT policy
CREATE POLICY "Users can create own notification preferences" ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add default preferences on user creation
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    email_enabled,
    push_enabled,
    reminder_time,
    reminder_days,
    reminder_frequency,
    timezone
  ) VALUES (
    NEW.id,
    false, -- Opt-in required (RGPD compliant)
    false,
    '18:00',
    ARRAY[1,2,3,4,5], -- Weekdays
    'twice_weekly',
    'Europe/Paris'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_user_notification_preferences
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_notification_preferences();
```

### Recommended Changes for Story 1.6

#### Database Migration Updates

Create new migration: `006_gamification_tables.sql`

```sql
-- Optimized gamification tables with performance considerations

-- User streaks with cached calculations
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_calculation_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badge definitions (pre-populated)
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type VARCHAR(20) NOT NULL CHECK (requirement_type IN ('sessions', 'streak', 'duration')),
  requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges with progress tracking
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT FALSE,
  reminder_time VARCHAR(5) NOT NULL DEFAULT '18:00',
  reminder_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  reminder_frequency VARCHAR(20) DEFAULT 'twice_weekly' CHECK (reminder_frequency IN ('daily', 'twice_weekly', 'weekly')),
  last_reminded_at TIMESTAMP WITH TIME ZONE,
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification logs for rate limiting
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email_reminder', 'push_notification', 'in_app')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX idx_user_streaks_last_activity ON user_streaks(last_activity_date DESC);
CREATE INDEX idx_user_badges_user_earned ON user_badges(user_id, earned_at DESC);
CREATE INDEX idx_notification_logs_user_sent ON notification_logs(user_id, sent_at DESC);
CREATE INDEX idx_notification_logs_type_sent ON notification_logs(type, sent_at DESC);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (see above sections for complete policies)
```

---

## Story 1.7: Mode Guest et Export - Technical Analysis

### Architecture Validation

#### ✅ Strengths

1. **User Acquisition Strategy**
   - Lowers barrier to entry (no signup required)
   - Allows users to evaluate the app before committing
   - Clear migration path from Guest to Account

2. **RGPD Approach**
   - Explicit consent before migration
   - 30-day automatic expiration
   - Data minimization (only essential data)
   - Right to deletion built-in

3. **Component Architecture**
   - Clear separation of Guest and Authenticated modes
   - Reuse of existing sport components
   - Integration with existing export service

#### 🚨 Critical Concerns and Risks

### 1. Client-Side Encryption Security

**Issue:** crypto-js for AES-256-GCM encryption may not be production-ready

**Risk Level:** HIGH
**Impact:** Potential data exposure, weak encryption, or compromised data integrity

**Analysis:**
```typescript
// Current proposed approach
import CryptoJS from 'crypto-js';

class EncryptionService {
  static encrypt(data: any): EncryptedData {
    const key = this.generateKey(); // How is this key generated?
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key);
    return {
      data: encrypted.toString(),
      iv: 'some-iv',
      algorithm: 'AES-256-GCM',
    };
  }
}
```

**Security Concerns:**

1. **Key Generation:** How is the encryption key generated and stored?
   - If stored in localStorage: vulnerable to XSS attacks
   - If hardcoded: completely insecure
   - If derived from user input: potentially weak

2. **crypto-js Limitations:**
   - Not designed for production encryption
   - No native support for AES-GCM (only AES-CBC)
   - Vulnerable to timing attacks
   - No AEAD (Authenticated Encryption with Associated Data)

3. **Browser-Based Encryption Challenges:**
   - Cannot protect against XSS attacks
   - Cannot prevent malicious browser extensions
   - Key management is extremely difficult

**Recommended Approach:**

Use **Web Crypto API** instead of crypto-js:

```typescript
// src/services/encryptionService.ts - Secure Implementation
class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM

  /**
   * Generate a cryptographically secure encryption key
   */
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  static async encrypt(data: any): Promise<EncryptedData> {
    try {
      // Generate key (or retrieve from secure storage)
      const key = await this.getOrCreateKey();

      // Generate random IV (MUST be unique for each encryption)
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Convert data to bytes
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(JSON.stringify(data));

      // Encrypt
      const encryptedBytes = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
        },
        key,
        dataBytes
      );

      // Convert to base64 for storage
      const encryptedBase64 = btoa(
        String.fromCharCode(...new Uint8Array(encryptedBytes))
      );
      const ivBase64 = btoa(String.fromCharCode(...iv));

      return {
        data: encryptedBase64,
        iv: ivBase64,
        salt: '', // Not needed for symmetric encryption
        algorithm: 'AES-256-GCM',
        version: '1.0',
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static async decrypt(encrypted: EncryptedData): Promise<any> {
    try {
      // Retrieve key
      const key = await this.getOrCreateKey();

      // Convert from base64
      const encryptedBytes = Uint8Array.from(atob(encrypted.data), c =>
        c.charCodeAt(0)
      );
      const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));

      // Decrypt
      const decryptedBytes = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
        },
        key,
        encryptedBytes
      );

      // Convert to string
      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBytes);

      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Get or create encryption key (stored securely)
   */
  private static async getOrCreateKey(): Promise<CryptoKey> {
    // Check if key exists in IndexedDB (more secure than localStorage)
    const storedKey = await this.getKeyFromIndexedDB();

    if (storedKey) {
      return storedKey;
    }

    // Generate new key
    const newKey = await this.generateKey();

    // Store in IndexedDB
    await this.storeKeyInIndexedDB(newKey);

    return newKey;
  }

  /**
   * Store key in IndexedDB (more secure than localStorage)
   */
  private static async storeKeyInIndexedDB(key: CryptoKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ReviaGuestKeys', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys');
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        const transaction = db.transaction(['keys'], 'readwrite');
        const store = transaction.objectStore('keys');

        // Export key to JWK format for storage
        const exportedKey = await crypto.subtle.exportKey('jwk', key);
        store.put(exportedKey, 'guestEncryptionKey');

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };

        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  /**
   * Retrieve key from IndexedDB
   */
  private static async getKeyFromIndexedDB(): Promise<CryptoKey | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ReviaGuestKeys', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = async () => {
        const db = request.result;

        if (!db.objectStoreNames.contains('keys')) {
          db.close();
          resolve(null);
          return;
        }

        const transaction = db.transaction(['keys'], 'readonly');
        const store = transaction.objectStore('keys');
        const getRequest = store.get('guestEncryptionKey');

        getRequest.onsuccess = async () => {
          db.close();

          if (!getRequest.result) {
            resolve(null);
            return;
          }

          // Import key from JWK format
          try {
            const key = await crypto.subtle.importKey(
              'jwk',
              getRequest.result,
              { name: this.ALGORITHM, length: this.KEY_LENGTH },
              true,
              ['encrypt', 'decrypt']
            );
            resolve(key);
          } catch (error) {
            console.error('Key import error:', error);
            resolve(null);
          }
        };

        getRequest.onerror = () => {
          db.close();
          reject(getRequest.error);
        };
      };
    });
  }

  /**
   * Validate encrypted data integrity
   */
  static validateEncrypted(encrypted: EncryptedData): boolean {
    if (!encrypted.data || !encrypted.iv) {
      return false;
    }

    if (encrypted.algorithm !== 'AES-256-GCM') {
      return false;
    }

    // Check base64 format
    try {
      atob(encrypted.data);
      atob(encrypted.iv);
      return true;
    } catch {
      return false;
    }
  }
}
```

**Key Security Improvements:**

1. **Web Crypto API:** Native browser crypto, FIPS-compliant, timing-attack resistant
2. **IndexedDB Storage:** More secure than localStorage, larger storage capacity
3. **Unique IV per encryption:** Prevents pattern analysis
4. **AEAD (GCM mode):** Provides authentication, prevents tampering
5. **No key in localStorage:** Reduces XSS attack surface

**Remaining Security Limitations:**

⚠️ **Client-side encryption cannot protect against:**
- XSS attacks (malicious scripts can read decrypted data)
- Malicious browser extensions
- Browser vulnerabilities
- User's device being compromised

**Recommendation:** Add security disclaimer:

```typescript
// Display warning to users
const SECURITY_DISCLAIMER = `
⚠️ Mode Invité - Avertissement de Sécurité

Les données en mode Invité sont stockées localement sur votre appareil
et chiffrées pour votre protection. Cependant, ce chiffrement ne peut
pas protéger contre tous les risques de sécurité.

Pour une sécurité maximale, nous vous recommandons de créer un compte.

Les données en mode Invité sont automatiquement supprimées après 30 jours.
`;
```

### 2. localStorage Size Limits

**Issue:** localStorage is limited to 5-10MB depending on browser

**Risk Level:** HIGH
**Impact:** App crash, data loss, or inability to create new sessions

**Analysis:**

```typescript
// Calculate storage size for 100 sessions
interface GuestSession {
  sessions: SportSession[]; // ~50 sessions = ~1-2MB
  exercises: SportExercise[]; // ~500 exercises = ~2-3MB
  stats: GuestStats; // ~10KB
}

// Encrypted overhead: ~30-40% increase
// Total: ~4-6MB for 100 sessions (approaching limit!)
```

**Mitigation Strategy:**

```typescript
// src/services/guestService.ts - With quota monitoring
class GuestService {
  private static readonly MAX_SESSIONS = 100;
  private static readonly STORAGE_WARNING_THRESHOLD = 0.8; // 80% of quota
  private static readonly STORAGE_CRITICAL_THRESHOLD = 0.95; // 95% of quota

  /**
   * Check localStorage quota
   */
  static async checkStorageQuota(): Promise<{
    used: number;
    available: number;
    percentage: number;
    status: 'ok' | 'warning' | 'critical';
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const available = estimate.quota || 5 * 1024 * 1024; // Default 5MB
      const percentage = used / available;

      let status: 'ok' | 'warning' | 'critical' = 'ok';
      if (percentage >= this.STORAGE_CRITICAL_THRESHOLD) {
        status = 'critical';
      } else if (percentage >= this.STORAGE_WARNING_THRESHOLD) {
        status = 'warning';
      }

      return { used, available, percentage, status };
    }

    // Fallback: estimate based on localStorage size
    const keys = Object.keys(localStorage);
    let totalSize = 0;
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    });

    const available = 5 * 1024 * 1024; // Assume 5MB
    const percentage = totalSize / available;

    let status: 'ok' | 'warning' | 'critical' = 'ok';
    if (percentage >= this.STORAGE_CRITICAL_THRESHOLD) {
      status = 'critical';
    } else if (percentage >= this.STORAGE_WARNING_THRESHOLD) {
      status = 'warning';
    }

    return { used: totalSize, available, percentage, status };
  }

  /**
   * Add session with quota check
   */
  static async addSession(session: SportSession): Promise<void> {
    // Check quota before adding
    const quota = await this.checkStorageQuota();

    if (quota.status === 'critical') {
      throw new Error(
        'Storage quota critically low. Please delete old sessions or create an account to save your data.'
      );
    }

    if (quota.status === 'warning') {
      console.warn('Storage quota warning: approaching limit');
      // Show warning to user
      this.showStorageWarning(quota);
    }

    // Check session limit
    const currentSession = this.getGuestSession();
    if (currentSession && currentSession.sessions.length >= this.MAX_SESSIONS) {
      throw new Error(
        'Maximum session limit reached (100 sessions). Please create an account to continue.'
      );
    }

    // Add session
    // ... (existing implementation)
  }

  /**
   * Show storage warning to user
   */
  private static showStorageWarning(quota: any): void {
    const percentageUsed = Math.round(quota.percentage * 100);
    const message = `
Attention: Espace de stockage à ${percentageUsed}% de la limite.

Pour continuer à utiliser l'application sans limite,
créez un compte gratuit pour sauvegarder vos données en ligne.
    `.trim();

    // Display toast or modal
    console.warn(message);
  }

  /**
   * Cleanup old sessions to free space
   */
  static async cleanupOldSessions(keepCount: number = 50): Promise<void> {
    const session = this.getGuestSession();
    if (!session) return;

    // Sort by date, keep most recent
    session.sessions.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Keep only the most recent sessions
    session.sessions = session.sessions.slice(0, keepCount);

    // Remove orphaned exercises
    const validSessionIds = new Set(session.sessions.map(s => s.id));
    session.exercises = session.exercises.filter(e =>
      validSessionIds.has(e.session_id)
    );

    // Save cleaned session
    this.saveGuestSession(session);

    console.log(`Cleaned up sessions, kept ${keepCount} most recent`);
  }
}
```

**User Experience:**

```tsx
// Component to display storage status
function StorageStatusIndicator() {
  const [quota, setQuota] = useState<any>(null);

  useEffect(() => {
    async function checkQuota() {
      const q = await GuestService.checkStorageQuota();
      setQuota(q);
    }
    checkQuota();
  }, []);

  if (!quota || quota.status === 'ok') return null;

  return (
    <div className={`p-4 rounded-md ${quota.status === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}>
      <p className="text-sm font-medium">
        {quota.status === 'critical' ? '⚠️ Espace de stockage critique' : '⚠️ Espace de stockage limité'}
      </p>
      <p className="text-xs mt-1">
        {Math.round(quota.percentage * 100)}% utilisé
      </p>
      <button className="mt-2 text-sm underline">
        Créer un compte pour sauvegarder sans limite
      </button>
    </div>
  );
}
```

### 3. Migration Atomicity and Rollback

**Issue:** Guest to Account migration needs to be atomic and safe

**Risk Level:** HIGH
**Impact:** Data loss, partial migration, or corrupted data

**Analysis:**

Current proposed approach lacks:
- Transaction safety
- Rollback mechanism
- Data validation
- Progress tracking
- Error recovery

**Recommended Implementation:**

```typescript
// src/services/guestMigrationService.ts - Production-ready
class GuestMigrationService {
  private static readonly MIGRATION_TIMEOUT = 30000; // 30 seconds

  /**
   * Migrate Guest data to Account with atomicity
   */
  static async migrateToAccount(
    guestSession: GuestSession,
    userId: string,
    consent: GuestMigrationConsent
  ): Promise<{ success: boolean; error?: string; migratedCount: number }> {
    // Validation phase
    if (!this.validateGuestSession(guestSession)) {
      return { success: false, error: 'Invalid guest session data', migratedCount: 0 };
    }

    if (!this.validateConsent(consent)) {
      return { success: false, error: 'Invalid or incomplete consent', migratedCount: 0 };
    }

    // Create migration record
    const migrationId = crypto.randomUUID();
    const migration: GuestMigration = {
      guestId: guestSession.guestId,
      userId,
      migratedAt: new Date(),
      sessionCount: guestSession.sessions.length,
      exerciseCount: guestSession.exercises.length,
      consent,
      status: 'in_progress',
    };

    try {
      // Start migration with timeout
      const result = await Promise.race([
        this.performMigration(guestSession, userId, migration),
        this.timeout(this.MIGRATION_TIMEOUT),
      ]);

      if (!result.success) {
        throw new Error(result.error || 'Migration failed');
      }

      // Success: cleanup guest data
      await this.cleanupAfterMigration(guestSession.guestId);

      // Log consent
      await this.logConsent(userId, consent);

      return { success: true, migratedCount: result.migratedCount };
    } catch (error) {
      console.error('Migration error:', error);

      // Rollback: delete any partial data
      await this.rollbackMigration(migrationId, userId);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        migratedCount: 0
      };
    }
  }

  /**
   * Perform the actual migration
   */
  private static async performMigration(
    guestSession: GuestSession,
    userId: string,
    migration: GuestMigration
  ): Promise<{ success: boolean; error?: string; migratedCount: number }> {
    let migratedCount = 0;

    // Use Supabase transaction (via RPC)
    const { data, error } = await supabase.rpc('migrate_guest_data', {
      p_user_id: userId,
      p_guest_sessions: guestSession.sessions,
      p_guest_exercises: guestSession.exercises,
      p_consent: migration.consent,
    });

    if (error) {
      throw new Error(`Migration RPC failed: ${error.message}`);
    }

    migratedCount = data?.migrated_count || 0;

    return { success: true, migratedCount };
  }

  /**
   * Rollback migration on error
   */
  private static async rollbackMigration(
    migrationId: string,
    userId: string
  ): Promise<void> {
    try {
      console.log(`Rolling back migration ${migrationId} for user ${userId}`);

      // Delete any data created during this migration
      // This requires adding a migration_id field to track
      await supabase
        .from('sport_sessions')
        .delete()
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Last minute

      await supabase
        .from('sport_exercises')
        .delete()
        .in('session_id',
          supabase.from('sport_sessions')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 60000).toISOString())
        );

      console.log('Rollback completed successfully');
    } catch (error) {
      console.error('Rollback error:', error);
      // Log to error tracking service (Sentry)
    }
  }

  /**
   * Validate guest session data
   */
  private static validateGuestSession(session: GuestSession): boolean {
    if (!session.guestId || !session.sessions) {
      return false;
    }

    // Check data integrity
    if (session.sessions.some(s => !s.id || !s.name || !s.date)) {
      return false;
    }

    // Check expiration
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Validate RGPD consent
   */
  private static validateConsent(consent: GuestMigrationConsent): boolean {
    return (
      consent.dataRetention &&
      consent.dataProcessing &&
      consent.termsAccepted &&
      consent.privacyPolicyAccepted &&
      consent.timestamp instanceof Date
    );
  }

  /**
   * Cleanup guest data after successful migration
   */
  private static async cleanupAfterMigration(guestId: string): Promise<void> {
    // Remove from localStorage
    localStorage.removeItem(LocalStorageKeys.GUEST_SESSION);
    localStorage.removeItem(LocalStorageKeys.GUEST_ID);
    localStorage.removeItem(LocalStorageKeys.GUEST_ENCRYPTION_KEY);
    localStorage.removeItem(LocalStorageKeys.GUEST_CREATED_AT);
    localStorage.removeItem(LocalStorageKeys.GUEST_EXPIRES_AT);

    // Remove from IndexedDB
    await this.deleteEncryptionKey();

    console.log(`Guest data cleaned up for ${guestId}`);
  }

  /**
   * Log RGPD consent
   */
  private static async logConsent(
    userId: string,
    consent: GuestMigrationConsent
  ): Promise<void> {
    await supabase.from('consent_logs').insert({
      user_id: userId,
      consent_type: 'guest_migration',
      data_retention: consent.dataRetention,
      data_processing: consent.dataProcessing,
      terms_accepted: consent.termsAccepted,
      privacy_policy_accepted: consent.privacyPolicyAccepted,
      timestamp: consent.timestamp.toISOString(),
      ip_address: consent.ipAddress,
    });
  }

  /**
   * Timeout helper
   */
  private static timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Migration timeout')), ms)
    );
  }
}
```

**PostgreSQL Function for Atomic Migration:**

```sql
-- Function for atomic guest data migration
CREATE OR REPLACE FUNCTION migrate_guest_data(
  p_user_id UUID,
  p_guest_sessions JSONB,
  p_guest_exercises JSONB,
  p_consent JSONB
)
RETURNS JSON AS $$
DECLARE
  v_migrated_count INTEGER := 0;
  v_session JSONB;
  v_session_id UUID;
  v_exercise JSONB;
BEGIN
  -- Start transaction (implicit in function)

  -- Migrate sessions
  FOR v_session IN SELECT * FROM jsonb_array_elements(p_guest_sessions)
  LOOP
    INSERT INTO sport_sessions (
      user_id, name, date, type, status, objectives, notes,
      rpe_score, pain_level, duration_minutes
    ) VALUES (
      p_user_id,
      (v_session->>'name')::TEXT,
      (v_session->>'date')::DATE,
      (v_session->>'type')::sport_session_type,
      (v_session->>'status')::sport_session_status,
      (v_session->>'objectives')::TEXT,
      (v_session->>'notes')::TEXT,
      (v_session->>'rpe_score')::INTEGER,
      (v_session->>'pain_level')::INTEGER,
      (v_session->>'duration_minutes')::INTEGER
    )
    RETURNING id INTO v_session_id;

    -- Migrate exercises for this session
    FOR v_exercise IN
      SELECT * FROM jsonb_array_elements(p_guest_exercises)
      WHERE jsonb_array_elements->>'session_id' = v_session->>'id'
    LOOP
      INSERT INTO sport_exercises (
        session_id, name, exercise_type, sets, reps, weight_kg,
        duration_seconds, rest_seconds, order_index, notes
      ) VALUES (
        v_session_id,
        (v_exercise->>'name')::TEXT,
        (v_exercise->>'exercise_type')::sport_exercise_type,
        (v_exercise->>'sets')::INTEGER,
        (v_exercise->>'reps')::INTEGER,
        (v_exercise->>'weight_kg')::DECIMAL,
        (v_exercise->>'duration_seconds')::INTEGER,
        (v_exercise->>'rest_seconds')::INTEGER,
        (v_exercise->>'order_index')::INTEGER,
        (v_exercise->>'notes')::TEXT
      );
    END LOOP;

    v_migrated_count := v_migrated_count + 1;
  END LOOP;

  -- Create sport user profile if not exists
  INSERT INTO sport_users (
    id, display_name, guest_data_migrated, data_retention_consent
  ) VALUES (
    p_user_id,
    'Utilisateur',
    TRUE,
    (p_consent->>'dataRetention')::BOOLEAN
  )
  ON CONFLICT (id) DO UPDATE
  SET
    guest_data_migrated = TRUE,
    data_retention_consent = EXCLUDED.data_retention_consent;

  RETURN json_build_object(
    'migrated_count', v_migrated_count,
    'success', TRUE
  );

EXCEPTION WHEN OTHERS THEN
  -- Rollback is automatic in PostgreSQL functions
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. XSS Vulnerabilities in Guest Data

**Issue:** Guest data stored in localStorage is vulnerable to XSS attacks

**Risk Level:** HIGH
**Impact:** Data theft, account takeover, or malicious code execution

**Mitigation:**

1. **Content Security Policy (CSP):**

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.supabase.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
">
```

2. **Input Sanitization:**

```typescript
// src/utils/sanitization.ts
import DOMPurify from 'dompurify';

class SanitizationService {
  /**
   * Sanitize user input before storing
   */
  static sanitizeInput(input: string): string {
    // Remove any HTML tags
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML allowed
      ALLOWED_ATTR: [],
    });

    // Additional sanitization
    return sanitized
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  /**
   * Sanitize guest session before storing
   */
  static sanitizeGuestSession(session: GuestSession): GuestSession {
    return {
      ...session,
      sessions: session.sessions.map(s => ({
        ...s,
        name: this.sanitizeInput(s.name),
        objectives: s.objectives ? this.sanitizeInput(s.objectives) : undefined,
        notes: s.notes ? this.sanitizeInput(s.notes) : undefined,
      })),
      exercises: session.exercises.map(e => ({
        ...e,
        name: this.sanitizeInput(e.name),
        notes: e.notes ? this.sanitizeInput(e.notes) : undefined,
      })),
    };
  }
}
```

3. **Output Encoding:**

```tsx
// Always use React's built-in XSS protection
function SessionCard({ session }: { session: SportSession }) {
  return (
    <div>
      {/* React automatically escapes these values */}
      <h3>{session.name}</h3>
      <p>{session.notes}</p>

      {/* NEVER use dangerouslySetInnerHTML with user data */}
      {/* WRONG: <div dangerouslySetInnerHTML={{ __html: session.notes }} /> */}
    </div>
  );
}
```

### 5. RGPD Compliance - Legal Validation Required

**Issue:** Technical implementation alone does not ensure RGPD compliance

**Risk Level:** HIGH
**Impact:** Legal liability, fines (up to 4% of revenue or €20M), or enforcement actions

**Required Steps:**

1. **Legal Review:**
   - Privacy policy must be reviewed by legal counsel
   - Terms of service must explicitly cover Guest mode
   - Consent forms must meet RGPD Article 7 requirements
   - Data retention policy must be documented

2. **Data Protection Impact Assessment (DPIA):**

```markdown
# DPIA - Guest Mode Feature

## Data Processing Description
- **Purpose:** Allow users to test app without account creation
- **Legal Basis:** Legitimate interest + explicit consent (for migration)
- **Data Categories:** Training sessions, exercises, performance metrics
- **Data Subjects:** Prospective users (Guest mode)
- **Retention:** 30 days maximum (automatic deletion)

## Risk Assessment
- **Risk 1:** Client-side storage vulnerable to XSS
  - **Mitigation:** Web Crypto API, CSP, input sanitization
  - **Residual Risk:** Medium

- **Risk 2:** Data migration errors could cause data loss
  - **Mitigation:** Atomic transactions, rollback mechanism
  - **Residual Risk:** Low

- **Risk 3:** Inadequate consent collection
  - **Mitigation:** Explicit checkboxes, clear language, logged consent
  - **Residual Risk:** Low

## Conclusion
Guest mode can proceed with additional safeguards:
- Security audit before production
- Legal review of consent forms
- User testing of migration flow
```

3. **Consent Management:**

```tsx
// src/components/features/guest/ConsentForm.tsx
function GuestMigrationConsentForm({ onConsent }: { onConsent: (consent: GuestMigrationConsent) => void }) {
  const [consents, setConsents] = useState({
    dataRetention: false,
    dataProcessing: false,
    termsAccepted: false,
    privacyPolicyAccepted: false,
  });

  const allConsented = Object.values(consents).every(v => v);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (allConsented) {
        onConsent({
          ...consents,
          timestamp: new Date(),
          ipAddress: undefined, // Could be collected server-side
        });
      }
    }}>
      <h2>Créer un Compte - Consentements Requis</h2>

      <label>
        <input
          type="checkbox"
          checked={consents.dataRetention}
          onChange={(e) => setConsents({ ...consents, dataRetention: e.target.checked })}
        />
        <span>
          Je consens à la conservation de mes données d'entraînement
          conformément à la <a href="/privacy">politique de confidentialité</a>.
        </span>
      </label>

      <label>
        <input
          type="checkbox"
          checked={consents.dataProcessing}
          onChange={(e) => setConsents({ ...consents, dataProcessing: e.target.checked })}
        />
        <span>
          Je consens au traitement de mes données pour améliorer le service
          (statistiques, analytics).
        </span>
      </label>

      <label>
        <input
          type="checkbox"
          checked={consents.termsAccepted}
          onChange={(e) => setConsents({ ...consents, termsAccepted: e.target.checked })}
        />
        <span>
          J'accepte les <a href="/terms">conditions générales d'utilisation</a>.
        </span>
      </label>

      <label>
        <input
          type="checkbox"
          checked={consents.privacyPolicyAccepted}
          onChange={(e) => setConsents({ ...consents, privacyPolicyAccepted: e.target.checked })}
        />
        <span>
          J'ai lu et j'accepte la <a href="/privacy">politique de confidentialité</a>.
        </span>
      </label>

      <p className="text-sm text-gray-600">
        En créant un compte, vos données en mode Invité seront transférées
        vers votre compte permanent. Vous pouvez à tout moment demander
        la suppression de vos données en contactant privacy@app-kine.com.
      </p>

      <button type="submit" disabled={!allConsented}>
        Créer mon Compte
      </button>
    </form>
  );
}
```

4. **Required Documentation:**

```markdown
# Privacy Policy - Guest Mode Section

## Mode Invité (Guest Mode)

### Données Collectées
En mode Invité, nous collectons uniquement les données nécessaires au fonctionnement de l'application :
- Sessions d'entraînement (date, type, durée)
- Exercices (nom, séries, répétitions, poids)
- Métriques de performance (RPE, douleur)

### Stockage des Données
Les données en mode Invité sont stockées localement sur votre appareil (localStorage + IndexedDB).
Elles sont chiffrées avec AES-256-GCM pour votre protection.

**Important:** Le chiffrement client-side ne peut pas protéger contre tous les risques de sécurité.
Pour une protection maximale, créez un compte.

### Durée de Conservation
Les données en mode Invité sont automatiquement supprimées après 30 jours.

### Migration vers Compte Permanent
Vous pouvez à tout moment créer un compte pour sauvegarder vos données.
La migration nécessite votre consentement explicite conformément à l'article 6 du RGPD.

### Vos Droits
Conformément au RGPD, vous disposez des droits suivants :
- Droit d'accès (article 15)
- Droit de rectification (article 16)
- Droit à l'effacement (article 17)
- Droit à la portabilité (article 20)

Pour exercer vos droits : privacy@app-kine.com
```

---

## Integration Points & Dependencies

### Story 1.6 Integration

**Dependencies:**
- ✅ Story 1.5 (Historique et Statistiques) - COMPLETED
- ✅ Story 2.4 (Validation de Séance) - COMPLETED
- ✅ Supabase Auth - EXISTS
- ✅ TanStack Query - EXISTS

**Integration Points:**
1. **With Story 2.4:** Trigger badge checks and streak updates on session validation
2. **With Story 1.5:** Display gamification stats in dashboard
3. **With User Profile:** Show badges and streaks in profile
4. **With Navigation:** Add gamification section to navigation

**No Breaking Changes:** Story 1.6 is purely additive

### Story 1.7 Integration

**Dependencies:**
- ⚠️ Story 1.5 (Export Service) - EXISTS but needs extension
- ⚠️ Supabase Auth - EXISTS but Guest mode bypasses it
- ✅ React Router - EXISTS
- ⚠️ RGPD Service - EXISTS but needs extension

**Integration Points:**
1. **With Authentication:** Add Guest mode detection and routing
2. **With Export Service:** Extend to support Guest data
3. **With RGPD Service:** Add Guest-specific compliance
4. **With All Components:** Detect and adapt to Guest mode

**Potential Breaking Changes:**
- Auth guard needs to allow Guest mode
- Navigation needs Guest-specific routes
- API calls need Guest mode handling

---

## Risk Assessment

### Story 1.6 Risks

| Risk | Severity | Probability | Impact | Mitigation |
|------|----------|-------------|--------|------------|
| Database performance degradation | Medium | Medium | Query slowdowns | Implement caching, optimize indexes |
| Email spam / deliverability | Medium | Low | User complaints, costs | Rate limiting, opt-in, monitoring |
| Notification permission denial | Low | High | Feature not used | Email fallback, in-app notifications |
| Badge calculation errors | Low | Low | Incorrect rewards | Comprehensive tests, validation |
| Streak calculation bugs | Medium | Medium | User frustration | Extensive testing, logging |

**Overall Risk Level for Story 1.6:** MEDIUM

### Story 1.7 Risks

| Risk | Severity | Probability | Impact | Mitigation |
|------|----------|-------------|--------|------------|
| Encryption vulnerability | HIGH | Medium | Data exposure | Security audit, Web Crypto API |
| localStorage quota exceeded | HIGH | High | App crash, data loss | Quota monitoring, limits, warnings |
| Migration failure / data loss | HIGH | Medium | User frustration | Atomic transactions, rollback, testing |
| XSS attacks on Guest data | HIGH | Low | Data theft | CSP, sanitization, security testing |
| RGPD non-compliance | HIGH | Medium | Legal liability | Legal review, DPIA, documentation |
| Browser compatibility | Medium | Medium | Feature unavailable | Fallbacks, feature detection |

**Overall Risk Level for Story 1.7:** HIGH

---

## Performance Considerations

### Story 1.6 Performance

**Database Queries:**
- Streak calculation: O(n) where n = number of sessions
- Badge checking: O(m) where m = number of badge types
- Notification queries: O(1) with proper indexes

**Optimization:**
- ✅ Use triggers to update streaks only on status change
- ✅ Cache badge checks for 5 minutes
- ✅ Batch badge attribution queries
- ✅ Add composite indexes for common queries

**Expected Impact:**
- Database load: +10-15% (acceptable)
- API response time: +50-100ms (acceptable)
- Client-side rendering: minimal impact

### Story 1.7 Performance

**Client-Side Operations:**
- Encryption: ~10-50ms per session (Web Crypto API)
- Decryption: ~10-50ms per session
- localStorage read/write: ~1-5ms

**Storage Size:**
- 1 session encrypted: ~5-10KB
- 100 sessions encrypted: ~500KB - 1MB
- Total with exercises: ~2-4MB (within limits)

**Optimization:**
- ✅ Use Web Crypto API (faster than crypto-js)
- ✅ Compress data before encryption (optional)
- ✅ Lazy load old sessions (pagination)
- ✅ Monitor quota and warn users

**Expected Impact:**
- Initial load: +100-200ms (encryption key setup)
- Session save: +10-20ms (encryption overhead)
- Migration: 5-30 seconds for 100 sessions (acceptable)

---

## Security Review

### Story 1.6 Security

**Threat Model:**
1. **Unauthorized access to notifications:** Mitigated by RLS
2. **Email spoofing:** Mitigated by rate limiting and logging
3. **Notification spam:** Mitigated by opt-in and frequency limits
4. **Badge manipulation:** Mitigated by server-side calculation

**Security Measures:**
- ✅ RLS on all tables
- ✅ Service role key only in Edge Functions
- ✅ Rate limiting on email sending
- ✅ Opt-in for all notifications
- ✅ Audit logging of notification sends

**Security Rating:** MEDIUM (acceptable for production)

### Story 1.7 Security

**Threat Model:**
1. **XSS attacks on Guest data:** HIGH RISK
2. **Weak encryption:** HIGH RISK (if using crypto-js)
3. **Key exposure:** HIGH RISK (if in localStorage)
4. **Migration data leakage:** MEDIUM RISK
5. **RGPD violations:** HIGH RISK (legal)

**Security Measures:**
- ⚠️ Web Crypto API instead of crypto-js (REQUIRED)
- ⚠️ IndexedDB for key storage (REQUIRED)
- ⚠️ CSP headers (REQUIRED)
- ⚠️ Input sanitization (REQUIRED)
- ⚠️ Atomic migration with rollback (REQUIRED)
- ⚠️ Security audit before production (REQUIRED)

**Security Rating:** HIGH RISK (requires additional safeguards)

---

## Recommendations & Action Items

### Story 1.6: Gamification et Rappels

#### Must Have (Before Development)

1. **Database Optimization**
   - [ ] Implement streak caching in `user_streaks` table
   - [ ] Add composite indexes for performance
   - [ ] Create trigger-based streak updates
   - [ ] Optimize badge checking with single RPC call

2. **Notification Architecture**
   - [ ] Implement comprehensive fallback strategy (Web Push → Email → In-App)
   - [ ] Add browser compatibility checks
   - [ ] Create Edge Function for email reminders with rate limiting
   - [ ] Add notification logging and monitoring

3. **Testing**
   - [ ] Performance testing with 1000+ sessions
   - [ ] Browser compatibility testing (Chrome, Firefox, Safari, iOS Safari)
   - [ ] Email deliverability testing
   - [ ] Load testing for badge calculations

#### Should Have (Before Production)

4. **Monitoring**
   - [ ] Add metrics for notification delivery rates
   - [ ] Monitor database query performance
   - [ ] Track badge attribution accuracy
   - [ ] Alert on email send failures

5. **User Experience**
   - [ ] Add clear permission request flow for notifications
   - [ ] Provide fallback messaging for unsupported browsers
   - [ ] Add notification preferences in user settings

#### Nice to Have (Post-MVP)

6. **Enhancements**
   - [ ] A/B test notification timing for optimal engagement
   - [ ] Personalize badge requirements based on user level
   - [ ] Add social sharing of achievements
   - [ ] Implement push notification scheduling for optimal times

### Story 1.7: Mode Guest et Export

#### Critical (Before Development)

1. **Security Hardening**
   - [ ] **REQUIRED:** Replace crypto-js with Web Crypto API
   - [ ] **REQUIRED:** Store encryption keys in IndexedDB (not localStorage)
   - [ ] **REQUIRED:** Implement CSP headers
   - [ ] **REQUIRED:** Add input sanitization for all Guest data
   - [ ] **REQUIRED:** Security audit by security specialist

2. **Migration Safety**
   - [ ] **REQUIRED:** Implement atomic migration with PostgreSQL transaction
   - [ ] **REQUIRED:** Add rollback mechanism
   - [ ] **REQUIRED:** Comprehensive error handling
   - [ ] **REQUIRED:** Data validation before and after migration

3. **RGPD Compliance**
   - [ ] **REQUIRED:** Legal review of privacy policy and consent forms
   - [ ] **REQUIRED:** Complete DPIA (Data Protection Impact Assessment)
   - [ ] **REQUIRED:** Document all data processing activities
   - [ ] **REQUIRED:** Implement consent logging
   - [ ] **REQUIRED:** Add data deletion API

#### Must Have (Before Development)

4. **Storage Management**
   - [ ] Implement localStorage quota monitoring
   - [ ] Add user warnings at 80% and 95% capacity
   - [ ] Implement automatic cleanup of old sessions
   - [ ] Add session count limit (100 max)

5. **Testing**
   - [ ] XSS vulnerability testing
   - [ ] Encryption strength testing
   - [ ] Migration testing (happy path + error scenarios)
   - [ ] Browser storage limit testing
   - [ ] RGPD compliance testing

#### Should Have (Before Production)

6. **User Experience**
   - [ ] Add security disclaimer for Guest mode
   - [ ] Implement storage status indicator
   - [ ] Add migration progress indicator
   - [ ] Create clear conversion CTAs

7. **Monitoring**
   - [ ] Track Guest conversion rate
   - [ ] Monitor migration success/failure rate
   - [ ] Alert on storage quota issues
   - [ ] Track Guest session retention

#### Nice to Have (Post-MVP)

8. **Enhancements**
   - [ ] Implement data compression before encryption
   - [ ] Add Guest data export before expiration
   - [ ] Implement Guest data backup to cloud (with consent)
   - [ ] A/B test different conversion strategies

---

## Approval Decision Summary

### Story 1.6: Gamification et Rappels
**Status:** ⚠️ **APPROVED WITH CONDITIONS**

**Conditions for Approval:**
1. Implement database query optimization (caching, indexes, triggers) BEFORE development
2. Add comprehensive notification fallback strategy
3. Implement rate limiting for email reminders
4. Add performance testing plan to QA gate

**Estimated Additional Effort:** +2-3 days for optimization and testing

**Ready for Development:** YES (with conditions implemented first)

---

### Story 1.7: Mode Guest et Export
**Status:** 🚨 **APPROVED WITH MAJOR CONDITIONS**

**Critical Conditions for Approval:**
1. **SECURITY:** Replace crypto-js with Web Crypto API (non-negotiable)
2. **SECURITY:** Security audit by specialist BEFORE production
3. **LEGAL:** Legal review of RGPD compliance approach
4. **SAFETY:** Implement atomic migration with rollback
5. **MONITORING:** Add comprehensive error tracking and quota monitoring

**Estimated Additional Effort:** +5-7 days for security hardening, +2-3 days for legal review

**Ready for Development:** YES (with security improvements implemented in parallel)

**Production Ready:** NO (requires security audit + legal validation)

---

## Next Steps

### Immediate Actions (This Week)

1. **Story 1.6:**
   - Create optimized database migration with indexes and triggers
   - Design notification fallback architecture
   - Document email reminder scheduling strategy

2. **Story 1.7:**
   - Replace crypto-js with Web Crypto API in architecture
   - Schedule security audit with security team
   - Schedule legal review with legal counsel

### Pre-Development (Next Week)

3. **Story 1.6:**
   - Finalize Edge Function implementation for email reminders
   - Create performance testing plan
   - Review with QA team

4. **Story 1.7:**
   - Implement migration safety mechanisms (atomic transactions, rollback)
   - Add storage quota monitoring
   - Create comprehensive test plan for security vulnerabilities

### During Development

5. **Story 1.6:**
   - Implement with optimizations from day 1
   - Continuous performance monitoring
   - Browser compatibility testing

6. **Story 1.7:**
   - Implement security measures in parallel with features
   - Continuous security testing
   - Legal review checkpoints

### Pre-Production

7. **Both Stories:**
   - Complete QA gates
   - Performance benchmarking
   - Security review
   - Legal sign-off (Story 1.7)

---

## Conclusion

Both stories are architecturally sound and align with the Revia Sport MVP vision. However:

- **Story 1.6** requires performance optimizations to ensure scalability
- **Story 1.7** requires significant security hardening and legal validation

With the recommended mitigations and conditions implemented, both stories can proceed to development.

**Recommendation:** Implement Story 1.6 first (lower risk, faster to production), then Story 1.7 after security and legal reviews are complete.

---

**Reviewed By:** Alex (Software Architect)
**Date:** 2025-01-15
**Status:** Architecture Review Complete
**Next Review:** Before Production Deployment
