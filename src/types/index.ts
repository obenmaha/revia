// Types globaux de l'application - Stack MVP 2025
import type { Database } from './supabase';
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'practitioner' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  practitionerId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  phone?: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  patientId: string;
  practitionerId: string;
  scheduledAt: Date;
  duration: number; // en minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  objectives?: string[];
  exercises?: string[];
  evaluation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  patientId: string;
  practitionerId: string;
  sessions: Session[];
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les formulaires
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface PatientForm {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone?: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  emergencyContact?: string;
}

export interface SessionForm {
  patientId: string;
  scheduledAt: string;
  duration: number;
  notes?: string;
  objectives?: string[];
  exercises?: string[];
}

// Types Supabase (snake_case)
export type SupabaseUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'practitioner' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SupabasePatient = {
  id: string;
  practitioner_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone?: string;
  email?: string;
  address?: string;
  medical_history?: string;
  emergency_contact?: string;
  created_at: string;
  updated_at: string;
};

export type SupabaseSession = {
  id: string;
  patient_id: string;
  practitioner_id: string;
  scheduled_at: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  objectives?: string[];
  exercises?: string[];
  evaluation?: string;
  created_at: string;
  updated_at: string;
};

// Fonctions de mapping entre types Supabase et Application
export const mapSupabaseUserToUser = (
  supabaseUser: Database['public']['Tables']['users']['Row']
): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  firstName: supabaseUser.first_name || '',
  lastName: supabaseUser.last_name || '',
  role: supabaseUser.role === 'PRACTITIONER' ? 'practitioner' : 'admin',
  isActive: supabaseUser.is_active ?? true,
  createdAt: new Date(supabaseUser.created_at || new Date()),
  updatedAt: new Date(supabaseUser.updated_at || new Date()),
});

export const mapUserToSupabaseUser = (
  user: Partial<User>
): Partial<SupabaseUser> => ({
  id: user.id,
  email: user.email,
  first_name: user.firstName,
  last_name: user.lastName,
  role: user.role,
  is_active: user.isActive,
  created_at: user.createdAt?.toISOString(),
  updated_at: user.updatedAt?.toISOString(),
});

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
  address: supabasePatient.address,
  medicalHistory: supabasePatient.medical_history,
  emergencyContact: supabasePatient.emergency_contact,
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
  address: patient.address,
  medical_history: patient.medicalHistory,
  emergency_contact: patient.emergencyContact,
  created_at: patient.createdAt?.toISOString(),
  updated_at: patient.updatedAt?.toISOString(),
});

export const mapSupabaseSessionToSession = (
  supabaseSession: SupabaseSession
): Session => ({
  id: supabaseSession.id,
  patientId: supabaseSession.patient_id,
  practitionerId: supabaseSession.practitioner_id,
  scheduledAt: new Date(supabaseSession.scheduled_at),
  duration: supabaseSession.duration,
  status: supabaseSession.status,
  notes: supabaseSession.notes,
  objectives: supabaseSession.objectives,
  exercises: supabaseSession.exercises,
  evaluation: supabaseSession.evaluation,
  createdAt: new Date(supabaseSession.created_at),
  updatedAt: new Date(supabaseSession.updated_at),
});

export const mapSessionToSupabaseSession = (
  session: Partial<Session>
): Partial<SupabaseSession> => ({
  id: session.id,
  patient_id: session.patientId,
  practitioner_id: session.practitionerId,
  scheduled_at: session.scheduledAt?.toISOString(),
  duration: session.duration,
  status: session.status,
  notes: session.notes,
  objectives: session.objectives,
  exercises: session.exercises,
  evaluation: session.evaluation,
  created_at: session.createdAt?.toISOString(),
  updated_at: session.updatedAt?.toISOString(),
});

// Types Supabase pour les factures
export type SupabaseInvoice = {
  id: string;
  patient_id: string;
  practitioner_id: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
};

export type SupabasePayment = {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  reference?: string;
  created_at: string;
};

// Fonctions de mapping pour les factures
export const mapSupabaseInvoiceToInvoice = (
  supabaseInvoice: SupabaseInvoice
): Invoice => ({
  id: supabaseInvoice.id,
  patientId: supabaseInvoice.patient_id,
  practitionerId: supabaseInvoice.practitioner_id,
  sessions: [], // Sera rempli par une requête séparée
  amount: supabaseInvoice.amount,
  status: supabaseInvoice.status,
  dueDate: new Date(supabaseInvoice.due_date),
  paidAt: supabaseInvoice.paid_at
    ? new Date(supabaseInvoice.paid_at)
    : undefined,
  createdAt: new Date(supabaseInvoice.created_at),
  updatedAt: new Date(supabaseInvoice.updated_at),
});

export const mapInvoiceToSupabaseInvoice = (
  invoice: Partial<Invoice>
): Partial<SupabaseInvoice> => ({
  id: invoice.id,
  patient_id: invoice.patientId,
  practitioner_id: invoice.practitionerId,
  amount: invoice.amount,
  status: invoice.status,
  due_date: invoice.dueDate?.toISOString(),
  paid_at: invoice.paidAt?.toISOString(),
  created_at: invoice.createdAt?.toISOString(),
  updated_at: invoice.updatedAt?.toISOString(),
});
