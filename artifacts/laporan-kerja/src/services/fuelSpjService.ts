import { supabase } from '@/lib/supabase';
import { FuelSpjReport } from '@/types/fuelSpjReport';

export const fuelSpjService = {
  async getAllReports(includeDeleted = false) {
    let query = supabase
      .from('fuel_spj_reports')
      .select('*')
      .order('date', { ascending: false })
      .limit(10000);
    
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as FuelSpjReport[];
  },

  async getReportsByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('fuel_spj_reports')
      .select('*')
      .is('deleted_at', null)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .limit(5000);
    if (error) throw error;
    return data as FuelSpjReport[];
  },

  async getReportById(id: string) {
    const { data, error } = await supabase
      .from('fuel_spj_reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as FuelSpjReport;
  },

  async createReport(report: Omit<FuelSpjReport, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('fuel_spj_reports')
      .insert([report])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateReport(id: string, report: Partial<FuelSpjReport>) {
    const { data, error } = await supabase
      .from('fuel_spj_reports')
      .update(report)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteReport(id: string) {
    const { error } = await supabase
      .from('fuel_spj_reports')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};