"use client";

export interface WorkPlanLocation {
  description: string; // Menambahkan uraian kegiatan per lokasi
  street: string;
  sub_district: string;
  villages: string[];
}

export interface WorkPlanEquipment {
  name: string;
  quantity: number;
  purpose?: string;
  vehicle?: string;
}

export interface WorkPlan {
  id: string;
  date: string;
  category: string;
  description: string;
  locations: WorkPlanLocation[];
  equipment: WorkPlanEquipment[];
  coordinator: string;
  personnel: number;
  basis: string;
  remarks: string;
  created_at?: string;
  user_id?: string;
  street?: string;
  sub_district?: string;
  villages?: string[];
}