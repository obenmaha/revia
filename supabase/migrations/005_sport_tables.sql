-- Migration pour les tables sport - Story 1.5
-- Création des tables sport_sessions et sport_exercises avec RLS

-- Créer les types ENUM pour le sport
CREATE TYPE sport_session_type AS ENUM ('cardio', 'musculation', 'flexibility', 'other');
CREATE TYPE sport_session_status AS ENUM ('draft', 'in_progress', 'completed');
CREATE TYPE sport_exercise_type AS ENUM ('cardio', 'musculation', 'flexibility', 'other');

-- Table des sessions sport
CREATE TABLE IF NOT EXISTS sport_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type sport_session_type NOT NULL,
  status sport_session_status NOT NULL DEFAULT 'draft',
  objectives TEXT,
  notes TEXT,
  rpe_score INTEGER CHECK (rpe_score >= 1 AND rpe_score <= 10),
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 10),
  duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes <= 480), -- max 8h
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des exercices sport
CREATE TABLE IF NOT EXISTS sport_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sport_sessions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  exercise_type sport_exercise_type NOT NULL,
  sets INTEGER CHECK (sets >= 0 AND sets <= 100),
  reps INTEGER CHECK (reps >= 0 AND reps <= 1000),
  weight_kg DECIMAL(5,2) CHECK (weight_kg >= 0 AND weight_kg <= 1000),
  duration_seconds INTEGER CHECK (duration_seconds >= 0 AND duration_seconds <= 3600), -- max 1h par exercice
  rest_seconds INTEGER CHECK (rest_seconds >= 0 AND rest_seconds <= 600), -- max 10min de repos
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT CHECK (LENGTH(notes) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_sport_sessions_user_id ON sport_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_sessions_date ON sport_sessions(date);
CREATE INDEX IF NOT EXISTS idx_sport_sessions_type ON sport_sessions(type);
CREATE INDEX IF NOT EXISTS idx_sport_sessions_status ON sport_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sport_sessions_user_date ON sport_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sport_sessions_created_at ON sport_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_sport_exercises_session_id ON sport_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_sport_exercises_order_index ON sport_exercises(session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sport_exercises_type ON sport_exercises(exercise_type);
CREATE INDEX IF NOT EXISTS idx_sport_exercises_created_at ON sport_exercises(created_at);

-- Triggers pour updated_at
CREATE TRIGGER update_sport_sessions_updated_at 
    BEFORE UPDATE ON sport_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sport_exercises_updated_at 
    BEFORE UPDATE ON sport_exercises 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE sport_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_exercises ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour sport_sessions
-- Les utilisateurs peuvent voir leurs propres sessions sport
CREATE POLICY "Users can view own sport sessions" ON sport_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres sessions sport
CREATE POLICY "Users can create own sport sessions" ON sport_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres sessions sport
CREATE POLICY "Users can update own sport sessions" ON sport_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres sessions sport
CREATE POLICY "Users can delete own sport sessions" ON sport_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour sport_exercises
-- Les utilisateurs peuvent voir les exercices de leurs sessions sport
CREATE POLICY "Users can view sport exercises for own sessions" ON sport_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sport_sessions 
      WHERE sport_sessions.id = sport_exercises.session_id 
      AND sport_sessions.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des exercices pour leurs sessions sport
CREATE POLICY "Users can create sport exercises for own sessions" ON sport_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sport_sessions 
      WHERE sport_sessions.id = sport_exercises.session_id 
      AND sport_sessions.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent modifier les exercices de leurs sessions sport
CREATE POLICY "Users can update sport exercises for own sessions" ON sport_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sport_sessions 
      WHERE sport_sessions.id = sport_exercises.session_id 
      AND sport_sessions.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer les exercices de leurs sessions sport
CREATE POLICY "Users can delete sport exercises for own sessions" ON sport_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sport_sessions 
      WHERE sport_sessions.id = sport_exercises.session_id 
      AND sport_sessions.user_id = auth.uid()
    )
  );

