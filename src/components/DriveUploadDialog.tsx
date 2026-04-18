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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, User, FileText, Loader2, CloudUpload } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

// Catatan: Anda perlu mendapatkan Client ID dan API Key dari Google Cloud Console
const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; 
const API_KEY = "YOUR_GOOGLE_API_KEY";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

interface DriveUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (config: { fileName: string; folderId: string; accessToken: string }) => Promise<void>;
  defaultFileName: string;
}

const DriveUploadDialog = ({ isOpen, onClose, onUpload, defaultFileName }: DriveUploadDialogProps) => {
  const [fileName, setFileName] = useState(defaultFileName);
  const [folderName, setFolderName] = useState("Drive Saya (Root)");
  const [folderId, setFolderId] = useState("root");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load Google API Scripts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.async = true;
    gapiScript.defer = true;
    document.body.appendChild(gapiScript);
  }, []);

  const handleAuth = () => {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          // Ambil info profil sederhana
          fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`)
            .then(res => res.json())
            .then(data => setUserEmail(data.email));
        }
      },
    });
    client.requestAccessToken();
  };

  const openPicker = () => {
    if (!accessToken) {
      showError("Silakan pilih akun terlebih dahulu");
      return;
    }

    const google = (window as any).google;
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.FOLDERS)
      .setOAuthToken(accessToken)
      .setDeveloperKey(API_KEY)
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const doc = data.docs[0];
          setFolderName(doc.name);
          setFolderId(doc.id);
        }
      })
      .build();
    picker.setVisible(true);
  };

  const handleFinalUpload = async () => {
    if (!accessToken) {
      showError("Akun belum terhubung");
      return;
    }
    setIsUploading(true);
    try {
      await onUpload({ fileName, folderId, accessToken });
      showSuccess("Berhasil diunggah ke Google Drive");
      onClose();
    } catch (error) {
      showError("Gagal mengunggah ke Drive");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudUpload className="text-blue-600" /> Simpan ke Drive
          </DialogTitle>
          <DialogDescription>
            Atur lokasi dan nama file untuk laporan PDF Anda.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Nama File */}
          <div className="grid gap-2">
            <Label htmlFor="filename" className="flex items-center gap-2">
              <FileText size={14} /> Nama File
            </Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Masukkan nama file..."
            />
          </div>

          {/* Akun Google */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <User size={14} /> Akun Google
            </Label>
            <Button 
              variant="outline" 
              onClick={handleAuth}
              className="justify-start font-normal h-10 border-slate-200"
            >
              {userEmail ? (
                <span className="text-blue-600 font-medium">{userEmail}</span>
              ) : (
                <span className="text-slate-500">Klik untuk pilih akun...</span>
              )}
            </Button>
          </div>

          {/* Lokasi Folder */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Folder size={14} /> Lokasi Penyimpanan
            </Label>
            <Button 
              variant="outline" 
              onClick={openPicker}
              disabled={!accessToken}
              className="justify-start font-normal h-10 border-slate-200"
            >
              <span className="truncate">{folderName}</span>
            </Button>
            {!accessToken && <p className="text-[10px] text-amber-600 italic">* Pilih akun dulu untuk memilih folder</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>Batal</Button>
          <Button 
            onClick={handleFinalUpload} 
            disabled={isUploading || !accessToken}
            className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
          >
            {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DriveUploadDialog;