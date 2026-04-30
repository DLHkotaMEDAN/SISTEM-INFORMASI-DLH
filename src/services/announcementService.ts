import { supabase } from '@/lib/supabase';

export interface Announcement {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

export const announcementService = {
  async getLatest() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data as Announcement | null;
  },

  async create(content: string, userId: string) {
    const { data, error } = await supabase
      .from('announcements')
      .insert([{ content, created_by: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async clear() {
    // Secara teknis kita bisa menghapus semua atau membiarkan riwayat
    // Untuk kesederhanaan, kita buat pesan kosong saja
    const { error } = await supabase
      .from('announcements')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Hapus semua
    
    if (error) throw error;
  }
};