-- Fonction pour calculer les statistiques sport
CREATE OR REPLACE FUNCTION get_sport_stats(user_uuid UUID, period_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sessions', COUNT(*),
    'weekly_frequency', ROUND(COUNT(*)::DECIMAL / GREATEST(period_days / 7.0, 1), 2),
    'total_duration_minutes', COALESCE(SUM(duration_minutes), 0),
    'average_rpe', ROUND(COALESCE(AVG(rpe_score), 0), 1),
    'current_streak', (
      WITH daily_sessions AS (
        SELECT 
          date,
          ROW_NUMBER() OVER (ORDER BY date DESC) as rn,
          date + (ROW_NUMBER() OVER (ORDER BY date DESC))::INTEGER as grp
        FROM sport_sessions
        WHERE user_id = user_uuid
          AND status = 'completed'
          AND date >= CURRENT_DATE - INTERVAL '1 year'
        GROUP BY date
        ORDER BY date DESC
      ),
      streaks AS (
        SELECT 
          grp,
          COUNT(*) as streak_length
        FROM daily_sessions
        WHERE rn = 1 OR date = CURRENT_DATE - (rn - 1)::INTEGER
        GROUP BY grp
        ORDER BY grp
      )
      SELECT COALESCE(MAX(streak_length), 0)
      FROM streaks
      WHERE grp = (SELECT MIN(grp) FROM streaks)
    ),
    'best_streak', (
      WITH daily_sessions AS (
        SELECT 
          date,
          ROW_NUMBER() OVER (ORDER BY date) as rn,
          date - (ROW_NUMBER() OVER (ORDER BY date))::INTEGER as grp
        FROM sport_sessions
        WHERE user_id = user_uuid
          AND status = 'completed'
        GROUP BY date
      ),
      streaks AS (
        SELECT 
          grp,
          COUNT(*) as streak_length
        FROM daily_sessions
        GROUP BY grp
      )
      SELECT COALESCE(MAX(streak_length), 0)
      FROM streaks
    ),
    'sessions_by_type', (
      SELECT json_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM sport_sessions
        WHERE user_id = user_uuid
          AND status = 'completed'
          AND date >= CURRENT_DATE - (period_days || ' days')::INTERVAL
        GROUP BY type
      ) t
    ),
    'monthly_progression', (
      SELECT json_agg(
        json_build_object(
          'month', month,
          'sessions_count', sessions_count,
          'total_duration', total_duration,
          'average_rpe', average_rpe,
          'streak', streak
        )
      )
      FROM (
        SELECT 
          TO_CHAR(date, 'YYYY-MM') as month,
          COUNT(*) as sessions_count,
          SUM(duration_minutes) as total_duration,
          ROUND(AVG(rpe_score), 1) as average_rpe,
          (
            WITH daily_sessions AS (
              SELECT 
                date,
                ROW_NUMBER() OVER (ORDER BY date) as rn,
                date - (ROW_NUMBER() OVER (ORDER BY date))::INTEGER as grp
              FROM sport_sessions
              WHERE user_id = user_uuid
                AND status = 'completed'
                AND TO_CHAR(date, 'YYYY-MM') = TO_CHAR(sport_sessions.date, 'YYYY-MM')
              GROUP BY date
            ),
            streaks AS (
              SELECT 
                grp,
                COUNT(*) as streak_length
              FROM daily_sessions
              GROUP BY grp
            )
            SELECT COALESCE(MAX(streak_length), 0)
            FROM streaks
          ) as streak
        FROM sport_sessions
        WHERE user_id = user_uuid
          AND status = 'completed'
          AND date >= CURRENT_DATE - (period_days || ' days')::INTERVAL
        GROUP BY TO_CHAR(date, 'YYYY-MM')
        ORDER BY month
      ) t
    )
  ) INTO result
  FROM sport_sessions
  WHERE user_id = user_uuid
    AND status = 'completed'
    AND date >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour migrer les données existantes des sessions vers sport_sessions
CREATE OR REPLACE FUNCTION migrate_sessions_to_sport_sessions()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
  session_record RECORD;
BEGIN
  -- Migrer les sessions existantes vers sport_sessions
  FOR session_record IN 
    SELECT * FROM sessions 
    WHERE type IN ('sport', 'fitness')
  LOOP
    INSERT INTO sport_sessions (
      id,
      user_id,
      name,
      date,
      type,
      status,
      objectives,
      notes,
      created_at,
      updated_at
    ) VALUES (
      session_record.id,
      session_record.user_id,
      session_record.name,
      session_record.date,
      CASE 
        WHEN session_record.type = 'sport' THEN 'cardio'::sport_session_type
        WHEN session_record.type = 'fitness' THEN 'musculation'::sport_session_type
        ELSE 'other'::sport_session_type
      END,
      CASE 
        WHEN session_record.status = 'draft' THEN 'draft'::sport_session_status
        WHEN session_record.status = 'in_progress' THEN 'in_progress'::sport_session_status
        WHEN session_record.status = 'completed' THEN 'completed'::sport_session_status
        ELSE 'draft'::sport_session_status
      END,
      session_record.objectives,
      session_record.notes,
      session_record.created_at,
      session_record.updated_at
    )
    ON CONFLICT (id) DO NOTHING;
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour migrer les exercices existants vers sport_exercises
CREATE OR REPLACE FUNCTION migrate_exercises_to_sport_exercises()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
  exercise_record RECORD;
  sport_session_id UUID;
