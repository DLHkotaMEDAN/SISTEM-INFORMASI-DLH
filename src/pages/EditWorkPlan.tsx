"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkPlanForm from '@/components/WorkPlanForm';
import { workPlanService } from '@/services/workPlanService';
import { WorkPlan } from '@/types/work-plan';
import { showError } from '@/utils/toast';

const EditWorkPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<WorkPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (planId: string) => {
    try {
      const result = await workPlanService.getWorkPlanById(planId);
      setData(result);
    } catch (error) {
      showError("Data tidak ditemukan");
      navigate('/work-plans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Memuat data...</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <WorkPlanForm initialData={data} isEditing={true} />
      </div>
    </div>
  );
};

export default EditWorkPlan;