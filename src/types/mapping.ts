// Types de mapping entre Supabase et types personnalisés
import type {
  Patient as SupabasePatient,
  Session as SupabaseSession,
  Invoice as SupabaseInvoice,
  User as SupabaseUser,
} from './supabase';
import type { Patient, Session, Invoice, User } from './index';

// Fonctions de conversion Supabase -> Types personnalisés
export function mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    firstName: supabaseUser.first_name,
    lastName: supabaseUser.last_name,
    role: supabaseUser.role.toLowerCase() as 'practitioner' | 'admin',
    isActive: supabaseUser.is_active,
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at),
  };
}

export function mapSupabasePatientToPatient(
  supabasePatient: SupabasePatient
): Patient {
  return {
    id: supabasePatient.id,
    practitionerId: supabasePatient.practitioner_id,
    firstName: supabasePatient.first_name,
    lastName: supabasePatient.last_name,
    birthDate: new Date(supabasePatient.birth_date),
    phone: supabasePatient.phone || undefined,
    email: supabasePatient.email || undefined,
    address: (supabasePatient.address as string) || undefined,
    medicalHistory: (supabasePatient.medical_history as string) || undefined,
    emergencyContact:
      (supabasePatient.emergency_contact as string) || undefined,
    createdAt: new Date(supabasePatient.created_at),
    updatedAt: new Date(supabasePatient.updated_at),
  };
}

export function mapSupabaseSessionToSession(
  supabaseSession: SupabaseSession
): Session {
  return {
    id: supabaseSession.id,
    patientId: supabaseSession.patient_id,
    practitionerId: supabaseSession.practitioner_id,
    scheduledAt: new Date(supabaseSession.scheduled_at),
    duration: supabaseSession.duration,
    status: supabaseSession.status.toLowerCase() as
      | 'scheduled'
      | 'completed'
      | 'cancelled'
      | 'no_show',
    notes: supabaseSession.notes || undefined,
    objectives: (supabaseSession.objectives as string[]) || undefined,
    exercises: (supabaseSession.exercises as string[]) || undefined,
    evaluation: (supabaseSession.evaluation as string) || undefined,
    createdAt: new Date(supabaseSession.created_at),
    updatedAt: new Date(supabaseSession.updated_at),
  };
}

export function mapSupabaseInvoiceToInvoice(
  supabaseInvoice: SupabaseInvoice
): Invoice {
  return {
    id: supabaseInvoice.id,
    patientId: supabaseInvoice.patient_id,
    practitionerId: supabaseInvoice.practitioner_id,
    sessions: [], // Les sessions seront chargées séparément
    amount: supabaseInvoice.amount,
    status: supabaseInvoice.status.toLowerCase() as
      | 'draft'
      | 'sent'
      | 'paid'
      | 'overdue',
    dueDate: new Date(supabaseInvoice.due_date),
    paidAt: supabaseInvoice.paid_at
      ? new Date(supabaseInvoice.paid_at)
      : undefined,
    createdAt: new Date(supabaseInvoice.created_at),
    updatedAt: new Date(supabaseInvoice.updated_at),
  };
}

// Fonctions de conversion Types personnalisés -> Supabase
export function mapUserToSupabaseUser(
  user: Partial<User>
): Partial<SupabaseUser> {
  return {
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role?.toUpperCase() as 'PRACTITIONER' | 'ADMIN',
    is_active: user.isActive,
    updated_at: user.updatedAt?.toISOString(),
  };
}

export function mapPatientToSupabasePatient(
  patient: Partial<Patient>
): Partial<SupabasePatient> {
  return {
    practitioner_id: patient.practitionerId,
    first_name: patient.firstName,
    last_name: patient.lastName,
    birth_date: patient.birthDate?.toISOString(),
    phone: patient.phone || null,
    email: patient.email || null,
    address: patient.address ? { address: patient.address } : null,
    medical_history: patient.medicalHistory
      ? { history: patient.medicalHistory }
      : null,
    emergency_contact: patient.emergencyContact
      ? { contact: patient.emergencyContact }
      : null,
    updated_at: patient.updatedAt?.toISOString(),
  };
}

export function mapSessionToSupabaseSession(
  session: Partial<Session>
): Partial<SupabaseSession> {
  return {
    patient_id: session.patientId,
    practitioner_id: session.practitionerId,
    scheduled_at: session.scheduledAt?.toISOString(),
    duration: session.duration,
    status: session.status?.toUpperCase() as
      | 'SCHEDULED'
      | 'COMPLETED'
      | 'CANCELLED'
      | 'NO_SHOW',
    notes: session.notes || null,
    objectives: session.objectives ? { objectives: session.objectives } : null,
    exercises: session.exercises ? { exercises: session.exercises } : null,
    evaluation: session.evaluation || null,
    updated_at: session.updatedAt?.toISOString(),
  };
}

export function mapInvoiceToSupabaseInvoice(
  invoice: Partial<Invoice>
): Partial<SupabaseInvoice> {
  return {
    patient_id: invoice.patientId,
    practitioner_id: invoice.practitionerId,
    amount: invoice.amount,
    status: invoice.status?.toUpperCase() as
      | 'DRAFT'
      | 'SENT'
      | 'PAID'
      | 'OVERDUE',
    due_date: invoice.dueDate?.toISOString(),
    paid_at: invoice.paidAt?.toISOString() || null,
    updated_at: invoice.updatedAt?.toISOString(),
  };
}
