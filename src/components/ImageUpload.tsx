"use client";

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  label: string;
}

const ImageUpload = ({ value, onChange, label }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [onChange]);

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const item = e.clipboardData.items[0];
    if (item?.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) handleFile(file);
    }
  }, [onChange]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        className={cn(
          "relative group aspect-video rounded-xl border-2 border-dashed transition-all flex flex-center items-center justify-center overflow-hidden cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50",
          value ? "border-none" : ""
        )}
        onClick={() => !value && document.getElementById(`file-${label}`)?.click()}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="mx-auto w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Upload size={20} className="text-slate-500 group-hover:text-blue-600" />
            </div>
            <p className="text-xs font-medium text-slate-600">Klik, Seret, atau Paste</p>
            <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
          </div>
        )}
        <input
          id={`file-${label}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUpload;