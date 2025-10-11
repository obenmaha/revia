// Types spécialisés pour les patients - Story 2.1
import { z } from 'zod';

// Interface principale Patient avec structure complète
export interface Patient {
  id: string;
  practitionerId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  phone: string;
  email?: string;
  address: Address;
  medicalInfo: MedicalInfo;
  emergencyContact: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour l'adresse
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Interface pour les informations médicales
export interface MedicalInfo {
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
  currentConditions?: string[];
  notes?: string;
}

// Interface pour le contact d'urgence
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Types pour les formulaires
export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  birthDate: Date;
  phone: string;
  email?: string;
  address: Address;
  medicalInfo?: MedicalInfo;
  emergencyContact?: EmergencyContact;
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {
  id: string;
}

// Types Supabase (snake_case)
export interface SupabasePatient {
  id: string;
  practitioner_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  email?: string;
  address: SupabaseAddress;
  medical_info: SupabaseMedicalInfo;
  emergency_contact: SupabaseEmergencyContact;
  created_at: string;
  updated_at: string;
}

export interface SupabaseAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface SupabaseMedicalInfo {
  allergies?: string[];
  medications?: string[];
  medical_history?: string;
  current_conditions?: string[];
  notes?: string;
}

export interface SupabaseEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Schémas de validation Zod
export const addressSchema = z.object({
  street: z.string().min(5, 'Adresse requise (min 5 caractères)'),
  city: z.string().min(2, 'Ville requise (min 2 caractères)'),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres requis)'),
  country: z.string().min(2, 'Pays requis (min 2 caractères)'),
});

export const medicalInfoSchema = z
  .object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    medicalHistory: z.string().optional(),
    currentConditions: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })
  .optional();

export const emergencyContactSchema = z
  .object({
    name: z.string().min(2, 'Nom du contact requis (min 2 caractères)'),
    relationship: z.string().min(2, 'Relation requise (min 2 caractères)'),
    phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Format téléphone invalide'),
    email: z.string().email('Email invalide').optional(),
  })
  .optional();

export const patientSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  birthDate: z.date().max(new Date(), 'Date de naissance invalide'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Format téléphone invalide'),
  email: z.string().email('Email invalide').optional(),
  address: addressSchema,
  medicalInfo: medicalInfoSchema,
  emergencyContact: emergencyContactSchema,
});

export const createPatientSchema = patientSchema;
export const updatePatientSchema = patientSchema.partial().extend({
  id: z.string().uuid('ID patient invalide'),
});

// Fonctions de mapping entre types Supabase et Application
export const mapSupabasePatientToPatient = (
  supabasePatient: SupabasePatient
): Patient => ({
  id: supabasePatient.id,
  practitionerId: supabasePatient.practitioner_id,
  firstName: supabasePatient.first_name,
  lastName: supabasePatient.last_name,
  birthDate: new Date(supabasePatient.birth_date),
  phone: supabasePatient.phone,
  email: supabasePatient.email,
  address: {
    street: supabasePatient.address.street,
    city: supabasePatient.address.city,
    postalCode: supabasePatient.address.postal_code,
    country: supabasePatient.address.country,
  },
  medicalInfo: {
    allergies: supabasePatient.medical_info.allergies,
    medications: supabasePatient.medical_info.medications,
    medicalHistory: supabasePatient.medical_info.medical_history,
    currentConditions: supabasePatient.medical_info.current_conditions,
    notes: supabasePatient.medical_info.notes,
  },
  emergencyContact: {
    name: supabasePatient.emergency_contact.name,
    relationship: supabasePatient.emergency_contact.relationship,
    phone: supabasePatient.emergency_contact.phone,
    email: supabasePatient.emergency_contact.email,
  },
  createdAt: new Date(supabasePatient.created_at),
  updatedAt: new Date(supabasePatient.updated_at),
});

export const mapPatientToSupabasePatient = (
  patient: Partial<Patient>
): Partial<SupabasePatient> => ({
  id: patient.id,
  practitioner_id: patient.practitionerId,
  first_name: patient.firstName,
  last_name: patient.lastName,
  birth_date: patient.birthDate?.toISOString(),
  phone: patient.phone,
  email: patient.email,
  address: patient.address
    ? {
        street: patient.address.street,
        city: patient.address.city,
        postal_code: patient.address.postalCode,
        country: patient.address.country,
      }
    : undefined,
  medical_info: patient.medicalInfo
    ? {
        allergies: patient.medicalInfo.allergies,
        medications: patient.medicalInfo.medications,
        medical_history: patient.medicalInfo.medicalHistory,
        current_conditions: patient.medicalInfo.currentConditions,
        notes: patient.medicalInfo.notes,
      }
    : undefined,
  emergency_contact: patient.emergencyContact
    ? {
        name: patient.emergencyContact.name,
        relationship: patient.emergencyContact.relationship,
        phone: patient.emergencyContact.phone,
        email: patient.emergencyContact.email,
      }
    : undefined,
  created_at: patient.createdAt?.toISOString(),
  updated_at: patient.updatedAt?.toISOString(),
});

// Types pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface PatientFormError {
  field: keyof CreatePatientInput;
  message: string;
}

// Types pour les états de chargement
export interface PatientFormState {
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  errors: PatientFormError[];
}

// Types pour les hooks
export interface UsePatientReturn {
  patient: Patient | null;
  isLoading: boolean;
  error: string | null;
  updatePatient: (updates: Partial<Patient>) => Promise<void>;
  deletePatient: () => Promise<void>;
}

export interface UsePatientFormReturn {
  formData: CreatePatientInput;
  formState: PatientFormState;
  updateField: <K extends keyof CreatePatientInput>(
    field: K,
    value: CreatePatientInput[K]
  ) => void;
  validateField: (field: keyof CreatePatientInput) => ValidationError[];
  savePatient: () => Promise<Patient>;
  resetForm: () => void;
}
