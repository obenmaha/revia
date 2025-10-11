-- Migration 002: Création de la table patients avec RLS - Story 2.1
-- Date: 2024-12-19
-- Description: Création de la table patients avec Row Level Security et structure complète

-- Création de la table patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address JSONB NOT NULL DEFAULT '{}',
    medical_info JSONB NOT NULL DEFAULT '{}',
    emergency_contact JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_patients_practitioner_id ON public.patients(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at DESC);

-- Index GIN pour les recherches dans les champs JSONB
CREATE INDEX IF NOT EXISTS idx_patients_address_gin ON public.patients USING GIN (address);
CREATE INDEX IF NOT EXISTS idx_patients_medical_info_gin ON public.patients USING GIN (medical_info);
CREATE INDEX IF NOT EXISTS idx_patients_emergency_contact_gin ON public.patients USING GIN (emergency_contact);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON public.patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Activation de Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les praticiens ne peuvent voir que leurs propres patients
CREATE POLICY "Practitioners can view their own patients" ON public.patients
    FOR SELECT USING (
        practitioner_id = auth.uid()
    );

-- Politique RLS: Les praticiens peuvent créer des patients
CREATE POLICY "Practitioners can create patients" ON public.patients
    FOR INSERT WITH CHECK (
        practitioner_id = auth.uid()
    );

-- Politique RLS: Les praticiens peuvent modifier leurs propres patients
CREATE POLICY "Practitioners can update their own patients" ON public.patients
    FOR UPDATE USING (
        practitioner_id = auth.uid()
    ) WITH CHECK (
        practitioner_id = auth.uid()
    );

-- Politique RLS: Les praticiens peuvent supprimer leurs propres patients
CREATE POLICY "Practitioners can delete their own patients" ON public.patients
    FOR DELETE USING (
        practitioner_id = auth.uid()
    );

-- Politique RLS: Les administrateurs peuvent voir tous les patients
CREATE POLICY "Admins can view all patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Politique RLS: Les administrateurs peuvent modifier tous les patients
CREATE POLICY "Admins can update all patients" ON public.patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Politique RLS: Les administrateurs peuvent supprimer tous les patients
CREATE POLICY "Admins can delete all patients" ON public.patients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Fonction pour valider la structure des données JSONB
CREATE OR REPLACE FUNCTION validate_patient_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validation de l'adresse
    IF NOT (NEW.address ? 'street' AND NEW.address ? 'city' AND NEW.address ? 'postalCode' AND NEW.address ? 'country') THEN
        RAISE EXCEPTION 'L''adresse doit contenir street, city, postalCode et country';
    END IF;

    -- Validation du code postal français
    IF NOT (NEW.address->>'postalCode' ~ '^[0-9]{5}$') THEN
        RAISE EXCEPTION 'Le code postal doit être composé de 5 chiffres';
    END IF;

    -- Validation du contact d'urgence
    IF NOT (NEW.emergency_contact ? 'name' AND NEW.emergency_contact ? 'relationship' AND NEW.emergency_contact ? 'phone') THEN
        RAISE EXCEPTION 'Le contact d''urgence doit contenir name, relationship et phone';
    END IF;

    -- Validation du format de téléphone
    IF NOT (NEW.phone ~ '^[0-9+\-\s()]+$') THEN
        RAISE EXCEPTION 'Le format du téléphone est invalide';
    END IF;

    -- Validation de l'email si fourni
    IF NEW.email IS NOT NULL AND NEW.email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
        RAISE EXCEPTION 'Le format de l''email est invalide';
    END IF;

    -- Validation de la date de naissance
    IF NEW.birth_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'La date de naissance ne peut pas être dans le futur';
    END IF;

    -- Validation de l'âge (minimum 0 ans, maximum 150 ans)
    IF EXTRACT(YEAR FROM AGE(NEW.birth_date)) > 150 THEN
        RAISE EXCEPTION 'L''âge ne peut pas dépasser 150 ans';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour valider les données
CREATE TRIGGER validate_patient_data_trigger
    BEFORE INSERT OR UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION validate_patient_data();

