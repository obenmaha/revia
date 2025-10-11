import { supabase } from '../lib/supabase';
import type { Invoice, PaginatedResponse, SupabaseInvoice } from '../types';
import { mapSupabaseInvoiceToInvoice } from '../types';

class InvoicesService {
  // Obtenir la liste des factures avec pagination et filtres
  static async getInvoices(
    params: {
      page?: number;
      limit?: number;
      patientId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const {
      page = 1,
      limit = 10,
      patientId,
      status,
      startDate,
      endDate,
    } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('invoices')
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          phone
        ),
        sessions:sessions(
          id,
          scheduled_at,
          duration,
          status
        ),
        payments:payments(
          id,
          amount,
          method,
          created_at
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Appliquer les filtres
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: (data || []).map(mapSupabaseInvoiceToInvoice),
      success: true,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    } as PaginatedResponse<Invoice>;
  }

  // Obtenir une facture par ID
  static async getInvoice(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          phone,
          email,
          address
        ),
        sessions:sessions(
          id,
          scheduled_at,
          duration,
          status,
          notes
        ),
        payments:payments(
          id,
          amount,
          method,
          reference,
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

  // Créer une nouvelle facture
  static async createInvoice(invoiceData: {
    patientId: string;
    sessionIds: string[];
    dueDate: string;
    amount?: number;
  }) {
    const { patientId, sessionIds, dueDate, amount } = invoiceData;

    // Récupérer l'ID du praticien actuel
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Calculer le montant si non fourni (tarif par défaut de 25€/séance)
    const calculatedAmount = amount || sessionIds.length * 25;

    const supabaseData: Partial<SupabaseInvoice> = {
      patient_id: patientId,
      practitioner_id: user.id,
      amount: calculatedAmount,
      due_date: dueDate,
      status: 'draft',
    };

    const { data, error } = await supabase
      .from('invoices')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(supabaseData as any)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseInvoiceToInvoice(data);
  }

  // Mettre à jour une facture
  static async updateInvoice(
    id: string,
    updates: {
      status?: string;
      amount?: number;
      dueDate?: string;
    }
  ) {
    const updateData: Partial<SupabaseInvoice> = {};

    if (updates.status)
      updateData.status = updates.status as
        | 'draft'
        | 'sent'
        | 'paid'
        | 'overdue';
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.dueDate) updateData.due_date = updates.dueDate;

    // Marquer comme payée si le statut passe à 'paid'
    if (updates.status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('invoices')
      // @ts-expect-error - Types Supabase temporairement ignorés
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseInvoiceToInvoice(data);
  }

  // Supprimer une facture
  static async deleteInvoice(id: string) {
    const { error } = await supabase.from('invoices').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Enregistrer un paiement
  static async recordPayment(
    invoiceId: string,
    paymentData: {
      amount: number;
      method: string;
      reference?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Mettre à jour le statut de la facture si entièrement payée
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('amount, payments:payments(amount)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) {
      throw new Error(invoiceError.message);
    }

    const totalPaid =
      (invoice as { payments?: { amount: number }[] }).payments?.reduce(
        (sum: number, payment: { amount: number }) => sum + payment.amount,
        0
      ) || 0;
    const remainingAmount = (invoice as { amount: number }).amount - totalPaid;

    if (remainingAmount <= 0) {
      await supabase
        .from('invoices')
        // @ts-expect-error - Types Supabase temporairement ignorés
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);
    }

    return data;
  }

  // Obtenir les statistiques des factures
  static async getInvoiceStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyRevenue, statusStats] = await Promise.all([
      supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('paid_at', startOfMonth.toISOString()),
      supabase.from('invoices').select('status'),
    ]);

    if (monthlyRevenue.error) throw new Error(monthlyRevenue.error.message);
    if (statusStats.error) throw new Error(statusStats.error.message);

    const revenue =
      monthlyRevenue.data?.reduce(
        (sum, invoice) => sum + (invoice as { amount: number }).amount,
        0
      ) || 0;

    const statusCounts =
      statusStats.data?.reduce((acc: Record<string, number>, invoice) => {
        const status = (invoice as { status: string }).status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}) || {};

    return {
      monthlyRevenue: revenue,
      statusCounts,
    };
  }

  // Générer le prochain numéro de facture
  static async generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}${month}`;

    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `${prefix}%`)
      .order('invoice_number', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = parseInt(
        (data[0] as { invoice_number: string }).invoice_number.substring(6)
      );
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(6, '0')}`;
  }
}

// Export des méthodes statiques
export const invoicesService = {
  getInvoices: InvoicesService.getInvoices,
  getInvoice: InvoicesService.getInvoice,
  createInvoice: InvoicesService.createInvoice,
  updateInvoice: InvoicesService.updateInvoice,
  deleteInvoice: InvoicesService.deleteInvoice,
  recordPayment: InvoicesService.recordPayment,
  getInvoiceStats: InvoicesService.getInvoiceStats,
  generateInvoiceNumber: InvoicesService.generateInvoiceNumber,
};
