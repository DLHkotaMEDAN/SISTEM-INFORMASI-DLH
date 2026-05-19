"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Search, Cloud, Printer,
  LogOut, LogIn, FilterX, Database, ChevronDown,
  Table, ClipboardList, CalendarDays, Fuel, Trash2, Loader2, UserCircle, Bell,
  Sparkles, ArrowRight, LayoutDashboard, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Report } from '@/types/report';
import { WorkPlan } from '@/types/workPlan';
import { showSuccess, showError } from '@/utils/toast';
import { reportService } from '@/services/reportService';
import { workPlanService } from '@/services/workPlanService';
import { useAuth } from '@/context/AuthContext';
import TrashDialog from '@/components/TrashDialog';
import FuelReportTab from '@/components/FuelReportTab';
import FuelSpjTab from '@/components/FuelSpjTab';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import ReportCard from '@/components/dashboard/ReportCard';
import WorkPlanCard from '@/components/dashboard/WorkPlanCard';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const categories: string[] = [
  "semua", "Taman Kota", "Taman Amplas", "Taman Area", "Tim Babat", "Tim Siram", "Tim Pohon"
];

const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const Index = () => {
  const navigate = useNavigate();
  const { session, profile, signOut, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("reports");
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("semua");
  const [selectedYear, setSelectedYear] = useState("semua");
  const [selectedCategory, setSelectedCategory] = useState("semua");

  const isLoggedIn = !!session;
  const isAdmin = profile?.role === 'admin' || (session?.user?.email === 'admin@gmail.com');
  const isAdminBbm = profile?.role === 'admin_bbm';
  const isAdminSpj = profile?.role === 'admin_spj_bbm';
  const isPimpinan = profile?.role === 'pimpinan' || (session?.user?.email === 'pimpinan@gmail.com');
  const isAdminHarian = profile?.role === 'admin_harian' || (session?.user?.email === 'sakinah@gmail.com');
  const isUserRestricted = isLoggedIn && profile?.role === 'user' && !isPimpinan && !isAdminHarian;

  useEffect(() => {
    if (authLoading) return;
    if (isAdminBbm) { navigate('/fuel-reports'); return; }
    if (isAdminSpj) { navigate('/fuel-reports/spj'); return; }

    loadData();
    if (isUserRestricted && profile?.category) {
      setSelectedCategory(profile.category);
    }
  }, [profile, isLoggedIn, isAdminBbm, isAdminSpj, authLoading, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, workPlansData] = await Promise.all([
        reportService.getAllReports(),
        workPlanService.getAllWorkPlans()
      ]);
      setReports(reportsData);
      setWorkPlans(workPlansData);
    } catch (error) {
      console.error(error);
      showError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      try {
        await signOut();
        showSuccess("Berhasil keluar");
      } catch (error) {
        showError("Gagal keluar");
      }
    }
  };

  const handleDeleteReport = async (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    if (isPimpinan) return;
    if (window.confirm(`Pindahkan laporan "${report.description}" ke tempat sampah?`)) {
      try {
        await reportService.deleteReport(report.id);
        setReports(reports.filter(r => r.id !== report.id));
        showSuccess("Laporan dipindahkan ke tempat sampah");
      } catch (error) {
        showError("Gagal menghapus");
      }
    }
  };

  const handleToggleWorkPlanVisibility = async (e: React.MouseEvent, plan: WorkPlan) => {
    e.stopPropagation();
    if (!isLoggedIn || isPimpinan) return;
    
    const newVisibility = plan.is_visible === false ? true : false;
    try {
      await workPlanService.updateWorkPlan(plan.id, { is_visible: newVisibility });
      setWorkPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_visible: newVisibility } : p));
      showSuccess(newVisibility ? "Rencana akan muncul di rekap" : "Rencana disembunyikan dari rekap");
    } catch (error) {
      showError("Gagal mengubah status visibilitas");
    }
  };

  const handleDeleteWorkPlan = async (e: React.MouseEvent, plan: WorkPlan) => {
    e.stopPropagation();
    if (!isLoggedIn || isPimpinan) return;
    if (window.confirm(`Pindahkan rencana kerja "${plan.items[0]?.description}" ke tempat sampah?`)) {
      try {
        await workPlanService.deleteWorkPlan(plan.id);
        setWorkPlans(workPlans.filter(p => p.id !== plan.id));
        showSuccess("Rencana kerja dipindahkan ke tempat sampah");
      } catch (error) {
        showError("Gagal menghapus data");
      }
    }
  };

  const resetFilters = () => {
    setSelectedDate("");
    setSelectedMonth("semua");
    setSelectedYear("semua");
    setSelectedCategory(isUserRestricted ? (profile?.category || "semua") : "semua");
    setSearchQuery("");
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const search = searchQuery.toLowerCase();
      const reportDate = new Date(report.date);
      const m = (reportDate.getMonth() + 1).toString();
      const y = reportDate.getFullYear().toString();
      
      const matchSearch = report.description.toLowerCase().includes(search) || report.location.street.toLowerCase().includes(search);
      const matchSpecificDate = !selectedDate || report.date === selectedDate;
      const matchMonth = selectedMonth === "semua" || m === selectedMonth;
      const matchYear = selectedYear === "semua" || y === selectedYear;
      const matchCategory = selectedCategory === "semua" || report.category === selectedCategory;
      const restrictionMatch = !isUserRestricted || report.category === profile?.category;
      
      if (selectedDate) return matchSearch && matchSpecificDate && matchCategory && restrictionMatch;
      return matchSearch && matchMonth && matchYear && matchCategory && restrictionMatch;
    });
  }, [reports, searchQuery, selectedDate, selectedMonth, selectedYear, selectedCategory, isUserRestricted, profile]);

  const filteredWorkPlans = useMemo(() => {
    return workPlans.filter(plan => {
      const search = searchQuery.toLowerCase().trim();
      const matchSearch = !search || (Array.isArray(plan.items) && plan.items.some(item => 
        (item.description?.toLowerCase() || "").includes(search) ||
        (item.location?.street?.toLowerCase() || "").includes(search)
      ));
      const matchSpecificDate = !selectedDate || plan.date === selectedDate;
      const matchMonth = selectedMonth === "semua" || (new Date(plan.date).getMonth() + 1).toString() === selectedMonth;
      const matchYear = selectedYear === "semua" || new Date(plan.date).getFullYear().toString() === selectedYear;
      const matchCategory = selectedCategory === "semua" || plan.category === selectedCategory;
      const restrictionMatch = !isUserRestricted || plan.category === profile?.category;
      
      return matchSearch && matchSpecificDate && matchMonth && matchYear && matchCategory && restrictionMatch;
    });
  }, [workPlans, searchQuery, selectedDate, selectedMonth, selectedYear, selectedCategory, isUserRestricted, profile]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalReports: reports.length,
      totalWorkPlans: workPlans.length,
      reportsToday: reports.filter(r => r.date === today).length,
      plansToday: workPlans.filter(p => p.date === today).length
    };
  }, [reports, workPlans]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse">Memverifikasi Hak Akses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-blue-200 shadow-lg shrink-0 transition-transform group-hover:scale-110">
              <Cloud className="text-white h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm md:text-lg font-black text-slate-900 leading-tight tracking-tighter">CLOUD DLH</h1>
              <span className="text-[8px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sistem Laporan Terpadu</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-[11px] font-black text-slate-900 leading-none uppercase">
                    {isPimpinan ? 'Pimpinan' : isAdminHarian ? 'Admin Harian' : isAdmin ? 'Administrator' : 'User Lapangan'}
                  </p>
                  <Badge variant="outline" className="text-[8px] font-bold text-blue-600 mt-1 border-blue-100 bg-blue-50">
                    {isPimpinan || isAdminHarian ? 'Semua Wilayah' : (profile?.category || 'Umum')}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 hover:ring-2 ring-blue-100 transition-all">
                      <UserCircle className="h-6 w-6 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-slate-100">
                    <div className="p-4 mb-2 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-50">
                      <p className="text-xs font-black text-slate-900 truncate">{profile?.username || session?.user?.email}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{profile?.role}</p>
                    </div>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/maintenance')} className="cursor-pointer py-3 rounded-lg focus:bg-blue-50 focus:text-blue-700">
                        <Settings className="mr-3 h-4 w-4 text-amber-600" /> Maintenance Sistem
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setIsTrashOpen(true)} className="cursor-pointer py-3 rounded-lg focus:bg-red-50 focus:text-red-700">
                      <Trash2 className="mr-3 h-4 w-4 text-red-500" /> Tempat Sampah
                    </DropdownMenuItem>
                    <div className="h-px bg-slate-100 my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-3 rounded-lg text-red-600 font-black focus:bg-red-50">
                      <LogOut className="mr-3 h-4 w-4" /> Keluar Sistem
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button onClick={() => navigate('/login')} size="sm" className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-black rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95">
                <LogIn className="h-4 w-4 mr-2" /> MASUK
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="relative mb-12 p-8 md:p-12 rounded-[2rem] overflow-hidden bg-slate-900 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Dashboard Utama</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
              Halo, <span className="text-blue-400">{profile?.username || 'Rekan DLH'}</span>! 👋
            </h2>
            <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed mb-8">
              Selamat datang di pusat kendali laporan kegiatan harian. Pantau progres, kelola rencana, dan pastikan semua data tersinkronisasi dengan sempurna.
            </p>
            
            {!isLoggedIn && (
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 h-12 px-8 font-black rounded-xl">
                  Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Badge variant="outline" className="h-12 px-6 border-slate-700 text-slate-300 rounded-xl font-bold">
                  <Sparkles className="h-4 w-4 mr-2 text-amber-400" /> Mode Lihat Saja Aktif
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <DashboardStats 
          totalReports={stats.totalReports}
          totalWorkPlans={stats.totalWorkPlans}
          reportsToday={stats.reportsToday}
          plansToday={stats.plansToday}
        />

        {/* Quick Actions */}
        <QuickActions isPimpinan={isPimpinan} isLoggedIn={isLoggedIn} activeTab={activeTab} />

        <Tabs defaultValue="reports" onValueChange={setActiveTab} className="w-full space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/50">
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 py-2.5 px-8 rounded-xl text-xs md:text-sm font-black transition-all uppercase tracking-wider"
              >
                <FileText size={16} /> Laporan
              </TabsTrigger>
              <TabsTrigger 
                value="workplans" 
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 py-2.5 px-8 rounded-xl text-xs md:text-sm font-black transition-all uppercase tracking-wider"
              >
                <ClipboardList size={16} /> Rencana
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="fuel_reports" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-2.5 px-8 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider">
                    <Fuel size={16} /> BBM
                  </TabsTrigger>
                  <TabsTrigger value="fuel_spj" className="data-[state=active]:bg-indigo-800 data-[state=active]:text-white py-2.5 px-8 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider">
                    <Table size={16} /> SPJ
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-slate-700 border-slate-200 h-12 px-6 font-black rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
                    <Printer className="h-4 w-4 mr-3 text-blue-600" /> CETAK REKAP <ChevronDown className="ml-3 h-4 w-4 opacity-30" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl border-slate-100">
                  {activeTab === 'reports' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate(`/print-rekap?category=semua`)} className="py-4 rounded-xl cursor-pointer focus:bg-blue-50">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4"><Printer className="h-4 w-4 text-blue-600" /></div>
                        <div className="flex flex-col"><span className="font-black text-xs">Cetak Harian</span><span className="text-[10px] text-slate-500">Format standar laporan</span></div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/daily-rekap?categories=semua&date=semua`)} className="py-4 rounded-xl cursor-pointer focus:bg-emerald-50">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-4"><Table className="h-4 w-4 text-emerald-600" /></div>
                        <div className="flex flex-col"><span className="font-black text-xs">Rekap Harian</span><span className="text-[10px] text-slate-500">Tabel ringkasan harian</span></div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/weekly-rekap?categories=semua&date=${new Date().toISOString().split('T')[0]}`)} className="py-4 rounded-xl cursor-pointer focus:bg-purple-50">
                        <div className="p-2 bg-purple-100 rounded-lg mr-4"><CalendarDays className="h-4 w-4 text-purple-600" /></div>
                        <div className="flex flex-col"><span className="font-black text-xs">Rekap Mingguan</span><span className="text-[10px] text-slate-500">Ringkasan per minggu</span></div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/monthly-rekap`)} className="py-4 rounded-xl cursor-pointer focus:bg-orange-50">
                        <div className="p-2 bg-orange-100 rounded-lg mr-4"><FileText className="h-4 w-4 text-orange-600" /></div>
                        <div className="flex flex-col"><span className="font-black text-xs">Rekap Bulanan</span><span className="text-[10px] text-slate-500">Laporan arsip bulanan</span></div>
                      </DropdownMenuItem>
                    </>
                  )}
                  {activeTab === 'workplans' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/work-plans/daily-rekap')} className="py-4 rounded-xl cursor-pointer focus:bg-blue-50">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4"><Printer className="h-4 w-4 text-blue-600" /></div>
                        <div className="flex flex-col"><span className="font-black text-xs">Rekap Harian</span><span className="text-[10px] text-slate-500">Rencana kerja hari ini</span></div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/work-plans/weekly-rekap')} className="py-4 rounded-xl cursor-pointer focus:bg-emerald-50">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-4"><Table className="h-4 w-4 text-emerald-600" /></div>
                        <div className="flex flex-col"><span className="font-black text-xs">Rekap Mingguan</span><span className="text-[10px] text-slate-500">Jadwal kerja seminggu</span></div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/work-plans/monthly-rekap')} className="py-4 rounded-xl cursor-pointer focus:bg-purple-50">
                        <div className="p-2 bg-purple-100 rounded-lg mr-4"><FileText className="h-4 w-4 text-purple-600" /></div>
                        <div className="flex flex-col"><span className="font-black text-xs">Rekap Bulanan</span><span className="text-[10px] text-slate-500">Arsip rencana bulanan</span></div>
                      </DropdownMenuItem>
                    </>
                  )}
                  {/* Fuel & SPJ menus remain consistent with activeTab logic */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border ring-1 ring-slate-200/50 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-4 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Pencarian</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    placeholder="Cari kegiatan atau lokasi..." 
                    className="pl-11 bg-white border-slate-200 h-12 rounded-2xl focus-visible:ring-blue-500 shadow-sm" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Kategori Tim</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isUserRestricted}>
                  <SelectTrigger className="bg-white border-slate-200 h-12 rounded-2xl font-bold shadow-sm">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {categories.map(cat => <SelectItem key={cat} value={cat} className="font-medium py-2.5">{cat === 'semua' ? 'Semua Kategori' : cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Tanggal</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="date" className="pl-11 bg-white border-slate-200 h-12 rounded-2xl shadow-sm font-bold" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-[0.2em]">Bulan</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={!!selectedDate}>
                  <SelectTrigger className={cn("bg-white border-slate-200 h-12 rounded-2xl font-bold shadow-sm", selectedDate && "opacity-50")}>
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="semua">Semua Bulan</SelectItem>
                    {months.map((m, i) => <SelectItem key={i+1} value={(i+1).toString()}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={resetFilters} className="h-12 w-12 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl border border-dashed border-slate-200 transition-all">
                        <FilterX className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Reset Filter</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <TabsContent value="reports" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Sinkronisasi Data...</p>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredReports.map((report) => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    isLoggedIn={isLoggedIn} 
                    isPimpinan={isPimpinan} 
                    onDelete={handleDeleteReport} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-slate-300 h-10 w-10" />
                </div>
                <p className="text-slate-900 font-black text-2xl tracking-tighter">Tidak Ada Laporan</p>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">Coba sesuaikan filter pencarian atau buat laporan baru.</p>
                <Button variant="link" onClick={resetFilters} className="mt-6 text-blue-600 font-black uppercase tracking-widest text-xs">Reset Semua Filter</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="workplans" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Memuat Rencana...</p>
              </div>
            ) : filteredWorkPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredWorkPlans.map((plan) => (
                  <WorkPlanCard 
                    key={plan.id} 
                    plan={plan} 
                    isLoggedIn={isLoggedIn} 
                    isPimpinan={isPimpinan} 
                    onDelete={handleDeleteWorkPlan}
                    onToggleVisibility={handleToggleWorkPlanVisibility}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="text-slate-300 h-10 w-10" />
                </div>
                <p className="text-slate-900 font-black text-2xl tracking-tighter">Belum Ada Rencana</p>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">Rencana kerja untuk periode ini belum tersedia.</p>
                <Button variant="link" onClick={resetFilters} className="mt-6 text-emerald-600 font-black uppercase tracking-widest text-xs">Reset Semua Filter</Button>
              </div>
            )}
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="fuel_reports" className="mt-0 animate-in fade-in duration-500">
                <FuelReportTab />
              </TabsContent>
              <TabsContent value="fuel_spj" className="mt-0 animate-in fade-in duration-500">
                <FuelSpjTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      
      <TrashDialog 
        isOpen={isTrashOpen} 
        onClose={() => setIsTrashOpen(false)} 
        onRefresh={loadData} 
      />
    </div>
  );
};

export default Index;