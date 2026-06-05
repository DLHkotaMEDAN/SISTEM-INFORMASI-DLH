import { supabase } from '@/lib/supabase';
import { FuelReport } from '@/types/fuelReport';

export const fuelService = {
  async getAllReports(includeDeleted = false) {
    let query = supabase
      .from('fuel_reports')
      .select('*')
      .order('date', { ascending: false })
      .limit(10000);
    
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    } else {
      query = query.not('deleted_at', 'is', null);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as FuelReport[];
  },

  async getReportsBySpecificDate(date: string) {
    const { data, error } = await supabase
      .from('fuel_reports')
      .select('*')
      .is('deleted_at', null)
      .eq('date', date)
      .order('created_at', { ascending: true })
      .limit(5000);
    if (error) throw error;
    return data as FuelReport[];
  },

  async getReportsByDateRange(startDate: string, endDate: string) {
    console.log('[fuelService] getReportsByDateRange', startDate, endDate);
    const { data, error } = await supabase
      .from('fuel_reports')
      .select('*')
      .is('deleted_at', null)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .limit(5000);
    if (error) { console.error('[fuelService] error:', error); throw error; }
    console.log('[fuelService] getReportsByDateRange returned', data?.length, 'records');
    return data as FuelReport[];
  },

  async getReportById(id: string) {
    const { data, error } = await supabase
      .from('fuel_reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as FuelReport;
  },

  async createReport(report: Omit<FuelReport, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('fuel_reports')
      .insert([report])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateReport(id: string, report: Partial<FuelReport>) {
    const { data, error } = await supabase
      .from('fuel_reports')
      .update(report)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteReport(id: string) {
    const { error } = await supabase
      .from('fuel_reports')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};