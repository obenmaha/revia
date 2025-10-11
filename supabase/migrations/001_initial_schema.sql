-- Migration initiale pour App-Kine
-- Création des tables et configuration RLS

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création des types ENUM
CREATE TYPE user_role AS ENUM ('PRACTITIONER', 'ADMIN');
CREATE TYPE session_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE');

-- Table des utilisateurs (praticiens)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'PRACTITIONER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    phone TEXT,
    email TEXT,
    address JSONB,
    medical_history JSONB,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des séances
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- en minutes
    status session_status NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    objectives JSONB,
    exercises JSONB,
    evaluation JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des factures
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL,
    reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_patients_practitioner_id ON patients(practitioner_id);
CREATE INDEX idx_sessions_practitioner_id ON sessions(practitioner_id);
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_invoices_practitioner_id ON invoices(practitioner_id);
CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_documents_patient_id ON documents(patient_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activation de Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques RLS pour patients
CREATE POLICY "Practitioners can view their own patients" ON patients
    FOR SELECT USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert their own patients" ON patients
    FOR INSERT WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update their own patients" ON patients
    FOR UPDATE USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete their own patients" ON patients
    FOR DELETE USING (auth.uid() = practitioner_id);

-- Politiques RLS pour sessions
CREATE POLICY "Practitioners can view their own sessions" ON sessions
    FOR SELECT USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert their own sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update their own sessions" ON sessions
    FOR UPDATE USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete their own sessions" ON sessions
    FOR DELETE USING (auth.uid() = practitioner_id);

-- Politiques RLS pour invoices
CREATE POLICY "Practitioners can view their own invoices" ON invoices
    FOR SELECT USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert their own invoices" ON invoices
    FOR INSERT WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update their own invoices" ON invoices
    FOR UPDATE USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete their own invoices" ON invoices
    FOR DELETE USING (auth.uid() = practitioner_id);

-- Politiques RLS pour payments
CREATE POLICY "Practitioners can view payments for their invoices" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payments.invoice_id 
            AND invoices.practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Practitioners can insert payments for their invoices" ON payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payments.invoice_id 
            AND invoices.practitioner_id = auth.uid()
        )
    );

-- Politiques RLS pour documents
CREATE POLICY "Practitioners can view documents for their patients" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE patients.id = documents.patient_id 
            AND patients.practitioner_id = auth.uid()
        )
    );

CREATE POLICY "Practitioners can insert documents for their patients" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE patients.id = documents.patient_id 
            AND patients.practitioner_id = auth.uid()
        )
    );

-- Données de test (optionnel)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('test@example.com', '$2a$10$example_hash', 'Test', 'User', 'PRACTITIONER');