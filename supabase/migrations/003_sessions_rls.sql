-- Migration pour les sessions avec RLS - Story 2.2
-- Création de la table sessions avec Row Level Security

-- Table sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rehabilitation', 'sport', 'fitness', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  objectives TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour l'isolation des données
-- Les utilisateurs ne peuvent voir que leurs propres sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres sessions
CREATE POLICY "Users can create own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres sessions
CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres sessions
CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Activation de RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Fonction pour obtenir les statistiques des sessions
CREATE OR REPLACE FUNCTION get_session_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalSessions', COUNT(*),
    'sessionsThisMonth', COUNT(*) FILTER (WHERE date >= date_trunc('month', CURRENT_DATE)),
    'sessionsThisYear', COUNT(*) FILTER (WHERE date >= date_trunc('year', CURRENT_DATE)),
    'completedSessions', COUNT(*) FILTER (WHERE status = 'completed'),
    'inProgressSessions', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'draftSessions', COUNT(*) FILTER (WHERE status = 'draft'),
    'averageSessionsPerWeek', ROUND(COUNT(*) / GREATEST(EXTRACT(WEEK FROM CURRENT_DATE - MIN(date)), 1), 2),
    'mostCommonType', (
      SELECT type 
      FROM sessions 
      WHERE user_id = user_uuid 
      GROUP BY type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    )
  ) INTO result
  FROM sessions
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rechercher des sessions
CREATE OR REPLACE FUNCTION search_sessions(user_uuid UUID, search_query TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  date DATE,
  type TEXT,
  status TEXT,
  objectives TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM sessions s
  WHERE s.user_id = user_uuid
    AND (
      s.name ILIKE '%' || search_query || '%'
      OR s.objectives ILIKE '%' || search_query || '%'
      OR s.notes ILIKE '%' || search_query || '%'
    )
  ORDER BY s.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les sessions avec pagination
CREATE OR REPLACE FUNCTION get_sessions_paginated(
  user_uuid UUID,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10,
  filter_type TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL
)
RETURNS TABLE (
  sessions JSON,
  total_count BIGINT,
  total_pages INTEGER
) AS $$
DECLARE
  offset_value INTEGER;
  total_sessions BIGINT;
  total_pages INTEGER;
  sessions_json JSON;
BEGIN
  -- Calcul de l'offset
  offset_value := (page_number - 1) * page_size;
  
  -- Construction de la requête avec filtres
  SELECT COUNT(*) INTO total_sessions
  FROM sessions s
  WHERE s.user_id = user_uuid
    AND (filter_type IS NULL OR s.type = filter_type)
    AND (filter_status IS NULL OR s.status = filter_status)
    AND (date_from IS NULL OR s.date >= date_from)
    AND (date_to IS NULL OR s.date <= date_to);
  
  -- Calcul du nombre total de pages
  total_pages := CEIL(total_sessions::FLOAT / page_size);
  
  -- Récupération des sessions avec pagination
  SELECT json_agg(
    json_build_object(
      'id', s.id,
      'user_id', s.user_id,
      'name', s.name,
      'date', s.date,
      'type', s.type,
      'status', s.status,
      'objectives', s.objectives,
      'notes', s.notes,
      'created_at', s.created_at,
      'updated_at', s.updated_at
    )
  ) INTO sessions_json
  FROM (
    SELECT *
    FROM sessions s
    WHERE s.user_id = user_uuid
      AND (filter_type IS NULL OR s.type = filter_type)
      AND (filter_status IS NULL OR s.status = filter_status)
      AND (date_from IS NULL OR s.date >= date_from)
      AND (date_to IS NULL OR s.date <= date_to)
    ORDER BY s.date DESC
    LIMIT page_size OFFSET offset_value
  ) s;
  
  RETURN QUERY
  SELECT 
    COALESCE(sessions_json, '[]'::json),
    total_sessions,
    total_pages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les sessions par période
CREATE OR REPLACE FUNCTION get_sessions_by_period(
  user_uuid UUID,
  period_type TEXT DEFAULT 'month' -- 'day', 'week', 'month', 'year'
)
RETURNS TABLE (
  period_start DATE,
  period_end DATE,
  session_count BIGINT,
  sessions JSON
) AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  -- Calcul des dates selon la période
  CASE period_type
    WHEN 'day' THEN
      start_date := CURRENT_DATE;
      end_date := CURRENT_DATE;
    WHEN 'week' THEN
      start_date := date_trunc('week', CURRENT_DATE)::DATE;
      end_date := (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::DATE;
    WHEN 'month' THEN
      start_date := date_trunc('month', CURRENT_DATE)::DATE;
      end_date := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    WHEN 'year' THEN
      start_date := date_trunc('year', CURRENT_DATE)::DATE;
      end_date := (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')::DATE;
    ELSE
      start_date := date_trunc('month', CURRENT_DATE)::DATE;
      end_date := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  END CASE;
  
  RETURN QUERY
  SELECT 
    start_date,
    end_date,
    COUNT(*),
    json_agg(
      json_build_object(
        'id', s.id,
        'name', s.name,
        'date', s.date,
        'type', s.type,
        'status', s.status,
        'objectives', s.objectives,
        'notes', s.notes
      )
    )
  FROM sessions s
  WHERE s.user_id = user_uuid
    AND s.date >= start_date
    AND s.date <= end_date
  GROUP BY start_date, end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques avancées
CREATE OR REPLACE FUNCTION get_advanced_session_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalSessions', COUNT(*),
    'sessionsThisMonth', COUNT(*) FILTER (WHERE date >= date_trunc('month', CURRENT_DATE)),
    'sessionsThisYear', COUNT(*) FILTER (WHERE date >= date_trunc('year', CURRENT_DATE)),
    'completedSessions', COUNT(*) FILTER (WHERE status = 'completed'),
    'inProgressSessions', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'draftSessions', COUNT(*) FILTER (WHERE status = 'draft'),
    'averageSessionsPerWeek', ROUND(COUNT(*) / GREATEST(EXTRACT(WEEK FROM CURRENT_DATE - MIN(date)), 1), 2),
    'mostCommonType', (
      SELECT type 
      FROM sessions 
      WHERE user_id = user_uuid 
      GROUP BY type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    'sessionsByType', (
      SELECT json_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM sessions
        WHERE user_id = user_uuid
        GROUP BY type
      ) t
    ),
    'sessionsByStatus', (
      SELECT json_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM sessions
        WHERE user_id = user_uuid
        GROUP BY status
      ) t
    ),
    'sessionsByMonth', (
      SELECT json_object_agg(month, count)
      FROM (
        SELECT 
          to_char(date, 'YYYY-MM') as month,
          COUNT(*) as count
        FROM sessions
        WHERE user_id = user_uuid
        GROUP BY to_char(date, 'YYYY-MM')
        ORDER BY month
      ) t
    ),
    'longestStreak', (
      WITH daily_sessions AS (
        SELECT 
          date,
          ROW_NUMBER() OVER (ORDER BY date) as rn,
          date - (ROW_NUMBER() OVER (ORDER BY date))::INTEGER as grp
        FROM sessions
        WHERE user_id = user_uuid
        GROUP BY date
      ),
      streaks AS (
        SELECT 
          grp,
          COUNT(*) as streak_length
        FROM daily_sessions
        GROUP BY grp
      )
      SELECT MAX(streak_length)
      FROM streaks
    )
  ) INTO result
  FROM sessions
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE sessions IS 'Table des sessions d''entraînement et de rééducation';
COMMENT ON COLUMN sessions.id IS 'Identifiant unique de la session';
COMMENT ON COLUMN sessions.user_id IS 'Identifiant de l''utilisateur propriétaire';
COMMENT ON COLUMN sessions.name IS 'Nom de la session';
COMMENT ON COLUMN sessions.date IS 'Date de la session';
COMMENT ON COLUMN sessions.type IS 'Type d''activité (rehabilitation, sport, fitness, other)';
COMMENT ON COLUMN sessions.status IS 'Statut de la session (draft, in_progress, completed)';
COMMENT ON COLUMN sessions.objectives IS 'Objectifs de la session';
COMMENT ON COLUMN sessions.notes IS 'Notes supplémentaires';
COMMENT ON COLUMN sessions.created_at IS 'Date de création';
COMMENT ON COLUMN sessions.updated_at IS 'Date de dernière modification';
