"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkPlan } from '@/types/workPlan';
import { workPlanService } from '@/services/workPlanService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Printer, FileText, PenTool, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const getLogoUrl = (fileName: string) => {
  const { data } = supabase.storage.from('assets').getPublicUrl(fileName);
  return data.publicUrl;
};

const LOGO_MEDAN_URL = getLogoUrl('logo-medan.jpg');
const LOGO_DLH_URL = getLogoUrl('logo-dlh.jpg');

const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

type SignatureMode = "with-signature" | "without-signature";

const WorkPlanMonthlyRecap = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<WorkPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("with-signature");

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await workPlanService.getAllWorkPlans();
      const filtered = data.filter(p => {
        const pDate = parseISO(p.date);
        return (pDate.getMonth() + 1).toString() === selectedMonth && 
               pDate.getFullYear().toString() === selectedYear;
      });
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime() || a.category.localeCompare(b.category));
      setPlans(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasRemarks = plans.some(plan => plan.items.some(item => item.remarks && item.remarks.trim() !== ""));
  const categoriesInPlans = Array.from(new Set(plans.map(p => p.category)));
  const showSignatory4 = categoriesInPlans.some(c => ["Taman Kota", "Taman Amplas", "Taman Area", "Tim Babat"].includes(c));
  const showSignatory5 = categoriesInPlans.some(c => ["Tim Pohon", "Tim Siram"].includes(c));

  return (
    <div className="min-h-screen bg-slate-50 p-0 md:p-8">
      <div className="max-w-[1200px] mx-auto space-y-6 no-print mb-8 p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/work-plans')} className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-bold text-sm md:text-base">Rekap Bulanan Rencana</h1>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => navigate('/work-plans/create')} variant="outline" size="icon" className="h-9 w-9 border-blue-600 text-blue-600">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Tambah Rencana Baru</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => window.print()} size="icon" className="h-9 w-9 bg-blue-600">
                      <Printer className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Cetak Rekap</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Bulan" /></SelectTrigger>
              <SelectContent>{months.map((m, i) => <SelectItem key={i+1} value={(i+1).toString()}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Tahun" /></SelectTrigger>
              <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={signatureMode} onValueChange={(v) => setSignatureMode(v as SignatureMode)}>
              <SelectTrigger className="h-10 bg-amber-50 border-amber-200 text-amber-700 font-medium col-span-2 sm:col-span-2">
                <SelectValue placeholder="Tanda Tangan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="with-signature"><div className="flex items-center gap-2"><PenTool size={14} /> Ada Tanda Tangan</div></SelectItem>
                <SelectItem value="without-signature"><div className="flex items-center gap-2"><PenTool size={14} className="opacity-40" /> Tanpa Tanda Tangan</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="print-area bg-white p-4 md:p-10 mx-auto shadow-lg border min-h-[210mm] w-full max-w-[297mm] overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex items-center justify-center gap-8 border-b-4 border-double border-black pb-4 mb-6">
            <img src={LOGO_MEDAN_URL} className="h-16 w-16 md:h-20 md:w-20 object-contain" alt="Logo Medan" />
            <div className="text-center">
              <h1 className="text-base md:text-xl font-bold uppercase leading-tight">Pemerintah Kota Medan</h1>
              <h2 className="text-lg md:text-2xl font-black uppercase leading-tight">Dinas Lingkungan Hidup</h2>
              <p className="text-[10px] md:text-xs italic">Jl. Pinang Baris, Lalang Kec. Medan Sunggal, Kota Medan, Sumatera Utara</p>
            </div>
            <img src={LOGO_DLH_URL} className="h-16 w-16 md:h-20 md:w-20 object-contain" alt="Logo DLH" />
          </div>

          <div className="text-center mb-8">
            <h3 className="text-lg md:text-xl font-bold underline uppercase">RENCANA KERJA WILAYAH 4 DLH MEDAN KOTA</h3>
            <p className="text-sm md:text-lg font-bold">Bulan: {months[parseInt(selectedMonth)-1]} {selectedYear}</p>
          </div>

          <table className="w-full border-collapse border-2 border-black text-[8px] table-fixed">
            <thead>
              <tr className="bg-slate-100">
                <th className="border-2 border-black p-1 w-[25px]">No</th>
                <th className="border-2 border-black p-1 w-[60px]">Hari / Tgl</th>
                <th className="border-2 border-black p-1 w-[50px]">Tim/ Kec</th>
                <th className="border-2 border-black p-1 w-[110px]">Detail Kegiatan</th>
                <th className="border-2 border-black p-1 w-[130px]">Lokasi</th>
                <th className="border-2 border-black p-1 w-[120px]">Alat Operasional</th>
                <th className="border-2 border-black p-1 w-[25px]">Unit</th>
                <th className="border-2 border-black p-1 w-[90px]">Kegunaan</th>
                <th className="border-2 border-black p-1 w-[70px]">Koordinator</th>
                <th className="border-2 border-black p-1 w-[35px]">Pers</th>
                <th className="border-2 border-black p-1 w-[90px]">Dasar Pengerjaan</th>
                {hasRemarks && <th className="border-2 border-black p-1 w-[90px]">Keterangan</th>}
              </tr>
            </thead>
            <tbody>
              {plans.length > 0 ? (
                plans.flatMap((plan, pIdx) => {
                  const isGlobalStyle = plan.category === "Tim Pohon" || plan.category === "Tim Siram";
                  if (isGlobalStyle) {
                    const allTools = plan.items[0].tools;
                    const allItems = plan.items;
                    const maxRows = Math.max(allItems.length, allTools.length);
                    return Array.from({ length: maxRows }).map((_, rowIndex) => {
                      const item = allItems[rowIndex];
                      const tool = allTools[rowIndex];
                      return (
                        <tr key={`${plan.id}-${rowIndex}`}>
                          {rowIndex === 0 && (
                            <>
                              <td className="border-2 border-black p-1 text-center align-top font-bold" rowSpan={maxRows}>{pIdx + 1}</td>
                              <td className="border-2 border-black p-1 text-center align-top" rowSpan={maxRows}>
                                {format(parseISO(plan.date), 'dd/MM/yy')}
                              </td>
                              <td className="border-2 border-black p-1 text-center font-bold align-top" rowSpan={maxRows}>{plan.category}</td>
                            </>
                          )}
                          <td className="border-2 border-black p-1 align-top break-words">{item?.description || ""}</td>
                          <td className="border-2 border-black p-1 align-top break-words">
                            {item ? `${item.location.street}, ${Array.isArray(item.location.village) ? item.location.village.join(", ") : item.location.village}, ${item.location.subDistrict}` : ""}
                          </td>
                          <td className="border-2 border-black p-1 align-top break-words">{tool?.name ? `• ${tool.name}` : ""}</td>
                          <td className="border-2 border-black p-1 text-center align-top">{tool?.unit || ""}</td>
                          <td className="border-2 border-black p-1 align-top break-words">{tool?.usage || ""}</td>
                          {rowIndex === 0 && (
                            <>
                              <td className="border-2 border-black p-1 text-center align-top" rowSpan={maxRows}>{plan.items[0].coordinator}</td>
                              <td className="border-2 border-black p-1 text-center align-top" rowSpan={maxRows}>{plan.items[0].personnel.members}</td>
                              <td className="border-2 border-black p-1 align-top break-words" rowSpan={maxRows}>{plan.items[0].basis}</td>
                              {hasRemarks && <td className="border-2 border-black p-1 italic align-top break-words" rowSpan={maxRows}>{plan.items[0].remarks || "-"}</td>}
                            </>
                          )}
                        </tr>
                      );
                    });
                  } else {
                    return plan.items.flatMap((item, iIdx) => {
                      const toolsToRender = item.tools.length > 0 ? item.tools : [{ name: "", unit: "", usage: "" }];
                      return toolsToRender.map((tool, tIdx) => (
                        <tr key={`${plan.id}-${iIdx}-${tIdx}`}>
                          {iIdx === 0 && tIdx === 0 && (
                            <>
                              <td className="border-2 border-black p-1 text-center align-top font-bold" rowSpan={plan.items.reduce((acc, it) => acc + Math.max(it.tools.length, 1), 0)}>{pIdx + 1}</td>
                              <td className="border-2 border-black p-1 text-center align-top" rowSpan={plan.items.reduce((acc, it) => acc + Math.max(it.tools.length, 1), 0)}>
                                {format(parseISO(plan.date), 'dd/MM/yy')}
                              </td>
                              <td className="border-2 border-black p-1 text-center font-bold align-top" rowSpan={plan.items.reduce((acc, it) => acc + Math.max(it.tools.length, 1), 0)}>{plan.category}</td>
                            </>
                          )}
                          {tIdx === 0 && (
                            <>
                              <td className="border-2 border-black p-1 align-top break-words" rowSpan={toolsToRender.length}>{item.description}</td>
                              <td className="border-2 border-black p-1 align-top break-words" rowSpan={toolsToRender.length}>
                                {item.location.street}, {Array.isArray(item.location.village) ? item.location.village.join(", ") : item.location.village}, {item.location.subDistrict}
                              </td>
                            </>
                          )}
                          <td className="border-2 border-black p-1 align-top break-words">{tool.name ? `• ${tool.name}` : "-"}</td>
                          <td className="border-2 border-black p-1 text-center align-top">{tool.unit || "-"}</td>
                          <td className="border-2 border-black p-1 align-top break-words">{tool.usage || "-"}</td>
                          {tIdx === 0 && (
                            <>
                              <td className="border-2 border-black p-1 text-center align-top" rowSpan={toolsToRender.length}>{item.coordinator}</td>
                              <td className="border-2 border-black p-1 text-center align-top" rowSpan={toolsToRender.length}>{item.personnel.members}</td>
                              <td className="border-2 border-black p-1 align-top break-words" rowSpan={toolsToRender.length}>{item.basis}</td>
                              {hasRemarks && <td className="border-2 border-black p-1 italic align-top break-words" rowSpan={toolsToRender.length}>{item.remarks || "-"}</td>}
                            </>
                          )}
                        </tr>
                      ));
                    });
                  }
                })
              ) : (
                <tr><td colSpan={hasRemarks ? 12 : 11} className="border-2 border-black p-8 text-center italic text-slate-400">Tidak ada rencana kerja untuk periode ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media print { body { background: white !important; } .no-print { display: none !important; } .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: none !important; } @page { size: landscape; margin: 1cm; } }`}} />
    </div>
  );
};

export default WorkPlanMonthlyRecap;