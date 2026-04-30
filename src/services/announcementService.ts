import { supabase } from '@/lib/supabase';

export interface Announcement {
  id: string;
  content: string;
  is_active: boolean;
  created_at: string;
  author_name: string;
}

export const announcementService = {
  async getActiveAnnouncement() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data as Announcement | null;
  },

  async getAllAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Announcement[];
  },

  async createAnnouncement(content: string, authorName: string) {
    // Nonaktifkan semua pengumuman lama terlebih dahulu
    await supabase
      .from('announcements')
      .update({ is_active: false })
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ content, author_name: authorName, is_active: true }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleStatus(id: string, status: boolean) {
    if (status) {
      // Jika mengaktifkan, matikan yang lain
      await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('is_active', true);
    }

    const { error } = await supabase
      .from('announcements')
      .update({ is_active: status })
      .eq('id', id);
    
    if (error) throw error;
  }
};