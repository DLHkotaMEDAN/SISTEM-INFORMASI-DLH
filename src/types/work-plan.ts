"use client";

export interface WorkPlanLocation {
  street: string;
  sub_district: string;
  villages: string[];
}

export interface WorkPlanEquipment {
  name: string;
  quantity: number;
}

export interface WorkPlan {
  id: string;
  date: string;
  category: string;
  description: string;
  locations: WorkPlanLocation[]; // Mendukung banyak lokasi
  equipment: WorkPlanEquipment[];
  coordinator: string;
  personnel: number;
  basis: string;
  remarks: string;
  created_at?: string;
  user_id?: string;
  // Kolom lama tetap ada untuk kompatibilitas sementara
  street?: string;
  sub_district?: string;
  villages?: string[];
}