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
import { Folder, User, FileText, Loader2, CloudUpload, FolderPlus, Check, X } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const CLIENT_ID = "323264526689-91gea696tm6ftv49jt4lb4tqjo5a1947.apps.googleusercontent.com"; 
const API_KEY = "AIzaSyDzRtvJVVWSYJ1e9VGKBhA1CxRYtlda1PY";
const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";

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
  const [isPickerApiLoaded, setIsPickerApiLoaded] = useState(false);
  
  // State untuk folder baru
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (!document.getElementById('google-gis')) {
      const script = document.createElement("script");
      script.id = 'google-gis';
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const loadGapi = () => {
      const gapi = (window as any).gapi;
      if (gapi) {
        gapi.load('picker', {
          callback: () => {
            setIsPickerApiLoaded(true);
          }
        });
      }
    };

    if (!document.getElementById('google-gapi')) {
      const gapiScript = document.createElement("script");
      gapiScript.id = 'google-gapi';
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.onload = loadGapi;
      document.body.appendChild(gapiScript);
    } else {
      loadGapi();
    }
  }, [isOpen]);

  const handleAuth = () => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            setAccessToken(response.access_token);
            fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`)
              .then(res => res.json())
              .then(data => {
                if (data.email) setUserEmail(data.email);
                else setUserEmail("Akun Terhubung");
              })
              .catch(() => setUserEmail("Akun Terhubung"));
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error("Auth error:", err);
      showError("Gagal memulai autentikasi Google");
    }
  };

  const openPicker = () => {
    if (!accessToken) {
      showError("Silakan pilih akun terlebih dahulu");
      return;
    }

    const google = (window as any).google;
    if (!isPickerApiLoaded || !google || !google.picker) {
      showError("Modul pemilih folder belum siap. Silakan tunggu sebentar...");
      return;
    }

    try {
      const origin = window.location.origin;
      const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setSelectFolderEnabled(true)
        .setIncludeFolders(true);

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(API_KEY)
        .setOrigin(origin)
        .setCallback((data: any) => {
          if (data.action === google.picker.Action.PICKED) {
            const doc = data.docs[0];
            setFolderName(doc.name);
            setFolderId(doc.id);
          }
        })
        .build();
      picker.setVisible(true);
    } catch (err: any) {
      console.error("Picker error:", err);
      showError(`Gagal membuka pemilih: ${err.message}`);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showError("Nama folder tidak boleh kosong");
      return;
    }

    setIsCreatingFolder(true);
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [folderId], // Membuat folder di dalam folder yang sedang dipilih
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gagal membuat folder");

      setFolderName(data.name);
      setFolderId(data.id);
      setShowNewFolderInput(false);
      setNewFolderName("");
      showSuccess(`Folder "${data.name}" berhasil dibuat`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleFinalUpload = async () => {
    if (!accessToken) {
      showError("Akun belum terhubung");
      return;
    }
    setIsUploading(true);
    try {
      await onUpload({ fileName, folderId, accessToken });
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      showError("Gagal mengunggah ke Drive");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isUploading && !isCreatingFolder) onClose();
    }}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudUpload className="text-blue-600" /> Simpan ke Drive
          </DialogTitle>
          <DialogDescription>
            Atur lokasi dan nama file untuk laporan PDF Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="filename" className="flex items-center gap-2">
              <FileText size={14} /> Nama File
            </Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Masukkan nama file..."
              disabled={isUploading || isCreatingFolder}
            />
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <User size={14} /> Akun Google
            </Label>
            <Button 
              variant="outline" 
              onClick={handleAuth}
              disabled={isUploading || isCreatingFolder}
              className="justify-start font-normal h-10 border-slate-200 overflow-hidden"
            >
              {userEmail ? (
                <span className="text-blue-600 font-bold truncate">{userEmail}</span>
              ) : (
                <span className="text-slate-500">Klik untuk pilih akun...</span>
              )}
            </Button>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Folder size={14} /> Lokasi Penyimpanan
              </Label>
              {accessToken && !showNewFolderInput && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[10px] text-blue-600 hover:text-blue-700 p-0"
                  onClick={() => setShowNewFolderInput(true)}
                  disabled={isUploading || isCreatingFolder}
                >
                  <FolderPlus size={12} className="mr-1" /> Buat Folder Baru
                </Button>
              )}
            </div>

            {showNewFolderInput ? (
              <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                <Input 
                  placeholder="Nama folder baru..." 
                  className="h-9 text-xs"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  disabled={isCreatingFolder}
                />
                <Button 
                  size="icon" 
                  className="h-9 w-9 bg-green-600 hover:bg-green-700 shrink-0"
                  onClick={handleCreateFolder}
                  disabled={isCreatingFolder}
                >
                  {isCreatingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 text-slate-400 shrink-0"
                  onClick={() => { setShowNewFolderInput(false); setNewFolderName(""); }}
                  disabled={isCreatingFolder}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={openPicker}
                disabled={!accessToken || isUploading || isCreatingFolder}
                className="justify-start font-normal h-10 border-slate-200"
              >
                <span className="truncate">{folderName}</span>
                {!isPickerApiLoaded && accessToken && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
              </Button>
            )}
            {!accessToken && <p className="text-[10px] text-amber-600 italic">* Pilih akun dulu untuk memilih/membuat folder</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isUploading || isCreatingFolder}>Batal</Button>
          <Button 
            onClick={handleFinalUpload} 
            disabled={isUploading || isCreatingFolder || !accessToken || showNewFolderInput}
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