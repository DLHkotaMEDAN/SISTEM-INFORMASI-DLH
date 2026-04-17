"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  Plus, FileText, MapPin, Calendar, Users, 
  Trash2, Eye, Search, Edit, Table, Printer, FileBarChart,
  LogOut, User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Report } from '../types/report';
import { MadeWithDyad } from "../components/made-with-dyad";
import { showSuccess, showError } from '../utils/toast';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { getUnitByCategory } from '../utils/report-helpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";

const categories: string[] = [
  "semua", "Taman Kota", "Taman Amplas", "Taman Area", "Tim Babat", "Tim Siram", "Tim Pohon"
];

const Index = () => {
  const navigate = useNavigate();
  const { profile, session, loading: authLoading, signOut } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrintCategory, setSelectedPrintCategory] = useState("semua");
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate('/login');
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (profile) loadReports();
  }, [profile]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const categoryFilter = profile?.role === 'admin' ? null : profile?.category;
      const data = await reportService.getAllReports(categoryFilter);
      setReports(data);
    } catch (error) {
      console.error(error);
      showError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Hapus laporan ini?")) {
      try {
        await reportService.deleteReport(id);
        setReports(reports.filter(r => r.id !== id));
        showSuccess("Laporan dihapus");
      } catch (error) {
        showError("Gagal menghapus");
      }
    }
  };

  const handleExportExcel = () => {
    if (reports.length === 0) return showError("Tidak ada data");
    const data = reports.map((r, i) => ({
      "No": i + 1,
      "Tanggal": r.date,
      "Tim": r.category,
      "Kegiatan": r.description,
      "Lokasi": r.location.street,
      "Volume": r.volume,
      "Satuan": getUnitByCategory(r.category),
      "Koordinator": r.personnel.coordinator
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_${new Date().toISOString().split('T')[0]}.xlsx`);
    showSuccess("Excel diunduh");
  };

  const filteredReports = reports.filter(r => 
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location.street.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FileText className="text-white h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 leading-none">Sistem Laporan</h1>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">{profile?.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {profile?.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
                  <Users className="h-4 w-4 mr-1" /> User
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/monthly-rekap')} className="bg-purple-50 text-purple-700 border-purple-200">
                <FileBarChart className="h-4 w-4 mr-1" /> Rekap
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsPrintDialogOpen(true)} className="bg-slate-50 text-slate-700 border-slate-200">
                <Printer className="h-4 w-4 mr-1" /> Cetak
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="bg-green-50 text-green-700 border-green-200">
                <Table className="h-4 w-4 mr-1" /> Excel
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0 bg-slate-100">
                  <UserIcon className="h-5 w-5 text-slate-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 px-3">
                  <p className="text-xs font-bold">{profile?.username}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{profile?.category}</p>
                </div>
                <DropdownMenuSeparator />
                {/* Menu Mobile */}
                <div className="lg:hidden">
                  <DropdownMenuItem onClick={() => navigate('/monthly-rekap')}>
                    <FileBarChart className="h-4 w-4 mr-2" /> Rekap Bulanan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPrintDialogOpen(true)}>
                    <Printer className="h-4 w-4 mr-2" /> Cetak Harian
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <Table className="h-4 w-4 mr-2" /> Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => navigate('/create')} size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              <Plus className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Laporan</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari lokasi atau kegiatan..." 
              className="pl-10 bg-white border-slate-200 focus:ring-blue-500" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p>Memuat data laporan...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <FileText className="mx-auto h-12 w-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Belum ada laporan yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Card 
                key={report.id} 
                className="group hover:shadow-lg transition-all cursor-pointer border-none shadow-sm ring-1 ring-slate-200 overflow-hidden" 
                onClick={() => navigate(`/report/${report.id}`)}
              >
                <div className="h-1.5 bg-blue-600 w-full"></div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 text-slate-600 border-slate-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(report.date).toLocaleDateString('id-ID')}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); navigate(`/edit/${report.id}`); }}>
                        <Edit className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => handleDelete(e, report.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-sm font-bold mt-2 line-clamp-2 text-slate-800">{report.description}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="line-clamp-1">{report.location.street}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-[10px] font-bold text-slate-700">
                      Vol: <span className="text-blue-600">{report.volume} {getUnitByCategory(report.category)}</span>
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                      Lihat Detail <Eye className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <CardTitle className="text-lg">Cetak Rekap Laporan</CardTitle>
            <DialogDescription>Pilih kategori tim yang ingin dicetak laporannya.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={setSelectedPrintCategory} defaultValue={selectedPrintCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat === 'semua' ? 'Semua Kategori' : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => { setIsPrintDialogOpen(false); navigate(`/print-rekap?category=${selectedPrintCategory}`); }} className="w-full bg-blue-600">
              Buka Preview Cetak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MadeWithDyad />
    </div>
  );
};

export default Index;