"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar, MapPin, Eye, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { workPlanService } from '@/services/workPlanService';
import { WorkPlan } from '@/types/work-plan';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from "@/components/ui/badge";

const WorkPlans = () => {
  const navigate = useNavigate();
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4 mr-2" /> Beranda</Button>
            <h1 className="text-2xl font-bold text-slate-900">Daftar Rencana Kerja</h1>
          </div>
          <Button onClick={() => navigate('/work-plans/create')} className="bg-blue-600">
            <Plus className="mr-2 h-4 w-4" /> Buat Rencana Baru
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">Memuat data...</div>
        ) : workPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workPlans.map((wp) => (
              <Card key={wp.id} className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500" onClick={() => navigate(`/work-plans/${wp.id}`)}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{wp.category}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); navigate(`/work-plans/edit/${wp.id}`); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={(e) => handleDelete(e, wp.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-1">{wp.description}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center text-xs text-slate-500"><Calendar className="h-3 w-3 mr-1" /> {wp.date}</div>
                  <div className="flex items-start gap-2 text-xs text-slate-600"><MapPin className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" /> <span className="line-clamp-1">{wp.street}, {wp.sub_district}</span></div>
                  <div className="pt-3 border-t flex justify-end"><span className="text-blue-600 text-[10px] font-bold flex items-center">Lihat Detail <Eye className="ml-1 h-3 w-3" /></span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500">Belum ada rencana kerja</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPlans;