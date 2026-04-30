import { supabase } from '@/lib/supabase';

export interface Announcement {
  id: string;
  content: string;
  updated_at: string;
  author_name: string;
}

export const announcementService = {
  async getLatest() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as Announcement | null;
  },

  async updateAnnouncement(content: string, authorName: string) {
    // Kita asumsikan hanya ada 1 record pengumuman aktif (ID: 1)
    const { data, error } = await supabase
      .from('announcements')
      .upsert({ 
        id: 'global_note', 
        content, 
        author_name: authorName,
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};