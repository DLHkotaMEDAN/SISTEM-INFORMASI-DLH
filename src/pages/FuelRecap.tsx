"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FuelReport, FuelUsageItem } from '@/types/fuelReport';
import { fuelService } from '@/services/fuelService';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Printer, Calendar as CalendarIcon, FileText, Table, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getLogoUrl = (fileName: string) => {
  const { data } = supabase.storage.from('assets').getPublicUrl(fileName);
  return data.publicUrl;
};

const LOGO_MEDAN_URL = getLogoUrl('logo-medan.jpg');
const LOGO_DLH_URL = getLogoUrl('logo-dlh.jpg');

type RecapPeriod = "daily" | "weekly" | "monthly" | "yearly";

const FuelRecap = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const [reports, setReports] = useState<FuelReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [period, setPeriod] = useState<RecapPeriod>((searchParams.get('period') as RecapPeriod) || "daily");
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [period, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const allData = await fuelService.getAllReports();
      const targetDate = parseISO(selectedDate);
      
      let filtered = allData.filter(r => {
        const reportDate = parseISO(r.date);
        
        if (period === "daily") return r.date === selectedDate;
        
        if (period === "weekly") {
          const start = startOfWeek(targetDate, { weekStartsOn: 1 });
          const end = endOfWeek(targetDate, { weekStartsOn: 1 });
          return isWithinInterval(reportDate, { start, end });
        }
        
        if (period === "monthly") {
          const start = startOfMonth(targetDate);
          const end = endOfMonth(targetDate);
          return isWithinInterval(reportDate, { start, end });
        }
        
        if (period === "yearly") {
          const start = startOfYear(targetDate);
          const end = endOfYear(targetDate);
          return isWithinInterval(reportDate, { start, end });
        }
        
        return false;
      });

      // Urutkan berdasarkan tanggal
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setReports(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const dateObj = parseISO(selectedDate);
    if (period === "daily") return `Harian - ${format(dateObj, 'dd MMMM yyyy', { locale: localeId })}`;
    if (period === "weekly") {
      const start = startOfWeek(dateObj, { weekStartsOn: 1 });
      const end = endOfWeek(dateObj, { weekStartsOn: 1 });
      return `Mingguan - ${format(start, 'dd MMM')} s/d ${format(end, 'dd MMM yyyy', { locale: localeId })}`;
    }
    if (period === "monthly") return `Bulanan - ${format(dateObj, 'MMMM yyyy', { locale: localeId })}`;
    if (period === "yearly") return `Tahunan - ${format(dateObj, 'yyyy', { locale: localeId })}`;
    return "";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-0 md:p-8">
      <div className="max-w-[1200px] mx-auto space-y-4 no-print mb-8 p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <Button variant="ghost" onClick={() => navigate('/fuel-reports')} className="px-2 md:px-4 h-9">
              <ArrowLeft className="h-4 w-4 md:mr-2" /> Kembali
            </Button>
            
            <Select value={period} onValueChange={(v) => setPeriod(v as RecapPeriod)}>
              <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200 h-10 text-xs md:text-sm">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Rekap Harian</SelectItem>
                <SelectItem value="weekly">Rekap Mingguan</SelectItem>
                <SelectItem value="monthly">Rekap Bulanan</SelectItem>
                <SelectItem value="yearly">Rekap Tahunan</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <CalendarIcon className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-slate-400" />
              <Input 
                type={period === "yearly" ? "number" : period === "monthly" ? "month" : "date"} 
                value={period === "yearly" ? selectedDate.split('-')[0] : selectedDate.substring(0, period === "monthly" ? 7 : 10)} 
                onChange={(e) => {
                  let val = e.target.value;
                  if (period === "yearly") val = `${val}-01-01`;
                  if (period === "monthly") val = `${val}-01`;
                  setSelectedDate(val);
                }} 
                className="pl-7 md:pl-10 w-[140px] md:w-[180px] h-10 text-xs md:text-sm" 
              />
            </div>
          </div>
          
          <Button onClick={() => window.print()} className="bg-blue-600 px-2 md:px-4 h-10">
            <Printer className="h-4 w-4 md:mr-2" /> Cetak Rekap
          </Button>
        </div>
      </div>

      <div ref={printRef} className="print-area bg-white p-10 mx-auto shadow-lg border min-h-[210mm] w-full max-w-[297mm]">
        <div className="flex items-center justify-center gap-8 border-b-4 border-double border-black pb-4 mb-6">
          <img src={LOGO_MEDAN_URL} className="h-20 w-20 object-contain" alt="Logo Medan" />
          <div className="text-center">
            <h1 className="text-xl font-bold uppercase">Pemerintah Kota Medan</h1>
            <h2 className="text-2xl font-black uppercase">Dinas Lingkungan Hidup</h2>
            <p className="text-xs italic">Jl. Pinang Baris, Lalang Kec. Medan Sunggal, Kota Medan, Sumatera Utara</p>
          </div>
          <img src={LOGO_DLH_URL} className="h-20 w-20 object-contain" alt="Logo DLH" />
        </div>

        <div className="text-center mb-8">
          <h3 className="text-xl font-bold underline uppercase">REKAPITULASI PEMAKAIAN BBM & OLI</h3>
          <p className="text-lg font-bold uppercase">WILAYAH 4 MEDAN KOTA</p>
          <p className="text-md font-bold">{getTitle()}</p>
        </div>

        <table className="w-full border-collapse border-2 border-black text-[10px] table-fixed">
          <thead>
            <tr className="bg-slate-100">
              <th className="border-2 border-black p-1 w-[35px]" rowSpan={2}>No</th>
              <th className="border-2 border-black p-1 w-[75px]" rowSpan={2}>Tanggal</th>
              <th className="border-2 border-black p-1 w-[85px]" rowSpan={2}>Wilayah</th>
              <th className="border-2 border-black p-1 w-[100px]" rowSpan={2}>Tim / Operator Utama</th>
              <th className="border-2 border-black p-1 w-[120px]" rowSpan={2}>Kendaraan / Alat Operasional</th>
              <th className="border-2 border-black p-1" colSpan={3}>Jenis BBM / Oli</th>
              <th className="border-2 border-black p-1 w-[180px]" rowSpan={2}>Lokasi Kerja</th>
              <th className="border-2 border-black p-1 w-[120px]" rowSpan={2}>Keterangan</th>
            </tr>
            <tr className="bg-slate-50">
              <th className="border-2 border-black p-1 w-[60px]">Pertamax</th>
              <th className="border-2 border-black p-1 w-[60px]">Dexlite</th>
              <th className="border-2 border-black p-1 w-[50px]">Oli</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.flatMap((report, rIdx) => {
                return report.items.map((item, iIdx) => {
                  const isFirstInReport = iIdx === 0;
                  const loc = item.location;
                  const fullLocation = [loc.street, loc.village, loc.subDistrict].filter(Boolean).join(", ");
                  
                  return (
                    <tr key={`${report.id}-${iIdx}`}>
                      {isFirstInReport ? (
                        <>
                          <td className="border-2 border-black p-1.5 text-center align-top font-bold" rowSpan={report.items.length}>{rIdx + 1}</td>
                          <td className="border-2 border-black p-1.5 text-center align-top" rowSpan={report.items.length}>{format(parseISO(report.date), 'dd/MM/yy')}</td>
                          <td className="border-2 border-black p-1.5 text-center align-top" rowSpan={report.items.length}>{report.region}</td>
                          <td className="border-2 border-black p-1.5 text-center align-top font-bold" rowSpan={report.items.length}>{report.team}</td>
                        </>
                      ) : null}
                      
                      <td className="border-2 border-black p-1.5 align-top">{item.vehicle_operator}</td>
                      
                      {/* BBM Columns */}
                      <td className="border-2 border-black p-1.5 text-center align-top">
                        {item.fuel_type === "Pertamax" ? `Rp ${item.amount.toLocaleString('id-ID')}` : "-"}
                      </td>
                      <td className="border-2 border-black p-1.5 text-center align-top">
                        {item.fuel_type === "Dexlite" ? `Rp ${item.amount.toLocaleString('id-ID')}` : "-"}
                      </td>
                      <td className="border-2 border-black p-1.5 text-center align-top">
                        {item.fuel_type === "Oli" ? `${item.amount} L` : "-"}
                      </td>

                      <td className="border-2 border-black p-1.5 align-top break-words">{fullLocation}</td>
                      
                      <td className="border-2 border-black p-1.5 align-top italic text-[9px]">
                        <div className="space-y-1">
                          {item.item_remarks && <div>• {item.item_remarks}</div>}
                          {isFirstInReport && report.remarks && (
                            <div className="text-blue-700 font-medium border-t border-slate-200 pt-1">
                              Umum: {report.remarks}
                            </div>
                          )}
                          {!item.item_remarks && (!isFirstInReport || !report.remarks) && "-"}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })
            ) : (
              <tr>
                <td colSpan={10} className="border-2 border-black p-12 text-center text-slate-400 italic">
                  Tidak ada data laporan untuk periode ini
                </td>
              </tr>
            )}
          </tbody>
          {reports.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={5} className="border-2 border-black p-2 text-right">TOTAL KESELURUHAN</td>
                <td className="border-2 border-black p-2 text-center">
                  Rp {reports.reduce((acc, r) => acc + r.items.reduce((sum, i) => sum + (i.fuel_type === "Pertamax" ? i.amount : 0), 0), 0).toLocaleString('id-ID')}
                </td>
                <td className="border-2 border-black p-2 text-center">
                  Rp {reports.reduce((acc, r) => acc + r.items.reduce((sum, i) => sum + (i.fuel_type === "Dexlite" ? i.amount : 0), 0), 0).toLocaleString('id-ID')}
                </td>
                <td className="border-2 border-black p-2 text-center">
                  {reports.reduce((acc, r) => acc + r.items.reduce((sum, i) => sum + (i.fuel_type === "Oli" ? i.amount : 0), 0), 0)} L
                </td>
                <td colSpan={2} className="border-2 border-black bg-slate-200"></td>
              </tr>
            </tfoot>
          )}
        </table>

        <div className="mt-12 flex justify-end">
          <div className="text-center w-64">
            <p>Medan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold mt-1">Koordinator Wilayah 4</p>
            <div className="h-20"></div>
            <p className="font-bold underline">( ............................................ )</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
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
          table { border-color: black !important; }
          th, td { border-color: black !important; }
        }
      `}} />
    </div>
  );
};

export default FuelRecap;