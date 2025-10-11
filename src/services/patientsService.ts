import { supabase } from '../lib/supabase';
import type { Patient, PatientForm, PaginatedResponse } from '../types';

class PatientsService {
  // Obtenir la liste des patients avec pagination et recherche
  static async getPatients(
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, search } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('patients')
      .select(
        `
        *,
        _count:sessions(count),
        _count:invoices(count)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Ajouter la recherche si fournie
    if (search) {
      query = query.or(`
        first_name.ilike.%${search}%,
        last_name.ilike.%${search}%,
        phone.ilike.%${search}%,
        email.ilike.%${search}%
      `);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    } as PaginatedResponse<Patient>;
  }

  // Obtenir un patient par ID
  static async getPatient(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select(
        `
        *,
        sessions:sessions(
          id,
          scheduled_at,
          duration,
          status,
          notes
        ),
        invoices:invoices(
          id,
          invoice_number,
          amount,
          status,
          due_date,
          created_at
        ),
        documents:documents(
          id,
          filename,
          file_type,
          file_size,
          category,
          created_at
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Créer un nouveau patient
  static async createPatient(patientData: PatientForm) {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        birth_date: patientData.birthDate,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address || {},
        medical_history: patientData.medicalHistory,
        emergency_contact: patientData.emergencyContact || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Mettre à jour un patient
  static async updatePatient(id: string, patientData: Partial<PatientForm>) {
    const updateData: any = {};

    if (patientData.firstName) updateData.first_name = patientData.firstName;
    if (patientData.lastName) updateData.last_name = patientData.lastName;
    if (patientData.birthDate) updateData.birth_date = patientData.birthDate;
    if (patientData.phone !== undefined) updateData.phone = patientData.phone;
    if (patientData.email !== undefined) updateData.email = patientData.email;
    if (patientData.address !== undefined)
      updateData.address = patientData.address;
    if (patientData.medicalHistory !== undefined)
      updateData.medical_history = patientData.medicalHistory;
    if (patientData.emergencyContact !== undefined)
      updateData.emergency_contact = patientData.emergencyContact;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Supprimer un patient
  static async deletePatient(id: string) {
    const { error } = await supabase.from('patients').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Rechercher des patients
  static async searchPatients(query: string) {
    const { data, error } = await supabase
      .from('patients')
      .select(
        `
        id,
        first_name,
        last_name,
        phone,
        email,
        birth_date
      `
      )
      .or(
        `
        first_name.ilike.%${query}%,
        last_name.ilike.%${query}%,
        phone.ilike.%${query}%,
        email.ilike.%${query}%
      `
      )
      .limit(10);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Obtenir les statistiques des patients
  static async getPatientStats() {
    const { data, error } = await supabase.from('patients').select(`
        id,
        created_at,
        sessions:sessions(
          id,
          scheduled_at,
          status
        )
      `);

    if (error) {
      throw new Error(error.message);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total: data?.length || 0,
      active:
        data?.filter(patient =>
          patient.sessions?.some(
            session => new Date(session.scheduled_at) >= thirtyDaysAgo
          )
        ).length || 0,
      newThisMonth:
        data?.filter(
          patient =>
            new Date(patient.created_at) >=
            new Date(now.getFullYear(), now.getMonth(), 1)
        ).length || 0,
    };

    return stats;
  }
}

export const patientsService = new PatientsService();
