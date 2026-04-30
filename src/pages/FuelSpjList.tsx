"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Calendar, MapPin, Fuel, Trash2, Edit, 
  Search, FilterX, ArrowLeft, Truck, Users, Globe,
  Loader2, RefreshCw, ShieldCheck
} from 'lucide-react';
import { FuelSpj } from '@/types/fuelSpj';
import { fuelSpjService } from '@/services/fuelSpjService';
import { useAuth } from '@/context/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FuelSpjList = () => {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [spjs, setSpjs] = useState<FuelSpj[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = profile?.role === 'admin' || session?.user?.email === 'admin@gmail.com';
  const isSpjBbm = profile?.role === 'spjbbm' || session?.user?.email === 'spjbbm@gmail.com';
  const isPimpinan = profile?.role === 'pimpinan' || session?.user?.email === 'pimpinan@gmail.com';

  useEffect(() => {
    if (!isAdmin && !isSpjBbm && !isPimpinan) {
      showError("Akses ditolak.");
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, isSpjBbm, isPimpinan]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fuelSpjService.getAll();
      setSpjs(data);
    } catch (error) {
      showError("Gagal memuat data SPJ BBM");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isPimpinan) return;
    if (!confirm("Pindahkan ke tempat sampah?")) return;
    try {
      await fuelSpjService.delete(id);
      setSpjs(prev => prev.filter(s => s.id !== id));
      showSuccess("Data dipindahkan ke tempat sampah");
    } catch (error) {
      showError("Gagal menghapus data");
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredSpjs = spjs.filter(s => 
    s.spj_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location_street.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Beranda</span></Button>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2"><Fuel className="text-blue-600" /> Manajemen SPJ BBM</h1>
          </div>
          <div className="flex items-center gap-2">
            {isPimpinan && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 h-9 px-4 hidden md:flex">
                <ShieldCheck className="h-4 w-4 mr-2" /> Mode Pantau
              </Badge>
            )}
            <Button variant="outline" size="icon" onClick={loadData} disabled={loading}><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
            {!isPimpinan && (
              <Button onClick={() => navigate('/fuel-spj/create')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Input SPJ Baru</span>
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari No. SPJ, Kendaraan, atau Jalan..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button variant="ghost" onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-red-500"><FilterX className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Reset</span></Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-slate-500">Memuat data SPJ BBM...</p>
          </div>
        ) : filteredSpjs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpjs.map((spj) => (
              <Card key={spj.id} className="hover:shadow-md transition-all border-l-4 border-l-blue-500 group">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase"><Calendar className="h-3 w-3 mr-1" /> {spj.date}</div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">{spj.spj_number}</Badge>
                    </div>
                    {!isPimpinan && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => navigate(`/fuel-spj/edit/${spj.id}`)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={(e) => handleDelete(e, spj.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2 flex items-center gap-2"><Truck size={16} className="text-slate-400" /> {spj.vehicle}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs text-slate-600 flex items-start gap-2"><MapPin className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" /> <span className="line-clamp-1">{spj.location_street}, {spj.location_village}</span></div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Users size={12} /> {spj.team}</div>
                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Globe size={12} /> {spj.region}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded space-y-2 mt-2">
                    <div className="grid grid-cols-1 gap-1 text-[10px]">
                      {spj.usage_pertamax > 0 && <div className="flex justify-between"><span>Pertamax:</span><span className="font-black text-blue-600">{formatRupiah(spj.usage_pertamax)}</span></div>}
                      {spj.usage_dexlite > 0 && <div className="flex justify-between"><span>Dexlite:</span><span className="font-black text-orange-600">{formatRupiah(spj.usage_dexlite)}</span></div>}
                      {spj.usage_solar > 0 && <div className="flex justify-between"><span>Solar:</span><span className="font-black text-green-600">{formatRupiah(spj.usage_solar)}</span></div>}
                      {spj.usage_oil > 0 && <div className="flex justify-between border-t pt-1 mt-1"><span>Oli:</span><span className="font-black text-purple-600">{spj.usage_oil} L</span></div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">Tidak ada data SPJ BBM ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuelSpjList;