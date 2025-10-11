-- Migration pour les exercices - Story 2.3
-- Création de la table exercises avec RLS

-- Créer la table exercises
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0 AND duration <= 300),
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  weight DECIMAL(5,2) CHECK (weight >= 0 AND weight <= 1000),
  sets INTEGER CHECK (sets >= 1 AND sets <= 100),
  reps INTEGER CHECK (reps >= 1 AND reps <= 1000),
  notes TEXT CHECK (LENGTH(notes) <= 500),
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('cardio', 'musculation', 'etirement', 'autre')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_exercises_session_id ON exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_exercises_order_index ON exercises(session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_exercise_type ON exercises(exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercises_created_at ON exercises(created_at);

-- Activer RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les utilisateurs peuvent gérer les exercices de leurs propres sessions
CREATE POLICY "Users can manage exercises for own sessions" ON exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = exercises.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Politique RLS : Les utilisateurs peuvent voir les exercices de leurs sessions
CREATE POLICY "Users can view exercises for own sessions" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = exercises.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Politique RLS : Les utilisateurs peuvent insérer des exercices dans leurs sessions
CREATE POLICY "Users can insert exercises for own sessions" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = exercises.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Politique RLS : Les utilisateurs peuvent modifier les exercices de leurs sessions
CREATE POLICY "Users can update exercises for own sessions" ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = exercises.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Politique RLS : Les utilisateurs peuvent supprimer les exercices de leurs sessions
CREATE POLICY "Users can delete exercises for own sessions" ON exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = exercises.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_exercises_updated_at();

-- Fonction pour calculer les statistiques d'une session
CREATE OR REPLACE FUNCTION get_session_exercise_stats(session_uuid UUID)
RETURNS TABLE (
  total_duration INTEGER,
  average_intensity DECIMAL(3,1),
  total_weight DECIMAL(10,2),
  exercise_count INTEGER,
  calories_burned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(e.duration), 0)::INTEGER as total_duration,
    COALESCE(
      CASE 
        WHEN SUM(e.duration) > 0 THEN 
          ROUND(SUM(e.intensity * e.duration)::DECIMAL / SUM(e.duration), 1)
        ELSE 0 
      END, 0
    ) as average_intensity,
    COALESCE(SUM(e.weight * e.sets * e.reps), 0) as total_weight,
    COUNT(e.id)::INTEGER as exercise_count,
    COALESCE(ROUND(SUM(e.duration * e.intensity * 0.1)), 0)::INTEGER as calories_burned
  FROM exercises e
  WHERE e.session_id = session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour réorganiser les exercices
CREATE OR REPLACE FUNCTION reorder_exercises(
  session_uuid UUID,
  exercise_orders JSONB
)
RETURNS VOID AS $$
DECLARE
  exercise_order JSONB;
BEGIN
  -- Vérifier que la session appartient à l'utilisateur
  IF NOT EXISTS (
    SELECT 1 FROM sessions 
    WHERE id = session_uuid 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Session non trouvée ou non autorisée';
  END IF;

  -- Mettre à jour l'ordre des exercices
  FOR exercise_order IN SELECT * FROM jsonb_array_elements(exercise_orders)
  LOOP
    UPDATE exercises 
    SET 
      order_index = (exercise_order->>'orderIndex')::INTEGER,
      updated_at = NOW()
    WHERE 
      id = (exercise_order->>'id')::UUID 
      AND session_id = session_uuid;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour la documentation
COMMENT ON TABLE exercises IS 'Table des exercices pour les sessions de kinésithérapie';
COMMENT ON COLUMN exercises.id IS 'Identifiant unique de l''exercice';
COMMENT ON COLUMN exercises.session_id IS 'Identifiant de la session parente';
COMMENT ON COLUMN exercises.name IS 'Nom de l''exercice';
COMMENT ON COLUMN exercises.duration IS 'Durée en minutes (1-300)';
COMMENT ON COLUMN exercises.intensity IS 'Intensité RPE (1-10)';
COMMENT ON COLUMN exercises.weight IS 'Poids en kg (optionnel)';
COMMENT ON COLUMN exercises.sets IS 'Nombre de séries (optionnel)';
COMMENT ON COLUMN exercises.reps IS 'Nombre de répétitions (optionnel)';
COMMENT ON COLUMN exercises.notes IS 'Notes libres (max 500 caractères)';
COMMENT ON COLUMN exercises.exercise_type IS 'Type d''exercice (cardio, musculation, etirement, autre)';
COMMENT ON COLUMN exercises.order_index IS 'Ordre d''exécution dans la session';
COMMENT ON COLUMN exercises.created_at IS 'Date de création';
COMMENT ON COLUMN exercises.updated_at IS 'Date de dernière modification';
