"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, FileText, Calendar, MapPin, Eye, 
  Trash2, Edit, ArrowLeft, Search, FilterX, 
  ChevronDown, LayoutGrid
} from 'lucide-react';
import { workPlanService } from '@/services/workPlanService';
import { WorkPlan } from '@/types/work-plan';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = ["Taman Kota", "Taman Amplas", "Taman Area", "Tim Babat", "Tim Siram", "Tim Pohon"];

const WorkPlans = () => {
  const navigate = useNavigate();
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await workPlanService.getAllWorkPlans();
      setWorkPlans(data);
    } catch (error) {
      showError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Hapus rencana kerja ini?")) {
      try {
        await workPlanService.deleteWorkPlan(id);
        setWorkPlans(workPlans.filter(wp => wp.id !== id));
        showSuccess("Berhasil dihapus");
      } catch (error) {
        showError("Gagal menghapus");
      }
    }
  };

  const resetFilters = () => {
    setSelectedCategory("semua");
    setSelectedDate("");
    setSearchQuery("");
  };

  const filteredPlans = workPlans.filter(plan => {
    const matchCategory = selectedCategory === "semua" || plan.category === selectedCategory;
    const matchDate = !selectedDate || plan.date === selectedDate;
    const matchSearch = !searchQuery || 
      plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.street?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchCategory && matchDate && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="hover:bg-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> Beranda
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Daftar Rencana Kerja</h1>
              <p className="text-xs text-slate-500">Kelola dan pantau rencana kegiatan harian</p>
            </div>
          </div>
          <Button onClick={() => navigate('/work-plans/create')} className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Buat Rencana Baru
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-4 bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Cari Kegiatan</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Ketik uraian kegiatan..." 
                    className="pl-10 bg-slate-50 border-slate-200 h-10 focus:bg-white transition-colors" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-48 space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kategori Tim</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Kategori</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-44 space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Filter Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input 
                    type="date" 
                    className="pl-10 bg-slate-50 border-slate-200 h-10" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetFilters}
                className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                title="Reset Filter"
              >
                <FilterX className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 text-sm font-medium">Memuat data rencana kerja...</p>
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((wp) => (
              <Card 
                key={wp.id} 
                className="group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 bg-white overflow-hidden" 
                onClick={() => navigate(`/work-plans/${wp.id}`)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-2 py-0">
                      {wp.category}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" 
                        onClick={(e) => { e.stopPropagation(); navigate(`/work-plans/edit/${wp.id}`); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" 
                        onClick={(e) => handleDelete(e, wp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">
                    {wp.description}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center text-[11px] text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" /> 
                    {new Date(wp.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-slate-600">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" /> 
                    <span className="line-clamp-1">
                      {wp.locations?.[0]?.street || wp.street}, {wp.locations?.[0]?.sub_district || wp.sub_district}
                    </span>
                  </div>
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Detail Rencana</span>
                    <span className="text-blue-600 text-[10px] font-bold flex items-center group-hover:translate-x-1 transition-transform">
                      Lihat <Eye className="ml-1 h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold">Tidak ada rencana ditemukan</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
              Coba ubah filter kategori atau tanggal untuk menemukan data yang Anda cari.
            </p>
            <Button variant="link" onClick={resetFilters} className="mt-4 text-blue-600 font-bold">
              Reset Semua Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPlans;