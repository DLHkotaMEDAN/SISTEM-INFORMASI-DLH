"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Edit, CheckCircle2, HardHat, FileText, Calendar, Users, FileSpreadsheet, FileDown } from 'lucide-react';
import { Report } from '@/types/report';
import { showSuccess, showError } from '@/utils/toast';
import { getUnitByCategory } from '@/utils/report-helpers';
import { reportService } from '@/services/reportService';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (id) loadReport(id);
  }, [id]);

  const loadReport = async (reportId: string) => {
    try {
      setLoading(true);
      const data = await reportService.getReportById(reportId);
      setReport(data);
    } catch (error) {
      showError("Laporan tidak ditemukan di database");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini secara permanen?")) {
      try {
        if (id) {
          await reportService.deleteReport(id);
          showSuccess("Laporan berhasil dihapus");
          navigate('/');
        }
      } catch (error) {
        showError("Gagal menghapus laporan");
      }
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element || !report) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan_${report.category}_${report.date}.pdf`);
      showSuccess("PDF berhasil diunduh!");
    } catch (error) {
      showError("Gagal membuat PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    if (!report) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Laporan', {
      pageSetup: { paperSize: 8 as any, orientation: 'landscape', scale: 65, horizontalCentered: true }
    });

    worksheet.columns = [
      { key: 'no', width: 4 }, { key: 'tgl', width: 12 }, { key: 'uraian', width: 18 },
      { key: 'lokasi', width: 28 }, { key: 'foto0', width: 28 }, { key: 'foto50', width: 28 },
      { key: 'foto100', width: 28 }, { key: 'vol', width: 10 }, { key: 'alat_jns', width: 14 },
      { key: 'alat_jlh', width: 10 }, { key: 'berat_jns', width: 12 }, { key: 'berat_jlh', width: 6 },
      { key: 'bbm_p', width: 13 }, { key: 'bbm_d', width: 10 }, { key: 'bbm_s', width: 13 },
      { key: 'pers_k', width: 17 }, { key: 'pers_p', width: 8 }, { key: 'ket', width: 25 },
    ];

    const titles = ["PEMERINTAH KOTA MEDAN", "DINAS LINGKUNGAN HIDUP", "Jl. S. Parman No. 16 Medan", "LAPORAN KEGIATAN HARIAN", report.category.toUpperCase()];
    titles.forEach((text, i) => {
      worksheet.mergeCells(i + 1, 1, i + 1, 18);
      const cell = worksheet.getRow(i + 1).getCell(1);
      cell.value = text;
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    const headerRow6 = worksheet.getRow(6);
    const headerRow7 = worksheet.getRow(7);
    worksheet.mergeCells('A6:A7'); worksheet.mergeCells('B6:B7'); worksheet.mergeCells('C6:C7');
    worksheet.mergeCells('D6:D7'); worksheet.mergeCells('E6:G6'); worksheet.mergeCells('H6:H7');
    worksheet.mergeCells('I6:J6'); worksheet.mergeCells('K6:L6'); worksheet.mergeCells('M6:O6');
    worksheet.mergeCells('P6:Q6'); worksheet.mergeCells('R6:R7');

    headerRow6.getCell(1).value = 'NO'; headerRow6.getCell(2).value = 'HARI/TANGGAL';
    headerRow6.getCell(3).value = 'URAIAN'; headerRow6.getCell(4).value = 'LOKASI';
    headerRow6.getCell(5).value = 'FOTO DOKUMENTASI'; headerRow6.getCell(8).value = 'VOLUME';
    headerRow6.getCell(9).value = 'PERALATAN'; headerRow6.getCell(11).value = 'OPERASIONAL ALAT BERAT';
    headerRow6.getCell(13).value = 'BAHAN BAKAR'; headerRow6.getCell(16).value = 'JUMLAH PERSONIL';
    headerRow6.getCell(18).value = 'KETERANGAN';

    [6, 7].forEach(r => worksheet.getRow(r).eachCell(c => {
      c.font = { bold: true }; c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    }));

    const dataRow = worksheet.getRow(8);
    dataRow.height = 130;
    dataRow.getCell(1).value = 1;
    dataRow.getCell(2).value = report.date;
    dataRow.getCell(3).value = report.tasks?.map(t => t.description).join('\n') || report.description;
    dataRow.getCell(4).value = report.tasks?.map(t => t.location.street).join('\n') || report.location.street;
    dataRow.getCell(8).value = `${report.volume} ${getUnitByCategory(report.category)}`;
    dataRow.getCell(16).value = report.personnel.coordinator;
    dataRow.getCell(17).value = report.personnel.members;

    dataRow.eachCell(c => {
      c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Rekap_${report.category}_${report.date}.xlsx`);
    showSuccess("Excel berhasil diunduh!");
  };

  if (loading) return <div className="p-20 text-center">Memuat data dari cloud...</div>;
  if (!report) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
          <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Button>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportToPDF} disabled={isExporting} className="bg-red-600 hover:bg-red-700 text-white"><FileDown className="mr-2 h-4 w-4" /> PDF</Button>
            <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white"><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
            <Button variant="outline" onClick={() => navigate(`/edit/${report.id}`)} className="bg-blue-50 text-blue-700 border-blue-200"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            <Button variant="destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" /> Hapus</Button>
          </div>
        </div>

        <div id="report-content" className="bg-white border shadow-lg overflow-hidden print:border-none print:shadow-none">
          <div className="p-8 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-100 border-2 border-black flex items-center justify-center font-bold text-[10px] text-center">LOGO<br/>PEMKO</div>
              <div>
                <h1 className="text-xl font-bold">PEMERINTAH KOTA MEDAN</h1>
                <h2 className="text-2xl font-black">DINAS LINGKUNGAN HIDUP</h2>
                <p className="text-xs">Jl. S. Parman No. 16 Medan, Sumatera Utara</p>
              </div>
            </div>
            <div className="text-right border-l-2 border-black pl-8">
              <h3 className="text-lg font-bold uppercase underline">LAPORAN KEGIATAN HARIAN</h3>
              <p className="text-md font-bold">{report.category.toUpperCase()}</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-3 gap-8">
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Tanggal</p><p className="font-bold">{report.date}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Koordinator</p><p className="font-bold">{report.personnel.coordinator}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Personil</p><p className="font-bold">{report.personnel.members} Orang</p></div>
            </div>

            <table className="w-full border-collapse border-2 border-black">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-2 border-black p-2 w-12">NO</th>
                  <th className="border-2 border-black p-2 text-left">URAIAN</th>
                  <th className="border-2 border-black p-2 text-left">LOKASI</th>
                </tr>
              </thead>
              <tbody>
                {report.tasks?.map((task, i) => (
                  <tr key={i}>
                    <td className="border-2 border-black p-2 text-center">{i + 1}</td>
                    <td className="border-2 border-black p-2">{task.description}</td>
                    <td className="border-2 border-black p-2">{task.location.street}, {task.location.village}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-3 gap-4">
              {['0%', '50%', '100%'].map((label, i) => {
                const img = i === 0 ? report.photos.zero : i === 1 ? report.photos.fifty : report.photos.hundred;
                return (
                  <div key={i} className="space-y-2">
                    <div className="aspect-video border-2 border-black bg-slate-50 flex items-center justify-center overflow-hidden">
                      {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="text-slate-300 italic">No Photo</span>}
                    </div>
                    <p className="text-center font-bold text-xs border-2 border-black py-1 bg-slate-50">{label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="border-2 border-black p-4">
                <h4 className="font-bold border-b-2 border-black mb-2">VOLUME & BBM</h4>
                <p>Volume: <strong>{report.volume} {getUnitByCategory(report.category)}</strong></p>
                <p>Pertamax: <strong>{report.fuel.pertamax}</strong></p>
                <p>Dexlite: <strong>{report.fuel.dexlite} L</strong></p>
                <p>Solar: <strong>{report.fuel.solar} L</strong></p>
              </div>
              <div className="border-2 border-black p-4">
                <h4 className="font-bold border-b-2 border-black mb-2">PERALATAN</h4>
                {report.equipment.map((e, i) => <p key={i}>{e.type}: <strong>{e.quantity}</strong></p>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;