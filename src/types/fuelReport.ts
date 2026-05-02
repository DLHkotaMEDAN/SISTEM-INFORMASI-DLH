"use client";

export type FuelType = "Pertamax" | "Dexlite" | "Oli";

export interface FuelUsageItem {
  vehicle_operator: string;
  fuel_type: FuelType;
  amount: number;
  item_remarks?: string;
  is_location_same?: boolean;
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
  pimpinan_note?: string; // Field baru untuk penilaian pimpinan
  created_at?: string;
  deleted_at?: string | null;
}