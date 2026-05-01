"use client";

export type FuelType = "Pertamax" | "Dexlite" | "Oli";

export interface FuelUsageItem {
  vehicle_operator: string;
  fuel_type: FuelType;
  amount: number;
  item_remarks?: string;
  is_location_same?: boolean; // Flag untuk menandai lokasi sama dengan item sebelumnya
  location: {
    street: string;
    subDistrict?: string;
    village?: string;
  };
}

export interface FuelReport {
  id: string;
  date: string;
  region: string;
  team: string;
  items: FuelUsageItem[];
  remarks: string;
  created_at?: string;
  deleted_at?: string | null;
}