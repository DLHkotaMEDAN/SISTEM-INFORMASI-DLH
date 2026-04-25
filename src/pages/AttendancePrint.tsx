"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Printer, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { reportService } from '@/services/reportService';
import { Report } from '@/types/report';
import { format, getDaysInMonth, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const categories = ["Taman Kota", "Taman Amplas", "Taman Area", "Tim Babat", "Tim Siram", "Tim Pohon"];
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

// Daftar nama default berdasarkan kategori (seperti yang ada di form input)
const defaultPersonnel: Record<string, string[]> = {
  "Taman Kota": ["Mhd. Said"],
  "Taman Area": ["Ismail Siregar"],
  "Taman Amplas": ["Erwinsyah"],
  "Tim Babat": ["Benget Simanjuntak"],
  "Tim Siram": ["M. Irwan Syahputra, SE", "Aluddin Gultom"],
  "Tim Pohon": ["Budi", "Sutrisno", "Mhd. Said"]
};

const getLogoUrl = (fileName: string) => {
  const { data } = supabase.storage.from('assets').getPublicUrl(fileName);
  return data.publicUrl;
};

const LOGO_MEDAN_URL = getLogoUrl('logo-medan.jpg');
const LOGO_DLH_URL = getLogoUrl('logo-dlh.jpg');

const AttendancePrint = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || categories[0]);
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAllReports(selectedCategory);
      const filtered = data.filter(r => {
        const d = parseISO(r.date);
        return (d.getMonth() + 1).toString() === selectedMonth && d.getFullYear().toString() === selectedYear;
      });
      setReports(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Gabungkan nama dari database dan nama default
  const personnelList = useMemo(() => {
    const names = new Set<string>(defaultPersonnel[selectedCategory] || []);
    
    reports.forEach(r => {
      if (r.personnel?.coordinator) names.add(r.personnel.coordinator);
      r.tasks?.forEach(t => {
        if (t.personnel?.coordinator) names.add(t.personnel.coordinator);
      });
    });

    const sortedNames = Array.from(names).sort();
    // Pastikan minimal ada 15 baris untuk tampilan yang bagus
    while (sortedNames.length < 15) {
      sortedNames.push("");
    }
    return sortedNames;
  }, [reports, selectedCategory]);

  const daysCount = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1));
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-100 p-0 md:p-8">
      <div className="max-w-[1200px] mx-auto space-y-6 no-print mb-8 p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Button>
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] font-bold"><SelectValue placeholder="Pilih Tim" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Bulan" /></SelectTrigger>
                <SelectContent>{months.map((m, i) => <SelectItem key={i+1} value={(i+1).toString()}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]"><SelectValue placeholder="Tahun" /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Printer className="mr-2 h-4 w-4" /> Cetak Sekarang
          </Button>
        </div>
      </div>

      <div className="print-area bg-white p-10 mx-auto shadow-2xl border border-slate-200 min-h-[210mm] w-full max-w-[297mm]">
        {/* Header Sesuai PDF */}
        <div className="flex items-center justify-center gap-10 border-b-4 border-double border-black pb-4 mb-6">
          <img src={LOGO_MEDAN_URL} className="h-20 w-20 object-contain" alt="Logo Medan" />
          <div className="text-center space-y-0.5">
            <h1 className="text-xl font-bold uppercase tracking-tight">Pemerintah Kota Medan</h1>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Dinas Lingkungan Hidup</h2>
            <p className="text-[10px] italic font-medium">Jl. Pinang Baris, Lalang Kec. Medan Sunggal, Kota Medan, Sumatera Utara</p>
          </div>
          <img src={LOGO_DLH_URL} className="h-20 w-20 object-contain" alt="Logo DLH" />
        </div>

        <div className="text-center mb-8">
          <h3 className="text-lg font-bold underline uppercase decoration-2 underline-offset-4">DAFTAR HADIR PERSONIL LAPANGAN</h3>
          <div className="flex justify-center gap-12 text-[12px] mt-3 font-bold">
            <div className="flex gap-2"><span>TIM/KATEGORI:</span> <span className="border-b border-black px-4">{selectedCategory.toUpperCase()}</span></div>
            <div className="flex gap-2"><span>BULAN:</span> <span className="border-b border-black px-4">{months[parseInt(selectedMonth)-1].toUpperCase()} {selectedYear}</span></div>
          </div>
        </div>

        <table className="w-full border-collapse border-2 border-black text-[10px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-2 border-black p-2 w-10" rowSpan={2}>NO</th>
              <th className="border-2 border-black p-2 w-64" rowSpan={2}>NAMA PERSONIL</th>
              <th className="border-2 border-black p-1" colSpan={31}>TANGGAL</th>
              <th className="border-2 border-black p-2 w-16" rowSpan={2}>KET</th>
            </tr>
            <tr className="h-8">
              {daysArray.map(d => (
                <th key={d} className={cn(
                  "border-2 border-black p-0 w-6 text-[9px] font-bold",
                  d > daysCount && "bg-slate-200"
                )}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {personnelList.map((name, idx) => (
              <tr key={idx} className="h-9">
                <td className="border-2 border-black text-center font-bold">{idx + 1}</td>
                <td className="border-2 border-black px-3 font-bold uppercase">{name}</td>
                {daysArray.map(d => (
                  <td key={d} className={cn(
                    "border-2 border-black",
                    d > daysCount && "bg-slate-200"
                  )}></td>
                ))}
                <td className="border-2 border-black"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Tanda Tangan Sesuai PDF */}
        <div className="mt-12 grid grid-cols-3 gap-8 text-[12px]">
          <div className="text-center flex flex-col justify-between h-40">
            <div>
              <p className="font-medium">Mengetahui:</p>
              <p className="font-bold uppercase">Pengawas Lapangan</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold underline uppercase">( ............................................ )</p>
              <p className="text-[10px]">NIP. ............................................</p>
            </div>
          </div>
          
          <div className="text-center">
            {/* Kolom Tengah Kosong */}
          </div>

          <div className="text-center flex flex-col justify-between h-40">
            <div>
              <p className="font-medium">Medan, {format(new Date(), 'dd MMMM yyyy', { locale: localeId })}</p>
              <p className="font-bold uppercase">Koordinator Tim</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold underline uppercase">( ............................................ )</p>
              <p className="text-[10px]">NIP. ............................................</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-area { 
            box-shadow: none !important; 
            border: none !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            width: 100% !important; 
            max-width: none !important; 
          }
          @page { size: landscape; margin: 1cm; }
          table { border-color: black !important; border-width: 2px !important; }
          th, td { border-color: black !important; border-width: 2px !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .bg-slate-200 { background-color: #e2e8f0 !important; }
        }
      `}} />
    </div>
  );
};

export default AttendancePrint;