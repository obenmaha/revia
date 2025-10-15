-- Migration: Notification Preferences and Reminder System - FR9
-- Purpose: Create notification preferences table and related functions for reminder system
-- Date: 2025-01-15

-- ==============================================================================
-- CREATE NOTIFICATION PREFERENCES TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT FALSE,
  reminder_time VARCHAR(5) NOT NULL DEFAULT '18:00',
  reminder_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
  reminder_frequency VARCHAR(20) DEFAULT 'twice_weekly' CHECK (reminder_frequency IN ('daily', 'twice_weekly', 'weekly')),
  last_reminded_at TIMESTAMP WITH TIME ZONE,
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==============================================================================
-- CREATE NOTIFICATION LOGS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email_reminder', 'push_notification', 'in_app')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ==============================================================================
-- CREATE USER PROFILE TABLE (if not exists)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
  weight_kg DECIMAL(5,2) CHECK (weight_kg > 0 AND weight_kg < 500),
  fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  goals JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Notification preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_email_enabled ON notification_preferences(email_enabled) WHERE email_enabled = true;
CREATE INDEX IF NOT EXISTS idx_notification_preferences_push_enabled ON notification_preferences(push_enabled) WHERE push_enabled = true;

-- Notification logs indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);

-- User profile indexes
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id ON user_profile(user_id);

-- ==============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================================================

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON notification_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profile_updated_at 
    BEFORE UPDATE ON user_profile 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences" ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notification preferences" ON notification_preferences
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for notification_logs
CREATE POLICY "Users can view own notification logs" ON notification_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification logs" ON notification_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_profile
CREATE POLICY "Users can view own profile" ON user_profile
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON user_profile
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profile
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own profile" ON user_profile
  FOR DELETE USING (user_id = auth.uid());

-- ==============================================================================
-- FUNCTIONS FOR NOTIFICATION SYSTEM
-- ==============================================================================

-- Function to get users who need reminders
CREATE OR REPLACE FUNCTION get_users_for_reminders()
RETURNS TABLE (
  user_id UUID,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  reminder_time VARCHAR(5),
  reminder_days INTEGER[],
  reminder_frequency VARCHAR(20),
  timezone VARCHAR(50),
  last_reminded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.user_id,
    up.email,
    up.first_name,
    up.last_name,
    np.reminder_time,
    np.reminder_days,
    np.reminder_frequency,
    np.timezone,
    np.last_reminded_at
  FROM notification_preferences np
  JOIN user_profile up ON up.user_id = np.user_id
  WHERE np.email_enabled = true
    AND up.email IS NOT NULL
    AND (
      np.last_reminded_at IS NULL 
      OR np.last_reminded_at < NOW() - INTERVAL '23 hours'
    )
    AND (
      np.reminder_frequency = 'daily'
      OR (np.reminder_frequency = 'twice_weekly' AND np.last_reminded_at < NOW() - INTERVAL '3 days')
      OR (np.reminder_frequency = 'weekly' AND np.last_reminded_at < NOW() - INTERVAL '6 days')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log notification sent
CREATE OR REPLACE FUNCTION log_notification_sent(
  p_user_id UUID,
  p_type VARCHAR(20),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO notification_logs (user_id, type, metadata)
  VALUES (p_user_id, p_type, p_metadata)
  RETURNING id INTO log_id;
  
  -- Update last_reminded_at in notification_preferences
  UPDATE notification_preferences 
  SET last_reminded_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive reminder
CREATE OR REPLACE FUNCTION should_send_reminder(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  prefs RECORD;
  last_reminder TIMESTAMP WITH TIME ZONE;
  hours_since_last INTEGER;
BEGIN
  -- Get user preferences
  SELECT * INTO prefs
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences or email disabled, don't send
  IF NOT FOUND OR NOT prefs.email_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check last reminder time
  last_reminder := prefs.last_reminded_at;
  IF last_reminder IS NULL THEN
    RETURN TRUE; -- First reminder
  END IF;
  
  hours_since_last := EXTRACT(EPOCH FROM (NOW() - last_reminder)) / 3600;
  
  -- Check frequency rules
  CASE prefs.reminder_frequency
    WHEN 'daily' THEN
      RETURN hours_since_last >= 23; -- At least 23 hours
    WHEN 'twice_weekly' THEN
      RETURN hours_since_last >= 72; -- At least 3 days
    WHEN 'weekly' THEN
      RETURN hours_since_last >= 168; -- At least 7 days
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- GRANT PERMISSIONS
-- ==============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO authenticated;
GRANT SELECT, INSERT ON notification_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profile TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_users_for_reminders() TO authenticated;
GRANT EXECUTE ON FUNCTION log_notification_sent(UUID, VARCHAR(20), JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION should_send_reminder(UUID) TO authenticated;

-- ==============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================================================

COMMENT ON TABLE notification_preferences IS 'User notification preferences for reminders and alerts';
COMMENT ON COLUMN notification_preferences.user_id IS 'Reference to auth.users';
COMMENT ON COLUMN notification_preferences.email_enabled IS 'Whether email reminders are enabled';
COMMENT ON COLUMN notification_preferences.push_enabled IS 'Whether push notifications are enabled';
COMMENT ON COLUMN notification_preferences.reminder_time IS 'Preferred time for reminders (HH:MM format)';
COMMENT ON COLUMN notification_preferences.reminder_days IS 'Days of week for reminders (1=Monday, 7=Sunday)';
COMMENT ON COLUMN notification_preferences.reminder_frequency IS 'How often to send reminders';
COMMENT ON COLUMN notification_preferences.last_reminded_at IS 'Timestamp of last reminder sent';
COMMENT ON COLUMN notification_preferences.timezone IS 'User timezone for reminder scheduling';

COMMENT ON TABLE notification_logs IS 'Log of all notifications sent to users';
COMMENT ON COLUMN notification_logs.user_id IS 'Reference to auth.users';
COMMENT ON COLUMN notification_logs.type IS 'Type of notification sent';
COMMENT ON COLUMN notification_logs.sent_at IS 'When the notification was sent';
COMMENT ON COLUMN notification_logs.metadata IS 'Additional data about the notification';

COMMENT ON TABLE user_profile IS 'Extended user profile information for sport app';
COMMENT ON COLUMN user_profile.user_id IS 'Reference to auth.users';
COMMENT ON COLUMN user_profile.fitness_level IS 'User fitness level for personalized recommendations';
COMMENT ON COLUMN user_profile.goals IS 'User fitness goals as JSON';
COMMENT ON COLUMN user_profile.preferences IS 'User preferences as JSON';

COMMENT ON FUNCTION get_users_for_reminders() IS 'Get users who are eligible to receive reminders based on their preferences and last reminder time';
COMMENT ON FUNCTION log_notification_sent(UUID, VARCHAR(20), JSONB) IS 'Log a notification that was sent and update last_reminded_at';
COMMENT ON FUNCTION should_send_reminder(UUID) IS 'Check if a user should receive a reminder based on their preferences and timing';
