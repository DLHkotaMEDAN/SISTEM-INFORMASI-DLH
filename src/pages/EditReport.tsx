"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReportForm from '@/components/ReportForm';
import { Report } from '@/types/report';
import { showError } from '@/utils/toast';

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const found = reports.find((r: Report) => r.id === id);
    if (found) {
      setReport(found);
    } else {
      showError("Laporan tidak ditemukan");
      navigate('/');
    }
  }, [id, navigate]);

  if (!report) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <ReportForm initialData={report} isEditing={true} />
      </div>
    </div>
  );
};

export default EditReport;