-- Fonction pour chiffrer les données sensibles (optionnel, pour conformité RGPD)
CREATE OR REPLACE FUNCTION encrypt_sensitive_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ici on pourrait ajouter du chiffrement pour les données sensibles
    -- Pour l'instant, on se contente de la sécurité RLS
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour le chiffrement (désactivé pour l'instant)
-- CREATE TRIGGER encrypt_patient_data_trigger
--     BEFORE INSERT OR UPDATE ON public.patients
--     FOR EACH ROW
--     EXECUTE FUNCTION encrypt_sensitive_data();

-- Fonction pour l'audit trail (traçabilité des modifications)
CREATE TABLE IF NOT EXISTS public.patient_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour l'audit log
CREATE INDEX IF NOT EXISTS idx_patient_audit_log_patient_id ON public.patient_audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_log_practitioner_id ON public.patient_audit_log(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_log_created_at ON public.patient_audit_log(created_at DESC);

-- Fonction pour créer l'audit log
CREATE OR REPLACE FUNCTION create_patient_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields TEXT[] := '{}';
    field_name TEXT;
BEGIN
    -- Déterminer les champs modifiés
    IF TG_OP = 'UPDATE' THEN
        FOR field_name IN SELECT jsonb_object_keys(OLD) LOOP
            IF OLD->>field_name IS DISTINCT FROM NEW->>field_name THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
    END IF;

    -- Insérer dans l'audit log
    INSERT INTO public.patient_audit_log (
        patient_id,
        practitioner_id,
        action,
        old_data,
        new_data,
        changed_fields
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.practitioner_id, OLD.practitioner_id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE to_jsonb(NEW) END,
        changed_fields
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour l'audit log
CREATE TRIGGER patient_audit_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION create_patient_audit_log();

-- Politique RLS pour l'audit log
ALTER TABLE public.patient_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view their own audit logs" ON public.patient_audit_log
    FOR SELECT USING (
        practitioner_id = auth.uid()
    );

CREATE POLICY "Admins can view all audit logs" ON public.patient_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Fonction pour obtenir les statistiques des patients (pour les tableaux de bord)
CREATE OR REPLACE FUNCTION get_patient_stats(practitioner_uuid UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
    target_practitioner UUID;
BEGIN
    -- Utiliser l'utilisateur connecté si aucun praticien spécifié
    target_practitioner := COALESCE(practitioner_uuid, auth.uid());
    
    -- Vérifier les permissions
    IF target_practitioner != auth.uid() AND NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
    ) THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;

    SELECT jsonb_build_object(
        'total_patients', COUNT(*),
        'patients_this_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)),
        'patients_this_year', COUNT(*) FILTER (WHERE created_at >= date_trunc('year', CURRENT_DATE)),
        'average_age', ROUND(AVG(EXTRACT(YEAR FROM AGE(birth_date))), 1),
        'patients_with_email', COUNT(*) FILTER (WHERE email IS NOT NULL),
        'patients_with_medical_info', COUNT(*) FILTER (WHERE medical_info != '{}'::jsonb)
    ) INTO stats
    FROM public.patients
    WHERE practitioner_id = target_practitioner;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rechercher des patients (avec recherche textuelle)
CREATE OR REPLACE FUNCTION search_patients(
    search_query TEXT,
    practitioner_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    birth_date DATE,
    phone VARCHAR,
    email VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance_score REAL
) AS $$
DECLARE
    target_practitioner UUID;
BEGIN
    -- Utiliser l'utilisateur connecté si aucun praticien spécifié
    target_practitioner := COALESCE(practitioner_uuid, auth.uid());
    
    -- Vérifier les permissions
    IF target_practitioner != auth.uid() AND NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
    ) THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.birth_date,
        p.phone,
        p.email,
        p.created_at,
        -- Score de pertinence basé sur la correspondance des noms
        GREATEST(
            similarity(p.first_name, search_query),
            similarity(p.last_name, search_query),
            similarity(p.first_name || ' ' || p.last_name, search_query)
        ) as relevance_score
    FROM public.patients p
    WHERE p.practitioner_id = target_practitioner
    AND (
        p.first_name ILIKE '%' || search_query || '%'
        OR p.last_name ILIKE '%' || search_query || '%'
        OR (p.first_name || ' ' || p.last_name) ILIKE '%' || search_query || '%'
        OR p.phone ILIKE '%' || search_query || '%'
        OR p.email ILIKE '%' || search_query || '%'
    )
    ORDER BY relevance_score DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.patients IS 'Table des patients avec informations personnelles et médicales';
COMMENT ON COLUMN public.patients.id IS 'Identifiant unique du patient';
COMMENT ON COLUMN public.patients.practitioner_id IS 'Identifiant du praticien propriétaire';
COMMENT ON COLUMN public.patients.first_name IS 'Prénom du patient';
COMMENT ON COLUMN public.patients.last_name IS 'Nom du patient';
COMMENT ON COLUMN public.patients.birth_date IS 'Date de naissance du patient';
COMMENT ON COLUMN public.patients.phone IS 'Numéro de téléphone du patient';
COMMENT ON COLUMN public.patients.email IS 'Adresse email du patient (optionnel)';
COMMENT ON COLUMN public.patients.address IS 'Adresse complète du patient (JSON)';
COMMENT ON COLUMN public.patients.medical_info IS 'Informations médicales du patient (JSON)';
COMMENT ON COLUMN public.patients.emergency_contact IS 'Contact d''urgence du patient (JSON)';
COMMENT ON COLUMN public.patients.created_at IS 'Date de création du patient';
COMMENT ON COLUMN public.patients.updated_at IS 'Date de dernière modification';

-- Données de test (optionnel, à supprimer en production)
-- INSERT INTO public.patients (practitioner_id, first_name, last_name, birth_date, phone, email, address, medical_info, emergency_contact)
-- VALUES (
--     auth.uid(),
--     'Jean',
--     'Dupont',
--     '1980-05-15',
--     '06 12 34 56 78',
--     'jean.dupont@example.com',
--     '{"street": "123 Rue de la Paix", "city": "Paris", "postalCode": "75001", "country": "France"}',
--     '{"allergies": ["Pénicilline"], "medications": ["Aspirine"], "medicalHistory": "Aucun antécédent notable", "currentConditions": [], "notes": ""}',
--     '{"name": "Marie Dupont", "relationship": "Conjoint", "phone": "06 98 76 54 32", "email": "marie.dupont@example.com"}'
-- );
