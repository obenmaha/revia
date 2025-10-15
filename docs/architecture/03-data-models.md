# Architecture Sport MVP - Modèles de Données

## Data Models and Schema Changes

### New Data Models

#### SportUser

**Purpose:** Profil utilisateur sportif simplifié avec objectifs et préférences
**Integration:** Extension de la table users existante avec nouveaux champs

**Key Attributes:**

- id: UUID - Identifiant unique (hérité de users)
- display_name: VARCHAR(100) - Nom d'affichage/pseudo
- sport_goals: TEXT - Objectifs sportifs (texte libre)
- preferences: JSONB - Préférences utilisateur (notifications, thème, etc.)
- streak_count: INTEGER - Nombre de jours consécutifs
- total_sessions: INTEGER - Nombre total de séances
- guest_data_migrated: BOOLEAN - Indique si les données Guest ont été migrées
- data_retention_consent: BOOLEAN - Consentement RGPD pour la rétention des données
- created_at: TIMESTAMP - Date de création
- updated_at: TIMESTAMP - Date de modification

**Relationships:**

- **With Existing:** Hérite de users (auth.users)
- **With New:** One-to-many avec SportSession

#### SportSession

**Purpose:** Séances d'entraînement sportif avec exercices et validation
**Integration:** Nouvelle table indépendante liée à SportUser

**Key Attributes:**

- id: UUID - Identifiant unique
- user_id: UUID - Référence vers SportUser
- name: VARCHAR(200) - Nom de la séance
- date: DATE - Date de la séance
- type: VARCHAR(50) - Type de séance (cardio, musculation, etc.)
- status: VARCHAR(20) - Statut (draft, in_progress, completed)
- objectives: TEXT - Objectifs de la séance
- notes: TEXT - Notes utilisateur
- rpe_score: INTEGER - Score RPE (1-10)
- pain_level: INTEGER - Niveau de douleur (1-10)
- duration_minutes: INTEGER - Durée en minutes
- created_at: TIMESTAMP - Date de création
- updated_at: TIMESTAMP - Date de modification

**Relationships:**

- **With Existing:** Aucune
- **With New:** Many-to-one avec SportUser, One-to-many avec SportExercise

#### SportExercise

**Purpose:** Exercices individuels dans une séance sportive
**Integration:** Nouvelle table liée à SportSession

**Key Attributes:**

- id: UUID - Identifiant unique
- session_id: UUID - Référence vers SportSession
- name: VARCHAR(200) - Nom de l'exercice
- exercise_type: VARCHAR(50) - Type d'exercice
- sets: INTEGER - Nombre de séries
- reps: INTEGER - Nombre de répétitions
- weight_kg: DECIMAL - Poids en kg
- duration_seconds: INTEGER - Durée en secondes
- rest_seconds: INTEGER - Temps de repos
- order_index: INTEGER - Ordre dans la séance
- notes: TEXT - Notes spécifiques
- created_at: TIMESTAMP - Date de création
- updated_at: TIMESTAMP - Date de modification

**Relationships:**

- **With Existing:** Aucune
- **With New:** Many-to-one avec SportSession

#### GuestData

**Purpose:** Données temporaires des utilisateurs Guest avec expiration automatique
**Integration:** Table temporaire pour le mode Guest avec chiffrement local

**Key Attributes:**

- id: UUID - Identifiant unique temporaire
- guest_token: VARCHAR(255) - Token de session Guest
- encrypted_data: TEXT - Données chiffrées (sessions, exercices, etc.)
- expires_at: TIMESTAMP - Date d'expiration (30 jours)
- migration_consent: BOOLEAN - Consentement pour migration vers compte permanent
- created_at: TIMESTAMP - Date de création
- updated_at: TIMESTAMP - Date de modification

**Relationships:**

- **With Existing:** Aucune
- **With New:** One-to-one avec SportUser (après migration)

#### SportBadge

**Purpose:** Système de gamification avec badges et récompenses
**Integration:** Nouvelle table pour la gamification

**Key Attributes:**

- id: UUID - Identifiant unique
- user_id: UUID - Référence vers SportUser
- badge_type: VARCHAR(50) - Type de badge
- badge_name: VARCHAR(100) - Nom du badge
- description: TEXT - Description du badge
- earned_at: TIMESTAMP - Date d'obtention
- created_at: TIMESTAMP - Date de création

**Relationships:**

- **With Existing:** Aucune
- **With New:** Many-to-one avec SportUser

### Schema Integration Strategy

**Database Changes Required:**

- **New Tables:** sport_users, sport_sessions, sport_exercises, sport_badges, guest_data
- **Modified Tables:** Aucune modification des tables existantes
- **New Indexes:** Index sur user_id, date, type, expires_at pour les performances
- **Migration Strategy:** Création progressive des nouvelles tables sans impact sur l'existant
- **Security:** RLS activé sur toutes les nouvelles tables, chiffrement des données Guest

**Backward Compatibility:**

- Conservation de toutes les tables existantes
- Aucune modification des schémas existants
- RLS maintenu sur toutes les tables
- API existante préservée

### RLS (Row Level Security) Strategy

#### SportUser Table

```sql
-- Les utilisateurs ne peuvent voir que leur propre profil
CREATE POLICY "Users can view own sport profile" ON sport_users
    FOR SELECT USING (id = auth.uid());

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own sport profile" ON sport_users
    FOR UPDATE USING (id = auth.uid());
```

#### SportSession Table

```sql
-- Les utilisateurs ne peuvent voir que leurs propres séances
CREATE POLICY "Users can view own sessions" ON sport_sessions
    FOR SELECT USING (user_id = auth.uid());

-- Les utilisateurs peuvent créer des séances
CREATE POLICY "Users can create sessions" ON sport_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());
```

#### GuestData Table

```sql
-- Les données Guest sont accessibles via token uniquement
CREATE POLICY "Guest data accessible by token" ON guest_data
    FOR ALL USING (guest_token = current_setting('app.guest_token'));
```

### Migration Scripts

#### Migration 1: Création des Tables Sport

```sql
-- Création de la table sport_users
CREATE TABLE sport_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    sport_goals TEXT,
    preferences JSONB DEFAULT '{}',
    streak_count INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    guest_data_migrated BOOLEAN DEFAULT FALSE,
    data_retention_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation RLS
ALTER TABLE sport_users ENABLE ROW LEVEL SECURITY;

-- Création des politiques RLS
-- ... (voir section RLS ci-dessus)
```

#### Migration 2: Index et Optimisations

```sql
-- Index pour les performances
CREATE INDEX idx_sport_sessions_user_date ON sport_sessions(user_id, date DESC);
CREATE INDEX idx_sport_exercises_session ON sport_exercises(session_id, order_index);
CREATE INDEX idx_guest_data_expires ON guest_data(expires_at) WHERE expires_at < NOW();
```
