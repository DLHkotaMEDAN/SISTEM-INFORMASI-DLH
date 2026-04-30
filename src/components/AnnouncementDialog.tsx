"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Trash2, Bell, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { announcementService, Announcement } from '@/services/announcementService';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface AnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const AnnouncementDialog = ({ isOpen, onClose, onRefresh }: AnnouncementDialogProps) => {
  const { profile } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Announcement[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    setFetching(true);
    try {
      const data = await announcementService.getAllAnnouncements();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await announcementService.createAnnouncement(content, profile?.username || "Pimpinan");
      showSuccess("Pesan catatan berhasil dikirim ke semua user");
      setContent("");
      fetchHistory();
      onRefresh();
    } catch (e) {
      showError("Gagal mengirim pesan");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await announcementService.toggleStatus(id, !currentStatus);
      fetchHistory();
      onRefresh();
    } catch (e) {
      showError("Gagal mengubah status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pesan ini?")) return;
    try {
      await announcementService.deleteAnnouncement(id);
      fetchHistory();
      onRefresh();
    } catch (e) {
      showError("Gagal menghapus");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Bell className="h-5 w-5" /> Pesan Catatan Pimpinan
          </DialogTitle>
          <DialogDescription>
            Tulis pesan atau instruksi yang akan muncul di halaman utama seluruh pengguna.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-slate-500">Buat Pesan Baru</Label>
            <Textarea 
              placeholder="Ketik instruksi atau catatan untuk semua tim di sini..."
              className="min-h-[100px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !content.trim()} 
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Kirim Pesan Sekarang
            </Button>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-xs font-bold uppercase text-slate-500">Riwayat Pesan</Label>
            {fetching ? (
              <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-300" /></div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className={cn(
                    "p-3 rounded-lg border text-xs transition-all",
                    item.is_active ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100" : "bg-slate-50 border-slate-200 opacity-70"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-400">
                        {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                      </span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-slate-400 hover:text-blue-600"
                          onClick={() => handleToggle(item.id, item.is_active)}
                        >
                          {item.is_active ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-slate-400 hover:text-red-500"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 italic text-sm">Belum ada riwayat pesan</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementDialog;