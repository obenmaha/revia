// Service de gestion des patients - Story 2.1
import { supabase } from '../lib/supabase';
import {
  Patient,
  CreatePatientInput,
  SupabasePatient,
  mapSupabasePatientToPatient,
  createPatientSchema,
  updatePatientSchema,
} from '../types/patient';

// Classe d'erreur personnalisée pour les services
export class PatientServiceError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'PatientServiceError';
    this.code = code;
    this.details = details;
  }
}

// Service principal de gestion des patients
export class PatientsService {
  /**
   * Créer un nouveau patient
   */
  static async createPatient(
    patientData: CreatePatientInput
  ): Promise<Patient> {
    try {
      // Validation des données avec Zod
      const validatedData = createPatientSchema.parse(patientData);

      // Récupération de l'utilisateur actuel
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new PatientServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Préparation des données pour Supabase
      const supabaseData: Partial<SupabasePatient> = {
        practitioner_id: user.id,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        birth_date: validatedData.birthDate.toISOString(),
        phone: validatedData.phone,
        email: validatedData.email,
        address: {
          street: validatedData.address.street,
          city: validatedData.address.city,
          postal_code: validatedData.address.postalCode,
          country: validatedData.address.country,
        },
        medical_info: validatedData.medicalInfo
          ? {
              allergies: validatedData.medicalInfo.allergies,
              medications: validatedData.medicalInfo.medications,
              medical_history: validatedData.medicalInfo.medicalHistory,
              current_conditions: validatedData.medicalInfo.currentConditions,
              notes: validatedData.medicalInfo.notes,
            }
          : {
              allergies: [],
              medications: [],
              medical_history: '',
              current_conditions: [],
              notes: '',
            },
        emergency_contact: validatedData.emergencyContact
          ? {
              name: validatedData.emergencyContact.name,
              relationship: validatedData.emergencyContact.relationship,
              phone: validatedData.emergencyContact.phone,
              email: validatedData.emergencyContact.email,
            }
          : {
              name: '',
              relationship: '',
              phone: '',
            },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insertion en base de données
      const { data, error } = await supabase
        .from('patients')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        throw new PatientServiceError(
          `Erreur lors de la création du patient: ${error.message}`,
          'CREATE_ERROR',
          error
        );
      }

      return mapSupabasePatientToPatient(data as SupabasePatient);
    } catch (error) {
      if (error instanceof PatientServiceError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new PatientServiceError(
          `Erreur de validation: ${error.message}`,
          'VALIDATION_ERROR'
        );
      }
      throw new PatientServiceError(
        'Erreur inconnue lors de la création du patient',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Récupérer un patient par son ID
   */
  static async getPatient(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Patient non trouvé
        }
        throw new PatientServiceError(
          `Erreur lors de la récupération du patient: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      return mapSupabasePatientToPatient(data as SupabasePatient);
    } catch (error) {
      if (error instanceof PatientServiceError) {
        throw error;
      }
      throw new PatientServiceError(
        'Erreur inconnue lors de la récupération du patient',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Récupérer tous les patients du praticien connecté
   */
  static async getPatients(): Promise<Patient[]> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new PatientServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('practitioner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new PatientServiceError(
          `Erreur lors de la récupération des patients: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      return data.map(mapSupabasePatientToPatient);
    } catch (error) {
      if (error instanceof PatientServiceError) {
        throw error;
      }
      throw new PatientServiceError(
        'Erreur inconnue lors de la récupération des patients',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Mettre à jour un patient
   */
  static async updatePatient(
    id: string,
    updates: Partial<CreatePatientInput>
  ): Promise<Patient> {
    try {
      // Validation des données avec Zod
      updatePatientSchema.parse({ id, ...updates });

      // Récupération de l'utilisateur actuel
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new PatientServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Préparation des données pour Supabase
      const supabaseUpdates: Partial<SupabasePatient> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.firstName) supabaseUpdates.first_name = updates.firstName;
      if (updates.lastName) supabaseUpdates.last_name = updates.lastName;
      if (updates.birthDate)
        supabaseUpdates.birth_date = updates.birthDate.toISOString();
      if (updates.phone) supabaseUpdates.phone = updates.phone;
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;

      if (updates.address) {
        supabaseUpdates.address = {
          street: updates.address.street,
          city: updates.address.city,
          postal_code: updates.address.postalCode,
          country: updates.address.country,
        };
      }

      if (updates.medicalInfo) {
        supabaseUpdates.medical_info = {
          allergies: updates.medicalInfo.allergies,
          medications: updates.medicalInfo.medications,
          medical_history: updates.medicalInfo.medicalHistory,
          current_conditions: updates.medicalInfo.currentConditions,
          notes: updates.medicalInfo.notes,
        };
      }

      if (updates.emergencyContact) {
        supabaseUpdates.emergency_contact = {
          name: updates.emergencyContact.name,
          relationship: updates.emergencyContact.relationship,
          phone: updates.emergencyContact.phone,
          email: updates.emergencyContact.email,
        };
      }

      // Mise à jour en base de données
      const { data, error } = await supabase
        .from('patients')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('practitioner_id', user.id) // Sécurité RLS
        .select()
        .single();

      if (error) {
        throw new PatientServiceError(
          `Erreur lors de la mise à jour du patient: ${error.message}`,
          'UPDATE_ERROR',
          error
        );
      }

      return mapSupabasePatientToPatient(data as SupabasePatient);
    } catch (error) {
      if (error instanceof PatientServiceError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new PatientServiceError(
          `Erreur de validation: ${error.message}`,
          'VALIDATION_ERROR'
        );
      }
      throw new PatientServiceError(
        'Erreur inconnue lors de la mise à jour du patient',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Supprimer un patient
   */
  static async deletePatient(id: string): Promise<void> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new PatientServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)
        .eq('practitioner_id', user.id); // Sécurité RLS

      if (error) {
        throw new PatientServiceError(
          `Erreur lors de la suppression du patient: ${error.message}`,
          'DELETE_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof PatientServiceError) {
        throw error;
      }
      throw new PatientServiceError(
        'Erreur inconnue lors de la suppression du patient',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Rechercher des patients par nom
   */
  static async searchPatients(query: string): Promise<Patient[]> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new PatientServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('practitioner_id', user.id)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new PatientServiceError(
          `Erreur lors de la recherche de patients: ${error.message}`,
          'SEARCH_ERROR',
          error
        );
      }

      return data.map(mapSupabasePatientToPatient);
    } catch (error) {
      if (error instanceof PatientServiceError) {
        throw error;
      }
      throw new PatientServiceError(
        'Erreur inconnue lors de la recherche de patients',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Sauvegarde automatique (draft) d'un patient
   */
  static async autoSavePatient(
    id: string,
    updates: Partial<CreatePatientInput>
  ): Promise<void> {
    try {
      // Validation minimale pour la sauvegarde automatique
      updatePatientSchema.partial().parse({ id, ...updates });

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new PatientServiceError(
          'Utilisateur non authentifié',
          'AUTH_ERROR'
        );
      }

      // Préparation des données pour Supabase
      const supabaseUpdates: Partial<SupabasePatient> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.firstName) supabaseUpdates.first_name = updates.firstName;
      if (updates.lastName) supabaseUpdates.last_name = updates.lastName;
      if (updates.birthDate)
        supabaseUpdates.birth_date = updates.birthDate.toISOString();
      if (updates.phone) supabaseUpdates.phone = updates.phone;
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;

      if (updates.address) {
        supabaseUpdates.address = {
          street: updates.address.street,
          city: updates.address.city,
          postal_code: updates.address.postalCode,
          country: updates.address.country,
        };
      }

      if (updates.medicalInfo) {
        supabaseUpdates.medical_info = {
          allergies: updates.medicalInfo.allergies,
          medications: updates.medicalInfo.medications,
          medical_history: updates.medicalInfo.medicalHistory,
          current_conditions: updates.medicalInfo.currentConditions,
          notes: updates.medicalInfo.notes,
        };
      }

      if (updates.emergencyContact) {
        supabaseUpdates.emergency_contact = {
          name: updates.emergencyContact.name,
          relationship: updates.emergencyContact.relationship,
          phone: updates.emergencyContact.phone,
          email: updates.emergencyContact.email,
        };
      }

      // Mise à jour en base de données
      const { error } = await supabase
        .from('patients')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('practitioner_id', user.id);

      if (error) {
        throw new PatientServiceError(
          `Erreur lors de la sauvegarde automatique: ${error.message}`,
          'AUTOSAVE_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof PatientServiceError) {
        throw error;
      }
      throw new PatientServiceError(
        'Erreur inconnue lors de la sauvegarde automatique',
        'UNKNOWN_ERROR'
      );
    }
  }
}

// Export des fonctions utilitaires
export const {
  createPatient,
  getPatient,
  getPatients,
  updatePatient,
  deletePatient,
  searchPatients,
  autoSavePatient,
} = PatientsService;
