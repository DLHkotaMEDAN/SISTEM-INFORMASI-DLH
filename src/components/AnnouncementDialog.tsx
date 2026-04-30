"use client";

import React, { useState } from 'react';
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
import { Megaphone, Loader2, Save } from 'lucide-react';
import { announcementService } from '@/services/announcementService';
import { showSuccess, showError } from '@/utils/toast';

interface AnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialContent?: string;
  authorName: string;
}

const AnnouncementDialog = ({ isOpen, onClose, onSuccess, initialContent = "", authorName }: AnnouncementDialogProps) => {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      showError("Isi catatan tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      await announcementService.updateAnnouncement(content, authorName);
      showSuccess("Catatan berhasil diperbarui untuk semua user");
      onSuccess();
      onClose();
    } catch (error) {
      showError("Gagal menyimpan catatan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Megaphone className="h-5 w-5" /> Buat Catatan Pimpinan
          </DialogTitle>
          <DialogDescription>
            Pesan ini akan muncul di dashboard seluruh pengguna sistem saat mereka login.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Isi Pesan / Instruksi</Label>
            <Textarea 
              id="note"
              placeholder="Ketik instruksi atau catatan untuk seluruh tim di sini..."
              className="min-h-[150px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-[10px] text-amber-800">
            <strong>Info:</strong> Gunakan fitur ini untuk memberikan arahan harian atau pengumuman penting terkait pelaporan.
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Batal</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Simpan & Publikasikan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementDialog;