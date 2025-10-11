// Types globaux de l'application - Stack MVP 2025
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