BEGIN
  -- Migrer les exercices existants vers sport_exercises
  FOR exercise_record IN 
    SELECT e.*, s.user_id
    FROM exercises e
    JOIN sessions s ON s.id = e.session_id
    WHERE s.type IN ('sport', 'fitness')
  LOOP
    -- Trouver la session sport correspondante
    SELECT id INTO sport_session_id
    FROM sport_sessions
    WHERE id = exercise_record.session_id;
    
    IF sport_session_id IS NOT NULL THEN
      INSERT INTO sport_exercises (
        id,
        session_id,
        name,
        exercise_type,
        sets,
        reps,
        weight_kg,
        duration_seconds,
        rest_seconds,
        order_index,
        notes,
        created_at,
        updated_at
      ) VALUES (
        exercise_record.id,
        sport_session_id,
        exercise_record.name,
        CASE 
          WHEN exercise_record.exercise_type = 'cardio' THEN 'cardio'::sport_exercise_type
          WHEN exercise_record.exercise_type = 'musculation' THEN 'musculation'::sport_exercise_type
          WHEN exercise_record.exercise_type = 'etirement' THEN 'flexibility'::sport_exercise_type
          ELSE 'other'::sport_exercise_type
        END,
        COALESCE(exercise_record.sets, 0),
        COALESCE(exercise_record.reps, 0),
        COALESCE(exercise_record.weight, 0),
        exercise_record.duration * 60, -- Convertir minutes en secondes
        COALESCE(exercise_record.rest_seconds, 0),
        exercise_record.order_index,
        exercise_record.notes,
        exercise_record.created_at,
        exercise_record.updated_at
      )
      ON CONFLICT (id) DO NOTHING;
      
      migrated_count := migrated_count + 1;
    END IF;
  END LOOP;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur les tables
COMMENT ON TABLE sport_sessions IS 'Table des sessions d''entraînement sportif';
COMMENT ON COLUMN sport_sessions.id IS 'Identifiant unique de la session sport';
COMMENT ON COLUMN sport_sessions.user_id IS 'Identifiant de l''utilisateur propriétaire';
COMMENT ON COLUMN sport_sessions.name IS 'Nom de la session sport';
COMMENT ON COLUMN sport_sessions.date IS 'Date de la session sport';
COMMENT ON COLUMN sport_sessions.type IS 'Type d''activité sportive (cardio, musculation, flexibility, other)';
COMMENT ON COLUMN sport_sessions.status IS 'Statut de la session (draft, in_progress, completed)';
COMMENT ON COLUMN sport_sessions.rpe_score IS 'Score RPE (Rate of Perceived Exertion) de 1 à 10';
COMMENT ON COLUMN sport_sessions.pain_level IS 'Niveau de douleur de 1 à 10';
COMMENT ON COLUMN sport_sessions.duration_minutes IS 'Durée de la session en minutes';

COMMENT ON TABLE sport_exercises IS 'Table des exercices dans les sessions sport';
COMMENT ON COLUMN sport_exercises.id IS 'Identifiant unique de l''exercice';
COMMENT ON COLUMN sport_exercises.session_id IS 'Identifiant de la session sport parente';
COMMENT ON COLUMN sport_exercises.name IS 'Nom de l''exercice';
COMMENT ON COLUMN sport_exercises.exercise_type IS 'Type d''exercice (cardio, musculation, flexibility, other)';
COMMENT ON COLUMN sport_exercises.sets IS 'Nombre de séries';
COMMENT ON COLUMN sport_exercises.reps IS 'Nombre de répétitions';
COMMENT ON COLUMN sport_exercises.weight_kg IS 'Poids en kilogrammes';
COMMENT ON COLUMN sport_exercises.duration_seconds IS 'Durée de l''exercice en secondes';
COMMENT ON COLUMN sport_exercises.rest_seconds IS 'Temps de repos en secondes';
COMMENT ON COLUMN sport_exercises.order_index IS 'Ordre d''exécution dans la session';

