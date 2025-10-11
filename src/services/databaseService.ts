import { supabase, type Database } from '../lib/supabase';

// Types utilitaires
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Types des tables
export type User = Tables<'users'>;
export type Patient = Tables<'patients'>;
export type Session = Tables<'sessions'>;
export type Invoice = Tables<'invoices'>;
export type Payment = Tables<'payments'>;
// export type Document = Tables<'documents'>;

// Types d'insertion
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type PatientInsert = Database['public']['Tables']['patients']['Insert'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
// export type DocumentInsert =
//   Database['public']['Tables']['documents']['Insert'];

// Types de mise à jour
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type PatientUpdate = Database['public']['Tables']['patients']['Update'];
export type SessionUpdate = Database['public']['Tables']['sessions']['Update'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];
// export type DocumentUpdate =
//   Database['public']['Tables']['documents']['Update'];

// Service de base pour les opérations CRUD
export class DatabaseService {
  // Méthodes génériques pour les opérations CRUD
  static async create<T extends keyof Database['public']['Tables']>(
    table: T,
    data: Database['public']['Tables'][T]['Insert']
  ) {
    const { data: result, error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(data as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }

    return result;
  }

  static async read<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string
  ) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('id' as any, id as any)
      .single();

    if (error) {
      throw new Error(`Erreur lors de la lecture: ${error.message}`);
    }

    return data;
  }

  static async readAll<T extends keyof Database['public']['Tables']>(
    table: T,
    filters?: Record<string, unknown>
  ) {
    let query = supabase.from(table).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = query.eq(key, value as any);
      });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la lecture: ${error.message}`);
    }

    return data || [];
  }

  static async update<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string,
    data: Database['public']['Tables'][T]['Update']
  ) {
    const { data: result, error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(data as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('id' as any, id as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }

    return result;
  }

  static async delete<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string
  ) {
    const { error } = await supabase
      .from(table)
      .delete()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('id' as any, id as any);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }

    return true;
  }

  // Méthodes spécifiques pour les utilisateurs
  static async createUser(data: UserInsert) {
    return this.create('users', data);
  }

  static async getUser(id: string) {
    return this.read('users', id);
  }

  static async getAllUsers() {
    return this.readAll('users');
  }

  static async updateUser(id: string, data: UserUpdate) {
    return this.update('users', id, data);
  }

  static async deleteUser(id: string) {
    return this.delete('users', id);
  }

  // Méthodes spécifiques pour les patients
  static async createPatient(data: PatientInsert) {
    return this.create('patients', data);
  }

  static async getPatient(id: string) {
    return this.read('patients', id);
  }

  static async getPatientsByPractitioner(practitionerId: string) {
    return this.readAll('patients', { practitioner_id: practitionerId });
  }

  static async updatePatient(id: string, data: PatientUpdate) {
    return this.update('patients', id, data);
  }

  static async deletePatient(id: string) {
    return this.delete('patients', id);
  }

  // Méthodes spécifiques pour les séances
  static async createSession(data: SessionInsert) {
    return this.create('sessions', data);
  }

  static async getSession(id: string) {
    return this.read('sessions', id);
  }

  static async getSessionsByPractitioner(practitionerId: string) {
    return this.readAll('sessions', { practitioner_id: practitionerId });
  }

  static async getSessionsByPatient(patientId: string) {
    return this.readAll('sessions', { patient_id: patientId });
  }

  static async updateSession(id: string, data: SessionUpdate) {
    return this.update('sessions', id, data);
  }

  static async deleteSession(id: string) {
    return this.delete('sessions', id);
  }

  // Méthodes spécifiques pour les factures
  static async createInvoice(data: InvoiceInsert) {
    return this.create('invoices', data);
  }

  static async getInvoice(id: string) {
    return this.read('invoices', id);
  }

  static async getInvoicesByPractitioner(practitionerId: string) {
    return this.readAll('invoices', { practitioner_id: practitionerId });
  }

  static async getInvoicesByPatient(patientId: string) {
    return this.readAll('invoices', { patient_id: patientId });
  }

  static async updateInvoice(id: string, data: InvoiceUpdate) {
    return this.update('invoices', id, data);
  }

  static async deleteInvoice(id: string) {
    return this.delete('invoices', id);
  }

  // Méthodes spécifiques pour les paiements
  static async createPayment(data: PaymentInsert) {
    return this.create('payments', data);
  }

  static async getPayment(id: string) {
    return this.read('payments', id);
  }

  static async getPaymentsByInvoice(invoiceId: string) {
    return this.readAll('payments', { invoice_id: invoiceId });
  }

  static async updatePayment(id: string, data: PaymentUpdate) {
    return this.update('payments', id, data);
  }

  static async deletePayment(id: string) {
    return this.delete('payments', id);
  }

  // Méthodes spécifiques pour les documents (commentées temporairement)
  // static async createDocument(data: DocumentInsert) {
  //   return this.create('documents', data);
  // }

  // static async getDocument(id: string) {
  //   return this.read('documents', id);
  // }

  // static async getDocumentsByPatient(patientId: string) {
  //   return this.readAll('documents', { patient_id: patientId });
  // }

  // static async updateDocument(id: string, data: DocumentUpdate) {
  //   return this.update('documents', id, data);
  // }

  // static async deleteDocument(id: string) {
  //   return this.delete('documents', id);
  // }
}

// Export des types pour utilisation dans d'autres services
// export type {
//   User,
//   Patient,
//   Session,
//   Invoice,
//   Payment,
//   // Document,
//   UserInsert,
//   PatientInsert,
//   SessionInsert,
//   InvoiceInsert,
//   PaymentInsert,
//   // DocumentInsert,
//   UserUpdate,
//   PatientUpdate,
//   SessionUpdate,
//   InvoiceUpdate,
//   PaymentUpdate,
//   // DocumentUpdate,
// };
