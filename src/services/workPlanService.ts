import { supabase } from '@/lib/supabase';
import { WorkPlan } from '@/types/work-plan';

export const workPlanService = {
  async getAllWorkPlans() {
    const { data, error } = await supabase
      .from('work_plans')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data as WorkPlan[];
  },

  async getWorkPlanById(id: string) {
    const { data, error } = await supabase
      .from('work_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as WorkPlan;
  },

  async createWorkPlan(workPlan: Omit<WorkPlan, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('work_plans')
      .insert([{ ...workPlan, user_id: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWorkPlan(id: string, workPlan: Partial<WorkPlan>) {
    const { data, error } = await supabase
      .from('work_plans')
      .update(workPlan)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteWorkPlan(id: string) {
    const { error } = await supabase
      .from('work_plans')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};