"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, MapPin, Fuel, Trash2, Edit, 
  Search, FilterX, RefreshCw, Eye, MessageSquare, ArrowRight
} from 'lucide-react';
import { FuelReport } from '@/types/fuelReport';
import { fuelService } from '@/services/fuelService';
import { showSuccess, showError } from '@/utils/toast';

const FuelReportTab = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<FuelReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fuelService.getAllReports();
      setReports(data);
    } catch (error) {
      showError("Gagal memuat data BBM");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus laporan ini?")) return;
    try {
      await fuelService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      showSuccess("Laporan dihapus");
    } catch (error) {
      showError("Gagal menghapus");
    }
  };

  const filteredReports = reports.filter(r => 
    r.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari Tim atau Wilayah BBM..." 
            className="pl-10 bg-slate-50" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={loadReports} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          </Button>
          <Button onClick={() => navigate('/fuel-reports/create')} className="bg-orange-600 hover:bg-orange-700 flex-1 md:flex-none">
            <Fuel className="mr-2 h-4 w-4" /> Input BBM Baru
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Memuat data BBM...</div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-all border-l-4 border-l-orange-500 cursor-pointer group" onClick={() => navigate(`/fuel-reports/${report.id}`)}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center text-[10px] text-slate-500 font-medium"><Calendar className="h-3 w-3 mr-1" /> {report.date}</div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100 text-[10px]">{report.region}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); navigate(`/fuel-reports/edit/${report.id}`); }}><Edit size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={(e) => handleDelete(e, report.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>
                <CardTitle className="text-base mt-2 group-hover:text-orange-600 transition-colors">{report.team}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="pt-2 border-t flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 italic">{report.items?.length || 0} Item Pemakaian</span>
                  <div className="flex items-center text-blue-600 font-bold">Lihat Detail <ArrowRight className="ml-1 h-3 w-3" /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed text-slate-500">
          Tidak ada laporan BBM ditemukan
        </div>
      )}
    </div>
  );
};

export default FuelReportTab;