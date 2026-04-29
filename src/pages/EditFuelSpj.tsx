"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FuelSpjForm from '@/components/FuelSpjForm';
import { FuelSpj } from '@/types/fuelSpj';
import { fuelSpjService } from '@/services/fuelSpjService';
import { showError } from '@/utils/toast';

const EditFuelSpj = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<FuelSpj | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (spjId: string) => {
    try {
      setLoading(true);
      const result = await fuelSpjService.getById(spjId);
      setData(result);
    } catch (error) {
      showError("Data tidak ditemukan");
      navigate('/fuel-spj');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Memuat data...</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <FuelSpjForm initialData={data} isEditing={true} />
    </div>
  );
};

export default EditFuelSpj;