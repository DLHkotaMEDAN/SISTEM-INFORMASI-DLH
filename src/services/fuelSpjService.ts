import { supabase } from '@/lib/supabase';
import { FuelSpj } from '@/types/fuelSpj';

export const fuelSpjService = {
  async getAll(includeDeleted = false) {
    let query = supabase
      .from('fuel_spj')
      .select('*')
      .order('date', { ascending: false });
    
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    } else {
      query = query.not('deleted_at', 'is', null);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as FuelSpj[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('fuel_spj')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as FuelSpj;
  },

  async create(data: Omit<FuelSpj, 'id' | 'created_at'>) {
    const { data: result, error } = await supabase
      .from('fuel_spj')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async update(id: string, data: Partial<FuelSpj>) {
    const { data: result, error } = await supabase
      .from('fuel_spj')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('fuel_spj')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async hardDelete(id: string) {
    const { error } = await supabase
      .from('fuel_spj')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async restore(id: string) {
    const { error } = await supabase
      .from('fuel_spj')
      .update({ deleted_at: null })
      .eq('id', id);
    
    if (error) throw error;
  }
};