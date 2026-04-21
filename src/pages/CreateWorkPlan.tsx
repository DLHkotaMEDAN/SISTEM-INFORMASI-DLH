"use client";

import React from 'react';
import WorkPlanForm from '@/components/WorkPlanForm';

const CreateWorkPlan = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <WorkPlanForm />
      </div>
    </div>
  );
};

export default CreateWorkPlan;