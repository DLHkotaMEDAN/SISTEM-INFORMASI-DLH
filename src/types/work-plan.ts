"use client";

export interface WorkPlanEquipment {
  name: string;
  quantity: number;
  usage: string; // Menambahkan kegunaan alat
}

export interface WorkPlan {
  id: string;
  date: string;
  category: string;
  description: string;
  street: string;
  sub_district: string;
  villages: string[];
  equipment: WorkPlanEquipment[];
  coordinator: string;
  personnel: number;
  basis: string;
  remarks: string;
  created_at?: string;
  user_id?: string;
}