"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X, Plus } from 'lucide-react';
import { showSuccess, showError } from '../utils/toast';

const CreateReport = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    location: { street: '', village: '', subDistrict: '' },
    volume: 0,
    personnel: { coordinator: profile?.username || '', members: 0 },
    photos: [] as string[],
    remarks: ''
  });

  const handleAddPhoto = () => {
    if (!photoUrl) return;
    
    // Validasi pencegahan foto ganda
    if (formData.photos.includes(photoUrl)) {
      showError("Foto ini sudah ditambahkan sebelumnya");
      return;
    }

    setFormData({
      ...formData,
      photos: [...formData.photos, photoUrl]
    });
    setPhotoUrl('');
    showSuccess("Foto ditambahkan");
  };

  const removePhoto = (url: string) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter(p => p !== url)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reportService.createReport({
        ...formData,
        category: profile?.category || 'Umum'
      });
      showSuccess("Laporan berhasil disimpan");
      navigate('/');
    } catch (error) {
      showError("Gagal menyimpan laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Batal
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Buat Laporan Baru - {profile?.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">Tanggal</label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">Volume</label>
                  <Input type="number" value={formData.volume} onChange={e => setFormData({...formData, volume: Number(e.target.value)})} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold">Uraian Kegiatan</label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Apa yang dikerjakan hari ini?" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold">Lokasi (Jalan)</label>
                <Input value={formData.location.street} onChange={e => setFormData({...formData, location: {...formData.location, street: e.target.value}})} placeholder="Nama Jalan" required />
              </div>

              {/* Bagian Foto */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <label className="text-xs font-bold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-600" /> Dokumentasi Foto (URL)
                </label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Tempel URL foto di sini..." 
                    value={photoUrl} 
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddPhoto} size="icon" className="bg-blue-600 shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {formData.photos.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-white">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removePhoto(url)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan Laporan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateReport;